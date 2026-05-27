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
}

export default function FloatingButtons({ locale }: Props) {
  const fabs: Fab[] = [
    {
      href: locale === 'en' ? '/en/faq' : '/faq',
      icon: 'help',
      ariaKey: 'floating_buttons.help.aria_label',
      tooltipKey: 'floating_buttons.help.tooltip',
    },
    {
      href: locale === 'en' ? '/en/schedule' : '/schedule',
      icon: 'calendar',
      ariaKey: 'floating_buttons.schedule.aria_label',
      tooltipKey: 'floating_buttons.schedule.tooltip',
    },
    {
      href: `tel:${SITE.phone.tel}`,
      icon: 'phone',
      ariaKey: 'floating_buttons.phone.aria_label',
      tooltipKey: 'floating_buttons.phone.tooltip',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1 }}
      className="fixed bottom-5 right-5 z-40 flex flex-col gap-3"
    >
      {fabs.map((fab) => (
        <a
          key={fab.href}
          href={fab.href}
          aria-label={t(fab.ariaKey, locale)}
          className="fab-jello h-14 w-14"
        >
          <Icon name={fab.icon} size={22} />
          <span className="fab-tooltip">{t(fab.tooltipKey, locale)}</span>
        </a>
      ))}
    </motion.div>
  );
}
