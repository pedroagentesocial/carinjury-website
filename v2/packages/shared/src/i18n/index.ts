export type Locale = 'es' | 'en';

export const LOCALES = ['es', 'en'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en';
}

/**
 * Util de tipos: convierte un objeto de traducciones anidado en una unión
 * de strings tipo "section.subsection.key". El front lo usa para tipar `t()`.
 */
export type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? P extends ''
      ? K
      : `${P}.${K}`
    : T[K] extends Record<string, unknown>
      ? Paths<T[K], P extends '' ? K : `${P}.${K}`>
      : never;
}[keyof T & string];
