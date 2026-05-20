import { useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PatientReferralSchema, type PatientReferral, type Locale } from '@carinjury/shared';
import { submitReferral } from '@lib/api-client';
import { t, translations, type TranslationKey } from '@i18n/index';
import { Icon, type IconName } from '@components/ui/Icon';
import SignatureCanvas, { type SignatureCanvasHandle } from '@components/ui/SignatureCanvas';
import { ADS_CONVERSIONS, LEAD_VALUES } from '@lib/ads';

interface Props {
  locale: Locale;
}

type StepKey = 'patient' | 'address' | 'incident' | 'insurance' | 'consent';

interface StepDef {
  key: StepKey;
  icon: IconName;
  labelKey: TranslationKey;
  fields: (keyof PatientReferral)[];
}

const STEPS: StepDef[] = [
  {
    key: 'patient',
    icon: 'stethoscope',
    labelKey: 'formulario_page.patient_info.title',
    fields: ['first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender'],
  },
  {
    key: 'address',
    icon: 'pin',
    labelKey: 'formulario_page.address.title',
    fields: ['address', 'address2', 'city', 'state', 'zip', 'cell_phone', 'email'],
  },
  {
    key: 'incident',
    icon: 'car',
    labelKey: 'formulario_page.incident_info.title',
    fields: ['accident_date', 'accident_type', 'accident_type_other', 'additional_notes'],
  },
  {
    key: 'insurance',
    icon: 'shield',
    labelKey: 'formulario_page.insurance_info.title',
    fields: [
      'insurance_name',
      'policy_number',
      'claim_number',
      'legal_representation',
      'lawyer_firm_name',
      'lawyer_phone',
      'referral_name',
      'referral_phone',
    ],
  },
  {
    key: 'consent',
    icon: 'check',
    labelKey: 'formulario_page.authenticity.title',
    fields: ['signature_name', 'consent'],
  },
];

const ERROR_MSGS: Record<Locale, Record<string, string>> = {
  es: {
    field_required: 'Campo obligatorio o demasiado corto.',
    name_too_short: 'Nombre demasiado corto.',
    phone_too_short: 'Teléfono inválido (mínimo 7 dígitos).',
    phone_invalid: 'Teléfono inválido (solo números y símbolos + ( ) -).',
    email_invalid: 'Correo inválido.',
    consent_required: 'Debes aceptar el consentimiento.',
    validation_failed: 'Revisa los campos del paso actual.',
    webhook_unreachable: 'No pudimos enviar. Intenta de nuevo.',
    invalid_json: 'Error al enviar.',
    internal_error: 'Error del servidor.',
  },
  en: {
    field_required: 'Required field or too short.',
    name_too_short: 'Name too short.',
    phone_too_short: 'Invalid phone (minimum 7 digits).',
    phone_invalid: 'Invalid phone (only numbers and symbols + ( ) -).',
    email_invalid: 'Invalid email.',
    consent_required: 'You must accept the consent.',
    validation_failed: 'Please review the current step.',
    webhook_unreachable: 'Could not submit. Please try again.',
    invalid_json: 'Submission error.',
    internal_error: 'Server error.',
  },
};

/* Field labels for clear error messages */
const FIELD_LABELS: Record<Locale, Partial<Record<keyof PatientReferral, string>>> = {
  es: {
    first_name: 'Nombre',
    middle_name: 'Segundo nombre',
    last_name: 'Apellido',
    date_of_birth: 'Fecha de nacimiento',
    gender: 'Género',
    address: 'Dirección',
    address2: 'Dirección 2',
    city: 'Ciudad',
    state: 'Estado',
    zip: 'Código postal',
    cell_phone: 'Teléfono celular',
    email: 'Correo electrónico',
    accident_date: 'Fecha del accidente',
    accident_type: 'Tipo de accidente',
    accident_type_other: 'Otro tipo',
    additional_notes: 'Notas adicionales',
    insurance_name: 'Aseguradora',
    policy_number: 'Número de póliza',
    claim_number: 'Número de reclamo',
    legal_representation: 'Representación legal',
    lawyer_firm_name: 'Firma de abogados',
    lawyer_phone: 'Teléfono del abogado',
    referral_name: 'Nombre del referente',
    referral_phone: 'Teléfono del referente',
    signature_name: 'Firma',
    consent: 'Consentimiento',
  },
  en: {
    first_name: 'First name',
    middle_name: 'Middle name',
    last_name: 'Last name',
    date_of_birth: 'Date of birth',
    gender: 'Gender',
    address: 'Address',
    address2: 'Address 2',
    city: 'City',
    state: 'State',
    zip: 'ZIP code',
    cell_phone: 'Cell phone',
    email: 'Email',
    accident_date: 'Accident date',
    accident_type: 'Accident type',
    accident_type_other: 'Other type',
    additional_notes: 'Additional notes',
    insurance_name: 'Insurance',
    policy_number: 'Policy number',
    claim_number: 'Claim number',
    legal_representation: 'Legal representation',
    lawyer_firm_name: 'Law firm',
    lawyer_phone: 'Lawyer phone',
    referral_name: 'Referrer name',
    referral_phone: 'Referrer phone',
    signature_name: 'Signature',
    consent: 'Consent',
  },
};

