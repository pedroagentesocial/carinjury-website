import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SORTEO_PREMIO } from '../../../data/sorteo';
import { useT } from '../../../lib/useT';

// Aviso de entrada del sorteo. Aparece una vez tras un breve retardo y no
// reaparece en 7 días tras descartarse o entrar al sorteo.
const STORAGE_KEY = 'sorteo_popup_v1';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1300;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function recentlyDismissed(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return false;
    return Date.now() - Number(v) < COOLDOWN_MS;
  } catch {
    return false;
  }
}

export default function SorteoPopup() {
  const [open, setOpen] = useState(false);
  const { t } = useT();

  useEffect(() => {
    // No molestar si ya está en el sorteo/admin, o si ya lo vio hace poco.
    const path = window.location.pathname;
    if (path.startsWith('/sorteo') || path.startsWith('/admin')) return;
    if (recentlyDismissed()) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  // Escape para cerrar + bloquear scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sorteo-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
          className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-clay-900/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sorteo-popup-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Franja dorada superior (acento de marca) */}
            <div className="h-1.5 w-full bg-gold-400" aria-hidden="true" />

            {/* Cerrar */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-clay-400 transition-colors hover:bg-clay-100 hover:text-clay-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-500"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="px-6 pb-7 pt-7 text-center sm:px-8">
              <span className="inline-block rounded-full bg-gold-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-800">
                {t('sorteo.popup.eyebrow', 'Participa gratis')}
              </span>

              <h2
                id="sorteo-popup-title"
                className="mt-5 font-serif text-2xl font-bold leading-tight text-clay-800 sm:text-3xl"
              >
                {t('sorteo.popup.win', 'Gánate uno de')}{' '}
                <span className="text-gold-600">
                  {SORTEO_PREMIO.cantidad} {t('sorteo.popup.bikes', 'álbumes del Mundial')}
                </span>
              </h2>

              <p className="mt-3 inline-block rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">
                {t('sorteo.popup.prize_detail', '⚽ Álbum oficial del Mundial 2026')}
              </p>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-clay-600">
                {t(
                  'sorteo.popup.sub',
                  'Regístrate sin costo y suma boletos siguiéndonos e invitando amigos.',
                )}
              </p>
              <p className="mt-3 inline-block rounded-full bg-moss-50 px-3 py-1 text-xs font-semibold text-moss-700">
                {t('sorteo.popup.deadline', 'Solo Utah · participa gratis · fechas por anunciar')}
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href="/sorteo"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 font-bold text-clay-900 shadow-glow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('sorteo.popup.cta', 'Participar gratis')}
                </a>
                <button
                  type="button"
                  onClick={dismiss}
                  className="py-1 text-sm font-medium text-clay-500 transition-colors hover:text-clay-800"
                >
                  {t('sorteo.popup.later', 'Quizás luego')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
