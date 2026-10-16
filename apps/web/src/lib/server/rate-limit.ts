/**
 * In-memory rate limiter — protege endpoints contra bot floods.
 *
 * Esto es "best effort" en serverless: cada instancia (warm) tiene su mapa propio.
 * Para protección estricta a escala usar Vercel KV o Upstash Redis. Para clínica
 * con bajo tráfico esta heurística cubre el 99% de bot abuse.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const STORE = new Map<string, Entry>();

/**
 * Limita requests por clave (típicamente IP) dentro de una ventana.
 *
 * @param key  Identificador único (IP, fingerprint)
 * @param max  Requests permitidos en la ventana
 * @param windowMs  Duración de la ventana en milisegundos
 * @returns `true` si se permite, `false` si excedió el límite
 */
export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = STORE.get(key);

  if (!entry || now > entry.resetAt) {
    STORE.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}

/** Limpieza periódica de entries expirados — corre cada 5min */
if (typeof setInterval === 'function') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of STORE.entries()) {
      if (now > entry.resetAt) STORE.delete(key);
    }
  }, 5 * 60_000).unref?.();
}

/** Obtener IP del request (best effort behind proxies/CDN). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
