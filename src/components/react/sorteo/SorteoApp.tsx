import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SORTEO_MAX_BOLETOS, SORTEO_TICKET_VALUES, sorteoCerrado } from '../../../data/sorteo';
import { useT } from '../../../lib/useT';

// ---------------------------------------------------------------------------
// Config — ajustar handles reales de redes si cambian.
// ---------------------------------------------------------------------------
const IG_URL = 'https://www.instagram.com/car.injuryclinic/';
const FB_URL = 'https://www.facebook.com/profile.php?id=100090183003470';
// Enlace DIRECTO al formulario de reseña de Google (usa PUBLIC_GOOGLE_PLACE_ID,
// igual que el Footer). Fallback: ficha de Google Maps de la clínica.
const GOOGLE_PLACE_ID = import.meta.env.PUBLIC_GOOGLE_PLACE_ID;
const GOOGLE_REVIEW_URL = GOOGLE_PLACE_ID
  ? `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`
  : 'https://maps.app.goo.gl/76gxBm8r9supmSYR9';
const REFERRAL_BASE = 'https://carinjuryclinics.com/sorteo?ref=';
const MAX_TICKETS = SORTEO_MAX_BOLETOS;
const GOOGLE_TICKETS = SORTEO_TICKET_VALUES.google;
const STORAGE_KEY = 'sorteo_state_v1';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 7) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length >= 4) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length >= 1) return `(${digits}`;
  return '';
}

type Action = 'instagram' | 'facebook' | 'google';

interface Persisted {
  token: string;
  referralCode: string;
  tickets: number;
  igDone: boolean;
  fbDone: boolean;
  googleDone: boolean;
  finalizado: boolean;
  nombre: string;
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.token === 'string' && typeof p.referralCode === 'string') return p;
  } catch {
    /* ignore */
  }
  return null;
}

