import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Imagen de fondo opcional (con overlay automático para legibilidad). */
  backgroundImage?: string;
  /** Alt text de la imagen — para SEO. Si no se pasa, queda decorativa. */
  backgroundAlt?: string;
  /** Collage de fondo: varias imágenes en grid (tiene prioridad sobre backgroundImage). */
  collageImages?: string[];
  /** Si la página tiene un anchor donde scrollear, el botón "Agendar" baja en lugar de navegar. */
  scrollToAnchor?: string;
}

export default function PageHero({
  locale,
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  backgroundAlt,
  collageImages,
  scrollToAnchor,
}: Props) {
  const hasCollage = Array.isArray(collageImages) && collageImages.length > 0;
  const hasBg = hasCollage || Boolean(backgroundImage);
  const scheduleHref = scrollToAnchor
    ? `#${scrollToAnchor}`
    : (locale === 'en' ? '/en/schedule' : '/schedule');
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();

  /* Parallax: la imagen de fondo se mueve más lento que el scroll → sensación de profundidad.
     Respeta prefers-reduced-motion (sin movimiento si el usuario lo pidió). */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? ['0%', '0%'] : ['0%', '25%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [1.08, 1.18]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-deep pb-20 pt-32 text-white md:pb-28 md:pt-36"
    >
      {/* Collage de fondo (varias imágenes en grid) — tiene prioridad */}
      {hasCollage && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 grid grid-rows-1 grid-cols-2 lg:grid-cols-4 [&>*:nth-child(n+3)]:hidden lg:[&>*:nth-child(n+3)]:block"
          style={{ y: bgY, scale: bgScale, filter: 'brightness(0.55) saturate(1.05)', willChange: 'transform' }}
        >
          {collageImages!.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ))}
        </motion.div>
      )}

      {/* Background image con parallax (si no hay collage) */}
      {!hasCollage && backgroundImage && (
        <motion.img
          src={backgroundImage}
          alt={backgroundAlt ?? ''}
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
          style={{
            y: bgY,
            scale: bgScale,
            filter: 'brightness(0.6) saturate(1.05)',
            willChange: 'transform',
          }}
        />
      )}

      {/* Scrims morados sobre la imagen/collage */}
      {hasBg && (
        <>
          {/* Tinte morado: cubre toda la imagen con un wash de marca */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-deep/45 mix-blend-multiply"
          />
          {/* Gradient diagonal: refuerza el morado y oscurece la zona del texto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-deep/80 via-primary/45 to-secondary/25"
          />
          {/* Vignette focal en la zona del texto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_30%_55%,rgba(74,28,90,0.55),transparent_75%)]"
          />
        </>
      )}

      {/* Blobs blur — solo cuando NO hay imagen ni collage de fondo */}
      {!hasBg && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
        </div>
      )}

      {/* Dot pattern sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative mx-auto max-w-content px-6">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-4 max-w-3xl font-heading text-3xl font-extrabold leading-[1.05] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)] md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a
            href={`tel:${SITE.phone.tel}`}
            className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            <Icon name="phone" size={16} />
            {SITE.phone.display}
          </a>
          <a
            href={scheduleHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            <Icon name="calendar" size={16} />
            {locale === 'en' ? 'Schedule' : 'Agendar'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
