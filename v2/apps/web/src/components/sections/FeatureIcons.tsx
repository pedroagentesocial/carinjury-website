import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';

interface Props {
  locale: Locale;
}

interface Feature {
  key: string;
  icon: string;
  href: string;
}

const FEATURES: Feature[] = [
  { key: 'free_consultation', icon: '/assets/icons/consulta-cero.png', href: '/patient-referral' },
  { key: 'same_day',          icon: '/assets/icons/mismo-dia.png',     href: '/schedule' },
  { key: 'free_transport',    icon: '/assets/icons/transporte.png',    href: '/services#transporte-gratis' },
  { key: 'xray',              icon: '/assets/icons/xray.png',          href: '/services#radiografias' },
  { key: 'legal_guidance',    icon: '/assets/icons/legal.png',         href: '/lawyer-approved' },
  { key: 'languages',         icon: '/assets/icons/idiomas.png',       href: '/services#bilingue' },
];

export default function FeatureIcons({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--c-sec-2)] py-20 md:py-24"
      aria-label={t('feature_icons.aria_label', locale)}
    >
      {/* Background — blobs sutiles + dot pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[36vmax] w-[36vmax] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[32vmax] w-[32vmax] rounded-full bg-primary/25 blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* HEADER — sigue centrado en max-w-content */}
      <div className="relative mx-auto max-w-content px-5">
        <header className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl font-extrabold leading-[1.1] text-white md:text-4xl lg:text-[2.6rem]"
          >
            {t('feature_icons.title', locale)}
          </motion.h2>
        </header>
      </div>

      {/* GRID — full bleed: 2 mobile, 3 tablet, 6 desktop (una sola fila) */}
      <div className="relative px-4 md:px-6 lg:px-8 xl:px-10">
        <ul className="mx-auto grid max-w-[1600px] grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6 lg:gap-3 xl:gap-4">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.key}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: 0.05 + i * 0.06 }}
            >
              <a
                href={`${prefix}${f.href}`}
                aria-label={t(`feature_icons.items.${f.key}.aria_label` as TranslationKey, locale)}
                className="group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/8 bg-white p-5 text-center text-ink shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.4)] md:gap-5 md:p-6 lg:p-5 xl:p-6"
              >
                {/* Top accent line */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 top-0 h-[3px] origin-center scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
                />

                {/* Soft glow behind icon */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-6 h-28 w-28 -translate-x-1/2 rounded-full bg-secondary/0 blur-2xl transition-all duration-500 group-hover:bg-secondary/30"
                />

                {/* ICON — grande pero adaptable */}
                <span className="relative flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-primary shadow-[0_12px_28px_-6px_rgba(122,46,135,0.55)] transition duration-300 group-hover:scale-[1.08] group-hover:-rotate-3 group-hover:bg-[#6a3f75] md:h-24 md:w-24 lg:h-20 lg:w-20 xl:h-24 xl:w-24">
                  <img
                    src={f.icon}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-[60%] w-[60%] object-contain brightness-0 invert"
                  />
                </span>

                {/* TITLE */}
                <span className="relative font-heading text-[0.95rem] font-extrabold leading-tight tracking-tight md:text-lg lg:text-base xl:text-lg">
                  {t(`feature_icons.items.${f.key}.title` as TranslationKey, locale)}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
