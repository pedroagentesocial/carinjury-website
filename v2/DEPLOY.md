# Deploy a Vercel

El proyecto se despliega como un único proyecto Astro en Vercel. Las rutas
`/api/*` se sirven como Vercel Functions (Node 20), igual que cualquier
endpoint Astro en modo SSR.

## Primer deploy

1. **Importa el repo en Vercel** (`https://vercel.com/new`).
2. En el wizard de importación:
   - **Framework Preset**: Astro (auto-detecta)
   - **Root Directory**: `v2` (NO la raíz del repo)
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Output Directory**: deja por defecto (Astro lo maneja)
3. Pega las variables de entorno (ver sección abajo).
4. Deploy.

El `v2/vercel.json` ya tiene el `framework`, `buildCommand`, etc. configurados.

## Variables de entorno en Vercel

En **Settings → Environment Variables** pega:

| Variable | Valor | Entorno |
|---|---|---|
| `PUBLIC_SITE_URL` | `https://carinjuryclinics.com` | Production, Preview |
| `PUBLIC_BOOKING_URL` | URL del calendario GHL | Production, Preview |
| `FORM_WEBHOOK_URL` | URL del webhook Make/Zapier | Production |
| `GOOGLE_PLACES_API_KEY` | (cuando esté) | Production |
| `GOOGLE_PLACE_ID` | (cuando esté) | Production |

`PUBLIC_API_URL` se queda **vacía** — los /api/* viven en el mismo dominio.

## Dominio custom

En **Settings → Domains** agrega `carinjuryclinics.com` y `www.carinjuryclinics.com`.
Vercel te pedirá apuntar el DNS (A/AAAA o CNAME) — la config exacta aparece allí.

---

# Integraciones

## 1. GHL (GoHighLevel) — calendario en `/schedule`

1. En GHL: **Calendars → tu calendario → Share Link → Embed**.
2. Copia la URL del **Inline iframe** (no el código HTML completo, solo la URL).
   Formato típico:
   - `https://api.leadconnectorhq.com/widget/booking/<CALENDAR_ID>`
   - `https://link.tu-marca.com/widget/booking/<CALENDAR_ID>`
3. Pégala en `PUBLIC_BOOKING_URL` (Vercel env) y redeploy.
4. El componente `GhlBooking.tsx` carga el script `link.msgsndr.com/js/form_embed.js`
   automáticamente, que escucha postMessage para auto-resize cuando el calendario
   navega entre pasos (selección de día → hora → datos).

**Verificación**: visita `/schedule`. Si la URL es válida verás el calendario;
si está vacía verás el ContactForm como fallback.

## 2. Make.com / Zapier — webhook de formulario

### Make.com

1. Crea un nuevo escenario.
2. Primer módulo: **Webhooks → Custom webhook → Add → Receive a JSON**.
3. Copia la URL `https://hook.us1.make.com/...` que te da Make.
4. Pégala en `FORM_WEBHOOK_URL` (Vercel env).
5. Encadena los módulos que quieras (Sheets, Email, CRM, Slack, etc.).

### Zapier

1. Nuevo Zap → Trigger: **Webhooks by Zapier → Catch Hook**.
2. Copia la URL `https://hooks.zapier.com/hooks/catch/...`.
3. Pégala en `FORM_WEBHOOK_URL`.
4. Mapea los campos del payload a la acción que toque.

### Payload que recibirás

```json
{
  "id": "uuid-v4",
  "name": "Juan Pérez",
  "phone": "+1 385 555 1212",
  "email": "j@example.com",
  "message": "Tuve un accidente ayer en la I-15...",
  "language": "es",
  "ts": "2026-05-11T18:30:00.000Z"
}
```

`email` y `message` pueden ser `null` (campos opcionales en el form).

## 3. Google Places — reviews reales en `/api/reviews`

1. **Crear API key**:
   - Ve a https://console.cloud.google.com
   - **APIs & Services → Library** → busca **Places API** y habilítala.
   - **APIs & Services → Credentials → Create credentials → API key**.
   - **Restringe** la key por *Application restriction → IP addresses* (servidor de Vercel) y por *API restriction → Places API*. Importante: NO la dejes sin restricciones.

2. **Encontrar el Place ID**:
   - https://developers.google.com/maps/documentation/places/web-service/place-id
   - Busca "Car Injury Clinic" en el widget y copia el ID (formato `ChIJ...`).

3. **Pega en Vercel env**:
   - `GOOGLE_PLACES_API_KEY` = la key
   - `GOOGLE_PLACE_ID` = el Place ID

4. **Verifica**: `curl https://carinjuryclinics.com/api/reviews` — `source: 'google'` aparecerá en los items.

Mientras no estén seteadas, el endpoint devuelve la seed (6 testimonios). El
componente `Testimonials.tsx` los consume y muestra rating promedio dinámico.

---

# Build local en Windows (nota)

Si corres `pnpm build` en Windows, verás un warning final:

```
EPERM: operation not permitted, symlink ... @astrojs/vercel
```

El **build sí funciona** (Vite genera `dist/client` y `dist/server`, los
pages se prerenderean OK). Lo que falla es el último paso del adapter de
Vercel: copiar las deps al directorio de la función serverless. Windows
requiere permisos de admin (o "Developer Mode" activado) para crear symlinks.

**No afecta deploy a Vercel** porque Vercel construye en Linux. El GitHub
Action también corre en Linux (`ubuntu-latest`) y no tiene este problema.

Para validar local en Windows usa el dev server (`pnpm dev`) y los smoke tests
contra él. Para forzar build real:

1. Activar Developer Mode en Windows (Settings → For Developers → Developer Mode).
2. Correr la terminal como Administrador.
3. O push a una branch preview de Vercel y deja que Vercel haga el build.

---

# Local dev

```bash
cd v2
pnpm install
pnpm dev              # arranca solo web en :4321 (incluye los /api/*)
```

Para correr el back separado (Hono en :3001) — útil si quieres aislarlo:

```bash
pnpm dev:all          # web :4321 + api :3001 en paralelo
```

# Validaciones antes de merge

```bash
pnpm typecheck        # los 3 paquetes
pnpm check-i18n       # paridad es ↔ en y duplicados
pnpm build            # genera el output Vercel
```

El GitHub Action `.github/workflows/v2-check.yml` corre estos 3 en cada PR.
