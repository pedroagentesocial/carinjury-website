import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

/*
 * Popup del sorteo de Independencia de Colombia (20 de julio).
 * Reproduce el reel vertical (/video/promo.mp4) usando el banner como poster,
 * e invita a COMPARTIR el video y a SEGUIR en Instagram (@car.injuryclinic y
 * @theruanamarketstore) — que es justo lo que pide la mecánica del sorteo.
 *
 * Aparece ~1.4s tras cargar. Al cerrarlo NO reaparece solo durante la misma
 * sesión del navegador (sessionStorage), pero queda un botón flotante ("Sorteo")
 * abajo a la izquierda para reabrirlo cuando quieran. No se muestra en /admin.
 */

const STORAGE_KEY = 'cic_sorteo_co_v1'; // sessionStorage: se resetea al cerrar el navegador
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const VIDEO_SRC = '/video/promo.mp4';
const POSTER_SRC = '/images/banner.jpeg';

const IG_CIC = 'https://www.instagram.com/car.injuryclinic/';
const IG_RUANA = 'https://www.instagram.com/theruanamarketstore/';

const SHARE_URL = SITE.url;
const SHARE_TITLE = 'Sorteo de Independencia de Colombia';
const SHARE_TEXT =
  'Participa por el sorteo de 2 mercados de $500 en La Ruana Market con Car Injury Clinic. Sorteo 20 de julio.';

function isEnglish(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/en');
}

