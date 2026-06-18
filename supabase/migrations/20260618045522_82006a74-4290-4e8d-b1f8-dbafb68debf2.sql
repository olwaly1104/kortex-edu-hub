ALTER TABLE public.estudantes
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS bilhete_url text,
  ADD COLUMN IF NOT EXISTS certificado_url text;