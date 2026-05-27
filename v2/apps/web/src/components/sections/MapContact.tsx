import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const SCHEDULE: { day: DayKey; value: string }[] = [
  { day: 'monday', value: '9:00 AM - 6:00 PM' },
  { day: 'tuesday', value: '9:00 AM - 6:00 PM' },
  { day: 'wednesday', value: '9:00 AM - 6:00 PM' },
  { day: 'thursday', value: '9:00 AM - 6:00 PM' },
  { day: 'friday', value: '9:00 AM - 6:00 PM' },
  { day: 'saturday', value: '10:00 AM - 2:00 PM' },
  { day: 'sunday', value: 'closed' },
];

// Embed de Google Maps — viene de SITE.mapEmbedUrl, que respeta
// PUBLIC_MAP_EMBED_URL si está seteada.
const MAP_EMBED_URL = SITE.mapEmbedUrl;

export default function MapContact({ locale }: Props) {
  return (
    <section id="visit" className="relative bg-white py-20">
      <div className="mx-auto max-w-content px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary"
          >
            <span className="h-px w-8 bg-secondary" />
            {locale === 'en' ? 'Visit us' : 'Visítanos'}
            <span className="h-px w-8 bg-secondary" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 font-heading text-3xl font-bold text-ink md:text-4xl"
          >
            {t('map_contact.info_label', locale)}
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-lg"
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
            {/* Map embed */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]">
              <iframe
                src={MAP_EMBED_URL}
                title="Car Injury Clinic location"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info side */}
            <div className="flex flex-col gap-6 bg-deep p-8 text-white">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon name="phone" size={18} />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {t('map_contact.phone_label', locale)}
                </p>
                <a
                  href={`tel:${SITE.phone.tel}`}
                  className="mt-1 inline-flex items-center gap-2 font-heading text-xl font-bold transition hover:text-secondary"
                >
                  {SITE.phone.displayLong}
                  <Icon name="arrow-right" size={16} />
                </a>
              </div>

              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon name="mail" size={18} />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {t('map_contact.email_label', locale)}
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-1 inline-flex items-center gap-2 font-medium transition hover:text-secondary"
                >
                  {SITE.email}
                </a>
              </div>

              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon name="clock" size={18} />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {t('map_contact.hours_label', locale)}
                </p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {SCHEDULE.map((s) => (
                    <div
                      key={s.day}
                      className="flex items-center justify-between border-b border-white/10 pb-1.5 last:border-0 last:pb-0"
                    >
                      <dt className="font-medium text-white/90">
                        {t(`map_contact.days.${s.day}` as TranslationKey, locale)}
                      </dt>
                      <dd className="text-white/70">
                        {s.value === 'closed' ? t('map_contact.closed', locale) : s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener"
                className="btn-uiverse-primary mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <Icon name="pin" size={16} />
                {locale === 'en' ? 'Open in Google Maps' : 'Abrir en Google Maps'}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
