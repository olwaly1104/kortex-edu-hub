
CREATE OR REPLACE FUNCTION public.get_user_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;
