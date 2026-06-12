// POST /api/sorteo/finalizar — el participante marca que TERMINÓ su registro
// (no hará más acciones). Autentica con el JWT emitido en /registrar.
//
// Marca participantes.finalizado = true (+ finalizado_at) y lo refleja en el
// Sheet (columna "Finalizado"). No otorga ni quita boletos.

import { loadEnv } from '../../../scripts/loadEnv.js';
loadEnv();

import { supabaseAdmin } from '../../../services/supabaseClient.js';
import { verifyJwt } from '../../../services/jwt.js';
import { updateRegistroByEmail } from '../../../services/googleSheets.js';
import { sorteoCerrado } from '../../../data/sorteo';

export const prerender = false;

const JWT_SECRET = process.env.JWT_SECRET;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function bearerToken(request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function POST({ request }) {
  try {
    if (!supabaseAdmin) {
      console.error('[sorteo/finalizar] supabaseAdmin no disponible.');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }
    if (!JWT_SECRET) {
      console.error('[sorteo/finalizar] JWT_SECRET no configurado.');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }
    if (sorteoCerrado()) {
      return json({ success: false, error: 'El sorteo ya cerró.', code: 'SORTEO_CERRADO' }, 403);
    }

    // --- Autenticación ---
    let token = bearerToken(request);
    if (!token) {
      const body = await request.json().catch(() => ({}));
      token = body?.token || null;
    }
    const claims = verifyJwt(token, JWT_SECRET);
    if (!claims?.sub) {
      return json({ success: false, error: 'No autorizado' }, 401);
    }
    const participantId = claims.sub;

    // --- Marcar finalizado ---
    const { error } = await supabaseAdmin
      .from('participantes')
      .update({ finalizado: true, finalizado_at: new Date().toISOString() })
      .eq('id', participantId);
    if (error) {
      console.error('[sorteo/finalizar] error actualizando:', error.message);
      return json({ success: false, error: 'Error interno' }, 500);
    }

    // --- Reflejar en Google Sheets (no bloqueante) ---
    try {
      const { data: p } = await supabaseAdmin
        .from('participantes')
        .select('email_norm')
        .eq('id', participantId)
        .maybeSingle();
      if (p?.email_norm) await updateRegistroByEmail(p.email_norm, { finalizado: 'Sí' });
    } catch (err) {
      console.warn('[sorteo/finalizar] syncSheet falló (no bloquea):', err?.message);
    }

    return json({ success: true, finalizado: true });
  } catch (error) {
    console.error('[sorteo/finalizar] error inesperado:', error);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
