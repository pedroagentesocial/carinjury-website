// POST /api/sorteo/registrar — registro de participantes del sorteo (server-only).
//
// Flujo:
//  1. Parsea nombre/telefono/email/consent + honeypot (JSON o FormData) y ?ref del query.
//  2. Rechaza si consent != true o el honeypot trae valor (bot).
//  3. Normaliza email (minúsculas, sin alias + ni puntos de gmail) y telefono a E.164.
//     La normalización replica EXACTAMENTE las funciones SQL de la migración 002,
//     para que el dedup en JS coincida con las columnas generadas email_norm/telefono_e164.
//  4. Dedup por email y telefono → 409 amigable si ya existe.
//  5. Si viene ?ref, resuelve al referente por referral_code y guarda su id en referido_por.
//  6. Inserta el participante (la entrada cuenta de inmediato, sin verificación de correo).
//  7. Acredita al referente una acción 'referido' (ticket_value 1) respetando el UNIQUE.
//  8. Envía correo de bienvenida (Resend) — informativo, no bloqueante.
//  9. Dispara webhook a GHL — no bloqueante.
// 10. Devuelve un JWT firmado del participant_id para autenticar las acciones bonus.

import { loadEnv } from '../../../scripts/loadEnv.js';
loadEnv();

import crypto from 'node:crypto';
import { supabaseAdmin } from '../../../services/supabaseClient.js';
import { signJwt } from '../../../services/jwt.js';
import { appendRegistro, fechaEsUS } from '../../../services/googleSheets.js';
import { sendEmail } from '../../../services/resendEmail.js';
import { sorteoCerrado } from '../../../data/sorteo';

export const prerender = false;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Car Injury Clinic <no-reply@carinjuryclinics.com>';
// Correo(s) del organizador que reciben un aviso por cada registro nuevo.
// Opt-in: si no se configura, no se manda nada. Acepta varios separados por coma.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
// Reutiliza el webhook general del sitio (WEBHOOK_URL) si no hay uno dedicado al sorteo.
const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || process.env.WEBHOOK_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const SITE_URL = (process.env.SITE_URL || 'https://carinjuryclinics.com').replace(/\/+$/, '');

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// ----------------------------------------------------------------------------
// Normalización — espejo de normalize_email / normalize_phone_e164 (migración 002)
// ----------------------------------------------------------------------------

function normalizeEmail(raw) {
  if (!raw) return null;
  const email = String(raw).trim().toLowerCase();
  const at = email.indexOf('@');
  if (at === -1) return email; // sin @ válido: minúsculas tal cual (igual que el SQL)

  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (!domain) return email;

  // Quitar alias +sufijo.
  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  // Gmail/Googlemail: los puntos no cuentan y comparten dominio.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }

  return `${local}@${domain}`;
}

