import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';
import ContactForm from './ContactForm';

interface Props {
  locale: Locale;
}

const COPY = {
  es: {
    topBenefits: ['Citas el mismo día', 'Sin costo inicial', 'Trabajamos con abogados'],
    heroEyebrow: '¿Tuviste un accidente de auto?',
    heroTitle: 'Atención inmediata. Sin costo inicial.',
    heroSub: 'Equipo médico bilingüe + apoyo legal coordinado. Evaluación gratuita en minutos.',
    symptomsTitle: '¿Tienes alguno de estos síntomas?',
    symptoms: [
      { icon: 'shield', label: 'Dolor de cuello' },
      { icon: 'shield', label: 'Dolor de espalda' },
      { icon: 'shield', label: 'Latigazo cervical' },
      { icon: 'shield', label: 'Dolores de cabeza' },
    ] as { icon: IconName; label: string }[],
    stepsTitle: 'Un proceso simple',
    steps: [
      { title: 'Evaluamos', desc: 'Diagnóstico gratuito de tu lesión, sin compromiso.' },
      { title: 'Tratamos', desc: 'Plan de terapia personalizado para tu caso.' },
      { title: 'Recuperas', desc: 'Volvemos a tu vida normal, sin secuelas.' },
    ],
    trust: [
      { value: '5,000+', label: 'casos atendidos' },
      { value: '95%', label: 'tasa de recuperación' },
      { value: '24h', label: 'tiempo de respuesta' },
    ],
    formTitle: 'Agenda evaluación gratis',
    formSub: 'Te llamamos en menos de 24 horas. Equipo bilingüe.',
    stickyCta: 'Llamar ahora',
    finalTitle: 'No esperes más. Cada día cuenta.',
    finalSub: 'Cuanto antes empieces el tratamiento, mejor será tu recuperación.',
    finalCta: 'Agenda gratis',
  },
  en: {
    topBenefits: ['Same-day appointments', 'No upfront cost', 'We work with attorneys'],
    heroEyebrow: 'Had a car accident?',
    heroTitle: 'Immediate care. No upfront cost.',
    heroSub: 'Bilingual medical team + coordinated legal support. Free evaluation in minutes.',
    symptomsTitle: 'Do you have any of these symptoms?',
    symptoms: [
      { icon: 'shield', label: 'Neck pain' },
      { icon: 'shield', label: 'Back pain' },
      { icon: 'shield', label: 'Whiplash' },
      { icon: 'shield', label: 'Headaches' },
    ] as { icon: IconName; label: string }[],
    stepsTitle: 'A simple process',
    steps: [
      { title: 'Evaluate', desc: 'Free diagnosis of your injury, no commitment.' },
      { title: 'Treat', desc: 'Therapy plan personalized for your case.' },
      { title: 'Recover', desc: 'Back to your normal life, without after-effects.' },
    ],
    trust: [
      { value: '5,000+', label: 'cases handled' },
      { value: '95%', label: 'recovery rate' },
      { value: '24h', label: 'response time' },
    ],
    formTitle: 'Schedule free evaluation',
    formSub: 'We call you within 24 hours. Bilingual team.',
    stickyCta: 'Call now',
    finalTitle: 'Do not wait. Every day counts.',
    finalSub: 'The sooner you start treatment, the better your recovery will be.',
    finalCta: 'Schedule free',
  },
} as const;

export default function AdLanding({ locale }: Props) {
  const c = COPY[locale];

  return (
    <>
      {/* TOP BENEFIT BAR */}
      <div className="bg-deep text-white">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs font-medium tracking-wide">
          {c.topBenefits.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5">
              <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* COMPACT HEADER */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
          <a href={locale === 'en' ? '/en/' : '/'} className="flex items-center">
            <img src={SITE.logo} alt={SITE.name} className="h-10 w-auto" decoding="async" fetchPriority="high" />
          </a>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
          >
            <Icon name="phone" size={16} />
            <span className="hidden sm:inline">{SITE.phone.display}</span>
            <span className="sm:hidden">{locale === 'en' ? 'Call' : 'Llamar'}</span>
          </a>
        </div>
      </header>

      {/* HERO + FORM */}
      <section className="relative isolate overflow-hidden bg-deep py-16 text-white md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(186,147,194,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(122,46,135,0.45), transparent 45%)',
          }}
        />
        <div className="relative mx-auto grid max-w-content gap-10 px-4 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {c.heroEyebrow}
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {c.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">{c.heroSub}</p>

            <ul className="mt-8 space-y-3">
              {c.topBenefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary/25 text-secondary ring-1 ring-secondary/40">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                  <span className="text-white/90">{b}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <ContactForm locale={locale} />
        </div>
      </section>

      {/* SYMPTOMS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-content px-4">
          <h2 className="text-center font-heading text-2xl font-bold text-ink md:text-4xl">
            {c.symptomsTitle}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.symptoms.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface-2 p-6 text-center shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                  <Icon name={s.icon} size={22} />
                </span>
                <p className="font-semibold text-ink">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="bg-surface-2 py-16">
        <div className="mx-auto max-w-content px-4">
          <h2 className="text-center font-heading text-2xl font-bold text-ink md:text-4xl">
            {c.stepsTitle}
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {c.steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <span className="absolute -top-3 left-6 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow ring-2 ring-white">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-heading text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-content gap-4 px-4 sm:grid-cols-3">
          {c.trust.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-line bg-surface-2 p-6 text-center"
            >
              <p className="font-heading text-4xl font-bold text-primary">{t.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{t.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-deep py-16 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, rgba(186,147,194,0.35), transparent 45%), radial-gradient(circle at 70% 70%, rgba(122,46,135,0.4), transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-content px-4 text-center">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold leading-tight md:text-5xl">
            {c.finalTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{c.finalSub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
            >
              {c.finalCta}
              <Icon name="arrow-right" size={18} />
            </a>
            <a
              href={`tel:${SITE.phone.tel}`}
              className="btn-uiverse inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
            >
              <Icon name="phone" size={18} />
              {SITE.phone.display}
            </a>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="bg-deep py-6 text-center text-xs text-white/55">
        <p>
          © {new Date().getFullYear()} {SITE.name}. {locale === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          <span className="mx-2">·</span>
          <a href={locale === 'en' ? '/en/privacy' : '/privacy'} className="underline hover:text-secondary">
            {locale === 'en' ? 'Privacy' : 'Privacidad'}
          </a>
        </p>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] backdrop-blur md:hidden">
        <a
          href={`tel:${SITE.phone.tel}`}
          className="btn-uiverse-primary flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold"
        >
          <Icon name="phone" size={18} />
          {c.stickyCta} {SITE.phone.display}
        </a>
      </div>
    </>
  );
}
