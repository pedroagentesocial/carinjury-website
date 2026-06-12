// POST /api/admin/sorteo/draw → sortea ganadores (requiere sesión admin).
//   body { mode: 'draw', force? }            → sorteo inicial de 3 ganadores
//   body { mode: 'redraw', participantId, motivo? } → descalifica + saca suplente

import { loadEnv } from '../../../../scripts/loadEnv.js';
loadEnv();

import { requireAdmin } from '../../../../services/adminAuth.js';
import { supabaseAdmin } from '../../../../services/supabaseClient.js';
import { drawWinners, redraw } from '../../../../services/sorteoAdmin.js';

export const prerender = false;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST({ request, cookies }) {
  if (!requireAdmin(cookies)) return json({ success: false, error: 'No autorizado' }, 401);
  if (!supabaseAdmin) return json({ success: false, error: 'Servicio no disponible' }, 503);

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* ignore */
  }

  // Timestamp inyectado aquí (no en el servicio) para mantenerlo testeable.
  const now = new Date();

  try {
    if (body.mode === 'redraw') {
      if (!body.participantId) return json({ success: false, error: 'Falta participantId.' }, 422);
      const r = await redraw({ participantId: body.participantId, motivo: body.motivo, now });
      return json({ success: r.ok, ...r }, r.ok ? 200 : 422);
    }

    // Default: sorteo inicial.
    const r = await drawWinners({ force: !!body.force, now });
    if (!r.ok) {
      return json({ success: false, ...r }, r.needsConfirm ? 409 : 422);
    }
    return json({ success: true });
  } catch (err) {
    console.error('[admin/sorteo/draw] error:', err.message);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
