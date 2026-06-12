// POST /api/sorteo/accion — reclama una acción bonus del sorteo (server-only).
//
// Autentica con el JWT emitido en /api/sorteo/registrar (claim `sub` = participant_id).
// Recibe action_type ('instagram'|'facebook') y un handle opcional.
//
// Sistema de honor: los follows NO se verifican por API, así que la acción se
// inserta con verified=false y ticket_value=1. El UNIQUE(participant_id, action_type)
// evita duplicar; si ya la tenía, se responde alreadyClaimed sin error.
//
// El bono 'referido' NO se reclama aquí — lo acredita el endpoint de registro.
//
// Devuelve el total de tickets: 1 base + suma de ticket_value de sus acciones, tope 4.

import { loadEnv } from '../../../scripts/loadEnv.js';
loadEnv();

import crypto from 'node:crypto';
import { supabaseAdmin } from '../../../services/supabaseClient.js';
import { verifyJwt } from '../../../services/jwt.js';
import { updateRegistroByEmail } from '../../../services/googleSheets.js';
import { SORTEO_MAX_BOLETOS, SORTEO_TICKET_VALUES, sorteoCerrado } from '../../../data/sorteo';

export const prerender = false;

const JWT_SECRET = process.env.JWT_SECRET;

const MAX_TICKETS = SORTEO_MAX_BOLETOS;

// Rate limit básico en memoria (fixed window) por ip_hash. En Fluid Compute las
// instancias se reutilizan, así que esto es best-effort por instancia — suficiente
// como "básico". Para límites estrictos multi-instancia usar Upstash/Redis.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rlBucket = new Map(); // ip_hash -> { count, resetAt }

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function hashIp(ip) {
  if (!ip) return null;
  // Misma derivación que /api/sorteo/registrar.
  return crypto.createHash('sha256').update(`${ip}:${JWT_SECRET || ''}`).digest('hex');
}

function rateLimit(key) {
  if (!key) return { allowed: true };
  const now = Date.now();

  let entry = rlBucket.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rlBucket.set(key, entry);
  }
  entry.count += 1;

  // Limpieza oportunista para que el Map no crezca sin límite.
  if (rlBucket.size > 5000) {
    for (const [k, v] of rlBucket) {
      if (now >= v.resetAt) rlBucket.delete(k);
    }
  }

  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function bearerToken(request) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function parseBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      const j = await request.json();
      return j && typeof j === 'object' ? j : {};
    } catch {
      return {};
    }
  }
  try {
    const fd = await request.formData();
    const obj = {};
    for (const [k, val] of fd.entries()) {
      if (typeof val === 'string') obj[k] = val;
    }
    return obj;
  } catch {
    return {};
  }
}

