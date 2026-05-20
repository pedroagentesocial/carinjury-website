import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

export default function ComingSoon({ locale }: Props) {
  return (
    <section className="bg-surface-2 py-20">
      <div className="mx-auto max-w-content px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-line bg-white p-10 text-center shadow-md"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
            <Icon name="sparkles" size={26} />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold text-ink">
            {locale === 'en' ? 'Section under construction' : 'Sección en construcción'}
          </h2>
          <p className="mt-2 max-w-md text-muted">
            {locale === 'en'
              ? 'This page is being rebuilt in v2. Meanwhile, we are available by phone and our team responds within 24 hours.'
              : 'Esta página está siendo reconstruida en v2. Mientras tanto, estamos disponibles por teléfono y nuestro equipo responde en menos de 24 horas.'}
          </p>
          <a
            href={locale === 'en' ? '/en/' : '/'}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-deep"
          >
            {locale === 'en' ? 'Back to home' : 'Volver al inicio'}
            <Icon name="arrow-right" size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
