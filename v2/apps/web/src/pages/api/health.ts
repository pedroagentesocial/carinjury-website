import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({ ok: true, service: 'carinjury-web', ts: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
