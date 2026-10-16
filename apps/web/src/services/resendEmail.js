// Helper mínimo para enviar correos vía Resend.
// Lo usan los avisos del sorteo (nuevo registro + resumen diario). No lanza:
// devuelve { ok } para que el llamador nunca se rompa por un fallo de correo.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'Car Injury Clinic <no-reply@carinjuryclinics.com>';

/**
 * @param {object} opts
 * @param {string|string[]} opts.to  destinatario(s)
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string} [opts.text]
 * @returns {Promise<{ok:boolean, skipped?:boolean, status?:number, error?:string}>}
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.warn('[resendEmail] RESEND_API_KEY no configurada, se omite el correo.');
    return { ok: false, skipped: true };
  }
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) return { ok: false, skipped: true };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to: recipients, subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[resendEmail] Resend non-OK:', res.status, body.slice(0, 200));
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.warn('[resendEmail] error enviando correo (no bloquea):', err?.message);
    return { ok: false, error: err?.message };
  }
}
