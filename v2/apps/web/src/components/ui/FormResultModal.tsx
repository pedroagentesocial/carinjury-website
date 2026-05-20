import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon } from '@components/ui/Icon';

interface Props {
  open: boolean;
  status: 'success' | 'error' | null;
  locale: Locale;
  /** Mensaje custom (sobrescribe el default). */
  message?: string;
  onClose: () => void;
}

const COPY = {
  es: {
    success_title: '¡Mensaje enviado!',
    success_msg: 'Recibimos tu información. Un especialista bilingüe te contactará en menos de 24 horas.',
    error_title: 'No pudimos enviar tu mensaje',
    error_msg: 'Hubo un problema al enviar. Por favor llamá directo o intentá de nuevo.',
    close: 'Cerrar',
    call: 'Llamar ahora',
    try_again: 'Intentar de nuevo',
  },
  en: {
    success_title: 'Message sent!',
    success_msg: 'We received your information. A bilingual specialist will contact you within 24 hours.',
    error_title: "We couldn't send your message",
    error_msg: 'There was a problem submitting. Please call directly or try again.',
    close: 'Close',
    call: 'Call now',
    try_again: 'Try again',
  },
} as const;

export default function FormResultModal({ open, status, locale, message, onClose }: Props) {
  const copy = COPY[locale];

  /* Lock scroll + ESC close */
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-result-title"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="absolute inset-0 -z-10 cursor-default bg-deep/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] md:p-9"
          >
            {/* Close X */}
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.close}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-line hover:text-ink"
            >
              <Icon name="close" size={16} />
            </button>

            {status === 'success' ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
                  className="relative mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-400/40"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                  <Icon name="check" size={40} strokeWidth={2.5} className="relative" />
                </motion.div>
                <h3 id="form-result-title" className="mt-5 font-heading text-2xl font-extrabold text-ink md:text-3xl">
                  {copy.success_title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                  {message ?? copy.success_msg}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(186,147,194,0.7)] transition hover:bg-primary"
                >
                  {copy.close}
                  <Icon name="check" size={14} strokeWidth={3} />
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-600 ring-2 ring-red-400/40">
                  <Icon name="close" size={40} strokeWidth={2.5} />
                </div>
                <h3 id="form-result-title" className="mt-5 font-heading text-2xl font-extrabold text-ink md:text-3xl">
                  {copy.error_title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                  {message ?? copy.error_msg}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`tel:+13852428571`}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary"
                  >
                    <Icon name="phone" size={14} />
                    {copy.call}
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-primary/40 hover:text-primary"
                  >
                    {copy.try_again}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
