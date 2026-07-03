
CREATE TABLE public.candidaturas_janela (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid,
  owner_user_id uuid NOT NULL,
  ano_letivo text NOT NULL,
  inicio date NOT NULL,
  fim date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, ano_letivo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidaturas_janela TO authenticated;
GRANT ALL ON public.candidaturas_janela TO service_role;

ALTER TABLE public.candidaturas_janela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution can view candidaturas_janela"
  ON public.candidaturas_janela FOR SELECT
  USING (institution_id = public.current_institution_id());

CREATE POLICY "Admin/academica manage candidaturas_janela"
  ON public.candidaturas_janela FOR ALL
  USING (institution_id = public.current_institution_id()
         AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica')))
  WITH CHECK (institution_id = public.current_institution_id()
              AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica')));

CREATE OR REPLACE FUNCTION public.set_candidaturas_janela_institution()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := COALESCE(
      (SELECT institution_id FROM public.profiles WHERE id = NEW.owner_user_id),
      NEW.owner_user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_candidaturas_janela_institution_trg
  BEFORE INSERT ON public.candidaturas_janela
  FOR EACH ROW EXECUTE FUNCTION public.set_candidaturas_janela_institution();

CREATE TRIGGER update_candidaturas_janela_updated_at
  BEFORE UPDATE ON public.candidaturas_janela
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
