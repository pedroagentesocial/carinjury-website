import { DEFAULT_LOCALE, isLocale, type Locale, type Paths } from '@carinjury/shared';
import esTranslations from './es.json';
import enTranslations from './en.json';

export { DEFAULT_LOCALE, isLocale };
export type { Locale };

export const translations = {
  es: esTranslations,
  en: enTranslations,
} as const;

export type Translations = typeof esTranslations;
export type TranslationKey = Paths<Translations>;

/**
 * Obtiene una traducción tipada. Si falta en el locale, cae al default.
 * Si la clave no existe en ningún lado, devuelve la clave misma (señal de bug).
 */
export function t(key: TranslationKey, lang: Locale = DEFAULT_LOCALE): string {
  const value = readPath(translations[lang], key);
  if (typeof value === 'string') return value;
  const fallback = readPath(translations[DEFAULT_LOCALE], key);
  if (typeof fallback === 'string') return fallback;
  if (import.meta.env.DEV) {
    console.warn(`[i18n] missing key: ${key}`);
  }
  return key;
}

function readPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Resuelve el locale a partir del path actual de Astro (`Astro.currentLocale`).
 */
export function resolveLocale(currentLocale: string | undefined): Locale {
  return isLocale(currentLocale) ? currentLocale : DEFAULT_LOCALE;
}
