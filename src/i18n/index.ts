import esTranslations from './es.json';
import enTranslations from './en.json';

export type Language = 'es' | 'en';

export const translations = {
  es: esTranslations,
  en: enTranslations,
};

export const defaultLanguage: Language = 'es';

// Función para obtener el idioma actual del localStorage o usar el predeterminado
export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as Language;
    return stored && (stored === 'es' || stored === 'en') ? stored : defaultLanguage;
  }
  return defaultLanguage;
}

// Función específica para el servidor que siempre retorna el idioma predeterminado
export function getServerLanguage(): Language {
  return defaultLanguage;
}

// Función para cambiar el idioma y guardarlo en localStorage
export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    // Disparar evento personalizado para notificar el cambio de idioma
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }
}

// Función para obtener una traducción específica
export function t(key: string, lang?: Language): string {
  const currentLang = lang || defaultLanguage;
  const keys = key.split('.');
  let value: any = translations[currentLang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback al idioma predeterminado si no se encuentra la clave
      value = translations[defaultLanguage];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Retornar la clave si no se encuentra traducción
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Función para generar HTML con soporte para cambio dinámico de idioma
export function tDynamic(key: string, lang?: Language): string {
  const currentLang = lang || defaultLanguage;
  const esText = t(key, 'es');
  const enText = t(key, 'en');
  
  return `<span data-i18n="${key}" data-es="${esText}" data-en="${enText}">${currentLang === 'es' ? esText : enText}</span>`;
}

// Función para obtener todas las traducciones de un idioma
export function getTranslations(lang?: Language) {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang];
}