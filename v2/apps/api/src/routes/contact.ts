import { Hono } from 'hono';
import { ContactFormSchema } from '@carinjury/shared';
import { forwardLead } from '../services/lead.js';

export const contactRoute = new Hono().post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'invalid_json' }, 400);
  }

  const parsed = ContactFormSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return c.json(
      { ok: false, error: first?.message ?? 'validation_failed' },
      400,
    );
  }

  // Honeypot — si viene relleno, fingimos OK pero descartamos.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return c.json({ ok: true, id: 'noop' });
  }

  const result = await forwardLead(parsed.data);
  if (!result.ok) {
    return c.json({ ok: false, error: result.error }, 502);
  }
  return c.json({ ok: true, id: result.id });
});
