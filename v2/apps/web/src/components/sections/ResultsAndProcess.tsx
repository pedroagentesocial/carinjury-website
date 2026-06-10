import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { Icon, type IconName } from '@components/ui/Icon';
import { HOME_STATS, type StatItem } from '@lib/stats';

interface Props {
  locale: Locale;
}

interface Step {
  icon: IconName;
  title: string;
  description: string;
}

const STEP_ICONS: IconName[] = ['sparkles', 'shield', 'gavel', 'check'];

export default function ResultsAndProcess({ locale }: Props) {
  const stats = HOME_STATS;

  const steps: Step[] = STEP_ICONS.map((icon, i) => ({
    icon,
    title: t(`process_steps.steps.step${i + 1}.title` as TranslationKey, locale),
    description: t(`process_steps.steps.step${i + 1}.description` as TranslationKey, locale),
  }));

  return (
    <section className="relative overflow-hidden bg-surface-2 py-16 md:py-24 lg:py-28">
      {/* Subtle decoration — sin degradados planos */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Dot pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative mx-auto max-w-content px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          {/* ============== STATS COLUMN ============== */}
          <div className="flex flex-col">
            <ColumnHeader
              eyebrow={t('stats.badge', locale)}
              title={t('stats.title', locale)}
              subtitle={t('stats.subtitle', locale)}
            />

            <div className="mt-8 flex flex-col gap-4">
              {stats.map((s, i) => (
                <Counter key={s.labelKey} stat={s} index={i} locale={locale} />
              ))}
            </div>
          </div>

          {/* ============== PROCESS TIMELINE COLUMN ============== */}
          <div className="flex flex-col">
            <ColumnHeader
              eyebrow={t('process_steps.subtitle', locale)}
              title={t('process_steps.title', locale)}
              subtitle={t('process_steps.description', locale)}
            />

            <div className="relative mt-8">
              {/* Vertical connecting line */}
              <div
                aria-hidden="true"
                className="absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-primary/40 via-secondary/40 to-primary/10"
              />

              <ol className="relative flex flex-col gap-4">
                {steps.map((s, i) => (
                  <TimelineStep key={s.title} step={s} index={i} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== Sub-components ===================== */

function ColumnHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
      >
        <span className="h-1 w-1 rounded-full bg-secondary" />
        {eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="mt-3 font-heading text-3xl font-extrabold leading-tight text-ink md:text-4xl lg:text-[2.4rem]"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.14 }}
        className="mt-3 max-w-md text-base leading-relaxed text-muted"
      >
        {subtitle}
      </motion.p>
    </header>
  );
}

function Counter({ stat, index, locale }: { stat: StatItem; index: number; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const prefersReduced = useReducedMotion();
  const isPlaceholder = stat.value == null;
  /* Valor inicial = número final → SSR/HTML muestra la cifra real aunque el JS
     falle; nunca se queda pegado en 0. */
  const [n, setN] = useState(stat.value ?? 0);

  useEffect(() => {
    if (stat.value == null) return; // placeholder: sin animación
    if (prefersReduced) {
      setN(stat.value);
      return;
    }
    if (!inView) return;
    const target = stat.value;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(target); // garantiza el valor exacto al final
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, prefersReduced, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(74,28,90,0.35)] md:p-6"
    >
      {/* Left accent bar */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 origin-top scale-y-[0.4] bg-secondary transition-transform duration-500 group-hover:scale-y-100"
      />

      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        {isPlaceholder ? (
          <p className="min-w-0 font-heading text-base font-extrabold leading-snug tracking-tight text-primary md:text-lg">
            {stat.placeholder}
          </p>
        ) : (
          <p className="font-heading text-4xl font-extrabold leading-none tracking-tight text-primary tabular-nums md:text-5xl">
            {stat.prefix}
            {n.toLocaleString('en-US')}
            {stat.suffix}
          </p>
        )}
        <p className="min-w-0 text-sm font-medium leading-snug text-muted md:text-base">
          {t(stat.labelKey, locale)}
        </p>
      </div>
    </motion.div>
  );
}

function TimelineStep({ step, index }: { step: Step; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: 0.08 + index * 0.08 }}
      className="group relative flex items-start gap-4"
    >
      {/* Icon + step badge */}
      <div className="relative flex-none">
        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_8px_20px_-8px_rgba(122,46,135,0.6)] ring-4 ring-surface-2 transition group-hover:bg-[#6a3f75]">
          <Icon name={step.icon} size={22} strokeWidth={2.1} />
        </span>
        <span className="absolute -right-1 -top-1 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-extrabold text-white shadow-md ring-2 ring-surface-2">
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-2 pt-1.5">
        <h3 className="font-heading text-lg font-bold leading-tight text-ink md:text-xl">
          {step.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted md:text-[0.95rem]">
          {step.description}
        </p>
      </div>
    </motion.li>
  );
}
