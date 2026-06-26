
-- Make calendario_events shared across institution members (read), but only owner can modify
ALTER TABLE public.calendario_events
  ADD COLUMN IF NOT EXISTS institution_id uuid;

-- Backfill institution_id from the owner's profile
UPDATE public.calendario_events ce
SET institution_id = COALESCE(p.institution_id, ce.owner_user_id)
FROM public.profiles p
WHERE p.id = ce.owner_user_id AND ce.institution_id IS NULL;

-- Trigger to set institution_id automatically on insert
CREATE OR REPLACE FUNCTION public.set_calendario_events_institution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

DROP TRIGGER IF EXISTS calendario_events_set_institution ON public.calendario_events;
CREATE TRIGGER calendario_events_set_institution
  BEFORE INSERT ON public.calendario_events
  FOR EACH ROW EXECUTE FUNCTION public.set_calendario_events_institution();

-- Replace SELECT policy: any member of the same institution can view
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendario_events;
CREATE POLICY "Institution members can view calendar events"
  ON public.calendario_events
  FOR SELECT
  USING (
    institution_id = public.current_institution_id()
    OR owner_user_id = auth.uid()
  );
