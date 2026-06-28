CREATE TABLE public.fin_solicitacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL,
  ref text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('recebida','enviada')),
  type text NOT NULL,
  title text NOT NULL,
  description text,
  requester_user_id uuid NOT NULL,
  requester_name text,
  requester_role text,
  requester_matricula text,
  destinatario text,
  destinatario_user_id uuid,
  responsavel text,
  valor numeric,
  prazo_de date,
  prazo_ate date,
  due_date date,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','atrasado','em_execucao','executada','rejeitado')),
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  historico jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fin_solicitacoes_institution_idx ON public.fin_solicitacoes(institution_id);
CREATE INDEX fin_solicitacoes_requester_idx   ON public.fin_solicitacoes(requester_user_id);
CREATE INDEX fin_solicitacoes_destin_idx      ON public.fin_solicitacoes(destinatario_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_solicitacoes TO authenticated;
GRANT ALL ON public.fin_solicitacoes TO service_role;

ALTER TABLE public.fin_solicitacoes ENABLE ROW LEVEL SECURITY;

-- Finance/admin staff see and manage everything in their institution
CREATE POLICY "fin_admin_select_all" ON public.fin_solicitacoes
  FOR SELECT TO authenticated
  USING (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financas'))
  );

CREATE POLICY "fin_admin_manage_all" ON public.fin_solicitacoes
  FOR ALL TO authenticated
  USING (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financas'))
  )
  WITH CHECK (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'financas'))
  );

-- Users see their own (sent or addressed to them)
CREATE POLICY "fin_owner_select" ON public.fin_solicitacoes
  FOR SELECT TO authenticated
  USING (
    institution_id = public.current_institution_id()
    AND (requester_user_id = auth.uid() OR destinatario_user_id = auth.uid())
  );

-- Users create their own
CREATE POLICY "fin_owner_insert" ON public.fin_solicitacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    institution_id = public.current_institution_id()
    AND requester_user_id = auth.uid()
  );

-- Users update/delete their own
CREATE POLICY "fin_owner_update" ON public.fin_solicitacoes
  FOR UPDATE TO authenticated
  USING (requester_user_id = auth.uid())
  WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "fin_owner_delete" ON public.fin_solicitacoes
  FOR DELETE TO authenticated
  USING (requester_user_id = auth.uid());

-- Auto-set institution_id from requester profile if missing
CREATE OR REPLACE FUNCTION public.set_fin_solicitacoes_institution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := COALESCE(
      (SELECT institution_id FROM public.profiles WHERE id = NEW.requester_user_id),
      NEW.requester_user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_fin_solicitacoes_institution() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_fin_solicitacoes_institution
  BEFORE INSERT ON public.fin_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_fin_solicitacoes_institution();

CREATE TRIGGER trg_fin_solicitacoes_updated
  BEFORE UPDATE ON public.fin_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
