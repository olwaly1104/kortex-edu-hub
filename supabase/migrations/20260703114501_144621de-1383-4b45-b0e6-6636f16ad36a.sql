
-- ETAPAS
CREATE TABLE public.candidaturas_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  owner_user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  agenda BOOLEAN NOT NULL DEFAULT false,
  obrigatoria BOOLEAN NOT NULL DEFAULT false,
  estados_possiveis TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidaturas_etapas TO authenticated;
GRANT ALL ON public.candidaturas_etapas TO service_role;

ALTER TABLE public.candidaturas_etapas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution can view candidaturas_etapas"
  ON public.candidaturas_etapas FOR SELECT TO authenticated
  USING (institution_id = public.current_institution_id());

CREATE POLICY "Admin/academica manage candidaturas_etapas"
  ON public.candidaturas_etapas FOR ALL TO authenticated
  USING (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica'))
  )
  WITH CHECK (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica'))
  );

CREATE TRIGGER trg_candidaturas_etapas_updated
  BEFORE UPDATE ON public.candidaturas_etapas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_candidaturas_etapas_institution()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := COALESCE(
      (SELECT institution_id FROM public.profiles WHERE id = NEW.owner_user_id),
      NEW.owner_user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_candidaturas_etapas_institution
  BEFORE INSERT ON public.candidaturas_etapas
  FOR EACH ROW EXECUTE FUNCTION public.set_candidaturas_etapas_institution();

-- SESSOES
CREATE TABLE public.candidaturas_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  owner_user_id UUID NOT NULL,
  etapa_id UUID NOT NULL REFERENCES public.candidaturas_etapas(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT '',
  datas DATE[] NOT NULL DEFAULT '{}',
  data_fim DATE,
  hora TIME,
  local TEXT,
  responsavel_id UUID,
  capacidade INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidaturas_sessoes TO authenticated;
GRANT ALL ON public.candidaturas_sessoes TO service_role;

ALTER TABLE public.candidaturas_sessoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution can view candidaturas_sessoes"
  ON public.candidaturas_sessoes FOR SELECT TO authenticated
  USING (institution_id = public.current_institution_id());

CREATE POLICY "Admin/academica manage candidaturas_sessoes"
  ON public.candidaturas_sessoes FOR ALL TO authenticated
  USING (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica'))
  )
  WITH CHECK (
    institution_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'academica'))
  );

CREATE TRIGGER trg_candidaturas_sessoes_updated
  BEFORE UPDATE ON public.candidaturas_sessoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_candidaturas_sessoes_institution()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.institution_id IS NULL THEN
    NEW.institution_id := COALESCE(
      (SELECT institution_id FROM public.profiles WHERE id = NEW.owner_user_id),
      NEW.owner_user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_candidaturas_sessoes_institution
  BEFORE INSERT ON public.candidaturas_sessoes
  FOR EACH ROW EXECUTE FUNCTION public.set_candidaturas_sessoes_institution();
