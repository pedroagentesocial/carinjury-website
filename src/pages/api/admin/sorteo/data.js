// GET /api/admin/sorteo/data → estado completo del panel (requiere sesión admin).

import { loadEnv } from '../../../../scripts/loadEnv.js';
loadEnv();

import { requireAdmin } from '../../../../services/adminAuth.js';
import { supabaseAdmin } from '../../../../services/supabaseClient.js';
import { getAdminData } from '../../../../services/sorteoAdmin.js';

export const prerender = false;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function GET({ cookies }) {
  if (!requireAdmin(cookies)) return json({ success: false, error: 'No autorizado' }, 401);
  if (!supabaseAdmin) return json({ success: false, error: 'Servicio no disponible' }, 503);

  try {
    const data = await getAdminData();
    return json({ success: true, ...data });
  } catch (err) {
    console.error('[admin/sorteo/data] error:', err.message);
    return json({ success: false, error: 'Error interno' }, 500);
  }
}
