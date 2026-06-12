/**
 * SEO module — JSON-LD schema builders, per-page meta helpers and keyword targeting.
 *
 * Strategy:
 *  - Local SEO heavy: Chiropractor + MedicalBusiness types, AggregateRating, areaServed
 *  - Rich snippets for FAQ, Breadcrumbs, Services, Reviews
 *  - hreflang via Astro i18n
 *  - WebSite schema with SearchAction (Google sitelinks searchbox)
 *  - Organization schema linked across pages
 */
import type { Locale } from '@carinjury/shared';
import { SITE } from './site';

const SITE_URL = SITE.url;

/* ------------------------- Shared helpers ------------------------- */

export function absoluteUrl(path: string, siteUrl: string = SITE_URL): string {
  if (path.startsWith('http')) return path;
  return new URL(path, siteUrl).toString();
}

export function ensureHttps(url: string): string {
  return url.startsWith('https://') ? url : `https://${url.replace(/^http:\/\//, '')}`;
}

/* ------------------------- Per-page SEO copy ------------------------- */

export interface PageMeta {
  title: string;
  description: string;
  /** Comma-separated keywords; opcional pero útil para Bing + audit tools */
  keywords?: string;
}

/**
 * Local SEO títulos/descripciones optimizados para "clínica de quiropráctica Utah".
 * Cada página tiene su keyword principal + variantes geográficas.
 */
