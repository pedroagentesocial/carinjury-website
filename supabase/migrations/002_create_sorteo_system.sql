-- Sistema de Sorteo - Migración Inicial
-- Crea las tablas de participantes y acciones del sorteo.
-- Acceso exclusivo vía service_role (RLS activo, sin políticas para anon).

-- ============================================================
-- Funciones de normalización (IMMUTABLE para columnas generadas)
-- ============================================================

-- Normaliza un email: minúsculas, recorta espacios, elimina el alias +,
-- y para gmail/googlemail elimina los puntos del local-part y unifica el dominio.
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

    -- Sin @ válido: devolver tal cual normalizado en minúsculas.
    IF v_domain = '' THEN
        RETURN v_email;
    END IF;

    -- Eliminar alias +sufijo del local-part.
    v_local := split_part(v_local, '+', 1);

    -- Gmail/Googlemail: los puntos son irrelevantes y comparten dominio.
    IF v_domain IN ('gmail.com', 'googlemail.com') THEN
        v_local  := replace(v_local, '.', '');
        v_domain := 'gmail.com';
    END IF;

    RETURN v_local || '@' || v_domain;
END;
$$;

-- Normaliza un teléfono a formato E.164 (proyecto orientado a EE. UU.).
-- Conserva el código de país si viene con +; asume +1 para 10 dígitos.
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

    -- Ya trae código de país explícito.
    IF v_has_plus THEN
        RETURN '+' || v_digits;
    END IF;

    -- Heurística EE. UU.
    IF length(v_digits) = 10 THEN
        RETURN '+1' || v_digits;
    ELSIF length(v_digits) = 11 AND left(v_digits, 1) = '1' THEN
        RETURN '+' || v_digits;
    END IF;

    -- Otros casos: anteponer + sin asumir país.
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
    -- Columna normalizada a E.164 que porta la restricción de unicidad.
    telefono_e164 TEXT GENERATED ALWAYS AS (normalize_phone_e164(telefono)) STORED,
    email         TEXT,
    -- Columna normalizada (minúsculas, sin alias + ni puntos de gmail) con unicidad.
    email_norm    TEXT GENERATED ALWAYS AS (normalize_email(email)) STORED,
    consent       BOOLEAN NOT NULL DEFAULT false,
    referral_code TEXT NOT NULL DEFAULT upper(substr(md5(gen_random_uuid()::TEXT), 1, 8)),
    referido_por  UUID REFERENCES participantes(id),
    ig_handle     TEXT,
    fb_handle     TEXT,
    ip_hash       TEXT,
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
    action_type    TEXT NOT NULL CHECK (action_type IN ('instagram', 'facebook', 'referido')),
    ticket_value   INTEGER NOT NULL DEFAULT 1,
    verified       BOOLEAN DEFAULT false,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT acciones_participant_action_key UNIQUE (participant_id, action_type)
);

CREATE INDEX idx_acciones_participant_id ON acciones(participant_id);

-- ============================================================
-- Row Level Security: solo service_role, nada desde anon
-- ============================================================
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones      ENABLE ROW LEVEL SECURITY;

-- Forzar RLS también para el owner de la tabla (defensa en profundidad).
ALTER TABLE participantes FORCE ROW LEVEL SECURITY;
ALTER TABLE acciones      FORCE ROW LEVEL SECURITY;

-- Sin políticas para anon/authenticated => sin acceso.
-- service_role posee BYPASSRLS, por lo que opera con plenos privilegios.

-- Revocar cualquier grant heredado de PUBLIC/anon/authenticated.
REVOKE ALL ON participantes FROM anon, authenticated, PUBLIC;
REVOKE ALL ON acciones      FROM anon, authenticated, PUBLIC;

-- Acceso explícito solo para service_role.
GRANT ALL PRIVILEGES ON participantes TO service_role;
GRANT ALL PRIVILEGES ON acciones      TO service_role;
