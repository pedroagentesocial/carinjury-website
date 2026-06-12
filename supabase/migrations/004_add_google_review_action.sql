-- Sorteo — boleto extra por reseña de Google (vale por 2 boletos).
-- Amplía el CHECK de acciones.action_type para aceptar 'google'.
-- El UNIQUE(participant_id, action_type) ya garantiza una sola reseña por persona.
--
-- Aplicar en el SQL Editor de Supabase (el entorno no tiene CLI/Docker).

-- Quitar el CHECK existente del action_type (nombre auto-generado por Postgres)
-- de forma robusta, sin asumir el nombre exacto.
DO $$
DECLARE
    v_conname TEXT;
BEGIN
    SELECT con.conname INTO v_conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'acciones'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%action_type%';

    IF v_conname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE acciones DROP CONSTRAINT %I', v_conname);
    END IF;
END $$;

-- Re-crear el CHECK incluyendo 'google'.
ALTER TABLE acciones
    ADD CONSTRAINT acciones_action_type_check
    CHECK (action_type IN ('instagram', 'facebook', 'referido', 'google'));

-- Refrescar el schema cache de PostgREST.
NOTIFY pgrst, 'reload schema';
