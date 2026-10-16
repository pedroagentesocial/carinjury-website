import type { Review } from '@carinjury/shared';

const SEED: Review[] = [
  {
    id: 'seed-1',
    author: 'Andrea P.',
    rating: 5,
    text_es: 'Excelente atención. El dolor bajó rápido y me ayudaron con todo el papeleo del seguro.',
    text_en: 'Excellent care. Pain went down quickly and they helped me with all the insurance paperwork.',
    date: '2026-03-10',
    source: 'seed',
  },
  {
    id: 'seed-2',
    author: 'Carlos M.',
    rating: 5,
    text_es: 'Cita el mismo día y trato profesional. El equipo bilingüe me ayudó a entender cada paso.',
    text_en: 'Same-day appointment and professional service. The bilingual team helped me understand every step.',
    date: '2026-02-22',
    source: 'seed',
  },
  {
    id: 'seed-3',
    author: 'María R.',
    rating: 5,
    text_es: 'Después del accidente no sabía qué hacer. Aquí me coordinaron médico y abogado todo en uno.',
    text_en: 'After the accident I had no idea what to do. They coordinated doctor and lawyer all in one place.',
    date: '2026-01-18',
    source: 'seed',
  },
  {
    id: 'seed-4',
    author: 'José L.',
    rating: 5,
    text_es: 'Transporte gratuito a cada cita, y me explicaron todo en mi idioma. 100% recomendados.',
    text_en: 'Free transport to every appointment, and they explained everything in my language. 100% recommended.',
    date: '2025-12-05',
    source: 'seed',
  },
  {
    id: 'seed-5',
    author: 'Sandra T.',
    rating: 5,
    text_es: 'Tres semanas de terapia y me sentí completamente recuperada. El seguimiento es impecable.',
    text_en: 'Three weeks of therapy and I felt completely recovered. The follow-up is impeccable.',
    date: '2025-11-15',
    source: 'seed',
  },
  {
    id: 'seed-6',
    author: 'Rafael C.',
    rating: 5,
    text_es: 'Profesionales, empáticos y resolutivos. Lograron una compensación que ni imaginé.',
    text_en: 'Professional, empathetic and effective. They got me a compensation I never imagined.',
    date: '2025-10-02',
    source: 'seed',
  },
];

interface CacheEntry {
  reviews: Review[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// Cache global de proceso. En Vercel serverless, esto se mantiene por instancia
// (warm) y se reinicia en cold start — equivalente a un "best effort" cache de 6h.
let cache: CacheEntry | null = null;

interface PlacesReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

interface PlacesPayload {
  result?: { reviews?: PlacesReview[]; rating?: number; user_ratings_total?: number };
  status?: string;
}

async function fetchGoogleReviews(): Promise<Review[] | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,rating,user_ratings_total&key=${key}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as PlacesPayload;
    const items = data.result?.reviews ?? [];
    return items.map((r, i) => ({
      id: `g-${r.time}-${i}`,
      author: r.author_name,
      rating: Math.max(1, Math.min(5, Math.round(r.rating))),
      text_es: r.text,
      text_en: r.text,
      date: new Date(r.time * 1000).toISOString().slice(0, 10),
      source: 'google' as const,
    }));
  } catch (err) {
    console.error('[reviews] Google Places fetch error', err);
    return null;
  }
}

export async function getReviews(): Promise<{ reviews: Review[]; average: number; cached_at: string }> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return summary(cache);
  }

  const google = await fetchGoogleReviews();
  const merged = google && google.length > 0 ? [...google, ...SEED.slice(0, Math.max(0, 6 - google.length))] : SEED;
  cache = { reviews: merged, fetchedAt: now };
  return summary(cache);
}

function summary(entry: CacheEntry) {
  const avg = entry.reviews.reduce((a, r) => a + r.rating, 0) / entry.reviews.length;
  return {
    reviews: entry.reviews,
    average: Math.round(avg * 10) / 10,
    cached_at: new Date(entry.fetchedAt).toISOString(),
  };
}
