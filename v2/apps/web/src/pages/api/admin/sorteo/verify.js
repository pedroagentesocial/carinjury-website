// POST /api/admin/sorteo/verify → revisión manual (requiere sesión admin).
//   body { op: 'action', participantId, action_type, verified } → marca acción verificada
//   body { op: 'confirm', participantId }                       → confirma ganador

import { loadEnv } from '../../../../scripts/loadEnv.js';
loadEnv();

import { requireAdmin } from '../../../../services/adminAuth.js';
import { supabaseAdmin } from '../../../../services/supabaseClient.js';
import { setActionVerified, confirmWinner } from '../../../../services/sorteoAdmin.js';

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

  try {
    if (body.op === 'confirm') {
      if (!body.participantId) return json({ success: false, error: 'Falta participantId.' }, 422);
      const r = await confirmWinner({ participantId: body.participantId });
      return json({ success: r.ok, ...r }, r.ok ? 200 : 422);
    }

    // Default: marcar acción verificada.
    if (!body.participantId || !body.action_type) {
      return json({ success: false, error: 'Faltan participantId / action_type.' }, 422);
    }
    const r = await setActionVerified({
      participantId: body.participantId,
      actionType: body.action_type,
      verified: !!body.verified,
    });
    return json({ success: r.ok, ...r }, r.ok ? 200 : 422);
  } catch (err) {
    console.error('[admin/sorteo/verify] error:', err.message);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
