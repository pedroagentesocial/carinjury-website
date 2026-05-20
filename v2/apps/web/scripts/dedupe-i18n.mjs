#!/usr/bin/env node
/**
 * Reescribe es.json y en.json deduplicando claves de primer nivel.
 *
 * JSON.parse ya colapsa duplicados (queda con el último valor). Re-emitir el
 * objeto parseado con JSON.stringify produce un archivo limpio sin tocar los
 * valores efectivos en runtime.
 *
 * Idempotente. Conserva orden de primera aparición de cada clave.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');

for (const file of ['src/i18n/es.json', 'src/i18n/en.json']) {
  const path = resolve(ROOT, file);
  const raw = readFileSync(path, 'utf8');
  const parsed = JSON.parse(raw);
  const next = JSON.stringify(parsed, null, 2) + '\n';
  writeFileSync(path, next, 'utf8');
  console.log(`✓ ${file} reescrito (${Object.keys(parsed).length} claves top-level)`);
}
