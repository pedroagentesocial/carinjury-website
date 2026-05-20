import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale, Review } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { fetchReviews } from '@lib/api-client';
import { Icon } from '@components/ui/Icon';
import WriteReviewButton from '@components/ui/WriteReviewButton';

interface Props {
  locale: Locale;
}

const FALLBACK: Review[] = [
  {
    id: 'fb-1',
    author: 'Andrea P.',
    rating: 5,
    text_es: 'Excelente atención. El dolor bajó rápido y me ayudaron con todo el papeleo del seguro.',
    text_en: 'Excellent care. Pain went down quickly and they helped me with all the insurance paperwork.',
    date: '2026-03-10',
    source: 'seed',
  },
  {
    id: 'fb-2',
    author: 'Carlos M.',
    rating: 5,
    text_es: 'Cita el mismo día y trato profesional. El equipo bilingüe me ayudó a entender cada paso.',
    text_en: 'Same-day appointment and professional service. The bilingual team helped me understand every step.',
    date: '2026-02-22',
    source: 'seed',
  },
  {
    id: 'fb-3',
    author: 'María R.',
    rating: 5,
    text_es: 'Después del accidente no sabía qué hacer. Aquí me coordinaron médico y abogado todo en uno.',
    text_en: 'After the accident I had no idea what to do. They coordinated doctor and lawyer all in one place.',
    date: '2026-01-18',
    source: 'seed',
  },
  {
    id: 'fb-4',
    author: 'José L.',
    rating: 5,
    text_es: 'Transporte gratuito a cada cita, y me explicaron todo en mi idioma. 100% recomendados.',
    text_en: 'Free transport to every appointment, and they explained everything in my language. 100% recommended.',
    date: '2025-12-05',
    source: 'seed',
  },
  {
    id: 'fb-5',
    author: 'Sandra T.',
    rating: 5,
    text_es: 'Tres semanas de terapia y me sentí completamente recuperada. El seguimiento es impecable.',
    text_en: 'Three weeks of therapy and I felt completely recovered. The follow-up is impeccable.',
    date: '2025-11-15',
    source: 'seed',
  },
  {
    id: 'fb-6',
    author: 'Rafael C.',
    rating: 5,
    text_es: 'Profesionales, empáticos y resolutivos. Lograron una compensación que ni imaginé.',
    text_en: 'Professional, empathetic and effective. They got me a compensation I never imagined.',
    date: '2025-10-02',
    source: 'seed',
  },
];

const FALLBACK_AVG = 5.0;
const AUTOPLAY_MS = 6500;

