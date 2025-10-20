// Sistema de internacionalización del lado del cliente
class I18nClient {
  constructor() {
    this.currentLang = this.getCurrentLanguage();
    this.translations = {};
    this.isLoaded = false;
    this.loadPromise = null;
  }

  getCurrentLanguage() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'es';
    }
    return 'es';
  }

  setLanguage(lang) {
    if (typeof window !== 'undefined') {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      // Disparar evento personalizado para notificar el cambio
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
      this.updateAllTranslations();
    }
  }

  async loadTranslations() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchTranslations();
    return this.loadPromise;
  }

  async fetchTranslations() {
    try {
      // Usar las traducciones que ya están disponibles globalmente
      if (typeof window !== 'undefined' && window.translations) {
        this.translations = window.translations;
        this.isLoaded = true;
        return this.translations;
      }

      // Fallback: cargar desde archivos JSON si no están disponibles
      const [esResponse, enResponse] = await Promise.all([
        fetch('/i18n/es.json'),
        fetch('/i18n/en.json')
      ]);

      if (!esResponse.ok || !enResponse.ok) {
        throw new Error('Failed to load translations');
      }

      const [esTranslations, enTranslations] = await Promise.all([
        esResponse.json(),
        enResponse.json()
      ]);

      this.translations = {
        es: esTranslations,
        en: enTranslations
      };

      this.isLoaded = true;
      return this.translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback: usar traducciones básicas
      this.translations = {
        es: {},
        en: {}
      };
      this.isLoaded = true;
      return this.translations;
    }
  }

  t(key, lang = null) {
    const targetLang = lang || this.currentLang;
    
    if (!this.isLoaded || !this.translations[targetLang]) {
      return key;
    }

    const keys = key.split('.');
    let value = this.translations[targetLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retornar la clave si no se encuentra la traducción
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  updateAllTranslations() {
    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'tel')) {
        element.placeholder = translation;
      } else if (element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Actualizar elementos con data-i18n-html (para contenido HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = this.t(key);
      element.innerHTML = translation;
    });

    // Actualizar atributos específicos
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrData = element.getAttribute('data-i18n-attr');
      try {
        const attrs = JSON.parse(attrData);
        Object.entries(attrs).forEach(([attr, key]) => {
          const translation = this.t(key);
          element.setAttribute(attr, translation);
        });
      } catch (error) {
        console.error('Error parsing data-i18n-attr:', error);
      }
    });

    // Actualizar aria-label específicos
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      const translation = this.t(key);
      element.setAttribute('aria-label', translation);
    });

    // Actualizar data-tooltip específicos
    document.querySelectorAll('[data-i18n-tooltip]').forEach(element => {
      const key = element.getAttribute('data-i18n-tooltip');
      const translation = this.t(key);
      element.setAttribute('data-tooltip', translation);
    });

    // Actualizar title específicos
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      element.setAttribute('title', translation);
    });

    // Actualizar opciones de select dinámicamente
    this.updateSelectOptions();

    // Actualizar textos específicos del formulario
    this.updateFormTexts();
  }

  updateSelectOptions() {
    const discoverySelect = document.getElementById('discovery');
    if (discoverySelect) {
      const options = discoverySelect.querySelectorAll('option');
      options.forEach(option => {
        const value = option.value;
        if (value === '') {
          option.textContent = this.t('form.fields.select_option');
        } else {
          // Mapear valores a claves de traducción
          const optionMap = {
            'google_search': this.currentLang === 'es' ? 'Google (búsqueda)' : 'Google (search)',
            'google_maps': 'Google Maps',
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            'tiktok': 'TikTok',
            'x_twitter': 'X (Twitter)',
            'youtube': 'YouTube',
            'ads': this.currentLang === 'es' ? 'Anuncio (Google / Facebook / Instagram)' : 'Ad (Google / Facebook / Instagram)',
            'ref_amigo': this.currentLang === 'es' ? 'Referido: amigo o familiar' : 'Referral: friend or family',
            'ref_abogado': this.currentLang === 'es' ? 'Referido: abogado' : 'Referral: lawyer',
            'ref_medico': this.currentLang === 'es' ? 'Referido: médico / clínica' : 'Referral: doctor / clinic',
            'letrero': this.currentLang === 'es' ? 'Vine por el letrero / pasé por la clínica' : 'Saw the sign / passed by the clinic',
            'evento': this.currentLang === 'es' ? 'Evento / comunidad' : 'Event / community',
            'radio_tv': this.currentLang === 'es' ? 'Radio / TV' : 'Radio / TV',
            'otro': this.currentLang === 'es' ? 'Otro' : 'Other'
          };
          
          if (optionMap[value]) {
            option.textContent = optionMap[value];
          }
        }
      });
    }
  }

  updateFormTexts() {
    // Actualizar textos específicos del botón de envío
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const loadingText = document.getElementById('loading-text');
    
    if (submitText) {
      submitText.textContent = this.t('form.submit_button');
    }
    
    if (loadingText) {
      loadingText.textContent = this.t('form.sending');
    }

    // Actualizar placeholder del input de referencia
    const referralInput = document.getElementById('referral_name');
    if (referralInput) {
      referralInput.placeholder = this.t('form.fields.referral_placeholder');
    }
  }

  toggleLanguage(forceNoRedirect = false) {
    const newLang = this.currentLang === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
    
    // Solo actualizar la URL si no se fuerza el no-redirect
    if (typeof window !== 'undefined' && !forceNoRedirect) {
      const currentPath = window.location.pathname;
      let newPath;
      
      if (newLang === 'en') {
        // Cambiar a inglés
        if (currentPath === '/' || currentPath === '/index.html') {
          newPath = '/en/';
        } else if (!currentPath.startsWith('/en/')) {
          newPath = '/en' + currentPath;
        } else {
          newPath = currentPath;
        }
      } else {
        // Cambiar a español
        if (currentPath.startsWith('/en/')) {
          newPath = currentPath.replace('/en', '') || '/';
        } else {
          newPath = currentPath;
        }
      }
      
      if (newPath !== currentPath) {
        window.location.href = newPath;
      }
    }
  }

  init() {
    // Cargar traducciones al inicializar
    this.loadTranslations().then(() => {
      this.updateAllTranslations();
    });

    // Escuchar cambios de idioma
    if (typeof window !== 'undefined') {
      window.addEventListener('languageChange', (event) => {
        this.currentLang = event.detail;
        this.updateAllTranslations();
      });
    }
  }
}

// Crear instancia global
const i18nClient = new I18nClient();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.i18nClient = i18nClient;
}

export default i18nClient;