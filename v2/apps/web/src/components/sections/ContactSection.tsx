import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon, type IconName } from '@components/ui/Icon';
import { SITE } from '@lib/site';
import ContactForm from './ContactForm';

interface Props {
  locale: Locale;
}

interface Benefit {
  icon: IconName;
  label: string;
}

export default function ContactSection({ locale }: Props) {
  const benefits: Benefit[] = locale === 'en'
    ? [
        { icon: 'sparkles',    label: 'Same-day X-Ray and diagnosis' },
        { icon: 'clock',       label: 'Same-day care after the accident' },
        { icon: 'stethoscope', label: 'Medical team with 15+ years experience' },
        { icon: 'gavel',       label: 'Specialized legal support included' },
        { icon: 'shield',      label: 'We handle the full insurance process' },
        { icon: 'check',       label: 'Advanced rehabilitation treatments' },
        { icon: 'car',         label: 'Free transportation to your appointments' },
        { icon: 'globe',       label: 'Care in Spanish, English and Portuguese' },
      ]
    : [
        { icon: 'sparkles',    label: 'Rayos X y diagnóstico el mismo día' },
        { icon: 'clock',       label: 'Atención el mismo día del accidente' },
        { icon: 'stethoscope', label: 'Equipo médico con +15 años de experiencia' },
        { icon: 'gavel',       label: 'Apoyo legal especializado incluido' },
        { icon: 'shield',      label: 'Manejamos todo el proceso con tu seguro' },
        { icon: 'check',       label: 'Tratamientos avanzados de rehabilitación' },
        { icon: 'car',         label: 'Transporte gratuito a tus citas' },
        { icon: 'globe',       label: 'Atención en español, inglés y portugués' },
      ];

  return (
    <section id="contact" className="relative overflow-hidden bg-deep py-16 text-white md:py-24 lg:py-28">
      {/* Background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
      </div>

      {/* Dot pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative mx-auto grid max-w-content items-start gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        {/* ============== LEFT COLUMN ============== */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex h-full flex-col rounded-3xl border border-white/15 bg-white/[0.05] p-7 backdrop-blur-md md:p-9"
        >
          {/* Eyebrow chip — agregado para identidad clara */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {locale === 'en' ? 'Free evaluation, no commitment' : 'Evaluación gratis, sin compromiso'}
          </span>

          <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.2rem]">
            {locale === 'en' ? (
              <>
                Had an accident?{' '}
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 -z-0 h-[0.42em] rounded-md bg-secondary/40"
                  />
                  <span className="relative z-10 text-white [text-shadow:0_2px_18px_rgba(186,147,194,0.5)]">
                    We help you recover.
                  </span>
                </span>
              </>
            ) : (
              <>
                ¿Tuviste un accidente?{' '}
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 -z-0 h-[0.42em] rounded-md bg-secondary/40"
                  />
                  <span className="relative z-10 text-white [text-shadow:0_2px_18px_rgba(186,147,194,0.5)]">
                    Te ayudamos a recuperarte.
                  </span>
                </span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 md:text-lg">
            {locale === 'en'
              ? 'Medical care and legal support in one place. Free evaluation with no commitment.'
              : 'Atención médica y apoyo legal en un solo lugar. Evaluación gratuita sin compromiso.'}
          </p>

          {/* Benefits — chips rosa sólidos para alto contraste */}
          <ul className="mt-8 grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <motion.li
                key={b.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-secondary text-white shadow-[0_4px_12px_-4px_rgba(186,147,194,0.7)]">
                  <Icon name={b.icon} size={15} strokeWidth={2.4} />
                </span>
                <span className="text-[0.92rem] font-medium leading-snug text-white">{b.label}</span>
              </motion.li>
            ))}
          </ul>

          {/* Direct phone CTA — más punch */}
          <div className="mt-auto pt-8">
            <a
              href={`tel:${SITE.phone.tel}`}
              className="group flex items-center gap-4 rounded-2xl border border-secondary/50 bg-secondary/10 p-4 shadow-[0_10px_30px_-12px_rgba(186,147,194,0.5)] transition hover:border-secondary hover:bg-secondary/20"
            >
              <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-secondary text-white shadow-[0_8px_20px_-6px_rgba(186,147,194,0.85)]">
                <Icon name="phone" size={20} />
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  {locale === 'en' ? 'Or call directly' : 'O llámanos directo'}
                </p>
                <p className="font-heading text-lg font-extrabold text-white">
                  {SITE.phone.displayLong}
                </p>
              </div>
              <Icon
                name="arrow-right"
                size={18}
                className="text-secondary transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* Social row — abajo del CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-2 flex items-center gap-3"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
              {locale === 'en' ? 'Follow us' : 'Síguenos'}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            <ul className="social-wrapper">
              <li>
                <a
                  href={SITE.social.facebook}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  className="social-icon facebook"
                >
                  <FacebookIcon />
                  <span className="social-tooltip">Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="social-icon instagram"
                >
                  <InstagramIcon />
                  <span className="social-tooltip">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.tiktok}
                  target="_blank"
                  rel="noopener"
                  aria-label="TikTok"
                  className="social-icon tiktok"
                >
                  <TikTokIcon />
                  <span className="social-tooltip">TikTok</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.google}
                  target="_blank"
                  rel="noopener"
                  aria-label="Google"
                  className="social-icon google"
                >
                  <GoogleIcon />
                  <span className="social-tooltip">Google</span>
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* ============== RIGHT COLUMN: FORM ============== */}
        <ContactForm locale={locale} />
      </div>
    </section>
  );
}

/* ============= Brand icon SVGs ============= */
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.675 0h-21.35C.593 0 0 .592 0 1.324v21.352C0 23.408.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.592 1.323-1.324V1.324C24 .592 23.408 0 22.675 0z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.84-.04z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 13.317 4 4 13.317 4 24s9.317 20 20 20 20-9.317 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
