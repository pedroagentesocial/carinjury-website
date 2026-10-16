import { motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

interface Section {
  id: string;
  title: TranslationKey;
  content?: TranslationKey;
  items?: { title: TranslationKey; content: TranslationKey }[];
}

const SECTIONS: Section[] = [
  { id: 'intro', title: 'privacy.section1_title', content: 'privacy.section1_content' },
  {
    id: 'collected',
    title: 'privacy.section2_title',
    items: [
      { title: 'privacy.section2_item1_title', content: 'privacy.section2_item1_content' },
      { title: 'privacy.section2_item2_title', content: 'privacy.section2_item2_content' },
      { title: 'privacy.section2_item3_title', content: 'privacy.section2_item3_content' },
    ],
  },
  {
    id: 'usage',
    title: 'privacy.section3_title',
    items: [
      { title: 'privacy.section3_item1_title', content: 'privacy.section3_item1_content' },
      { title: 'privacy.section3_item2_title', content: 'privacy.section3_item2_content' },
      { title: 'privacy.section3_item3_title', content: 'privacy.section3_item3_content' },
    ],
  },
  { id: 'protection', title: 'privacy.section4_title', content: 'privacy.section4_content' },
  {
    id: 'rights',
    title: 'privacy.section5_title',
    items: [
      { title: 'privacy.section5_item1_title', content: 'privacy.section5_item1_content' },
      { title: 'privacy.section5_item2_title', content: 'privacy.section5_item2_content' },
      { title: 'privacy.section5_item3_title', content: 'privacy.section5_item3_content' },
    ],
  },
  {
    id: 'sharing',
    title: 'privacy.section6_title',
    items: [
      { title: 'privacy.section6_item1_title', content: 'privacy.section6_item1_content' },
      { title: 'privacy.section6_item2_title', content: 'privacy.section6_item2_content' },
      { title: 'privacy.section6_item3_title', content: 'privacy.section6_item3_content' },
    ],
  },
  { id: 'changes', title: 'privacy.section7_title', content: 'privacy.section7_content' },
];

export default function PrivacyContent({ locale }: Props) {
  const updated = new Date('2026-01-01').toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-content gap-12 px-6 lg:grid-cols-[260px_1fr]">
        {/* TOC sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {locale === 'en' ? 'On this page' : 'En esta página'}
            </p>
            <nav className="mt-4 flex flex-col gap-2">
              {SECTIONS.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white hover:text-primary"
                >
                  <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white text-xs font-bold text-primary ring-1 ring-line group-hover:bg-primary group-hover:text-white">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-tight">{t(s.title, locale)}</span>
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs text-muted">
                {t('privacy.last_updated', locale)} {updated}
              </p>
            </div>
          </div>
        </aside>

        {/* Body */}
        <article className="max-w-2xl">
          <div className="space-y-10">
            {SECTIONS.map((s, idx) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className="scroll-mt-28"
              >
                <h2 className="flex items-center gap-3 font-heading text-2xl font-bold text-ink md:text-3xl">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  {t(s.title, locale)}
                </h2>
                {s.content && (
                  <p className="mt-4 leading-relaxed text-muted">{t(s.content, locale)}</p>
                )}
                {s.items && (
                  <div className="mt-5 space-y-4">
                    {s.items.map((it) => (
                      <div
                        key={it.title}
                        className="rounded-2xl border border-line bg-surface-2 p-5"
                      >
                        <h3 className="font-heading text-base font-bold text-ink">
                          {t(it.title, locale)}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{t(it.content, locale)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            ))}

            {/* Contact block */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-deep p-8 text-white shadow-lg"
            >
              <h2 className="font-heading text-2xl font-bold">{t('privacy.contact_title', locale)}</h2>
              <p className="mt-3 text-white/85">{t('privacy.contact_content', locale)}</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Icon name="mail" size={16} />
                  <span className="text-white/70">{t('privacy.contact_email_label', locale)}</span>
                  <a href={`mailto:${SITE.email}`} className="font-semibold hover:underline">
                    {SITE.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="phone" size={16} />
                  <span className="text-white/70">{t('privacy.contact_phone_label', locale)}</span>
                  <a href={`tel:${SITE.phone.tel}`} className="font-semibold hover:underline">
                    {SITE.phone.displayLong}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="pin" size={16} className="mt-0.5" />
                  <span className="text-white/70">{t('privacy.contact_address_label', locale)}</span>
                  <span className="whitespace-pre-line">{t('privacy.contact_address', locale)}</span>
                </li>
              </ul>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
              >
                {t('privacy.view_on_maps', locale)}
                <Icon name="arrow-right" size={14} />
              </a>
            </motion.section>
          </div>
        </article>
      </div>
    </section>
  );
}
