import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

interface Fab {
  href: string;
  icon: IconName;
  ariaKey: TranslationKey;
  tooltipKey: TranslationKey;
  /** Tono del botón: pinta fondo, tooltip y sombra vía --fab (ver global.css). */
  tone: string;
  /** WhatsApp: GA4 + abre en pestaña nueva. */
  brand?: 'whatsapp';
}

/** GA4 best-effort (no rompe si analytics no cargó). */
function track(name: string, params?: Record<string, unknown>) {
  try {
    (window as unknown as { trackEvent?: (n: string, p?: Record<string, unknown>) => void }).trackEvent?.(name, params);
  } catch {
    /* analytics opcional */
  }
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-ink';

export default function FloatingButtons({ locale }: Props) {
  /* Tonos de la paleta canónica, no valores sueltos. El stack va de menor a
     mayor intención de contacto: consultar (violeta) -> agendar (púrpura) ->
     llamar (deep). Así deja de leerse como un bloque de un solo morado. */
  const fabs: Fab[] = [
    {
      href: locale === 'en' ? '/en/faq' : '/faq',
      icon: 'help',
      ariaKey: 'floating_buttons.help.aria_label',
      tooltipKey: 'floating_buttons.help.tooltip',
      tone: 'var(--c-violet)',
    },
    {
      href: locale === 'en' ? '/en/schedule' : '/schedule',
      icon: 'calendar',
      ariaKey: 'floating_buttons.schedule.aria_label',
      tooltipKey: 'floating_buttons.schedule.tooltip',
      tone: 'var(--c-purple)',
    },
    {
      href: `tel:${SITE.phone.tel}`,
      icon: 'phone',
      ariaKey: 'floating_buttons.phone.aria_label',
      tooltipKey: 'floating_buttons.phone.tooltip',
      tone: 'var(--c-deep)',
    },
    {
      /* Número NO hardcodeado: el endpoint server-only resuelve el wa.me. */
      href: `/api/whatsapp?lang=${locale}&ctx=help`,
      icon: 'whatsapp',
      ariaKey: 'floating_buttons.whatsapp.aria_label',
      tooltipKey: 'floating_buttons.whatsapp.tooltip',
      tone: '#25D366',
      brand: 'whatsapp',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1 }}
      /* El chat de GHL se inyecta en la esquina inferior derecha con z-index
         altísimo y no se puede reposicionar desde aquí, así que el stack sube
         para despejarlo. Medido en el widget real: la burbuja ocupa 20-78px
         desde abajo, y en >=sm aparece además el globo de saludo (hasta 170px).
         De ahí los dos valores: 144px despeja la burbuja, 176px el saludo.
         En movil se queda en 144 para no comerse la pantalla. */
      className="fixed bottom-36 sm:bottom-44 right-5 z-40 flex flex-col gap-3"
    >
      {fabs.map((fab) => {
        const isWhatsApp = fab.brand === 'whatsapp';
        return (
          <a
            key={fab.href}
            href={fab.href}
            aria-label={t(fab.ariaKey, locale)}
            style={{ '--fab': fab.tone } as CSSProperties}
            {...(isWhatsApp
              ? {
                  target: '_blank',
                  rel: 'noopener',
                  onClick: () => track('whatsapp_click', { action: 'floating' }),
                }
              : {})}
            className={`fab-jello h-14 w-14 ${FOCUS_RING}`}
          >
            <Icon name={fab.icon} size={isWhatsApp ? 26 : 22} />
            <span className="fab-tooltip">{t(fab.tooltipKey, locale)}</span>
          </a>
        );
      })}
    </motion.div>
  );
}
