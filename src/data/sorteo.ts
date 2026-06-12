// Fuente única de las fechas y el premio del sorteo (Car Injury Clinic — Mundial 2026).
// Editar SOLO aquí — lo consumen las páginas y componentes del sorteo.
// ⚠️ VALORES PLACEHOLDER: confirmar premio/fechas/elegibilidad con Pedro y ajustar.

// ⚠️ FECHAS POR ANUNCIAR (Pedro aún no las define). Mientras tanto el formulario
// queda ABIERTO (SORTEO_CIERRE_ISO en el futuro lejano). Cuando se definan,
// ajustar estas 3 etiquetas + SORTEO_CIERRE_ISO + FECHAS_DEFINIDAS=true.
export const SORTEO_FECHAS = {
  inicio: 'por anunciar',
  fin: 'por anunciar',
  ganadores: 'por anunciar',
} as const;

/** False mientras las fechas no estén definidas (la UI muestra "por anunciar"). */
export const SORTEO_FECHAS_DEFINIDAS = false;

// Cierre del registro (fin del día, hora de Utah / MDT = UTC−06:00). Placeholder
// lejano para mantener el registro abierto hasta definir la fecha real.
export const SORTEO_CIERRE_ISO = '2026-12-31T23:59:59-07:00'; // ⚠️ PLACEHOLDER

/** True si el sorteo ya cerró (registro/acciones no se aceptan). */
export function sorteoCerrado(now: number = Date.now()): boolean {
  return now > new Date(SORTEO_CIERRE_ISO).getTime();
}

// El sorteo es válido únicamente para residentes del estado de Utah.
export const SORTEO_ESTADO = 'Utah';

export const SORTEO_PREMIO = {
  // 3 ganadores distintos; cada uno gana UN álbum del Mundial (premios idénticos).
  cantidad: 3,
  // Texto listo para mostrar (ej. "3 álbumes del Mundial").
  etiqueta: '3 álbumes del Mundial 2026',
  etiquetaEn: '3 World Cup 2026 albums',
  // Sustantivo para el "3 ___" del hero/popup ("3 álbumes").
  sustantivo: 'álbumes del Mundial',
  sustantivoEn: 'World Cup albums',
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
