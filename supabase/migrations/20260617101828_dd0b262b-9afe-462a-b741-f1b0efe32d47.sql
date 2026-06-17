
CREATE TABLE public.estudantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ano TEXT NOT NULL DEFAULT '1',
  turma TEXT NOT NULL DEFAULT 'A',
  origem TEXT NOT NULL DEFAULT 'novo',
  primeiro_nome TEXT,
  ultimo_nome TEXT,
  nascimento DATE,
  genero TEXT,
  nacionalidade TEXT,
  bilhete TEXT,
  telemovel TEXT,
  provincia TEXT,
  municipio TEXT,
  endereco TEXT,
  enc_nome TEXT,
  enc_parentesco TEXT,
  enc_telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudantes TO authenticated;
GRANT ALL ON public.estudantes TO service_role;

ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own estudantes"
  ON public.estudantes FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution members can read estudantes"
  ON public.estudantes FOR SELECT
  TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_estudantes_updated_at
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_estudantes_owner ON public.estudantes(owner_user_id);
CREATE INDEX idx_estudantes_curso ON public.estudantes(curso_id);
