import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { translations } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';

type DoctorKey = 'darwin' | 'ana' | 'westerman';
const DOCTORS: DoctorKey[] = ['darwin', 'ana', 'westerman'];

interface Props {
  locale: Locale;
  /** Static portrait path per doctor (served from /public). */
  doctorPhotos?: Partial<Record<DoctorKey, string>>;
}

/** Doctors with a portrait available. A doctor without an entry here (nor a
 *  path passed via props) renders an initials placeholder ("photo pending"). */
const FALLBACK_PHOTOS: Partial<Record<DoctorKey, string>> = {
  darwin: '/assets/img/chiro2.jpeg',
  ana: '/assets/img/chiro3.jpeg',
};

/** Initials from a doctor name, ignoring the "Dr."/"Dra." honorific. */
function getInitials(name: string): string {
  const words = name.replace(/^Dra?\.?\s*/i, '').trim().split(/\s+/);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

type CredentialKey = 'education' | 'licenses' | 'specialties' | 'education_continuous';
const CREDENTIALS: { key: CredentialKey; icon: IconName }[] = [
  { key: 'education', icon: 'shield' },
  { key: 'licenses', icon: 'check' },
  { key: 'specialties', icon: 'sparkles' },
  { key: 'education_continuous', icon: 'clock' },
];

interface Stat {
  value: string;
  label: string;
  icon: IconName;
}

export default function AboutContent({ locale, doctorPhotos }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  const stats: Stat[] = [
    { value: '5,000+', label: t('aboutus.hero.stats.patients', locale), icon: 'sparkles' },
    { value: '95%',    label: t('aboutus.hero.stats.recovery', locale), icon: 'check' },
    { value: '15+',    label: t('aboutus.hero.stats.experience', locale), icon: 'clock' },
  ];

  return (
    <>
      {/* =================== HERO — centered with team bubbles =================== */}
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
            {t('aboutus.hero.badge', locale)}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-[3.6rem]"
          >
            {locale === 'en' ? (
              <>
                The team{' '}
                <span className="text-secondary">behind every recovery.</span>
              </>
            ) : (
              <>
                El equipo detrás de{' '}
                <span className="text-secondary">cada recuperación.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg"
          >
            {t('aboutus.hero.subtitle', locale)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#team"
              className="group inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_rgba(186,147,194,0.7)] transition hover:bg-primary"
            >
              {locale === 'en' ? 'Meet the doctors' : 'Conocer al equipo'}
              <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={scheduleHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              <Icon name="calendar" size={15} />
              {locale === 'en' ? 'Schedule' : 'Agendar'}
            </a>
          </motion.div>

          {/* TEAM PHOTO — retrato del equipo con aspect fijo + object-cover
              (altura controlada en todos los anchos, nunca se estira) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mx-auto mt-10 w-full max-w-[17rem] sm:mt-12 sm:max-w-sm"
          >
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.03] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)] ring-1 ring-white/10">
              <img
                src="/images/team-group.webp"
                alt={locale === 'en' ? 'Car Injury Clinic team' : 'Equipo de Car Injury Clinic'}
                width={1067}
                height={1600}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep/80 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3.5 text-center">
                <span className="h-1 w-1 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                  {locale === 'en' ? 'Certified specialists' : 'Especialistas certificados'}
                </span>
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </section>

      {/* =================== STATS — editorial inline =================== */}
      <section className="relative overflow-hidden bg-white py-10 md:py-16">
        <div className="relative mx-auto max-w-content px-6">
          <div className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s, i) => (
              <InlineStat key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* =================== TEAM DETAIL =================== */}
      <section id="team" className="relative scroll-mt-32 overflow-hidden bg-surface-2 py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-0 h-[30vmax] w-[30vmax] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-content px-6">
          <header className="mx-auto mb-14 max-w-2xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {t('aboutus.team.badge', locale)}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl lg:text-[2.6rem]"
            >
              {t('aboutus.team.title', locale)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="mt-3 text-base text-muted md:text-lg"
            >
              {t('aboutus.team.subtitle', locale)}
            </motion.p>
          </header>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:gap-7">
            {DOCTORS.map((d, i) => {
              const doc = translations[locale].aboutus.doctors[d];
              const photo = doctorPhotos?.[d] ?? FALLBACK_PHOTOS[d];
              return (
                <motion.article
                  key={d}
                  id={`doctor-${d}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative scroll-mt-32 overflow-hidden rounded-3xl border border-line bg-white shadow-[0_18px_40px_-22px_rgba(74,28,90,0.3)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_60px_-22px_rgba(74,28,90,0.45)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-deep">
                    {photo ? (
                      <img
                        src={photo}
                        alt={doc.name}
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={500}
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/30 to-deep">
                        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 font-heading text-3xl font-extrabold text-white ring-2 ring-white/20">
                          {getInitials(doc.name)}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                          {locale === 'en' ? 'Photo coming soon' : 'Foto próximamente'}
                        </span>
                      </div>
                    )}
                    {/* Subtle bottom vignette */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep/40 to-transparent"
                    />
                    {/* Years of experience pill */}
                    {doc.experience && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-md backdrop-blur">
                        <Icon name="clock" size={11} strokeWidth={2.4} />
                        {doc.experience}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-7">
                    <h3 className="font-heading text-xl font-extrabold leading-tight text-ink md:text-2xl">
                      {doc.name}
                    </h3>
                    <p className="mt-1 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-secondary">
                      {doc.title}
                    </p>

                    <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">
                      {doc.bio}
                    </p>

                    {doc.specialties.items.length > 0 && (
                      <>
                        {/* Divider */}
                        <div className="my-5 h-px bg-line" />

                        {/* Specialties */}
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                          {doc.specialties.title}
                        </p>
                        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {doc.specialties.items.map((it) => (
                            <li key={it} className="flex items-start gap-2 text-[0.83rem] text-ink">
                              <span className="mt-1 inline-flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30">
                                <Icon name="check" size={8} strokeWidth={3.5} />
                              </span>
                              <span className="leading-snug">{it}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Credentials chips */}
                    {doc.credentials.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {doc.credentials.map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10px] font-medium text-muted"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== CREDENTIALS =================== */}
      <section className="relative overflow-hidden bg-white py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative mx-auto max-w-content px-6">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {t('aboutus.credentials.badge', locale)}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl"
            >
              {t('aboutus.credentials.title', locale)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="mt-3 text-base text-muted"
            >
              {t('aboutus.credentials.subtitle', locale)}
            </motion.p>
          </header>

          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CREDENTIALS.map((c, i) => (
              <motion.li
                key={c.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_36px_-20px_rgba(74,28,90,0.35)]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-[2px] origin-center scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-white group-hover:ring-primary/40">
                    <Icon name={c.icon} size={22} strokeWidth={2.1} />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold leading-tight text-ink">
                      {t(`aboutus.credentials.items.${c.key}.title` as TranslationKey, locale)}
                    </h3>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                      {t(`aboutus.credentials.items.${c.key}.description` as TranslationKey, locale)}
                    </p>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* =================== VALORES Y COMPROMISO COMUNITARIO =================== */}
      <ValuesSection locale={locale} />

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
                <p className="font-heading text-xl font-extrabold leading-none text-white">5,000+</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                  {t('aboutus.hero.stats.patients', locale)}
                </p>
              </div>
            </motion.div>
          </div>

          {/* CONTENT SIDE */}
          <div className="relative flex flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24">
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
              {locale === 'en' ? "Let's meet" : 'Conocémonos'}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative mt-4 font-heading text-3xl font-extrabold leading-[1.05] md:text-4xl lg:text-[2.6rem]"
            >
              {t('aboutus.cta.title', locale)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="relative mt-4 max-w-md text-base leading-relaxed text-white/75 md:text-lg"
            >
              {t('aboutus.cta.subtitle', locale)}
            </motion.p>

            {/* Quick features as pills */}
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              className="relative mt-6 flex flex-wrap gap-2"
            >
              {translations[locale].aboutus.cta.features.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80 backdrop-blur"
                >
                  <Icon name="check" size={11} strokeWidth={3} className="text-secondary" />
                  {f}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
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
                    {t('aboutus.cta.buttons.schedule', locale)}
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
        </div>
      </section>
    </>
  );
}

/* ============= Inline stat — editorial, no card (mismo pattern que /lawyer-approved) ============= */
/* ============= Sección de Valores y Compromiso Comunitario ============= */
interface Value {
  icon: IconName;
  title: { es: string; en: string };
  description: { es: string; en: string };
}

const VALUES: Value[] = [
  {
    icon: 'stethoscope',
    title: { es: 'Pacientes primero', en: 'Patients first' },
    description: {
      es: 'Cada decisión gira en torno a tu bienestar y recuperación completa.',
      en: 'Every decision revolves around your wellbeing and full recovery.',
    },
  },
  {
    icon: 'globe',
    title: { es: 'Sin barreras de idioma', en: 'No language barriers' },
    description: {
      es: 'Atención completa en español, inglés y portugués. Te entendemos como hablás.',
      en: 'Full care in Spanish, English and Portuguese. We understand you in your language.',
    },
  },
  {
    icon: 'car',
    title: { es: 'Sin barreras económicas', en: 'No financial barriers' },
    description: {
      es: 'Transporte gratis y sin costo inicial. La recuperación no debería tener precio.',
      en: 'Free transportation and no upfront cost. Recovery should not have a price.',
    },
  },
  {
    icon: 'sparkles',
    title: { es: 'Comunidad latina', en: 'Latin community' },
    description: {
      es: 'Servimos con orgullo a las familias latinas e inmigrantes de Utah desde 2010.',
      en: 'Proudly serving Utah\'s Latin and immigrant families since 2010.',
    },
  },
  {
    icon: 'shield',
    title: { es: 'Excelencia médica', en: 'Medical excellence' },
    description: {
      es: 'Equipo con +15 años de experiencia y formación continua en quiropráctica avanzada.',
      en: '15+ years of experience and continuous training in advanced chiropractic care.',
    },
  },
  {
    icon: 'check',
    title: { es: 'Compromiso transparente', en: 'Transparent commitment' },
    description: {
      es: 'Explicamos cada paso, manejamos tu seguro y respetamos tu tiempo.',
      en: 'We explain every step, handle your insurance and respect your time.',
    },
  },
];

function ValuesSection({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-surface-2 py-16 md:py-24 lg:py-28">
      {/* Sutil ambient — alternativa al dot-pattern de otras secciones */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/2 h-[36vmax] w-[36vmax] -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -right-32 top-0 h-[28vmax] w-[28vmax] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-content px-6">
        {/* Header — manifiesto centrado */}
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {locale === 'en' ? 'Our commitment' : 'Nuestro compromiso'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink sm:text-4xl md:text-5xl lg:text-[2.8rem]"
          >
            {locale === 'en' ? (
              <>
                More than a clinic —{' '}
                <span className="text-primary">a commitment to community.</span>
              </>
            ) : (
              <>
                Más que una clínica —{' '}
                <span className="text-primary">un compromiso con la comunidad.</span>
              </>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="mt-4 text-base leading-relaxed text-muted md:text-lg"
          >
            {locale === 'en'
              ? 'These are the principles that guide every appointment, every call, every recovery plan. Not slogans — practice.'
              : 'Estos son los principios que guían cada cita, cada llamada, cada plan de recuperación. No son slogans — son práctica.'}
          </motion.p>
        </header>

        {/* Grid 3x2 desktop / 2x3 tablet / 1x6 mobile */}
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {VALUES.map((v, i) => (
            <motion.li
              key={v.title.en}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.06 }}
            >
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_45px_-22px_rgba(74,28,90,0.4)] md:p-7">
                {/* Top accent — crece en hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-7 top-0 h-[2px] origin-center scale-x-0 bg-secondary transition-transform duration-500 group-hover:scale-x-100"
                />

                {/* Header: numbered + icon */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-white group-hover:ring-primary/40">
                    <Icon name={v.icon} size={22} strokeWidth={2.1} />
                  </span>
                  <span className="font-heading text-[10px] font-bold tracking-[0.2em] text-primary/35">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-lg font-bold leading-tight text-ink md:text-xl">
                  {locale === 'en' ? v.title.en : v.title.es}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  {locale === 'en' ? v.description.en : v.description.es}
                </p>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function InlineStat({ stat, index }: { stat: Stat; index: number }) {
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
      className="flex flex-col items-start gap-2 px-4 py-7 md:px-6 md:py-9"
    >
      <span className="inline-flex items-center gap-2 text-secondary">
        <span className="h-1 w-1 rounded-full bg-secondary" />
        <Icon name={stat.icon} size={13} strokeWidth={2.4} />
      </span>
      <p className="font-heading text-4xl font-extrabold leading-[0.95] tracking-tight text-ink md:text-5xl lg:text-[3.4rem]">
        {displayValue}
      </p>
      <p className="text-[0.78rem] font-medium leading-snug text-muted md:text-[0.82rem]">
        {stat.label}
      </p>
    </motion.div>
  );
}
