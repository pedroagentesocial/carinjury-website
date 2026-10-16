import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ContactFormSchema, type ContactForm, type Locale } from '@carinjury/shared';
import { submitContactForm } from '@lib/api-client';
import { ADS_CONVERSIONS, LEAD_VALUES } from '@lib/ads';
import { SITE } from '@lib/site';
import { Icon } from '@components/ui/Icon';
import Recaptcha from '@components/ui/Recaptcha';
import FormResultModal from '@components/ui/FormResultModal';
import {
  CHECKLIST_SECTIONS,
  CHECKLIST_TOTAL,
  CHECKLIST_LEGAL_NOTE,
} from '@lib/tools/accident-checklist';

interface Props {
  locale: Locale;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const STORAGE_KEY = 'cic:accident-checklist:v1';
const RECAPTCHA_SITE_KEY = (import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined) ?? '';

/* GA4 best-effort (no rompe si analytics no cargó). */
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
  es: 'Acepto recibir mensajes SMS/WhatsApp de Car Injury Clinic sobre mi guía y la coordinación de una evaluación. La frecuencia puede variar; pueden aplicar tarifas. Responde STOP para darte de baja.',
  en: 'I agree to receive SMS/WhatsApp messages from Car Injury Clinic about my guide and coordinating an evaluation. Frequency may vary; rates may apply. Reply STOP to unsubscribe.',
};

