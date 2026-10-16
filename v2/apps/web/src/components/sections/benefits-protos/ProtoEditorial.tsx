import { motion, MotionConfig } from 'motion/react';
import { BENEFITS } from './data';

// PROTOTIPO A — "Editorial"
// Serif display (Fraunces) con cursiva en la palabra clave, encabezado fijo a la
// izquierda en desktop y lista numerada a la derecha. Movimiento: palabras que
// suben desde una mascara, divisores que se dibujan y filas que se deslizan.

const TITLE_WORDS: { w: string; em?: boolean }[] = [
  { w: 'Beneficios' },
  { w: 'reales', em: true },
  { w: 'para' },
  { w: 'nuestros' },
  { w: 'pacientes' },
];

export default function ProtoEditorial() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="bg-white px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="proto-grain relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] bg-[var(--c-sec-2)] px-5 py-12 text-white shadow-[0_30px_70px_-20px_rgba(102,32,114,0.55)] sm:px-8 md:rounded-[2.5rem] md:px-12 md:py-16 lg:px-16 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl" />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            {/* Encabezado — sticky en desktop */}
            <header className="lg:sticky lg:top-24 lg:self-start">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/80"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Lo que incluye tu visita
              </motion.p>

              <h2 className="font-['Fraunces'] text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.02em] [font-variation-settings:'opsz'_144] sm:text-5xl lg:text-[4.2rem]">
                {TITLE_WORDS.map((t, i) => (
                  <span key={t.w} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                    <motion.span
                      className={`inline-block ${t.em ? 'italic text-secondary' : ''}`}
                      initial={{ y: '105%' }}
                      whileInView={{ y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {t.w}
                    </motion.span>
                    {i < TITLE_WORDS.length - 1 && ' '}
                  </span>
                ))}
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-white/75"
              >
                Después de un accidente, lo último que necesitas son trámites. Esto es lo que recibes desde tu primera visita.
              </motion.p>

              <motion.a
                href="/schedule"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-secondary py-3 pl-6 pr-3 font-semibold text-[var(--c-deep)] transition hover:bg-[var(--c-lilac)]"
              >
                Agendar mi evaluación
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--c-deep)] text-white transition-transform duration-300 group-hover:rotate-[-45deg]">
                  <Arrow />
                </span>
              </motion.a>
            </header>

            {/* Lista numerada */}
            <ol>
              {BENEFITS.map((b, i) => (
                <motion.li
                  key={b.key}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px origin-left bg-white/20"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <a
                    href={b.href}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-1 py-5 transition-[background-color,padding] duration-300 hover:bg-white/[0.06] hover:px-4 sm:gap-6 md:py-6"
                  >
                    <span className="font-['Fraunces'] text-lg italic text-secondary/90 sm:text-xl">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="hidden h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/10 transition duration-300 group-hover:bg-secondary sm:flex">
                        <img src={b.icon} alt="" aria-hidden="true" loading="lazy" className="h-7 w-7 object-contain brightness-0 invert" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-['Fraunces'] text-[1.3rem] font-medium leading-tight sm:text-2xl md:text-[1.7rem]">
                          {b.title}
                        </span>
                        <span className="mt-1 block text-[0.95rem] leading-snug text-white/65">{b.desc}</span>
                      </span>
                    </span>
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/25 transition duration-300 group-hover:rotate-[-45deg] group-hover:border-secondary group-hover:bg-secondary group-hover:text-[var(--c-deep)]">
                      <Arrow />
                    </span>
                  </a>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