export default function SorteoColombiaPopup() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0); // 0 = video, 1 = banner
  const [muted, setMuted] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [en, setEn] = useState(false);
  const [blocked, setBlocked] = useState(false); // /admin → no renderizar nada
  const [showLauncher, setShowLauncher] = useState(false); // botón para reabrir
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const SLIDE_COUNT = 2;
  const goNext = useCallback(() => setSlide((s) => (s + 1) % SLIDE_COUNT), []);
  const goPrev = useCallback(() => setSlide((s) => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT), []);

  // Mostrar (con guardas de ruta y de "ya cerrado en esta sesión").
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setBlocked(true);
      return;
    }
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

  // Reproducir el video solo cuando su slide está visible (silenciado para autoplay).
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;
    if (slide === 0) {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {
        /* autoplay bloqueado — se reproduce al primer toque */
      });
    } else {
      v.pause();
    }
  }, [open, slide]);

  const dismiss = useCallback(() => {
    setOpen(false);
    setShowLauncher(true); // deja el botón para reabrir
    const v = videoRef.current;
    if (v) v.pause();
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const openPopup = useCallback(() => {
    setSlide(0);
    setShowShare(false);
    setOpen(true);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !v.muted;
    v.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) v.play().catch(() => {});
  }, []);

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL });
        return;
      } catch {
        /* usuario canceló o falló — mostramos menú de respaldo */
      }
    }
    setShowShare((s) => !s);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  const encoded = encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`);
  const waHref = `https://wa.me/?text=${encoded}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;

  const L = {
    share: en ? 'Share the video' : 'Compartir el video',
    follow: en ? 'Follow to participate' : 'Síguenos para participar',
    copy: en ? 'Copy link' : 'Copiar enlace',
    copied: en ? 'Copied' : 'Copiado',
    close: en ? 'Close' : 'Cerrar',
    tagline: en
      ? 'Win 1 of 2 grocery baskets of $500 · Draw July 20'
      : 'Gánate 1 de 2 mercados de $500 · Sorteo 20 de julio',
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
            onClick={openPopup}
            aria-label={en ? 'Open giveaway' : 'Ver el sorteo'}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.85 }}
            transition={{ duration: 0.35, ease: EASE }}
            /* bottom-24: por encima de los controles del carrusel del hero (esquina
               inferior izquierda) para no taparlos; la derecha la usan chat + FABs. */
            className="fixed bottom-24 left-5 z-[55] inline-flex items-center gap-2 rounded-full bg-[#7A2E87] px-4 py-2.5 text-sm font-bold text-white shadow-xl ring-1 ring-white/25 transition-transform hover:scale-105"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#FCD116] opacity-75" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#FCD116]" />
            </span>
            <span className="h-3 w-5 overflow-hidden rounded-[2px] ring-1 ring-white/30">
              <span className="block h-1/2 w-full bg-[#FCD116]" />
              <span className="block h-1/4 w-full bg-[#003893]" />
              <span className="block h-1/4 w-full bg-[#CE1126]" />
            </span>
            {en ? 'Giveaway' : 'Sorteo'}
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
            aria-label={SHARE_TITLE}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative flex w-auto max-w-[92vw] flex-col overflow-hidden rounded-3xl bg-[#160a24] shadow-2xl ring-1 ring-white/10"
          >
            {/* Media vertical (alto define el ancho → sin letterbox) */}
            <div className="relative aspect-[9/16] h-[58vh] max-h-[540px] bg-black">
              {/* Slide 0: video */}
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  slide === 0 ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                muted
                loop
                playsInline
                preload="none"
                onClick={toggleMute}
              />

              {/* Slide 1: banner */}
              <img
                src={POSTER_SRC}
                alt={SHARE_TITLE}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  slide === 1 ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                loading="lazy"
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

              {/* Sonido (solo en el video) */}
              {slide === 0 && (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? (en ? 'Unmute' : 'Activar sonido') : (en ? 'Mute' : 'Silenciar')}
                  className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
                >
                  <Icon name={muted ? 'mute' : 'sound'} size={18} />
                </button>
              )}

              {/* Flechas de navegación */}
              <button
                type="button"
                onClick={goPrev}
                aria-label={en ? 'Previous' : 'Anterior'}
                className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              >
                <Icon name="chevron-left" size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={en ? 'Next' : 'Siguiente'}
                className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
              >
                <Icon name="chevron-right" size={20} />
              </button>

              {/* Tagline (solo en el video; el banner trae su propio título) */}
              {slide === 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/55 to-transparent px-4 pb-8 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-6 overflow-hidden rounded-[2px] shadow ring-1 ring-white/30">
                      <span className="block h-1/2 w-full bg-[#FCD116]" />
                      <span className="block h-1/4 w-full bg-[#003893]" />
                      <span className="block h-1/4 w-full bg-[#CE1126]" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
                      {L.tagline}
                    </span>
                  </div>
                </div>
              )}

              {/* Puntos indicadores */}
              <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2">
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`${en ? 'Slide' : 'Slide'} ${i + 1}`}
                    aria-current={i === slide}
                    className={`h-2 rounded-full transition-all ${
                      i === slide ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3 bg-gradient-to-b from-[#160a24] to-[#2a0f3d] p-4">
              {/* Compartir */}
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A2E87] px-5 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {L.share}
              </button>

              {/* Menú de compartir (respaldo cuando no hay share nativo) */}
              <AnimatePresence>
                {showShare && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-2.5 text-white/90 transition hover:bg-white/10"
                      >
                        <Icon name="whatsapp" size={22} />
                        <span className="text-[10px]">WhatsApp</span>
                      </a>
                      <a
                        href={fbHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-2.5 text-white/90 transition hover:bg-white/10"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
                        </svg>
                        <span className="text-[10px]">Facebook</span>
                      </a>
                      <a
                        href={xHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X"
                        className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-2.5 text-white/90 transition hover:bg-white/10"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.9l7.74-8.84L1.5 2.25h6.82l4.71 6.23 5.21-6.23zm-1.16 17.52h1.83L7.03 4.13H5.06l12.02 15.64z" />
                        </svg>
                        <span className="text-[10px]">X</span>
                      </a>
                      <button
                        type="button"
                        onClick={copyLink}
                        aria-label={L.copy}
                        className="flex flex-col items-center gap-1 rounded-xl bg-white/5 py-2.5 text-white/90 transition hover:bg-white/10"
                      >
                        {copied ? (
                          <Icon name="check" size={22} />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        )}
                        <span className="text-[10px]">{copied ? L.copied : L.copy}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Seguir en Instagram */}
              <div>
                <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-purple-200/80">
                  {L.follow}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href={IG_CIC}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <InstagramGlyph />
                    <span className="truncate">@car.injuryclinic</span>
                  </a>
                  <a
                    href={IG_RUANA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <InstagramGlyph />
                    <span className="truncate">@theruanamarketstore</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

function InstagramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