export default function AccidentChecklist({ locale }: Props) {
  const en = locale === 'en';
  const prefix = en ? '/en' : '';
  const pdfHref = `/api/checklist-pdf?lang=${locale}`;
  const scheduleHref = `${prefix}/schedule`;
  const whatsappHref = `/api/whatsapp?lang=${locale}`; // contacto a la clínica (server-only)

  /* ===== Progreso persistente ===== */
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const startedRef = useRef(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const map: Record<string, boolean> = {};
        for (const id of ids) map[id] = true;
        setChecked(map);
      }
    } catch {
      /* localStorage no disponible */
    }
    setHydrated(true);
  }, []);

  const doneCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const pct = Math.round((doneCount / CHECKLIST_TOTAL) * 100);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const ids = Object.keys(checked).filter((id) => checked[id]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    /* GA4: milestones de progreso (una vez cada uno). */
    for (const m of [25, 50, 75, 100]) {
      if (pct >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m);
        track('checklist_progress', { percent: m });
      }
    }
  }, [checked, hydrated, pct]);

  const toggle = useCallback((id: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('checklist_start');
    }
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const reset = useCallback(() => {
    setChecked({});
    milestonesRef.current = new Set();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Compartir por WhatsApp (a la familia — link público, sin nº clínica) ===== */
  const shareWhatsApp = useCallback(() => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : SITE.url;
    const msg = en
      ? `Sharing this guide on what to do after a car accident: ${pageUrl}`
      : `Te comparto esta guía de qué hacer después de un accidente de auto: ${pageUrl}`;
    track('whatsapp_click', { action: 'share' });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }, [en]);

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
  const leadRef = useRef<HTMLDivElement>(null);

  const privacyHref = `${prefix}/privacy`;
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

  const scrollToLead = useCallback(() => {
    leadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

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
      message: `[Checklist accidente] Enviar guía por: ${deliveryLabel}. Progreso: ${pct}%.`,
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
        track('checklist_lead_submit', { delivery, percent: pct });
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
      setStatus('idle');
    } else {
      setStatus('idle');
    }
  }

  const allDone = doneCount === CHECKLIST_TOTAL;

  return (
    <div className="relative">
      {/* ===== Barra de progreso sticky ===== */}
      <div className="sticky top-[64px] z-30 border-y border-line bg-white/90 backdrop-blur md:top-[88px]">
        <div className="mx-auto max-w-3xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-ink">{en ? 'Your progress' : 'Tu progreso'}</span>
            <div className="flex items-center gap-3">
              <span aria-live="polite" className="text-xs font-semibold tabular-nums text-ink">
                {doneCount}/{CHECKLIST_TOTAL} · {pct}%
              </span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex flex-none items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary/30 hover:text-primary"
              >
                <Icon name="close" size={13} />
                {en ? 'Reset' : 'Reiniciar'}
              </button>
            </div>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={en ? 'Checklist progress' : 'Progreso del checklist'}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* ===== Secciones ===== */}
        <div className="space-y-8">
          {CHECKLIST_SECTIONS.map((section) => (
            <section key={section.id} aria-labelledby={`sec-${section.id}`}>
              <h2 id={`sec-${section.id}`} className="inline-flex items-center gap-2.5 font-heading text-lg font-extrabold text-ink md:text-xl">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15">
                  <Icon name={section.icon} size={18} />
                </span>
                {section[locale].title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => {
                  const isChecked = Boolean(checked[item.id]);
                  const c = item[locale];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-pressed={isChecked}
                        className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition md:p-5 ${
                          isChecked
                            ? 'border-primary/40 bg-primary/[0.04]'
                            : 'border-line bg-white hover:border-primary/25 hover:bg-surface-2'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 transition ${
                            isChecked ? 'border-primary bg-primary text-white' : 'border-primary/30 bg-white text-transparent'
                          }`}
                        >
                          <Icon name="check" size={14} strokeWidth={3} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block font-heading text-base font-bold ${isChecked ? 'text-primary line-through decoration-primary/40' : 'text-ink'}`}>
                            {c.title}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted">{c.detail}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* ===== Nota legal (placeholder visible) ===== */}
        <p className="mt-8 rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">{en ? 'Note. ' : 'Nota. '}</span>
          {CHECKLIST_LEGAL_NOTE[locale]}
        </p>

        {/* ===== Acciones: PDF + compartir ===== */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={pdfHref}
            onClick={() => track('checklist_pdf_download', { lang: locale })}
            className="btn-uiverse-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <Icon name="arrow-right" size={16} />
            {en ? 'Download PDF' : 'Descargar PDF'}
          </a>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#0b3d24] transition hover:brightness-105"
          >
            <Icon name="whatsapp" size={18} />
            {en ? 'Share on WhatsApp' : 'Compartir por WhatsApp'}
          </button>
          <button
            type="button"
            onClick={scrollToLead}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/[0.06]"
          >
            <Icon name="mail" size={16} />
            {en ? 'Get my checklist' : 'Recibir mi checklist'}
          </button>
        </div>

        {allDone && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <Icon name="check" size={16} strokeWidth={3} />
            {en ? 'All done — keep this guide handy.' : 'Listo — guarda esta guía a la mano.'}
          </p>
        )}

        {/* ===== Captura de lead ===== */}
        <div ref={leadRef} className="mt-10 scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-deep text-white">
          <div className="px-6 py-7 md:px-9 md:py-9">
            <h2 className="font-heading text-xl font-extrabold md:text-2xl">
              {en ? 'Get the checklist sent to you' : 'Recibe el checklist'}
            </h2>
            <p className="mt-2 text-sm text-white/75">
              {en
                ? 'We’ll send you the guide and can help you book a free evaluation. No cost, no obligation.'
                : 'Te enviamos la guía y, si quieres, te ayudamos a agendar una evaluación gratuita. Sin costo y sin compromiso.'}
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                  {en ? 'Name' : 'Nombre'} *
                </span>
                <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} className={INPUT_CLASS} />
              </label>

              {/* Preferencia de envío */}
              <div>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
                  {en ? 'Send it via' : 'Envíamela por'}
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

              <ConsentCheckbox id="cl-sms" checked={smsConsent} onChange={setSmsConsent} text={SMS_CONSENT_TEXT[locale]} />
              <ConsentCheckbox
                id="cl-terms"
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
                    <span className="btn-send-label">{en ? 'Send me the checklist' : 'Enviarme el checklist'}</span>
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
      </div>

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
