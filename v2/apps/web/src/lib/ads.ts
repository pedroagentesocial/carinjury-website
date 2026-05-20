/**
 * Google Ads conversion labels (Conversion Actions).
 *
 * Estos valores vienen de Google Ads → Tools → Conversions → click en la
 * conversion action → Tag setup → "Install the tag yourself" → la parte
 * DESPUÉS del `/` en el `send_to: 'AW-XXX/AbCdEfGh...'`.
 *
 * Setealos como env vars en Vercel:
 *   PUBLIC_ADS_CONV_CONTACT_FORM=AbCdEfGhIjKlMnOp
 *   PUBLIC_ADS_CONV_PATIENT_REFERRAL=XyZ123AbC456
 *
 * Si una env var no está set, esa conversion NO se trackea en Google Ads
 * (pero sí sigue firing en GA4 + Meta Pixel via trackEvent).
 */

const env = import.meta.env;

export const ADS_CONVERSIONS = {
  contactForm: (env.PUBLIC_ADS_CONV_CONTACT_FORM as string | undefined) ?? '',
  patientReferral: (env.PUBLIC_ADS_CONV_PATIENT_REFERRAL as string | undefined) ?? '',
} as const;

/**
 * Estimated value en USD por tipo de lead — usado por Google Ads bidding (Target ROAS, Max conversion value).
 * Ajustalo cuando tengas datos reales de tu funnel (¿qué % de contacts convierten a cita?
 * ¿qué % de citas a paciente recurrente? × $$$ por paciente).
 */
export const LEAD_VALUES = {
  contactForm: 100,
  patientReferral: 200, // mayor — vienen con datos completos
} as const;
