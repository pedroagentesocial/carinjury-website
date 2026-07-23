import { useEffect, useState } from 'react';
import type { Locale } from '@carinjury/shared';
import { PIONEER_DAY_EXPIRES } from '@components/react/PioneerDayPopup';

/*
 * Aviso amarillo del Día del Pionero, arriba del todo (se renderiza como
 * primer hijo del <nav> fijo, así empuja la píldora del menú hacia abajo sin
 * tapar nada). Desaparece SOLO a partir del sábado 25 de julio de 2026
 * (hora de Utah) — misma fecha límite que el popup.
 */

export default function PioneerDayNotice({ locale }: { locale: Locale }) {
  // Empieza oculto y se decide en cliente: así el HTML cacheado/SSR nunca
  // muestra el aviso después de la fecha límite.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Date.now() < PIONEER_DAY_EXPIRES) setVisible(true);
  }, []);

  if (!visible) return null;

  const en = locale === 'en';
  const line1 = en ? 'Closed Friday, July 24 (Pioneer Day)' : 'Cerrados el viernes 24 de julio (Día del Pionero)';
  const line2 = en ? 'We reopen Saturday, July 25' : 'Reabrimos el sábado 25';
  return (
    <div className="bg-[#FFD60A] px-3 py-1.5 text-center text-[#3A1456] sm:py-2">
      {/* Cada frase es un bloque nowrap: en móvil quiebra limpio en dos líneas
          centradas (sin partir "(Día del Pionero)"); en desktop va todo en una
          línea separada por el pipe. El icono viaja con la primera frase. */}
      <p className="mx-auto max-w-content text-[11px] font-bold leading-snug sm:text-[13px]">
        <span className="whitespace-nowrap">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mr-1.5 inline-block align-[-2px]"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {line1}
        </span>{' '}
        <span className="hidden opacity-40 sm:inline">|</span>{' '}
        <span className="whitespace-nowrap">{line2}</span>
      </p>
    </div>
  );
}
