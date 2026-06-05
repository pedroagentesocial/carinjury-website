/**
 * Ventana de la promo Cambiatón (modal del home + slide del hero).
 *
 * Se muestra hasta el sábado 6 de junio de 2026 inclusive y desaparece
 * sola a partir del domingo 7.
 *
 * Cutoff: domingo 2026-06-07 a las 00:00 hora de Utah (America/Denver,
 * UTC-6 en junio) = 06:00 UTC. Para reutilizar con otra promo, basta
 * cambiar esta fecha y la imagen en public/banners/.
 */
export const PROMO_ENDS_UTC = Date.UTC(2026, 5, 7, 6, 0, 0);

export function isPromoActive(): boolean {
  return Date.now() < PROMO_ENDS_UTC;
}
