import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().int().min(1).max(5),
  text_es: z.string(),
  text_en: z.string(),
  date: z.string(),
  source: z.enum(['google', 'seed']).default('seed'),
});

export type Review = z.infer<typeof ReviewSchema>;

export const ReviewsResponseSchema = z.object({
  reviews: z.array(ReviewSchema),
  average: z.number(),
  total: z.number(),
  cached_at: z.string(),
});

export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;
