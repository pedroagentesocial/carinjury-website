# @carinjury/api — deprecated for default deploy

> Las rutas activas viven en **`apps/web/src/pages/api/`** y se despliegan como
> Vercel Functions junto al web. Este paquete queda como **referencia / fallback**
> por si en el futuro se decide separar el back como servicio Node propio.

## Cuándo volver a usar este paquete

- Si los endpoints crecen mucho y se quiere un servicio Node dedicado (Render/Fly).
- Si se necesita estado en memoria que no encaje en serverless (cron jobs, websockets).
- Para desarrollo local sin Astro corriendo.

## Cómo correrlo localmente

```bash
pnpm --filter @carinjury/api dev   # arranca en :3001
```

Las rutas Hono son equivalentes a las Astro endpoints: `GET /health`,
`POST /contact`, `GET /reviews`. La lógica de negocio (`forwardLead`,
`getReviews`) está en **`apps/web/src/lib/server/`** — es la fuente de
verdad. Si reactivas este servicio, importa esa misma lib.