function normalizePhoneE164(raw) {
  if (!raw) return null;
  const hasPlus = String(raw).trim().startsWith('+');
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  if (hasPlus) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

// ----------------------------------------------------------------------------
// Helpers de entrada
// ----------------------------------------------------------------------------

const TRUTHY = new Set(['true', 'on', '1', 'yes', 'si', 'sí']);
function toBool(v) {
  if (v === true) return true;
  if (typeof v === 'string') return TRUTHY.has(v.trim().toLowerCase());
  return false;
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
  // FormData / urlencoded (formularios tradicionales del sitio).
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

function genReferralCode() {
  // 8 hex en mayúsculas, mismo formato que el DEFAULT del SQL.
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function hashIp(ip) {
  if (!ip) return null;
  // Hash con sal del secret para no almacenar IP en claro.
  return crypto.createHash('sha256').update(`${ip}:${JWT_SECRET || ''}`).digest('hex');
}

function constraintHit(error, needle) {
  const blob = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return blob.includes(needle);
}

// ----------------------------------------------------------------------------
// Efectos secundarios no bloqueantes
// ----------------------------------------------------------------------------

async function sendWelcomeEmail({ nombre, email, referralCode }) {
  if (!RESEND_API_KEY) {
    console.warn('[sorteo/registrar] RESEND_API_KEY no configurada, se omite el correo.');
    return;
  }

  const nombreCorto = (nombre || '').trim().split(/\s+/)[0] || 'hola';
  const shareUrl = `${SITE_URL}/sorteo?ref=${encodeURIComponent(referralCode)}`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.5">
    <h1 style="font-size:22px;margin:0 0 12px">¡Ya estás dentro del sorteo, ${nombreCorto}! 🎉</h1>
    <p>Recibimos tu registro y <strong>tu entrada ya cuenta</strong>. No tienes que hacer nada más para participar.</p>
    <p>¿Quieres más oportunidades de ganar? Puedes sumar boletos extra:</p>
    <ul>
      <li>Siguiéndonos en Instagram y Facebook.</li>
      <li><strong>Dejándonos una reseña de 5 estrellas en Google (¡suma 2 boletos!).</strong></li>
      <li>Invitando a tu familia y amigos con tu enlace personal.</li>
    </ul>
    <p style="margin:18px 0">
      Tu enlace para invitar:<br>
      <a href="${shareUrl}" style="color:#0b5fff;word-break:break-all">${shareUrl}</a>
    </p>
    <p style="color:#666;font-size:13px">Cada persona que se registre con tu enlace te da un boleto adicional.</p>
    <p style="margin-top:24px">¡Mucha suerte!<br><strong>El equipo de Car Injury Clinic</strong></p>
  </div>`.trim();

  const text =
    `¡Ya estás dentro del sorteo, ${nombreCorto}!\n\n` +
    `Recibimos tu registro y tu entrada ya cuenta. No tienes que hacer nada más para participar.\n\n` +
    `¿Quieres más oportunidades? Síguenos en Instagram y Facebook, déjanos una reseña de 5 estrellas en Google (suma 2 boletos), e invita a tu gente con tu enlace:\n` +
    `${shareUrl}\n\n` +
    `Cada registro con tu enlace te da un boleto adicional.\n\n` +
    `¡Mucha suerte!\nEl equipo de Car Injury Clinic`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: '¡Estás dentro del sorteo! 🎉',
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[sorteo/registrar] Resend respondió non-OK:', res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.warn('[sorteo/registrar] Error enviando correo (no bloquea):', err?.message);
  }
}

async function fireGhlWebhook({ nombre, telefono, email, referido_por }) {
  if (!GHL_WEBHOOK_URL) return;
  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, email, referido_por }),
    });
    if (!res.ok) {
      console.warn('[sorteo/registrar] GHL webhook non-OK:', res.status);
    }
  } catch (err) {
    console.warn('[sorteo/registrar] Error en webhook GHL (no bloquea):', err?.message);
  }
}

// Aviso al organizador por cada registro exitoso (opt-in vía ADMIN_NOTIFY_EMAIL).
async function notifyAdmin({ nombre, email, telefono, referidoPor }) {
  if (!ADMIN_NOTIFY_EMAIL) return;
  const to = ADMIN_NOTIFY_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);
  const cuando = fechaEsUS();
  const refLinea = referidoPor
    ? `<p style="margin:4px 0;color:#666">Vino por un enlace de referido.</p>`
    : '';
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.5">
    <h2 style="font-size:18px;margin:0 0 12px">🎟️ Nuevo registro en el sorteo</h2>
    <p style="margin:4px 0"><strong>Nombre:</strong> ${nombre}</p>
    <p style="margin:4px 0"><strong>Correo:</strong> ${email}</p>
    <p style="margin:4px 0"><strong>Teléfono:</strong> ${telefono}</p>
    <p style="margin:4px 0"><strong>Fecha:</strong> ${cuando}</p>
    ${refLinea}
  </div>`.trim();
  const text =
    `Nuevo registro en el sorteo\n` +
    `Nombre: ${nombre}\nCorreo: ${email}\nTeléfono: ${telefono}\nFecha: ${cuando}` +
    (referidoPor ? `\nVino por un enlace de referido.` : '');
  await sendEmail({ to, subject: `🎟️ Nuevo registro en el sorteo: ${nombre}`, html, text });
}

// ----------------------------------------------------------------------------
// Handler
// ----------------------------------------------------------------------------

export async function POST({ request, clientAddress, url }) {
  try {
    if (!supabaseAdmin) {
      console.error('[sorteo/registrar] supabaseAdmin no disponible (faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }
    if (!JWT_SECRET) {
      console.error('[sorteo/registrar] JWT_SECRET no configurado.');
      return json({ success: false, error: 'Servicio no disponible' }, 503);
    }

    // El sorteo cierra el lunes de la rifa: ya no se aceptan registros.
    if (sorteoCerrado()) {
      return json({ success: false, error: 'El sorteo ya cerró.', code: 'SORTEO_CERRADO' }, 403);
    }

    const raw = await parseBody(request);

    // Honeypot: campo oculto que un humano nunca llena. Si trae valor → bot.
    // Usamos "company" para ser consistentes con los demás forms del sitio.
    const honeypot = raw.company ?? raw.website ?? raw.honeypot;
    if (honeypot && String(honeypot).trim() !== '') {
      // Respuesta opaca: no revelamos que detectamos el honeypot.
      return json({ success: false, error: 'Solicitud inválida' }, 400);
    }

    // Consentimiento obligatorio.
    if (!toBool(raw.consent)) {
      return json({ success: false, error: 'Debes aceptar los términos para participar.' }, 422);
    }

    const nombre = String(raw.nombre || raw.name || raw.fullName || '').trim();
    const telefonoRaw = String(raw.telefono || raw.phone || '').trim();
    const emailRaw = String(raw.email || '').trim();

    if (!nombre || !telefonoRaw || !emailRaw) {
      return json({ success: false, error: 'Faltan datos: nombre, teléfono y email son obligatorios.' }, 422);
    }

    const emailNorm = normalizeEmail(emailRaw);
    const telefonoE164 = normalizePhoneE164(telefonoRaw);

    if (!emailNorm || !emailNorm.includes('@')) {
      return json({ success: false, error: 'El email no es válido.' }, 422);
    }
    if (!telefonoE164) {
      return json({ success: false, error: 'El teléfono no es válido.' }, 422);
    }

    // --- Dedup amigable (pre-check). Las columnas generadas garantizan el dedup
    //     real a nivel DB; esto solo da un mensaje claro antes del insert. ---
    const dupChecks = [
      ['email_norm', emailNorm, 'Este correo ya está registrado en el sorteo.'],
      ['telefono_e164', telefonoE164, 'Este teléfono ya está registrado en el sorteo.'],
    ];
    for (const [col, val, msg] of dupChecks) {
      const { data: hit, error: dupErr } = await supabaseAdmin
        .from('participantes')
        .select('id')
        .eq(col, val)
        .limit(1)
        .maybeSingle();
      if (dupErr) {
        console.error('[sorteo/registrar] error en dedup:', dupErr.message);
        return json({ success: false, error: 'Error interno' }, 500);
      }
      if (hit) {
        return json({ success: false, error: msg, code: 'ALREADY_REGISTERED' }, 409);
      }
    }

    // --- Resolver referente por ?ref (referral_code) ---
    let referidoPor = null;
    const ref = (url?.searchParams?.get('ref') || raw.ref || '').trim();
    if (ref) {
      const { data: referente } = await supabaseAdmin
        .from('participantes')
        .select('id')
        .eq('referral_code', ref.toUpperCase())
        .limit(1)
        .maybeSingle();
      if (referente) referidoPor = referente.id;
      // Si el ref no existe, lo ignoramos silenciosamente (no bloquea el registro).
    }

    // --- Insertar participante, regenerando referral_code ante colisión ---
    const ipHash = hashIp(clientAddress || request.headers.get('x-forwarded-for'));
    let inserted = null;

    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const referralCode = genReferralCode();
      const { data, error } = await supabaseAdmin
        .from('participantes')
        .insert({
          nombre,
          telefono: telefonoRaw,
          email: emailRaw,
          consent: true,
          referral_code: referralCode,
          referido_por: referidoPor,
          ip_hash: ipHash,
        })
        .select('id, referral_code')
        .single();

      if (!error) {
        inserted = data;
        break;
      }

      // 23505 = unique_violation.
      if (error.code === '23505') {
        if (constraintHit(error, 'referral_code')) {
          continue; // colisión de código: reintentar con otro.
        }
        // Carrera con un registro simultáneo del mismo email/teléfono.
        const msg = constraintHit(error, 'telefono')
          ? 'Este teléfono ya está registrado en el sorteo.'
          : 'Este correo ya está registrado en el sorteo.';
        return json({ success: false, error: msg, code: 'ALREADY_REGISTERED' }, 409);
      }

      console.error('[sorteo/registrar] error insertando participante:', error.message);
      return json({ success: false, error: 'Error interno' }, 500);
    }

    if (!inserted) {
      console.error('[sorteo/registrar] no se pudo generar un referral_code único tras varios intentos.');
      return json({ success: false, error: 'Error interno' }, 500);
    }

    // --- Acreditar acción 'referido' al referente (no duplica por el UNIQUE) ---
    if (referidoPor) {
      const { error: accErr } = await supabaseAdmin
        .from('acciones')
        .upsert(
          {
            participant_id: referidoPor,
            action_type: 'referido',
            ticket_value: 1,
            verified: true,
          },
          { onConflict: 'participant_id,action_type', ignoreDuplicates: true },
        );
      if (accErr) {
        // El participante ya quedó registrado; no revertimos por esto.
        console.warn('[sorteo/registrar] no se pudo acreditar referido (no bloquea):', accErr.message);
      }
    }

    // --- Efectos no bloqueantes ---
    await sendWelcomeEmail({ nombre, email: emailRaw, referralCode: inserted.referral_code });
    await notifyAdmin({ nombre, email: emailRaw, telefono: telefonoE164, referidoPor });
    await fireGhlWebhook({ nombre, telefono: telefonoE164, email: emailNorm, referido_por: referidoPor });

    // Replicar en Google Sheets. Fila nueva: el participante aún no tiene
    // acciones (1 ticket base) ni referidos; verificado_ganador queda vacío.
    // Usamos emailNorm como clave de fila (mismo valor que /accion para buscar).
    await appendRegistro({
      fecha: fechaEsUS(),
      nombre,
      telefono: telefonoE164,
      email: emailNorm,
      ig_handle: '',
      fb_handle: '',
      sigue_ig: 'No',
      sigue_fb: 'No',
      resena_google: 'No',
      referido_por: referidoPor || '',
      num_referidos: 0,
      total_tickets: 1,
      verificado_ganador: '',
      finalizado: 'No',
    });

    // --- JWT del participant_id para autenticar acciones bonus ---
    const token = signJwt({ sub: inserted.id }, JWT_SECRET);

    return json(
      {
        success: true,
        participantId: inserted.id,
        referralCode: inserted.referral_code,
        token,
      },
      201,
    );
  } catch (error) {
    console.error('[sorteo/registrar] error inesperado:', error);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
