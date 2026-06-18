CREATE TABLE public.calendario_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL DEFAULT auth.uid(),
  type TEXT NOT NULL CHECK (type IN ('reuniao', 'prazo', 'pessoal')),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  link TEXT,
  modalidade TEXT CHECK (modalidade IN ('kortex', 'presencial')),
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendario_events TO authenticated;
GRANT ALL ON public.calendario_events TO service_role;

ALTER TABLE public.calendario_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
ON public.calendario_events
FOR SELECT
TO authenticated
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own calendar events"
ON public.calendario_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendario_events
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendario_events
FOR DELETE
TO authenticated
USING (auth.uid() = owner_user_id);

CREATE TRIGGER update_calendario_events_updated_at
BEFORE UPDATE ON public.calendario_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();