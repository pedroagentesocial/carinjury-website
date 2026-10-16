import type { ContactForm } from '@carinjury/shared';

type LeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Reenvía el lead al webhook configurado (Make / Zapier / propio CRM).
 * Si no hay webhook configurado, lo loguea y devuelve OK — útil en dev.
 */
export async function forwardLead(data: ContactForm): Promise<LeadResult> {
  const url = process.env.FORM_WEBHOOK_URL;
  const id = crypto.randomUUID();

  if (!url) {
    console.log('[lead] (dev, no webhook) id=%s data=%o', id, data);
    return { ok: true, id };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      return { ok: false, error: `webhook_status_${res.status}` };
    }
    return { ok: true, id };
  } catch (err) {
    console.error('[lead] webhook error', err);
    return { ok: false, error: 'webhook_unreachable' };
  }
}
