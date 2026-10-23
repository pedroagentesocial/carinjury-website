import { z } from 'zod';

/* Letras (incluye acentos/ñ), espacios, punto, apóstrofo y guion */
const LETTERS = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ.'\s-]*$/;
/* Dirección: letras, números y separadores comunes (#, coma, barra) */
const ADDRESS_CHARS = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,#'/-]+$/;
/* ZIP de EE.UU.: 12345 o 12345-6789 */
const ZIP = /^\d{5}(-\d{4})?$/;
/* Póliza / reclamo: alfanumérico con guiones o espacios */
const POLICY = /^[A-Za-z0-9][A-Za-z0-9\s-]*$/;

const phone = z
  .string()
  .max(25)
  .regex(/^[+0-9()\-.\s]+$/, 'phone_invalid')
  .refine((v) => {
    const digits = v.replace(/\D/g, '').length;
    return digits >= 10 && digits <= 15;
  }, 'phone_too_short');
const optionalPhone = z.union([phone, z.literal('')]).optional();
const optionalEmail = z.union([z.string().email('email_invalid'), z.literal('')]).optional();
const optionalString = z.string().max(500).optional().or(z.literal(''));

/** Opcional, pero si viene con texto debe cumplir el regex y el largo. */
const optionalMatch = (re: RegExp, max: number, msg: string) =>
  z.union([z.string().trim().min(2, msg).max(max, msg).regex(re, msg), z.literal('')]).optional();

/** YYYY-MM-DD de hoy en hora local (el servidor corre en UTC, que va adelante de Utah). */
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Fecha real en formato YYYY-MM-DD, entre 1900 y hoy. */
const pastDate = z
  .string()
  .min(1, 'field_required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_invalid')
  .refine((v) => !Number.isNaN(Date.parse(v)) && v >= '1900-01-01', 'date_invalid')
  .refine((v) => v <= todayISO(), 'date_future');

/**
 * Validación cruzada accidente vs. nacimiento. Exportada porque zod no corre el
 * superRefine si otros pasos todavía tienen errores (ej. consent sin marcar),
 * así que el form la llama directo al validar el paso del incidente.
 */
export function isAccidentBeforeBirth(d: { accident_date?: string; date_of_birth?: string }): boolean {
  return Boolean(d.accident_date && d.date_of_birth && d.accident_date < d.date_of_birth);
}

export const PatientReferralSchema = z
  .object({
    // Paso 1 — paciente
    first_name: z.string().min(2, 'field_required').max(80),
    middle_name: optionalString,
    last_name: z.string().min(2, 'field_required').max(80),
    date_of_birth: pastDate,
    gender: z.enum(['male', 'female', 'other']),

    // Paso 2 — dirección + contacto
    address: z
      .string()
      .trim()
      .min(5, 'address_invalid')
      .max(120, 'address_invalid')
      .regex(ADDRESS_CHARS, 'address_invalid')
      .regex(/\d/, 'address_number'),
    address2: optionalMatch(ADDRESS_CHARS, 60, 'address_invalid'),
    city: z.string().trim().min(2, 'city_invalid').max(60, 'city_invalid').regex(LETTERS, 'city_invalid'),
    state: z.string().trim().min(2, 'state_invalid').max(40, 'state_invalid').regex(LETTERS, 'state_invalid'),
    zip: z.string().trim().regex(ZIP, 'zip_invalid'),
    cell_phone: phone,
    email: optionalEmail,

    // Paso 3 — incidente
    accident_date: pastDate,
    accident_type: z.enum(['car', 'bicycle', 'motorcycle', 'pedestrian', 'other']),
    accident_type_other: optionalString,
    additional_notes: optionalString,

    // Paso 4 — seguro + referido (todo opcional, pero con formato si se llena)
    insurance_name: optionalMatch(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,&'-]*$/, 80, 'insurance_invalid'),
    policy_number: optionalMatch(POLICY, 30, 'policy_invalid'),
    claim_number: optionalMatch(POLICY, 30, 'policy_invalid'),
    legal_representation: z.enum(['yes', 'no']).default('no'),
    lawyer_firm_name: optionalMatch(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,&'-]*$/, 120, 'insurance_invalid'),
    lawyer_phone: optionalPhone,
    referral_name: optionalMatch(LETTERS, 80, 'name_invalid'),
    referral_phone: optionalPhone,

    // Paso 5 — autenticidad
    signature_name: z.string().min(2, 'field_required').max(120),
    consent: z.literal(true, { message: 'consent_required' }),

    language: z.enum(['es', 'en']).default('es'),
    website: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((d, ctx) => {
    if (isAccidentBeforeBirth(d)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accident_date'], message: 'date_before_birth' });
    }
  });

export type PatientReferral = z.infer<typeof PatientReferralSchema>;

export const PatientReferralResponseSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(),
  error: z.string().optional(),
});
export type PatientReferralResponse = z.infer<typeof PatientReferralResponseSchema>;
