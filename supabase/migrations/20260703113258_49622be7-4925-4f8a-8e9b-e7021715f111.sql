
CREATE TABLE public.ano_letivo_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid,
  owner_user_id uuid NOT NULL DEFAULT auth.uid(),
  ano_letivo text NOT NULL,
  tipo text NOT NULL,
  titulo text NOT NULL,
  inicio date NOT NULL,
  fim date NOT NULL,
  epoca text,
  semestre text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ano_letivo_eventos TO authenticated;
GRANT ALL ON public.ano_letivo_eventos TO service_role;

ALTER TABLE public.ano_letivo_eventos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_ano_letivo_eventos_institution()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE TRIGGER trg_ano_letivo_eventos_institution
BEFORE INSERT ON public.ano_letivo_eventos
FOR EACH ROW EXECUTE FUNCTION public.set_ano_letivo_eventos_institution();

CREATE TRIGGER trg_ano_letivo_eventos_updated
BEFORE UPDATE ON public.ano_letivo_eventos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can view institution events"
ON public.ano_letivo_eventos FOR SELECT TO authenticated
USING (institution_id = public.current_institution_id());

CREATE POLICY "Members can insert events"
ON public.ano_letivo_eventos FOR INSERT TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners or admins can update"
ON public.ano_letivo_eventos FOR UPDATE TO authenticated
USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners or admins can delete"
ON public.ano_letivo_eventos FOR DELETE TO authenticated
USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
