// Cron endpoint — resumen diario del sorteo por correo.
// Disparado por Vercel Cron Jobs (vercel.json). Schedule sugerido: 14:00 UTC
// (≈ 8:00 AM en Utah/MDT) → un correo cada mañana con el avance del día anterior.
//
// Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`. Si CRON_SECRET no está
// configurada, se permite el request (dev / disparo manual).
//
// Requiere ADMIN_NOTIFY_EMAIL para saber a quién mandar el resumen (opt-in).

import { loadEnv } from '../../../scripts/loadEnv.js';
loadEnv();

import { supabaseAdmin } from '../../../services/supabaseClient.js';
import { sendEmail } from '../../../services/resendEmail.js';

export const prerender = false;

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function contar(filtro) {
  let q = supabaseAdmin.from('participantes').select('*', { count: 'exact', head: true });
  if (filtro) q = filtro(q);
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function GET({ request }) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }
  if (!supabaseAdmin) {
    return json({ success: false, error: 'Supabase no disponible' }, 503);
  }

  try {
    const desde24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [total, ultimas24, finalizados] = await Promise.all([
      contar(null),
      contar((q) => q.gte('created_at', desde24h)),
      contar((q) => q.eq('finalizado', true)),
    ]);

    if (!ADMIN_NOTIFY_EMAIL) {
      return json({
        success: true,
        skipped: 'ADMIN_NOTIFY_EMAIL no configurada (no se envió correo).',
        total,
        ultimas24,
        finalizados,
      });
    }

    const to = ADMIN_NOTIFY_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);
    const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.5">
      <h2 style="font-size:18px;margin:0 0 14px">📊 Sorteo — resumen diario</h2>
      <table style="border-collapse:collapse;font-size:15px">
        <tr><td style="padding:6px 14px 6px 0">Nuevos (últimas 24 h)</td><td style="font-weight:700">${ultimas24}</td></tr>
        <tr><td style="padding:6px 14px 6px 0">Total acumulado</td><td style="font-weight:700">${total}</td></tr>
        <tr><td style="padding:6px 14px 6px 0">Finalizaron su registro</td><td style="font-weight:700">${finalizados}</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#666;font-size:13px">Panel: <a href="https://carinjuryclinics.com/admin/sorteo">carinjuryclinics.com/admin/sorteo</a></p>
    </div>`.trim();
    const text =
      `Sorteo — resumen diario\n` +
      `Nuevos (últimas 24 h): ${ultimas24}\n` +
      `Total acumulado: ${total}\n` +
      `Finalizaron su registro: ${finalizados}\n`;

    await sendEmail({ to, subject: `📊 Sorteo — ${ultimas24} nuevos (total ${total})`, html, text });

    return json({ success: true, total, ultimas24, finalizados, triggeredAt: new Date().toISOString() });
  } catch (err) {
    console.error('[cron/sorteo-resumen] error:', err.message);
    return json({ success: false, error: err.message }, 500);
  }
}
