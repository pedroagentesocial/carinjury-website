import type { APIRoute } from 'astro';
import { SITE } from '@lib/site';

/**
 * Redirección server-only a WhatsApp.
 *
 * El número de WhatsApp es el mismo de la clínica (`SITE.phone.tel`). La
 * resolución pasa siempre por el servidor: el botón solo enlaza a
 * `/api/whatsapp?...` y este endpoint hace un 302 a `wa.me/<número>`, sin
 * exponer el número en el bundle del cliente.
 *
 * `WHATSAPP_NUMBER` (env, sin prefijo PUBLIC_) es un override opcional por si
 * en el futuro se usa una línea de WhatsApp dedicada distinta al teléfono.
 *
 * Params opcionales:
 *   - `city`  → nombre de ciudad para personalizar el mensaje pre-rellenado.
 *   - `lang`  → 'es' | 'en' (idioma del mensaje). Default 'es'.
 *   - `ctx`   → 'help' para el botón flotante global (mensaje corto de ayuda).
 */
export const prerender = false;

/** Solo dígitos, formato internacional sin "+" (lo que espera wa.me). */
function normalizeNumber(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

/** Mensaje corto del FAB flotante global. */
const HELP_MSG: Record<'es' | 'en', string> = {
  es: 'Hola, tuve un accidente y necesito ayuda',
  en: 'Hi, I was in an accident and need help',
};

const PREFILL: Record<'es' | 'en', (city: string | null) => string> = {
  es: (city) =>
    city
      ? `Hola, tuve un accidente de auto cerca de ${city} y quiero más información sobre una evaluación.`
      : 'Hola, tuve un accidente de auto y quiero más información sobre una evaluación.',
  en: (city) =>
    city
      ? `Hi, I had a car accident near ${city} and I'd like more information about an evaluation.`
      : "Hi, I had a car accident and I'd like more information about an evaluation.",
};

export const GET: APIRoute = ({ url }) => {
  const number = normalizeNumber(
    import.meta.env.WHATSAPP_NUMBER ?? SITE.phone.tel,
  );

  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'es';
  const city = url.searchParams.get('city');
  const ctx = url.searchParams.get('ctx');
  const message = ctx === 'help' ? HELP_MSG[lang] : PREFILL[lang](city);
  const text = encodeURIComponent(message);

  const target = `https://wa.me/${number}?text=${text}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      /* No cachear: el destino depende de env + params y no debe quedar en CDN. */
      'Cache-Control': 'no-store',
    },
  });
};
