import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon } from '@components/ui/Icon';
import { isPromoActive } from '@lib/promo';

const BANNER_SRC = '/banners/cambiaton-mundial-taylorsville.webp';
/** Delay antes de mostrar el banner: deja que el hero pinte primero. */
const OPEN_DELAY_MS = 1100;

const COPY = {
  es: {
    alt: 'Cambiatón en Car Injury Clinic: intercambia tus láminas del álbum del Mundial 2026. Sábado de 11:00 AM a 1:00 PM en 2997 W 4700 S, Taylorsville, UT 84129.',
    close: 'Cerrar promoción',
    label: 'Promoción: Cambiatón en Car Injury Clinic',
  },
  en: {
    alt: 'Sticker swap at Car Injury Clinic: trade your 2026 World Cup album stickers. Saturday, 11:00 AM to 1:00 PM at 2997 W 4700 S, Taylorsville, UT 84129.',
    close: 'Close promotion',
    label: 'Promotion: sticker swap at Car Injury Clinic',
  },
} as const;

interface Props {
  locale: Locale;
}

/**
 * Banner promocional que aparece al entrar al home (cada visita).
 * Overlay oscuro + imagen centrada + botón X. Cierra con ESC o click afuera.
 */
export default function PromoBanner({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const copy = COPY[locale];

  /* Precargar la imagen de inmediato y abrir tras el delay.
     Si la promo ya venció (ver @lib/promo), no se muestra nunca. */
  useEffect(() => {
    if (!isPromoActive()) return;
    const img = new Image();
    img.src = BANNER_SRC;
    const id = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  /* Lock scroll + ESC close + focus en el botón cerrar.
     También oculta el chat widget de GHL (z-index altísimo) mientras el modal está abierto. */
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('promo-open');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.documentElement.classList.remove('promo-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={copy.label}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Overlay oscuro: click afuera cierra y deja ver el fondo */}
          <button
            type="button"
            aria-label={copy.close}
            onClick={() => setOpen(false)}
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

            {/* Close X */}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
            >
              <Icon name="close" size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
