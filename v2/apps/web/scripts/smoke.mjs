#!/usr/bin/env node
/**
 * Smoke tests sin dependencias. Asume dev server o build corriendo en
 * `BASE_URL` (default http://localhost:4321).
 *
 * Uso:
 *   node scripts/smoke.mjs                  # contra dev local
 *   BASE_URL=https://staging.x.com node scripts/smoke.mjs
 *
 * Sale 1 si algo falla. Imprime resumen amigable.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const ROUTES = [
  '/',
  '/en/',
  '/services',
  '/en/services',
  '/faq',
  '/en/faq',
  '/aboutus',
  '/en/aboutus',
  '/schedule',
  '/en/schedule',
  '/lawyer-approved',
  '/en/lawyer-approved',
  '/privacy',
  '/en/privacy',
  '/formulario',
  '/en/formulario',
  '/gracias',
  '/en/gracias',
  '/ads/auto-accident',
  '/en/ads/auto-accident',
];

const NEGATIVE_ROUTES = [
  { path: '/this-does-not-exist', expect: 404 },
];

const CONTENT_CHECKS = [
  { path: '/', contains: ['Recupera tu vida', 'Mismo día'], excludes: ['undefined', 'NaN'] },
  { path: '/en/', contains: ['Recover your life', 'Same day'], excludes: ['undefined', 'NaN'] },
  { path: '/services', contains: ['Quiroprác', 'Rehabilita', 'Diagnóstico'] },
  { path: '/faq', contains: ['Lo primero', 'Compensación'] },
  { path: '/aboutus', contains: ['Dr. Johnny', 'Dr. Darwin', 'Credenciales'] },
  { path: '/privacy', contains: ['HIPAA', 'Tus Derechos'] },
  { path: '/formulario', contains: ['Información del Paciente'] },
  { path: '/gracias', contains: ['Gracias'] },
];

const API_TESTS = [
  { name: 'GET /api/health', method: 'GET', path: '/api/health', expectStatus: 200, expectJson: { ok: true } },
  { name: 'GET /api/reviews', method: 'GET', path: '/api/reviews', expectStatus: 200, expectKey: 'reviews' },
  {
    name: 'POST /api/contact (valid)',
    method: 'POST',
    path: '/api/contact',
    body: { name: 'Smoke Test', phone: '+13855551212', email: 's@test.com', message: 'hi', language: 'es' },
    expectStatus: 200,
    expectJson: { ok: true },
  },
  {
    name: 'POST /api/contact (invalid)',
    method: 'POST',
    path: '/api/contact',
    body: { name: 'X', phone: '123', language: 'es' },
    expectStatus: 400,
    expectJson: { ok: false },
  },
  {
    name: 'POST /api/referral (valid)',
    method: 'POST',
    path: '/api/referral',
    body: {
      first_name: 'Juan',
      last_name: 'Perez',
      date_of_birth: '1990-01-01',
      gender: 'male',
      address: '123 Main',
      city: 'SLC',
      state: 'UT',
      zip: '84101',
      cell_phone: '+13855551212',
      email: 'j@e.com',
      accident_date: '2026-05-01',
      accident_type: 'car',
      legal_representation: 'no',
      signature_name: 'Juan Perez',
      consent: true,
      language: 'es',
    },
    expectStatus: 200,
    expectJson: { ok: true },
  },
];

let pass = 0;
let fail = 0;
const failures = [];

function report(label, ok, detail = '') {
  if (ok) {
    console.log(`  ${GREEN}✓${RESET} ${label}${detail ? DIM + ' ' + detail + RESET : ''}`);
    pass += 1;
  } else {
    console.log(`  ${RED}✖${RESET} ${label}${detail ? ' ' + RED + detail + RESET : ''}`);
    fail += 1;
    failures.push({ label, detail });
  }
}

async function probe(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: 'manual' });
  const text = res.status < 400 ? await res.text() : '';
  return { status: res.status, text, url };
}

async function api(method, path, body) {
  const init = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, init);
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

console.log(`${DIM}smoke target: ${BASE}${RESET}\n`);

// 1) Page routes
console.log(`${YELLOW}● Page routes${RESET}`);
for (const r of ROUTES) {
  try {
    const { status } = await probe(r);
    report(`GET ${r}`, status === 200, `status=${status}`);
  } catch (err) {
    report(`GET ${r}`, false, String(err.message ?? err));
  }
}

// 2) Negative routes
console.log(`\n${YELLOW}● Negative routes${RESET}`);
for (const r of NEGATIVE_ROUTES) {
  try {
    const { status } = await probe(r.path);
    report(`GET ${r.path}`, status === r.expect, `status=${status} expected=${r.expect}`);
  } catch (err) {
    report(`GET ${r.path}`, false, String(err.message ?? err));
  }
}

// 3) Content checks
console.log(`\n${YELLOW}● Content checks${RESET}`);
for (const c of CONTENT_CHECKS) {
  try {
    const { text } = await probe(c.path);
    const missing = (c.contains ?? []).filter((s) => !text.includes(s));
    const leaked = (c.excludes ?? []).filter((s) => text.includes(s));
    const ok = missing.length === 0 && leaked.length === 0;
    const detail = !ok
      ? [missing.length ? `missing=${missing.join(',')}` : '', leaked.length ? `leaked=${leaked.join(',')}` : '']
          .filter(Boolean)
          .join(' ')
      : '';
    report(`${c.path}`, ok, detail);
  } catch (err) {
    report(`${c.path}`, false, String(err.message ?? err));
  }
}

// 4) API tests
console.log(`\n${YELLOW}● API endpoints${RESET}`);
for (const t of API_TESTS) {
  try {
    const { status, json } = await api(t.method, t.path, t.body);
    let ok = status === t.expectStatus;
    if (ok && t.expectJson) {
      for (const [k, v] of Object.entries(t.expectJson)) {
        if (json?.[k] !== v) ok = false;
      }
    }
    if (ok && t.expectKey) {
      if (!(t.expectKey in (json ?? {}))) ok = false;
    }
    report(t.name, ok, `status=${status}`);
  } catch (err) {
    report(t.name, false, String(err.message ?? err));
  }
}

console.log(
  `\n${pass + fail} checks · ${GREEN}${pass} passed${RESET}${fail ? ` · ${RED}${fail} failed${RESET}` : ''}`,
);

if (fail > 0) {
  console.log('');
  for (const f of failures) console.log(`  ${RED}✖${RESET} ${f.label}  ${DIM}${f.detail}${RESET}`);
  process.exit(1);
}
process.exit(0);
