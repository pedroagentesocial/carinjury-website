import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function NotFound({ locale }: Props) {
  const homeHref = locale === 'en' ? '/en/' : '/';
  const isEn = locale === 'en';

  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-deep py-24 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 30%, rgba(186,147,194,0.35), transparent 45%), radial-gradient(circle at 75% 70%, rgba(122,46,135,0.45), transparent 45%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-content px-6 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="select-none font-heading text-[160px] font-bold leading-none tracking-tighter md:text-[240px]"
        >
          404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="-mt-12 font-heading text-3xl font-bold leading-tight md:-mt-16 md:text-5xl"
        >
          {isEn ? 'Page not found' : 'Página no encontrada'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto mt-3 max-w-xl text-lg text-white/85"
        >
          {isEn
            ? 'The page you are looking for moved or no longer exists. Try one of these options:'
            : 'La página que buscas se movió o ya no existe. Prueba con una de estas opciones:'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 font-semibold text-white shadow-lg transition hover:scale-[1.03] hover:bg-primary"
          >
            <Icon name="arrow-right" size={18} className="rotate-180" />
            {isEn ? 'Back to home' : 'Volver al inicio'}
          </a>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15"
          >
            <Icon name="phone" size={18} />
            {SITE.phone.display}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
            {isEn ? 'Popular sections' : 'Secciones populares'}
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { href: isEn ? '/en/services' : '/services', label: isEn ? 'Services' : 'Servicios' },
              { href: isEn ? '/en/schedule' : '/schedule', label: isEn ? 'Schedule' : 'Agendar' },
              { href: isEn ? '/en/aboutus' : '/aboutus', label: isEn ? 'About us' : 'Nosotros' },
              { href: isEn ? '/en/faq' : '/faq', label: 'FAQ' },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/85 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                  <Icon name="arrow-right" size={12} />
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