const INITIAL: PatientReferral = {
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'male',
  address: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  cell_phone: '',
  email: '',
  accident_date: '',
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
  signature_name: '',
  consent: false as unknown as true,
  language: 'es',
  website: '',
};

export default function PatientReferralForm({ locale }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PatientReferral>({ ...INITIAL, language: locale });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string>('');
  const signatureRef = useRef<SignatureCanvasHandle | null>(null);
  const fields = translations[locale].formulario_page.patient_info;
  void fields; // touched for type safety

  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step]!;

  function set<K extends keyof PatientReferral>(key: K, value: PatientReferral[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrorMsg(null);
  }

  function validateCurrent(): boolean {
    const parsed = PatientReferralSchema.safeParse(data);
    if (parsed.success) return true;
    const issue = parsed.error.issues.find((i) =>
      current.fields.includes(i.path[0] as keyof PatientReferral),
    );
    if (issue) {
      const fieldKey = issue.path[0] as keyof PatientReferral;
      const fieldLabel = FIELD_LABELS[locale][fieldKey] ?? String(fieldKey);
      const detail = ERROR_MSGS[locale][issue.message] ?? ERROR_MSGS[locale].validation_failed!;
      setErrorMsg(`${fieldLabel} → ${detail}`);
      return false;
    }
    return true;
  }

  function next() {
    if (!validateCurrent()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1));
    setErrorMsg(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (!validateCurrent()) return;

    /* Requiere firma con cursor (canvas no vacío) además del nombre digitado */
    if (!signatureImage) {
      setErrorMsg(
        locale === 'en'
          ? 'Please sign with your cursor or finger before submitting.'
          : 'Por favor firma con el cursor o tu dedo antes de enviar.',
      );
      return;
    }

    const parsed = PatientReferralSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const fieldKey = first?.path[0] as keyof PatientReferral | undefined;
      const fieldLabel = fieldKey ? FIELD_LABELS[locale][fieldKey] ?? String(fieldKey) : null;
      const detail = ERROR_MSGS[locale][first?.message ?? 'validation_failed'] ?? ERROR_MSGS[locale].validation_failed!;
      setErrorMsg(fieldLabel ? `${fieldLabel} → ${detail}` : detail);
      // Saltar al primer step con error si no es el actual
      if (fieldKey) {
        const stepIdx = STEPS.findIndex((s) => s.fields.includes(fieldKey));
        if (stepIdx >= 0 && stepIdx !== step) setStep(stepIdx);
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitReferral(parsed.data);
      if (res.ok) {
        // Google Ads + GA4 + Meta conversion tracking
        try {
          (window as unknown as { trackConversion?: (l: string, v?: number) => void }).trackConversion?.(
            ADS_CONVERSIONS.patientReferral,
            LEAD_VALUES.patientReferral,
          );
          (window as unknown as { trackEvent?: (n: string, p?: Record<string, unknown>) => void }).trackEvent?.('lead_submit', { form: 'patient_referral', value: LEAD_VALUES.patientReferral });
        } catch {
          /* analytics is optional */
        }
        window.location.href = locale === 'en' ? '/en/thank-you' : '/thank-you';
      } else {
        setErrorMsg(ERROR_MSGS[locale][res.error ?? 'internal_error'] ?? ERROR_MSGS[locale].internal_error!);
        setSubmitting(false);
      }
    } catch {
      setErrorMsg(ERROR_MSGS[locale].webhook_unreachable!);
      setSubmitting(false);
    }
  }

  const direction = useMemo(() => 1, []); // placeholder for slide direction
  void direction;

  return (
    <section className="bg-surface-2 py-16">
      <div className="mx-auto max-w-3xl px-6">
        {/* Progress strip */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span>
              {t('formulario_page.progress.label', locale)} {step + 1}{' '}
              {t('formulario_page.progress.of', locale)} {STEPS.length}
            </span>
            <span>{t(current.labelKey, locale)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  if (i <= step) setStep(i);
                }}
                aria-current={i === step}
                disabled={i > step}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  i === step
                    ? 'border-primary bg-primary text-white'
                    : i < step
                      ? 'border-primary/40 bg-white text-primary hover:bg-primary/10'
                      : 'border-line bg-white text-muted'
                }`}
              >
                <Icon name={s.icon} size={12} />
                {t(s.labelKey, locale)}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-line bg-white p-6 shadow-md md:p-8"
          noValidate
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {current.key === 'patient' && <StepPatient locale={locale} data={data} set={set} />}
              {current.key === 'address' && <StepAddress locale={locale} data={data} set={set} />}
              {current.key === 'incident' && <StepIncident locale={locale} data={data} set={set} />}
              {current.key === 'insurance' && <StepInsurance locale={locale} data={data} set={set} />}
              {current.key === 'consent' && (
                <StepConsent
                  locale={locale}
                  data={data}
                  set={set}
                  signatureRef={signatureRef}
                  onSignatureChange={setSignatureImage}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Honeypot */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            value={data.website ?? ''}
            onChange={(e) => set('website', e.target.value)}
          />

          {errorMsg && (
            <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="arrow-right" size={14} className="rotate-180" />
              {locale === 'en' ? 'Back' : 'Atrás'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-deep"
              >
                {locale === 'en' ? 'Continue' : 'Continuar'}
                <Icon name="arrow-right" size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary disabled:opacity-60"
              >
                {submitting
                  ? t('formulario_page.submit.button', locale) + '…'
                  : t('formulario_page.submit.button', locale)}
                <Icon name="check" size={14} />
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Steps
   --------------------------------------------------------------------------- */

interface StepProps {
  locale: Locale;
  data: PatientReferral;
  set: <K extends keyof PatientReferral>(key: K, value: PatientReferral[K]) => void;
}

const INPUT =
  'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  );
}

function StepPatient({ locale, data, set }: StepProps) {
  const fields = translations[locale].formulario_page.patient_info;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={`${fields.first_name} *`}>
        <input className={INPUT} required value={data.first_name} onChange={(e) => set('first_name', e.target.value)} />
      </Field>
      <Field label={fields.middle_name}>
        <input className={INPUT} value={data.middle_name ?? ''} onChange={(e) => set('middle_name', e.target.value)} />
      </Field>
      <Field label={`${fields.last_name} *`}>
        <input className={INPUT} required value={data.last_name} onChange={(e) => set('last_name', e.target.value)} />
      </Field>
      <Field label={`${fields.date_of_birth} *`}>
        <input className={INPUT} type="date" required value={data.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
      </Field>
      <Field label={`${fields.gender} *`}>
        <select className={INPUT} value={data.gender} onChange={(e) => set('gender', e.target.value as PatientReferral['gender'])}>
          <option value="male">{fields.gender_male}</option>
          <option value="female">{fields.gender_female}</option>
          <option value="other">{fields.gender_other}</option>
        </select>
      </Field>
    </div>
  );
}

function StepAddress({ locale, data, set }: StepProps) {
  const a = translations[locale].formulario_page.address;
  const c = translations[locale].formulario_page.patient_contact;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={`${a.address} *`}>
        <input className={INPUT} required value={data.address} onChange={(e) => set('address', e.target.value)} />
      </Field>
      <Field label={a.address2}>
        <input className={INPUT} value={data.address2 ?? ''} onChange={(e) => set('address2', e.target.value)} />
      </Field>
      <Field label={`${a.city} *`}>
        <input className={INPUT} required value={data.city} onChange={(e) => set('city', e.target.value)} />
      </Field>
      <Field label={`${a.state} *`}>
        <input className={INPUT} required value={data.state} onChange={(e) => set('state', e.target.value)} />
      </Field>
      <Field label={`${a.zip} *`}>
        <input className={INPUT} required value={data.zip} onChange={(e) => set('zip', e.target.value)} />
      </Field>
      <Field label={`${c.cell_phone} *`}>
        <input className={INPUT} type="tel" required inputMode="tel" value={data.cell_phone} onChange={(e) => set('cell_phone', e.target.value)} />
      </Field>
      <Field label={c.email}>
        <input className={INPUT} type="email" value={data.email ?? ''} onChange={(e) => set('email', e.target.value)} />
      </Field>
    </div>
  );
}

function StepIncident({ locale, data, set }: StepProps) {
  const f = translations[locale].formulario_page.incident_info;
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={`${f.accident_date} *`}>
          <input className={INPUT} type="date" required value={data.accident_date} onChange={(e) => set('accident_date', e.target.value)} />
        </Field>
        <Field label={`${f.accident_type} *`}>
          <select className={INPUT} value={data.accident_type} onChange={(e) => set('accident_type', e.target.value as PatientReferral['accident_type'])}>
            <option value="car">{f.type_car}</option>
            <option value="bicycle">{f.type_bicycle}</option>
            <option value="motorcycle">{f.type_motorcycle}</option>
            <option value="pedestrian">{f.type_pedestrian}</option>
            <option value="other">{f.type_other}</option>
          </select>
        </Field>
      </div>
      {data.accident_type === 'other' && (
        <Field label={f.other_specify}>
          <input className={INPUT} value={data.accident_type_other ?? ''} onChange={(e) => set('accident_type_other', e.target.value)} />
        </Field>
      )}
      <Field label={f.additional_notes}>
        <textarea className={`${INPUT} min-h-[120px]`} value={data.additional_notes ?? ''} onChange={(e) => set('additional_notes', e.target.value)} />
      </Field>
    </div>
  );
}

function StepInsurance({ locale, data, set }: StepProps) {
  const i = translations[locale].formulario_page.insurance_info;
  const inc = translations[locale].formulario_page.incident_info;
  const ref = translations[locale].formulario_page.referral_info;
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={i.insurance_name}>
          <input className={INPUT} value={data.insurance_name ?? ''} onChange={(e) => set('insurance_name', e.target.value)} />
        </Field>
        <Field label={i.policy_number}>
          <input className={INPUT} value={data.policy_number ?? ''} onChange={(e) => set('policy_number', e.target.value)} />
        </Field>
        <Field label={i.claim_number}>
          <input className={INPUT} value={data.claim_number ?? ''} onChange={(e) => set('claim_number', e.target.value)} />
        </Field>
        <Field label={inc.legal_representation}>
          <select className={INPUT} value={data.legal_representation} onChange={(e) => set('legal_representation', e.target.value as 'yes' | 'no')}>
            <option value="no">{inc.legal_no}</option>
            <option value="yes">{inc.legal_yes}</option>
          </select>
        </Field>
      </div>
      {data.legal_representation === 'yes' && (
        <div className="grid gap-4 rounded-xl bg-surface-2 p-4 md:grid-cols-2">
          <Field label={inc.lawyer_firm_name}>
            <input className={INPUT} value={data.lawyer_firm_name ?? ''} onChange={(e) => set('lawyer_firm_name', e.target.value)} />
          </Field>
          <Field label={inc.lawyer_phone}>
            <input className={INPUT} type="tel" value={data.lawyer_phone ?? ''} onChange={(e) => set('lawyer_phone', e.target.value)} />
          </Field>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={`${ref.first_name} (${locale === 'en' ? 'referrer' : 'referido'})`}>
          <input className={INPUT} value={data.referral_name ?? ''} onChange={(e) => set('referral_name', e.target.value)} />
        </Field>
        <Field label={ref.cell_phone}>
          <input className={INPUT} type="tel" value={data.referral_phone ?? ''} onChange={(e) => set('referral_phone', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

interface StepConsentProps extends StepProps {
  signatureRef: React.MutableRefObject<SignatureCanvasHandle | null>;
  onSignatureChange: (dataUrl: string) => void;
}

function StepConsent({ locale, data, set, signatureRef, onSignatureChange }: StepConsentProps) {
  const a = translations[locale].formulario_page.authenticity;
  const s = translations[locale].formulario_page.signature;
  return (
    <div className="grid gap-5">
      <p className="rounded-xl bg-surface-2 p-4 text-sm leading-relaxed text-muted">{a.statement}</p>

      {/* Drawable signature canvas */}
      <SignatureCanvas
        ref={signatureRef}
        locale={locale}
        label={s.signature_canvas}
        hint={s.signature_placeholder}
        required
        onChange={onSignatureChange}
      />

      {/* Printed name (printed signature) */}
      <Field
        label={`${locale === 'en' ? 'Printed name' : 'Nombre en letra imprenta'} *`}
        hint={locale === 'en' ? 'Your full legal name.' : 'Tu nombre legal completo.'}
      >
        <input
          className={`${INPUT} font-heading text-lg`}
          value={data.signature_name}
          onChange={(e) => set('signature_name', e.target.value)}
          required
          placeholder={`${data.first_name} ${data.last_name}`.trim() || (locale === 'en' ? 'Your full name' : 'Tu nombre completo')}
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm">
        <input
          type="checkbox"
          checked={data.consent === true}
          onChange={(e) => set('consent', e.target.checked as unknown as true)}
          className="mt-1 h-5 w-5 flex-none accent-primary"
          required
        />
        <span className="text-ink">
          {a.consent_checkbox_new}{' '}
          <a href={locale === 'en' ? '/en/privacy' : '/privacy'} className="font-semibold text-primary underline">
            {a.privacy_policy}
          </a>
          .
        </span>
      </label>
    </div>
  );
}
