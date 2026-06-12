import { useEffect, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface ActionInfo {
  action_type: 'instagram' | 'facebook' | 'referido' | 'google';
  verified: boolean;
  ticket_value: number;
}
interface Participant {
  id: string;
  nombre: string;
  email: string;
  ig_handle: string;
  fb_handle: string;
  total_tickets: number;
  actions: ActionInfo[];
}
interface Winner {
  participant_id: string;
  posicion: number;
  estado: 'pendiente' | 'confirmado';
  drawn_at: string;
  claim_deadline: string | null;
  nombre: string;
  email: string;
  ig_handle: string;
  fb_handle: string;
  total_tickets: number;
  actions: ActionInfo[];
}
interface Disq {
  participant_id: string;
  posicion: number;
  nombre: string;
}
interface AdminData {
  participants: Participant[];
  winners: Winner[];
  disqualified: Disq[];
  totalParticipants: number;
}

const API = '/api/admin/sorteo';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-US', {
      timeZone: 'America/Denver',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function AdminSorteo() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = cargando
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // etiqueta de acción en curso

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API}/data`, { headers: { Accept: 'application/json' } });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setError(json.error || 'No se pudo cargar la información.');
      return;
    }
    setAuthed(true);
    setData(json);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (authed === null) {
    return <div className="text-center text-clay-500 py-20">Cargando…</div>;
  }
  if (!authed) {
    return <LoginGate onSuccess={refresh} />;
  }

  // ---- Acciones del panel ----
  const post = async (path: string, body: unknown, label: string) => {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch(`${API}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAuthed(false);
        return { ok: false };
      }
      if (!res.ok || !json.success) {
        setError(json.error || 'La operación falló.');
        return { ok: false, json };
      }
      if (json.warning) setError(json.warning);
      await refresh();
      return { ok: true, json };
    } catch {
      setError('Problema de conexión.');
      return { ok: false };
    } finally {
      setBusy(null);
    }
  };

  const sortear = async () => {
    const hasConfirmed = data?.winners.some((w) => w.estado === 'confirmado');
    const msg = hasConfirmed
      ? 'Ya hay ganadores confirmados. ¿Reemplazar TODO el sorteo? Esta acción no se puede deshacer.'
      : '¿Sortear 3 ganadores? Esto reemplaza cualquier sorteo previo.';
    if (!window.confirm(msg)) return;
    await post('draw', { mode: 'draw', force: hasConfirmed }, 'draw');
  };

  const descalificar = async (w: Winner) => {
    if (
      !window.confirm(
        `Descalificar a ${w.nombre} (puesto ${w.posicion}) y sacar un suplente al azar del mismo pool. ¿Continuar?`,
      )
    )
      return;
    await post('draw', { mode: 'redraw', participantId: w.participant_id }, `redraw-${w.participant_id}`);
  };

  const confirmar = async (w: Winner) => {
    await post('verify', { op: 'confirm', participantId: w.participant_id }, `confirm-${w.participant_id}`);
  };

  const toggleVerified = async (participantId: string, action_type: string, verified: boolean) => {
    await post('verify', { op: 'action', participantId, action_type, verified }, `v-${participantId}-${action_type}`);
  };

  return (
    <div className="space-y-10">
      {error && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ====================== GANADORES ====================== */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-clay-800">
            Ganadores {data && <span className="text-clay-400 font-normal">({data.winners.length})</span>}
          </h2>
          <button
            type="button"
            onClick={sortear}
            disabled={busy === 'draw'}
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 disabled:opacity-60 text-clay-900 font-bold px-5 py-2.5 rounded-lg shadow-glow-gold transition-colors"
          >
            {busy === 'draw' ? 'Sorteando…' : 'Sortear ganadores'}
          </button>
        </div>

        <div className="rounded-lg bg-clay-100 border border-clay-200 px-4 py-3 text-sm text-clay-700 mb-5">
          ⏳ Recordatorio: cada ganador tiene <strong>30 días para reclamar</strong> su premio (Utah).
        </div>

        {!data || data.winners.length === 0 ? (
          <p className="text-clay-500 text-sm">Aún no hay ganadores. Usa “Sortear ganadores”.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {data.winners
              .slice()
              .sort((a, b) => a.posicion - b.posicion)
              .map((w) => (
                <WinnerCard
                  key={w.participant_id}
                  w={w}
                  busy={busy}
                  onToggleVerified={toggleVerified}
                  onConfirm={() => confirmar(w)}
                  onDisqualify={() => descalificar(w)}
                />
              ))}
          </div>
        )}

        {data && data.disqualified.length > 0 && (
          <p className="mt-4 text-xs text-clay-500">
            Descalificados: {data.disqualified.map((d) => `${d.nombre} (#${d.posicion})`).join(', ')}
          </p>
        )}
      </section>

      {/* ====================== PARTICIPANTES ====================== */}
      <section>
        <h2 className="text-xl font-bold text-clay-800 mb-4">
          Participantes {data && <span className="text-clay-400 font-normal">({data.totalParticipants})</span>}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-clay-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-clay-50 text-clay-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold text-center">Tickets</th>
                <th className="px-4 py-3 font-semibold">Instagram</th>
                <th className="px-4 py-3 font-semibold">Facebook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-100">
              {data?.participants.map((p) => (
                <tr key={p.id} className="hover:bg-clay-50/60">
                  <td className="px-4 py-3 text-clay-800">{p.nombre || '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-clay-800">{p.total_tickets}</td>
                  <td className="px-4 py-3">
                    <ActionCell action={p.actions.find((a) => a.action_type === 'instagram')} handle={p.ig_handle} />
                  </td>
                  <td className="px-4 py-3">
                    <ActionCell action={p.actions.find((a) => a.action_type === 'facebook')} handle={p.fb_handle} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Celda de acción en la tabla de participantes
// ---------------------------------------------------------------------------
function ActionCell({ action, handle }: { action?: ActionInfo; handle?: string }) {
  if (!action) return <span className="text-clay-300">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block w-2 h-2 rounded-full ${action.verified ? 'bg-moss-500' : 'bg-gold-400'}`}
        title={action.verified ? 'Verificado' : 'Reclamado, sin verificar'}
      />
      <span className="text-clay-600">{handle ? `@${handle}` : 'reclamado'}</span>
      <span className={`text-[11px] font-semibold ${action.verified ? 'text-moss-600' : 'text-clay-400'}`}>
        {action.verified ? 'verificado' : 'pendiente'}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de ganador
// ---------------------------------------------------------------------------
function WinnerCard({
  w,
  busy,
  onToggleVerified,
  onConfirm,
  onDisqualify,
}: {
  w: Winner;
  busy: string | null;
  onToggleVerified: (participantId: string, action_type: string, verified: boolean) => void;
  onConfirm: () => void;
  onDisqualify: () => void;
}) {
  const claimed = w.actions.filter(
    (a) => a.action_type === 'instagram' || a.action_type === 'facebook' || a.action_type === 'google',
  );
  return (
    <div
      className={`rounded-xl border p-4 ${
        w.estado === 'confirmado' ? 'border-moss-300 bg-moss-50' : 'border-clay-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-clay-500">Puesto {w.posicion}</span>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            w.estado === 'confirmado' ? 'bg-moss-600 text-white' : 'bg-gold-100 text-gold-800'
          }`}
        >
          {w.estado}
        </span>
      </div>

      <h3 className="text-lg font-bold text-clay-800">{w.nombre}</h3>
      <p className="text-xs text-clay-500 break-all">{w.email}</p>
      <p className="text-sm text-clay-700 mt-1">
        {w.total_tickets} ticket{w.total_tickets === 1 ? '' : 's'}
      </p>

      {/* Handles */}
      <div className="mt-2 text-sm text-clay-700 space-y-0.5">
        <div>Instagram: {w.ig_handle ? <span className="font-medium">@{w.ig_handle}</span> : <span className="text-clay-400">—</span>}</div>
        <div>Facebook: {w.fb_handle ? <span className="font-medium">@{w.fb_handle}</span> : <span className="text-clay-400">—</span>}</div>
      </div>

      {/* Acciones reclamadas con checkbox Verificado */}
      <div className="mt-3 border-t border-clay-100 pt-3 space-y-2">
        <p className="text-xs font-semibold text-clay-600">Acciones reclamadas</p>
        {claimed.length === 0 ? (
          <p className="text-xs text-clay-400">Sin acciones bonus (solo ticket base).</p>
        ) : (
          claimed.map((a) => {
            const label = `v-${w.participant_id}-${a.action_type}`;
            return (
              <label key={a.action_type} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.verified}
                  disabled={busy === label}
                  onChange={(e) => onToggleVerified(w.participant_id, a.action_type, e.target.checked)}
                  className="w-4 h-4 rounded border-clay-300 text-moss-700 focus:ring-2 focus:ring-moss-500 cursor-pointer"
                />
                <span className="capitalize text-clay-700">{a.action_type}</span>
                <span className="text-xs text-clay-400">verificado</span>
              </label>
            );
          })
        )}
      </div>

      {/* Deadline */}
      <p className="mt-3 text-[11px] text-clay-500">
        Reclama antes de: <strong>{fmtDate(w.claim_deadline)}</strong>
      </p>

      {/* Botones */}
      <div className="mt-3 flex flex-col gap-2">
        {w.estado !== 'confirmado' && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy === `confirm-${w.participant_id}`}
            className="w-full text-sm font-bold bg-moss-700 hover:bg-moss-600 disabled:opacity-60 text-white py-2 rounded-lg transition-colors"
          >
            {busy === `confirm-${w.participant_id}` ? 'Confirmando…' : 'Confirmar ganador'}
          </button>
        )}
        <button
          type="button"
          onClick={onDisqualify}
          disabled={busy === `redraw-${w.participant_id}`}
          className="w-full text-sm font-semibold border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 py-2 rounded-lg transition-colors"
        >
          {busy === `redraw-${w.participant_id}` ? 'Sorteando suplente…' : 'Descalificar y volver a sortear'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login gate
// ---------------------------------------------------------------------------
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error || 'No se pudo iniciar sesión.');
        setSubmitting(false);
        return;
      }
      onSuccess();
    } catch {
      setError('Problema de conexión.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-clay-200 p-6 sm:p-8">
      <h1 className="text-xl font-bold text-clay-800 text-center mb-1">Panel del sorteo</h1>
      <p className="text-sm text-clay-500 text-center mb-5">Acceso restringido</p>
      <div className="space-y-3">
        <input
          type="password"
          value={secret}
          autoFocus
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && secret && !submitting) submit();
          }}
          placeholder="Secreto de administrador"
          className="w-full px-4 py-3 rounded-lg border border-clay-200 bg-white focus:outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-200"
        />
        {error && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!secret || submitting}
          className="w-full bg-clay-700 hover:bg-clay-800 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
