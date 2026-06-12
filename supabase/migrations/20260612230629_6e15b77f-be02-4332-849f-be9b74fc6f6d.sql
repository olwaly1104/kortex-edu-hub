
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_or_create_dm(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_or_create_dm(UUID) FROM anon;
