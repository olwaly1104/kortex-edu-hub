ALTER TABLE public.calendario_events REPLICA IDENTITY FULL;
ALTER TABLE public.estudantes REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calendario_events;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.estudantes;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;