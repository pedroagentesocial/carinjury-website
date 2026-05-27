import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog colección — contenido educativo para SEO long-tail
 * (síntomas, recuperación, reclamos de seguro, etc.).
 *
 * Estructura de archivos: src/content/blog/{es|en}/{slug}.md
 * Cada artículo declara su `lang` y un `translationKey` compartido entre
 * idiomas para generar hreflang correctamente.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['es', 'en']),
    /** Slug de la URL (sin prefijo de idioma). */
    slug: z.string(),
    /** ID compartido entre traducciones del mismo artículo → hreflang. */
    translationKey: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Car Injury Clinic'),
    category: z.string(),
    /** Keywords separadas por coma (meta + audit tools). */
    keywords: z.string().optional(),
    /** Ruta a imagen en /public (ej: /images/medical-care.webp). */
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    /** Minutos estimados de lectura (se muestra en la card e índice). */
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
