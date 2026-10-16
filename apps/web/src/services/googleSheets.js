// Replicación a Google Sheets vía un Web App de Apps Script (server-only, best-effort).
//
// La organización del usuario bloquea las llaves JSON de cuenta de servicio
// (org policy iam.disableServiceAccountKeyCreation), así que en vez de googleapis
// usamos un Apps Script publicado como web app, ligado al propio Sheet.
//
// Supabase es la fuente de verdad; esto solo refleja datos para el equipo.
// NUNCA lanza: si algo falla, loguea y devuelve false (no bloquea el endpoint).
//
// Env vars:
//   SHEETS_WEBAPP_URL    → URL del web app (.../exec)
//   SHEETS_WEBAPP_SECRET → secreto compartido (igual al del script)

const WEBAPP_URL = process.env.SHEETS_WEBAPP_URL;
const WEBAPP_SECRET = process.env.SHEETS_WEBAPP_SECRET;

function isConfigured() {
  return Boolean(WEBAPP_URL && WEBAPP_SECRET);
}

async function post(payload) {
  if (!isConfigured()) return false;
  try {
    const res = await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: WEBAPP_SECRET, ...payload }),
      redirect: 'follow', // Apps Script responde con redirect 302 a googleusercontent
    });
    if (!res.ok) {
      console.warn('[googleSheets] web app respondió non-OK:', res.status);
      return false;
    }
    const j = await res.json().catch(() => ({}));
    if (!j.ok) {
      console.warn('[googleSheets] web app error:', j.error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[googleSheets] post falló (no bloquea):', err?.message);
    return false;
  }
}

// Fecha en formato es-US (zona de Pedro: Mountain Time).
export function fechaEsUS() {
  try {
    return new Date().toLocaleString('es-US', {
      timeZone: 'America/Denver',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Agrega una fila nueva a "Registros". Best-effort.
 * row: { fecha, nombre, telefono, email, ig_handle, fb_handle, sigue_ig,
 *        sigue_fb, referido_por, num_referidos, total_tickets, verificado_ganador }
 */
export async function appendRegistro(row) {
  return post({ op: 'append', row });
}

/**
 * Busca la fila por email (columna D) y actualiza sigue_ig/sigue_fb,
 * num_referidos, total_tickets y opcionalmente el handle. Best-effort.
 * @param {string} email  email normalizado (misma clave que usó appendRegistro)
 * @param {object} fields { sigue_ig, sigue_fb, num_referidos, total_tickets, ig_handle?, fb_handle? }
 */
export async function updateRegistroByEmail(email, fields) {
  if (!email) return false;
  return post({ op: 'update', email, fields });
}
