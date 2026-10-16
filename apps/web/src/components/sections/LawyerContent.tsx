import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';
import ContactSection from './ContactSection';

interface Props {
  locale: Locale;
}

type BenefitKey = 'free_evaluation' | 'insurance_handling' | 'legal_support' | 'specialist_referral';

interface Benefit {
  key: BenefitKey;
  icon: IconName;
  desc: { es: string; en: string };
}

const BENEFITS: Benefit[] = [
  {
    key: 'free_evaluation',
    icon: 'stethoscope',
    desc: {
      es: 'Médicos certificados evalúan tu lesión sin costo y documentan tu caso desde el día uno.',
      en: 'Certified doctors evaluate your injury at no cost and document your case from day one.',
    },
  },
  {
    key: 'insurance_handling',
    icon: 'shield',
    desc: {
      es: 'Gestionamos cada llamada, papel y reclamo directamente con tu aseguradora.',
      en: 'We handle every call, document and claim directly with your insurance.',
    },
  },
  {
    key: 'legal_support',
    icon: 'gavel',
    desc: {
      es: 'Red de abogados especialistas en accidentes con histórico de acuerdos exitosos.',
      en: 'Network of attorneys specializing in accidents with a track record of successful settlements.',
    },
  },
  {
    key: 'specialist_referral',
    icon: 'sparkles',
    desc: {
      es: 'Coordinamos especialistas, MRI, fisioterapia y todo lo que tu recuperación necesite.',
      en: 'We coordinate specialists, MRI, physiotherapy and everything your recovery needs.',
    },
  },
];

interface Stat {
  value: string;
  label: { es: string; en: string };
  icon: IconName;
}

const STATS: Stat[] = [
  { value: '$25M+', label: { es: 'Recuperado para clientes', en: 'Recovered for clients' }, icon: 'sparkles' },
  { value: '5,000+', label: { es: 'Casos manejados con éxito', en: 'Cases successfully handled' }, icon: 'check' },
  { value: '24h', label: { es: 'Tiempo de respuesta', en: 'Response time' }, icon: 'clock' },
  { value: '100%', label: { es: 'Sin ganar, sin pagar', en: 'No win, no fee' }, icon: 'shield' },
];

interface Step {
  icon: IconName;
  title: { es: string; en: string };
  description: { es: string; en: string };
}

const STEPS: Step[] = [
  {
    icon: 'phone',
    title: { es: 'Hablamos contigo', en: 'We talk with you' },
    description: {
      es: 'Llamada inicial gratis. Entendemos tu accidente y tus necesidades médicas y legales.',
      en: 'Free initial call. We understand your accident and your medical and legal needs.',
    },
  },
  {
    icon: 'stethoscope',
    title: { es: 'Evaluación coordinada', en: 'Coordinated evaluation' },
    description: {
      es: 'Médico + abogado revisan tu caso en paralelo. Sin esperas, sin papeleos sueltos.',
      en: 'Doctor + attorney review your case in parallel. No waiting, no loose paperwork.',
    },
  },
  {
    icon: 'sparkles',
    title: { es: 'Recuperación + compensación', en: 'Recovery + compensation' },
    description: {
      es: 'Te recuperás físicamente mientras negociamos la compensación máxima que mereces.',
      en: 'You recover physically while we negotiate the maximum compensation you deserve.',
    },
  },
];