export const PAGE_META: Record<string, Record<Locale, PageMeta>> = {
  home: {
    es: {
      title: 'Clínica de Quiropráctica en Salt Lake City | Accidentes de Auto · Car Injury Clinic',
      description:
        'Clínica quiropráctica especializada en accidentes de auto en Salt Lake City y Utah. Citas el mismo día, transporte gratis, apoyo legal incluido. Atención bilingüe ES/EN/PT.',
      keywords:
        'clínica de quiropráctica Utah, quiropráctico Salt Lake City, accidentes de auto Utah, chiropractor Salt Lake City, clínica de accidentes, lesiones por accidente, dolor de cuello, dolor de espalda',
    },
    en: {
      title: 'Top-Rated Chiropractic Clinic in Salt Lake City, Utah | Car Injury Clinic',
      description:
        'Specialized car accident chiropractic clinic in Salt Lake City and Utah. Same-day appointments, free transportation, legal support included. Bilingual care ES/EN/PT.',
      keywords:
        'chiropractic clinic Utah, chiropractor Salt Lake City, car accident clinic, accident injury chiropractor, neck pain, back pain, whiplash, Utah chiropractor',
    },
  },
  services: {
    es: {
      title: 'Servicios de Quiropráctica y Rehabilitación tras Accidentes · Salt Lake City',
      description:
        'Quiropráctica, terapia física, masaje, rayos X digitales, MRI y manejo del dolor para víctimas de accidentes de auto. 15 servicios en Salt Lake City, Utah.',
      keywords:
        'servicios quiropráctica Utah, terapia física Salt Lake City, rayos X mismo día, masaje terapéutico, manejo del dolor, MRI accidentes auto, rehabilitación lesiones',
    },
    en: {
      title: 'Chiropractic & Rehab Services After Car Accidents · Salt Lake City',
      description:
        'Chiropractic, physical therapy, massage, digital X-Ray, MRI and pain management for car accident victims. 15 services in Salt Lake City, Utah.',
      keywords:
        'chiropractic services Utah, physical therapy Salt Lake City, same-day X-Ray, massage therapy, pain management, MRI car accident, injury rehabilitation',
    },
  },
  'lawyer-approved': {
    es: {
      title: 'Apoyo Legal para Víctimas de Accidentes en Utah | Sin Ganar, Sin Pagar',
      description:
        'Red de abogados especialistas en accidentes de auto en Utah. Coordinación médico-legal completa. Sin pagos por adelantado. $25M+ recuperado para clientes.',
      keywords:
        'abogado accidentes auto Utah, abogado lesiones Salt Lake City, reclamo seguro accidente, no win no fee Utah, asistencia legal accidente',
    },
    en: {
      title: 'Legal Support for Car Accident Victims in Utah | No Win, No Fee',
      description:
        'Network of car accident attorneys in Utah. Full medical-legal coordination. No upfront fees. $25M+ recovered for clients.',
      keywords:
        'car accident lawyer Utah, personal injury attorney Salt Lake City, insurance claim accident, no win no fee Utah, accident legal help',
    },
  },
  aboutus: {
    es: {
      title: 'Nuestro Equipo de Quiroprácticos Certificados en Utah · Car Injury Clinic',
      description:
        'Conoce a los doctores quiroprácticos certificados de Car Injury Clinic. 30+ años de experiencia tratando lesiones de accidentes en Salt Lake City.',
      keywords:
        'quiroprácticos Utah, doctores quiropráctica Salt Lake City, equipo médico accidentes, especialistas lesiones',
    },
    en: {
      title: 'Our Certified Chiropractic Team in Utah · Car Injury Clinic',
      description:
        'Meet the certified chiropractic doctors at Car Injury Clinic. 30+ years of experience treating accident injuries in Salt Lake City.',
      keywords:
        'chiropractors Utah, chiropractic doctors Salt Lake City, accident medical team, injury specialists',
    },
  },
  faq: {
    es: {
      title: 'Preguntas Frecuentes sobre Accidentes de Auto en Utah · FAQ',
      description:
        'Respuestas a preguntas frecuentes sobre accidentes de auto, lesiones personales y reclamos de seguro en Utah. ¿Cuánto tiempo tengo para demandar? ¿Cuánto vale mi caso? Más.',
      keywords:
        'preguntas accidente auto Utah, FAQ lesiones personales, plazo demanda accidente, valor caso accidente, reclamo seguro auto',
    },
    en: {
      title: 'Frequently Asked Questions About Car Accidents in Utah · FAQ',
      description:
        'Answers to common questions about car accidents, personal injury and insurance claims in Utah. How long do I have to sue? What is my case worth? More.',
      keywords:
        'car accident FAQ Utah, personal injury questions, statute of limitations accident, case value, auto insurance claim',
    },
  },
  location: {
    es: {
      title: 'Ubicación de la Clínica en Taylorsville, UT · Car Injury Clinic',
      description:
        'Visítanos en 2997 W 4700 S, Taylorsville, UT 84129. Clínica quiropráctica de accidentes que da servicio a Salt Lake City y todo el condado. Mapa, horario, cómo llegar y estacionamiento.',
      keywords:
        'quiropráctico Taylorsville, clínica de accidentes Taylorsville, quiropráctico cerca de mí, clínica de accidentes cerca de mí, dirección Car Injury Clinic, quiropráctico West Valley City, quiropráctico Salt Lake City',
    },
    en: {
      title: 'Clinic Location in Taylorsville, UT · Car Injury Clinic',
      description:
        'Visit us at 2997 W 4700 S, Taylorsville, UT 84129. Car accident chiropractic clinic serving Salt Lake City and the whole county. Map, hours, directions and parking.',
      keywords:
        'chiropractor Taylorsville, accident clinic Taylorsville, chiropractor near me, accident clinic near me, Car Injury Clinic address, chiropractor West Valley City, chiropractor Salt Lake City',
    },
  },
  blog: {
    es: {
      title: 'Blog · Recuperación de Accidentes y Lesiones | Car Injury Clinic',
      description:
        'Guías sobre lesiones de accidentes de auto, recuperación, síntomas y reclamos de seguro en Utah. Información clara de nuestros quiroprácticos en Taylorsville.',
      keywords:
        'blog accidentes auto, latigazo cervical, lesiones accidente síntomas, recuperación accidente, reclamo seguro Utah, dolor de espalda accidente',
    },
    en: {
      title: 'Blog · Accident Recovery & Injury Guides | Car Injury Clinic',
      description:
        'Guides on car accident injuries, recovery, symptoms and insurance claims in Utah. Clear information from our Taylorsville chiropractors.',
      keywords:
        'car accident blog, whiplash, accident injury symptoms, accident recovery, insurance claim Utah, back pain after accident',
    },
  },
  schedule: {
    es: {
      title: 'Agendar Cita en Línea | Car Injury Clinic · Salt Lake City',
      description:
        'Agenda tu evaluación quiropráctica gratuita en línea. Citas el mismo día disponibles en Salt Lake City, Utah. Sin compromiso.',
      keywords:
        'agendar cita quiropráctico Utah, cita mismo día Salt Lake City, evaluación gratis quiropráctica',
    },
    en: {
      title: 'Book Online | Car Injury Clinic · Salt Lake City',
      description:
        'Schedule your free chiropractic evaluation online. Same-day appointments available in Salt Lake City, Utah. No commitment.',
      keywords:
        'book chiropractor Utah, same day appointment Salt Lake City, free chiropractic evaluation',
    },
  },
  form: {
    es: {
      title: 'Formulario de Contacto · Evaluación Gratuita | Car Injury Clinic',
      description:
        'Cuéntanos sobre tu accidente. Te respondemos en menos de 24h con un plan personalizado. Evaluación gratis, sin compromiso.',
      keywords: 'formulario contacto accidente, evaluación gratis Utah, consulta accidente auto',
    },
    en: {
      title: 'Contact Form · Free Evaluation | Car Injury Clinic',
      description:
        'Tell us about your accident. We reply within 24h with a personalized plan. Free evaluation, no commitment.',
      keywords: 'contact form accident, free evaluation Utah, accident consultation',
    },
  },
  'patient-referral': {
    es: {
      title: 'Referencia de Paciente · Formulario Completo | Car Injury Clinic',
      description:
        'Formulario completo de referencia para nuevos pacientes víctimas de accidente. Datos personales, dirección, incidente, seguro y consentimiento.',
      keywords: 'referencia paciente accidente, formulario médico Utah, registro paciente nuevo',
    },
    en: {
      title: 'Patient Referral · Complete Form | Car Injury Clinic',
      description:
        'Complete referral form for new accident-victim patients. Personal info, address, incident, insurance and consent.',
      keywords: 'patient referral accident, medical intake form Utah, new patient registration',
    },
  },
  privacy: {
    es: {
      title: 'Política de Privacidad · Car Injury Clinic',
      description:
        'Cómo Car Injury Clinic protege y maneja tu información personal. Cumplimiento HIPAA y mejores prácticas de privacidad.',
    },
    en: {
      title: 'Privacy Policy · Car Injury Clinic',
      description:
        'How Car Injury Clinic protects and handles your personal information. HIPAA compliance and privacy best practices.',
    },
  },
  'thank-you': {
    es: {
      title: 'Gracias por contactarnos · Car Injury Clinic',
      description: 'Recibimos tu mensaje. Te respondemos en menos de 24h con un plan personalizado.',
    },
    en: {
      title: 'Thank you for contacting us · Car Injury Clinic',
      description: 'We received your message. We will reply within 24h with a personalized plan.',
    },
  },
};

