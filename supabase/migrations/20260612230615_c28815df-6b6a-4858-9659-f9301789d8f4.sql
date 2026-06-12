
CREATE OR REPLACE FUNCTION public.get_or_create_dm(_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me UUID := auth.uid();
  _conv_id UUID;
BEGIN
  IF _me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _other_user_id = _me THEN
    RAISE EXCEPTION 'Cannot DM yourself';
  END IF;

  -- Find existing 1:1 conversation between _me and _other
  SELECT c.id INTO _conv_id
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = _me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = _other_user_id)
    AND (SELECT COUNT(*) FROM public.conversation_participants p WHERE p.conversation_id = c.id) = 2
  LIMIT 1;

  IF _conv_id IS NOT NULL THEN
    RETURN _conv_id;
  END IF;

  INSERT INTO public.conversations (is_group, created_by) VALUES (false, _me) RETURNING id INTO _conv_id;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (_conv_id, _me), (_conv_id, _other_user_id);
  RETURN _conv_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_or_create_dm(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(UUID) TO authenticated;
