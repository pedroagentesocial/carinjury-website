// Lógica del panel de administración del sorteo (server-only, service_role).
// Carga de datos, sorteo ponderado por total_tickets, redraw de suplentes,
// verificación manual de acciones y confirmación de ganadores.

import { supabaseAdmin } from './supabaseClient.js';
import { SORTEO_MAX_BOLETOS } from '../data/sorteo';

const MAX_TICKETS = SORTEO_MAX_BOLETOS;
const CLAIM_DAYS = 30; // El ganador tiene 30 días para reclamar (Utah).
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

function totalTickets(actions) {
  const sum = (actions || []).reduce((acc, a) => acc + (a.ticket_value || 0), 0);
  return Math.min(1 + sum, MAX_TICKETS);
}

/**
 * Muestreo aleatorio SIN reemplazo, ponderado por peso. Devuelve hasta k ids
 * distintos. Pesos <= 0 se ignoran. Pura para poder testearla.
 */
export function weightedSampleDistinct(items, weights, k, rng = Math.random) {
  const pool = items.map((it, i) => ({ it, w: Math.max(weights[i] || 0, 0) }));
  const chosen = [];
  for (let n = 0; n < k && pool.length > 0; n++) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    if (total <= 0) break;
    let r = rng() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].w;
      if (r <= 0) break;
    }
    if (idx >= pool.length) idx = pool.length - 1;
    chosen.push(pool[idx].it);
    pool.splice(idx, 1);
  }
  return chosen;
}

// Carga todos los participantes con sus acciones y total_tickets calculado.
async function loadParticipants() {
  const [{ data: participantes, error: pErr }, { data: acciones, error: aErr }] = await Promise.all([
    supabaseAdmin.from('participantes').select('id, nombre, email, ig_handle, fb_handle, referido_por'),
    supabaseAdmin.from('acciones').select('participant_id, action_type, verified, ticket_value'),
  ]);
  if (pErr) throw pErr;
  if (aErr) throw aErr;

  const byParticipant = new Map();
  for (const a of acciones || []) {
    if (!byParticipant.has(a.participant_id)) byParticipant.set(a.participant_id, []);
    byParticipant.get(a.participant_id).push(a);
  }

  const list = (participantes || []).map((p) => {
    const actions = byParticipant.get(p.id) || [];
    return {
      id: p.id,
      nombre: p.nombre,
      email: p.email,
      ig_handle: p.ig_handle,
      fb_handle: p.fb_handle,
      referido_por: p.referido_por,
      actions: actions.map((a) => ({
        action_type: a.action_type,
        verified: !!a.verified,
        ticket_value: a.ticket_value,
      })),
      total_tickets: totalTickets(actions),
    };
  });

  return list;
}

/**
 * Datos completos para el panel: tabla de participantes + ganadores vigentes.
 */
export async function getAdminData() {
  const participants = await loadParticipants();
  const byId = new Map(participants.map((p) => [p.id, p]));

  const { data: ganadores, error: gErr } = await supabaseAdmin
    .from('sorteo_ganadores')
    .select('id, participant_id, posicion, estado, drawn_at, claim_deadline, notas')
    .order('posicion', { ascending: true })
    .order('drawn_at', { ascending: true });
  if (gErr) throw gErr;

  const winners = (ganadores || [])
    .filter((g) => g.estado !== 'descalificado')
    .map((g) => {
      const p = byId.get(g.participant_id) || {};
      return {
        ...g,
        nombre: p.nombre || '(desconocido)',
        email: p.email || '',
        ig_handle: p.ig_handle || '',
        fb_handle: p.fb_handle || '',
        total_tickets: p.total_tickets || 0,
        actions: p.actions || [],
      };
    });

  const disqualified = (ganadores || [])
    .filter((g) => g.estado === 'descalificado')
    .map((g) => {
      const p = byId.get(g.participant_id) || {};
      return { participant_id: g.participant_id, posicion: g.posicion, nombre: p.nombre || '(desconocido)' };
    });

  // Ordenar tabla por tickets desc, luego nombre.
  const tabla = [...participants].sort(
    (a, b) => b.total_tickets - a.total_tickets || (a.nombre || '').localeCompare(b.nombre || ''),
  );

  return {
    participants: tabla,
    winners,
    disqualified,
    totalParticipants: participants.length,
  };
}