export function getPageMeta(key: string, locale: Locale): PageMeta {
  return (
    PAGE_META[key]?.[locale] ?? {
      title: 'Car Injury Clinic',
      description: 'Atención médica y apoyo legal para víctimas de accidentes de auto en Utah.',
    }
  );
}

/* ------------------------- Schema builders ------------------------- */

/**
 * LocalBusiness completa — incluye Chiropractor + MedicalBusiness types, areaServed,
 * services (hasOfferCatalog), reviews, aggregate rating y horario.
 */
export function buildLocalBusinessSchema(opts: {
  ogImage: string;
  locale: Locale;
  aggregateRating?: { value: number; count: number };
  reviews?: Array<{ author: string; rating: number; text: string; date: string }>;
}) {
  const { ogImage, locale, aggregateRating, reviews } = opts;
  const desc = locale === 'en'
    ? 'Chiropractic clinic in Taylorsville, UT serving the greater Salt Lake City area, specialized in car accident injuries. Same-day appointments, free transport, included legal support, bilingual care.'
    : 'Clínica quiropráctica en Taylorsville, UT que da servicio a toda el área de Salt Lake City, especializada en lesiones por accidentes de auto. Citas el mismo día, transporte gratis, apoyo legal incluido, atención bilingüe.';

  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'Chiropractor'],
    '@id': `${SITE_URL}/#business`,
    name: SITE.name,
    legalName: 'Car Injury Clinic LLC',
    url: SITE_URL,
    telephone: SITE.phone.tel,
    email: SITE.email,
    image: [absoluteUrl(SITE.logo), ogImage],
    logo: absoluteUrl(SITE.logo),
    description: desc,
    priceRange: '$$',
    paymentAccepted: ['Insurance', 'Cash', 'Credit Card'],
    currenciesAccepted: 'USD',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.address.geo.lat,
      longitude: SITE.address.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '11:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.google],
    areaServed: [
      { '@type': 'State', name: 'Utah' },
      ...SITE.areasServed.map((city) => ({ '@type': 'City' as const, name: city })),
    ],
    medicalSpecialty: ['Chiropractic', 'PainManagement', 'PhysicalTherapy', 'Rehabilitation'],
    knowsLanguage: ['Spanish', 'English', 'Portuguese'],
    hasMap: SITE.mapsUrl,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'GooglePlaceId',
      value: SITE.placeId,
    },
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.value.toFixed(1),
        reviewCount: aggregateRating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews && reviews.length > 0 && {
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
        },
        reviewBody: r.text,
        datePublished: r.date,
      })),
    }),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'en' ? 'Car accident treatment services' : 'Servicios de tratamiento de accidentes',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: locale === 'en' ? 'Chiropractic & Rehabilitation' : 'Quiropráctica y Rehabilitación',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Chiropractic adjustment' : 'Ajuste quiropráctico',
                procedureType: 'Therapeutic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Physical therapy' : 'Terapia física',
                procedureType: 'Therapeutic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Therapeutic massage' : 'Masaje terapéutico',
                procedureType: 'Therapeutic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'TENS therapy' : 'Terapia TENS',
                procedureType: 'Therapeutic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Hot/Cold therapy' : 'Terapia calor/frío',
                procedureType: 'Therapeutic',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: locale === 'en' ? 'Diagnostic imaging' : 'Imagen diagnóstica',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Digital X-Ray' : 'Rayos X digitales',
                procedureType: 'Diagnostic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'MRI coordination' : 'Coordinación de MRI',
                procedureType: 'Diagnostic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Concussion evaluation' : 'Evaluación de concusión',
                procedureType: 'Diagnostic',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: locale === 'en' ? 'Pain management' : 'Manejo del dolor',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Pain management consultation' : 'Consulta de manejo del dolor',
                procedureType: 'Therapeutic',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: locale === 'en' ? 'Surgical consultation referral' : 'Referencia para consulta quirúrgica',
                procedureType: 'Diagnostic',
              },
            },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: locale === 'en' ? 'Patient support' : 'Apoyo al paciente',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: locale === 'en' ? 'Free patient transportation' : 'Transporte gratis para pacientes',
                serviceType: 'Transportation',
              },
              price: '0',
              priceCurrency: 'USD',
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: locale === 'en' ? 'Legal coordination with attorneys' : 'Coordinación legal con abogados',
                serviceType: 'LegalCoordination',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: locale === 'en' ? 'Trilingual care (ES/EN/PT)' : 'Atención trilingüe (ES/EN/PT)',
                serviceType: 'LanguageSupport',
              },
            },
          ],
        },
      ],
    },
  };
}

