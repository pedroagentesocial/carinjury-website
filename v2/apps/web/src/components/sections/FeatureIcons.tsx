import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig, useInView, useReducedMotion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';

interface Props {
  locale: Locale;
}

interface Feature {
  key: string;
  icon: string;
  href: string;
}

const FEATURES: Feature[] = [
  { key: 'free_consultation', icon: '/assets/icons/consulta-cero.png', href: '/patient-referral' },
  { key: 'same_day',          icon: '/assets/icons/mismo-dia.png',     href: '/schedule' },
  { key: 'free_transport',    icon: '/assets/icons/transporte.png',    href: '/services#transporte-gratis' },
  { key: 'xray',              icon: '/assets/icons/xray.png',          href: '/services#radiografias' },
  { key: 'legal_guidance',    icon: '/assets/icons/legal.png',         href: '/lawyer-approved' },
  { key: 'languages',         icon: '/assets/icons/idiomas.png',       href: '/services#bilingue' },
];

const ROTATING_KEYS = ['rotating_1', 'rotating_2', 'rotating_3', 'rotating_4'] as const;

// Tiempo que cada beneficio se queda en el cuadro grande.
const STEP_MS = 4200;

const EASE = [0.22, 1, 0.36, 1] as const;

const item = (key: string, field: string, locale: Locale) =>
  t(`feature_icons.items.${key}.${field}` as TranslationKey, locale);

/**
 * Bento rotativo: el cuadro grande va rotando sin fin. El siguiente beneficio
 * crece y toma su lugar y el que estaba destacado pasa al final. La barra de
 * progreso marca el tiempo y su animationend avanza el carrusel, asi pausar la
 * barra pausa todo. Se detiene con el cursor encima, con foco de teclado o fuera
 * de pantalla; con reduced-motion no rota solo (queda la navegacion por puntos).
 */
