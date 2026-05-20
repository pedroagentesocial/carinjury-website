import type { APIRoute } from 'astro';
import { ContactFormSchema } from '@carinjury/shared';
import { forwardLead } from '@/lib/server/lead';
import { verifyCaptcha } from '@/lib/server/captcha';
import { rateLimit, getClientIp } from '@/lib/server/rate-limit';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  /* Rate limit por IP — 5 requests/minuto */
  const ip = getClientIp(request);
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  /* Parse JSON */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  /* Zod validation (incluye sms_consent, terms_consent, captcha_token requeridos) */
  const parsed = ContactFormSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json({ ok: false, error: first?.message ?? 'validation_failed' }, 400);
  }

  /* Honeypot — pretendemos OK y descartamos silenciosamente */
  if (parsed.data.website && parsed.data.website.length > 0) {
    return json({ ok: true, id: 'noop' });
  }

  /* reCAPTCHA — verificación server-side contra Google */
  const captchaOk = await verifyCaptcha(parsed.data.captcha_token, ip);
  if (!captchaOk) {
    return json({ ok: false, error: 'captcha_failed' }, 400);
  }

  /* Forward a GHL webhook */
  const result = await forwardLead(parsed.data);
  if (!result.ok) return json({ ok: false, error: result.error }, 502);
  return json({ ok: true, id: result.id });
};
