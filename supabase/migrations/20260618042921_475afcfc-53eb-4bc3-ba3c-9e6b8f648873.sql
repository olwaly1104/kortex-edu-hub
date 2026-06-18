
CREATE TABLE public.solicitacoes_gap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudante_id UUID NOT NULL REFERENCES public.estudantes(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL,
  assunto TEXT NOT NULL,
  descricao TEXT,
  estado TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes_gap TO authenticated;
GRANT ALL ON public.solicitacoes_gap TO service_role;
ALTER TABLE public.solicitacoes_gap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage solicitacoes_gap" ON public.solicitacoes_gap FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE TRIGGER trg_solicitacoes_gap_updated BEFORE UPDATE ON public.solicitacoes_gap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.agendamentos_gap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estudante_id UUID NOT NULL REFERENCES public.estudantes(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL,
  assunto TEXT NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  estado TEXT NOT NULL DEFAULT 'agendado',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos_gap TO authenticated;
GRANT ALL ON public.agendamentos_gap TO service_role;
ALTER TABLE public.agendamentos_gap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage agendamentos_gap" ON public.agendamentos_gap FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE TRIGGER trg_agendamentos_gap_updated BEFORE UPDATE ON public.agendamentos_gap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_solicitacoes_gap_estudante ON public.solicitacoes_gap(estudante_id);
CREATE INDEX idx_agendamentos_gap_estudante ON public.agendamentos_gap(estudante_id);
