import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function FormPageHero({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  return (
    <section className="relative isolate overflow-hidden bg-deep pt-28 text-white md:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
        >
          <span className="h-1 w-1 rounded-full bg-secondary" />
          {locale === 'en' ? 'Free evaluation' : 'Evaluación gratuita'}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-5 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.4rem]"
        >
          {locale === 'en' ? (
            <>
              Had an accident?{' '}
              <span className="text-secondary">Tell us about your case.</span>
            </>
          ) : (
            <>
              ¿Tuviste un accidente?{' '}
              <span className="text-secondary">Cuéntanos tu caso.</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
        >
          {locale === 'en'
            ? 'Free evaluation, no commitment. We reply within 24h with a personalized recovery plan.'
            : 'Evaluación gratuita, sin compromiso. Te respondemos en menos de 24h con un plan personalizado.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_rgba(186,147,194,0.7)] transition hover:bg-primary"
          >
            {locale === 'en' ? 'Fill the form' : 'Llenar formulario'}
            <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            <Icon name="phone" size={15} />
            {SITE.phone.display}
          </a>
          <a
            href={scheduleHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            <Icon name="calendar" size={15} />
            {locale === 'en' ? 'Schedule' : 'Agendar'}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/55"
        >
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
            {locale === 'en' ? 'Reply within 24h' : 'Respuesta en menos de 24h'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
            {locale === 'en' ? 'No commitment' : 'Sin compromiso'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
            {locale === 'en' ? 'Bilingual team' : 'Equipo bilingüe'}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