function savePersisted(p: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export default function SorteoApp({ initialRef = '' }: { initialRef?: string }) {
  // Fase del flujo.
  const [registered, setRegistered] = useState(false);

  // Datos del participante tras registrarse.
  const [token, setToken] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [nombre, setNombre] = useState('');
  const [tickets, setTickets] = useState(1);
  const [igDone, setIgDone] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const [googleDone, setGoogleDone] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  // Hidratar desde localStorage para que un refresh conserve el panel.
  useEffect(() => {
    const p = loadPersisted();
    if (p) {
      setToken(p.token);
      setReferralCode(p.referralCode);
      setNombre(p.nombre || '');
      setTickets(p.tickets || 1);
      setIgDone(!!p.igDone);
      setFbDone(!!p.fbDone);
      setGoogleDone(!!p.googleDone);
      setFinalizado(!!p.finalizado);
      setRegistered(true);
    }
  }, []);

  // Persistir cada vez que cambie algo relevante (solo si ya está registrado).
  useEffect(() => {
    if (!registered || !token) return;
    savePersisted({ token, referralCode, tickets, igDone, fbDone, googleDone, finalizado, nombre });
  }, [registered, token, referralCode, tickets, igDone, fbDone, googleDone, finalizado, nombre]);

  const handleRegistered = (data: {
    token: string;
    referralCode: string;
    nombre: string;
  }) => {
    setToken(data.token);
    setReferralCode(data.referralCode);
    setNombre(data.nombre);
    setTickets(1);
    setIgDone(false);
    setFbDone(false);
    setGoogleDone(false);
    setFinalizado(false);
    setRegistered(true);
  };

  // Si el sorteo cerró y el visitante aún no estaba registrado, no mostramos el
  // formulario: ya pasó la rifa del lunes.
  const cerrado = sorteoCerrado();

  return (
    <div id="registro" className="max-w-xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {!registered && cerrado ? (
          <ClosedCard key="closed" />
        ) : !registered ? (
          <RegisterForm key="form" initialRef={initialRef} onRegistered={handleRegistered} />
        ) : (
          <TicketPanel
            key="panel"
            token={token}
            nombre={nombre}
            referralCode={referralCode}
            tickets={tickets}
            setTickets={setTickets}
            igDone={igDone}
            fbDone={fbDone}
            googleDone={googleDone}
            finalizado={finalizado}
            setIgDone={setIgDone}
            setFbDone={setFbDone}
            setGoogleDone={setGoogleDone}
            setFinalizado={setFinalizado}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================================================================
// Tarjeta de "sorteo cerrado"
// ===========================================================================
function ClosedCard() {
  const { t } = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl border border-clay-200 p-6 sm:p-8 text-center"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-clay-100 text-clay-500 flex items-center justify-center mb-4">
        <Check className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-clay-800">
        {t('sorteo.closed.title', 'El sorteo ya cerró')}
      </h2>
      <p className="mt-2 text-sm text-clay-600">
        {t(
          'sorteo.closed.sub',
          'El registro se cerró el lunes 15 de junio de 2026, día de la rifa. ¡Gracias por participar y mucha suerte a quienes ya están dentro!',
        )}
      </p>
    </motion.div>
  );
}

// ===========================================================================
// Formulario de registro (sin <form> nativo)
// ===========================================================================
function RegisterForm({
  initialRef,
  onRegistered,
}: {
  initialRef: string;
  onRegistered: (d: { token: string; referralCode: string; nombre: string }) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();

  const phoneDigits = telefono.replace(/\D/g, '');
  const valid =
    nombre.trim().length >= 2 && phoneDigits.length === 10 && EMAIL_RE.test(email.trim()) && consent;

  const submit = async () => {
    setError(null);

    // Honeypot: si un bot lo llenó, salimos sin dar señal alguna.
    if (company.trim() !== '') return;

    if (!consent) {
      setError(t('sorteo.form.err_consent', 'Debes aceptar los términos para participar.'));
      return;
    }
    if (!valid) {
      setError(t('sorteo.form.err_fields', 'Revisa tu nombre, teléfono (10 dígitos) y correo.'));
      return;
    }

    setSubmitting(true);
    try {
      const ref = (initialRef || '').trim();
      const qs = ref ? `?ref=${encodeURIComponent(ref)}` : '';
      const res = await fetch(`/api/sorteo/registrar${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono,
          email: email.trim(),
          consent: true,
          ref,
          company,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setSubmitting(false);
        setError(t('sorteo.form.err_dup', 'Este correo o teléfono ya está registrado en el sorteo.'));
        return;
      }
      if (!res.ok || !data?.success || !data?.token) {
        setSubmitting(false);
        setError(t('sorteo.form.err_generic', 'No se pudo completar tu registro. Intenta de nuevo.'));
        return;
      }

      onRegistered({
        token: data.token,
        referralCode: data.referralCode,
        nombre: nombre.trim(),
      });
    } catch {
      setSubmitting(false);
      setError(t('sorteo.form.err_network', 'Problema de conexión. Revisa tu internet e intenta de nuevo.'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl border border-clay-200 p-6 sm:p-8"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-clay-800">
          {t('sorteo.form.title', 'Regístrate gratis')}
        </h2>
        <p className="mt-2 text-sm text-clay-600">
          {t('sorteo.form.sub', 'Completa tus datos y tu entrada cuenta de inmediato.')}
        </p>
        <p className="mt-3 inline-block rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-700">
          {t('sorteo.form.utah', '📍 Válido solo para residentes de Utah')}
        </p>
      </div>

      <div className="space-y-4">
        <Field
          label={t('sorteo.form.nombre', 'Nombre completo')}
          name="nombre"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez"
          value={nombre}
          onChange={setNombre}
        />
        <Field
          label={t('sorteo.form.telefono', 'Teléfono')}
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(801) 555-1234"
          value={telefono}
          onChange={(v) => setTelefono(formatPhone(v))}
          maxLength={14}
        />
        <Field
          label={t('sorteo.form.email', 'Correo electrónico')}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="juan@ejemplo.com"
          value={email}
          onChange={setEmail}
        />

        {/* Honeypot — invisible para humanos */}
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            Empresa (no completar)
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 text-[12px] text-clay-700 leading-snug select-none cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-clay-300 text-moss-700 focus:ring-2 focus:ring-moss-500 cursor-pointer shrink-0"
          />
          <span>
            {t(
              'sorteo.form.consent_pre',
              'Acepto participar en el sorteo y que Señor de las Casas me contacte sobre el mismo. He leído las',
            )}{' '}
            <a
              href="/sorteo/bases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-moss-700 underline hover:text-moss-800"
            >
              {t('sorteo.form.consent_bases', 'bases y condiciones')}
            </a>
            .
          </span>
        </label>

        {error && (
          <div
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {error}
          </div>
        )}

        <motion.button
          whileHover={valid && !submitting ? { scale: 1.02 } : undefined}
          whileTap={valid && !submitting ? { scale: 0.98 } : undefined}
          type="button"
          onClick={submit}
          disabled={!valid || submitting}
          aria-disabled={!valid || submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 disabled:bg-clay-200 disabled:text-clay-500 disabled:cursor-not-allowed disabled:shadow-none text-clay-900 font-bold py-3.5 px-5 rounded-lg shadow-glow-gold transition-colors"
        >
          {submitting ? (
            <>
              <Spinner className="w-5 h-5 animate-spin" />
              {t('sorteo.form.submitting', 'Registrando…')}
            </>
          ) : (
            t('sorteo.form.submit', 'Participar gratis')
          )}
        </motion.button>

        <p className="text-[11px] text-clay-500 text-center leading-snug">
          {t('sorteo.form.privacy', 'Participar es gratis. No compartimos tus datos con terceros.')}
        </p>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Panel de tickets + acciones bonus
// ===========================================================================
function TicketPanel({
  token,
  nombre,
  referralCode,
  tickets,
  setTickets,
  igDone,
  fbDone,
  googleDone,
  finalizado,
  setIgDone,
  setFbDone,
  setGoogleDone,
  setFinalizado,
}: {
  token: string;
  nombre: string;
  referralCode: string;
  tickets: number;
  setTickets: (n: number) => void;
  igDone: boolean;
  fbDone: boolean;
  googleDone: boolean;
  finalizado: boolean;
  setIgDone: (b: boolean) => void;
  setFbDone: (b: boolean) => void;
  setGoogleDone: (b: boolean) => void;
  setFinalizado: (b: boolean) => void;
}) {
  const [loading, setLoading] = useState<Action | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useT();

  const referralLink = `${REFERRAL_BASE}${referralCode}`;
  const firstName = (nombre || '').trim().split(/\s+/)[0];

  const doneByAction: Record<Action, boolean> = {
    instagram: igDone,
    facebook: fbDone,
    google: googleDone,
  };
  const setDoneByAction: Record<Action, (b: boolean) => void> = {
    instagram: setIgDone,
    facebook: setFbDone,
    google: setGoogleDone,
  };

  const claim = async (action: Action, targetUrl: string) => {
    if (doneByAction[action] || loading) return;

    setError(null);
    // Abrir el perfil / la reseña en otra pestaña para que completen la acción.
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // UI optimista: marcamos y subimos el contador de inmediato.
    // La reseña de Google suma 2 boletos; las demás 1.
    const delta = SORTEO_TICKET_VALUES[action] ?? 1;
    const prevTickets = tickets;
    setDoneByAction[action](true);
    setTickets(Math.min(tickets + delta, MAX_TICKETS));
    setLoading(action);

    try {
      const res = await fetch('/api/sorteo/accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action_type: action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        // Revertir el optimismo.
        setDoneByAction[action](false);
        setTickets(prevTickets);
        setError(data?.error || t('sorteo.panel.err_action', 'No se pudo registrar tu acción. Intenta de nuevo.'));
        return;
      }
      // Reconciliar con el total real del servidor.
      setTickets(data.tickets ?? Math.min(prevTickets + delta, MAX_TICKETS));
    } catch {
      setDoneByAction[action](false);
      setTickets(prevTickets);
      setError(t('sorteo.panel.err_network', 'Problema de conexión. Intenta de nuevo.'));
    } finally {
      setLoading(null);
    }
  };

  const finalizar = async () => {
    if (finalizado || finishing) return;
    setError(null);
    setFinishing(true);
    // UI optimista: marcamos como finalizado de inmediato.
    setFinalizado(true);
    try {
      const res = await fetch('/api/sorteo/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setFinalizado(false);
        setError(data?.error || t('sorteo.panel.err_finalizar', 'No se pudo finalizar. Intenta de nuevo.'));
      }
    } catch {
      setFinalizado(false);
      setError(t('sorteo.panel.err_network', 'Problema de conexión. Intenta de nuevo.'));
    } finally {
      setFinishing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard puede fallar en algunos navegadores */
    }
  };

  const waText = encodeURIComponent(
    `${t('sorteo.panel.wa_text', '¡Participa gratis en el sorteo de 3 álbumes del Mundial de Car Injury Clinic! ⚽ Regístrate con mi enlace:')} ${referralLink}`,
  );

  const safeTickets = Math.min(tickets, MAX_TICKETS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl border border-clay-200 p-6 sm:p-8"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-moss-100 text-moss-700 flex items-center justify-center mb-3">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-clay-800">
          {firstName
            ? `${t('sorteo.panel.youre_in', '¡Ya estás dentro')}, ${firstName}!`
            : `${t('sorteo.panel.youre_in', '¡Ya estás dentro')}!`}
        </h2>
        <p className="mt-2 text-sm text-clay-600">
          {t('sorteo.panel.sub', 'Tu entrada ya cuenta. Suma más boletos para aumentar tus probabilidades.')}
        </p>
      </div>

      {/* Contador + boletos (4 segmentos) */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-semibold text-clay-700">{t('sorteo.panel.tickets', 'Tus boletos')}</span>
          <span className="text-sm font-bold text-clay-800">
            <span className="text-lg text-moss-700">{safeTickets}</span>
            <span className="text-clay-400">/{MAX_TICKETS}</span>
          </span>
        </div>
        <div className="flex gap-1.5" role="img" aria-label={`${safeTickets}/${MAX_TICKETS}`}>
          {Array.from({ length: MAX_TICKETS }, (_, i) => (
            <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-clay-100">
              <motion.div
                className="h-full rounded-full bg-gold-400"
                initial={false}
                animate={{ scaleX: safeTickets > i ? 1 : 0 }}
                style={{ transformOrigin: 'left' }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.04 }}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {error}
        </div>
      )}

      {finalizado ? (
        <FinalizadoConfirm />
      ) : (
       <>
      {/* Acciones bonus */}
      <div className="space-y-3">
        <ActionButton
          label={t('sorteo.panel.follow_ig', 'Seguir en Instagram')}
          doneLabel={t('sorteo.panel.following_ig', 'Siguiendo en Instagram')}
          done={igDone}
          loading={loading === 'instagram'}
          onClick={() => claim('instagram', IG_URL)}
          className="bg-[#E1306C] hover:bg-[#c72b60] text-white"
          icon={<Instagram className="w-5 h-5" />}
        />
        <ActionButton
          label={t('sorteo.panel.follow_fb', 'Seguir en Facebook')}
          doneLabel={t('sorteo.panel.following_fb', 'Siguiendo en Facebook')}
          done={fbDone}
          loading={loading === 'facebook'}
          onClick={() => claim('facebook', FB_URL)}
          className="bg-[#1877F2] hover:bg-[#1568d6] text-white"
          icon={<Facebook className="w-5 h-5" />}
        />
        <ActionButton
          label={`${t('sorteo.panel.review_google', 'Dejar 5★ en Google')} (+${GOOGLE_TICKETS})`}
          doneLabel={t('sorteo.panel.reviewed_google', '¡Gracias por tu reseña!')}
          done={googleDone}
          loading={loading === 'google'}
          onClick={() => claim('google', GOOGLE_REVIEW_URL)}
          className="bg-[#4285F4] hover:bg-[#3b78e7] text-white"
          icon={<Google className="w-5 h-5" />}
        />

        <button
          type="button"
          onClick={() => setShowReferral((s) => !s)}
          className="w-full inline-flex items-center justify-center gap-2 bg-moss-700 hover:bg-moss-600 text-white font-bold py-3.5 px-5 rounded-lg shadow-soft transition-colors"
        >
          <Gift className="w-5 h-5" />
          {t('sorteo.panel.refer', 'Referir a un amigo')}
        </button>
      </div>

      {/* Caja de referido */}
      <AnimatePresence initial={false}>
        {showReferral && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-clay-200 bg-clay-50 p-4">
              <p className="text-sm text-clay-700 mb-3">
                {t('sorteo.panel.refer_desc', 'Comparte tu enlace. Cuando un amigo se registre, ganas un boleto extra.')}
              </p>
              <div className="flex items-stretch gap-2 mb-3">
                <input
                  readOnly
                  value={referralLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-clay-200 bg-white text-clay-700"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-clay-300 bg-white hover:bg-clay-100 text-clay-700 text-sm font-semibold transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('sorteo.panel.copied', '¡Copiado!') : t('sorteo.panel.copy', 'Copiar')}
                </button>
              </div>
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FB958] text-white font-bold py-3 px-5 rounded-lg shadow-soft transition-colors"
              >
                <WhatsApp className="w-5 h-5" />
                {t('sorteo.panel.share_wa', 'Compartir por WhatsApp')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finalizar registro: avisa al sistema que esta persona ya terminó. */}
      <div className="mt-6 rounded-xl border border-gold-300 bg-gold-50 p-4">
        <p className="mb-3 text-center text-sm font-semibold text-clay-700">
          {t(
            'sorteo.panel.finalizar_aviso',
            '⚠️ ¿Ya terminaste de sumar boletos? Presiona el botón para finalizar y confirmar tu participación.',
          )}
        </p>
        <motion.button
          whileHover={finishing ? undefined : { scale: 1.02 }}
          whileTap={finishing ? undefined : { scale: 0.98 }}
          type="button"
          onClick={finalizar}
          disabled={finishing}
          className="w-full inline-flex items-center justify-center gap-2 bg-clay-800 hover:bg-clay-900 text-white font-bold py-3.5 px-5 rounded-lg shadow-soft transition-colors disabled:opacity-60"
        >
          {finishing ? (
            <>
              <Spinner className="w-5 h-5 animate-spin" />
              {t('sorteo.panel.finalizing', 'Finalizando…')}
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              {t('sorteo.panel.finalizar', 'Finalizar mi registro')}
            </>
          )}
        </motion.button>
      </div>
       </>
      )}

      <p className="mt-6 text-[11px] text-clay-500 text-center leading-snug">
        {t('sorteo.panel.honor_pre', 'Seguir las cuentas funciona por honor. Máximo')} {MAX_TICKETS}{' '}
        {t('sorteo.panel.honor_post', 'boletos por persona. Consulta las')}{' '}
        <a href="/sorteo/bases" className="text-moss-700 underline hover:text-moss-800">
          {t('sorteo.panel.bases', 'bases')}
        </a>
        .
      </p>
    </motion.div>
  );
}

// ===========================================================================
// Subcomponentes
// ===========================================================================
function FinalizadoConfirm() {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-moss-200 bg-moss-50 p-5 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-moss-600 text-white flex items-center justify-center mb-3">
        <Check className="w-7 h-7" />
      </div>
      <p className="font-bold text-moss-800">
        {t('sorteo.panel.finalizado_title', 'Registro finalizado')}
      </p>
      <p className="mt-1 text-sm text-moss-700">
        {t(
          'sorteo.panel.finalizado_sub',
          '¡Gracias! Tu participación quedó registrada con los boletos que sumaste. Mucha suerte. 🍀',
        )}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  doneLabel,
  done,
  loading,
  onClick,
  className,
  icon,
}: {
  label: string;
  doneLabel: string;
  done: boolean;
  loading: boolean;
  onClick: () => void;
  className: string;
  icon: React.ReactNode;
}) {
  if (done) {
    return (
      <div className="w-full inline-flex items-center justify-center gap-2 bg-moss-100 text-moss-700 font-bold py-3.5 px-5 rounded-lg">
        <Check className="w-5 h-5" />
        {doneLabel}
      </div>
    );
  }
  return (
    <motion.button
      whileHover={loading ? undefined : { scale: 1.02 }}
      whileTap={loading ? undefined : { scale: 0.98 }}
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-5 rounded-lg shadow-soft transition-colors disabled:opacity-70 ${className}`}
    >
      {loading ? <Spinner className="w-5 h-5 animate-spin" /> : icon}
      {label}
    </motion.button>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  maxLength?: number;
}

function Field({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: FieldProps) {
  const id = `sorteo-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-clay-700 mb-1.5">
        {label} <span className="text-clay-400 font-normal">*</span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-base rounded-lg border border-clay-200 bg-white focus:outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-200 hover:border-clay-300 transition"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Iconos
// ---------------------------------------------------------------------------
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Check({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Instagram({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Facebook({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Google({ className = '' }: { className?: string }) {
  // "G" multicolor de Google sobre el botón azul.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFFFFF" d="M21.35 11.1H12v3.8h5.35c-.23 1.5-1.6 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95S8.78 7.4 12 7.4c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.78 4.86 14.6 4 12 4 6.98 4 2.9 8.07 2.9 13.1S6.98 22.2 12 22.2c5.78 0 9.6-4.06 9.6-9.78 0-.66-.07-1.16-.25-1.32z" />
    </svg>
  );
}

function WhatsApp({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function Gift({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function Copy({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
