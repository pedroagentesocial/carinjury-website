// Fuente única de las fechas y el premio del sorteo (Car Injury Clinic — Mundial 2026).
// Editar SOLO aquí — lo consumen las páginas y componentes del sorteo.
// ⚠️ VALORES PLACEHOLDER: confirmar premio/fechas/elegibilidad con Pedro y ajustar.

export const SORTEO_FECHAS = {
  inicio: '12 de junio de 2026',
  // El registro cierra el día de la rifa.
  fin: '19 de julio de 2026', // ⚠️ PLACEHOLDER — ¿atar a la final del Mundial?
  ganadores: '19 de julio de 2026',
} as const;

// Cierre del registro: fin del día en hora de Utah (Mountain Daylight Time =
// UTC−06:00 en verano). Después de esta fecha el registro y las acciones bonus
// quedan cerrados y se hace la rifa.
export const SORTEO_CIERRE_ISO = '2026-07-19T23:59:59-06:00'; // ⚠️ PLACEHOLDER

/** True si el sorteo ya cerró (registro/acciones no se aceptan). */
export function sorteoCerrado(now: number = Date.now()): boolean {
  return now > new Date(SORTEO_CIERRE_ISO).getTime();
}

// El sorteo es válido únicamente para residentes del estado de Utah.
export const SORTEO_ESTADO = 'Utah';

export const SORTEO_PREMIO = {
  // Número de ganadores / premios. ⚠️ PLACEHOLDER — confirmar con Pedro.
  cantidad: 3,
  // Desglose listo para mostrar.
  etiqueta: 'álbum del Mundial + estampas', // ⚠️ PLACEHOLDER
  etiquetaEn: 'World Cup album + stickers', // ⚠️ PLACEHOLDER
  // Sustantivo genérico para el "N ___" del hero/popup.
  sustantivo: 'premios',
  sustantivoEn: 'prizes',
} as const;

// El ganador tiene N días para reclamar.
export const SORTEO_DIAS_RECLAMO = 30;

// Valor en boletos de cada acción bonus. La reseña de Google vale por 2.
export const SORTEO_TICKET_VALUES = {
  instagram: 1,
  facebook: 1,
  referido: 1,
  google: 2,
} as const;

// Tope de boletos por participante:
// 1 base + IG (1) + FB (1) + referido (1) + reseña Google (2) = 6.
export const SORTEO_MAX_BOLETOS = 6;
