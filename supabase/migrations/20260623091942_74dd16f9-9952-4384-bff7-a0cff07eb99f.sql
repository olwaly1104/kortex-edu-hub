-- Real database storage for institutional docentes and staff
CREATE TABLE IF NOT EXISTS public.docentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prefixo TEXT,
  primeiro_nome TEXT NOT NULL,
  ultimo_nome TEXT NOT NULL,
  email TEXT,
  contacto TEXT,
  faculdade TEXT,
  departamento TEXT,
  categoria TEXT,
  cargo TEXT,
  nascimento TEXT,
  genero TEXT,
  bilhete TEXT,
  bilhete_file_name TEXT,
  foto_data_url TEXT,
  provincia TEXT,
  municipio TEXT,
  endereco TEXT,
  contrato TEXT,
  grau TEXT,
  especialidade TEXT,
  instituicao_formacao TEXT,
  anos_experiencia TEXT,
  cv_file_name TEXT,
  diploma_file_name TEXT,
  modulo_kortex TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.docentes TO authenticated;
GRANT ALL ON public.docentes TO service_role;

ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own docentes"
  ON public.docentes FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read docentes"
  ON public.docentes FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_docentes_updated_at
  BEFORE UPDATE ON public.docentes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX docentes_owner_idx ON public.docentes(owner_user_id);

-- Staff
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prefixo TEXT,
  primeiro_nome TEXT NOT NULL,
  ultimo_nome TEXT NOT NULL,
  email TEXT,
  contacto TEXT,
  departamento TEXT,
  funcao TEXT,
  modulo_kortex TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own staff"
  ON public.staff FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read staff"
  ON public.staff FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX staff_owner_idx ON public.staff(owner_user_id);