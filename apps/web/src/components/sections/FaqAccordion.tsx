import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey, translations } from '@i18n/index';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';

interface Props {
  locale: Locale;
}

type CategoryKey = 'all' | 'first_steps' | 'legal' | 'compensation';
type QuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9';

const CATEGORIES: CategoryKey[] = ['all', 'first_steps', 'legal', 'compensation'];

const QUESTION_TO_CATEGORY: Record<QuestionKey, Exclude<CategoryKey, 'all'>> = {
  q2: 'first_steps',
  q5: 'first_steps',
  q1: 'legal',
  q4: 'legal',
  q6: 'legal',
  q8: 'legal',
  q3: 'compensation',
  q7: 'compensation',
  q9: 'compensation',
};

const QUESTIONS: QuestionKey[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

export default function FaqAccordion({ locale }: Props) {
  const prefix = locale === 'en' ? '/en' : '';
  const scheduleHref = `${prefix}/schedule`;

  const [active, setActive] = useState<CategoryKey>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  /* Filter logic: combine search + category */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategory =
      active === 'all'
        ? QUESTIONS
        : QUESTIONS.filter((qk) => QUESTION_TO_CATEGORY[qk] === active);

    if (!q) return byCategory;

    return byCategory.filter((qk) => {
      const question = translations[locale].faq_page.questions[qk].question.toLowerCase();
      const answer = translations[locale].faq_page.questions[qk].answer.toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [active, query, locale]);

  return (
    <>
      {/* =================== HERO with search =================== */}
      <section className="relative isolate overflow-hidden bg-deep pt-28 text-white md:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-[40vmax] w-[40vmax] rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[36vmax] w-[36vmax] rounded-full bg-primary/30 blur-3xl" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {t('faq_page.hero.badge', locale)}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.4rem]"
          >
            {t('faq_page.intro.title', locale)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
          >
            {t('faq_page.intro.description', locale)}
          </motion.p>

          {/* Search field */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-xl"
          >
            <label className="relative block">
              <span className="sr-only">{t('faq_page.search.label', locale)}</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/55">
                <Icon name="sparkles" size={16} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(null);
                }}
                placeholder={t('faq_page.search.placeholder', locale)}
                className="h-12 w-full rounded-full border border-white/15 bg-white/[0.06] pl-11 pr-12 text-sm text-white placeholder:text-white/45 backdrop-blur transition focus:border-secondary/60 focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t('faq_page.search.clear', locale)}
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </label>
            <p className="mt-3 text-xs text-white/55">
              {visible.length}{' '}
              {locale === 'en'
                ? visible.length === 1 ? 'result' : 'results'
                : visible.length === 1 ? 'resultado' : 'resultados'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* =================== STICKY CATEGORY TABS =================== */}
      <div
        ref={tabsRef}
        className="sticky top-[72px] z-30 border-y border-line bg-surface-2/85 backdrop-blur-md md:top-[88px]"
        role="navigation"
        aria-label="FAQ categories"
      >
        <div className="mx-auto max-w-content px-6">
          <div className="-mx-2 flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => {
              const isActive = active === cat;
              const count = cat === 'all'
                ? QUESTIONS.length
                : QUESTIONS.filter((qk) => QUESTION_TO_CATEGORY[qk] === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActive(cat);
                    setOpen(null);
                  }}
                  aria-current={isActive}
                  className={`relative inline-flex flex-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary text-white shadow-[0_6px_18px_-6px_rgba(122,46,135,0.55)]'
                      : 'text-ink/65 hover:bg-primary/[0.06] hover:text-primary'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isActive ? 'bg-secondary' : 'bg-primary/30'
                    }`}
                  />
                  {t(`faq_page.categories.${cat}` as TranslationKey, locale)}
                  <span className={`text-[11px] font-bold ${isActive ? 'text-white/70' : 'text-muted'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/*
       * Bloque speakable / indexable: pre-renderiza todas las Q&A en HTML
       * inicial. Oculto visualmente pero presente para crawlers, Google
       * Assistant (vía SpeakableSpecification) y screen readers que quieran
       * leer todas las respuestas seguidas.
       */}
      <div className="sr-only" data-speakable>
        <dl>
          {QUESTIONS.map((q) => (
            <div key={q}>
              <dt>{t(`faq_page.questions.${q}.question` as TranslationKey, locale)}</dt>
              <dd>{t(`faq_page.questions.${q}.answer` as TranslationKey, locale)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* =================== ACCORDION =================== */}
      <section className="relative bg-white py-16 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:radial-gradient(rgba(122,46,135,0.6)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative mx-auto max-w-3xl px-6">
          {visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-line bg-surface-2 p-6 text-center sm:p-10"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                <Icon name="close" size={20} />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-ink">
                {t('faq_page.search.no_results_title', locale)}
              </p>
              <p className="mt-2 text-sm text-muted">
                {t('faq_page.search.no_results_sub', locale)}
              </p>
              <a
                href={`tel:${SITE.phone.tel}`}
                className="btn-uiverse-primary mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                <Icon name="phone" size={14} />
                {SITE.phone.display}
              </a>
            </motion.div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {visible.map((q, i) => {
                  const isOpen = open === q;
                  return (
                    <motion.li
                      key={q}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className={`overflow-hidden rounded-2xl border transition-colors ${
                        isOpen
                          ? 'border-primary/40 bg-white shadow-[0_18px_40px_-22px_rgba(74,28,90,0.4)]'
                          : 'border-line bg-white hover:border-primary/20'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : q)}
                        aria-expanded={isOpen}
                        className="group flex w-full items-center gap-4 px-5 py-5 text-left md:px-6"
                      >
                        <span
                          className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-full transition ${
                            isOpen
                              ? 'bg-primary text-white'
                              : 'bg-primary/[0.08] text-primary ring-1 ring-primary/15 group-hover:bg-primary group-hover:text-white group-hover:ring-primary/40'
                          }`}
                        >
                          <span
                            className={`faq-toggle ${isOpen ? 'is-open' : ''}`}
                            aria-hidden="true"
                          >
                            <span className="faq-toggle-line" />
                            <span className="faq-toggle-line faq-toggle-indicator" />
                          </span>
                        </span>
                        <span className="flex-1 font-heading text-base font-bold leading-tight text-ink md:text-[1.05rem]">
                          {t(`faq_page.questions.${q}.question` as TranslationKey, locale)}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          >
                            <div className="border-t border-line px-5 pb-6 pl-[4.25rem] pt-5 text-[0.95rem] leading-relaxed text-muted md:px-6 md:pl-[4.5rem]">
                              {t(`faq_page.questions.${q}.answer` as TranslationKey, locale)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </section>

      {/* =================== HELP CTA — split image + content =================== */}
      <section className="relative isolate overflow-hidden bg-deep text-white">
        <div className="relative grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[440px]">
            <img
              src="/images/finalcta.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-deep/60 via-deep/30 to-transparent lg:bg-gradient-to-l lg:from-deep lg:via-deep/50 lg:to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 z-10 flex items-center gap-3 rounded-2xl border border-white/20 bg-deep/95 px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md md:bottom-8 md:left-8"
            >
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-white shadow-[0_6px_14px_-4px_rgba(186,147,194,0.7)]">
                <Icon name="globe" size={18} strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-heading text-base font-extrabold leading-none text-white">
                  ES · EN
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                  {locale === 'en' ? 'Bilingual team' : 'Equipo bilingüe'}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="relative flex flex-col justify-center px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-[28vmax] w-[28vmax] rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-[24vmax] w-[24vmax] rounded-full bg-primary/25 blur-3xl" />
            </div>

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur"
            >
              <span className="h-1 w-1 rounded-full bg-secondary" />
              {locale === 'en' ? 'Still need help' : 'Aún tienes dudas'}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative mt-4 font-heading text-3xl font-extrabold leading-[1.05] md:text-4xl"
            >
              {t('faq_page.help.title', locale)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="relative mt-4 max-w-md text-base leading-relaxed text-white/75"
            >
              {t('faq_page.help.sub', locale)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
              className="relative mt-7 grid gap-3 sm:grid-cols-2"
            >
              <a
                href={`tel:${SITE.phone.tel}`}
                aria-label={t('faq_page.help.call_label', locale)}
                className="btn-uiverse-primary group flex items-center gap-3 rounded-2xl p-4"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon name="phone" size={18} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    {locale === 'en' ? 'Talk now' : 'Habla ahora'}
                  </p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-white">
                    {SITE.phone.displayLong}
                  </p>
                </div>
                <Icon name="arrow-right" size={16} className="text-white/80 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={scheduleHref}
                className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/15">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                    {locale === 'en' ? 'Free, online' : 'Gratis, online'}
                  </p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-white">
                    {t('faq_page.help.cta', locale)}
                  </p>
                </div>
                <Icon name="arrow-right" size={16} className="text-white/55 transition-all group-hover:translate-x-1 group-hover:text-white" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
