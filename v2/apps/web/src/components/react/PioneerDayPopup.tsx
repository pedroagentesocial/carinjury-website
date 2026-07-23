import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@components/ui/Icon';

/*
 * Popup del Día del Pionero: cerrados el viernes 24 de julio, reabrimos el
 * sábado 25. Muestra el banner (/banners/dia-del-pionero-2026.jpeg) y se
 * OCULTA AUTOMÁTICAMENTE a partir del sábado 25 de julio de 2026 (hora de
 * Utah) — no hay que tocar código para quitarlo.
 *
 * Igual que el popup del sorteo: aparece ~1.4s tras cargar, al cerrarlo no
 * reaparece en la misma sesión (sessionStorage) y queda un botón flotante
 * ("Aviso"/"Notice") para reabrirlo. No se muestra en /admin.
 */

const STORAGE_KEY = 'cic_pioneer_day_2026'; // sessionStorage: se resetea al cerrar el navegador
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const BANNER_SRC = '/banners/dia-del-pionero-2026.jpeg';

// Sábado 25 de julio de 2026, 00:00 hora de Utah (MDT, UTC-6): desde este
// momento el popup (y su botón) desaparecen solos.
export const PIONEER_DAY_EXPIRES = Date.parse('2026-07-25T00:00:00-06:00');

export default function PioneerDayPopup() {
  const [open, setOpen] = useState(false);
  const [en, setEn] = useState(false);
  const [blocked, setBlocked] = useState(true); // /admin o ya expirado → no renderizar nada
  const [showLauncher, setShowLauncher] = useState(false); // botón para reabrir

  // Mostrar (con guardas de ruta, de fecha y de "ya cerrado en esta sesión").
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return;
    if (Date.now() >= PIONEER_DAY_EXPIRES) return; // ya pasó el Día del Pionero
    setBlocked(false);
    setEn(path.startsWith('/en'));
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (dismissed) {
      // Ya lo cerró en esta sesión: no auto-abrir, pero dejar el botón para reabrir.
      setShowLauncher(true);
      return;
    }
    const t = setTimeout(() => setOpen(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    setShowLauncher(true); // deja el botón para reabrir
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const L = {
    title: en ? 'Pioneer Day notice' : 'Aviso por el Día del Pionero',
    caption: en
      ? 'Closed Friday, July 24 for Pioneer Day · We reopen Saturday, July 25'
      : 'Cerrados el viernes 24 de julio por el Día del Pionero · Reabrimos el sábado 25',
    close: en ? 'Close' : 'Cerrar',
    launcher: en ? 'Notice' : 'Aviso',
  };

  if (blocked) return null;

  return (
    <>
      {/* Botón flotante para reabrir el popup (abajo-izquierda; la derecha la usan
          el chat de GHL y los FloatingButtons). Aparece cuando el popup está cerrado. */}
      <AnimatePresence>
        {showLauncher && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={L.title}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.85 }}
            transition={{ duration: 0.35, ease: EASE }}
            /* bottom-24: por encima de los controles del carrusel del hero (esquina
               inferior izquierda) para no taparlos; la derecha la usan chat + FABs. */
            className="fixed bottom-24 left-5 z-[55] inline-flex items-center gap-2 rounded-full bg-[#7A2E87] px-4 py-2.5 text-sm font-bold text-white shadow-xl ring-1 ring-white/25 transition-transform hover:scale-105"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#FFD60A] opacity-75" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#FFD60A]" />
            </span>
            {L.launcher}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />

            {/* Tarjeta */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={L.title}
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="relative flex w-auto max-w-[92vw] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/10"
            >
              {/* Banner vertical (alto define el ancho → sin letterbox) */}
              <div className="relative aspect-[752/1268] h-[68vh] max-h-[600px]">
                <img
                  src={BANNER_SRC}
                  alt={L.caption}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />

                {/* Cerrar */}
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label={L.close}
                  className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {/* Leyenda (la imagen está en español; en EN el texto lo traduce) */}
              <div className="bg-[#3A1456] px-4 py-3 text-center text-[12px] font-semibold text-white sm:text-sm">
                {L.caption}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
