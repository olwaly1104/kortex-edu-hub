
CREATE TABLE public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'geral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anuncios TO authenticated;
GRANT ALL ON public.anuncios TO service_role;

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anuncios_select_same_institution"
  ON public.anuncios FOR SELECT
  TO authenticated
  USING (institution_id = public.current_institution_id());

CREATE POLICY "anuncios_insert_self"
  ON public.anuncios FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "anuncios_update_own"
  ON public.anuncios FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "anuncios_delete_own"
  ON public.anuncios FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_anuncios_institution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := COALESCE(
      (SELECT institution_id FROM public.profiles WHERE id = NEW.owner_user_id),
      NEW.owner_user_id
    );
  END IF;
  IF NEW.author IS NULL OR btrim(NEW.author) = '' THEN
    NEW.author := (SELECT display_name FROM public.profiles WHERE id = NEW.owner_user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_anuncios_set_institution
  BEFORE INSERT ON public.anuncios
  FOR EACH ROW EXECUTE FUNCTION public.set_anuncios_institution();

CREATE TRIGGER trg_anuncios_updated_at
  BEFORE UPDATE ON public.anuncios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_anuncios_institution_created ON public.anuncios (institution_id, created_at DESC);
