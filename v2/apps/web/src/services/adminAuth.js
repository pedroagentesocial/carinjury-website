// Auth mínima para el panel /admin/sorteo, basada en la env var ADMIN_SECRET.
//
// El login compara el secreto enviado contra ADMIN_SECRET (tiempo constante) y,
// si coincide, setea una cookie HttpOnly con un token derivado (sha256 del
// secreto) — así el secreto en claro no viaja en la cookie. Cada request del
// panel valida la cookie contra ese mismo token derivado.

import crypto from 'node:crypto';

export const SESSION_COOKIE = 'sorteo_admin';

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// Token que se guarda en la cookie de sesión.
export function expectedToken() {
  const secret = process.env.ADMIN_SECRET;
  return secret ? sha256(secret) : null;
}

// ¿El secreto enviado en el login es válido?
export function isValidSecret(input) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return safeEqual(input, secret);
}

// ¿La cookie de sesión es válida?
export function isAuthed(cookieValue) {
  const token = expectedToken();
  if (!token) return false;
  return safeEqual(cookieValue, token);
}

// Guard para endpoints API: devuelve true si el request trae cookie válida.
export function requireAdmin(cookies) {
  try {
    return isAuthed(cookies.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}
