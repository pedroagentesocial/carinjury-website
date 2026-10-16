import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig, useInView, useReducedMotion } from 'motion/react';
import { BENEFITS, type Benefit } from './data';

// PROTOTIPO B — "Bento rotativo"
// Grotesca con caracter (Bricolage Grotesque) y grilla bento donde el cuadro
// grande va rotando sin fin: el siguiente beneficio crece y toma su lugar, y el
// que estaba destacado pasa al final de la fila. La barra de progreso del cuadro
// grande marca el tiempo; al terminar su animacion avanza al siguiente.
// Se pausa con el cursor encima, con foco de teclado o fuera de pantalla.

const ROTATING = ['sin costo', 'hoy mismo', 'en tu idioma', 'sin vueltas'];
const STEP_MS = 4200;

// Palabra de fondo del cuadro grande, una por beneficio.
const MARK: Record<string, string> = {
  free_consultation: '$0',
  same_day: 'Hoy',
  free_transport: 'Ruta',
  xray: 'X-Ray',
  legal_guidance: 'Legal',
  languages: 'ES/EN',
};

export default function ProtoBento() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [featured, setFeatured] = useState(0);
  const [hovered, setHovered] = useState(false);

  const paused = hovered || !inView;
  const autoplay = !reduce;
  const next = () => setFeatured((f) => (f + 1) % BENEFITS.length);

  // Orden: destacado primero y luego el resto en secuencia, asi el siguiente
  // siempre queda en el primer cuadro chico (arriba a la derecha).
  const order = BENEFITS.map((_, i) => BENEFITS[(featured + i) % BENEFITS.length]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-white px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] bg-[var(--c-sec-2)] px-4 py-10 text-white shadow-[0_30px_70px_-20px_rgba(102,32,114,0.55)] sm:px-6 md:rounded-[2.5rem] md:px-10 md:py-14 lg:px-12 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:24px_24px]" />

          <header className="mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-['Bricolage_Grotesque'] text-[2.3rem] font-extrabold leading-[1] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Beneficios reales,
              <br />
              <RotatingWord words={ROTATING} />
            </h2>
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-white/70">
              Todo lo que necesitas después de un accidente, en un solo lugar y desde tu primera visita.
            </p>
          </header>

          {/* Movil: 2 cols (destacado arriba a lo ancho). Desktop: 3 cols, destacado 2x2. */}
          <div
            ref={ref}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={() => setHovered(true)}
            onBlurCapture={() => setHovered(false)}
          >
            <LayoutGroup>
              <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
                {order.map((b, pos) => (
                  <motion.li
                    key={b.key}
                    layout
                    transition={{ layout: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } }}
                    className={
                      pos === 0
                        ? 'col-span-2 lg:row-span-2'
                        : pos === order.length - 1
                          ? 'col-span-2 lg:col-span-1'
                          : ''
                    }
                  >
                    {pos === 0 ? (
                      <FeaturedTile b={b} paused={paused} autoplay={autoplay} onDone={next} />
                    ) : (
                      <SmallTile b={b} />
                    )}
                  </motion.li>
                ))}
              </ul>
            </LayoutGroup>

            {/* Indicadores: tambien sirven para elegir uno a mano */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {BENEFITS.map((b, i) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setFeatured(i)}
                  aria-label={`Destacar: ${b.title}`}
                  aria-current={i === featured}
                  className={`h-2 rounded-full transition-all duration-500 ${i === featured ? 'w-8 bg-secondary' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </div>
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

function FeaturedTile({
  b,
  paused,
  autoplay,
  onDone,
}: {
  b: Benefit;
  paused: boolean;
  autoplay: boolean;
  onDone: () => void;
}) {
  const mark = MARK[b.key];
  const markSize = mark.length <= 3 ? 'text-[9rem] md:text-[13rem]' : 'text-[6.5rem] md:text-[9rem]';

  return (
    <a
      href={b.href}
      onPointerMove={spotlight}
      className={`group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-[var(--c-fab-1)] to-[var(--c-purple)] p-6 md:min-h-[320px] md:p-8 lg:min-h-[400px] ${SPOT}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={b.key}
          layout="position"
          className="relative flex h-full flex-1 flex-col"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Icon src={b.icon} size="lg" />
          <span className="mt-auto pt-8">
            <span className="block max-w-md font-['Bricolage_Grotesque'] text-3xl font-extrabold leading-[1.02] tracking-[-0.02em] md:text-[2.6rem]">
              {b.title}
            </span>
            <span className="mt-3 block max-w-xs text-base leading-snug text-white/85">{b.desc}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
              Saber más
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
          className={`pointer-events-none absolute -bottom-5 -right-2 font-['Bricolage_Grotesque'] font-extrabold leading-none tracking-[-0.06em] text-white/15 ${markSize}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {mark}
        </motion.span>
      </AnimatePresence>

      {/* Barra de progreso: al terminar su animacion avanza el carrusel */}
      {autoplay && (
        <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-1 overflow-hidden rounded-full bg-white/20 md:inset-x-8">
          <span
            key={b.key}
            onAnimationEnd={onDone}
            className="proto-progress block h-full origin-left bg-white"
            style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          />
        </span>
      )}
    </a>
  );
}

function SmallTile({ b }: { b: Benefit }) {
  return (
    <a
      href={b.href}
      onPointerMove={spotlight}
      className={`group relative flex h-full min-h-[150px] flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.11] md:min-h-[170px] md:p-6 ${SPOT}`}
    >
      <motion.span layout="position" className="relative flex h-full flex-1 flex-col gap-3">
        <Icon src={b.icon} />
        <span className="mt-auto block font-['Bricolage_Grotesque'] text-[1.1rem] font-bold leading-[1.08] tracking-[-0.015em] md:text-xl">
          {b.title}
        </span>
      </motion.span>
    </a>
  );
}

function Icon({ src, size = 'md' }: { src: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12';
  return (
    <span className={`proto-float relative flex flex-none items-center justify-center rounded-2xl bg-white/15 backdrop-blur ${box} transition-transform duration-300 group-hover:scale-110`}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" className="h-[58%] w-[58%] object-contain brightness-0 invert" />
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
    <span className="relative inline-grid overflow-hidden align-bottom text-secondary">
      {/* Reserva el ancho de la palabra mas larga para que el layout no salte */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {words.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="col-start-1 row-start-1 pb-[0.08em]"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
