
CREATE TABLE public.departamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  sigla text NOT NULL,
  designacao text NOT NULL,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.departamentos TO authenticated;
GRANT ALL ON public.departamentos TO service_role;

ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own departamentos"
  ON public.departamentos FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read departamentos"
  ON public.departamentos FOR SELECT
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER trg_departamentos_updated_at
  BEFORE UPDATE ON public.departamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
