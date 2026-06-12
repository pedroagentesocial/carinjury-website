import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Popup promocional con carrusel: rota entre la Cambiatón (intercambio de
// láminas) y el sorteo de álbumes. Aparece ~1.3s tras cargar, se puede cerrar
// y no reaparece por 7 días. No se muestra en /sorteo ni /admin.

const STORAGE_KEY = 'cic_promo_popup_v1';
const DISMISS_DAYS = 7;
const AUTO_MS = 6000;
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=2997+W+4700+S+Taylorsville+UT+84129';
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

type Slide = { id: string };
const SLIDES: Slide[] = [{ id: 'cambiaton' }, { id: 'sorteo' }];

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Mostrar (con guardas de ruta y de "ya cerrado").
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/sorteo') || path.startsWith('/admin')) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && Date.now() < Number(raw)) return;
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setOpen(true), 1300);
    return () => clearTimeout(t);
  }, []);

  // Auto-avance.
  useEffect(() => {
    if (!open || paused) return;
    const t = setTimeout(() => setIdx((v) => (v + 1) % SLIDES.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [open, paused, idx]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_DAYS * 86400000));
    } catch {
      /* ignore */
    }
  }, []);

  const go = (n: number) => setIdx((n + SLIDES.length) % SLIDES.length);

  const current = SLIDES[idx].id;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

          {/* Tarjeta */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.35, ease: EASE }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Cerrar */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Slides */}
            <div className="relative min-h-[360px]">
              <AnimatePresence mode="wait">
                {current === 'cambiaton' ? (
                  <motion.div
                    key="cambiaton"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex h-full min-h-[360px] flex-col"
                  >
                    <img
                      src="/banners/v2.png"
                      alt="Cambiatón en Car Injury Clinic — intercambia tus láminas del álbum del Mundial 2026"
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex flex-1 flex-col justify-center px-6 py-5 text-center">
                      <h2 className="font-serif text-xl font-bold text-[#4A1D6B]">
                        🎟️ Cambiatón — intercambia tus láminas
                      </h2>
                      <p className="mt-1.5 text-sm text-gray-600">
                        Sábados de 11:00 a 1:00 PM · 2997 W 4700 S, Taylorsville, UT.
                        ¡Trae tus repetidas y completa tu álbum del Mundial!
                      </p>
                      <a
                        href={MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-auto mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A2E87] px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                      >
                        📍 Cómo llegar
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sorteo"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex h-full min-h-[360px] flex-col items-center justify-center bg-gradient-to-br from-[#4A1D6B] via-[#7A2E87] to-[#2A1140] px-6 py-9 text-center text-white"
                  >
                    <span className="inline-block rounded-full bg-gold-400 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#3A1456]">
                      ⚽ Participa gratis
                    </span>
                    <h2 className="mt-5 font-serif text-2xl font-bold leading-tight sm:text-3xl">
                      Gánate uno de <span className="text-gold-300">3 álbumes</span> del Mundial
                    </h2>
                    <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-200">
                      ⚽ Álbum oficial del Mundial 2026 · 1 ganador por álbum
                    </p>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-purple-100">
                      Regístrate sin costo y suma boletos siguiéndonos e invitando amigos.
                    </p>
                    <a
                      href="/sorteo"
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-7 py-3.5 font-bold text-[#3A1456] shadow-glow-gold transition-transform hover:scale-[1.02]"
                    >
                      Participar gratis
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flechas */}
              <button
                type="button"
                onClick={() => go(idx - 1)}
                aria-label="Anterior"
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow transition hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                type="button"
                onClick={() => go(idx + 1)}
                aria-label="Siguiente"
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow transition hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Puntos */}
            <div className="flex items-center justify-center gap-2 bg-white py-3">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === idx ? 'w-6 bg-[#7A2E87]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
