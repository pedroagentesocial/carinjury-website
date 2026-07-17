import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { isPromoActive } from '@lib/promo';
import { Icon } from '@components/ui/Icon';

interface Slide {
  src: string;
  /** 'image' renderiza un <img> centrado con fondo blur en vez de <video>. */
  kind?: 'video' | 'image';
  poster?: string;
  durationMs: number;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  ctaKey?: TranslationKey;
  ctaHref?: string;
  showContent: boolean;
}

const SLIDES: Slide[] = [
  {
    src: '/video/new-hero.mp4',
    poster: '/images/new-hero-poster.webp',
    durationMs: 12000,
    showContent: false,
  },
  {
    /* Promo Cambiatón: imagen horizontal, el banner trae su propio texto */
    src: '/banners/cambiaton-mundial-taylorsville.webp',
    kind: 'image',
    durationMs: 8000,
    showContent: false,
  },
  {
    src: '/video/hero.mp4',
    titleKey: 'hero.slides.slide3.title',
    subtitleKey: 'hero.slides.slide3.subtitle',
    ctaKey: 'hero.slides.slide3.cta',
    ctaHref: '/schedule',
    durationMs: 8000,
    showContent: true,
  },
  {
    src: '/video/accident.mp4',
    titleKey: 'hero.slides.slide1.title',
    subtitleKey: 'hero.slides.slide1.subtitle',
    ctaKey: 'hero.slides.slide1.cta',
    ctaHref: '/services',
    durationMs: 8000,
    showContent: true,
  },
  {
    src: '/video/chiro.mp4',
    titleKey: 'hero.slides.slide2.title',
    subtitleKey: 'hero.slides.slide2.subtitle',
    ctaKey: 'hero.slides.slide2.cta',
    ctaHref: `tel:${SITE.phone.tel}`,
    durationMs: 8000,
    showContent: true,
  },
];

interface Props {
  locale: Locale;
}

