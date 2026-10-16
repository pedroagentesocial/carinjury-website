import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ContactFormSchema,
  type ContactForm,
  type Locale,
  type DiscoverySource,
  REFERRAL_SOURCES,
} from '@carinjury/shared';
import { submitContactForm } from '@lib/api-client';
import { t } from '@i18n/index';
import { Icon } from '@components/ui/Icon';
import { ADS_CONVERSIONS, LEAD_VALUES } from '@lib/ads';
import Recaptcha from '@components/ui/Recaptcha';
import FormResultModal from '@components/ui/FormResultModal';

interface Props {
  locale: Locale;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const RECAPTCHA_SITE_KEY = (import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined) ?? '';

const ERROR_MSGS: Record<Locale, Record<string, string>> = {
  es: {
    name_too_short: 'Tu nombre es muy corto.',
    phone_too_short: 'Teléfono inválido.',
    phone_invalid: 'Teléfono inválido.',
    email_invalid: 'Correo inválido.',
    validation_failed: 'Revisa los datos del formulario.',
    invalid_json: 'Error al enviar.',
    webhook_unreachable: 'No pudimos enviar. Intenta de nuevo.',
    internal_error: 'Error del servidor.',
    sms_consent_required: 'Debes aceptar el consentimiento SMS.',
    terms_consent_required: 'Debes aceptar los términos y la política de privacidad.',
    captcha_required: 'Por favor completá el captcha.',
    captcha_failed: 'Falló la verificación de captcha. Intentá de nuevo.',
    referral_name_required: 'Por favor indica el nombre o detalle de cómo nos encontraste.',
    rate_limited: 'Demasiados intentos. Esperá un minuto e intentá de nuevo.',
  },
  en: {
    name_too_short: 'Your name is too short.',
    phone_too_short: 'Invalid phone.',
    phone_invalid: 'Invalid phone.',
    email_invalid: 'Invalid email.',
    validation_failed: 'Please review the form.',
    invalid_json: 'Submission error.',
    webhook_unreachable: 'Could not submit. Please try again.',
    internal_error: 'Server error.',
    sms_consent_required: 'You must accept the SMS consent.',
    terms_consent_required: 'You must accept the terms and privacy policy.',
    captcha_required: 'Please complete the captcha.',
    captcha_failed: 'Captcha verification failed. Please try again.',
    referral_name_required: 'Please tell us the name or detail of how you found us.',
    rate_limited: 'Too many attempts. Please wait a minute and try again.',
  },
};

const DISCOVERY_OPTIONS: Array<{
  value: DiscoverySource;
  es: string;
  en: string;
  group: 'online' | 'referral' | 'offline' | 'other';
}> = [
  { value: 'google_search', es: 'Google (búsqueda)',       en: 'Google (search)',          group: 'online' },
  { value: 'google_maps',   es: 'Google Maps',             en: 'Google Maps',              group: 'online' },
  { value: 'facebook',      es: 'Facebook',                en: 'Facebook',                 group: 'online' },
  { value: 'instagram',     es: 'Instagram',               en: 'Instagram',                group: 'online' },
  { value: 'tiktok',        es: 'TikTok',                  en: 'TikTok',                   group: 'online' },
  { value: 'youtube',       es: 'YouTube',                 en: 'YouTube',                  group: 'online' },
  { value: 'x_twitter',     es: 'X (Twitter)',             en: 'X (Twitter)',              group: 'online' },
  { value: 'ads',           es: 'Anuncio (Google / Meta)', en: 'Ad (Google / Meta)',       group: 'online' },
  { value: 'ref_friend',    es: 'Referido: amigo o familiar', en: 'Referral: friend / family', group: 'referral' },
  { value: 'ref_lawyer',    es: 'Referido: abogado',       en: 'Referral: lawyer',         group: 'referral' },
  { value: 'ref_doctor',    es: 'Referido: médico / clínica', en: 'Referral: doctor / clinic', group: 'referral' },
  { value: 'sign',          es: 'Letrero / pasé por la clínica', en: 'Sign / drove by clinic', group: 'offline' },
  { value: 'event',         es: 'Evento / comunidad',      en: 'Event / community',        group: 'offline' },
  { value: 'radio_tv',      es: 'Radio / TV',              en: 'Radio / TV',               group: 'offline' },
  { value: 'other',         es: 'Otro',                    en: 'Other',                    group: 'other' },
];

const GROUP_LABELS: Record<Locale, Record<'online' | 'referral' | 'offline' | 'other', string>> = {
  es: { online: 'En línea', referral: 'Referidos', offline: 'Fuera de línea', other: 'Otros' },
  en: { online: 'Online',   referral: 'Referrals', offline: 'Offline',        other: 'Other' },
};

const SMS_CONSENT_TEXT: Record<Locale, string> = {
  es: 'Al enviar este formulario, acepto recibir mensajes SMS de Car Injury Clinic sobre mi solicitud de asistencia por accidente, actualizaciones de mi caso y coordinación de citas. La frecuencia de mensajes puede variar. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para darte de baja.',
  en: 'By submitting this form, I agree to receive SMS messages from Car Injury Clinic about my accident assistance request, case updates and appointment coordination. Message frequency may vary. Message and data rates may apply. Reply STOP to unsubscribe.',
};

export default function ContactForm({ locale }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* Form fields controlled state (necesario para "isReady" derivado) */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource | ''>('');
  const [referralName, setReferralName] = useState('');

  /* Consents */
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  /* Captcha */
  const [captchaToken, setCaptchaToken] = useState('');

  const privacyHref = locale === 'en' ? '/en/privacy' : '/privacy';

  /* Validación derivada de campos requeridos (para mostrar captcha + habilitar submit) */
  const isCoreValid = useMemo(() => {
    if (name.trim().length < 2) return false;
    if (phone.replace(/[^0-9]/g, '').length < 7) return false;
    /* Si es referido/other, exige nombre */
    if (discoverySource && REFERRAL_SOURCES.includes(discoverySource as DiscoverySource)) {
      if (referralName.trim().length < 2) return false;
    }
    return true;
  }, [name, phone, discoverySource, referralName]);

  /* Captcha solo aparece cuando el form está válido + consents aceptados */
  const showCaptcha = isCoreValid && smsConsent && termsConsent;

  /* Submit habilitado solo si todo está completo */
  const canSubmit = showCaptcha && (Boolean(captchaToken) || !RECAPTCHA_SITE_KEY) && status !== 'submitting';

  const showReferralInput = useMemo(() => {
    return discoverySource ? REFERRAL_SOURCES.includes(discoverySource) : false;
  }, [discoverySource]);

  const referralLabel = useMemo(() => {
    switch (discoverySource) {
      case 'ref_friend':
        return locale === 'en' ? "Friend's name" : 'Nombre del amigo';
      case 'ref_lawyer':
        return locale === 'en' ? "Lawyer's name or firm" : 'Nombre del abogado o firma';
      case 'ref_doctor':
        return locale === 'en' ? 'Doctor or clinic name' : 'Nombre del médico o clínica';
      case 'other':
        return locale === 'en' ? 'Tell us more' : 'Cuéntanos más';
      default:
        return '';
    }
  }, [discoverySource, locale]);

  const optionsByGroup = useMemo(() => {
    const map: Record<string, typeof DISCOVERY_OPTIONS> = {};
    for (const opt of DISCOVERY_OPTIONS) {
      if (!map[opt.group]) map[opt.group] = [];
      map[opt.group]!.push(opt);
    }
    return map;
  }, []);

  const onCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);
  const onCaptchaExpire = useCallback(() => setCaptchaToken(''), []);

