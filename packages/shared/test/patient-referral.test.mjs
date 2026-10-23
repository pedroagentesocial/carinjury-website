/**
 * Tests de validación del formulario de referencia de paciente.
 *
 * Uso (requiere Node >= 22.6, que ejecuta .ts sin compilar):
 *   pnpm --filter @carinjury/shared test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PatientReferralSchema, isAccidentBeforeBirth } from '../src/schemas/patient-referral.ts';

const VALID = {
  first_name: 'Ana',
  middle_name: '',
  last_name: 'Lopez',
  date_of_birth: '1990-01-01',
  gender: 'female',
  address: '2997 W 4700 S',
  address2: '',
  city: 'Taylorsville',
  state: 'UT',
  zip: '84129',
  cell_phone: '(801) 555-1234',
  email: '',
  accident_date: '2026-01-01',
  accident_type: 'car',
  accident_type_other: '',
  additional_notes: '',
  insurance_name: '',
  policy_number: '',
  claim_number: '',
  legal_representation: 'no',
  lawyer_firm_name: '',
  lawyer_phone: '',
  referral_name: '',
  referral_phone: '',
  signature_name: 'Ana Lopez',
  consent: true,
  language: 'es',
  website: '',
};

/** Devuelve los errores como "campo:codigo", o [] si es válido. */
function errors(patch) {
  const r = PatientReferralSchema.safeParse({ ...VALID, ...patch });
  return r.success ? [] : r.error.issues.map((i) => `${i.path[0]}:${i.message}`);
}

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('un referido completo y con póliza vacía es válido', () => {
  assert.deepEqual(errors({}), []);
});

test('ZIP: acepta 5 dígitos o ZIP+4', () => {
  assert.deepEqual(errors({ zip: '84129' }), []);
  assert.deepEqual(errors({ zip: '84129-1234' }), []);
});

test('ZIP: rechaza letras, cortos y largos', () => {
  for (const zip of ['84a29', 'ABCDE', '841', '841290000000', '84129-12']) {
    assert.deepEqual(errors({ zip }), ['zip:zip_invalid'], zip);
  }
});

test('dirección: exige número, largo y caracteres válidos', () => {
  assert.deepEqual(errors({ address: '123 Main St #4, Apt B/2' }), []);
  assert.deepEqual(errors({ address: 'Main Street' }), ['address:address_number']);
  assert.deepEqual(errors({ address: '1 ' + 'a'.repeat(130) }), ['address:address_invalid']);
  assert.deepEqual(errors({ address: '123 Main $%' }), ['address:address_invalid']);
  assert.deepEqual(errors({ address: '1 A' }), ['address:address_invalid']);
});

test('dirección 2: opcional pero con formato y largo', () => {
  assert.deepEqual(errors({ address2: 'Apt 5' }), []);
  assert.deepEqual(errors({ address2: 'a'.repeat(61) }), ['address2:address_invalid']);
});

test('ciudad: solo letras (con acentos y espacios), máximo 60', () => {
  assert.deepEqual(errors({ city: 'West Valley City' }), []);
  assert.deepEqual(errors({ city: 'Logan Ñuñoa' }), []);
  assert.deepEqual(errors({ city: 'SLC123' }), ['city:city_invalid']);
  assert.deepEqual(errors({ city: 'a'.repeat(61) }), ['city:city_invalid']);
  assert.deepEqual(errors({ city: 'A' }), ['city:city_invalid']);
});

test('estado/condado: solo letras, máximo 40', () => {
  assert.deepEqual(errors({ state: 'Utah' }), []);
  assert.deepEqual(errors({ state: 'Salt Lake County' }), []);
  assert.deepEqual(errors({ state: 'U7' }), ['state:state_invalid']);
  assert.deepEqual(errors({ state: 'a'.repeat(41) }), ['state:state_invalid']);
});

test('teléfono: 10 a 15 dígitos', () => {
  assert.deepEqual(errors({ cell_phone: '801-555-1234' }), []);
  assert.deepEqual(errors({ cell_phone: '+1 801 555 1234' }), []);
  assert.deepEqual(errors({ cell_phone: '5551234' }), ['cell_phone:phone_too_short']);
  // El form muestra el primer error: "solo números y símbolos"
  assert.equal(errors({ cell_phone: '801abc1234' })[0], 'cell_phone:phone_invalid');
});

test('póliza: campos opcionales pero con formato si se llenan', () => {
  assert.deepEqual(
    errors({ insurance_name: 'State Farm', policy_number: 'ABC-123456', claim_number: 'CL 9981' }),
    [],
  );
  assert.deepEqual(errors({ policy_number: '@@!!' }), ['policy_number:policy_invalid']);
  assert.deepEqual(errors({ claim_number: 'x'.repeat(31) }), ['claim_number:policy_invalid']);
  assert.deepEqual(errors({ insurance_name: '<script>' }), ['insurance_name:insurance_invalid']);
  assert.deepEqual(errors({ referral_name: 'Juan 3' }), ['referral_name:name_invalid']);
  assert.deepEqual(errors({ referral_phone: '123' }), ['referral_phone:phone_too_short']);
});

test('fecha del accidente: hoy es válida, mañana no', () => {
  assert.deepEqual(errors({ accident_date: isoOffset(0) }), []);
  assert.deepEqual(errors({ accident_date: isoOffset(1) }), ['accident_date:date_future']);
  assert.deepEqual(errors({ accident_date: '2099-01-01' }), ['accident_date:date_future']);
});

test('fecha del accidente: no puede ser anterior al nacimiento ni inválida', () => {
  assert.deepEqual(errors({ accident_date: '1980-01-01' }), ['accident_date:date_before_birth']);
  assert.ok(errors({ accident_date: '2026-13-45' }).includes('accident_date:date_invalid'));
  assert.ok(errors({ accident_date: 'ayer' }).includes('accident_date:date_invalid'));
});

test('fecha de nacimiento: no puede ser futura ni antes de 1900', () => {
  assert.ok(errors({ date_of_birth: isoOffset(1) }).includes('date_of_birth:date_future'));
  assert.ok(errors({ date_of_birth: '1850-01-01' }).includes('date_of_birth:date_invalid'));
});

test('accidente antes del nacimiento se detecta aunque falten pasos por llenar', () => {
  // Con consent sin marcar zod no corre el superRefine; el form usa el helper.
  const partial = { ...VALID, consent: false, accident_date: '1980-01-01' };
  assert.ok(!errors(partial).includes('accident_date:date_before_birth'));
  assert.equal(isAccidentBeforeBirth(partial), true);
  assert.equal(isAccidentBeforeBirth({ ...VALID }), false);
  assert.equal(isAccidentBeforeBirth({ accident_date: '', date_of_birth: '1990-01-01' }), false);
});
