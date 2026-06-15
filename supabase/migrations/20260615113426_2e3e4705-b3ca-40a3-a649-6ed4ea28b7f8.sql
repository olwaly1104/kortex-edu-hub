-- ============================================================
-- 1) Profiles: institution_id link to the admin who owns them
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_institution_id_idx ON public.profiles(institution_id);

-- Helper: returns the institution_id (admin owner) for a given user.
-- For admins, institution_id is their own user_id; for staff/students, it is the admin who created them.
CREATE OR REPLACE FUNCTION public.current_institution_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT institution_id FROM public.profiles WHERE id = auth.uid()),
    CASE WHEN public.has_role(auth.uid(), 'admin') THEN auth.uid() ELSE NULL END
  )
$$;

REVOKE EXECUTE ON FUNCTION public.current_institution_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_institution_id() TO authenticated;

-- ============================================================
-- 2) Faculdades
-- ============================================================
CREATE TABLE public.faculdades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  decano TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculdades TO authenticated;
GRANT ALL ON public.faculdades TO service_role;

ALTER TABLE public.faculdades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own faculdades"
  ON public.faculdades FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read faculdades"
  ON public.faculdades FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_faculdades_updated_at
  BEFORE UPDATE ON public.faculdades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3) Cursos
-- ============================================================
CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculdade_id UUID NOT NULL REFERENCES public.faculdades(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  years INT NOT NULL DEFAULT 4,
  estudantes_esperados INT NOT NULL DEFAULT 0,
  coordenador TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursos TO authenticated;
GRANT ALL ON public.cursos TO service_role;

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own cursos"
  ON public.cursos FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read cursos"
  ON public.cursos FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4) Propinas (one per curso, auto-created at 0)
-- ============================================================
CREATE TABLE public.propinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL UNIQUE REFERENCES public.cursos(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_mensal NUMERIC NOT NULL DEFAULT 0,
  imposto NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.propinas TO authenticated;
GRANT ALL ON public.propinas TO service_role;

ALTER TABLE public.propinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own propinas"
  ON public.propinas FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read propinas"
  ON public.propinas FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_propinas_updated_at
  BEFORE UPDATE ON public.propinas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-seed a propina row for every new curso
CREATE OR REPLACE FUNCTION public.create_default_propina()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.propinas (curso_id, owner_user_id, valor_mensal, imposto)
  VALUES (NEW.id, NEW.owner_user_id, 0, 0)
  ON CONFLICT (curso_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_propina_after_curso
  AFTER INSERT ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.create_default_propina();

-- ============================================================
-- 5) Admins can manage their own user_roles entries
--    (needed so the signup flow / edge function setup keeps working)
-- ============================================================
DROP POLICY IF EXISTS "Admins manage institution roles" ON public.user_roles;
CREATE POLICY "Admins manage institution roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));