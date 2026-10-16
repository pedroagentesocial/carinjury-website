import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function AboutVideo({ locale }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  /* Lazy load del video: solo se baja cuando entra al viewport */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const v = videoRef.current;
            if (v && !v.src) {
              v.src = v.dataset.src!;
              v.load();
              v.play().catch(() => {});
              setLoaded(true);
              obs.disconnect();
            }
          }
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  /* Pausa cuando la sección sale de viewport (ahorra batería / CPU) */
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, [loaded]);

  const title = t('about_video.title', locale);
  const titleLines = title.split('\n');

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[480px] items-center overflow-hidden bg-[var(--c-sec-3)] py-16 text-white md:min-h-[560px] md:py-24 lg:min-h-[640px] lg:py-28"
      aria-label={t('about_video.title', locale).replace(/\n/g, ' ')}
    >
      {/* VIDEO BG */}
      <video
        ref={videoRef}
        data-src="/video/clinic.mp4"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{ filter: 'brightness(0.7) saturate(1.05)' }}
      />

      {/* Dark scrim — focal radial sobre el texto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(70%_55%_at_50%_55%,rgba(0,0,0,0.55),rgba(0,0,0,0.2)_75%)]"
      />
      {/* Vertical scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-deep/40 via-transparent to-deep/55"
      />
      {/* Brand color tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-deep/25 via-transparent to-primary/15"
      />

      <div className="relative mx-auto w-full max-w-content px-6 text-center">
        {/* Eyebrow chip */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {locale === 'en' ? 'Top rated' : 'Mejor calificada'}
        </motion.span>

        {/* TITLE — multi-line con el line break del i18n */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mx-auto mt-5 font-heading text-3xl font-extrabold uppercase leading-[1.05] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem]"
        >
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {i === titleLines.length - 1 ? (
                <span className="text-secondary">{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </motion.h2>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)] md:text-lg lg:text-xl"
        >
          {t('about_video.tagline', locale)}
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={scheduleHref}
            className="btn-uiverse-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            <Icon name="calendar" size={16} />
            {locale === 'en' ? 'Schedule now' : 'Agenda ahora'}
            <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={`tel:${SITE.phone.tel}`}
            className="btn-uiverse inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            <Icon name="phone" size={16} />
            {SITE.phone.display}
          </a>
          <a
            href={t('about_video.contact_button', locale) ? '#contact' : '#contact'}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/45"
          >
            {t('about_video.contact_button', locale)}
            <Icon name="arrow-right" size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
