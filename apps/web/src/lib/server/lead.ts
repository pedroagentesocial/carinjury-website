import type { ContactForm } from '@carinjury/shared';
import { notifyNewContactLead } from './email.js';

type LeadResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Reenvía el lead al webhook configurado (Make.com / Zapier).
 * Si no hay webhook configurado (dev), lo loguea y devuelve OK con un UUID.
 *
 * Payload enviado al webhook:
 *   { id, name, phone, email, message, language, ts }
 *
 * Make.com / Zapier reciben este JSON tal cual y pueden mapear los campos
 * a su escenario (Sheets, Email, CRM, etc.). El honeypot `website` ya fue
 * filtrado antes de llegar aquí.
 */
/**
 * Default webhook = el endpoint GHL/LeadConnector de la clínica.
 * Override con `FORM_WEBHOOK_URL` en Vercel env si cambia.
 */
const DEFAULT_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/FrwO37FXAUYfoOh92uWG/webhook-trigger/82ea1b33-b09f-47a0-91c7-f18036c6d359';

export async function forwardLead(data: ContactForm): Promise<LeadResult> {
  const url = process.env.FORM_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  const id = crypto.randomUUID();
  const payload = {
    id,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    message: data.message || null,
    discovery_source: data.discovery_source || null,
    referral_name: data.referral_name || null,
    sms_consent: data.sms_consent === true,
    terms_consent: data.terms_consent === true,
    language: data.language,
    ts: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[lead] webhook responded %d', res.status);
      return { ok: false, error: `webhook_status_${res.status}` };
    }
    // Notificación interna por email — best effort, no bloquea respuesta al cliente
    void notifyNewContactLead(data, id).catch((e) => console.error('[lead] email failed', e));
    return { ok: true, id };
  } catch (err) {
    console.error('[lead] webhook error', err);
    return { ok: false, error: 'webhook_unreachable' };
  }
}
