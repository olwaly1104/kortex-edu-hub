
-- =================== ROLES ===================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'admin','estudante','professor','coordenador','decano','reitor',
      'financas','academica','gap','inscricoes'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Allow service_role/edge use: handled by GRANT ALL above.

-- =================== CANDIDATURAS ===================
CREATE TABLE IF NOT EXISTS public.candidaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  curso_pretendido TEXT,
  faculdade TEXT,
  sessao TEXT,
  documentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  pagamento_status TEXT NOT NULL DEFAULT 'pendente',
  estado TEXT NOT NULL DEFAULT 'recebida',
  origem TEXT NOT NULL DEFAULT 'site',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.candidaturas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidaturas TO authenticated;
GRANT ALL ON public.candidaturas TO service_role;

ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit candidatura" ON public.candidaturas;
CREATE POLICY "Anyone can submit candidatura" ON public.candidaturas
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can read candidaturas" ON public.candidaturas;
CREATE POLICY "Staff can read candidaturas" ON public.candidaturas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff can update candidaturas" ON public.candidaturas;
CREATE POLICY "Staff can update candidaturas" ON public.candidaturas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_candidaturas_updated_at ON public.candidaturas;
CREATE TRIGGER update_candidaturas_updated_at
  BEFORE UPDATE ON public.candidaturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
