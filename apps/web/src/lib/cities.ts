import type { Locale } from '@carinjury/shared';

/**
 * Landing pages locales por ciudad (SEO local) — fuente única de verdad.
 *
 * Cada ciudad vive en `CITIES` y la ruta dinámica `/locations/[city]`
 * (+ `/en/locations/[city]`) la consume. Para agregar una ciudad nueva:
 * añade un registro a `CITIES` con su slug, datos estructurados (carreteras,
 * hospitales, distancia) y la prosa única por idioma. NO se toca ningún
 * componente ni ruta.
 *
 * REGLA ANTI-DOORWAY: la prosa (`intro`, `faqs`, `directions`) debe ser REAL y
 * distinta por ciudad. Los datos no verificables se marcan como
 * `{{VERIFICAR: ...}}` para completarlos con fuente o con el abogado — nunca se
 * inventan cifras de población, accidentes, seguros ni plazos legales.
 */

/** Hospital / sala de emergencias de referencia cercana a la ciudad. */
export interface CityHospital {
  name: string;
  /** Nota breve bilingüe (ubicación o tipo de servicio). Opcional. */
  note?: { es: string; en: string };
}

/** Prosa única por idioma. */
export interface CityCopy {
  /** <title> único (≤ ~60 car. recomendado). */
  metaTitle: string;
  /** meta description única (≤ ~155 car.). */
  metaDescription: string;
  /** keywords (coma-separadas) — Bing + auditores. */
  keywords: string;
  /** H1 del hero: "[Servicio] en [Ciudad], UT". */
  h1: string;
  /** Subtítulo del hero. */
  heroSubtitle: string;
  /** Eyebrow del hero (ej. "West Valley City, UT · Condado de Salt Lake"). */
  eyebrow: string;
  /** 2-3 párrafos ÚNICOS de la ciudad (comunidad, carreteras, cercanía). */
  intro: string[];
  /** Frase que introduce los corredores de tráfico (antes de la lista). */
  corridorsLead: string;
  /** Frase que introduce los hospitales de referencia. */
  hospitalsLead: string;
  /** Cómo llegar a la clínica desde la ciudad (texto). */
  directions: string;
  /** FAQ específica de la ciudad (4-6) con marcado FAQPage. */
  faqs: Array<{ question: string; answer: string }>;
}

export interface CityData {
  /** Slug de URL — IDÉNTICO en es/en (hreflang automático por swap de prefijo). */
  slug: string;
  /** Nombre propio de la ciudad (igual en ambos idiomas). */
  name: string;
  /** Imagen del hero en /public (renombrar al reemplazar — caché immutable). */
  heroImage: string;
  heroImageAlt: { es: string; en: string };
  /** Coordenadas del centro de la ciudad (para geo del schema por-ciudad). */
  geo: { lat: number; lng: number };
  /** Carreteras/corredores principales (nombres propios, iguales en ambos idiomas). */
  corridors: string[];
  /** Hospitales / ER de referencia cercanos. */
  hospitals: CityHospital[];
  /** Distancia/tiempo aproximado a la clínica de Taylorsville. */
  distance: { miles: string; minutes: string };
  es: CityCopy;
  en: CityCopy;
}

/* ===========================================================================
   WEST VALLEY CITY  ·  Salt Lake County
   Fuentes (verificadas 2026-06):
   - Condado / 2.ª ciudad más grande de Utah / población latina:
     https://en.wikipedia.org/wiki/West_Valley_City,_Utah
     https://www.wvc-ut.gov/761/Population-by-Race-Ethnicity
     https://worldpopulationreview.com/us-cities/utah/west-valley-city
     (West Valley City tiene la mayor población hispana del estado; las fuentes
      varían entre ~39% y ~43%, por eso el % exacto va como VERIFICAR.)
   - Carreteras (I-215, SR-201 "21st South Freeway", Bangerter Hwy/SR-154,
     Redwood Rd/SR-68, 3500 South/SR-171, Mountain View Corridor):
     https://en.wikipedia.org/wiki/Utah_State_Route_201
     https://en.wikipedia.org/wiki/Utah_State_Route_154
     https://www.wvc-ut.gov/2178/General-Plan---Transportation
   - Hospitales: Holy Cross Hospital – West Valley (ex Jordan Valley Medical
     Center West Valley Campus, ER de 25 camas):
     https://en.wikipedia.org/wiki/Holy_Cross_Hospital_-_Jordan_Valley_West
     Pioneer Valley Hospital (Pioneer Pkwy, West Valley City, ER):
     https://www.healthgrades.com/group-directory/ut-utah/west-valley-city/pioneer-valley-hospital-xtscsd
   - Distancia a Taylorsville (~6 mi / ~12 min city-to-city, aprox.):
     https://www.travelmath.com/driving-time/from/West+Valley+City,+UT/to/Taylorsville,+UT
   =========================================================================== */
