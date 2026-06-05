import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon } from '@components/ui/Icon';
import { isPromoActive } from '@lib/promo';

const BANNER_SRC = '/banners/cambiaton-mundial.webp';
const DISMISS_KEY = 'promo-ad-dismissed';
/** Delay antes de aparecer: deja que la página pinte primero. */
const SHOW_DELAY_MS = 1500;

const COPY = {
  es: {
    alt: 'Cambiatón en Car Injury Clinic: intercambia tus láminas del álbum del Mundial 2026. Sábado de 11:00 AM a 1:00 PM en 2997 W 4700 S, West Valley City, UT 84118.',
    expand: 'Ver promoción del Cambiatón',
    close: 'Cerrar promoción',
    dismiss: 'Quitar anuncio',
  },
  en: {
    alt: 'Sticker swap at Car Injury Clinic: trade your 2026 World Cup album stickers. Saturday, 11:00 AM to 1:00 PM at 2997 W 4700 S, West Valley City, UT 84118.',
    expand: 'View sticker swap promotion',
    close: 'Close promotion',
    dismiss: 'Dismiss ad',
  },
} as const;

interface Props {
  locale: Locale;
}

/**
 * Anuncio flotante de la promo (páginas interiores). Miniatura abajo a la
 * izquierda: click expande la imagen completa, X lo quita por el resto de
 * la sesión. Vence solo con la fecha de @lib/promo (no requiere deploy).
 */
export default function PromoAd({ locale }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const copy = COPY[locale];

  /* Mostrar tras el delay, salvo promo vencida o ya descartado en esta sesión */
  useEffect(() => {
    if (!isPromoActive()) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* sessionStorage bloqueado: mostrar igual */
    }
    const id = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  }

  /* Vista expandida: lock scroll + ESC + ocultar chat widget (html.promo-open) */
  useEffect(() => {
    if (!expanded) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('promo-open');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.documentElement.classList.remove('promo-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  return (
    <>
      <AnimatePresence>
        {visible && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-5 z-40"
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={copy.expand}
              className="group block overflow-hidden rounded-xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/25 transition-transform duration-300 hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <img
                src={BANNER_SRC}
                alt={copy.alt}
                width={2172}
                height={724}
                loading="lazy"
                decoding="async"
                className="block h-auto w-44 sm:w-60"
              />
            </button>

            {/* Quitar anuncio */}
            <button
              type="button"
              onClick={dismiss}
              aria-label={copy.dismiss}
              className="absolute -right-2.5 -top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-deep text-white shadow-md ring-1 ring-white/30 transition hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Icon name="close" size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Imagen completa al hacer click (mismo patrón que el modal del home) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={copy.expand}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          >
            <button
              type="button"
              aria-label={copy.close}
              onClick={() => setExpanded(false)}
              className="absolute inset-0 -z-10 cursor-default bg-deep/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src={BANNER_SRC}
                alt={copy.alt}
                width={2172}
                height={724}
                decoding="async"
                className="block h-auto max-h-[82svh] w-auto max-w-[min(92vw,900px)] rounded-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/15"
              />

              <button
                ref={closeRef}
                type="button"
                onClick={() => setExpanded(false)}
                aria-label={copy.close}
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
              >
                <Icon name="close" size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
