
-- 1. module_settings
CREATE TABLE IF NOT EXISTS public.module_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  modulo text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, modulo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_settings TO authenticated;
GRANT ALL ON public.module_settings TO service_role;
ALTER TABLE public.module_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage module_settings" ON public.module_settings;
CREATE POLICY "Admins manage module_settings" ON public.module_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) AND institution_id = public.current_institution_id())
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND institution_id = public.current_institution_id());
DROP POLICY IF EXISTS "Members read module_settings" ON public.module_settings;
CREATE POLICY "Members read module_settings" ON public.module_settings
  FOR SELECT TO authenticated
  USING (institution_id = public.current_institution_id());
DROP TRIGGER IF EXISTS update_module_settings_updated_at ON public.module_settings;
CREATE TRIGGER update_module_settings_updated_at BEFORE UPDATE ON public.module_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. candidaturas.institution_id
ALTER TABLE public.candidaturas ADD COLUMN IF NOT EXISTS institution_id uuid;
CREATE INDEX IF NOT EXISTS candidaturas_institution_id_idx ON public.candidaturas (institution_id);

-- Add gap to staff policies
DROP POLICY IF EXISTS "Staff can read candidaturas" ON public.candidaturas;
CREATE POLICY "Staff can read candidaturas" ON public.candidaturas
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'academica'::app_role)
    OR public.has_role(auth.uid(), 'inscricoes'::app_role)
    OR public.has_role(auth.uid(), 'gap'::app_role)
  );

DROP POLICY IF EXISTS "Staff can update candidaturas" ON public.candidaturas;
CREATE POLICY "Staff can update candidaturas" ON public.candidaturas
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'academica'::app_role)
    OR public.has_role(auth.uid(), 'inscricoes'::app_role)
    OR public.has_role(auth.uid(), 'gap'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'academica'::app_role)
    OR public.has_role(auth.uid(), 'inscricoes'::app_role)
    OR public.has_role(auth.uid(), 'gap'::app_role)
  );

-- 3. list_institution_contacts
CREATE OR REPLACE FUNCTION public.list_institution_contacts()
RETURNS TABLE (id uuid, display_name text, email text, modulo text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    p.email,
    (SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id ORDER BY ur.created_at ASC LIMIT 1) AS modulo
  FROM public.profiles p
  WHERE p.institution_id = public.current_institution_id()
    AND p.id <> auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.list_institution_contacts() TO authenticated;