function deadlineFrom(date) {
  return new Date(date.getTime() + CLAIM_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Sorteo inicial: elige 3 ganadores distintos, ponderado por total_tickets,
 * entre TODOS los participantes. Reemplaza cualquier sorteo previo.
 * @param {object} opts
 * @param {boolean} [opts.force] permitir reemplazar aunque haya confirmados.
 * @param {Date} opts.now timestamp (inyectado por el endpoint).
 */
export async function drawWinners({ force = false, now }) {
  // Proteger ganadores confirmados de un re-sorteo accidental.
  const { data: confirmados } = await supabaseAdmin
    .from('sorteo_ganadores')
    .select('id')
    .eq('estado', 'confirmado')
    .limit(1);
  if (confirmados && confirmados.length > 0 && !force) {
    return { ok: false, needsConfirm: true, error: 'Ya hay ganadores confirmados. Confirma para reemplazar el sorteo.' };
  }

  const participants = await loadParticipants();
  if (participants.length < 3) {
    return { ok: false, error: `Se necesitan al menos 3 participantes (hay ${participants.length}).` };
  }

  const ids = participants.map((p) => p.id);
  const weights = participants.map((p) => p.total_tickets);
  const winnerIds = weightedSampleDistinct(ids, weights, 3);

  // Limpiar el sorteo anterior (todas las filas).
  const { error: delErr } = await supabaseAdmin.from('sorteo_ganadores').delete().neq('participant_id', ZERO_UUID);
  if (delErr) throw delErr;

  const deadline = deadlineFrom(now).toISOString();
  const rows = winnerIds.map((pid, i) => ({
    participant_id: pid,
    posicion: i + 1,
    estado: 'pendiente',
    drawn_at: now.toISOString(),
    claim_deadline: deadline,
  }));
  const { error: insErr } = await supabaseAdmin.from('sorteo_ganadores').insert(rows);
  if (insErr) throw insErr;

  return { ok: true };
}

/**
 * Descalifica a un ganador y saca un suplente del mismo pool, sin repetir a
 * NINGÚN participante que ya haya sido ganador (vigente, confirmado o descalificado).
 */
export async function redraw({ participantId, now, motivo }) {
  // Filas actuales del sorteo.
  const { data: ganadores, error: gErr } = await supabaseAdmin
    .from('sorteo_ganadores')
    .select('id, participant_id, posicion, estado');
  if (gErr) throw gErr;

  const target = (ganadores || []).find(
    (g) => g.participant_id === participantId && g.estado !== 'descalificado',
  );
  if (!target) {
    return { ok: false, error: 'Ese participante no es un ganador vigente.' };
  }

  // Marcar como descalificado.
  const { error: updErr } = await supabaseAdmin
    .from('sorteo_ganadores')
    .update({ estado: 'descalificado', notas: motivo || null })
    .eq('id', target.id);
  if (updErr) throw updErr;

  // Pool excluyendo a todos los que ya pasaron por el sorteo.
  const excluded = new Set((ganadores || []).map((g) => g.participant_id));
  const participants = await loadParticipants();
  const pool = participants.filter((p) => !excluded.has(p.id));

  if (pool.length === 0) {
    return { ok: true, replaced: false, warning: 'No quedan suplentes disponibles en el pool.' };
  }

  const [suplenteId] = weightedSampleDistinct(
    pool.map((p) => p.id),
    pool.map((p) => p.total_tickets),
    1,
  );

  const { error: insErr } = await supabaseAdmin.from('sorteo_ganadores').insert({
    participant_id: suplenteId,
    posicion: target.posicion,
    estado: 'pendiente',
    drawn_at: now.toISOString(),
    claim_deadline: deadlineFrom(now).toISOString(),
  });
  if (insErr) throw insErr;

  return { ok: true, replaced: true };
}

/** Marca/desmarca verified de una acción reclamada. */
export async function setActionVerified({ participantId, actionType, verified }) {
  if (!['instagram', 'facebook', 'referido', 'google'].includes(actionType)) {
    return { ok: false, error: 'action_type inválido.' };
  }
  const { data, error } = await supabaseAdmin
    .from('acciones')
    .update({ verified: !!verified })
    .eq('participant_id', participantId)
    .eq('action_type', actionType)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    return { ok: false, error: 'El participante no reclamó esa acción.' };
  }
  return { ok: true };
}

/** Confirma a un ganador vigente (lo bloquea ante re-sorteos). */
export async function confirmWinner({ participantId }) {
  const { data, error } = await supabaseAdmin
    .from('sorteo_ganadores')
    .update({ estado: 'confirmado' })
    .eq('participant_id', participantId)
    .eq('estado', 'pendiente')
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    return { ok: false, error: 'No hay un ganador pendiente con ese id.' };
  }
  return { ok: true };
}