export default function HeroCarousel({ locale }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressKey = useRef(0);

  /* La promo vence sola (ver @lib/promo). En SSR se asume activa y el cliente
     la quita al hidratar si ya pasó la fecha: evita mismatch de hidratación
     (el slide promo nunca es el primero visible, así que no hay flash). */
  const [promoActive, setPromoActive] = useState(true);
  useEffect(() => {
    if (!isPromoActive()) setPromoActive(false);
  }, []);
  const slides = useMemo(
    () => (promoActive ? SLIDES : SLIDES.filter((s) => s.kind !== 'image')),
    [promoActive],
  );

  const slide = slides[index]!;
  /* El slide de imagen (banner promo) trae su propio texto: ocultar overlay y vignette */
  const isImageSlide = slide.kind === 'image';

  const next = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [slides.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + slides.length) % slides.length),
    [slides.length],
  );
  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(next, slide.durationMs);
    return () => window.clearTimeout(id);
  }, [index, paused, next, slide.durationMs]);

  useEffect(() => {
    progressKey.current += 1;
  }, [index]);

  /* Play active video + pause las demás cuando cambia el index.
     Necesario porque slides 1-3 tienen preload=metadata: el browser no
     descarga el video hasta que se lo pedimos explícitamente. */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        /* Forzar load() si todavía no tiene datos suficientes (preload=metadata) */
        if (v.readyState < 2) {
          try { v.load(); } catch { /* noop */ }
        }
        v.currentTime = 0;
        v.play().catch(() => { /* autoplay bloqueado en algunos browsers — ignorar */ });
      } else {
        v.pause();
      }
    });
  }, [index]);

  const scheduleHref = locale === 'en' ? '/en/schedule' : '/schedule';
  const localePrefix = locale === 'en' ? '/en' : '';

  /** Aplica prefix de locale a paths internos (no afecta tel: ni http://). */
  function resolveHref(href: string | undefined): string {
    if (!href) return scheduleHref;
    if (href.startsWith('tel:') || href.startsWith('http') || href.startsWith('#')) return href;
    if (locale === 'en' && !href.startsWith('/en')) return `${localePrefix}${href}`;
    return href;
  }

  const sublabel = useMemo(
    () => (locale === 'en' ? 'Same-day appointments' : 'Citas el mismo día'),
    [locale],
  );

  // Scroll-driven parallax: contenido del hero se desplaza/desvanece al hacer scroll.
  // Respeta prefers-reduced-motion (no aplica desplazamiento si el usuario lo pidió).
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 0.85], [1, 1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [1, 1.08]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-[100svh] min-h-[520px] w-full overflow-hidden bg-deep md:min-h-[640px]"
      aria-roledescription="carousel"
      aria-label={locale === 'en' ? 'Hero' : 'Inicio'}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ scale: videoScale }}
        aria-hidden="true"
      >
        {slides.map((s, i) =>
          s.kind === 'image' ? (
            <div
              key={s.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={i !== index}
            >
              {/* Fondo: misma imagen ampliada + blur para llenar el encuadre */}
              <img
                src={s.src}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.45] saturate-[1.2]"
              />
              {/* Banner horizontal centrado, completo entre nav y controles */}
              <div className="absolute inset-0 flex items-center justify-center px-4 pb-20 pt-20">
                <img
                  src={s.src}
                  alt=""
                  loading="lazy"
                  className="max-h-full w-full max-w-5xl rounded-xl object-contain shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>
          ) : (
            <video
              key={s.src}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={s.src}
              poster={s.poster}
              autoPlay={i === 0}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ filter: 'brightness(0.85) saturate(1.05) contrast(1.02)' }}
              onCanPlay={(e) => {
                if (i === index) (e.target as HTMLVideoElement).play().catch(() => {});
              }}
              aria-hidden={i !== index}
            />
          ),
        )}
      </motion.div>

      {/* Vignette radial: foco oscuro centrado donde está el texto (sube al medio) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 [background:radial-gradient(70%_55%_at_50%_55%,rgba(0,0,0,0.6),rgba(0,0,0,0)_75%)] ${
          isImageSlide ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Vertical scrim: refuerza nav + base inferior (suavizado) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/25 via-transparent to-black/30"
      />

      {/* Top scrim: dark fade behind transparent Nav for legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-36 bg-gradient-to-b from-black/65 via-black/25 to-transparent"
      />

      {/* Bottom scrim: para controles del carrusel (suavizado) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-black/40 to-transparent"
      />

      <motion.div
        className="absolute inset-x-0 z-10 mx-auto w-full max-w-3xl px-6 text-center text-white"
        style={{
          bottom: '38%',
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        <AnimatePresence mode="wait">
          {isImageSlide ? null : slide.showContent ? (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {sublabel}
              </motion.span>

              <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl">
                {slide.titleKey ? t(slide.titleKey, locale) : ''}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] sm:text-lg md:text-xl">
                {slide.subtitleKey ? t(slide.subtitleKey, locale) : ''}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={resolveHref(slide.ctaHref)}
                  className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
                >
                  <span>
                    {slide.ctaKey ? t(slide.ctaKey, locale) : t('hero.cta_primary', locale)}
                  </span>
                  <Icon name="arrow-right" size={18} />
                </a>
                <a
                  href={`tel:${SITE.phone.tel}`}
                  className="btn-uiverse inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
                >
                  <Icon name="phone" size={18} />
                  {SITE.phone.display}
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
            >
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {sublabel}
              </span>
              <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl">
                {t('hero.title', locale)}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] sm:text-lg md:text-xl">
                {t('hero.subtitle', locale)}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={scheduleHref}
                  className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
                >
                  <span>{t('hero.cta_primary', locale)}</span>
                  <Icon name="arrow-right" size={18} />
                </a>
                <a
                  href={`tel:${SITE.phone.tel}`}
                  className="btn-uiverse inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold"
                >
                  <Icon name="phone" size={18} />
                  {SITE.phone.display}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scroll indicator — subtle, prompts user to keep going */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: isImageSlide ? 0 : 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/40 pt-2"
        >
          <span className="block h-2 w-1 rounded-full bg-white/70" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 pb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label={locale === 'en' ? 'Previous slide' : 'Slide anterior'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? (locale === 'en' ? 'Play' : 'Reproducir') : (locale === 'en' ? 'Pause' : 'Pausar')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Icon name={paused ? 'play' : 'pause'} size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={locale === 'en' ? 'Next slide' : 'Slide siguiente'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${locale === 'en' ? 'Slide' : 'Slide'} ${i + 1}`}
                  aria-current={active}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all ${
                    active ? 'w-12 bg-white/30' : 'w-6 bg-white/25 hover:bg-white/40'
                  }`}
                >
                  {active && !paused && (
                    <motion.span
                      key={progressKey.current}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: slide.durationMs / 1000, ease: 'linear' }}
                      className="absolute inset-y-0 left-0 bg-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute -left-32 top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-secondary/40 blur-[120px]"
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -right-32 top-0 h-[55vmax] w-[55vmax] rounded-full bg-primary/40 blur-[120px]"
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/3 h-[40vmax] w-[40vmax] rounded-full bg-accent/35 blur-[100px]"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
