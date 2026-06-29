import type { TranslationKey } from '@i18n/index';

/**
 * Estadísticas de la sección de resultados (home) — edita aquí las cifras.
 *
 *  - `value` numérico  → activa el contador animado. El valor inicial renderizado
 *    es el número FINAL (fallback SSR/HTML): si el JS falla, nunca queda en 0.
 *  - `placeholder`     → texto MARCADO visible para que confirmes el dato real.
 *    No se anima ni se inventa.
 *
 * Cuando confirmes una cifra, reemplaza `placeholder` por `value` (+ prefix/
 * suffix) y borra el placeholder. Ejemplos en los comentarios.
 */
export interface StatItem {
  /** Cifra confirmada → contador animado (count-up). */
  value?: number;
  prefix?: string;
  suffix?: string;
  /** Placeholder marcado si la cifra NO está confirmada. */
  placeholder?: string;
  /** Clave i18n del label (es/en). */
  labelKey: TranslationKey;
}

export const HOME_STATS: StatItem[] = [
  // Confirmado se vería así → { value: 5000, suffix: '+', labelKey: 'stats.cases.label' }
  { value: 5000, suffix: '+', labelKey: 'stats.cases.label' },
  // Confirmado → { value: 25, prefix: '$', suffix: 'M', labelKey: 'stats.compensation.label' }
  { value: 25, prefix: '$', suffix: 'M', labelKey: 'stats.compensation.label' },
  // Confirmado → { value: 30, suffix: '+', labelKey: 'stats.experience.label' }
  { value: 10, suffix: '+', labelKey: 'stats.experience.label' },
];
