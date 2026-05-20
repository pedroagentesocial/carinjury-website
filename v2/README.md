# Car Injury Clinic — v2

Monorepo. El frontend Astro lleva los endpoints `/api/*` como Vercel Functions
(deploy unificado). El paquete `apps/api` queda como fallback opcional si se
quisiera separar el back como servicio Node propio.

## Stack

- **apps/web** — Astro 5 SSR + React 19 + TypeScript + Tailwind 3 + motion. Hospeda
  páginas y endpoints `/api/health`, `/api/contact`, `/api/reviews`.
- **packages/shared** — Schemas Zod (ContactForm, Review) y utilidades i18n type-safe.
- **apps/api** — Hono + TypeScript. **Deprecated por defecto**, ver `apps/api/README.md`.

Ver [DEPLOY.md](DEPLOY.md) para deploy a Vercel + integraciones (GHL, Make/Zapier, Google Places).

## Requisitos

- Node 20+
- pnpm 9 (se activa con `corepack enable`)

## Comandos

```bash
# instalar todo
pnpm install

# arrancar el web (:4321 con /api/* incluidos) — modo default
pnpm dev

# arrancar web + api standalone Hono en paralelo (raro, solo si separas back)
pnpm dev:all

# build del web (lo que va a Vercel)
pnpm build

# typecheck los 3 paquetes
pnpm typecheck

# paridad i18n (es ↔ en, sin duplicados)
pnpm check-i18n
```

## i18n

- Idiomas: `es` (default) y `en`.
- Rutas localizadas reales (`/` vs `/en/...`) vía Astro i18n nativo.
- Las claves de traducción son **type-safe**: se derivan del JSON en `apps/web/src/i18n/es.json` y se validan en build.

## Paleta

Definida en `apps/web/src/styles/global.css` con variables CSS (`--c-purple`, `--c-rose`, etc.). Tailwind las consume vía aliases (`primary`, `secondary`, `accent`).

## Validación i18n

Cada commit debería pasar:

```bash
pnpm --filter @carinjury/web check-i18n
```

Valida paridad es ↔ en, tipos consistentes y ausencia de claves duplicadas top-level. Hay un companion script `dedupe-i18n.mjs` que limpia duplicados re-emitiendo los JSON.

## Integraciones opcionales (env)

| Variable | Servicio | Efecto si vacía |
|---|---|---|
| `FORM_WEBHOOK_URL` | Webhook del formulario | Leads se loguean a stdout (dev mode) |
| `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` | Reviews reales en `/reviews` | Devuelve seed estática |
| `PUBLIC_BOOKING_URL` | Iframe de booking en `/schedule` | Muestra el `ContactForm` integrado |

## CI

GitHub Action en `.github/workflows/v2-check.yml` corre en cada push y PR que toque `v2/`: instala con pnpm, typechea los 3 paquetes, valida paridad i18n y hace `pnpm build`.
