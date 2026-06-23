ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nome_legal text,
  ADD COLUMN IF NOT EXISTS nif text;

CREATE OR REPLACE FUNCTION public.get_institution_fiscal()
RETURNS TABLE(nome_legal text, nif text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.nome_legal, p.nif
  FROM public.profiles p
  WHERE p.id = public.current_institution_id()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_institution_fiscal() TO authenticated;