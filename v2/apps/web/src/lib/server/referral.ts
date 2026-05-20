import type { PatientReferral } from '@carinjury/shared';
import { notifyNewReferral } from './email.js';

type Result = { ok: true; id: string } | { ok: false; error: string };

/**
 * Reenvía un referido de paciente al mismo webhook que los leads normales,
 * marcándolo con `type: 'patient_referral'` para que Make.com / Zapier pueda
 * branchear en su escenario (p.ej. mandar a otra hoja, ticket de mayor prioridad).
 */
const DEFAULT_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/FrwO37FXAUYfoOh92uWG/webhook-trigger/82ea1b33-b09f-47a0-91c7-f18036c6d359';

export async function forwardReferral(data: PatientReferral): Promise<Result> {
  const url = process.env.FORM_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
  const id = crypto.randomUUID();
  const { website: _hp, ...clean } = data;
  const payload = {
    id,
    type: 'patient_referral' as const,
    ts: new Date().toISOString(),
    ...clean,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[referral] webhook responded %d', res.status);
      return { ok: false, error: `webhook_status_${res.status}` };
    }
    void notifyNewReferral(data, id).catch((e) => console.error('[referral] email failed', e));
    return { ok: true, id };
  } catch (err) {
    console.error('[referral] webhook error', err);
    return { ok: false, error: 'webhook_unreachable' };
  }
}
