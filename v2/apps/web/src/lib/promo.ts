/**
 * Ventana de la promo Cambiatón (modal del home + slide del hero).
 *
 * Se muestra durante todo el Mundial 2026 y desaparece para siempre al
 * terminar el último día del torneo: la final es el domingo 19 de julio
 * de 2026 (MetLife Stadium), así que el banner vive hasta ese día
 * inclusive.
 *
 * Cutoff: lunes 2026-07-20 a las 00:00 hora de Utah (America/Denver,
 * UTC-6 en julio) = 06:00 UTC. Para reutilizar con otra promo, basta
 * cambiar esta fecha y la imagen en public/banners/.
 */
export const PROMO_ENDS_UTC = Date.UTC(2026, 6, 20, 6, 0, 0);

export function isPromoActive(): boolean {
  // OCULTO temporalmente — promo/sorteo desactivado (apaga slide del hero, PromoAd y PromoBanner).
  // Revertir: descomentar la línea original y borrar `return false;`.
  return false;
  // return Date.now() < PROMO_ENDS_UTC;
}
