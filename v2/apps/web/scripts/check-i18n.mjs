#!/usr/bin/env node
/**
 * Validates parity between es.json and en.json:
 *  - Every leaf path in es exists in en (and vice versa).
 *  - Value types match (string vs object) at every path.
 *  - Detects duplicate keys in raw JSON source (JSON.parse silently keeps last).
 *
 * Exits with code 1 if any inconsistency is found.
 *
 * Run: node scripts/check-i18n.mjs   (or `pnpm check-i18n` from apps/web)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const ES_PATH = resolve(ROOT, 'src/i18n/es.json');
const EN_PATH = resolve(ROOT, 'src/i18n/en.json');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function walk(obj, prefix = '') {
  const paths = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      paths.push(...walk(v, p));
    } else {
      paths.push({ path: p, type: Array.isArray(v) ? 'array' : typeof v });
    }
  }
  return paths;
}

/**
 * Detects duplicate top-level keys in a raw JSON source.
 * JSON.parse will silently keep the last one — we want to surface them.
 */
function findDuplicateTopLevelKeys(raw) {
  const seen = new Map();
  const dupes = [];
  const re = /^\s{2}"([^"]+)"\s*:/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const key = m[1];
    const line = raw.slice(0, m.index).split('\n').length;
    if (seen.has(key)) {
      dupes.push({ key, firstLine: seen.get(key), secondLine: line });
    } else {
      seen.set(key, line);
    }
  }
  return dupes;
}

const esRaw = readFileSync(ES_PATH, 'utf8');
const enRaw = readFileSync(EN_PATH, 'utf8');
const es = JSON.parse(esRaw);
const en = JSON.parse(enRaw);

const esPaths = new Map(walk(es).map((x) => [x.path, x.type]));
const enPaths = new Map(walk(en).map((x) => [x.path, x.type]));

const missingInEn = [...esPaths.keys()].filter((p) => !enPaths.has(p));
const missingInEs = [...enPaths.keys()].filter((p) => !esPaths.has(p));
const typeMismatch = [];
for (const [p, esType] of esPaths) {
  const enType = enPaths.get(p);
  if (enType && enType !== esType) {
    typeMismatch.push({ path: p, es: esType, en: enType });
  }
}

const esDupes = findDuplicateTopLevelKeys(esRaw);
const enDupes = findDuplicateTopLevelKeys(enRaw);

let errors = 0;

function report(label, items, fmt) {
  if (!items.length) return;
  errors += items.length;
  console.log(`\n${RED}✖ ${label} (${items.length})${RESET}`);
  for (const x of items.slice(0, 50)) {
    console.log(`  ${fmt(x)}`);
  }
  if (items.length > 50) console.log(`  ${DIM}... and ${items.length - 50} more${RESET}`);
}

console.log(`${DIM}es leaves: ${esPaths.size} • en leaves: ${enPaths.size}${RESET}`);

report('Missing in en.json', missingInEn, (p) => p);
report('Missing in es.json', missingInEs, (p) => p);
report('Type mismatches', typeMismatch, (x) => `${x.path}  ${YELLOW}(es=${x.es}, en=${x.en})${RESET}`);
report(
  'Duplicate top-level keys in es.json',
  esDupes,
  (d) => `"${d.key}"  ${DIM}(lines ${d.firstLine} and ${d.secondLine})${RESET}`,
);
report(
  'Duplicate top-level keys in en.json',
  enDupes,
  (d) => `"${d.key}"  ${DIM}(lines ${d.firstLine} and ${d.secondLine})${RESET}`,
);

if (errors === 0) {
  console.log(`\n${GREEN}✓ i18n parity OK${RESET} (es ↔ en, no duplicates)\n`);
  process.exit(0);
}
console.log(`\n${RED}${errors} issue(s) found${RESET}\n`);
process.exit(1);