const westValleyCity: CityData = {
  slug: 'west-valley-city',
  name: 'West Valley City',
  heroImage: '/images/medical-care.webp',
  heroImageAlt: {
    es: 'Atención quiropráctica de accidentes para residentes de West Valley City, UT',
    en: 'Car accident chiropractic care for West Valley City, UT residents',
  },
  // Centro aproximado de West Valley City.
  geo: { lat: 40.6916, lng: -111.9931 },
  corridors: [
    'I-215',
    'SR-201 (21st South Freeway)',
    'Bangerter Highway (SR-154)',
    'Redwood Road (SR-68)',
    '3500 South (SR-171)',
    'Mountain View Corridor',
  ],
  hospitals: [
    {
      name: 'Holy Cross Hospital – West Valley',
      note: {
        es: 'Sala de emergencias en West Valley City (antes Jordan Valley Medical Center, West Valley Campus).',
        en: 'Emergency room in West Valley City (formerly Jordan Valley Medical Center, West Valley Campus).',
      },
    },
    {
      name: 'Pioneer Valley Hospital',
      note: {
        es: 'Hospital con sala de emergencias en West Valley City, sobre Pioneer Pkwy.',
        en: 'Hospital with an emergency room in West Valley City, on Pioneer Pkwy.',
      },
    },
  ],
  distance: { miles: '6', minutes: '12' },
  es: {
    metaTitle: 'Clínica de Accidentes de Auto en West Valley City, UT · Car Injury Clinic',
    metaDescription:
      'Clínica quiropráctica de accidentes de auto para West Valley City, UT. Atención bilingüe, citas el mismo día, transporte gratis y apoyo legal — a minutos por la SR-201 y la I-215.',
    keywords:
      'quiropráctico West Valley City, clínica de accidentes West Valley City, accidente de auto West Valley City UT, quiropráctico cerca de mí, lesiones por accidente, dolor de cuello, latigazo cervical',
    h1: 'Clínica de accidentes de auto en West Valley City, UT',
    heroSubtitle:
      'Atención quiropráctica bilingüe tras un accidente para la comunidad de West Valley City. Citas el mismo día, transporte gratis y orientación legal — a pocos minutos por la SR-201 y la I-215.',
    eyebrow: 'West Valley City, UT · Condado de Salt Lake',
    intro: [
      'West Valley City es la segunda ciudad más grande de Utah y uno de los corazones de la comunidad latina del condado de Salt Lake. En Car Injury Clinic atendemos en español y en inglés, para que después de un accidente puedas explicar lo que te duele sin barreras de idioma y entender cada paso de tu tratamiento.',
      'El tráfico de West Valley City se concentra en corredores rápidos como la SR-201 (21st South Freeway), la I-215 y Bangerter Highway, además de arterias muy transitadas como Redwood Road y 3500 South. Son vías de alta velocidad y mucho volumen donde las colisiones por alcance y los choques laterales son comunes, y donde lesiones como el latigazo cervical aparecen incluso a baja velocidad.',
      'Nuestra clínica está en Taylorsville, justo al lado de West Valley City: aproximadamente 6 millas, unos 10 a 15 minutos según el tráfico. Si no tienes cómo llegar, coordinamos transporte gratis para tus citas.',
    ],
    corridorsLead:
      'Atendemos lesiones de accidentes ocurridos en los principales corredores de West Valley City:',
    hospitalsLead:
      'Si fue una emergencia, primero ve a la sala de emergencias más cercana. Después, nosotros damos seguimiento a tu recuperación:',
    directions:
      'Desde West Valley City, toma la SR-201 o la I-215 en dirección a Taylorsville y sal hacia 4700 South. Estamos en 2997 W 4700 S, Taylorsville, UT 84129. Son unos 10 a 15 minutos de manejo según el tráfico, y hay estacionamiento en el lugar.',
    faqs: [
      {
        question: '¿Atienden a pacientes de West Valley City?',
        answer:
          'Sí. Muchos de nuestros pacientes vienen de West Valley City. Nuestra clínica está en Taylorsville, a pocos minutos por la SR-201 o la I-215, y ofrecemos atención en español e inglés.',
      },
      {
        question: '¿Qué tan lejos está la clínica desde West Valley City?',
        answer:
          'Estamos en Taylorsville, a aproximadamente 6 millas (unos 10 a 15 minutos en auto según el tráfico). Si no tienes transporte, coordinamos transporte gratis para tus citas.',
      },
      {
        question: 'Tuve un accidente en la SR-201 o la I-215, ¿qué hago?',
        answer:
          'Si hay una emergencia, llama al 911 o ve a la sala de emergencias más cercana. Cuando estés estable, agenda una evaluación con nosotros: revisamos tus lesiones, documentamos todo para tu reclamo y empezamos el tratamiento. Atendemos el mismo día.',
      },
      {
        question: '¿Hablan español en la clínica?',
        answer:
          'Sí. Nuestro equipo es bilingüe (español e inglés), algo importante para la gran comunidad latina de West Valley City. Te explicamos tu diagnóstico y tu plan de tratamiento en tu idioma.',
      },
      {
        question: '¿Me pueden conectar con un abogado de accidentes?',
        answer:
          'Sí. Coordinamos con una red de abogados de accidentes de Utah y manejamos la parte médica de tu caso. La orientación legal inicial es gratuita y sin compromiso.',
      },
      {
        question: '¿Necesito pagar por adelantado si fue culpa de otro conductor?',
        answer:
          'Trabajamos con seguros de accidentes de auto y coordinamos la facturación directamente con tu reclamo. Para los detalles de tu cobertura, pregúntanos y te orientamos sin compromiso.',
      },
    ],
  },
  en: {
    metaTitle: 'Car Accident Clinic in West Valley City, UT · Car Injury Clinic',
    metaDescription:
      'Car accident chiropractic clinic for West Valley City, UT. Bilingual care, same-day appointments, free transportation and legal support — minutes away via SR-201 and I-215.',
    keywords:
      'chiropractor West Valley City, car accident clinic West Valley City, car accident West Valley City UT, chiropractor near me, accident injuries, neck pain, whiplash',
    h1: 'Car accident clinic in West Valley City, UT',
    heroSubtitle:
      'Bilingual chiropractic care after an accident for the West Valley City community. Same-day appointments, free transportation and legal guidance — minutes away via SR-201 and I-215.',
    eyebrow: 'West Valley City, UT · Salt Lake County',
    intro: [
      'West Valley City is Utah’s second-largest city and one of the hearts of the Latino community in Salt Lake County. At Car Injury Clinic we treat patients in Spanish and English, so after an accident you can explain what hurts without a language barrier and understand every step of your treatment.',
      'Traffic in West Valley City concentrates on fast corridors like SR-201 (the 21st South Freeway), I-215 and Bangerter Highway, plus busy arterials such as Redwood Road and 3500 South. These are high-speed, high-volume roads where rear-end and side-impact crashes are common, and where injuries like whiplash show up even at low speeds.',
      'Our clinic is in Taylorsville, right next to West Valley City: roughly 6 miles, about 10 to 15 minutes depending on traffic. If you have no way to get here, we arrange free transportation for your appointments.',
    ],
    corridorsLead:
      'We treat injuries from accidents on West Valley City’s main corridors:',
    hospitalsLead:
      'If it was an emergency, go to the nearest emergency room first. Afterward, we follow up on your recovery:',
    directions:
      'From West Valley City, take SR-201 or I-215 toward Taylorsville and exit at 4700 South. We’re at 2997 W 4700 S, Taylorsville, UT 84129. It’s about a 10 to 15 minute drive depending on traffic, with parking on site.',
    faqs: [
      {
        question: 'Do you treat patients from West Valley City?',
        answer:
          'Yes. Many of our patients come from West Valley City. Our clinic is in Taylorsville, minutes away via SR-201 or I-215, and we offer care in Spanish and English.',
      },
      {
        question: 'How far is the clinic from West Valley City?',
        answer:
          'We’re in Taylorsville, roughly 6 miles away (about 10 to 15 minutes by car depending on traffic). If you don’t have transportation, we arrange free rides for your appointments.',
      },
      {
        question: 'I had an accident on SR-201 or I-215 — what should I do?',
        answer:
          'If there’s an emergency, call 911 or go to the nearest emergency room. Once you’re stable, book an evaluation with us: we check your injuries, document everything for your claim and start treatment. We offer same-day visits.',
      },
      {
        question: 'Do you speak Spanish at the clinic?',
        answer:
          'Yes. Our team is bilingual (Spanish and English), which matters for West Valley City’s large Latino community. We explain your diagnosis and treatment plan in your language.',
      },
      {
        question: 'Can you connect me with an accident lawyer?',
        answer:
          'Yes. We coordinate with a network of Utah accident attorneys and handle the medical side of your case. The initial legal guidance is free and with no obligation.',
      },
      {
        question: 'Do I need to pay upfront if another driver was at fault?',
        answer:
          'We work with auto accident insurance and coordinate billing directly with your claim. For the details of your coverage, ask us and we’ll walk you through it with no obligation.',
      },
    ],
  },
};

