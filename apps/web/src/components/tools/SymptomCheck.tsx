import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ContactFormSchema, type ContactForm, type Locale } from '@carinjury/shared';
import { submitContactForm } from '@lib/api-client';
import { ADS_CONVERSIONS, LEAD_VALUES } from '@lib/ads';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';
import Recaptcha from '@components/ui/Recaptcha';
import FormResultModal from '@components/ui/FormResultModal';
import {
  RED_FLAGS,
  CATEGORIES,
  TIMING,
  CARE,
  WHIPLASH,
  RESULT,
  type SymptomCategory,
  type SingleQuestion,
} from '@lib/tools/symptom-check';

interface Props {
  locale: Locale;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';
type StepDesc =
  | { kind: 'redflags' }
  | { kind: 'category'; cat: SymptomCategory }
  | { kind: 'whiplash' }
  | { kind: 'single'; q: SingleQuestion };

const RECAPTCHA_SITE_KEY = (import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined) ?? '';

function track(name: string, params?: Record<string, unknown>) {
  try {
    (window as unknown as { trackEvent?: (n: string, p?: Record<string, unknown>) => void }).trackEvent?.(name, params);
  } catch {
    /* analytics opcional */
  }
}

const ERROR_MSGS: Record<Locale, Record<string, string>> = {
  es: {
    validation_failed: 'Revisa los datos del formulario.',
    webhook_unreachable: 'No pudimos enviar. Intenta de nuevo.',
    internal_error: 'Error del servidor.',
    captcha_failed: 'Falló la verificación de captcha. Intenta de nuevo.',
    rate_limited: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
  },
  en: {
    validation_failed: 'Please review the form.',
    webhook_unreachable: 'Could not submit. Please try again.',
    internal_error: 'Server error.',
    captcha_failed: 'Captcha verification failed. Please try again.',
    rate_limited: 'Too many attempts. Please wait a minute and try again.',
  },
};

const SMS_CONSENT_TEXT: Record<Locale, string> = {
  es: 'Acepto recibir mensajes SMS/WhatsApp de Car Injury Clinic sobre mi evaluación y la coordinación de una cita. La frecuencia puede variar; pueden aplicar tarifas. Responde STOP para darte de baja.',
  en: 'I agree to receive SMS/WhatsApp messages from Car Injury Clinic about my evaluation and coordinating an appointment. Frequency may vary; rates may apply. Reply STOP to unsubscribe.',
};

export default function SymptomCheck({ locale }: Props) {
  const en = locale === 'en';
  const prefix = en ? '/en' : '';
  const whatsappHref = `/api/whatsapp?lang=${locale}&ctx=help`;
  const scheduleHref = `${prefix}/schedule`;
  const privacyHref = `${prefix}/privacy`;

  const steps: StepDesc[] = useMemo(
    () => [
      { kind: 'redflags' },
      ...CATEGORIES.map((cat) => ({ kind: 'category', cat }) as StepDesc),
      { kind: 'whiplash' },
      { kind: 'single', q: TIMING },
      { kind: 'single', q: CARE },
    ],
    [],
  );
  const total = steps.length;

  const [phase, setPhase] = useState<'wizard' | 'result'>('wizard');
  const [resultType, setResultType] = useState<'emergency' | 'guidance'>('guidance');
  const [stepIndex, setStepIndex] = useState(0);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [catSel, setCatSel] = useState<Record<string, string[]>>({});
  const [single, setSingle] = useState<Record<string, string>>({});
  const startedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  const pct = phase === 'result' ? 100 : Math.round((stepIndex / total) * 100);

  useEffect(() => {
    if (phase !== 'wizard') return;
    track('symptomcheck_step', { step: stepIndex + 1 });
    for (const m of [25, 50, 75]) {
      if (pct >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m);
        track('symptomcheck_progress', { percent: m });
      }
    }
  }, [stepIndex, phase, pct]);

