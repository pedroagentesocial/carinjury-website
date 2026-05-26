// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://carinjuryclinics.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'server',
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-US', en: 'en-US' },
      },
      // Excluir rutas internas / utilitarias del index
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname;
        // API endpoints
        if (path.startsWith('/api/')) return false;
        // Thank-you pages no se indexan
        if (path.endsWith('/thank-you') || path.endsWith('/thank-you/')) return false;
        // 404
        if (path === '/404' || path.endsWith('/404/')) return false;
        return true;
      },
      // Custom priority / changefreq por ruta
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname.replace(/^\/en/, '') || '/';

        /** @type {(v: string) => import('sitemap').EnumChangefreq} */
        const cf = (v) => /** @type {any} */ (v);

        // Home: máxima prioridad
        if (path === '/' || path === '') {
          item.priority = 1.0;
          item.changefreq = cf('weekly');
        }
        // Services + Lawyer: alta prioridad (intent comercial)
        else if (path === '/services' || path === '/services/' || path === '/lawyer-approved' || path === '/lawyer-approved/') {
          item.priority = 0.9;
          item.changefreq = cf('monthly');
        }
        // About + Schedule + Form + Patient referral: importantes
        else if (
          path === '/aboutus' || path === '/aboutus/' ||
          path === '/schedule' || path === '/schedule/' ||
          path === '/form' || path === '/form/' ||
          path === '/patient-referral' || path === '/patient-referral/' ||
          path === '/faq' || path === '/faq/'
        ) {
          item.priority = 0.8;
          item.changefreq = cf('monthly');
        }
        // Privacy y otras
        else {
          item.priority = 0.4;
          item.changefreq = cf('yearly');
        }

        return item;
      },
    }),
  ],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    server: {
      proxy: {},
    },
  },
});
