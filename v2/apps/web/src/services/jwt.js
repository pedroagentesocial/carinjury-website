// JWT HS256 mínimo basado en node:crypto — sin dependencias externas.
// Se usa para firmar un token del participant_id tras el registro del sorteo
// y verificarlo luego en los endpoints de acciones bonus.

import crypto from 'node:crypto';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

/**
 * Firma un JWT HS256.
 * @param {object} payload  Claims a incluir (ej. { sub: participantId }).
 * @param {string} secret   JWT_SECRET.
 * @param {object} [opts]
 * @param {number} [opts.expiresInSec=2592000]  TTL en segundos (default 30 días).
 * @returns {string} token compacto header.payload.signature
 */
export function signJwt(payload, secret, { expiresInSec = 60 * 60 * 24 * 30 } = {}) {
  if (!secret) throw new Error('JWT_SECRET no configurado');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { iat: now, exp: now + expiresInSec, ...payload };

  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

/**
 * Verifica un JWT HS256 y devuelve sus claims, o null si es inválido/expirado.
 * Compara la firma en tiempo constante.
 * @param {string} token
 * @param {string} secret
 * @returns {object|null}
 */
export function verifyJwt(token, secret) {
  if (!secret || !token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encHeader, encBody, sig] = parts;
  const data = `${encHeader}.${encBody}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encBody, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}