  function resetForm() {
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setDiscoverySource('');
    setReferralName('');
    setSmsConsent(false);
    setTermsConsent(false);
    setCaptchaToken('');
    setStatus('idle');
    setErrorMsg(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    const candidate: ContactForm = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
      discovery_source: discoverySource || '',
      referral_name: showReferralInput ? referralName.trim() : '',
      sms_consent: smsConsent as true,
      terms_consent: termsConsent as true,
      captcha_token: captchaToken,
      language: locale,
      website: String(fd.get('website') ?? ''),
    };

    const parsed = ContactFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setErrorMsg(ERROR_MSGS[locale][first?.message ?? 'validation_failed'] ?? ERROR_MSGS[locale].validation_failed!);
      setStatus('error');
      setModalOpen(true);
      return;
    }

    try {
      const res = await submitContactForm(parsed.data);
      if (res.ok) {
        setStatus('success');
        setModalOpen(true);
        /* Google Ads + GA4 + Meta conversion tracking */
        try {
          (window as unknown as { trackConversion?: (l: string, v?: number) => void }).trackConversion?.(
            ADS_CONVERSIONS.contactForm,
            LEAD_VALUES.contactForm,
          );
          (window as unknown as { trackEvent?: (n: string, p?: Record<string, unknown>) => void }).trackEvent?.('lead_submit', {
            form: 'contact',
            value: LEAD_VALUES.contactForm,
            discovery: discoverySource || 'unknown',
          });
        } catch { /* analytics is optional */ }
      } else {
        setErrorMsg(ERROR_MSGS[locale][res.error ?? 'internal_error'] ?? ERROR_MSGS[locale].internal_error!);
        setStatus('error');
        setModalOpen(true);
      }
    } catch {
      setErrorMsg(ERROR_MSGS[locale].webhook_unreachable!);
      setStatus('error');
      setModalOpen(true);
    }
  }

  function handleModalClose() {
    setModalOpen(false);
    if (status === 'success') {
      /* Reset full form después de cerrar el modal de éxito */
      resetForm();
    } else {
      /* Permitir reintento */
      setStatus('idle');
    }
  }

  return (
    <>
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-white backdrop-blur-md md:p-9"
        noValidate
      >
        <h3 className="font-heading text-2xl font-extrabold leading-tight md:text-3xl">
          {locale === 'en' ? 'Tell us about your case' : 'Cuéntanos sobre tu caso'}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {locale === 'en'
            ? "We'll reply within 24 hours. No commitment."
            : 'Te respondemos en menos de 24h. Sin compromiso.'}
        </p>

        <div className="mt-6 grid flex-1 gap-4">
          <Field label={`${t('form.fields.name', locale)} *`}>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={120}
              className={INPUT_CLASS}
            />
          </Field>

          <Field label={`${t('form.fields.phone', locale)} *`}>
            <input
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className={INPUT_CLASS}
            />
          </Field>

          <Field label={t('form.fields.email', locale)}>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>

          {/* DISCOVERY SOURCE */}
          <Field label={locale === 'en' ? 'How did you find us?' : '¿Cómo nos encontraste?'}>
            <div className="relative">
              <select
                name="discovery_source"
                value={discoverySource}
                onChange={(e) => {
                  const v = e.target.value as DiscoverySource | '';
                  setDiscoverySource(v);
                  if (!v || !REFERRAL_SOURCES.includes(v as DiscoverySource)) setReferralName('');
                }}
                className={`${INPUT_CLASS} cursor-pointer appearance-none pr-10`}
              >
                <option value="" className="bg-white text-ink">
                  {locale === 'en' ? '— Select an option —' : '— Selecciona una opción —'}
                </option>
                {(['online', 'referral', 'offline', 'other'] as const).map((group) => (
                  <optgroup
                    key={group}
                    label={GROUP_LABELS[locale][group]}
                    className="bg-white font-semibold text-primary"
                  >
                    {(optionsByGroup[group] ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white text-ink">
                        {locale === 'en' ? opt.en : opt.es}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/55">
                <Icon name="chevron-down" size={16} />
              </span>
            </div>
          </Field>

          <AnimatePresence initial={false}>
            {showReferralInput && (
              <motion.div
                key="referral"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Field label={`${referralLabel} *`}>
                  <input
                    name="referral_name"
                    type="text"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder={
                      discoverySource === 'other'
                        ? locale === 'en' ? 'e.g. found you in a magazine' : 'ej. los encontré en una revista'
                        : locale === 'en' ? 'Full name' : 'Nombre completo'
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Field label={t('form.fields.message', locale)}>
            <textarea
              name="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              placeholder={t('form.fields.message_placeholder', locale)}
              className={`${INPUT_CLASS} resize-none`}
            />
          </Field>

          {/* Honeypot */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          {/* === SMS CONSENT === */}
          <ConsentCheckbox
            checked={smsConsent}
            onChange={setSmsConsent}
            id="sms-consent"
            text={SMS_CONSENT_TEXT[locale]}
          />

          {/* === TERMS + PRIVACY CONSENT === */}
          <ConsentCheckbox
            checked={termsConsent}
            onChange={setTermsConsent}
            id="terms-consent"
            text={
              <>
                {locale === 'en' ? 'I accept the ' : 'Acepto los '}
                <a
                  href={privacyHref}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-secondary underline-offset-2 hover:underline"
                >
                  {locale === 'en' ? 'terms of use' : 'términos de uso'}
                </a>
                {locale === 'en' ? ' and the ' : ' y la '}
                <a
                  href={privacyHref}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-secondary underline-offset-2 hover:underline"
                >
                  {locale === 'en' ? 'privacy policy' : 'política de privacidad'}
                </a>
                .
              </>
            }
          />

          {/* === reCAPTCHA — solo cuando todo lo demás está listo === */}
          <AnimatePresence initial={false}>
            {showCaptcha && (
              <motion.div
                key="captcha"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/65">
                  <Icon name="check" size={12} strokeWidth={3} className="text-emerald-300" />
                  {locale === 'en' ? 'Last step: confirm you are not a robot' : 'Último paso: confirmá que no sos un robot'}
                </p>
                <div className="overflow-hidden rounded-lg bg-white/95 p-1">
                  <Recaptcha
                    siteKey={RECAPTCHA_SITE_KEY}
                    onVerify={onCaptchaVerify}
                    onExpire={onCaptchaExpire}
                    theme="light"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === SUBMIT === */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-send mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
          >
            {status === 'submitting' ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t('form.sending', locale)}
              </>
            ) : (
              <>
                <span className="btn-send-svg-wrapper">
                  <Icon name="send" size={18} className="btn-send-icon" />
                </span>
                <span className="btn-send-label">{t('form.submit_button', locale)}</span>
              </>
            )}
          </button>

          {/* Helper text que indica qué falta */}
          {!canSubmit && status !== 'submitting' && (
            <p className="text-center text-[11px] text-white/55">
              {locale === 'en'
                ? 'Fill the form, accept consents, and complete the captcha to send.'
                : 'Completá el formulario, aceptá los consentimientos y el captcha para enviar.'}
            </p>
          )}
        </div>
      </motion.form>

      {/* RESULT MODAL */}
      <FormResultModal
        open={modalOpen}
        status={status === 'success' || status === 'error' ? status : null}
        locale={locale}
        message={errorMsg ?? undefined}
        onClose={handleModalClose}
      />
    </>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[0.95rem] text-white placeholder:text-white/40 transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  text,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: React.ReactNode;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer items-start gap-3 rounded-xl border bg-white/[0.03] p-3.5 transition ${
        checked
          ? 'border-secondary/40 bg-secondary/[0.08]'
          : 'border-white/12 hover:border-white/25 hover:bg-white/[0.06]'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`checkmark-box mt-0.5 ${checked ? 'is-checked' : ''}`}
      />
      <span className="text-[0.78rem] leading-snug text-white/85">{text}</span>
    </label>
  );
}