// Limpia un handle: sin @ inicial, sin espacios, sin URL completa.
function cleanHandle(raw) {
  if (!raw) return null;
  let h = String(raw).trim();
  if (!h) return null;
  // Si pegaron una URL de perfil, quedarnos con el último segmento.
  const urlMatch = h.match(/^https?:\/\/[^/]+\/([^/?#]+)/i);
  if (urlMatch) h = urlMatch[1];
  h = h.replace(/^@+/, '').trim();
  return h || null;
}

const ACTION_COLUMN = {
  instagram: 'ig_handle',
  facebook: 'fb_handle',
};

// Refleja el estado del participante en Google Sheets. Best-effort: el servicio
// nunca lanza, pero igual lo envolvemos para que nada bloquee la respuesta.
async function syncSheet({ participantId, rows, tickets, actionType, handle }) {
  try {
    // Email normalizado: misma clave que usó /registrar para la fila.
    const { data: p } = await supabaseAdmin
      .from('participantes')
      .select('email_norm')
      .eq('id', participantId)
      .maybeSingle();
    if (!p?.email_norm) return;

    // Personas que este participante refirió (cuenta real, no el bono de 1 ticket).
    const { count } = await supabaseAdmin
      .from('participantes')
      .select('id', { count: 'exact', head: true })
      .eq('referido_por', participantId);

    const tipos = new Set((rows || []).map((r) => r.action_type));
    const fields = {
      sigue_ig: tipos.has('instagram') ? 'Sí' : 'No',
      sigue_fb: tipos.has('facebook') ? 'Sí' : 'No',
      resena_google: tipos.has('google') ? 'Sí' : 'No',
      num_referidos: count ?? 0,
      total_tickets: tickets,
    };
    if (handle && actionType === 'instagram') fields.ig_handle = handle;
    if (handle && actionType === 'facebook') fields.fb_handle = handle;

    await updateRegistroByEmail(p.email_norm, fields);
  } catch (err) {
    console.warn('[sorteo/accion] syncSheet falló (no bloquea):', err?.message);
  }
}

export async function POST({ request, clientAddress }) {
  try {
    if (!supabaseAdmin) {
      console.error('[sorteo/accion] supabaseAdmin no disponible.');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }
    if (!JWT_SECRET) {
      console.error('[sorteo/accion] JWT_SECRET no configurado.');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }

    // --- El sorteo ya cerró (rifa del lunes): no se aceptan más boletos ---
    if (sorteoCerrado()) {
      return json({ success: false, error: 'El sorteo ya cerró.', code: 'SORTEO_CERRADO' }, 403);
    }

    // --- Autenticación ---
    const body = await parseBody(request);
    const token = bearerToken(request) || body.token;
    const claims = verifyJwt(token, JWT_SECRET);
    if (!claims?.sub) {
      return json({ success: false, error: 'No autorizado' }, 401);
    }
    const participantId = claims.sub;

    // --- Rate limit por ip_hash ---
    const ipHash = hashIp(clientAddress || request.headers.get('x-forwarded-for'));
    const rl = rateLimit(ipHash);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: 'Demasiadas solicitudes, intenta en un momento.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) },
        },
      );
    }

    // --- Validar action_type (bonus reclamables aquí; 'referido' lo da el registro) ---
    const actionType = String(body.action_type || '').trim().toLowerCase();
    if (actionType !== 'instagram' && actionType !== 'facebook' && actionType !== 'google') {
      return json({ success: false, error: "action_type debe ser 'instagram', 'facebook' o 'google'." }, 422);
    }

    const handle = cleanHandle(body.handle);
    const ticketValue = SORTEO_TICKET_VALUES[actionType] ?? 1;

    // --- Insertar acción (verified=false, sistema de honor). UNIQUE evita duplicar. ---
    let alreadyClaimed = false;
    const { error: insErr } = await supabaseAdmin.from('acciones').insert({
      participant_id: participantId,
      action_type: actionType,
      ticket_value: ticketValue,
      verified: false,
    });

    if (insErr) {
      if (insErr.code === '23505') {
        alreadyClaimed = true; // ya tenía esta acción: no duplicamos.
      } else if (insErr.code === '23503') {
        // FK violation: el participant_id del token no existe.
        return json({ success: false, error: 'No autorizado' }, 401);
      } else {
        console.error('[sorteo/accion] error insertando acción:', insErr.message);
        return json({ success: false, error: 'Error interno' }, 500);
      }
    }

    // --- Guardar el handle en ig_handle/fb_handle (aunque ya estuviera reclamada) ---
    //     'google' no tiene columna de handle, así que se omite.
    if (handle && ACTION_COLUMN[actionType]) {
      const { error: updErr } = await supabaseAdmin
        .from('participantes')
        .update({ [ACTION_COLUMN[actionType]]: handle })
        .eq('id', participantId);
      if (updErr) {
        // No bloquea el resultado de la acción.
        console.warn('[sorteo/accion] no se pudo guardar el handle:', updErr.message);
      }
    }

    // --- Total de tickets: 1 base + suma de ticket_value, tope 4 ---
    const { data: rows, error: sumErr } = await supabaseAdmin
      .from('acciones')
      .select('action_type, ticket_value')
      .eq('participant_id', participantId);
    if (sumErr) {
      console.error('[sorteo/accion] error sumando tickets:', sumErr.message);
      return json({ success: false, error: 'Error interno' }, 500);
    }
    const sum = (rows || []).reduce((acc, r) => acc + (r.ticket_value || 0), 0);
    const tickets = Math.min(1 + sum, MAX_TICKETS);

    // --- Replicar en Google Sheets (no bloqueante) ---
    await syncSheet({ participantId, rows: rows || [], tickets, actionType, handle });

    return json({
      success: true,
      action_type: actionType,
      alreadyClaimed,
      tickets,
    });
  } catch (error) {
    console.error('[sorteo/accion] error inesperado:', error);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
