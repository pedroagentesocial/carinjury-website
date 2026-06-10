import type { Locale } from '@carinjury/shared';
import type { IconName } from '@components/ui/Icon';

/**
 * Place ID de Google Maps. Override por env `PUBLIC_GOOGLE_PLACE_ID`.
 */
const PLACE_ID =
  import.meta.env.PUBLIC_GOOGLE_PLACE_ID ?? 'ChIJx3lYes5jUocR1NQ4jGHsye8';

/**
 * URL pública del calendario GHL. Default = el calendario de la clínica.
 * Override con `PUBLIC_BOOKING_URL` si cambia.
 */
const BOOKING_URL =
  import.meta.env.PUBLIC_BOOKING_URL ??
  'https://api.leadconnectorhq.com/widget/booking/CnL8Bv0AP9Fdqw6xYZji';

/**
 * URL embed de Google Maps. Default = ubicación de la clínica en Taylorsville.
 * Override con `PUBLIC_MAP_EMBED_URL`.
 */
const MAP_EMBED_URL =
  import.meta.env.PUBLIC_MAP_EMBED_URL ??
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3025.8234567890123!2d-111.96241732440677!3d40.6621170713987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f17!3m3!1m2!1s0x87528b0c0c0c0c0c%3A0x0!2s2997%20W%204700%20S%2C%20Taylorsville%2C%20UT%2084129!5e0!3m2!1sen!2sus!4v1640995200000!5m2!1sen!2sus';

export const SITE = {
  name: 'Car Injury Clinic',
  shortName: 'CIC',
  url: 'https://carinjuryclinics.com',
  phone: {
    tel: '+13852428571',
    display: '385-242-8571',
    displayLong: '+1 (385) 242-8571',
  },
  email: 'info@carinjuryclinic.com',
  address: {
    street: '2997 W 4700 S',
    city: 'Taylorsville',
    region: 'UT',
    postalCode: '84129',
    country: 'US',
    full: '2997 W 4700 S, Taylorsville, UT 84129',
    geo: { lat: 40.6621170713987, lng: -111.96241732440677 },
  },
  mapsUrl: 'https://maps.app.goo.gl/76gxBm8r9supmSYR9',
  mapEmbedUrl: MAP_EMBED_URL,
  logo: '/images/logo.png',
  placeId: PLACE_ID,
  writeReviewUrl: 'https://g.page/r/Cb3y3_OWMs2IEAE/review',
  bookingUrl: BOOKING_URL,
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100090183003470',
    instagram: 'https://www.instagram.com/car.injuryclinic/',
    tiktok: 'https://www.tiktok.com/@car.injuryclinic',
    google: `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
  },
  /** Ciudades del condado de Salt Lake en las que damos servicio (areaServed schema + local SEO). */
  areasServed: [
    'Salt Lake City',
    'Taylorsville',
    'West Valley City',
    'West Jordan',
    'South Jordan',
    'Sandy',
    'Murray',
    'Midvale',
    'Kearns',
    'Cottonwood Heights',
    'Riverton',
    'Draper',
  ],
} as const;

/* Google verification / Search Console */
export const SEARCH_CONSOLE_VERIFICATION =
  import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? '';
export const BING_VERIFICATION = import.meta.env.PUBLIC_BING_SITE_VERIFICATION ?? '';

export interface NavLink {
  href: string;
  key: string;
  descKey?: string;
  /** Icono opcional para el dropdown desktop (si no, se infiere). */
  icon?: IconName;
}

export interface NavItem {
  key: string;
  href?: string;
  children?: NavLink[];
}

export function navLinks(locale: Locale): NavItem[] {
  const prefix = locale === 'en' ? '/en' : '';
  /* Herramientas: slug traducido por idioma. */
  const checklistHref =
    locale === 'en'
      ? '/en/tools/what-to-do-after-a-car-accident'
      : '/herramientas/que-hacer-despues-de-un-accidente';
  const caseHref =
    locale === 'en' ? '/en/tools/do-i-have-a-case' : '/herramientas/tengo-un-caso';

  return [
    { href: `${prefix || '/'}`, key: 'nav.home' },
    { href: `${prefix}/services`, key: 'nav.services' },
    { href: `${prefix}/lawyer-approved`, key: 'nav.legal_assistance' },
    { href: `${prefix}/aboutus`, key: 'nav.about' },
    { href: `${prefix}/blog`, key: 'nav.blog' },
    {
      key: 'nav.patients',
      children: [
        {
          href: `${prefix}/faq`,
          key: 'nav.frequent_questions',
          descKey: 'nav.frequent_questions_desc',
        },
        {
          href: checklistHref,
          key: 'nav.tool_checklist',
          descKey: 'nav.tool_checklist_desc',
          icon: 'check',
        },
        {
          href: caseHref,
          key: 'nav.tool_case',
          descKey: 'nav.tool_case_desc',
          icon: 'help',
        },
        {
          href: `${prefix}/patient-referral`,
          key: 'nav.form',
          descKey: 'nav.form_desc',
        },
      ],
    },
  ];
}

/**
 * Devuelve la URL equivalente para el locale destino.
 * Ejemplos:
 *   altLocaleHref('en', '/services')    → '/en/services'
 *   altLocaleHref('en', '/')            → '/en/'
 *   altLocaleHref('es', '/en/services') → '/services'
 *   altLocaleHref('es', '/en/')         → '/'
 */
export function altLocaleHref(locale: Locale, currentPath: string): string {
  const path = currentPath || '/';
  const isOnEn = path === '/en' || path.startsWith('/en/');

  if (locale === 'en') {
    if (isOnEn) return path;
    return path === '/' ? '/en/' : `/en${path}`;
  }
  // target = 'es' → quitar prefijo /en si lo tiene
  if (isOnEn) {
    const stripped = path.replace(/^\/en/, '');
    return stripped === '' ? '/' : stripped;
  }
  return path;
}