export default function FeatureIcons({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [featured, setFeatured] = useState(0);
  const [hovered, setHovered] = useState(false);

  const paused = hovered || !inView;
  const next = () => setFeatured((f) => (f + 1) % FEATURES.length);

  // Destacado primero y luego el resto en secuencia: el siguiente siempre queda
  // en el primer cuadro chico, que es el que crece despues.
  const order = FEATURES.map((_, i) => FEATURES[(featured + i) % FEATURES.length]);
  const rotating = ROTATING_KEYS.map((k) => t(`feature_icons.${k}` as TranslationKey, locale));

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative bg-white px-4 py-16 md:px-6 md:py-20 lg:px-8 xl:px-10"
        aria-label={t('feature_icons.aria_label', locale)}
      >
        {/* Card flotante — el fondo morado vive dentro; la seccion queda en blanco */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] bg-[var(--c-sec-2)] px-4 py-10 text-white shadow-[0_30px_70px_-20px_rgba(102,32,114,0.55)] sm:px-6 md:rounded-[2.5rem] md:px-10 md:py-14 lg:px-12 lg:py-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:24px_24px]"
          />

          <header className="mb-8 flex flex-col gap-4 md:mb-10 xl:flex-row xl:items-end xl:justify-between">
            {/* Dos voces: grotesca blanca + serif cursiva rosa para la palabra que rota */}
            <h2 className="text-[clamp(2.1rem,9.5vw,2.9rem)] leading-[0.98] sm:text-6xl lg:text-[4.6rem] xl:text-[5.2rem]">
              <span className="sr-only">{t('feature_icons.title', locale)}</span>
              <span aria-hidden="true">
                <span className="font-display font-extrabold tracking-[-0.035em] text-white">
                  {t('feature_icons.title_lead', locale)}
                </span>
                <br />
                <span className="font-serif-display font-semibold italic tracking-[-0.01em] text-secondary">
                  <RotatingWord words={rotating} />
                </span>
              </span>
            </h2>
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-white/70">
              {t('feature_icons.subtitle', locale)}
            </p>
          </header>

          {/* Movil: 2 cols (destacado arriba a lo ancho). Desktop: 3 cols, destacado 2x2. */}
          <div
            ref={gridRef}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={() => setHovered(true)}
            onBlurCapture={() => setHovered(false)}
          >
            <LayoutGroup>
              <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                {order.map((f, pos) => (
                  <motion.li
                    key={f.key}
                    layout
                    transition={{ layout: { duration: 0.75, ease: EASE } }}
                    className={
                      pos === 0
                        ? 'col-span-2 lg:row-span-2'
                        : pos === order.length - 1
                          ? 'col-span-2 lg:col-span-1'
                          : ''
                    }
                  >
                    {pos === 0 ? (
                      <FeaturedTile
                        feature={f}
                        href={`${prefix}${f.href}`}
                        locale={locale}
                        paused={paused}
                        autoplay={!reduce}
                        onDone={next}
                      />
                    ) : (
                      <SmallTile feature={f} href={`${prefix}${f.href}`} locale={locale} upNext={pos === 1 && !reduce} />
                    )}
                  </motion.li>
                ))}
              </ul>
            </LayoutGroup>

            {/* Indicadores: tambien sirven para elegir uno a mano */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {FEATURES.map((f, i) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFeatured(i)}
                  aria-label={`${t('feature_icons.highlight', locale)}: ${item(f.key, 'title', locale)}`}
                  aria-current={i === featured}
                  className={`h-2 rounded-full transition-all duration-500 ${i === featured ? 'w-8 bg-secondary' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

/* Luz que sigue al cursor: guarda la posicion en variables CSS del tile. */
function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

const SPOT =
  'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:[background:radial-gradient(260px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.16),transparent_70%)]';

interface TileProps {
  feature: Feature;
  href: string;
  locale: Locale;
}

function FeaturedTile({
  feature,
  href,
  locale,
  paused,
  autoplay,
  onDone,
}: TileProps & { paused: boolean; autoplay: boolean; onDone: () => void }) {
  const mark = item(feature.key, 'mark', locale);
  const markSize = mark.length <= 3 ? 'text-[9rem] md:text-[13rem]' : 'text-[6.5rem] md:text-[9rem]';

  return (
    <a
      href={href}
      aria-label={item(feature.key, 'aria_label', locale)}
      onPointerMove={spotlight}
      className={`group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-[var(--c-fab-1)] to-[var(--c-purple)] p-6 md:min-h-[320px] md:p-8 lg:min-h-[400px] ${SPOT}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={feature.key}
          layout="position"
          className="relative flex h-full flex-1 flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Icon src={feature.icon} size="lg" />
          <span className="mt-auto pt-8">
            <span className="block max-w-md text-[2.1rem] leading-[1.02] md:text-5xl">
              <DualTitle featureKey={feature.key} locale={locale} emClass="text-white" />
            </span>
            <span className="mt-3 block max-w-xs text-base leading-snug text-white/85">
              {item(feature.key, 'desc', locale)}
            </span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
              {t('feature_icons.learn_more', locale)}
              <span className="transition-transform duration-300 group-hover:translate-x-1.5"><Arrow /></span>
            </span>
          </span>
        </motion.span>
      </AnimatePresence>

      {/* Palabra gigante de fondo */}
      <AnimatePresence>
        <motion.span
          key={mark}
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-5 -right-2 font-display font-extrabold leading-none tracking-[-0.06em] text-white/15 ${markSize}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {mark}
        </motion.span>
      </AnimatePresence>

      {/* Barra de progreso: al terminar su animacion avanza el carrusel */}
      {autoplay && (
        <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-1 overflow-hidden rounded-full bg-white/20 md:inset-x-8">
          <span
            key={feature.key}
            onAnimationEnd={onDone}
            className="benefit-progress block h-full bg-white"
            style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </span>
      )}
    </a>
  );
}

function SmallTile({ feature, href, locale, upNext }: TileProps & { upNext: boolean }) {
  return (
    <a
      href={href}
      aria-label={item(feature.key, 'aria_label', locale)}
      onPointerMove={spotlight}
      className={`group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-3xl border p-4 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.11] sm:p-5 md:min-h-[210px] md:p-6 ${upNext ? 'border-secondary/50 bg-white/[0.1]' : 'border-white/10 bg-white/[0.07]'} ${SPOT}`}
    >
      <motion.span layout="position" className="relative flex h-full flex-1 flex-col">
        <span className="flex flex-wrap items-start justify-between gap-2">
          <Icon src={feature.icon} />
          {/* Etiqueta del proximo en crecer */}
          <AnimatePresence>
            {upNext && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--c-deep)] md:text-[0.7rem]"
              >
                {t('feature_icons.up_next', locale)}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="mt-auto block pt-4">
          <span className="block text-[1.3rem] leading-[1.05] sm:text-[1.45rem] md:text-[1.7rem]">
            <DualTitle featureKey={feature.key} locale={locale} emClass="text-secondary" />
          </span>
          <span className="mt-1.5 line-clamp-2 text-[0.85rem] leading-snug text-white/65 md:text-[0.92rem]">
            {item(feature.key, 'desc', locale)}
          </span>
        </span>
      </motion.span>
    </a>
  );
}

/**
 * Titulo a dos voces: la frase clave (`em` en i18n) va en serif cursiva y con
 * color propio; el resto en la grotesca blanca. Si `em` no aparece en el
 * titulo, cae al titulo entero en una sola voz.
 */
function DualTitle({ featureKey, locale, emClass }: { featureKey: string; locale: Locale; emClass: string }) {
  const title = item(featureKey, 'title', locale);
  const em = item(featureKey, 'em', locale);
  const at = title.indexOf(em);
  const plain = 'font-display font-extrabold tracking-[-0.02em] text-white';

  if (at < 0) return <span className={plain}>{title}</span>;

  return (
    <>
      {at > 0 && <span className={plain}>{title.slice(0, at)}</span>}
      <span className={`font-serif-display text-[1.08em] font-semibold italic tracking-[-0.01em] ${emClass}`}>{em}</span>
      {at + em.length < title.length && <span className={plain}>{title.slice(at + em.length)}</span>}
    </>
  );
}

function Icon({ src, size = 'md' }: { src: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-20 w-20 md:h-24 md:w-24' : 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16';
  return (
    <span className={`benefit-float relative flex flex-none items-center justify-center rounded-2xl bg-white/15 backdrop-blur ${box} transition-transform duration-300 group-hover:scale-110`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="h-[58%] w-[58%] object-contain brightness-0 invert"
      />
    </span>
  );
}

function RotatingWord({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduce, words.length, interval]);

  return (
    <span className="relative inline-grid overflow-hidden pr-[0.12em] align-bottom">
      {/* Reserva el ancho de la palabra mas larga para que el layout no salte */}
      <span className="invisible col-start-1 row-start-1 pb-[0.08em]">
        {words.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="col-start-1 row-start-1 pb-[0.08em]"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
