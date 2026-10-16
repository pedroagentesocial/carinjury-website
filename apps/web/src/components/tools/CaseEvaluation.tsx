import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ContactFormSchema, type ContactForm, type Locale } from '@carinjury/shared';
import { submitContactForm } from '@lib/api-client';
import { ADS_CONVERSIONS, LEAD_VALUES } from '@lib/ads';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';
import Recaptcha from '@components/ui/Recaptcha';
import FormResultModal from '@components/ui/FormResultModal';
import { CASE_STEPS, CASE_TOTAL_STEPS, CASE_RESULT } from '@lib/tools/case-evaluation';

interface Props {
  locale: Locale;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

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
  es: 'Acepto recibir mensajes SMS/WhatsApp de Car Injury Clinic sobre mi evaluación gratuita y la coordinación de una cita. La frecuencia puede variar; pueden aplicar tarifas. Responde STOP para darte de baja.',
  en: 'I agree to receive SMS/WhatsApp messages from Car Injury Clinic about my free evaluation and coordinating an appointment. Frequency may vary; rates may apply. Reply STOP to unsubscribe.',
};

export default function CaseEvaluation({ locale }: Props) {
  const en = locale === 'en';
  const prefix = en ? '/en' : '';
  const whatsappHref = `/api/whatsapp?lang=${locale}&ctx=help`;
  const scheduleHref = `${prefix}/schedule`;
  const privacyHref = `${prefix}/privacy`;

  /* ===== Wizard (en memoria, sin persistencia) ===== */
  const [phase, setPhase] = useState<'wizard' | 'result'>('wizard');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const startedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  const step = CASE_STEPS[stepIndex]!;
  const pct = phase === 'result' ? 100 : Math.round((stepIndex / CASE_TOTAL_STEPS) * 100);

  useEffect(() => {
    if (phase !== 'wizard') return;
    track('case_eval_step', { step: stepIndex + 1, id: step.id });
    for (const m of [25, 50, 75]) {
      if (pct >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m);
        track('case_eval_progress', { percent: m });
      }
    }
  }, [stepIndex, phase, pct, step.id]);

  const choose = useCallback(
    (value: string) => {
      if (!startedRef.current) {
        startedRef.current = true;
        track('case_eval_start');
      }
      const id = CASE_STEPS[stepIndex]!.id;
      setAnswers((prev) => ({ ...prev, [id]: value }));
      if (stepIndex < CASE_TOTAL_STEPS - 1) {
        setStepIndex((i) => i + 1);
      } else {
        track('case_eval_progress', { percent: 100 });
        track('case_eval_complete');
        setPhase('result');
      }
    },
    [stepIndex],
  );

  const back = useCallback(() => {
    if (phase === 'result') {
      setPhase('wizard');
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }, [phase]);

  const restart = useCallback(() => {
    setAnswers({});
    setStepIndex(0);
    setPhase('wizard');
    startedRef.current = false;
    milestonesRef.current = new Set();
  }, []);

  /* ===== Resultado cualitativo (sin montos ni probabilidad) ===== */
  const result = useMemo(() => {
    const headline = answers['injuries'] === 'no' ? CASE_RESULT.headlineNoInjury : CASE_RESULT.headlineDefault;
    const notes: string[] = [];
    if (['not-yet', 'no'].includes(answers['medical-care'] ?? '')) notes.push(CASE_RESULT.medicalNote[locale]);
    if (['6-plus', 'dont-remember'].includes(answers['timing'] ?? '')) notes.push(CASE_RESULT.timingNote[locale]);
    return { headline: headline[locale], notes };
  }, [answers, locale]);

  /* Resumen de respuestas para el lead (contexto interno, sin montos). */
  const answersSummary = useMemo(() => {
    return CASE_STEPS.map((s) => {
      const v = answers[s.id];
      const opt = s.options.find((o) => o.value === v);
      return `${s.question[locale]} ${opt ? opt[locale] : '—'}`;
    }).join(' · ');
  }, [answers, locale]);

  /* ===== Captura de lead (reusa ContactFormSchema + /api/contact) ===== */
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
      message: `[Tengo un caso] ${answersSummary}. Enviar por: ${deliveryLabel}.`,
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
        track('case_eval_lead_submit', { delivery });
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
              : `${en ? 'Step' : 'Paso'} ${stepIndex + 1}/${CASE_TOTAL_STEPS}`}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={en ? 'Evaluation progress' : 'Progreso de la evaluación'}
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
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            role="group"
            aria-labelledby={`q-${step.id}`}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
              <Icon name={step.icon} size={20} />
            </span>
            <h2 id={`q-${step.id}`} className="mt-4 font-heading text-2xl font-extrabold text-ink md:text-3xl">
              {step.question[locale]}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.why[locale]}</p>

            <div className="mt-6 grid gap-3">
              {step.options.map((opt) => {
                const selected = answers[step.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => choose(opt.value)}
                    aria-pressed={selected}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition md:p-5 ${
                      selected
                        ? 'border-primary bg-primary/[0.06]'
                        : 'border-line bg-white hover:border-primary/30 hover:bg-surface-2'
                    }`}
                  >
                    <span className="font-heading text-base font-bold text-ink">{opt[locale]}</span>
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full transition ${
                        selected ? 'bg-primary text-white' : 'bg-primary/[0.08] text-primary group-hover:bg-primary group-hover:text-white'
                      }`}
                    >
                      <Icon name="arrow-right" size={15} />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ===== RESULTADO ===== */}
      {phase === 'result' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 md:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              <Icon name="check" size={13} strokeWidth={3} />
              {en ? 'Your result' : 'Tu resultado'}
            </span>
            <p className="mt-4 font-heading text-xl font-extrabold leading-snug text-ink md:text-2xl">
              {result.headline}
            </p>
            {result.notes.map((n, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-muted">{n}</p>
            ))}
          </div>

          {/* Factores educativos (sin números) */}
          <h3 className="mt-8 font-heading text-lg font-bold text-ink">
            {en ? 'What influences a case' : 'Qué influye en un caso'}
          </h3>
          <ul className="mt-4 space-y-3">
            {CASE_RESULT.factors.map((f) => (
              <li key={f.title.en} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
                  <Icon name="check" size={14} strokeWidth={2.6} />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-sm font-bold text-ink">{f.title[locale]}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{f.desc[locale]}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Disclaimer visible */}
          <p className="mt-6 rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
            <span className="font-semibold text-ink">{en ? 'Important. ' : 'Importante. '}</span>
            {CASE_RESULT.disclaimer[locale]}
          </p>

          <div className="mt-4">
            <button type="button" onClick={restart} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
              {en ? 'Start over' : 'Empezar de nuevo'}
            </button>
          </div>

          {/* ===== Captura de lead ===== */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-deep text-white">
            <div className="px-6 py-7 md:px-9 md:py-9">
              <h3 className="font-heading text-xl font-extrabold md:text-2xl">
                {en ? 'Get your free evaluation' : 'Agenda tu evaluación gratuita'}
              </h3>
              <p className="mt-2 text-sm text-white/75">
                {en
                  ? 'Leave your details and we’ll reach out to review your case — free and with no obligation.'
                  : 'Déjanos tus datos y te contactamos para revisar tu caso — sin costo ni compromiso.'}
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {en ? 'Name' : 'Nombre'} *
                  </span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} className={INPUT_CLASS} />
                </label>

                <div>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {en ? 'Contact me via' : 'Contáctame por'}
                  </span>
                  <div className="flex gap-2">
                    {(['whatsapp', 'email'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDelivery(opt)}
                        aria-pressed={delivery === opt}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                          delivery === opt ? 'border-secondary bg-secondary/15 text-white' : 'border-white/15 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <Icon name={opt === 'whatsapp' ? 'whatsapp' : 'mail'} size={16} />
                        {opt === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                    {en ? 'Phone' : 'Teléfono'} *
                  </span>
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

                <ConsentCheckbox id="ce-sms" checked={smsConsent} onChange={setSmsConsent} text={SMS_CONSENT_TEXT[locale]} />
                <ConsentCheckbox
                  id="ce-terms"
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
                    {en
                      ? 'Fill your name and phone, accept the consents and complete the captcha.'
                      : 'Completa nombre y teléfono, acepta los consentimientos y el captcha.'}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* ===== CTA de cierre ===== */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`tel:${SITE.phone.tel}`} onClick={() => track('call_click', { from: 'case_eval' })} className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              <Icon name="phone" size={16} />
              {SITE.phone.display}
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener" onClick={() => track('whatsapp_click', { action: 'case_eval' })} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#0b3d24] transition hover:brightness-105">
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
