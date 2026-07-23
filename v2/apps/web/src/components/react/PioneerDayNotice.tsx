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
  return (
    <div className="bg-[#FFD60A] px-3 py-2 text-center text-[#3A1456]">
      <p className="mx-auto flex max-w-content items-center justify-center gap-2 text-[12px] font-bold leading-snug sm:text-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          {en
            ? 'We will be closed Friday, July 24 for Pioneer Day · We reopen Saturday, July 25'
            : 'Cerraremos este viernes 24 de julio por el Día del Pionero · Reabrimos el sábado 25'}
        </span>
      </p>
    </div>
  );
}
