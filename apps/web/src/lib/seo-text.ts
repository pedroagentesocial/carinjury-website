/* Longitud de <title> y meta descripción.

   Google corta los títulos en ~60 caracteres y las descripciones en ~160. Los
   artículos del blog llevan titulares largos (que siguen igual en el H1 y en
   og:title); aquí solo se ajusta lo que va al <title> y a la meta descripción,
   sin inventar texto: se quita la marca si no cabe, se usa la parte antes de
   los dos puntos, o se corta la descripción en el último punto o palabra. */

const SEPARADORES = [' | ', ' — ', ' · ', ' - '];

export function tituloSeo(titulo: string, marca: string): string {
  if (titulo.length <= 60) return titulo;
  // Separar "Titular | Marca" (si la marca va al final).
  let base = titulo;
  let sep = ' | ';
  for (const s of SEPARADORES) {
    if (titulo.endsWith(s + marca)) {
      base = titulo.slice(0, -(s + marca).length);
      sep = s;
      break;
    }
  }
  const conMarca = base !== titulo;
  if (base.length <= 65) return base;
  const m = base.match(/^(.{10,}?)(:\s|\s—\s|\?\s)/);
  // Solo si lo de antes de los dos puntos tiene al menos dos palabras: con una sola
  // ("Osteoporosis") el título en inglés y en español quedaban idénticos.
  if (m && m[1] && m[2] && m[1].trim().includes(' ')) {
    const cabeza = m[1].trim() + (m[2].startsWith('?') ? '?' : '');
    if (conMarca && (cabeza + sep + marca).length <= 60) return cabeza + sep + marca;
    if (cabeza.length <= 65) return cabeza;
  }
  return base;
}

export function descripcionSeo(texto: string, max = 160): string {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  // Última frase completa que quepa (si deja al menos 70 caracteres).
  const corte = t.slice(0, max + 1);
  const fin = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('? '), corte.lastIndexOf('! '));
  if (fin >= 70) return t.slice(0, fin + 1);
  // Si no, en la última palabra, con puntos suspensivos.
  const palabra = t.slice(0, max - 1).lastIndexOf(' ');
  return t.slice(0, palabra > 0 ? palabra : max - 1).replace(/[,;:—–-]+$/, '') + '…';
}
