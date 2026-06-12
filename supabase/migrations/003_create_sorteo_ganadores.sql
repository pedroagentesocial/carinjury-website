-- Sistema de Sorteo - Ganadores
-- Persiste el resultado del sorteo (ganadores, suplentes, descalificados).
-- El estado "verified" de cada acción vive en acciones.verified (migración 002).
-- Acceso exclusivo vía service_role (RLS activo, sin políticas para anon).

CREATE TABLE sorteo_ganadores (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    -- Slot del premio (1..3). Un slot puede tener varias filas históricas
    -- (un descalificado + su reemplazo); el ganador vigente es el no descalificado.
    posicion       INTEGER NOT NULL,
    estado         TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente', 'confirmado', 'descalificado')),
    drawn_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- El ganador tiene 30 días para reclamar (Utah).
    claim_deadline TIMESTAMP WITH TIME ZONE,
    notas          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sorteo_ganadores_estado      ON sorteo_ganadores(estado);
CREATE INDEX idx_sorteo_ganadores_participant ON sorteo_ganadores(participant_id);

-- RLS: solo service_role, nada desde anon.
ALTER TABLE sorteo_ganadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorteo_ganadores FORCE ROW LEVEL SECURITY;

REVOKE ALL ON sorteo_ganadores FROM anon, authenticated, PUBLIC;
GRANT ALL PRIVILEGES ON sorteo_ganadores TO service_role;
