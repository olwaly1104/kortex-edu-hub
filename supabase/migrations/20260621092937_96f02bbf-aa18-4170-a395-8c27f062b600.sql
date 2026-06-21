ALTER TABLE public.departamentos ADD COLUMN cor TEXT DEFAULT '#1B3A6B';

UPDATE public.departamentos SET cor = '#1B3A6B' WHERE cor IS NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
