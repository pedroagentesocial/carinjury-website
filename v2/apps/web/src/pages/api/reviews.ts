import type { APIRoute } from 'astro';
import { getReviews } from '@/lib/server/reviews';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getReviews();
  return new Response(
    JSON.stringify({
      reviews: data.reviews,
      average: data.average,
      total: data.reviews.length,
      cached_at: data.cached_at,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
};
