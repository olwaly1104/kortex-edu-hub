CREATE TABLE public.edificios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla text NOT NULL,
    nome text NOT NULL,
    pisos integer NOT NULL DEFAULT 1,
    salas integer NOT NULL DEFAULT 0,
    responsavel uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.edificios TO authenticated;
GRANT ALL ON public.edificios TO service_role;

ALTER TABLE public.edificios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own edificios"
ON public.edificios
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Institution members read edificios"
ON public.edificios
FOR SELECT
TO authenticated
USING (owner_user_id = public.current_institution_id());

CREATE TRIGGER update_edificios_updated_at
BEFORE UPDATE ON public.edificios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();