/**
 * Schema por landing de ciudad — MedicalClinic + Chiropractor con el NAP
 * idéntico al del negocio principal, pero con `areaServed` apuntando a la
 * ciudad y un `@id` propio de la página (no pisa al `#business` global).
 * Refuerza la entidad local para búsquedas "[servicio] en [ciudad]".
 */
export function buildCityClinicSchema(opts: {
  url: string;
  cityName: string;
  description: string;
  geo?: { lat: number; lng: number };
}) {
  const { url, cityName, description, geo } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'Chiropractor'],
    '@id': `${absoluteUrl(url)}#clinic`,
    name: `${SITE.name} — ${cityName}`,
    parentOrganization: { '@id': `${SITE_URL}/#business` },
    url: absoluteUrl(url),
    telephone: SITE.phone.tel,
    email: SITE.email,
    logo: absoluteUrl(SITE.logo),
    description,
    priceRange: '$$',
    paymentAccepted: ['Insurance', 'Cash', 'Credit Card'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.address.geo.lat,
      longitude: SITE.address.geo.lng,
    },
    hasMap: SITE.mapsUrl,
    medicalSpecialty: ['Chiropractic', 'PainManagement', 'PhysicalTherapy', 'Rehabilitation'],
    knowsLanguage: ['Spanish', 'English', 'Portuguese'],
    areaServed: {
      '@type': 'City',
      name: cityName,
      ...(geo && {
        geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
      }),
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Salt Lake County, Utah' },
    },
  };
}