/* ===========================================================================
   WEST JORDAN  ·  Salt Lake County
   Fuentes (verificadas 2026-06):
   - Condado / 3.ª ciudad más grande del condado (~117k, Census 2024):
     https://en.wikipedia.org/wiki/West_Jordan,_Utah
   - Carreteras (Bangerter Hwy/SR-154, Mountain View Corridor, Redwood Rd/SR-68,
     7800 South/SR-48, 9000 South):
     https://en.wikipedia.org/wiki/Utah_State_Route_154
     https://en.wikipedia.org/wiki/Mountain_View_Corridor
     https://www.westjordan.utah.gov/community-development/traffic-calming/
   - Hospital: Holy Cross Hospital – Jordan Valley (ex Jordan Valley Medical
     Center), 3580 W 9000 S, West Jordan, UT 84088, ER de alto volumen:
     https://www.yelp.com/biz/commonspirit-holy-cross-hospital-jordan-valley-west-jordan
     Intermountain Riverton Hospital (Riverton, al sur).
   - Distancia a Taylorsville (~7 mi / ~12-18 min, aprox. según zona).
   =========================================================================== */
const westJordan: CityData = {
  slug: 'west-jordan',
  name: 'West Jordan',
  heroImage: '/images/schedule.webp',
  heroImageAlt: {
    es: 'Atención quiropráctica de accidentes para residentes de West Jordan, UT',
    en: 'Car accident chiropractic care for West Jordan, UT residents',
  },
  // Centro aproximado de West Jordan.
  geo: { lat: 40.6097, lng: -111.9391 },
  corridors: [
    'Bangerter Highway (SR-154)',
    'Mountain View Corridor',
    'Redwood Road (SR-68)',
    '7800 South (SR-48)',
    '9000 South',
  ],
  hospitals: [
    {
      name: 'Holy Cross Hospital – Jordan Valley',
      note: {
        es: 'Sala de emergencias en 3580 W 9000 S, West Jordan (antes Jordan Valley Medical Center).',
        en: 'Emergency room at 3580 W 9000 S, West Jordan (formerly Jordan Valley Medical Center).',
      },
    },
    {
      name: 'Intermountain Riverton Hospital',
      note: {
        es: 'Hospital con sala de emergencias en Riverton, al sur de West Jordan.',
        en: 'Hospital with an emergency room in Riverton, just south of West Jordan.',
      },
    },
  ],
  distance: { miles: '7', minutes: '15' },
  es: {
    metaTitle: 'Clínica de Accidentes de Auto en West Jordan, UT · Car Injury Clinic',
    metaDescription:
      'Clínica quiropráctica de accidentes de auto para West Jordan, UT. Atención bilingüe, citas el mismo día, transporte gratis y apoyo legal — a minutos por Bangerter Highway y Redwood Road.',
    keywords:
      'quiropráctico West Jordan, clínica de accidentes West Jordan, accidente de auto West Jordan UT, quiropráctico cerca de mí, lesiones por accidente, dolor de espalda, latigazo cervical',
    h1: 'Clínica de accidentes de auto en West Jordan, UT',
    heroSubtitle:
      'Atención quiropráctica bilingüe tras un accidente para la comunidad de West Jordan. Citas el mismo día, transporte gratis y orientación legal — a minutos por Bangerter Highway y Redwood Road.',
    eyebrow: 'West Jordan, UT · Condado de Salt Lake',
    intro: [
      'West Jordan es la tercera ciudad más grande del condado de Salt Lake y una de las que más rápido ha crecido en el lado oeste del valle. Miles de familias de West Jordan manejan a diario por Bangerter Highway y el Mountain View Corridor. En Car Injury Clinic atendemos en español e inglés, para que después de un accidente todo quede claro desde la primera cita.',
      'El tráfico de West Jordan se mueve por Bangerter Highway (SR-154), el Mountain View Corridor y arterias muy cargadas como Redwood Road, 7800 South y 9000 South. Son vías rápidas y de mucho volumen donde los choques por alcance y en intersecciones son frecuentes, y donde el latigazo cervical y el dolor de espalda pueden aparecer horas o días después.',
      'Nuestra clínica está en Taylorsville, justo al norte de West Jordan: alrededor de 7 millas, unos 12 a 18 minutos según el tráfico y desde qué parte de la ciudad salgas. Si no tienes transporte, coordinamos transporte gratis a tus citas.',
    ],
    corridorsLead:
      'Atendemos lesiones de accidentes ocurridos en los principales corredores de West Jordan:',
    hospitalsLead:
      'Si fue una emergencia, primero ve a la sala de emergencias más cercana. Después, nosotros damos seguimiento a tu recuperación:',
    directions:
      'Desde West Jordan, toma Bangerter Highway o Redwood Road hacia el norte y dirígete a 4700 South en Taylorsville. Estamos en 2997 W 4700 S, Taylorsville, UT 84129. Son unos 12 a 18 minutos de manejo según el tráfico, y hay estacionamiento en el lugar.',
    faqs: [
      {
        question: '¿Atienden a pacientes de West Jordan?',
        answer:
          'Sí. Muchos pacientes llegan desde West Jordan por Bangerter Highway o Redwood Road. Nuestra clínica está en Taylorsville, a pocos minutos al norte, y atendemos en español e inglés.',
      },
      {
        question: '¿Qué tan lejos está la clínica desde West Jordan?',
        answer:
          'Estamos en Taylorsville, a aproximadamente 7 millas (unos 12 a 18 minutos en auto según el tráfico y tu zona). Si no tienes transporte, coordinamos transporte gratis para tus citas.',
      },
      {
        question: 'Tuve un accidente en Bangerter Highway o el Mountain View Corridor, ¿qué hago?',
        answer:
          'Si hay una emergencia, llama al 911 o ve a la sala de emergencias más cercana. Cuando estés estable, agenda una evaluación con nosotros: revisamos tus lesiones, documentamos todo para tu reclamo y empezamos el tratamiento. Atendemos el mismo día.',
      },
      {
        question: '¿Hablan español en la clínica?',
        answer:
          'Sí. Nuestro equipo es bilingüe (español e inglés). Te explicamos tu diagnóstico y tu plan de tratamiento en tu idioma, sin que nada se pierda en la traducción.',
      },
      {
        question: '¿Me pueden conectar con un abogado de accidentes?',
        answer:
          'Sí. Coordinamos con una red de abogados de accidentes de Utah y manejamos la parte médica de tu caso. La orientación legal inicial es gratuita y sin compromiso.',
      },
      {
        question: '¿Hay un hospital en West Jordan si el accidente fue grave?',
        answer:
          'Sí. Holy Cross Hospital – Jordan Valley (antes Jordan Valley Medical Center), sobre 9000 South, tiene sala de emergencias. Ve primero a emergencias si es grave y luego nosotros damos seguimiento a tu recuperación.',
      },
    ],
  },
  en: {
    metaTitle: 'Car Accident Clinic in West Jordan, UT · Car Injury Clinic',
    metaDescription:
      'Car accident chiropractic clinic for West Jordan, UT. Bilingual care, same-day appointments, free transportation and legal support — minutes away via Bangerter Highway and Redwood Road.',
    keywords:
      'chiropractor West Jordan, car accident clinic West Jordan, car accident West Jordan UT, chiropractor near me, accident injuries, back pain, whiplash',
    h1: 'Car accident clinic in West Jordan, UT',
    heroSubtitle:
      'Bilingual chiropractic care after an accident for the West Jordan community. Same-day appointments, free transportation and legal guidance — minutes away via Bangerter Highway and Redwood Road.',
    eyebrow: 'West Jordan, UT · Salt Lake County',
    intro: [
      'West Jordan is the third-largest city in Salt Lake County and one of the fastest-growing on the west side of the valley. Thousands of West Jordan families drive Bangerter Highway and the Mountain View Corridor every day. At Car Injury Clinic we treat patients in Spanish and English, so after an accident everything is clear from the very first visit.',
      'Traffic in West Jordan moves along Bangerter Highway (SR-154), the Mountain View Corridor and busy arterials like Redwood Road, 7800 South and 9000 South. These are fast, high-volume roads where rear-end and intersection crashes are common, and where whiplash and back pain can show up hours or days later.',
      'Our clinic is in Taylorsville, just north of West Jordan: around 7 miles, about 12 to 18 minutes depending on traffic and where in the city you start. If you don’t have transportation, we arrange free rides to your appointments.',
    ],
    corridorsLead:
      'We treat injuries from accidents on West Jordan’s main corridors:',
    hospitalsLead:
      'If it was an emergency, go to the nearest emergency room first. Afterward, we follow up on your recovery:',
    directions:
      'From West Jordan, take Bangerter Highway or Redwood Road north and head to 4700 South in Taylorsville. We’re at 2997 W 4700 S, Taylorsville, UT 84129. It’s about a 12 to 18 minute drive depending on traffic, with parking on site.',
    faqs: [
      {
        question: 'Do you treat patients from West Jordan?',
        answer:
          'Yes. Many patients reach us from West Jordan via Bangerter Highway or Redwood Road. Our clinic is in Taylorsville, minutes to the north, and we offer care in Spanish and English.',
      },
      {
        question: 'How far is the clinic from West Jordan?',
        answer:
          'We’re in Taylorsville, roughly 7 miles away (about 12 to 18 minutes by car depending on traffic and your area). If you don’t have transportation, we arrange free rides for your appointments.',
      },
      {
        question: 'I had an accident on Bangerter Highway or the Mountain View Corridor — what should I do?',
        answer:
          'If there’s an emergency, call 911 or go to the nearest emergency room. Once you’re stable, book an evaluation with us: we check your injuries, document everything for your claim and start treatment. We offer same-day visits.',
      },
      {
        question: 'Do you speak Spanish at the clinic?',
        answer:
          'Yes. Our team is bilingual (Spanish and English). We explain your diagnosis and treatment plan in your language, so nothing gets lost in translation.',
      },
      {
        question: 'Can you connect me with an accident lawyer?',
        answer:
          'Yes. We coordinate with a network of Utah accident attorneys and handle the medical side of your case. The initial legal guidance is free and with no obligation.',
      },
      {
        question: 'Is there a hospital in West Jordan if the accident was serious?',
        answer:
          'Yes. Holy Cross Hospital – Jordan Valley (formerly Jordan Valley Medical Center), on 9000 South, has an emergency room. Go to the ER first if it’s serious, and then we follow up on your recovery.',
      },
    ],
  },
};

