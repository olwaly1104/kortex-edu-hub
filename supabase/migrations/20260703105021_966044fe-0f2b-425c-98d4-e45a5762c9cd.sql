
CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL DEFAULT auth.uid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  ano text NOT NULL,
  letra text NOT NULL,
  sala text,
  turno text,
  capacidade integer NOT NULL DEFAULT 32,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (curso_id, ano, letra)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own turmas"
  ON public.turmas FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_turmas_curso_ano ON public.turmas(curso_id, ano);
