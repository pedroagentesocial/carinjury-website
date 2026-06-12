/**
 * Web App de Apps Script para replicar el sorteo en Google Sheets.
 *
 * Cómo usar:
 *  1. Abre tu Google Sheet → menú Extensiones → Apps Script.
 *  2. Borra el contenido y pega TODO este archivo. Guarda (💾).
 *  3. El SECRET ya está puesto (coincide con SHEETS_WEBAPP_SECRET del .env).
 *  4. Implementar → Administrar implementaciones → editar (lápiz) →
 *     Versión: "Nueva versión" → Implementar.  (Necesario para que el cambio
 *     de columnas/resena_google quede activo en la URL /exec.)
 *  5. Vuelve al Sheet y recárgalo: aparece el menú "⚽ Sorteo Mundial".
 *     - "✨ Aplicar formato bonito"  → colores, encabezados, filas alternas.
 *     - "🧹 Limpiar filas de prueba" → borra registros de test/prueba/E2E.
 *     - "🏆 Ordenar por boletos"     → ordena de más a menos boletos.
 *
 * La primera vez que uses el menú, Google te pedirá autorizar el script.
 */

const SECRET = 'a1a7c0737993d6247dad9ed9051c694d3a416a787e2b7e57';
const TAB = 'Registros';

// Claves que envía el servidor (orden = orden de columnas A, B, C…).
// resena_google va al final para no mover columnas ya existentes.
const KEYS = [
  'fecha', 'nombre', 'telefono', 'email', 'ig_handle', 'fb_handle',
  'sigue_ig', 'sigue_fb', 'referido_por', 'num_referidos',
  'total_tickets', 'verificado_ganador', 'resena_google', 'finalizado',
];

// Etiquetas bonitas que se muestran en la fila 1 (paralelas a KEYS).
const LABELS = [
  'Fecha', 'Nombre', 'Teléfono', 'Email', 'IG @', 'FB @',
  'Sigue IG', 'Sigue FB', 'Referido por', '# Referidos',
  'Boletos', 'Ganador ✓', 'Reseña Google', 'Finalizado',
];

// --- Paleta tema Mundial (verde cancha + dorado trofeo ⚽) ---
const C = {
  headerBg: '#0E5C36', headerFg: '#FFD54A',   // verde cancha + dorado
  zebra: '#F1F7F2',                            // verde muy claro
  siBg: '#DCF1E1', siFg: '#1B6B3A',            // "Sí" → verde
  noBg: '#F2F1EE', noFg: '#9AA0A6',            // "No" → gris suave
  winnerBg: '#FFE08A', winnerFg: '#7A5A12',    // ganador → dorado fuerte
  ticketMin: '#FFFFFF', ticketMax: '#FFD54A',  // boletos: blanco → dorado
  border: '#DCE6DD',
  labelFg: '#2A4A35',                          // etiquetas (verde oscuro)
  mutedFg: '#8A938C',                          // texto tenue
  sectionBg: '#E8F3EB',                        // encabezado de sección (verde crema)
};

const WIDTHS = [150, 175, 130, 230, 120, 120, 90, 90, 165, 100, 90, 110, 120, 110];

