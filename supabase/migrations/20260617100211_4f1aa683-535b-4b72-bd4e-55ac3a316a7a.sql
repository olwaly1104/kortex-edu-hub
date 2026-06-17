
CREATE TABLE public.cadeiras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ano integer NOT NULL,
  name text NOT NULL,
  docente text,
  ects numeric NOT NULL DEFAULT 6,
  semestre text NOT NULL DEFAULT '1',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cadeiras TO authenticated;
GRANT ALL ON public.cadeiras TO service_role;

ALTER TABLE public.cadeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own cadeiras" ON public.cadeiras
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read cadeiras" ON public.cadeiras
  FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_cadeiras_updated_at
  BEFORE UPDATE ON public.cadeiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cadeiras_curso ON public.cadeiras(curso_id, ano, ordem);
