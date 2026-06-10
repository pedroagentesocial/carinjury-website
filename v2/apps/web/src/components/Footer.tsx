import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE, navLinks } from '@lib/site';
import { Icon, type IconName } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

interface FooterLink {
  href: string;
  label: string;
}

interface ContactItem {
  icon: IconName;
  label: string;
  sub?: string;
  href: string;
  external?: boolean;
}

export default function Footer({ locale }: Props) {
  const year = new Date().getFullYear();
  const prefix = locale === 'en' ? '/en' : '';
  const homeHref = locale === 'en' ? '/en/' : '/';

  /* Aplana navLinks: items con href propio + children de dropdowns */
  const flatNavItems = navLinks(locale).flatMap((item) =>
    item.children
      ? item.children.map((c) => ({ href: c.href, key: c.key }))
      : item.href
        ? [{ href: item.href, key: item.key }]
        : [],
  );

  const services: FooterLink[] = locale === 'en'
    ? [
        { href: `${prefix}/services#chiropractic`, label: 'Chiropractic' },
        { href: `${prefix}/services#rehabilitation`, label: 'Rehabilitation' },
        { href: `${prefix}/services#xray`, label: 'X-Ray imaging' },
        { href: `${prefix}/services#physical_therapy`, label: 'Physical therapy' },
        { href: `${prefix}/lawyer-approved`, label: 'Legal support' },
        { href: `${prefix}/services`, label: 'See all services' },
      ]
    : [
        { href: `${prefix}/services#chiropractic`, label: 'Quiropráctica' },
        { href: `${prefix}/services#rehabilitation`, label: 'Rehabilitación' },
        { href: `${prefix}/services#xray`, label: 'Radiografías (X-Ray)' },
        { href: `${prefix}/services#physical_therapy`, label: 'Terapia física' },
        { href: `${prefix}/lawyer-approved`, label: 'Apoyo legal' },
        { href: `${prefix}/services`, label: 'Ver todos los servicios' },
      ];

  const contact: ContactItem[] = [
    {
      icon: 'phone',
      label: SITE.phone.displayLong,
      sub: locale === 'en' ? 'Available 24/7' : 'Disponible 24/7',
      href: `tel:${SITE.phone.tel}`,
    },
    {
      icon: 'mail',
      label: SITE.email,
      sub: locale === 'en' ? 'Reply within 24h' : 'Respondemos en 24h',
      href: `mailto:${SITE.email}`,
    },
    {
      icon: 'pin',
      label: SITE.address.full,
      sub: locale === 'en' ? 'Location & directions' : 'Ubicación y cómo llegar',
      href: `${prefix}/location`,
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-deep text-white">
      {/* Background glows — consistente con ContactSection */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[32vmax] w-[32vmax] rounded-full bg-primary/25 blur-3xl" />
      </div>

      {/* Dot pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative mx-auto max-w-content px-6 pt-16 md:pt-20">
        {/* =================== MAIN FOOTER GRID =================== */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:gap-12">
          {/* === Brand col === */}
          <div>
            <a href={homeHref} className="inline-block" aria-label={SITE.name}>
              <img
                src={SITE.logo}
                alt={SITE.name}
                width={150}
                height={48}
                className="h-12 w-auto brightness-0 invert"
                loading="lazy"
                decoding="async"
              />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/85">
              {t('footer.tagline', locale)}
            </p>

            {/* Hours card */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary text-white shadow-[0_4px_12px_-4px_rgba(186,147,194,0.6)]">
                <Icon name="clock" size={16} strokeWidth={2.4} />
              </span>
              <div className="text-left leading-tight">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
                  {locale === 'en' ? 'Hours' : 'Horarios'}
                </p>
                <p className="mt-0.5 text-[0.85rem] font-medium text-white/90">
                  {t('footer.hours_short', locale)}
                </p>
              </div>
            </div>
          </div>

          {/* === Services col === */}
          <div>
            <h3 className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white">
              <span aria-hidden="true" className="h-px w-5 bg-secondary" />
              {t('footer.services_label', locale)}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="group inline-flex items-center gap-2 text-white/80 transition hover:text-secondary"
                  >
                    <span className="h-px w-0 bg-secondary transition-all duration-300 group-hover:w-4" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* === Quick links col === */}
          <div>
            <h3 className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white">
              <span aria-hidden="true" className="h-px w-5 bg-secondary" />
              {t('footer.links_label', locale)}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {flatNavItems.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-white/80 transition hover:text-secondary"
                  >
                    <span className="h-px w-0 bg-secondary transition-all duration-300 group-hover:w-4" />
                    {t(l.key as TranslationKey, locale)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* === Contact col === */}
          <div>
            <h3 className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white">
              <span aria-hidden="true" className="h-px w-5 bg-secondary" />
              {t('footer.contact_section', locale)}
            </h3>
            <ul className="space-y-3">
              {contact.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener' } : {})}
                    className="slice-contact group flex items-start gap-3 p-3"
                  >
                    <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-secondary text-white shadow-[0_4px_12px_-4px_rgba(186,147,194,0.7)] transition-colors duration-500 group-hover:bg-deep">
                      <Icon name={c.icon} size={16} strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="text-[0.92rem] font-bold text-white transition-colors duration-500 group-hover:text-deep">{c.label}</p>
                      {c.sub && (
                        <p className="mt-0.5 text-[0.78rem] font-medium text-white/75 transition-colors duration-500 group-hover:text-deep/90">{c.sub}</p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* =================== BOTTOM BAR =================== */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 pb-8 text-xs font-medium text-white/75 md:flex-row">
          <p className="text-center md:text-left">
            © {year} {SITE.name}. {t('footer.copyright', locale)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a
              href={`${prefix}/privacy`}
              className="transition hover:text-secondary"
            >
              {t('footer.privacy', locale)}
            </a>
            <span aria-hidden="true" className="h-3 w-px bg-white/15" />
            <a
              href={SITE.writeReviewUrl}
              target="_blank"
              rel="noopener"
              className="transition hover:text-secondary"
            >
              {t('footer.review_cta', locale)}
            </a>
            <span aria-hidden="true" className="h-3 w-px bg-white/15" />
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener"
              className="transition hover:text-secondary"
            >
              Google Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
