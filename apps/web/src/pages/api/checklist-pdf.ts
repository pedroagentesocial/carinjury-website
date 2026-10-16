import type { APIRoute } from 'astro';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from '@lib/site';
import { CHECKLIST_SECTIONS, CHECKLIST_LEGAL_NOTE } from '@lib/tools/accident-checklist';

/**
 * PDF descargable del checklist, generado en el servidor (server-only).
 * `?lang=es|en`. Deriva del mismo `CHECKLIST_SECTIONS` que la herramienta y el
 * JSON-LD HowTo, así nunca se desincronizan.
 */
export const prerender = false;

const PURPLE = rgb(0.478, 0.18, 0.529); // --c-purple #7A2E87
const DEEP = rgb(0.38, 0.118, 0.424); // --c-deep #611E6C
const INK = rgb(0.102, 0.114, 0.165); // --ink #1A1D2A
const MUTED = rgb(0.42, 0.435, 0.52);
const LINE = rgb(0.886, 0.906, 0.929);

const MARGIN = 56;
const PAGE_W = 612;
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** WinAnsi-safe: normaliza comillas/guiones tipográficos a ASCII para el PDF. */
function ascii(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/·/g, '-');
}

/** Parte un texto en líneas que caben en `maxWidth`. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = ascii(text).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export const GET: APIRoute = async ({ url }) => {
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'es';
  const t = (es: string, en: string) => (lang === 'en' ? en : es);

  const doc = await PDFDocument.create();
  doc.setTitle(t('Qué hacer después de un accidente de auto', 'What to do after a car accident'));
  doc.setAuthor(SITE.name);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN + 60) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  /* ===== Header band ===== */
  const headerH = 96;
  page.drawRectangle({ x: 0, y: PAGE_H - headerH, width: PAGE_W, height: headerH, color: DEEP });
  page.drawText(ascii(SITE.name.toUpperCase()), {
    x: MARGIN, y: PAGE_H - 34, size: 9, font: bold, color: rgb(1, 1, 1),
  });
  const title = t('Qué hacer después de un accidente de auto', 'What to do after a car accident');
  page.drawText(ascii(title), { x: MARGIN, y: PAGE_H - 62, size: 19, font: bold, color: rgb(1, 1, 1) });
  page.drawText(
    ascii(t('Guía paso a paso · Salt Lake City, UT', 'Step-by-step guide · Salt Lake City, UT')),
    { x: MARGIN, y: PAGE_H - 82, size: 10, font, color: rgb(0.85, 0.82, 0.9) },
  );
  y = PAGE_H - headerH - 28;

  /* ===== Secciones e ítems ===== */
  let stepNo = 0;
  for (const section of CHECKLIST_SECTIONS) {
    ensureSpace(40);
    page.drawText(ascii(section[lang].title), { x: MARGIN, y, size: 13, font: bold, color: PURPLE });
    y -= 8;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
    y -= 22;

    for (const item of section.items) {
      stepNo += 1;
      const it = item[lang];
      const titleLines = wrap(`${stepNo}. ${it.title}`, bold, 11.5, CONTENT_W - 26);
      const detailLines = wrap(it.detail, font, 10, CONTENT_W - 26);
      const blockH = 18 + titleLines.length * 15 + detailLines.length * 13 + 12;
      ensureSpace(blockH);

      // checkbox
      page.drawRectangle({
        x: MARGIN, y: y - 12, width: 13, height: 13,
        borderColor: PURPLE, borderWidth: 1.4, color: rgb(1, 1, 1),
      });

      let ty = y;
      for (const ln of titleLines) {
        page.drawText(ln, { x: MARGIN + 26, y: ty, size: 11.5, font: bold, color: INK });
        ty -= 15;
      }
      for (const ln of detailLines) {
        page.drawText(ln, { x: MARGIN + 26, y: ty, size: 10, font, color: MUTED });
        ty -= 13;
      }
      y = ty - 12;
    }
    y -= 8;
  }

  /* ===== Nota legal (placeholder) ===== */
  const note = CHECKLIST_LEGAL_NOTE[lang];
  const noteLines = wrap(note, font, 9, CONTENT_W - 24);
  const noteH = 18 + noteLines.length * 12;
  ensureSpace(noteH);
  page.drawRectangle({
    x: MARGIN, y: y - noteH + 6, width: CONTENT_W, height: noteH,
    color: rgb(0.969, 0.949, 0.98), borderColor: LINE, borderWidth: 1,
  });
  let ny = y - 6;
  for (const ln of noteLines) {
    page.drawText(ln, { x: MARGIN + 12, y: ny, size: 9, font, color: INK });
    ny -= 12;
  }
  y = y - noteH - 6;

  /* ===== Footer en cada página ===== */
  const footer = `${SITE.name} · ${SITE.phone.displayLong} · ${SITE.address.full} · ${SITE.url.replace('https://', '')}`;
  for (const p of doc.getPages()) {
    p.drawLine({
      start: { x: MARGIN, y: MARGIN - 14 }, end: { x: PAGE_W - MARGIN, y: MARGIN - 14 },
      thickness: 1, color: LINE,
    });
    p.drawText(ascii(footer), { x: MARGIN, y: MARGIN - 28, size: 8, font, color: MUTED });
  }

  const bytes = await doc.save();
  // Copia a un ArrayBuffer explícito: evita el mismatch de Uint8Array<ArrayBufferLike>
  // (que TS 5.7 no acepta como BodyInit por el caso SharedArrayBuffer).
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);
  const filename = t('que-hacer-despues-de-un-accidente.pdf', 'what-to-do-after-a-car-accident.pdf');
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
