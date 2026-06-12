/**
 * Limpieza de los datos del sorteo en Supabase (producción).
 *
 * Borra TODOS los participantes, acciones y ganadores para dejar la base en
 * cero antes de un lanzamiento. Es DESTRUCTIVO e irreversible.
 *
 * Uso:
 *   node scripts/sorteo-limpiar.mjs           → solo muestra el inventario (seguro, no borra)
 *   node scripts/sorteo-limpiar.mjs --si      → borra de verdad (pide la bandera explícita)
 *
 *   npm run sorteo:inventario                 → inventario
 *   npm run sorteo:limpiar -- --si            → borrado real
 *
 * Nota: Google Sheets NO se sincroniza al borrar (solo agrega/actualiza).
 * Para vaciar el Sheet usa el botón 🗑️ del menú "🎁 Sorteo" en el Apps Script.
 */
import { loadEnv } from '../src/scripts/loadEnv.js';
loadEnv();
// Import dinámico DESPUÉS de loadEnv: supabaseClient lee process.env al importarse.
const { supabaseAdmin } = await import('../src/services/supabaseClient.js');

const ZERO = '00000000-0000-0000-0000-000000000000';
const CONFIRMAR = process.argv.includes('--si') || process.argv.includes('--yes');

if (!supabaseAdmin) {
  console.error('❌ Supabase no configurado (faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env).');
  process.exit(1);
}

async function contar(tabla) {
  const { count, error } = await supabaseAdmin.from(tabla).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${tabla}: ${error.message}`);
  return count ?? 0;
}

// ---- Inventario (siempre) ----
const { data: parts, error: pe } = await supabaseAdmin
  .from('participantes')
  .select('nombre, email, telefono, created_at, finalizado')
  .order('created_at', { ascending: true });
if (pe) {
  console.error('❌ Error leyendo participantes:', pe.message);
  process.exit(1);
}

const accCount = await contar('acciones');
const ganCount = await contar('sorteo_ganadores');

console.log('\n=== INVENTARIO ACTUAL DEL SORTEO ===');
console.log(`Participantes: ${parts.length}`);
console.log(`Acciones:      ${accCount}`);
console.log(`Ganadores:     ${ganCount}`);
if (parts.length) {
  console.log('---');
  for (const p of parts) {
    console.log(`  ${p.created_at} | ${p.nombre} | ${p.email} | ${p.telefono} | finalizado=${p.finalizado}`);
  }
}

if (!CONFIRMAR) {
  console.log('\nℹ️  Modo inventario (no se borró nada). Para BORRAR TODO ejecuta:');
  console.log('   node scripts/sorteo-limpiar.mjs --si\n');
  process.exit(0);
}

if (parts.length === 0 && accCount === 0 && ganCount === 0) {
  console.log('\n✅ Ya está todo en cero, no hay nada que borrar.\n');
  process.exit(0);
}

// ---- Borrado (solo con --si) ----
console.log('\n⚠️  Borrando TODO (orden hijo → padre)…');

const g = await supabaseAdmin.from('sorteo_ganadores').delete().neq('participant_id', ZERO).select('id');
if (g.error) { console.error('❌ ganadores:', g.error.message); process.exit(1); }
console.log(`  Ganadores borrados:     ${g.data?.length ?? 0}`);

const a = await supabaseAdmin.from('acciones').delete().neq('participant_id', ZERO).select('id');
if (a.error) { console.error('❌ acciones:', a.error.message); process.exit(1); }
console.log(`  Acciones borradas:      ${a.data?.length ?? 0}`);

const p = await supabaseAdmin.from('participantes').delete().neq('id', ZERO).select('id');
if (p.error) { console.error('❌ participantes:', p.error.message); process.exit(1); }
console.log(`  Participantes borrados: ${p.data?.length ?? 0}`);

// ---- Verificación final ----
const final = {
  participantes: await contar('participantes'),
  acciones: await contar('acciones'),
  ganadores: await contar('sorteo_ganadores'),
};
console.log('\n=== VERIFICACIÓN FINAL ===');
console.log(`  participantes: ${final.participantes}`);
console.log(`  acciones:      ${final.acciones}`);
console.log(`  ganadores:     ${final.ganadores}`);

if (final.participantes || final.acciones || final.ganadores) {
  console.error('\n❌ Algo quedó sin borrar. Revisa los errores arriba.\n');
  process.exit(1);
}
console.log('\n✅ Supabase del sorteo limpio.\n');
console.log('Recuerda vaciar también el Google Sheet con el botón 🗑️ del Apps Script.\n');
