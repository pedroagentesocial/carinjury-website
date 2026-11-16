/* Rutas que solo existen en español (el sorteo). Sin versión en inglés, el
   botón de idioma y el hreflang apuntaban a /en/sorteo, que da 404. */
export const RUTAS_SOLO_ES = /^\/sorteo(\/|$)/;

export function soloEnEspanol(pathname: string): boolean {
  return RUTAS_SOLO_ES.test(pathname);
}