function colOf_(key) {
  return KEYS.indexOf(key) + 1; // 1-based
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB);
  if (!sh) sh = ss.insertSheet(TAB);
  // Asegurar encabezados (etiquetas bonitas) en la fila 1.
  const first = sh.getRange(1, 1, 1, LABELS.length).getValues()[0];
  if (first.join('') === '') {
    sh.getRange(1, 1, 1, LABELS.length).setValues([LABELS]);
  }
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Web App (lo llama el servidor del sitio)
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json_({ ok: false, error: 'unauthorized' });

    const sh = getSheet_();

    if (body.op === 'append') {
      const r = body.row || {};
      sh.appendRow(KEYS.map(function (k) {
        return (r[k] !== undefined && r[k] !== null) ? r[k] : '';
      }));
      return json_({ ok: true });
    }

    if (body.op === 'update') {
      if (sh.getLastRow() < 2) return json_({ ok: false, error: 'not_found' });
      const email = String(body.email || '').trim().toLowerCase();
      const f = body.fields || {};
      const emailCol = colOf_('email');
      const col = sh.getRange(2, emailCol, sh.getLastRow() - 1, 1).getValues();
      let rowNum = -1;
      for (let i = 0; i < col.length; i++) {
        if (String(col[i][0] || '').trim().toLowerCase() === email) { rowNum = i + 2; break; }
      }
      if (rowNum === -1) return json_({ ok: false, error: 'not_found' });

      // Escribe cualquier campo conocido por nombre (robusto al orden de columnas).
      ['sigue_ig', 'sigue_fb', 'resena_google', 'finalizado', 'num_referidos', 'total_tickets',
       'ig_handle', 'fb_handle', 'verificado_ganador'].forEach(function (k) {
        const v = f[k];
        const skip = (k === 'ig_handle' || k === 'fb_handle') ? !v : (v === undefined);
        if (!skip) sh.getRange(rowNum, colOf_(k)).setValue(v);
      });
      return json_({ ok: true });
    }

    return json_({ ok: false, error: 'bad_op' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// ============================================================
// Menú dentro del Sheet
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚽ Sorteo Mundial')
    .addItem('✨ Aplicar formato bonito', 'formatSheet')
    .addItem('📊 Actualizar resumen', 'buildSummary')
    .addItem('🏆 Ordenar por boletos', 'sortByTickets')
    .addSeparator()
    .addItem('⏰ Auto-actualizar el resumen (cada hora)', 'installHourlyTrigger')
    .addItem('⏸️ Desactivar auto-actualización', 'removeAutoUpdate')
    .addSeparator()
    .addItem('🧹 Limpiar filas de prueba', 'cleanTestRows')
    .addItem('🗑️ Vaciar todos los registros', 'clearAllRecords')
    .addToUi();
}

// ============================================================
// ✨ Formato bonito
// ============================================================
function formatSheet() {
  const sh = getSheet_();
  const nCols = KEYS.length;
  const maxRows = sh.getMaxRows();

  // 0. Quitar columnas/filas sobrantes para que no haya "ruido" gris a la derecha.
  if (sh.getMaxColumns() > nCols) {
    sh.deleteColumns(nCols + 1, sh.getMaxColumns() - nCols);
  }

  // 1. Encabezados bonitos + estilo.
  const header = sh.getRange(1, 1, 1, nCols);
  header.setValues([LABELS]);
  header
    .setBackground(C.headerBg)
    .setFontColor(C.headerFg)
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  header.setBorder(false, false, true, false, false, false, C.headerBg, SpreadsheetApp.BorderStyle.SOLID_THICK);
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2); // fecha + nombre siempre visibles al hacer scroll →

  // 2. Anchos de columna.
  WIDTHS.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  // 3. Cuerpo: fuente y alineación (la separación visual la da el zebra,
  //    así que sin cuadrícula manual → las filas nuevas se ven igual).
  sh.getRange(2, 1, maxRows - 1, nCols).setFontSize(10).setVerticalAlignment('middle');

  // Centrar columnas de Sí/No, números y ganador.
  ['sigue_ig', 'sigue_fb', 'resena_google', 'finalizado', 'num_referidos', 'total_tickets', 'verificado_ganador']
    .forEach(function (k) {
      sh.getRange(2, colOf_(k), maxRows - 1, 1).setHorizontalAlignment('center');
    });
  // Números enteros.
  sh.getRange(2, colOf_('num_referidos'), maxRows - 1, 1).setNumberFormat('0');
  sh.getRange(2, colOf_('total_tickets'), maxRows - 1, 1).setNumberFormat('0');

  // 4. Formato condicional (colores que se auto-extienden a filas nuevas).
  const numRows = maxRows - 1;
  const rangeYesNo = [
    sh.getRange(2, colOf_('sigue_ig'), numRows, 1),
    sh.getRange(2, colOf_('sigue_fb'), numRows, 1),
    sh.getRange(2, colOf_('resena_google'), numRows, 1),
    sh.getRange(2, colOf_('finalizado'), numRows, 1),
  ];
  const rangeWinner = sh.getRange(2, colOf_('verificado_ganador'), numRows, 1);
  const rangeTickets = sh.getRange(2, colOf_('total_tickets'), numRows, 1);
  const rangeAll = sh.getRange(2, 1, numRows, nCols);

  const rules = [];

  // Ganador (cualquier valor en la columna) → dorado fuerte.
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenCellNotEmpty()
    .setBackground(C.winnerBg).setFontColor(C.winnerFg).setBold(true)
    .setRanges([rangeWinner]).build());

  // "Sí" → verde.
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Sí')
    .setBackground(C.siBg).setFontColor(C.siFg).setBold(true)
    .setRanges(rangeYesNo).build());

  // "No" → gris suave.
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('No')
    .setBackground(C.noBg).setFontColor(C.noFg)
    .setRanges(rangeYesNo).build());

  // Boletos → escala dorada (1 claro … 6 dorado).
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setGradientMinpointWithValue(C.ticketMin, SpreadsheetApp.InterpolationType.NUMBER, '1')
    .setGradientMaxpointWithValue(C.ticketMax, SpreadsheetApp.InterpolationType.NUMBER, '6')
    .setRanges([rangeTickets]).build());

  // Filas alternas (zebra) — última prioridad para no tapar los colores de arriba.
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISEVEN(ROW())')
    .setBackground(C.zebra)
    .setRanges([rangeAll]).build());

  sh.setConditionalFormatRules(rules);

  // 5. Filtro en el encabezado.
  const existing = sh.getFilter();
  if (existing) existing.remove();
  sh.getRange(1, 1, maxRows, nCols).createFilter();

  // 6. Refrescar el dashboard.
  buildSummary();

  SpreadsheetApp.getActive().toast('Formato + resumen aplicados ✨', '⚽ Sorteo Mundial', 4);
}

