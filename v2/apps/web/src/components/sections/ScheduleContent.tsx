import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';
import ContactForm from './ContactForm';
import GhlBooking from './GhlBooking';

interface Props {
  locale: Locale;
  /** URL pública del calendario GHL. Si vacía, se muestra el ContactForm. */
  bookingUrl?: string;
}

export default function ScheduleContent({ locale, bookingUrl }: Props) {
  const hoursLabels = locale === 'en'
    ? [
        { day: 'Monday - Friday', value: '9:00 AM - 6:00 PM' },
        { day: 'Saturday', value: '10:00 AM - 2:00 PM' },
        { day: 'Sunday', value: 'Closed' },
      ]
    : [
        { day: 'Lunes - Viernes', value: '9:00 AM - 6:00 PM' },
        { day: 'Sábado', value: '10:00 AM - 2:00 PM' },
        { day: 'Domingo', value: 'Cerrado' },
      ];

  return (
    <>
      {/* BOOKING + HOURS */}
      <section id="book" className="scroll-mt-24 bg-surface-2 py-16 md:py-20">
        <div className="mx-auto max-w-content px-6">
          {/* HEADER full-width arriba */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {t('schedule_page.form.title', locale)}
            </span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-ink md:text-4xl">
              {t('schedule_page.form.subtitle', locale)}
            </h2>
          </motion.div>

          {/* GRID: modal izq + aside der */}
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {bookingUrl ? (
                <GhlBooking locale={locale} url={bookingUrl} />
              ) : (
                <div className="rounded-2xl border border-line bg-deep p-1 shadow-md">
                  <ContactForm locale={locale} />
                </div>
              )}
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-6"
            >
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                <Icon name="clock" size={18} />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                {locale === 'en' ? 'Hours of operation' : 'Horarios de atención'}
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                {hoursLabels.map((h) => (
                  <div key={h.day} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                    <dt className="font-medium text-ink">{h.day}</dt>
                    <dd className="text-muted">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                <Icon name="phone" size={18} />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                {locale === 'en' ? 'Or call us directly' : 'O llámanos directo'}
              </h3>
              <a
                href={`tel:${SITE.phone.tel}`}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-deep"
              >
                {SITE.phone.displayLong}
                <Icon name="arrow-right" size={16} />
              </a>
              <p className="mt-3 text-xs text-muted">
                {locale === 'en' ? 'Bilingual team answers within 24h.' : 'Equipo bilingüe responde en menos de 24h.'}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                <Icon name="pin" size={18} />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink">
                {locale === 'en' ? 'Visit us' : 'Visítanos'}
              </h3>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {locale === 'en' ? 'Open in Google Maps' : 'Abrir en Google Maps'}
                <Icon name="arrow-right" size={14} />
              </a>
            </div>
          </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
}
