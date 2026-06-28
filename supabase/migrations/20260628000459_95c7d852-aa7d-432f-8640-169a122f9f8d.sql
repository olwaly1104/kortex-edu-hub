-- Lock down SECURITY DEFINER functions: revoke from PUBLIC/anon, grant EXECUTE
-- only to the roles that legitimately need to call each function.

-- Trigger-only functions: no client/role EXECUTE needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_default_propina() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_conversation_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_calendario_events_institution() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_anuncios_institution() FROM PUBLIC, anon, authenticated;

-- RLS helper functions: called from policies; authenticated needs EXECUTE, anon does not
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.current_institution_id() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.current_institution_id() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated;

-- Client RPCs: only signed-in users
REVOKE EXECUTE ON FUNCTION public.list_institution_contacts() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.list_institution_contacts() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_name(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_name(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.touch_last_seen() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_last_seen(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_last_seen(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_users_presence(uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_users_presence(uuid[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_institution_fiscal() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_institution_fiscal() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_institution_fiscal(text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_institution_fiscal(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_or_create_dm(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;