  const ensureStarted = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('symptomcheck_start');
    }
  }, []);

  const enterResult = useCallback((type: 'emergency' | 'guidance') => {
    setResultType(type);
    setPhase('result');
    track('symptomcheck_progress', { percent: 100 });
    track('symptomcheck_result', { type });
  }, []);

  const toggleRedFlag = useCallback((id: string) => {
    ensureStarted();
    setRedFlags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [ensureStarted]);

  const toggleCat = useCallback((catId: string, id: string) => {
    ensureStarted();
    setCatSel((prev) => {
      const cur = prev[catId] ?? [];
      return { ...prev, [catId]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  }, [ensureStarted]);

  const next = useCallback(() => {
    const step = steps[stepIndex]!;
    if (step.kind === 'redflags') {
      if (redFlags.length > 0) {
        enterResult('emergency');
        return;
      }
    }
    if (stepIndex < total - 1) setStepIndex((i) => i + 1);
    else enterResult('guidance');
  }, [steps, stepIndex, redFlags, total, enterResult]);

  const chooseSingle = useCallback(
    (qid: string, value: string) => {
      ensureStarted();
      setSingle((prev) => ({ ...prev, [qid]: value }));
      if (stepIndex < total - 1) setStepIndex((i) => i + 1);
      else enterResult('guidance');
    },
    [ensureStarted, stepIndex, total, enterResult],
  );

  const back = useCallback(() => {
    if (phase === 'result') {
      setPhase('wizard');
      setStepIndex(total - 1);
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }, [phase, total]);

  const restart = useCallback(() => {
    setPhase('wizard');
    setStepIndex(0);
    setRedFlags([]);
    setCatSel({});
    setSingle({});
    startedRef.current = false;
    milestonesRef.current = new Set();
  }, []);

  const totalSymptoms = useMemo(
    () => Object.values(catSel).reduce((n, arr) => n + arr.length, 0),
    [catSel],
  );

  /* Resumen de síntomas para el lead (contexto interno). */
  const summary = useMemo(() => {
    const parts: string[] = [];
    for (const cat of CATEGORIES) {
      const sel = catSel[cat.id] ?? [];
      if (sel.length) {
        const labels = sel.map((id) => cat.items.find((it) => it.id === id)?.[locale]).filter(Boolean);
        parts.push(`${cat.title[locale]}: ${labels.join(', ')}`);
      }
    }
    const timingOpt = TIMING.options.find((o) => o.id === single['timing']);
    const careOpt = CARE.options.find((o) => o.id === single['care']);
    if (timingOpt) parts.push(`${TIMING.question[locale]} ${timingOpt[locale]}`);
    if (careOpt) parts.push(`${CARE.question[locale]} ${careOpt[locale]}`);
    return parts.join(' · ') || (en ? 'No symptoms marked' : 'Sin síntomas marcados');
  }, [catSel, single, locale, en]);

  /* ===== Lead (reusa ContactFormSchema + /api/contact) ===== */
  const [status, setStatus] = useState<Status>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState<'whatsapp' | 'email'>('whatsapp');
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const emailRequired = delivery === 'email';
  const isCoreValid = useMemo(() => {
    if (name.trim().length < 2) return false;
    if (phone.replace(/[^0-9]/g, '').length < 7) return false;
    if (emailRequired && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return false;
    return true;
  }, [name, phone, email, emailRequired]);
  const showCaptcha = isCoreValid && smsConsent && termsConsent;
  const canSubmit = showCaptcha && (Boolean(captchaToken) || !RECAPTCHA_SITE_KEY) && status !== 'submitting';

  const onCaptchaVerify = useCallback((tk: string) => setCaptchaToken(tk), []);
  const onCaptchaExpire = useCallback(() => setCaptchaToken(''), []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    const deliveryLabel = delivery === 'whatsapp' ? 'WhatsApp' : 'email';
    const candidate: ContactForm = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: `[Chequeo de síntomas] ${summary}. Enviar por: ${deliveryLabel}.`,
      discovery_source: '',
      referral_name: '',
      sms_consent: smsConsent as true,
      terms_consent: termsConsent as true,
      captcha_token: captchaToken,
      language: locale,
      website: String(fd.get('website') ?? ''),
    };

    const parsed = ContactFormSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrorMsg(ERROR_MSGS[locale].validation_failed!);
      setStatus('error');
      setModalOpen(true);
      return;
    }

    try {
      const res = await submitContactForm(parsed.data);
      if (res.ok) {
        setStatus('success');
        setModalOpen(true);
        track('symptomcheck_lead_submit', { delivery });
        try {
          (window as unknown as { trackConversion?: (l: string, v?: number) => void }).trackConversion?.(
            ADS_CONVERSIONS.contactForm,
            LEAD_VALUES.contactForm,
          );
        } catch { /* opcional */ }
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
      setName('');
      setPhone('');
      setEmail('');
      setSmsConsent(false);
      setTermsConsent(false);
      setCaptchaToken('');
    }
    setStatus('idle');
  }

  const step = steps[stepIndex]!;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      {/* ===== Barra de progreso ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={phase === 'wizard' && stepIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevron-left" size={14} />
            {en ? 'Back' : 'Atrás'}
          </button>
          <span className="text-xs font-semibold tabular-nums text-muted">
            {phase === 'result'
              ? en ? 'Result' : 'Resultado'
              : `${en ? 'Step' : 'Paso'} ${stepIndex + 1}/${total}`}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={en ? 'Symptom check progress' : 'Progreso del chequeo'}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
            style={{ width: `${phase === 'result' ? 100 : Math.max(6, pct)}%` }}
          />
        </div>
      </div>

      {/* ===== WIZARD ===== */}
      {phase === 'wizard' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step.kind === 'redflags' && (
              <fieldset>
                <legend className="font-heading text-2xl font-extrabold text-ink md:text-3xl">
                  {en ? 'First, any urgent symptoms right now?' : 'Primero, ¿tienes algún síntoma urgente ahora?'}
                </legend>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {en
                    ? 'Check any you feel now. If you check any, we’ll point you to emergency care.'
                    : 'Marca los que sientas ahora. Si marcas alguno, te indicaremos atención de emergencia.'}
                </p>
                <div className="mt-6 grid gap-2.5">
                  {RED_FLAGS.map((rf) => (
                    <SymptomToggle
                      key={rf.id}
                      label={rf[locale]}
                      checked={redFlags.includes(rf.id)}
                      danger
                      onToggle={() => toggleRedFlag(rf.id)}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {step.kind === 'category' && (
              <fieldset>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                  <Icon name={step.cat.icon} size={20} />
                </span>
                <legend className="mt-4 font-heading text-2xl font-extrabold text-ink md:text-3xl">
                  {step.cat.title[locale]}
                </legend>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.cat.note[locale]}</p>
                <div className="mt-6 grid gap-2.5">
                  {step.cat.items.map((it) => (
                    <SymptomToggle
                      key={it.id}
                      label={it[locale]}
                      checked={(catSel[step.cat.id] ?? []).includes(it.id)}
                      onToggle={() => toggleCat(step.cat.id, it.id)}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {step.kind === 'whiplash' && (
              <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 md:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon name="clock" size={20} />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-ink md:text-3xl">{WHIPLASH.title[locale]}</h2>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-[#353846]">{WHIPLASH.body[locale]}</p>
              </div>
            )}

            {step.kind === 'single' && (
              <fieldset aria-labelledby={`q-${step.q.id}`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                  <Icon name={step.q.icon} size={20} />
                </span>
                <legend id={`q-${step.q.id}`} className="mt-4 font-heading text-2xl font-extrabold text-ink md:text-3xl">
                  {step.q.question[locale]}
                </legend>
                <div className="mt-6 grid gap-3">
                  {step.q.options.map((opt) => {
                    const selected = single[step.q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => chooseSingle(step.q.id, opt.id)}
                        aria-pressed={selected}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition md:p-5 ${
                          selected ? 'border-primary bg-primary/[0.06]' : 'border-line bg-white hover:border-primary/30 hover:bg-surface-2'
                        }`}
                      >
                        <span className="font-heading text-base font-bold text-ink">{opt[locale]}</span>
                        <span aria-hidden="true" className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full transition ${selected ? 'bg-primary text-white' : 'bg-primary/[0.08] text-primary group-hover:bg-primary group-hover:text-white'}`}>
                          <Icon name="arrow-right" size={15} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Botón continuar para pasos multi-select / informativos */}
            {step.kind !== 'single' && (
              <button
                type="button"
                onClick={next}
                className="btn-uiverse-primary mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                {step.kind === 'redflags' && redFlags.length > 0
                  ? en ? 'See emergency guidance' : 'Ver guía de emergencia'
                  : en ? 'Continue' : 'Continuar'}
                <Icon name="arrow-right" size={16} />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ===== RESULTADO: EMERGENCIA ===== */}
      {phase === 'result' && resultType === 'emergency' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="rounded-3xl border-2 border-red-600 bg-red-50 p-6 md:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              {en ? 'Emergency' : 'Emergencia'}
            </span>
            <h2 className="mt-4 font-heading text-2xl font-extrabold leading-snug text-red-700 md:text-3xl">
              {RESULT.emergency.title[locale]}
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-red-900">{RESULT.emergency.body[locale]}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="tel:911"
                onClick={() => track('call_click', { from: 'symptomcheck_emergency' })}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-red-700"
              >
                <Icon name="phone" size={18} />
                {en ? 'Call 911' : 'Llamar al 911'}
              </a>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-red-900/80">{RESULT.emergency.followup[locale]}</p>
          </div>

          <p className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-ink">{en ? 'Important. ' : 'Importante. '}</span>
            {RESULT.disclaimer[locale]}
          </p>

          <div className="mt-4">
            <button type="button" onClick={restart} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
              {en ? 'Start over' : 'Empezar de nuevo'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ===== RESULTADO: GUÍA (no emergencia) ===== */}
      {phase === 'result' && resultType === 'guidance' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 md:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              <Icon name="check" size={13} strokeWidth={3} />
              {en ? 'Your result' : 'Tu resultado'}
            </span>
            <h2 className="mt-4 font-heading text-xl font-extrabold leading-snug text-ink md:text-2xl">
              {totalSymptoms === 0 ? RESULT.guidance.titleNoSymptoms[locale] : RESULT.guidance.title[locale]}
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-[#353846]">{RESULT.guidance.body[locale]}</p>
          </div>

          {/* Por qué no esperar (latigazo tardío) */}
          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h3 className="inline-flex items-center gap-2 font-heading text-base font-bold text-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary"><Icon name="clock" size={16} /></span>
              {WHIPLASH.title[locale]}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{WHIPLASH.body[locale]}</p>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-ink">{en ? 'Important. ' : 'Importante. '}</span>
            {RESULT.disclaimer[locale]}
          </p>

          <div className="mt-4">
            <button type="button" onClick={restart} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
              {en ? 'Start over' : 'Empezar de nuevo'}
            </button>
          </div>

          {/* Captura de lead */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-deep text-white">
            <div className="px-6 py-7 md:px-9 md:py-9">
              <h3 className="font-heading text-xl font-extrabold md:text-2xl">
                {en ? 'Get a free evaluation' : 'Agenda una evaluación gratuita'}
              </h3>
              <p className="mt-2 text-sm text-white/75">
                {en
                  ? 'Leave your details and we’ll reach out to check your symptoms — free and with no obligation.'
                  : 'Déjanos tus datos y te contactamos para revisar tus síntomas — sin costo ni compromiso.'}
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{en ? 'Name' : 'Nombre'} *</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} className={INPUT_CLASS} />
                </label>

                <div>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{en ? 'Contact me via' : 'Contáctame por'}</span>
                  <div className="flex gap-2">
                    {(['whatsapp', 'email'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDelivery(opt)}
                        aria-pressed={delivery === opt}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${delivery === opt ? 'border-secondary bg-secondary/15 text-white' : 'border-white/15 text-white/70 hover:border-white/30'}`}
                      >
                        <Icon name={opt === 'whatsapp' ? 'whatsapp' : 'mail'} size={16} />
                        {opt === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{en ? 'Phone' : 'Teléfono'} *</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" required className={INPUT_CLASS} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {en ? 'Email' : 'Correo'} {emailRequired ? '*' : `(${en ? 'optional' : 'opcional'})`}
                  </span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required={emailRequired} className={INPUT_CLASS} />
                </label>

                {/* Honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <ConsentCheckbox id="sc-sms" checked={smsConsent} onChange={setSmsConsent} text={SMS_CONSENT_TEXT[locale]} />
                <ConsentCheckbox
                  id="sc-terms"
                  checked={termsConsent}
                  onChange={setTermsConsent}
                  text={
                    <>
                      {en ? 'I accept the ' : 'Acepto los '}
                      <a href={privacyHref} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary underline-offset-2 hover:underline">
                        {en ? 'terms of use' : 'términos de uso'}
                      </a>
                      {en ? ' and the ' : ' y la '}
                      <a href={privacyHref} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary underline-offset-2 hover:underline">
                        {en ? 'privacy policy' : 'política de privacidad'}
                      </a>
                      .
                    </>
                  }
                />

                {showCaptcha && (
                  <div className="overflow-hidden rounded-lg bg-white/95 p-1">
                    <Recaptcha siteKey={RECAPTCHA_SITE_KEY} onVerify={onCaptchaVerify} onExpire={onCaptchaExpire} theme="light" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-send mt-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {en ? 'Sending…' : 'Enviando…'}
                    </>
                  ) : (
                    <>
                      <span className="btn-send-svg-wrapper">
                        <Icon name="send" size={18} className="btn-send-icon" />
                      </span>
                      <span className="btn-send-label">{en ? 'Request my free evaluation' : 'Pedir mi evaluación gratis'}</span>
                    </>
                  )}
                </button>
                {!canSubmit && status !== 'submitting' && (
                  <p className="text-center text-[11px] text-white/55">
                    {en ? 'Fill your name and phone, accept the consents and complete the captcha.' : 'Completa nombre y teléfono, acepta los consentimientos y el captcha.'}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* CTA de cierre (solo no-emergencia) */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`tel:${SITE.phone.tel}`} onClick={() => track('call_click', { from: 'symptomcheck' })} className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              <Icon name="phone" size={16} />
              {SITE.phone.display}
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener" onClick={() => track('whatsapp_click', { action: 'symptomcheck' })} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#0b3d24] transition hover:brightness-105">
              <Icon name="whatsapp" size={18} />
              WhatsApp
            </a>
            <a href={scheduleHref} className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/[0.06]">
              <Icon name="calendar" size={16} />
              {en ? 'Schedule' : 'Agendar'}
            </a>
          </div>
        </motion.div>
      )}

      <FormResultModal
        open={modalOpen}
        status={status === 'success' || status === 'error' ? status : null}
        locale={locale}
        message={errorMsg ?? undefined}
        onClose={handleModalClose}
      />
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[0.95rem] text-white placeholder:text-white/40 transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40';

function SymptomToggle({
  label,
  checked,
  onToggle,
  danger,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  danger?: boolean;
}) {
  const activeRing = danger ? 'border-red-500 bg-red-50' : 'border-primary/40 bg-primary/[0.05]';
  const box = checked
    ? danger
      ? 'border-red-500 bg-red-500 text-white'
      : 'border-primary bg-primary text-white'
    : 'border-primary/30 bg-white text-transparent';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
        checked ? activeRing : 'border-line bg-white hover:border-primary/25 hover:bg-surface-2'
      }`}
    >
      <span aria-hidden="true" className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 transition ${box}`}>
        <Icon name="check" size={14} strokeWidth={3} />
      </span>
      <span className={`text-sm font-semibold ${checked && danger ? 'text-red-700' : 'text-ink'}`}>{label}</span>
    </button>
  );
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  text,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  text: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer items-start gap-3 rounded-xl border bg-white/[0.03] p-3.5 transition ${
        checked ? 'border-secondary/40 bg-secondary/[0.08]' : 'border-white/12 hover:border-white/25 hover:bg-white/[0.06]'
      }`}
    >
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span aria-hidden="true" className={`checkmark-box mt-0.5 ${checked ? 'is-checked' : ''}`} />
      <span className="text-[0.78rem] leading-snug text-white/85">{text}</span>
    </label>
  );
}
