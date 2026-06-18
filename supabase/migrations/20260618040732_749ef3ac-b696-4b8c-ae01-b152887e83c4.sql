ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(_conversation_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.messages
  SET read_at = now()
  WHERE conversation_id = _conversation_id
    AND sender_id <> auth.uid()
    AND read_at IS NULL
    AND public.is_conversation_participant(_conversation_id, auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_users_presence(_ids uuid[])
RETURNS TABLE(id uuid, role text, last_seen_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    (SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id ORDER BY ur.created_at ASC LIMIT 1) AS role,
    p.last_seen_at
  FROM public.profiles p
  WHERE p.id = ANY(_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_users_presence(uuid[]) TO authenticated;