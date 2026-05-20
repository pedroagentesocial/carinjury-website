import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
  /** URL pública del calendario GHL. Algo como
   * https://api.leadconnectorhq.com/widget/booking/CALENDAR_ID
   * o
   * https://link.tu-marca.com/widget/booking/CALENDAR_ID
   */
  url: string;
}

const GHL_EMBED_SCRIPT = 'https://link.msgsndr.com/js/form_embed.js';

/**
 * Embed de calendario GoHighLevel con auto-resize.
 * GHL inyecta `form_embed.js` que escucha postMessage del iframe y
 * actualiza la altura automáticamente cuando el calendario navega entre
 * pasos.
 */
export default function GhlBooking({ locale, url }: Props) {
  const iframeId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Carga el script de GHL una sola vez por sesión.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GHL_EMBED_SCRIPT}"]`,
    );
    if (existing) return;
    const s = document.createElement('script');
    s.src = GHL_EMBED_SCRIPT;
    s.async = true;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-md"
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
          <span className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-lilac border-t-primary" />
          <p className="text-sm text-muted">
            {locale === 'en' ? 'Loading calendar…' : 'Cargando calendario…'}
          </p>
        </div>
      )}
      <iframe
        id={iframeId}
        src={url}
        title={locale === 'en' ? 'Schedule appointment' : 'Agendar cita'}
        scrolling="no"
        onLoad={() => setLoaded(true)}
        className="h-[720px] w-full border-0"
      />
      <noscript>
        <div className="p-6 text-center">
          <p className="text-muted">
            {locale === 'en'
              ? 'JavaScript is required to load the calendar.'
              : 'Necesitas JavaScript para cargar el calendario.'}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            {locale === 'en' ? 'Open calendar' : 'Abrir calendario'}
            <Icon name="arrow-right" size={14} />
          </a>
        </div>
      </noscript>
    </motion.div>
  );
}
