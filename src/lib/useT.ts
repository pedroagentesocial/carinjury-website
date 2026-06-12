// Puente entre el sistema i18n del sitio (window.i18nClient, utils/i18n-client.js)
// y los componentes React del sorteo. Misma API que el useT de senor-casas
// ({ t, lang, setLang }) para poder portar los componentes casi sin cambios.
//
// t(key, fallback): si la clave no existe en las traducciones, devuelve el
// fallback (español embebido en los componentes). Así el sorteo renderiza en
// español aunque todavía no estén cargadas las claves del namespace 'sorteo'.

import { useEffect, useState, useCallback } from 'react';

type Lang = 'es' | 'en';

function readLang(): Lang {
  if (typeof window === 'undefined') return 'es';
  const w = window as unknown as { i18nClient?: { currentLang?: string } };
  return (w.i18nClient?.currentLang || localStorage.getItem('language') || 'es') as Lang;
}

export function useT() {
  const [lang, setLangState] = useState<Lang>(() => readLang());
  // Se incrementa en cada cambio de idioma para forzar re-render aunque el
  // valor de `lang` no cambie (p.ej. diccionario que carga tarde).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const next = (typeof detail === 'string' ? detail : detail?.language) as Lang | undefined;
      if (next) setLangState(next);
      setVersion((v) => v + 1);
    };
    // carinjury2 dispara 'languageChange' (detail = string del idioma).
    window.addEventListener('languageChange', handler as EventListener);
    return () => window.removeEventListener('languageChange', handler as EventListener);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const w = window as unknown as { i18nClient?: { t: (k: string, l?: string) => string } };
      const client = typeof window !== 'undefined' ? w.i18nClient : null;
      if (!client) return fallback ?? key;
      const value = client.t(key, lang);
      return value === key && fallback !== undefined ? fallback : value;
    },
    [lang, version],
  );

  const setLang = useCallback((next: Lang) => {
    const w = window as unknown as { i18nClient?: { setLanguage: (l: string) => void } };
    w.i18nClient?.setLanguage(next);
  }, []);

  return { t, lang, setLang };
}
