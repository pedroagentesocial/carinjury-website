import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';
import ContactSection from './ContactSection';

interface Props {
  locale: Locale;
}

type ServiceSlug =
  | 'chiropractic'
  | 'rehabilitation'
  | 'physical_therapy'
  | 'hot_cold_therapy'
  | 'massage'
  | 'ultrasound'
  | 'tens'
  | 'xray'
  | 'mri'
  | 'concussion'
  | 'second_opinions'
  | 'pain_management'
  | 'surgical_consultations'
  | 'free_transport'
  | 'bilingual';

type GroupKey = 'treatment' | 'diagnostics' | 'specialized' | 'support';

const GROUP_ITEMS: Record<GroupKey, ServiceSlug[]> = {
  treatment: ['chiropractic', 'hot_cold_therapy', 'massage', 'ultrasound', 'tens'],
  diagnostics: ['xray', 'mri', 'concussion', 'second_opinions'],
  specialized: ['pain_management', 'surgical_consultations'],
  support: ['free_transport', 'bilingual'],
};

const SERVICE_ICONS: Record<ServiceSlug, IconName> = {
  chiropractic: 'stethoscope',
  rehabilitation: 'sparkles',
  physical_therapy: 'stethoscope',
  hot_cold_therapy: 'sparkles',
  massage: 'sparkles',
  ultrasound: 'sound',
  tens: 'sparkles',
  xray: 'shield',
  mri: 'shield',
  concussion: 'shield',
  second_opinions: 'check',
  pain_management: 'sparkles',
  surgical_consultations: 'stethoscope',
  free_transport: 'car',
  bilingual: 'globe',
};

const SERVICE_IMAGES: Record<ServiceSlug, string> = {
  chiropractic: '/assets/img/chiro.webp',
  rehabilitation: '/assets/img/rehab.webp',
  physical_therapy: '/assets/img/phisycal.jpg.webp',
  hot_cold_therapy: '/assets/img/hotcold.webp',
  massage: '/assets/img/masaje.jpeg',
  ultrasound: '/assets/img/ultrasonido.jpeg',
  tens: '/assets/img/tens.jpeg',
  xray: '/assets/img/xray.jpg',
  mri: '/assets/img/mri.jpg',
  concussion: '/assets/img/concussion.jpeg',
  second_opinions: '/assets/img/second-opinion.jpeg',
  pain_management: '/assets/img/pain-management.jpeg',
  surgical_consultations: '/assets/img/surgery-consult.jpeg',
  free_transport: '/assets/img/transporte.jpg',
  bilingual: '/assets/img/bilingue.jpg',
};

const GROUPS: GroupKey[] = ['treatment', 'diagnostics', 'specialized', 'support'];

