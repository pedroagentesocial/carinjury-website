// Sistema de internacionalización dinámico para el cliente
class I18nDynamic {
  constructor() {
    this.currentLang = 'es';
    this.translations = {};
    this.init();
  }

  async init() {
    // Obtener idioma del localStorage
    this.currentLang = localStorage.getItem('language') || 'es';
    
    // Cargar traducciones
    await this.loadTranslations();
    
    // Aplicar traducciones iniciales
    this.applyTranslations();
    
    // Escuchar cambios de idioma
    window.addEventListener('languageChange', (e) => {
      this.currentLang = e.detail;
      this.applyTranslations();
    });
  }

  async loadTranslations() {
    try {
      // Usar rutas absolutas para las traducciones
      const [esResponse, enResponse] = await Promise.all([
        fetch('/i18n/es.json'),
        fetch('/i18n/en.json')
      ]);
      
      this.translations = {
        es: await esResponse.json(),
        en: await enResponse.json()
      };
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback: usar traducciones embebidas si están disponibles
      if (window.translations) {
        this.translations = window.translations;
      }
    }
  }

  t(key, lang = null) {
    const currentLang = lang || this.currentLang;
    const keys = key.split('.');
    let value = this.translations[currentLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback al idioma predeterminado
        value = this.translations['es'];
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

  applyTranslations() {
    // Actualizar todos los elementos con data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Actualizar elementos con data-es y data-en
    const dynamicElements = document.querySelectorAll('[data-es][data-en]');
    dynamicElements.forEach(element => {
      const esText = element.getAttribute('data-es');
      const enText = element.getAttribute('data-en');
      element.textContent = this.currentLang === 'es' ? esText : enText;
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.applyTranslations();
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
  }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.i18nDynamic = new I18nDynamic();
  });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.I18nDynamic = I18nDynamic;
}