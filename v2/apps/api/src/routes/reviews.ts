import { Hono } from 'hono';
import { getReviews } from '../services/reviews.js';

export const reviewsRoute = new Hono().get('/', async (c) => {
  const data = await getReviews();
  return c.json({
    reviews: data.reviews,
    average: data.average,
    total: data.reviews.length,
    cached_at: data.cached_at,
  });
});
