ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET last_seen_at = now() WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_last_seen(_user_id uuid)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT last_seen_at FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_last_seen(uuid) TO authenticated;