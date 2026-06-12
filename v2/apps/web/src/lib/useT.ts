// Puente entre la i18n de v2 (t(key, locale) de src/i18n) y los componentes
// React del sorteo, que esperan un hook useT() → { t, lang, setLang } con
// t(key, fallback). El locale se lee del <html lang> (lo pone Astro según la
// ruta es/en). Si la clave no existe en las traducciones, usa el fallback en
// español embebido en los componentes (Spanish-first).

import { useEffect, useState } from 'react';
import { t as translate, type Locale } from '../i18n/index';

function readLocale(): Locale {
  if (typeof document === 'undefined') return 'es';
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

export function useT() {
  const [lang, setLang] = useState<Locale>(() => readLocale());

  useEffect(() => {
    setLang(readLocale());
  }, []);

  const t = (key: string, fallback?: string) => {
    try {
      const value = (translate as unknown as (k: string, l?: Locale) => string)(key, lang);
      return value && value !== key ? value : fallback ?? key;
    } catch {
      return fallback ?? key;
    }
  };

  return { t, lang, setLang };
}
