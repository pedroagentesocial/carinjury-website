import { z } from 'zod';

const phone = z.string().min(7, 'phone_too_short').max(25).regex(/^[+0-9()\-\s]+$/, 'phone_invalid');
const optionalPhone = z.union([phone, z.literal('')]).optional();
const optionalEmail = z.union([z.string().email('email_invalid'), z.literal('')]).optional();
const optionalString = z.string().max(500).optional().or(z.literal(''));

export const PatientReferralSchema = z.object({
  // Paso 1 — paciente
  first_name: z.string().min(2, 'field_required').max(80),
  middle_name: optionalString,
  last_name: z.string().min(2, 'field_required').max(80),
  date_of_birth: z.string().min(4, 'field_required'),
  gender: z.enum(['male', 'female', 'other']),

  // Paso 2 — dirección + contacto
  address: z.string().min(3, 'field_required').max(200),
  address2: optionalString,
  city: z.string().min(2, 'field_required').max(80),
  state: z.string().min(2, 'field_required').max(80),
  zip: z.string().min(3, 'field_required').max(20),
  cell_phone: phone,
  email: optionalEmail,

  // Paso 3 — incidente
  accident_date: z.string().min(4, 'field_required'),
  accident_type: z.enum(['car', 'bicycle', 'motorcycle', 'pedestrian', 'other']),
  accident_type_other: optionalString,
  additional_notes: optionalString,

  // Paso 4 — seguro + referido (todo opcional)
  insurance_name: optionalString,
  policy_number: optionalString,
  claim_number: optionalString,
  legal_representation: z.enum(['yes', 'no']).default('no'),
  lawyer_firm_name: optionalString,
  lawyer_phone: optionalPhone,
  referral_name: optionalString,
  referral_phone: optionalPhone,

  // Paso 5 — autenticidad
  signature_name: z.string().min(2, 'field_required').max(120),
  consent: z.literal(true, { message: 'consent_required' }),

  language: z.enum(['es', 'en']).default('es'),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type PatientReferral = z.infer<typeof PatientReferralSchema>;

export const PatientReferralResponseSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(),
  error: z.string().optional(),
});
export type PatientReferralResponse = z.infer<typeof PatientReferralResponseSchema>;