/**
 * WebSite schema con SearchAction → activa el sitelinks searchbox en Google.
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.name,
    publisher: { '@id': `${SITE_URL}/#business` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?s={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Organization (umbrella). Combina con LocalBusiness por @id.
 */
export function buildOrganizationSchema(ogImage: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE.name,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SITE.logo),
    },
    image: ogImage,
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.google],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone.tel,
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: ['Spanish', 'English', 'Portuguese'],
    },
  };
}

/**
 * BreadcrumbList: pasalo lista de tramos `{ name, url }`.
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

/**
 * FAQPage schema — pasale array de `{ question, answer }`.
 * Activa rich snippet de FAQ en Google.
 *
 * `speakableSelectors` (opcional): array de CSS selectors que apuntan al texto
 * de respuestas en el HTML. Activa el SpeakableSpecification para Google
 * Assistant / voice search. Pasalo solo si los selectores realmente existen
 * en la página renderizada.
 */
export function buildFAQSchema(
  qa: Array<{ question: string; answer: string }>,
  speakableSelectors?: string[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(speakableSelectors && speakableSelectors.length > 0 && {
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: speakableSelectors,
      },
    }),
    mainEntity: qa.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  };
}

/**
 * HowTo schema — guía paso a paso. Útil para "qué hacer tras un accidente".
 *
 * REQUISITO de Google: los pasos deben ser visibles en el HTML de la página,
 * no solo en JSON-LD. Si solo emites el schema sin contenido visible
 * correspondiente, Google puede ignorarlo o aplicar penalización.
 */
export function buildHowToSchema(opts: {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, ej: "PT1H"
  steps: Array<{ name: string; text: string; url?: string; image?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime && { totalTime: opts.totalTime }),
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url && { url: absoluteUrl(s.url) }),
      ...(s.image && { image: absoluteUrl(s.image) }),
    })),
  };
}

/**
 * BlogPosting schema — para cada artículo del blog. Linkea autor/publisher
 * a la organización (E-E-A-T) y es elegible para rich results de artículo.
 */
export function buildArticleSchema(opts: {
  url: string;
  headline: string;
  description: string;
  datePublished: string; // ISO 8601
  dateModified?: string; // ISO 8601
  image?: string;
  author?: string;
  keywords?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(opts.url) },
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    ...(opts.image && { image: absoluteUrl(opts.image) }),
    ...(opts.keywords && { keywords: opts.keywords }),
    author: {
      '@type': 'Organization',
      name: opts.author ?? SITE.name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo) },
    },
    inLanguage: opts.url.includes('/en/') ? 'en' : 'es',
  };
}

/**
 * Service schema — para cada servicio del catálogo (linkeado al business).
 */
export function buildServicesSchema(services: Array<{ name: string; description: string; url: string }>) {
  return services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: s.name,
    description: s.description,
    url: absoluteUrl(s.url),
    provider: { '@id': `${SITE_URL}/#business` },
    procedureType: 'Therapeutic',
  }));
}

/**
 * Person schema para cada doctor — para el about us (E-E-A-T signal).
 */
export function buildDoctorSchema(doc: {
  name: string;
  title: string;
  specialty: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Physician', 'Person'],
    name: doc.name,
    jobTitle: doc.title,
    medicalSpecialty: doc.specialty,
    ...(doc.image && { image: absoluteUrl(doc.image) }),
    worksFor: { '@id': `${SITE_URL}/#business` },
  };
}

/**
 * ContactPage / AboutPage / etc.
 */
export function buildContactPageSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: absoluteUrl(url),
    mainEntity: { '@id': `${SITE_URL}/#business` },
  };
}

/**
 * MedicalWebPage — page-level schema más específico que WebPage para
 * contenido médico/clínico. Útil para landings de servicios y PPC ads.
 */
export function buildMedicalWebPageSchema(opts: {
  url: string;
  name: string;
  description: string;
  specialty?: 'Chiropractic' | 'PainManagement' | 'PhysicalTherapy' | 'Rehabilitation';
  audience?: 'Patient' | 'Clinician';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: absoluteUrl(opts.url),
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#business` },
    ...(opts.specialty && { specialty: opts.specialty }),
    ...(opts.audience && { medicalAudience: opts.audience }),
  };
}
