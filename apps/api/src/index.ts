import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health.js';
import { contactRoute } from './routes/contact.js';
import { reviewsRoute } from './routes/reviews.js';

const app = new Hono();

const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:4321';

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [webOrigin],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
  }),
);

app.route('/health', healthRoute);
app.route('/contact', contactRoute);
app.route('/reviews', reviewsRoute);

app.notFound((c) => c.json({ error: 'not_found' }, 404));
app.onError((err, c) => {
  console.error('[api] unhandled', err);
  return c.json({ error: 'internal_error' }, 500);
});

const port = Number(process.env.API_PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[api] listening on http://localhost:${info.port}`);
});
