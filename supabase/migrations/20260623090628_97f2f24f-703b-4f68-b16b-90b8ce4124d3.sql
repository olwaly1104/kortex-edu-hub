CREATE OR REPLACE FUNCTION public.set_institution_fiscal(_nome_legal text, _nif text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inst uuid := public.current_institution_id();
BEGIN
  IF inst IS NULL THEN
    RAISE EXCEPTION 'No institution context';
  END IF;
  UPDATE public.profiles
     SET nome_legal = COALESCE(NULLIF(btrim(_nome_legal), ''), nome_legal),
         nif        = COALESCE(NULLIF(btrim(_nif), ''), nif)
   WHERE id = inst;
END;
$$;

REVOKE ALL ON FUNCTION public.set_institution_fiscal(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_institution_fiscal(text, text) TO authenticated;