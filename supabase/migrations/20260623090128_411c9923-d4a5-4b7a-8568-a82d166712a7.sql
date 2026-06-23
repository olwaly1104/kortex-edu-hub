CREATE TABLE public.fin_despesa_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cor text NOT NULL DEFAULT 'bg-slate-100 text-slate-700 border-slate-200',
  documentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_despesa_categorias TO authenticated;
GRANT ALL ON public.fin_despesa_categorias TO service_role;

ALTER TABLE public.fin_despesa_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read" ON public.fin_despesa_categorias
  FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE POLICY "owner can insert" ON public.fin_despesa_categorias
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = public.current_institution_id());

CREATE POLICY "owner can update" ON public.fin_despesa_categorias
  FOR UPDATE TO authenticated
  USING (owner_user_id = public.current_institution_id())
  WITH CHECK (owner_user_id = public.current_institution_id());

CREATE POLICY "owner can delete" ON public.fin_despesa_categorias
  FOR DELETE TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER fin_despesa_categorias_set_updated_at
  BEFORE UPDATE ON public.fin_despesa_categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();