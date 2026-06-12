// POST /api/admin/sorteo/login  → valida ADMIN_SECRET y setea cookie de sesión.
// DELETE /api/admin/sorteo/login → cierra sesión (borra la cookie).

import { loadEnv } from '../../../../scripts/loadEnv.js';
loadEnv();

import { SESSION_COOKIE, isValidSecret, expectedToken } from '../../../../services/adminAuth.js';

export const prerender = false;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST({ request, cookies }) {
  let secret = '';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      secret = body?.secret || '';
    } else {
      const fd = await request.formData();
      secret = fd.get('secret') || '';
    }
  } catch {
    /* ignore */
  }

  if (!isValidSecret(secret)) {
    return json({ success: false, error: 'Secreto incorrecto.' }, 401);
  }

  cookies.set(SESSION_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return json({ success: true });
}

export async function DELETE({ cookies }) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return json({ success: true });
}
