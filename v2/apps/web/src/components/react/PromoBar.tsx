import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Barra superior (arriba del nav) que rota AUTOMÁTICAMENTE entre la Cambiatón
// (intercambio de láminas) y el sorteo de álbumes. Amarilla para resaltar.

const MAPS_URL =
  'https://maps.app.goo.gl/76gxBm8r9supmSYR9';
const INTERVAL = 4500;

const SLIDES = [
  {
    href: MAPS_URL,
    external: true,
    text: '🎟️ Cambiatón: intercambia tus láminas del Mundial · Sábados 11am–1pm en Taylorsville',
    cta: 'Cómo llegar',
  },
  {
    href: '/sorteo',
    external: false,
    text: '⚽ Gánate uno de 3 álbumes del Mundial · ¡participa gratis!',
    cta: 'Participar',
  },
];

export default function PromoBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];

  return (
    <div className="relative w-full overflow-hidden bg-[#FFD60A] text-[#3A1456]">
      <div className="mx-auto flex min-h-[40px] max-w-6xl items-center justify-center px-4 py-2 text-center">
        <AnimatePresence mode="wait">
          <motion.a
            key={i}
            href={s.href}
            target={s.external ? '_blank' : undefined}
            rel={s.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[12px] font-bold leading-tight sm:text-sm"
          >
            <span>{s.text}</span>
            <span className="whitespace-nowrap underline underline-offset-2">{s.cta} →</span>
          </motion.a>
        </AnimatePresence>
      </div>
    </div>
  );
}
