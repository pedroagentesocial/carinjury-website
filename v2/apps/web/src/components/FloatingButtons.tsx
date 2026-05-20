import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function FloatingButtons({ locale }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1 }}
      className="fixed bottom-5 right-5 z-40 flex flex-col gap-3"
    >
      <a
        href={`tel:${SITE.phone.tel}`}
        aria-label={t('floating_buttons.phone.aria_label', locale)}
        className="group inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-[0_10px_30px_rgba(186,147,194,0.5)] transition hover:scale-110 hover:bg-primary"
      >
        <Icon name="phone" size={22} />
      </a>
      <a
        href={locale === 'en' ? '/en/schedule' : '/schedule'}
        aria-label={t('floating_buttons.schedule.aria_label', locale)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_rgba(122,46,135,0.5)] transition hover:scale-110 hover:bg-deep"
      >
        <Icon name="calendar" size={22} />
      </a>
    </motion.div>
  );
}
