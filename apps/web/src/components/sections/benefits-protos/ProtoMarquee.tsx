import { useRef, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { BENEFITS } from './data';

// PROTOTIPO C — "Cinta + carrusel"
// Display ancha (Unbounded) en mayusculas, cinta de palabras en movimiento continuo
// arriba y tarjetas con borde de luz giratorio. En movil las tarjetas se deslizan
// con el dedo (scroll-snap) y una barra indica la posicion; en desktop es grilla 3x2.

const TICKER = ['Sin costo', 'Hoy mismo', 'X-Ray', 'Transporte', 'Español · English', 'Orientación legal'];

export default function ProtoMarquee() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setActive(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-white px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_80%_at_50%_0%,var(--c-sec-3)_0%,var(--c-sec-2)_45%,var(--c-sec-1)_100%)] pb-10 text-white shadow-[0_30px_70px_-20px_rgba(102,32,114,0.55)] md:rounded-[2.5rem] md:pb-14 lg:pb-16">
          {/* Cinta en movimiento (decorativa) */}
          <div aria-hidden="true" className="relative flex overflow-hidden border-b border-white/10 py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] md:py-5">
            {[0, 1].map((dup) => (
              <div key={dup} className="proto-marquee flex flex-none items-center gap-8 pr-8 md:gap-12 md:pr-12">
                {TICKER.map((w) => (
                  <span key={w} className="flex items-center gap-8 whitespace-nowrap font-['Unbounded'] text-xl font-bold uppercase text-transparent [-webkit-text-stroke:1.2px_rgba(255,255,255,0.55)] md:gap-12 md:text-3xl">
                    {w}
                    <Star />
                  </span>
                ))}
              </div>
            ))}
          </div>

          <header className="mx-auto max-w-3xl px-5 pt-10 text-center md:pt-14">
            <motion.h2
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-['Unbounded'] text-[1.75rem] font-bold uppercase leading-[1.08] tracking-[-0.01em] sm:text-4xl lg:text-5xl"
            >
              Beneficios <span className="text-secondary">reales</span> para nuestros pacientes
            </motion.h2>
            <p className="mx-auto mt-4 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
              Seis cosas que recibes desde tu primera visita, sin letra pequeña.
            </p>
          </header>

          {/* Movil: carrusel horizontal · Desktop: grilla 3x2 */}
          <ul
            ref={track}
            onScroll={onScroll}
            className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:mt-12 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-10 lg:grid-cols-3 lg:gap-5 lg:px-12 [&::-webkit-scrollbar]:hidden"
          >
            {BENEFITS.map((b, i) => (
              <motion.li
                key={b.key}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: 0.06 * i }}
                className="w-[78%] flex-none snap-start sm:w-[55%] md:w-auto"
              >
                <a href={b.href} className="proto-ring group relative block h-full rounded-[1.6rem] p-[1.5px]">
                  <span className="relative flex h-full flex-col gap-5 rounded-[calc(1.6rem-1.5px)] bg-[rgba(76,0,87,0.9)] p-6 backdrop-blur-sm transition-colors duration-300 group-hover:bg-[rgba(76,0,87,0.72)] md:p-7">
                    <span className="flex items-start justify-between">
                      <span className="proto-pulse relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-[var(--c-deep)]">
                        <img src={b.icon} alt="" aria-hidden="true" loading="lazy" className="h-7 w-7 object-contain brightness-0 invert" />
                      </span>
                      <span className="font-['Unbounded'] text-sm font-semibold text-white/35">
                        {String(i + 1).padStart(2, '0')}/06
                      </span>
                    </span>
                    <span>
                      <span className="block font-['Unbounded'] text-lg font-semibold leading-tight md:text-xl">{b.title}</span>
                      <span className="mt-2 block text-[0.97rem] leading-snug text-white/70">{b.desc}</span>
                    </span>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                      Ver más
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </span>
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Indicador de posicion — solo movil */}
          <div aria-hidden="true" className="mx-auto mt-5 flex w-fit gap-1.5 md:hidden">
            {BENEFITS.map((b, i) => (
              <span
                key={b.key}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-secondary' : 'w-1.5 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none fill-secondary md:h-5 md:w-5" aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}