/* ===========================================================================
   SANDY  ·  Salt Lake County
   Fuentes (verificadas 2026-06):
   - Condado / población (~96,904, Census 2020):
     https://en.wikipedia.org/wiki/Sandy,_Utah
   - Carreteras (I-15 con salidas 9000 S / 10600 S / 11400 S, State Street/US-89,
     9000 South, 700 East, SR-209 hacia los cañones):
     https://en.wikipedia.org/wiki/Sandy,_Utah
     https://en.wikipedia.org/wiki/Interstate_15_in_Utah
   - Hospital: Intermountain Alta View Hospital, 9660 S 1300 E, Sandy, UT 84094,
     ER 24h: https://www.yelp.com/biz/alta-view-hospital-sandy
     Lone Peak Hospital (Draper, al sur).
   - Distancia a Taylorsville (~12 mi / ~18-22 min por I-215/I-15, aprox.).
   =========================================================================== */
const sandy: CityData = {
  slug: 'sandy',
  name: 'Sandy',
  heroImage: '/images/finalcta.webp',
  heroImageAlt: {
    es: 'Atención quiropráctica de accidentes para residentes de Sandy, UT',
    en: 'Car accident chiropractic care for Sandy, UT residents',
  },
  // Centro aproximado de Sandy.
  geo: { lat: 40.5649, lng: -111.8389 },
  corridors: [
    'I-15',
    'State Street (US-89)',
    '9000 South',
    '700 East',
    'SR-209',
  ],
  hospitals: [
    {
      name: 'Intermountain Alta View Hospital',
      note: {
        es: 'Sala de emergencias 24 horas en 9660 S 1300 E, Sandy.',
        en: '24-hour emergency room at 9660 S 1300 E, Sandy.',
      },
    },
    {
      name: 'Lone Peak Hospital',
      note: {
        es: 'Hospital con sala de emergencias en Draper, justo al sur de Sandy.',
        en: 'Hospital with an emergency room in Draper, just south of Sandy.',
      },
    },
  ],
  distance: { miles: '12', minutes: '18' },
  es: {
    metaTitle: 'Clínica de Accidentes de Auto en Sandy, UT · Car Injury Clinic',
    metaDescription:
      'Clínica quiropráctica de accidentes de auto para Sandy, UT. Atención bilingüe, citas el mismo día, transporte gratis y apoyo legal — a minutos por la I-15 y la I-215.',
    keywords:
      'quiropráctico Sandy, clínica de accidentes Sandy, accidente de auto Sandy UT, quiropráctico cerca de mí, lesiones por accidente, dolor de cuello, latigazo cervical',
    h1: 'Clínica de accidentes de auto en Sandy, UT',
    heroSubtitle:
      'Atención quiropráctica bilingüe tras un accidente para la comunidad de Sandy. Citas el mismo día, transporte gratis y orientación legal — a minutos por la I-15 y la I-215.',
    eyebrow: 'Sandy, UT · Condado de Salt Lake',
    intro: [
      'Sandy es una de las ciudades más grandes del condado de Salt Lake y un punto clave del corredor de la I-15 en el sur del valle. Cada día miles de personas entran y salen de Sandy por la I-15 y State Street rumbo al trabajo o a los cañones. En Car Injury Clinic atendemos en español e inglés, para que después de un accidente tu recuperación y tu reclamo avancen sin barreras.',
      'El tráfico de Sandy se concentra en la I-15 —con salidas en 9000 South, 10600 South y 11400 South—, en State Street (US-89) y en arterias muy transitadas como 9000 South, 700 East y la SR-209 hacia los cañones. Es una mezcla de tráfico veloz de autopista y paradas constantes en avenidas, donde las colisiones por alcance y el latigazo cervical son comunes.',
      'Nuestra clínica está en Taylorsville, al noroeste de Sandy: alrededor de 12 millas, unos 18 a 22 minutos por la I-215 o la I-15 según el tráfico. Si no tienes cómo llegar, coordinamos transporte gratis para tus citas.',
    ],
    corridorsLead:
      'Atendemos lesiones de accidentes ocurridos en los principales corredores de Sandy:',
    hospitalsLead:
      'Si fue una emergencia, primero ve a la sala de emergencias más cercana. Después, nosotros damos seguimiento a tu recuperación:',
    directions:
      'Desde Sandy, toma la I-15 hacia el norte o la I-215 hacia el oeste y sal hacia 4700 South en Taylorsville. Estamos en 2997 W 4700 S, Taylorsville, UT 84129. Son unos 18 a 22 minutos de manejo según el tráfico, y hay estacionamiento en el lugar.',
    faqs: [
      {
        question: '¿Atienden a pacientes de Sandy?',
        answer:
          'Sí. Muchos pacientes llegan desde Sandy por la I-15 o la I-215. Nuestra clínica está en Taylorsville, al noroeste, y atendemos en español e inglés.',
      },
      {
        question: '¿Qué tan lejos está la clínica desde Sandy?',
        answer:
          'Estamos en Taylorsville, a aproximadamente 12 millas (unos 18 a 22 minutos en auto por la I-215 o la I-15 según el tráfico). Si no tienes transporte, coordinamos transporte gratis para tus citas.',
      },
      {
        question: 'Tuve un accidente en la I-15 cerca de Sandy, ¿qué hago?',
        answer:
          'Si hay una emergencia, llama al 911 o ve a la sala de emergencias más cercana, como Alta View Hospital. Cuando estés estable, agenda una evaluación con nosotros: revisamos tus lesiones, documentamos todo para tu reclamo y empezamos el tratamiento. Atendemos el mismo día.',
      },
      {
        question: '¿Hablan español en la clínica?',
        answer:
          'Sí. Nuestro equipo es bilingüe (español e inglés). Te explicamos tu diagnóstico y tu plan de tratamiento en tu idioma.',
      },
      {
        question: '¿Me pueden conectar con un abogado de accidentes?',
        answer:
          'Sí. Coordinamos con una red de abogados de accidentes de Utah y manejamos la parte médica de tu caso. La orientación legal inicial es gratuita y sin compromiso.',
      },
      {
        question: '¿Hay un hospital con emergencias en Sandy?',
        answer:
          'Sí. Intermountain Alta View Hospital, en 9660 S 1300 E, tiene sala de emergencias abierta 24 horas. Ve primero a emergencias si es grave y luego nosotros damos seguimiento a tu recuperación.',
      },
    ],
  },
  en: {
    metaTitle: 'Car Accident Clinic in Sandy, UT · Car Injury Clinic',
    metaDescription:
      'Car accident chiropractic clinic for Sandy, UT. Bilingual care, same-day appointments, free transportation and legal support — minutes away via I-15 and I-215.',
    keywords:
      'chiropractor Sandy, car accident clinic Sandy, car accident Sandy UT, chiropractor near me, accident injuries, neck pain, whiplash',
    h1: 'Car accident clinic in Sandy, UT',
    heroSubtitle:
      'Bilingual chiropractic care after an accident for the Sandy community. Same-day appointments, free transportation and legal guidance — minutes away via I-15 and I-215.',
    eyebrow: 'Sandy, UT · Salt Lake County',
    intro: [
      'Sandy is one of the largest cities in Salt Lake County and a key point on the I-15 corridor in the south end of the valley. Every day thousands of people move in and out of Sandy on I-15 and State Street, heading to work or to the canyons. At Car Injury Clinic we treat patients in Spanish and English, so after an accident your recovery and your claim move forward without barriers.',
      'Traffic in Sandy concentrates on I-15 — with exits at 9000 South, 10600 South and 11400 South — on State Street (US-89) and on busy arterials like 9000 South, 700 East and SR-209 toward the canyons. It’s a mix of fast freeway traffic and constant stop-and-go on the avenues, where rear-end crashes and whiplash are common.',
      'Our clinic is in Taylorsville, northwest of Sandy: around 12 miles, about 18 to 22 minutes via I-215 or I-15 depending on traffic. If you have no way to get here, we arrange free transportation for your appointments.',
    ],
    corridorsLead:
      'We treat injuries from accidents on Sandy’s main corridors:',
    hospitalsLead:
      'If it was an emergency, go to the nearest emergency room first. Afterward, we follow up on your recovery:',
    directions:
      'From Sandy, take I-15 north or I-215 west and exit at 4700 South in Taylorsville. We’re at 2997 W 4700 S, Taylorsville, UT 84129. It’s about an 18 to 22 minute drive depending on traffic, with parking on site.',
    faqs: [
      {
        question: 'Do you treat patients from Sandy?',
        answer:
          'Yes. Many patients reach us from Sandy via I-15 or I-215. Our clinic is in Taylorsville, to the northwest, and we offer care in Spanish and English.',
      },
      {
        question: 'How far is the clinic from Sandy?',
        answer:
          'We’re in Taylorsville, roughly 12 miles away (about 18 to 22 minutes by car via I-215 or I-15 depending on traffic). If you don’t have transportation, we arrange free rides for your appointments.',
      },
      {
        question: 'I had an accident on I-15 near Sandy — what should I do?',
        answer:
          'If there’s an emergency, call 911 or go to the nearest emergency room, such as Alta View Hospital. Once you’re stable, book an evaluation with us: we check your injuries, document everything for your claim and start treatment. We offer same-day visits.',
      },
      {
        question: 'Do you speak Spanish at the clinic?',
        answer:
          'Yes. Our team is bilingual (Spanish and English). We explain your diagnosis and treatment plan in your language.',
      },
      {
        question: 'Can you connect me with an accident lawyer?',
        answer:
          'Yes. We coordinate with a network of Utah accident attorneys and handle the medical side of your case. The initial legal guidance is free and with no obligation.',
      },
      {
        question: 'Is there an emergency hospital in Sandy?',
        answer:
          'Yes. Intermountain Alta View Hospital, at 9660 S 1300 E, has a 24-hour emergency room. Go to the ER first if it’s serious, and then we follow up on your recovery.',
      },
    ],
  },
};

/**
 * Registro de ciudades. El orden define el orden del cross-linking entre
 * ubicaciones. Para sumar una ciudad: agrega su objeto arriba y un renglón aquí.
 */
export const CITIES: Record<string, CityData> = {
  'west-valley-city': westValleyCity,
  'west-jordan': westJordan,
  sandy,
};

/** Lista de slugs para `getStaticPaths`. */
export function getAllCitySlugs(): string[] {
  return Object.keys(CITIES);
}

/** Todas las ciudades (para el hub y el cross-linking entre ubicaciones). */
export function getAllCities(): CityData[] {
  return Object.values(CITIES);
}

/** Una ciudad por slug, o undefined si no existe. */
export function getCity(slug: string): CityData | undefined {
  return CITIES[slug];
}

/** Atajo a la prosa del idioma activo. */
export function cityCopy(city: CityData, locale: Locale): CityCopy {
  return locale === 'en' ? city.en : city.es;
}
