import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

interface ServicePanel {
  img: string;
  imgAlt: string;
  icon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  floatBadge: { label: string; value: string };
}

export default function Services({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';

  const panels: ServicePanel[] = [
    {
      img: '/images/medical-care.jpeg',
      imgAlt: locale === 'en' ? 'Chiropractic care session' : 'Sesión de atención quiropráctica',
      icon: 'stethoscope',
      eyebrow: locale === 'en' ? 'Medical care' : 'Atención médica',
      title: t('services.left.title', locale),
      description: t('services.left.description', locale),
      features:
        locale === 'en'
          ? [
              'Same-day appointments',
              'Digital X-Ray on site',
              'Massage, ultrasound and TENS therapy',
              'Free pickup and drop-off transport',
            ]
          : [
              'Citas el mismo día',
              'Radiografía digital en sitio',
              'Masaje, ultrasonido y terapia TENS',
              'Transporte gratis a la clínica',
            ],
      ctaPrimary: {
        label: locale === 'en' ? 'Book an appointment' : 'Agendar consulta',
        href: `${prefix}/schedule`,
      },
      ctaSecondary: {
        label: locale === 'en' ? 'See all services' : 'Ver todos los servicios',
        href: `${prefix}/services`,
      },
      floatBadge: {
        label: locale === 'en' ? 'Patients treated' : 'Pacientes tratados',
        value: '5,000+',
      },
    },
    {
      img: '/images/legal.jpg',
      imgAlt: locale === 'en' ? 'Legal team reviewing case' : 'Equipo legal revisando un caso',
      icon: 'gavel',
      eyebrow: locale === 'en' ? 'Legal support' : 'Apoyo legal',
      title: t('services.right.title', locale),
      description: t('services.right.description', locale),
      features:
        locale === 'en'
          ? [
              'Insurance claim handling',
              'Specialized accident attorneys',
              'No fees until you win',
              'Real-time case updates',
            ]
          : [
              'Reclamo a la aseguradora',
              'Abogados especialistas en accidentes',
              'Sin pagos por adelantado',
              'Actualización de tu caso en vivo',
            ],
      ctaPrimary: {
        label: locale === 'en' ? 'Get legal help' : 'Obtener ayuda legal',
        href: `${prefix}/lawyer-approved`,
      },
      ctaSecondary: {
        label: locale === 'en' ? 'How it works' : 'Cómo funciona',
        href: `${prefix}/faq`,
      },
      floatBadge: {
        label: locale === 'en' ? 'Recovered for clients' : 'Recuperado para clientes',
        value: '$25M+',
      },
    },
  ];

  return (
    <section id="services" className="relative overflow-hidden bg-white py-16 md:py-24 lg:py-28">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      <div className="relative mx-auto max-w-content px-6">
        {/* SECTION HEADER */}
        <header className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {locale === 'en' ? 'What we do' : 'Lo que hacemos'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl lg:text-[2.6rem]"
          >
            {locale === 'en' ? (
              <>
                Medical care and legal support,
                <br className="hidden md:inline" />{' '}
                <span className="text-primary">in one place.</span>
              </>
            ) : (
              <>
                Atención médica y apoyo legal,
                <br className="hidden md:inline" />{' '}
                <span className="text-primary">en un solo lugar.</span>
              </>
            )}
          </motion.h2>
        </header>

        {/* SERVICE PANELS — alternating editorial layout */}
        <div className="flex flex-col gap-20 md:gap-28">
          {panels.map((p, i) => (
            <ServiceRow key={p.title} panel={p} reverse={i % 2 === 1} />
          ))}
        </div>

        {/* FOOTER CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 flex flex-col items-stretch gap-5 rounded-3xl border border-line bg-surface-2 p-7 md:flex-row md:items-center md:gap-7 md:p-9"
        >
          <div className="flex flex-1 items-center gap-5">
            <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_-8px_rgba(122,46,135,0.55)]">
              <Icon name="phone" size={24} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                {t('services.cta.badge', locale)}
              </p>
              <p className="mt-1 font-heading text-xl font-bold leading-tight text-ink md:text-2xl">
                {t('services.cta.subtitle', locale)}
              </p>
            </div>
          </div>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-7 py-3.5 font-semibold text-white shadow-[0_8px_24px_-6px_rgba(186,147,194,0.6)] transition hover:bg-primary"
          >
            {SITE.phone.displayLong}
            <Icon name="arrow-right" size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ============= SUB-COMPONENT: Editorial alternating row ============= */
function ServiceRow({ panel, reverse }: { panel: ServicePanel; reverse: boolean }) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative ${reverse ? 'lg:order-2' : ''}`}
      >
        <div className="group relative overflow-hidden rounded-3xl border border-line shadow-[0_25px_60px_-25px_rgba(74,28,90,0.45)]">
          {/* Image */}
          <img
            src={panel.img}
            alt={panel.imgAlt}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 md:aspect-[5/6] lg:aspect-[4/5]"
          />
          {/* Subtle vignette to ground floating elements */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent"
          />
        </div>

        {/* Floating icon badge (top-left or top-right) */}
        <div
          className={`absolute -top-4 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_18px_40px_-18px_rgba(74,28,90,0.55)] ring-1 ring-line ${
            reverse ? 'right-4 md:right-6' : 'left-4 md:left-6'
          }`}
          aria-hidden="true"
        >
          <Icon name={panel.icon} size={26} strokeWidth={2} />
        </div>

        {/* Floating stat card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className={`absolute -bottom-5 z-10 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(74,28,90,0.55)] ${
            reverse ? 'left-4 md:left-6' : 'right-4 md:right-6'
          }`}
        >
          <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <Icon name="sparkles" size={18} />
          </span>
          <div>
            <p className="font-heading text-lg font-extrabold leading-none text-ink">
              {panel.floatBadge.value}
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
              {panel.floatBadge.label}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className={reverse ? 'lg:order-1' : ''}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          <span className="h-1 w-1 rounded-full bg-secondary" />
          {panel.eyebrow}
        </span>
        <h3 className="mt-4 font-heading text-3xl font-extrabold leading-[1.1] text-ink md:text-4xl">
          {panel.title}
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted md:text-lg">
          {panel.description}
        </p>

        {/* Feature list */}
        <ul className="mt-7 grid gap-3">
          {panel.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
              <span className="text-[0.95rem] leading-snug text-ink">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={panel.ctaPrimary.href}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(122,46,135,0.55)] transition hover:bg-[#6a3f75]"
          >
            {panel.ctaPrimary.label}
            <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={panel.ctaSecondary.href}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-semibold text-ink transition hover:border-primary/40 hover:text-primary"
          >
            {panel.ctaSecondary.label}
            <Icon name="arrow-right" size={16} className="text-muted transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </a>
        </div>
      </motion.div>
    </article>
  );
}
