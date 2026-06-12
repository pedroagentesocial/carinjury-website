-- Sorteo — marca de "registro finalizado" por el participante.
-- Permite que el participante indique que terminó (no hará más acciones),
-- para que el equipo sepa que su participación está cerrada.
--
-- Aplicar en el SQL Editor de Supabase (el entorno no tiene CLI/Docker).

ALTER TABLE participantes
  ADD COLUMN IF NOT EXISTS finalizado     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS finalizado_at  TIMESTAMP WITH TIME ZONE;

-- Refrescar el schema cache de PostgREST.
NOTIFY pgrst, 'reload schema';