// ============================================================
// 🏆 Ordenar por boletos (de más a menos)
// ============================================================
function sortByTickets() {
  const sh = getSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 3) return;
  sh.getRange(2, 1, lastRow - 1, KEYS.length).sort({ column: colOf_('total_tickets'), ascending: false });
  SpreadsheetApp.getActive().toast('Ordenado por boletos 🏆', '⚽ Sorteo Mundial', 4);
}

// ============================================================
// 🧹 Limpiar filas de prueba (test / prueba / e2e)
// ============================================================
function cleanTestRows() {
  const sh = getSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const ui = SpreadsheetApp.getUi();
  const nombreC = colOf_('nombre');
  const emailC = colOf_('email');
  const vals = sh.getRange(2, 1, lastRow - 1, KEYS.length).getValues();
  const re = /(test|prueba|e2e)/i;

  // Filas candidatas (de abajo hacia arriba para no descuadrar índices).
  const targets = [];
  for (let i = vals.length - 1; i >= 0; i--) {
    const nombre = String(vals[i][nombreC - 1] || '');
    const email = String(vals[i][emailC - 1] || '');
    if (re.test(nombre) || re.test(email)) targets.push(i + 2);
  }

  if (targets.length === 0) {
    ui.alert('🧹 Sin filas de prueba', 'No se encontraron filas con "test", "prueba" o "e2e".', ui.ButtonSet.OK);
    return;
  }

  const resp = ui.alert(
    '🧹 Confirmar limpieza',
    'Se eliminarán ' + targets.length + ' fila(s) de prueba. Esta acción no se puede deshacer. ¿Continuar?',
    ui.ButtonSet.YES_NO,
  );
  if (resp !== ui.Button.YES) return;

  targets.forEach(function (rowNum) { sh.deleteRow(rowNum); });
  buildSummary(); // el resumen quedó desactualizado tras borrar.
  ui.alert('🧹 Limpieza lista', targets.length + ' fila(s) de prueba eliminada(s).', ui.ButtonSet.OK);
}