export default function LawyerContent({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  return (
    <>
      {/* =================== HERO — split image + content =================== */}
      <section className="relative isolate overflow-hidden bg-deep pt-24 text-white md:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
        />

        <div className="relative mx-auto grid max-w-content items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-20">
          {/* LEFT — Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {t('hero_lawyer.badge', locale)}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.8rem]"
            >
              {t('hero_lawyer.title', locale)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
            >
              {t('hero_lawyer.subtitle.main', locale)}{' '}
              <span className="font-semibold text-secondary">
                {t('hero_lawyer.subtitle.highlight', locale)}
              </span>{' '}
              {t('hero_lawyer.subtitle.end', locale)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href={scheduleHref}
                className="group inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_rgba(186,147,194,0.7)] transition hover:bg-primary"
              >
                {t('hero_lawyer.schedule_button', locale)}
                <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={`tel:${SITE.phone.tel}`}
                className="btn-uiverse inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                <Icon name="phone" size={15} />
                {SITE.phone.display}
              </a>
            </motion.div>

            {/* Tiny trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55"
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
                {locale === 'en' ? 'Free evaluation' : 'Evaluación gratuita'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
                {locale === 'en' ? 'No win, no fee' : 'Sin ganar, sin pagar'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
                {locale === 'en' ? 'Bilingual team' : 'Equipo bilingüe'}
              </span>
            </motion.div>
          </div>

          {/* RIGHT — Image with floating stat */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]">
              <img
                src="/images/legal.webp"
                alt={locale === 'en' ? 'Legal team reviewing a case' : 'Equipo legal revisando un caso'}
                loading="eager"
                decoding="async"
                className="aspect-[5/6] w-full object-cover md:aspect-[4/5] lg:aspect-[5/6]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-deep/65 via-transparent to-transparent"
              />
            </div>

            {/* Floating stat — top right */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute right-4 top-4 z-10 flex items-center gap-3 rounded-2xl border border-white/20 bg-deep/95 px-3 py-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md sm:right-6 md:px-4 md:py-3 lg:-right-6 lg:top-6"
            >
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-white shadow-[0_6px_14px_-4px_rgba(186,147,194,0.7)]">
                <Icon name="sparkles" size={18} strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-heading text-xl font-extrabold leading-none text-white">
                  $25M+
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                  {locale === 'en' ? 'Recovered' : 'Recuperado'}
                </p>
              </div>
            </motion.div>

            {/* Floating no-win-no-fee badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-deep/95 px-3 py-2.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md sm:left-6 md:px-4 md:py-3 lg:-left-6 lg:bottom-6"
            >
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-400/40">
                <Icon name="shield" size={16} strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-heading text-sm font-extrabold leading-tight text-white">
                  {locale === 'en' ? 'No win, no fee' : 'Sin ganar, sin pagar'}
                </p>
                <p className="text-[10px] font-medium text-white/65">
                  {locale === 'en' ? 'Risk-free' : 'Sin riesgo'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =================== TRUST STATS — editorial inline =================== */}
      <section className="relative overflow-hidden bg-white py-16 md:py-20">
        <div className="relative mx-auto max-w-content px-6">
          <header className="mb-10 max-w-2xl md:mb-12">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              <span className="h-px w-6 bg-primary/40" />
              {locale === 'en' ? 'The numbers' : 'Los números'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-2 font-heading text-2xl font-extrabold leading-[1.15] text-ink md:text-3xl"
            >
              {locale === 'en' ? (
                <>
                  Backed by results,{' '}
                  <span className="text-primary">not promises.</span>
                </>
              ) : (
                <>
                  Respaldados por resultados,{' '}
                  <span className="text-primary">no promesas.</span>
                </>
              )}
            </motion.h2>
          </header>

          <div className="grid grid-cols-2 divide-y divide-line border-y border-line md:grid-cols-4 md:divide-x md:divide-y-0">
            {STATS.map((s, i) => (
              <InlineStat key={s.value} stat={s} locale={locale} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS — vertical timeline =================== */}
      <section className="relative overflow-hidden bg-white py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:32px_32px]"
        />

        <div className="relative mx-auto max-w-3xl px-6">
          <header className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {locale === 'en' ? 'How it works' : 'Cómo funciona'}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl lg:text-[2.6rem]">
              {locale === 'en' ? (
                <>
                  Three steps from accident to{' '}
                  <span className="text-primary">recovery.</span>
                </>
              ) : (
                <>
                  Tres pasos del accidente a la{' '}
                  <span className="text-primary">recuperación.</span>
                </>
              )}
            </h2>
          </header>

          <ol className="relative">
            {/* Vertical connector */}
            <div
              aria-hidden="true"
              className="absolute bottom-12 left-[27px] top-7 w-px bg-gradient-to-b from-primary/40 via-secondary/40 to-primary/10"
            />

            {STEPS.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex items-start gap-5 pb-10 last:pb-0"
              >
                <div className="relative flex-none">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_8px_20px_-8px_rgba(122,46,135,0.6)] ring-4 ring-white">
                    <Icon name={step.icon} size={22} strokeWidth={2.1} />
                  </span>
                  <span className="absolute -right-1 -top-1 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-extrabold text-white shadow-md ring-2 ring-white">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <h3 className="font-heading text-xl font-bold leading-tight text-ink">
                    {locale === 'en' ? step.title.en : step.title.es}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                    {locale === 'en' ? step.description.en : step.description.es}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* =================== BENEFITS GRID =================== */}
      <section className="relative overflow-hidden bg-surface-2 py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[30vmax] w-[30vmax] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-content px-6">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {t('hero_lawyer.benefits_label', locale)}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl lg:text-[2.6rem]">
              {locale === 'en' ? (
                <>
                  Medical and legal{' '}
                  <span className="text-primary">in sync.</span>
                </>
              ) : (
                <>
                  Médico y legal{' '}
                  <span className="text-primary">en sincronía.</span>
                </>
              )}
            </h2>
          </header>

          <ul className="grid gap-4 md:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <motion.li
                key={b.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <article className="group relative flex h-full items-start gap-5 overflow-hidden rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(74,28,90,0.35)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-[2px] origin-center scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-white group-hover:ring-primary/40">
                    <Icon name={b.icon} size={24} strokeWidth={2.1} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-bold leading-tight text-ink">
                      {t(`hero_lawyer.benefits.${b.key}` as TranslationKey, locale)}
                    </h3>
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
                      {locale === 'en' ? b.desc.en : b.desc.es}
                    </p>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* =================== CONTACT — reuses home component =================== */}
      <ContactSection locale={locale} />

      {/* =================== FINAL CTA — split image + content =================== */}
      <section className="relative isolate overflow-hidden bg-deep text-white">
        <div className="relative grid lg:grid-cols-2">
          {/* CONTENT SIDE (LEFT) */}
          <div className="relative order-2 flex flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:order-1 lg:px-16 lg:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-20 h-[28vmax] w-[28vmax] rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-[24vmax] w-[24vmax] rounded-full bg-primary/25 blur-3xl" />
            </div>

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {locale === 'en' ? 'Ready to act' : 'Listo para actuar'}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative mt-4 font-heading text-3xl font-extrabold leading-[1.05] md:text-4xl lg:text-[2.8rem]"
            >
              {locale === 'en' ? (
                <>
                  Don't wait.{' '}
                  <span className="text-secondary">Every day counts.</span>
                </>
              ) : (
                <>
                  No esperes.{' '}
                  <span className="text-secondary">Cada día cuenta.</span>
                </>
              )}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="relative mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg"
            >
              {locale === 'en'
                ? 'The sooner you start, the stronger your case. Free evaluation, no risk.'
                : 'Mientras más rápido empieces, más fuerte tu caso. Evaluación gratis, sin riesgo.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
              className="relative mt-8 grid gap-3 sm:grid-cols-2"
            >
              <a
                href={scheduleHref}
                className="group flex items-center gap-3 rounded-2xl bg-secondary p-4 text-white shadow-[0_10px_28px_-10px_rgba(186,147,194,0.7)] transition hover:bg-primary"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    {locale === 'en' ? 'Free, online' : 'Gratis, online'}
                  </p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-white">
                    {t('hero_lawyer.schedule_button', locale)}
                  </p>
                </div>
                <Icon name="arrow-right" size={16} className="text-white/80 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={`tel:${SITE.phone.tel}`}
                className="btn-uiverse group flex items-center gap-3 rounded-2xl p-4"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/15">
                  <Icon name="phone" size={18} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                    {locale === 'en' ? 'Talk now' : 'Habla ahora'}
                  </p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-white">
                    {SITE.phone.displayLong}
                  </p>
                </div>
                <Icon name="arrow-right" size={16} className="text-white/55 transition-all group-hover:translate-x-1 group-hover:text-white" />
              </a>
            </motion.div>
          </div>

          {/* IMAGE SIDE (RIGHT) */}
          <div className="relative order-1 aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[520px]">
            <img
              src="/images/finalcta.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-l from-deep/60 via-deep/30 to-transparent lg:bg-gradient-to-r lg:from-deep lg:via-deep/50 lg:to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 right-6 z-10 flex items-center gap-3 rounded-2xl border border-white/20 bg-deep/95 px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md md:bottom-8 md:right-8"
            >
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-white shadow-[0_6px_14px_-4px_rgba(186,147,194,0.7)]">
                <Icon name="check" size={18} strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-heading text-xl font-extrabold leading-none text-white">
                  100%
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                  {locale === 'en' ? 'No win, no fee' : 'Sin ganar, sin pagar'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============= Inline stat — editorial, no card ============= */
function InlineStat({ stat, locale, index }: { stat: Stat; locale: Locale; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const [displayValue, setDisplayValue] = useState<string>(stat.value);

  useEffect(() => {
    if (!inView) return;
    const match = stat.value.match(/^(\$?)([\d,]+)(.*)$/);
    if (!match) return;
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr!.replace(/,/g, ''), 10);
    if (!Number.isFinite(target)) return;

    const duration = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(target * eased);
      setDisplayValue(`${prefix}${cur.toLocaleString('en-US')}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group flex flex-col items-start gap-2 px-4 py-7 md:px-6 md:py-8 lg:py-10"
    >
      {/* Tiny accent dot + icon */}
      <span className="inline-flex items-center gap-2 text-secondary">
        <span className="h-1 w-1 rounded-full bg-secondary" />
        <Icon name={stat.icon} size={13} strokeWidth={2.4} />
      </span>

      {/* Huge number */}
      <p className="font-heading text-4xl font-extrabold leading-[0.95] tracking-tight text-ink md:text-5xl lg:text-[3.4rem]">
        {displayValue}
      </p>

      {/* Label */}
      <p className="text-[0.78rem] font-medium leading-snug text-muted md:text-[0.82rem]">
        {locale === 'en' ? stat.label.en : stat.label.es}
      </p>
    </motion.div>
  );
}