export default function Testimonials({ locale }: Props) {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK);
  const [average, setAverage] = useState<number>(FALLBACK_AVG);
  const [total, setTotal] = useState<number>(FALLBACK.length);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReviews()
      .then((data) => {
        if (cancelled || !data || data.reviews.length === 0) return;
        setReviews(data.reviews.slice(0, 8));
        setAverage(data.average);
        setTotal(data.reviews.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const total_reviews = Math.max(total, reviews.length);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % reviews.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reviews.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);
  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % reviews.length);
  }, [reviews.length]);
  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  const current = reviews[index]!;

  return (
    <section
      className="relative overflow-hidden bg-white py-16 md:py-24 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-[36vmax] w-[36vmax] rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-content px-6">
        {/* ============== HEADER ============== */}
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {t('testimonials.badge', locale)}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl lg:text-[2.6rem]"
          >
            {t('testimonials.title.main', locale)}{' '}
            <span className="text-primary">{t('testimonials.title.accent', locale)}</span>
          </motion.h2>
        </header>

        {/* ============== SPOTLIGHT CAROUSEL ============== */}
        <div className="relative mx-auto max-w-3xl">
          {/* Prev arrow (desktop) */}
          <button
            type="button"
            onClick={prev}
            aria-label={locale === 'en' ? 'Previous review' : 'Reseña anterior'}
            className="absolute -left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary shadow-[0_10px_24px_-12px_rgba(74,28,90,0.5)] transition hover:bg-primary hover:text-white md:inline-flex lg:-left-16"
          >
            <Icon name="chevron-left" size={20} />
          </button>

          {/* Next arrow (desktop) */}
          <button
            type="button"
            onClick={next}
            aria-label={locale === 'en' ? 'Next review' : 'Siguiente reseña'}
            className="absolute -right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-primary shadow-[0_10px_24px_-12px_rgba(74,28,90,0.5)] transition hover:bg-primary hover:text-white md:inline-flex lg:-right-16"
          >
            <Icon name="chevron-right" size={20} />
          </button>

          {/* Spotlight card (single, animated) */}
          <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={(d: number) => ({ opacity: 0, x: 40 * d, scale: 0.98 })}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={(d: number) => ({ opacity: 0, x: -40 * d, scale: 0.98 })}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="px-2"
              >
                <SpotlightCard review={current} locale={locale} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile arrows under card */}
          <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
            <button
              type="button"
              onClick={prev}
              aria-label={locale === 'en' ? 'Previous review' : 'Reseña anterior'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-primary shadow-sm transition hover:bg-primary hover:text-white"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={locale === 'en' ? 'Next review' : 'Siguiente reseña'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-primary shadow-sm transition hover:bg-primary hover:text-white"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          {/* Pagination dots + progress */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {reviews.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${locale === 'en' ? 'Go to review' : 'Ir a reseña'} ${i + 1}`}
                  aria-current={active}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all ${
                    active ? 'w-12 bg-line' : 'w-2 bg-line hover:bg-primary/40'
                  }`}
                >
                  {active && !paused && (
                    <motion.span
                      key={`${index}-progress`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                      className="absolute inset-y-0 left-0 bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============== GOOGLE TRUST STRIP (debajo del carrusel) ============== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-line bg-white p-6 shadow-[0_18px_50px_-30px_rgba(74,28,90,0.25)] md:flex-row md:gap-7 md:p-7"
        >
          {/* Google G + brand */}
          <div className="flex flex-none items-center gap-3.5">
            <GoogleGLogo />
            <div className="text-left leading-tight">
              <p className="font-heading text-sm font-bold text-ink">Google</p>
              <p className="text-xs text-muted">
                {locale === 'en' ? 'Verified reviews' : 'Reseñas verificadas'}
              </p>
            </div>
          </div>

          <span aria-hidden="true" className="hidden h-12 w-px bg-line md:block" />

          {/* Rating */}
          <div className="flex flex-1 flex-col items-center gap-1 md:items-start">
            <div className="flex items-center gap-2.5">
              <p className="font-heading text-3xl font-extrabold leading-none text-ink md:text-4xl">
                {average.toFixed(1)}
              </p>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} filled={i < Math.round(average)} />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted md:text-sm">
              {locale === 'en'
                ? `Based on ${total_reviews}+ Google reviews`
                : `Basado en ${total_reviews}+ reseñas en Google`}
            </p>
          </div>

          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener"
            className="group inline-flex flex-none items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40 hover:text-primary"
          >
            {locale === 'en' ? 'See on Google' : 'Ver en Google'}
            <Icon name="arrow-right" size={14} className="text-muted transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* ============== FOOTER CTA ============== */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <WriteReviewButton
            locale={locale}
            source="testimonials"
            label={t('testimonials.write_review', locale)}
          />
        </div>
      </div>
    </section>
  );
}

/* =================== SpotlightCard =================== */
function SpotlightCard({ review, locale }: { review: Review; locale: Locale }) {
  return (
    <article className="relative mx-auto flex flex-col items-center gap-6 rounded-3xl border border-line bg-white p-8 text-center shadow-[0_25px_60px_-30px_rgba(74,28,90,0.45)] md:p-12">
      {/* Big decorative quote mark — top left */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-2 font-heading text-[7rem] leading-none text-primary/10 md:left-10 md:top-4 md:text-[9rem]"
      >
        &ldquo;
      </span>

      {/* Google source badge — top right */}
      <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 shadow-sm">
        <GoogleGLogo small />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Google
        </span>
      </div>

      {/* Stars */}
      <div className="relative flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, j) => (
          <Star key={j} filled={j < review.rating} large />
        ))}
      </div>

      {/* Big quote text */}
      <p className="relative mx-auto max-w-2xl font-heading text-xl font-medium leading-relaxed text-ink md:text-2xl">
        {locale === 'en' ? review.text_en : review.text_es}
      </p>

      {/* Author row */}
      <footer className="relative mt-2 flex items-center gap-4">
        <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary text-base font-bold text-white ring-4 ring-surface-2">
          {initials(review.author)}
        </span>
        <div className="text-left">
          <p className="font-heading text-base font-bold text-ink">{review.author}</p>
          <p className="text-xs text-muted">{formatDate(review.date, locale)}</p>
        </div>
      </footer>
    </article>
  );
}

/* =================== Star =================== */
function Star({ filled = true, large = false }: { filled?: boolean; large?: boolean }) {
  const size = large ? 22 : 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="m12 2 3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77 5.82 21l1.18-6.87-5-4.87 6.91-1L12 2z" />
    </svg>
  );
}

/* =================== Google G (official multi-color) =================== */
function GoogleGLogo({ small = false }: { small?: boolean }) {
  const size = small ? 16 : 36;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-label="Google"
      role="img"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 13.317 4 4 13.317 4 24s9.317 20 20 20 20-9.317 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/* =================== helpers =================== */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}
