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
    text: '🎟️ Cambiatón de láminas del Mundial · Sáb 11am–1pm · Taylorsville',
    cta: 'Cómo llegar',
  },
  {
    href: '/sorteo',
    external: false,
    text: '⚽ Gánate uno de 3 álbumes del Mundial · ¡gratis!',
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
    <div className="fixed inset-x-0 top-0 z-[60] h-10 overflow-hidden bg-[#FFD60A] text-[#3A1456]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-3">
        <AnimatePresence mode="wait">
          <motion.a
            key={i}
            href={s.href}
            target={s.external ? '_blank' : undefined}
            rel={s.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 items-center justify-center gap-2 text-[12px] font-bold leading-none hover:underline sm:text-sm"
          >
            <span className="truncate">{s.text}</span>
            <span className="hidden shrink-0 whitespace-nowrap underline underline-offset-2 sm:inline">
              {s.cta} →
            </span>
          </motion.a>
        </AnimatePresence>
      </div>
    </div>
  );
}
