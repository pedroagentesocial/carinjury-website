import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Locale } from '@carinjury/shared';
import { t, type TranslationKey } from '@i18n/index';
import { SITE, navLinks, altLocaleHref, type NavItem } from '@lib/site';
import { Icon } from '@components/ui/Icon';
import PioneerDayNotice from '@components/react/PioneerDayNotice';

interface Props {
  locale: Locale;
  currentPath: string;
}

function normalize(path: string): string {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function isActive(linkHref: string, currentPath: string): boolean {
  const a = normalize(linkHref);
  const b = normalize(currentPath);
  if (a === '/' || a === '/en') return b === a;
  return b === a || b.startsWith(`${a}/`);
}

function isItemActive(item: NavItem, currentPath: string): boolean {
  if (item.href && isActive(item.href, currentPath)) return true;
  if (item.children) return item.children.some((c) => isActive(c.href, currentPath));
  return false;
}

export default function Nav({ locale, currentPath }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = navLinks(locale);
  const altHref = altLocaleHref(locale === 'es' ? 'en' : 'es', currentPath);
  const langLabel = locale === 'es' ? 'EN' : 'ES';
  const langFull = locale === 'es' ? 'English' : 'Español';
  const homeHref = locale === 'en' ? '/en/' : '/';
  const scheduleHref = locale === 'en' ? '/en/schedule' : '/schedule';

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
      aria-label="Primary"
    >
      {/* Aviso del Día del Pionero: al ser primer hijo del nav fijo, empuja la
          píldora hacia abajo mientras está visible (se auto-oculta el 25 de julio). */}
      <PioneerDayNotice locale={locale} />
      <div className={`px-3 transition-[padding] duration-300 ease-out md:px-6 ${scrolled ? 'py-2' : 'py-3.5'}`}>
        <div
          className={`mx-auto flex max-w-content items-center justify-between gap-3 rounded-2xl border transition-[background,border-color,box-shadow] duration-300 ease-out md:gap-4 ${
            scrolled
              ? 'border-white/15 bg-deep px-3 py-2 shadow-[0_18px_50px_-20px_rgba(74,28,90,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] md:px-4'
              : 'border-transparent bg-transparent px-3 py-2 shadow-none md:px-4'
          }`}
        >
          {/* LOGO */}
          <a
            href={homeHref}
            className="flex flex-none items-center"
            aria-label={SITE.name}
            style={{ minHeight: scrolled ? 40 : 48 }}
          >
            <img
              src={SITE.logo}
              alt={SITE.name}
              className={`block w-auto brightness-0 invert transition-[height] duration-300 ease-out ${
                scrolled ? 'h-9 md:h-10' : 'h-11 md:h-12'
              }`}
              width={140}
              height={44}
              decoding="async"
              fetchPriority="high"
            />
          </a>

          {/* LINKS desktop */}
          <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((l) =>
              l.children ? (
                <DesktopDropdown
                  key={l.key}
                  item={l}
                  locale={locale}
                  currentPath={currentPath}
                  scrolled={scrolled}
                />
              ) : (
                <DesktopLink
                  key={l.href ?? l.key}
                  item={l}
                  locale={locale}
                  currentPath={currentPath}
                />
              ),
            )}
          </ul>

          {/* RIGHT actions */}
          <div className="flex flex-none items-center gap-1.5 md:gap-2">
            <a
              href={altHref}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white md:inline-flex"
              aria-label={`Switch language to ${langFull}`}
              title={langFull}
            >
              <Icon name="globe" size={13} />
              <span>{langLabel}</span>
            </a>

            <a
              href={`tel:${SITE.phone.tel}`}
              className="btn-uiverse hidden h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold md:inline-flex"
              aria-label={`Call ${SITE.phone.display}`}
            >
              <Icon name="phone" size={14} />
              <span className="hidden xl:inline">{SITE.phone.display}</span>
            </a>

            <a
              href={scheduleHref}
              className="btn-uiverse-primary group hidden h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold md:inline-flex"
            >
              <span>{t('nav.schedule', locale)}</span>
              <Icon name="arrow-right" size={13} className="transition-transform group-hover:translate-x-0.5" />
            </a>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={`burger ${open ? 'is-open' : ''}`} aria-hidden="true">
                <span className="burger-bar" />
                <span className="burger-bar" />
                <span className="burger-bar" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 -z-10 bg-deep/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="mx-3 mt-1 overflow-hidden rounded-2xl border border-white/12 bg-deep/95 px-3 pb-5 pt-3 text-white shadow-[0_30px_80px_-20px_rgba(74,28,90,0.7)] backdrop-blur-2xl md:mx-6 lg:hidden"
            >
              <ul className="flex flex-col gap-0.5">
                {links.map((l, i) => (
                  <MobileItem
                    key={l.key}
                    item={l}
                    locale={locale}
                    currentPath={currentPath}
                    index={i}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </ul>
              <div className="mt-4 grid gap-2 border-t border-white/12 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={altHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-3 text-sm font-semibold text-white/90"
                  >
                    <Icon name="globe" size={14} />
                    {langFull}
                  </a>
                  <a
                    href={`tel:${SITE.phone.tel}`}
                    className="btn-uiverse inline-flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-semibold"
                  >
                    <Icon name="phone" size={14} />
                    {SITE.phone.display}
                  </a>
                </div>
                <a
                  href={scheduleHref}
                  className="btn-uiverse-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.schedule', locale)}
                  <Icon name="arrow-right" size={14} />
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ============= DESKTOP LINK (no dropdown) ============= */
function DesktopLink({
  item,
  locale,
  currentPath,
}: {
  item: NavItem;
  locale: Locale;
  currentPath: string;
}) {
  if (!item.href) return null;
  const active = isActive(item.href, currentPath);
  return (
    <li className="relative">
      <a
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
          active ? 'text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 -z-10 rounded-full bg-white/12 ring-1 ring-white/20"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        {t(item.key as TranslationKey, locale)}
      </a>
    </li>
  );
}

/* ============= DESKTOP DROPDOWN ============= */
function DesktopDropdown({
  item,
  locale,
  currentPath,
  scrolled,
}: {
  item: NavItem;
  locale: Locale;
  currentPath: string;
  scrolled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const active = isItemActive(item, currentPath);

  const handleEnter = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  /* Close on outside click / ESC */
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
          active ? 'text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 -z-10 rounded-full bg-white/12 ring-1 ring-white/20"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        {t(item.key as TranslationKey, locale)}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <Icon name="chevron-down" size={13} strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="menu"
            className={`absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-2xl p-2 ring-1 ring-black/[0.06] shadow-[0_24px_50px_-20px_rgba(74,28,90,0.35)] transition-colors duration-300 ${
              scrolled ? 'bg-white' : 'bg-white/80 backdrop-blur-xl'
            }`}
          >
            {item.children?.map((child) => {
              const childActive = isActive(child.href, currentPath);
              return (
                <a
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  aria-current={childActive ? 'page' : undefined}
                  className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition ${
                    childActive
                      ? 'bg-primary/[0.06] ring-1 ring-primary/15'
                      : 'hover:bg-primary/[0.05]'
                  }`}
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition group-hover:bg-primary/15">
                    <Icon
                      name={child.icon ?? (child.key === 'nav.form' ? 'mail' : 'sparkles')}
                      size={14}
                      strokeWidth={2.2}
                    />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-semibold text-ink">
                      {t(child.key as TranslationKey, locale)}
                    </p>
                    {child.descKey && (
                      <p className="mt-0.5 text-[11px] text-muted">
                        {t(child.descKey as TranslationKey, locale)}
                      </p>
                    )}
                  </div>
                  <Icon
                    name="arrow-right"
                    size={13}
                    className="mt-2 flex-none text-muted/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ============= MOBILE ITEM (handles both link + expandable group) ============= */
function MobileItem({
  item,
  locale,
  currentPath,
  index,
  onNavigate,
}: {
  item: NavItem;
  locale: Locale;
  currentPath: string;
  index: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(() => isItemActive(item, currentPath));

  if (!item.children) {
    const active = item.href ? isActive(item.href, currentPath) : false;
    return (
      <motion.li
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.04 * index }}
      >
        <a
          href={item.href ?? '#'}
          aria-current={active ? 'page' : undefined}
          className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition ${
            active
              ? 'bg-white/12 text-white ring-1 ring-white/20'
              : 'text-white/85 hover:bg-white/[0.08]'
          }`}
          onClick={onNavigate}
        >
          <span>{t(item.key as TranslationKey, locale)}</span>
          <Icon name="arrow-right" size={14} className="text-white/40" />
        </a>
      </motion.li>
    );
  }

  /* Dropdown item: expandable section */
  const groupActive = isItemActive(item, currentPath);
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index }}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition ${
          groupActive
            ? 'bg-white/12 text-white ring-1 ring-white/20'
            : 'text-white/85 hover:bg-white/[0.08]'
        }`}
      >
        <span>{t(item.key as TranslationKey, locale)}</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Icon name="chevron-down" size={14} className="text-white/55" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ul className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
              {item.children.map((child) => {
                const childActive = isActive(child.href, currentPath);
                return (
                  <li key={child.href}>
                    <a
                      href={child.href}
                      aria-current={childActive ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                        childActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                      }`}
                      onClick={onNavigate}
                    >
                      <span>{t(child.key as TranslationKey, locale)}</span>
                      <Icon name="arrow-right" size={12} className="text-white/30" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
