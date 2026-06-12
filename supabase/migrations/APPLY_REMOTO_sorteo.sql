-- =====================================================================
-- APLICAR EN EL SQL EDITOR DE SUPABASE (proyecto remoto)
-- Recreado COMPLETO del sorteo: combina migraciones 002 + 003 + 004 + 005.
-- Incluye action_type 'google' (reseña, +2) y las columnas finalizado /
-- finalizado_at. Es DESTRUCTIVO: borra y recrea las 3 tablas del sorteo,
-- así que solo correr cuando estén vacías. Refresca el schema cache.
-- NO toca rates/states (migración 001).
-- =====================================================================

-- Limpieza segura (en orden inverso por las FKs).
DROP TABLE IF EXISTS sorteo_ganadores CASCADE;
DROP TABLE IF EXISTS acciones        CASCADE;
DROP TABLE IF EXISTS participantes   CASCADE;

-- ============================================================
-- Funciones de normalización (IMMUTABLE para columnas generadas)
-- ============================================================
CREATE OR REPLACE FUNCTION normalize_email(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_email  TEXT;
    v_local  TEXT;
    v_domain TEXT;
BEGIN
    IF p_email IS NULL THEN
        RETURN NULL;
    END IF;

    v_email  := lower(btrim(p_email));
    v_local  := split_part(v_email, '@', 1);
    v_domain := split_part(v_email, '@', 2);

    IF v_domain = '' THEN
        RETURN v_email;
    END IF;

    v_local := split_part(v_local, '+', 1);

    IF v_domain IN ('gmail.com', 'googlemail.com') THEN
        v_local  := replace(v_local, '.', '');
        v_domain := 'gmail.com';
    END IF;

    RETURN v_local || '@' || v_domain;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_phone_e164(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_digits TEXT;
    v_has_plus BOOLEAN;
BEGIN
    IF p_phone IS NULL THEN
        RETURN NULL;
    END IF;

    v_has_plus := left(btrim(p_phone), 1) = '+';
    v_digits   := regexp_replace(p_phone, '[^0-9]', '', 'g');

    IF v_digits = '' THEN
        RETURN NULL;
    END IF;

    IF v_has_plus THEN
        RETURN '+' || v_digits;
    END IF;

    IF length(v_digits) = 10 THEN
        RETURN '+1' || v_digits;
    ELSIF length(v_digits) = 11 AND left(v_digits, 1) = '1' THEN
        RETURN '+' || v_digits;
    END IF;

    RETURN '+' || v_digits;
END;
$$;

-- ============================================================
-- Tabla: participantes
-- ============================================================
CREATE TABLE participantes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        TEXT,
    telefono      TEXT,
    telefono_e164 TEXT GENERATED ALWAYS AS (normalize_phone_e164(telefono)) STORED,
    email         TEXT,
    email_norm    TEXT GENERATED ALWAYS AS (normalize_email(email)) STORED,
    consent       BOOLEAN NOT NULL DEFAULT false,
    referral_code TEXT NOT NULL DEFAULT upper(substr(md5(gen_random_uuid()::TEXT), 1, 8)),
    referido_por  UUID REFERENCES participantes(id),
    ig_handle     TEXT,
    fb_handle     TEXT,
    ip_hash       TEXT,
    finalizado    BOOLEAN NOT NULL DEFAULT false,
    finalizado_at TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT participantes_telefono_e164_key UNIQUE (telefono_e164),
    CONSTRAINT participantes_email_norm_key    UNIQUE (email_norm),
    CONSTRAINT participantes_referral_code_key UNIQUE (referral_code)
);

CREATE INDEX idx_participantes_referido_por ON participantes(referido_por);
CREATE INDEX idx_participantes_created_at   ON participantes(created_at DESC);

-- ============================================================
-- Tabla: acciones
-- ============================================================
CREATE TABLE acciones (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    action_type    TEXT NOT NULL CHECK (action_type IN ('instagram', 'facebook', 'referido', 'google')),
    ticket_value   INTEGER NOT NULL DEFAULT 1,
    verified       BOOLEAN DEFAULT false,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT acciones_participant_action_key UNIQUE (participant_id, action_type)
);

CREATE INDEX idx_acciones_participant_id ON acciones(participant_id);

-- ============================================================
-- Tabla: sorteo_ganadores
-- ============================================================
CREATE TABLE sorteo_ganadores (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    posicion       INTEGER NOT NULL,
    estado         TEXT NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente', 'confirmado', 'descalificado')),
    drawn_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    claim_deadline TIMESTAMP WITH TIME ZONE,
    notas          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sorteo_ganadores_estado      ON sorteo_ganadores(estado);
CREATE INDEX idx_sorteo_ganadores_participant ON sorteo_ganadores(participant_id);

-- ============================================================
-- Row Level Security: solo service_role
-- ============================================================
ALTER TABLE participantes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorteo_ganadores ENABLE ROW LEVEL SECURITY;

ALTER TABLE participantes    FORCE ROW LEVEL SECURITY;
ALTER TABLE acciones         FORCE ROW LEVEL SECURITY;
ALTER TABLE sorteo_ganadores FORCE ROW LEVEL SECURITY;

REVOKE ALL ON participantes    FROM anon, authenticated, PUBLIC;
REVOKE ALL ON acciones         FROM anon, authenticated, PUBLIC;
REVOKE ALL ON sorteo_ganadores FROM anon, authenticated, PUBLIC;

GRANT ALL PRIVILEGES ON participantes    TO service_role;
GRANT ALL PRIVILEGES ON acciones         TO service_role;
GRANT ALL PRIVILEGES ON sorteo_ganadores TO service_role;

-- Refrescar el schema cache de PostgREST.
NOTIFY pgrst, 'reload schema';
