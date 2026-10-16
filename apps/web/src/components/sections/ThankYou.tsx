import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function ThankYou({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-deep py-16 pt-28 text-white md:py-24 md:pt-32 lg:pt-36">
      {/* Background — blobs + dot pattern (consistente con el resto) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative mx-auto w-full max-w-content px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-white/12 bg-white/[0.04] p-6 text-center backdrop-blur-md sm:p-8 md:p-12"
        >
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 }}
            className="relative mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
            <Icon name="check" size={42} strokeWidth={2.5} className="relative" />
          </motion.div>

          {/* Eyebrow chip */}
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {locale === 'en' ? 'Submission received' : 'Recibido'}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl"
          >
            {t('gracias_page.title', locale)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg"
          >
            {t('gracias_page.message', locale)}
          </motion.p>

          {/* What happens next — mini timeline */}
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid w-full gap-2.5 text-left text-sm"
          >
            {(locale === 'en'
              ? [
                  { icon: 'clock' as const, text: 'We review your case within 24 hours' },
                  { icon: 'phone' as const, text: 'A bilingual specialist calls you back' },
                  { icon: 'sparkles' as const, text: 'You receive a personalized recovery plan' },
                ]
              : [
                  { icon: 'clock' as const, text: 'Revisamos tu caso en menos de 24h' },
                  { icon: 'phone' as const, text: 'Un especialista bilingüe te contacta' },
                  { icon: 'sparkles' as const, text: 'Recibes un plan de recuperación personalizado' },
                ]
            ).map((step) => (
              <li
                key={step.text}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary/15 text-secondary ring-1 ring-secondary/30">
                  <Icon name={step.icon} size={14} strokeWidth={2.2} />
                </span>
                <span className="text-white/85">{step.text}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={`tel:${SITE.phone.tel}`}
              className="btn-uiverse-primary group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              <Icon name="phone" size={15} />
              {t('gracias_page.call_now', locale)}
            </a>
            <a
              href={`${prefix || '/'}`}
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              <Icon name="arrow-right" size={15} className="rotate-180" />
              {t('gracias_page.back_home', locale)}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
