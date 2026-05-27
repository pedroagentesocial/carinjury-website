import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

/**
 * Contenido de la página de ubicación. Refuerza el SEO local de Taylorsville
 * + condado de Salt Lake: áreas servidas (areaServed), cómo llegar (CTA a
 * Google Maps con direcciones reales) y señales de confianza.
 *
 * El mapa, horario y datos de contacto los renderiza <MapContact /> debajo,
 * que es la fuente única de esa información.
 */
export default function LocationContent({ locale }: Props) {
  const en = locale === 'en';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    SITE.address.full,
  )}${SITE.placeId ? `&destination_place_id=${SITE.placeId}` : ''}`;

  const features = [
    {
      icon: 'car' as const,
      title: en ? 'Free patient transportation' : 'Transporte gratis para pacientes',
      text: en
        ? 'No ride? We pick you up and take you home anywhere in the valley.'
        : 'Sin transporte? Te recogemos y te llevamos a casa en todo el valle.',
    },
    {
      icon: 'clock' as const,
      title: en ? 'Same-day appointments' : 'Citas el mismo día',
      text: en
        ? 'Walk-ins welcome. See a doctor the same day you call.'
        : 'Atendemos sin cita. Ve a un doctor el mismo día que llamas.',
    },
    {
      icon: 'globe' as const,
      title: en ? 'Trilingual team' : 'Equipo trilingüe',
      text: en
        ? 'We care for you in Spanish, English and Portuguese.'
        : 'Te atendemos en español, inglés y portugués.',
    },
    {
      icon: 'shield' as const,
      title: en ? 'Legal coordination' : 'Coordinación legal',
      text: en
        ? 'We work directly with attorneys so you focus on healing.'
        : 'Trabajamos directo con abogados para que solo te enfoques en sanar.',
    },
  ];

  return (
    <>
      {/* =================== ADDRESS + DIRECTIONS =================== */}
      <section className="relative bg-white py-16 md:py-20">
        <div className="mx-auto max-w-content px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary"
              >
                <span className="h-px w-8 bg-secondary" />
                {en ? 'Find us' : 'Encuéntranos'}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="mt-3 font-heading text-3xl font-extrabold leading-tight text-ink md:text-4xl"
              >
                {en
                  ? 'Conveniently located in Taylorsville, UT'
                  : 'Ubicados en el corazón de Taylorsville, UT'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.14 }}
                className="mt-4 max-w-lg text-base leading-relaxed text-muted"
              >
                {en
                  ? 'Our clinic sits in the heart of the Salt Lake valley, with easy access for patients across the county. If a car accident left you without a ride, our free patient transportation brings you to us and back home.'
                  : 'Nuestra clínica está en el centro del valle de Salt Lake, con acceso fácil para pacientes de todo el condado. Si un accidente te dejó sin transporte, nuestro servicio gratuito te trae a la clínica y te regresa a casa.'}
              </motion.p>

              {/* Address card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-7 flex items-start gap-4 rounded-2xl border border-line bg-surface-2 p-5"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                  <Icon name="pin" size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    {en ? 'Address' : 'Dirección'}
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold text-ink">
                    {SITE.address.street}
                  </p>
                  <p className="text-sm text-muted">
                    {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.26 }}
                className="mt-5 flex flex-wrap gap-3"
              >
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener"
                  className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  <Icon name="car" size={16} />
                  {en ? 'Get directions' : 'Cómo llegar'}
                </a>
                <a
                  href={`tel:${SITE.phone.tel}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/[0.06]"
                >
                  <Icon name="phone" size={16} />
                  {SITE.phone.display}
                </a>
              </motion.div>
            </div>

            {/* Feature grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="rounded-2xl border border-line bg-white p-5 shadow-[0_12px_30px_-22px_rgba(74,28,90,0.4)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                    <Icon name={f.icon} size={18} />
                  </span>
                  <p className="mt-4 font-heading text-base font-bold text-ink">{f.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================== AREAS SERVED =================== */}
      <section className="relative bg-surface-2 py-16 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
        />
        <div className="relative mx-auto max-w-content px-6">
          <div className="mx-auto max-w-2xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-secondary"
            >
              <span className="h-px w-8 bg-secondary" />
              {en ? 'Areas we serve' : 'Áreas que servimos'}
              <span className="h-px w-8 bg-secondary" />
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="mt-3 font-heading text-3xl font-bold text-ink md:text-4xl"
            >
              {en
                ? 'Serving the entire Salt Lake County'
                : 'Damos servicio a todo el condado de Salt Lake'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted"
            >
              {en
                ? 'No matter where the accident happened, our Taylorsville clinic treats car accident patients from across the valley — with free transportation included.'
                : 'No importa dónde fue el accidente: nuestra clínica en Taylorsville atiende a pacientes de todo el valle — con transporte gratis incluido.'}
            </motion.p>
          </div>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5"
          >
            {SITE.areasServed.map((city) => (
              <li
                key={city}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink"
              >
                <Icon name="check" size={14} className="text-primary" />
                {city}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>
    </>
  );
}
