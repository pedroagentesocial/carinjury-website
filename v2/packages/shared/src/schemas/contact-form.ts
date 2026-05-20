import { z } from 'zod';

/** Opciones del dropdown "¿Cómo nos encontraste?" — atribuir leads correctamente. */
export const DISCOVERY_SOURCES = [
  'google_search',
  'google_maps',
  'facebook',
  'instagram',
  'tiktok',
  'x_twitter',
  'youtube',
  'ads',
  'ref_friend',
  'ref_lawyer',
  'ref_doctor',
  'sign',
  'event',
  'radio_tv',
  'other',
] as const;

export type DiscoverySource = (typeof DISCOVERY_SOURCES)[number];

/** Sources que requieren un nombre adicional (referido o "otro"). */
export const REFERRAL_SOURCES: DiscoverySource[] = ['ref_friend', 'ref_lawyer', 'ref_doctor', 'other'];

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'name_too_short').max(120),
  phone: z
    .string()
    .min(7, 'phone_too_short')
    .max(25)
    .regex(/^[+0-9()\-\s]+$/, 'phone_invalid'),
  email: z.string().email('email_invalid').optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  /** Atribución del lead — opcional pero recomendado */
  discovery_source: z.enum(DISCOVERY_SOURCES).optional().or(z.literal('')),
  /** Nombre del referente o detalle de "otro" — opcional, validado condicionalmente */
  referral_name: z.string().max(120).optional().or(z.literal('')),
  /** Consentimiento SMS — requerido por Twilio/A2P 10DLC compliance */
  sms_consent: z.literal(true, { message: 'sms_consent_required' }),
  /** Términos de uso + política de privacidad — requerido */
  terms_consent: z.literal(true, { message: 'terms_consent_required' }),
  /** Token de reCAPTCHA v2 — validado server-side contra Google */
  captcha_token: z.string().min(10, 'captcha_required').max(4096),
  language: z.enum(['es', 'en']).default('es'),
  // Honeypot anti-bot — debe venir vacío
  website: z.string().max(0).optional().or(z.literal('')),
}).refine(
  (data) => {
    // Si la source requiere nombre, validamos que esté presente (al menos 2 chars)
    if (data.discovery_source && REFERRAL_SOURCES.includes(data.discovery_source as DiscoverySource)) {
      return Boolean(data.referral_name && data.referral_name.trim().length >= 2);
    }
    return true;
  },
  {
    message: 'referral_name_required',
    path: ['referral_name'],
  },
);

export type ContactForm = z.infer<typeof ContactFormSchema>;

export const ContactFormResponseSchema = z.object({
  ok: z.boolean(),
  id: z.string().optional(),
  error: z.string().optional(),
});

export type ContactFormResponse = z.infer<typeof ContactFormResponseSchema>;