// ============================================================
// 🗑️ Vaciar TODOS los registros (deja solo el encabezado)
// ============================================================
function clearAllRecords() {
  const sh = getSheet_();
  const ui = SpreadsheetApp.getUi();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    ui.alert('🗑️ Sin registros', 'La hoja "Registros" ya está vacía.', ui.ButtonSet.OK);
    buildSummary();
    return;
  }
  const n = lastRow - 1;
  const resp = ui.alert(
    '🗑️ Vaciar todos los registros',
    'Se eliminarán las ' + n + ' fila(s) de "Registros" (solo en esta hoja; NO toca Supabase). ' +
    'No se puede deshacer. ¿Continuar?',
    ui.ButtonSet.YES_NO,
  );
  if (resp !== ui.Button.YES) return;

  sh.deleteRows(2, n);
  buildSummary(); // resumen a cero.
  ui.alert('🗑️ Listo', n + ' fila(s) eliminada(s). El resumen quedó en cero.', ui.ButtonSet.OK);
}

// ============================================================
// 📊 Resumen / dashboard (pestaña "Resumen")
// ============================================================

// Lee todas las filas de Registros como objetos {clave: valor}. Una sola lectura.
function readRows_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const vals = sh.getRange(2, 1, lastRow - 1, KEYS.length).getValues();
  return vals.map(function (r) {
    const o = {};
    KEYS.forEach(function (k, i) { o[k] = r[i]; });
    return o;
  });
}

function buildSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rows = readRows_(getSheet_());

  // --- Métricas (en memoria, una pasada) ---
  const isYes = function (v) {
    const s = String(v).trim().toLowerCase();
    return s === 'sí' || s === 'si';
  };
  const total = rows.length;
  let ig = 0, fb = 0, gg = 0, refs = 0, ganadores = 0, fin = 0, boletosTotal = 0;
  const dist = [0, 0, 0, 0, 0, 0, 0]; // índice = boletos (0..6)
  rows.forEach(function (r) {
    if (isYes(r.sigue_ig)) ig++;
    if (isYes(r.sigue_fb)) fb++;
    if (isYes(r.resena_google)) gg++;
    if (isYes(r.finalizado)) fin++;
    if (String(r.referido_por || '').trim() !== '') refs++;
    if (String(r.verificado_ganador || '').trim() !== '') ganadores++;
    let t = Number(r.total_tickets) || 0;
    if (t < 0) t = 0; if (t > 6) t = 6;
    dist[t]++;
    boletosTotal += Number(r.total_tickets) || 0;
  });
  const prom = total ? boletosTotal / total : 0;
  const frac = function (n) { return total ? n / total : 0; };
  const distMax = Math.max(1, dist[1], dist[2], dist[3], dist[4], dist[5], dist[6]);

  // --- Hoja Resumen (crear/limpiar, dejar primera) ---
  let sh = ss.getSheetByName('Resumen');
  if (!sh) sh = ss.insertSheet('Resumen', 0);
  sh.clear();
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); // deshacer merges previos
  sh.setConditionalFormatRules([]);
  sh.getCharts().forEach(function (c) { sh.removeChart(c); });
  sh.setHiddenGridlines(true);
  // Dejar el resumen como primera pestaña. En triggers automáticos no hay UI
  // activa, así que lo envolvemos para que nunca rompa la actualización.
  try { ss.setActiveSheet(sh); ss.moveActiveSheet(1); } catch (e) { /* headless */ }

  const tz = ss.getSpreadsheetTimeZone() || 'America/Denver';
  const stamp = Utilities.formatDate(new Date(), tz, "d 'de' MMMM yyyy, HH:mm");

  // Título.
  sh.getRange('A1:E1').merge().setValue('⚽  SORTEO MUNDIAL · RESUMEN')
    .setBackground(C.headerBg).setFontColor(C.headerFg).setFontWeight('bold')
    .setFontSize(16).setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 46);
  sh.getRange('A2:E2').merge().setValue('Actualizado: ' + stamp)
    .setFontColor(C.mutedFg).setFontStyle('italic').setFontSize(9)
    .setHorizontalAlignment('center');

  // --- Sección TOTALES ---
  sectionHeader_(sh, 4, 'TOTALES');
  const kpis = [
    ['Participantes', total, null],
    ['Siguen Instagram', ig, frac(ig)],
    ['Siguen Facebook', fb, frac(fb)],
    ['Reseñas en Google', gg, frac(gg)],
    ['Vinieron por referido', refs, frac(refs)],
    ['Finalizaron registro', fin, frac(fin)],
    ['Boletos repartidos', boletosTotal, null],
    ['Promedio de boletos', prom, null],
    ['Ganadores marcados', ganadores, null],
  ];
  let row = 5;
  kpis.forEach(function (k) {
    sh.getRange(row, 1).setValue(k[0]).setFontColor(C.labelFg);
    const valCell = sh.getRange(row, 3).setValue(k[1])
      .setFontWeight('bold').setFontColor(C.headerBg).setHorizontalAlignment('right');
    if (k[0] === 'Promedio de boletos') valCell.setNumberFormat('0.0');
    if (k[2] !== null) {
      sh.getRange(row, 4).setValue(k[2]).setNumberFormat('0%')
        .setFontColor(C.mutedFg).setHorizontalAlignment('right');
      sh.getRange(row, 5).setFormula(
        '=SPARKLINE(D' + row + ',{"charttype","bar";"max",1;"color1","' + C.headerBg + '"})');
    }
    row++;
  });

  // --- Sección DISTRIBUCIÓN DE BOLETOS ---
  const dStart = row + 1;
  sectionHeader_(sh, dStart, 'DISTRIBUCIÓN DE BOLETOS');
  const headRow = dStart + 1;
  sh.getRange(headRow, 1, 1, 3).setValues([['Boletos', 'Participantes', '']])
    .setFontWeight('bold').setFontColor(C.labelFg);
  for (let t = 1; t <= 6; t++) {
    const rr = headRow + t;
    sh.getRange(rr, 1).setValue(t + (t === 1 ? ' boleto' : ' boletos')).setFontColor(C.labelFg);
    sh.getRange(rr, 2).setValue(dist[t]).setFontWeight('bold')
      .setFontColor(C.headerBg).setHorizontalAlignment('right');
    sh.getRange(rr, 3).setFormula(
      '=SPARKLINE(B' + rr + ',{"charttype","bar";"max",' + distMax + ';"color1","' + C.ticketMax + '"})');
  }

  // Anchos y márgenes.
  const widths = [200, 130, 170, 80, 160];
  widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  if (sh.getMaxColumns() > 5) sh.deleteColumns(6, sh.getMaxColumns() - 5);

  try { SpreadsheetApp.getActive().toast('Resumen actualizado 📊', '⚽ Sorteo Mundial', 4); } catch (e) { /* headless */ }
}

// ============================================================
// ⏰ Auto-actualización del resumen (trigger por hora)
// ============================================================
function installHourlyTrigger() {
  removeSummaryTriggers_();
  ScriptApp.newTrigger('buildSummary').timeBased().everyHours(1).create();
  SpreadsheetApp.getUi().alert(
    '⏰ Auto-actualización activada',
    'El resumen se actualizará solo cada hora. Puedes desactivarla cuando quieras desde el menú ⚽ Sorteo Mundial.',
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

function removeAutoUpdate() {
  const n = removeSummaryTriggers_();
  SpreadsheetApp.getUi().alert(
    '⏸️ Auto-actualización desactivada',
    n + ' tarea(s) automática(s) eliminada(s). El resumen ya solo se actualiza con el botón 📊.',
    SpreadsheetApp.getUi().ButtonSet.OK,
  );
}

// Borra cualquier trigger que dispare buildSummary (evita duplicados).
function removeSummaryTriggers_() {
  let n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'buildSummary') { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}

// Encabezado de sección con estilo.
function sectionHeader_(sh, row, text) {
  sh.getRange(row, 1, 1, 5).merge().setValue(text)
    .setFontWeight('bold').setFontSize(11).setFontColor(C.headerBg)
    .setBackground(C.sectionBg) // verde crema
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 26);
}
