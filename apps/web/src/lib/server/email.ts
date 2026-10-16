import type { ContactForm, PatientReferral } from '@carinjury/shared';

/**
 * Wrapper de email transactional via Resend. Opcional — si `RESEND_API_KEY`
 * no está seteada, esta función es no-op y devuelve `{ ok: true, skipped: true }`.
 *
 * Para activar:
 *   1. Crea cuenta en https://resend.com
 *   2. Verifica el dominio (carinjuryclinics.com) en Domains
 *   3. Genera API key en API Keys → pégala en `RESEND_API_KEY`
 *   4. Setea `LEAD_NOTIFY_TO` (destinatario interno) y `LEAD_FROM_EMAIL`
 *      (debe ser de un dominio verificado, p.ej. leads@carinjuryclinics.com)
 *
 * Si quieres usar otro provider (SendGrid, Mailgun, Postmark), reemplaza
 * `sendViaResend` por el equivalente.
 */

type Result = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string };

interface MailMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

async function sendViaResend(msg: MailMessage): Promise<Result> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: true, skipped: true };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: msg.from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: msg.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[email] resend status %d body=%s', res.status, body.slice(0, 300));
      return { ok: false, error: `resend_status_${res.status}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[email] resend error', err);
    return { ok: false, error: 'resend_unreachable' };
  }
}

function envOrFallback(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

export async function notifyNewContactLead(data: ContactForm, leadId: string): Promise<Result> {
  const to = envOrFallback('LEAD_NOTIFY_TO', 'leads@carinjuryclinic.com');
  const from = envOrFallback('LEAD_FROM_EMAIL', 'leads@carinjuryclinic.com');

  const subject = `[CIC] Nuevo lead — ${data.name}`;
  const lines = [
    `Nombre: ${data.name}`,
    `Teléfono: ${data.phone}`,
    data.email ? `Correo: ${data.email}` : null,
    data.message ? `Mensaje: ${data.message}` : null,
    `Idioma: ${data.language}`,
    `Lead ID: ${leadId}`,
  ].filter(Boolean) as string[];

  const text = lines.join('\n');
  const html = `<div style="font-family:system-ui;line-height:1.5">
    <h2 style="margin:0 0 12px;color:#4a1c5a">Nuevo lead — Car Injury Clinic</h2>
    <table style="border-collapse:collapse">
      ${lines
        .map(
          (l) =>
            `<tr><td style="padding:4px 12px 4px 0">${l.split(':')[0]}</td><td style="padding:4px 0">${l
              .split(':')
              .slice(1)
              .join(':')
              .trim()}</td></tr>`,
        )
        .join('')}
    </table>
  </div>`;

  return sendViaResend({ to, from, subject, text, html, replyTo: data.email || undefined });
}

export async function notifyNewReferral(data: PatientReferral, leadId: string): Promise<Result> {
  const to = envOrFallback('LEAD_NOTIFY_TO', 'leads@carinjuryclinic.com');
  const from = envOrFallback('LEAD_FROM_EMAIL', 'leads@carinjuryclinic.com');

  const subject = `[CIC] Nuevo referido — ${data.first_name} ${data.last_name}`;
  const blocks = {
    Paciente: `${data.first_name} ${data.middle_name ?? ''} ${data.last_name} · ${data.gender} · ${data.date_of_birth}`,
    Contacto: `${data.cell_phone} · ${data.email ?? '—'}`,
    Dirección: `${data.address} ${data.address2 ?? ''}, ${data.city}, ${data.state} ${data.zip}`,
    Incidente: `${data.accident_date} · ${data.accident_type}${data.accident_type_other ? ` (${data.accident_type_other})` : ''}`,
    Seguro: `${data.insurance_name ?? '—'} · póliza ${data.policy_number ?? '—'} · claim ${data.claim_number ?? '—'}`,
    Legal: data.legal_representation === 'yes' ? `Sí · ${data.lawyer_firm_name ?? ''} ${data.lawyer_phone ?? ''}` : 'No',
    Referido: `${data.referral_name ?? '—'} ${data.referral_phone ?? ''}`,
    Notas: data.additional_notes ?? '—',
    Firma: data.signature_name,
    'Lead ID': leadId,
  };

  const text = Object.entries(blocks)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const html = `<div style="font-family:system-ui;line-height:1.5">
    <h2 style="margin:0 0 12px;color:#4a1c5a">Nuevo referido — Car Injury Clinic</h2>
    <table style="border-collapse:collapse">
      ${Object.entries(blocks)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;white-space:nowrap;color:#666"><strong>${k}</strong></td><td style="padding:4px 0">${v}</td></tr>`,
        )
        .join('')}
    </table>
  </div>`;

  return sendViaResend({ to, from, subject, text, html, replyTo: data.email || undefined });
}
