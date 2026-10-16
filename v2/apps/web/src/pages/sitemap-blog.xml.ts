import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl } from '@lib/seo';

/**
 * Sitemap dinámico del blog.
 *
 * Los artículos se publican solos por fecha (SSR, ver src/pages/blog/[slug].astro),
 * así que no pueden salir en el sitemap estático de @astrojs/sitemap: ese se genera
 * en el build y no sabría de un post que aparece dos semanas después.
 * Este endpoint lo calcula en cada petición y sólo lista lo ya publicado.
 */
export const prerender = false;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const now = Date.now();
  const all = await getCollection('blog');
  const published = all.filter((e) => !e.data.draft && e.data.publishDate.getTime() <= now);

  const urlFor = (lang: 'es' | 'en', slug: string) =>
    absoluteUrl(lang === 'en' ? `/en/blog/${slug}` : `/blog/${slug}`);

  const entries: string[] = [];

  /* Índices del blog */
  for (const [lang, path] of [['es', '/blog'], ['en', '/en/blog']] as const) {
    const other = lang === 'es' ? '/en/blog' : '/blog';
    entries.push(`  <url>
    <loc>${esc(absoluteUrl(path))}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="${lang === 'es' ? 'en-US' : 'es-US'}" href="${esc(absoluteUrl(other))}"/>
    <xhtml:link rel="alternate" hreflang="${lang === 'es' ? 'es-US' : 'en-US'}" href="${esc(absoluteUrl(path))}"/>
  </url>`);
  }

  /* Artículos */
  for (const post of published) {
    const { lang, slug, translationKey, publishDate, updatedDate } = post.data;
    const alt = published.find((e) => e.data.translationKey === translationKey && e.data.lang !== lang);
    const alternates = alt
      ? `\n    <xhtml:link rel="alternate" hreflang="${alt.data.lang === 'en' ? 'en-US' : 'es-US'}" href="${esc(urlFor(alt.data.lang, alt.data.slug))}"/>`
      : '';
    entries.push(`  <url>
    <loc>${esc(urlFor(lang, slug))}</loc>
    <lastmod>${(updatedDate ?? publishDate).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="${lang === 'en' ? 'en-US' : 'es-US'}" href="${esc(urlFor(lang, slug))}"/>${alternates}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
};
