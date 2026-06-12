
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated;
