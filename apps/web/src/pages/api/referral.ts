import type { APIRoute } from 'astro';
import { PatientReferralSchema } from '@carinjury/shared';
import { forwardReferral } from '@/lib/server/referral';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const parsed = PatientReferralSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json({ ok: false, error: first?.message ?? 'validation_failed' }, 400);
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return json({ ok: true, id: 'noop' });
  }

  const result = await forwardReferral(parsed.data);
  if (!result.ok) return json({ ok: false, error: result.error }, 502);
  return json({ ok: true, id: result.id });
};
