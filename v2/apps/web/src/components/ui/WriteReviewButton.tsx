import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
  /** Source tag for analytics (testimonials, footer, etc.) */
  source?: string;
  /** Render del botón: si querés que sea full custom desde afuera. */
  children?: React.ReactNode;
  /** Si no se pasan children, mostramos el botón default con esta clase. */
  className?: string;
  /** Texto del botón default */
  label?: string;
}

const COPY = {
  es: {
    title: 'Tu reseña hace la diferencia',
    subtitle: 'Cuando dejás una reseña en Google, ayudás a más víctimas de accidentes a encontrarnos.',
    benefit_1: 'Te toma menos de 60 segundos',
    benefit_2: 'Necesitás una cuenta de Google (Gmail)',
    benefit_3: 'Podés dejarla anónima si querés',
    rating_hint: 'Calificá tu experiencia',
    continue: 'Continuar a Google Reviews',
    cancel: 'Cancelar',
    new_tab: 'Se abre en una ventana nueva',
  },
  en: {
    title: 'Your review makes a difference',
    subtitle: 'When you leave a Google review, you help more accident victims find us.',
    benefit_1: 'Takes less than 60 seconds',
    benefit_2: 'Requires a Google account (Gmail)',
    benefit_3: 'You can leave it anonymous if you prefer',
    rating_hint: 'Rate your experience',
    continue: 'Continue to Google Reviews',
    cancel: 'Cancel',
    new_tab: 'Opens in a new window',
  },
} as const;

export default function WriteReviewButton({
  locale,
  source = 'unknown',
  children,
  className,
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const copy = COPY[locale];

  /* Lock body scroll when modal open */
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const track = (name: string, params?: Record<string, unknown>) => {
    try {
      (window as unknown as { trackEvent?: (n: string, p?: Record<string, unknown>) => void }).trackEvent?.(name, { ...params, source });
    } catch {
      /* analytics is optional */
    }
  };

  const handleOpenModal = () => {
    track('write_review_modal_open');
    setOpen(true);
  };

  const handleContinue = () => {
    track('write_review_continued', selectedStar ? { rating: selectedStar } : undefined);
    window.open(SITE.writeReviewUrl, '_blank', 'noopener');
    /* Modal closes after a tick para que la nueva pestaña abra sin glitch */
    setTimeout(() => setOpen(false), 200);
  };

  const handleCancel = () => {
    track('write_review_cancelled');
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      {children ? (
        <button type="button" onClick={handleOpenModal} className="contents">
          {children}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          className={className ?? 'btn-uiverse-primary group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold'}
        >
          <GoogleGLogo small />
          {label ?? (locale === 'en' ? 'Write a review' : 'Escribir reseña')}
          <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label={copy.cancel}
              onClick={handleCancel}
              className="absolute inset-0 -z-10 cursor-default bg-deep/70 backdrop-blur-sm"
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] md:p-8"
            >
              {/* Close X */}
              <button
                type="button"
                onClick={handleCancel}
                aria-label={copy.cancel}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-line hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>

              {/* G logo header */}
              <div className="flex justify-center">
                <GoogleGLogo />
              </div>

              <h3
                id="review-modal-title"
                className="mt-4 text-center font-heading text-2xl font-extrabold leading-tight text-ink md:text-[1.6rem]"
              >
                {copy.title}
              </h3>
              <p className="mt-2 text-center text-[0.95rem] leading-relaxed text-muted">
                {copy.subtitle}
              </p>

              {/* Star rating prompt — preselecciona la calificación que mostrará Google */}
              <div className="mt-6">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {copy.rating_hint}
                </p>
                <div
                  className="mt-3 flex items-center justify-center gap-1.5"
                  onMouseLeave={() => setHoverStar(null)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hoverStar ?? selectedStar ?? 0) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                        onMouseEnter={() => setHoverStar(n)}
                        onClick={() => setSelectedStar(n)}
                        className={`transition ${active ? 'text-amber-400' : 'text-line'} hover:scale-110`}
                      >
                        <StarIcon filled={active} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Benefits checklist */}
              <ul className="mt-6 grid gap-2 text-[0.85rem] text-ink">
                {[copy.benefit_1, copy.benefit_2, copy.benefit_3].map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30">
                      <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="mt-7 grid gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="btn-uiverse-primary group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold"
                >
                  <GoogleGLogo small white />
                  {copy.continue}
                  <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-center text-[11px] text-muted">{copy.new_tab}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- mini SVGs ---------- */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77 5.82 21l1.18-6.87-5-4.87 6.91-1L12 2z" />
    </svg>
  );
}

function GoogleGLogo({ small = false, white = false }: { small?: boolean; white?: boolean }) {
  const size = small ? 16 : 36;
  if (white) {
    /* Versión monocromática para botón rosa (mantiene legibilidad) */
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Google" role="img">
        <path
          fill="white"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 13.317 4 4 13.317 4 24s9.317 20 20 20 20-9.317 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Google" role="img">
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