export default function ServicesCatalog({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  /* Active section indicator for sticky tabs */
  const [activeGroup, setActiveGroup] = useState<GroupKey>('treatment');
  const sectionRefs = useRef<Record<GroupKey, HTMLElement | null>>({
    treatment: null,
    diagnostics: null,
    specialized: null,
    support: null,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-group') as GroupKey | null;
            if (key) setActiveGroup(key);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    GROUPS.forEach((g) => {
      const el = sectionRefs.current[g];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const totalServices = GROUPS.reduce((sum, g) => sum + GROUP_ITEMS[g].length, 0);

  return (
    <>
      {/* =================== HERO =================== */}
      <section className="relative isolate overflow-hidden bg-deep pb-20 pt-32 text-white md:pb-24 md:pt-36">
        {/* Background — sin degradado plano */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
        />

        <div className="relative mx-auto max-w-content px-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {t('hero_services.badge', locale)}
            <span className="ml-1 inline-flex h-4 items-center rounded-full bg-secondary/20 px-1.5 text-[10px] text-secondary">
              {totalServices}
            </span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 max-w-3xl font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]"
          >
            {locale === 'en' ? (
              <>
                Specialized care.{' '}
                <span className="text-secondary">All under one roof.</span>
              </>
            ) : (
              <>
                Atención especializada.{' '}
                <span className="text-secondary">Todo en un solo lugar.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg"
          >
            {t('hero_services.subtitle', locale)}
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
              {t('services_page.schedule_evaluation', locale)}
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
        </div>
      </section>

      {/* =================== STICKY CATEGORY TABS =================== */}
      <div
        className="sticky top-[72px] z-30 border-y border-line bg-surface-2/85 backdrop-blur-md md:top-[88px]"
        role="navigation"
        aria-label={t('services_page.nav_label', locale)}
      >
        <div className="mx-auto max-w-content px-6">
          <div className="-mx-2 flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {GROUPS.map((g) => {
              const active = activeGroup === g;
              return (
                <a
                  key={g}
                  href={`#${g}`}
                  aria-current={active}
                  className={`relative inline-flex flex-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-primary text-white shadow-[0_6px_18px_-6px_rgba(122,46,135,0.55)]'
                      : 'text-ink/65 hover:bg-primary/[0.06] hover:text-primary'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      active ? 'bg-secondary' : 'bg-primary/30'
                    }`}
                  />
                  {t(`services_page.groups.${g}.label` as TranslationKey, locale)}
                  <span className={`text-[11px] font-bold ${active ? 'text-white/70' : 'text-muted'}`}>
                    {GROUP_ITEMS[g].length}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================== CATALOG =================== */}
      <div className="relative bg-white">
        {/* Subtle background pattern across all groups */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:32px_32px]"
        />

        {GROUPS.map((group, gi) => (
          <section
            key={group}
            id={group}
            data-group={group}
            ref={(el) => {
              sectionRefs.current[group] = el;
            }}
            className="relative scroll-mt-32 py-16 md:py-20"
          >
            <div className="relative mx-auto max-w-content px-6">
              {/* Group header — minimalista */}
              <header className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-5 md:mb-10">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {String(gi + 1).padStart(2, '0')}
                    <span className="h-px w-6 bg-primary/30" />
                    {locale === 'en' ? 'Category' : 'Categoría'}
                  </span>
                  <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-2 font-heading text-2xl font-extrabold leading-tight text-ink md:text-3xl"
                  >
                    {t(`services_page.groups.${group}.label` as TranslationKey, locale)}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="mt-2 max-w-xl text-sm text-muted md:text-[0.95rem]"
                  >
                    {t(`services_page.groups.${group}.description` as TranslationKey, locale)}
                  </motion.p>
                </div>
                <span className="hidden flex-none rounded-full bg-primary/[0.06] px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/15 md:inline-block">
                  {GROUP_ITEMS[group].length}{' '}
                  {locale === 'en' ? 'services' : 'servicios'}
                </span>
              </header>

              {/* Service cards */}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GROUP_ITEMS[group].map((slug, i) => (
                  <motion.li
                    key={slug}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    id={slug}
                    className="scroll-mt-32"
                  >
                    <a
                      href={scheduleHref}
                      aria-label={t(`services_page.items.${slug}.title` as TranslationKey, locale)}
                      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_12px_30px_-15px_rgba(74,28,90,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(74,28,90,0.55)] sm:aspect-[5/6]"
                    >
                      {/* Background image */}
                      <img
                        src={SERVICE_IMAGES[slug]}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                      />

                      {/* Dark gradient overlay */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/10 transition-opacity duration-300 group-hover:from-deep group-hover:via-deep/70"
                      />

                      {/* Hover accent line bottom */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-5 bottom-0 h-[3px] origin-center scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
                      />

                      {/* Top icon + arrow */}
                      <div className="relative z-10 flex items-start justify-between p-5">
                        <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] text-white backdrop-blur-md transition group-hover:border-secondary/60 group-hover:bg-secondary/30">
                          <Icon name={SERVICE_ICONS[slug]} size={20} strokeWidth={2.1} />
                        </span>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          <Icon name="arrow-right" size={15} />
                        </span>
                      </div>

                      {/* Bottom content */}
                      <div className="relative z-10 mt-auto p-5 text-white">
                        <h3 className="font-heading text-[1.15rem] font-extrabold leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] md:text-lg">
                          {t(`services_page.items.${slug}.title` as TranslationKey, locale)}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[0.84rem] leading-snug text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
                          {t(`services_page.items.${slug}.description` as TranslationKey, locale)}
                        </p>
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* =================== CONTACT SECTION — mismo bloque que el home =================== */}
      <ContactSection locale={locale} />

      {/* =================== FINAL CTA — split image + content =================== */}
      <section className="relative isolate overflow-hidden bg-deep text-white">
        <div className="relative grid lg:grid-cols-2">
          {/* IMAGE SIDE */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]">
            <img
              src="/images/finalcta.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-deep/60 via-deep/30 to-transparent lg:bg-gradient-to-l lg:from-deep lg:via-deep/50 lg:to-transparent"
            />
            {/* Floating stat overlay */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/20 bg-deep/95 px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md md:bottom-8 md:left-8"
            >
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-white shadow-[0_6px_14px_-4px_rgba(186,147,194,0.7)]">
                <Icon name="sparkles" size={18} strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-heading text-xl font-extrabold leading-none text-white">
                  5,000+
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                  {locale === 'en' ? 'Patients treated' : 'Pacientes tratados'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* CONTENT SIDE */}
          <div className="relative flex flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24">
            {/* Decorative blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-[28vmax] w-[28vmax] rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-[24vmax] w-[24vmax] rounded-full bg-primary/25 blur-3xl" />
            </div>

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {locale === 'en' ? "Let's talk" : 'Hablemos'}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative mt-4 font-heading text-3xl font-extrabold leading-[1.05] md:text-4xl lg:text-[2.8rem]"
            >
              {t('services_page.closer.title', locale)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="relative mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg"
            >
              {t('services_page.closer.sub', locale)}
            </motion.p>

            {/* CTAs as cards (different from current buttons) */}
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
                    {t('services_page.closer.cta', locale)}
                  </p>
                </div>
                <Icon name="arrow-right" size={16} className="text-white/80 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={`tel:${SITE.phone.tel}`}
                aria-label={t('services_page.closer.call_aria', locale)}
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
        </div>
      </section>
    </>
  );
}

