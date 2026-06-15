
-- 1. Candidaturas: restrict staff policies to actual staff roles
DROP POLICY IF EXISTS "Staff can read candidaturas" ON public.candidaturas;
DROP POLICY IF EXISTS "Staff can update candidaturas" ON public.candidaturas;
DROP POLICY IF EXISTS "Staff can delete candidaturas" ON public.candidaturas;

CREATE POLICY "Staff can read candidaturas"
ON public.candidaturas FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'academica'::app_role)
  OR public.has_role(auth.uid(), 'inscricoes'::app_role)
);

CREATE POLICY "Staff can update candidaturas"
ON public.candidaturas FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'academica'::app_role)
  OR public.has_role(auth.uid(), 'inscricoes'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'academica'::app_role)
  OR public.has_role(auth.uid(), 'inscricoes'::app_role)
);

CREATE POLICY "Staff can delete candidaturas"
ON public.candidaturas FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'academica'::app_role)
);

-- 2. Profiles: tighten over-broad SELECT
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Users view own profile or admin views all"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Realtime authorization on messages channel
-- Channel topic = conversation_id. Only participants can subscribe & receive.
DROP POLICY IF EXISTS "Conversation participants can read realtime messages" ON realtime.messages;
CREATE POLICY "Conversation participants can read realtime messages"
ON realtime.messages FOR SELECT TO authenticated
USING (
  public.is_conversation_participant(
    (SELECT realtime.topic())::uuid,
    auth.uid()
  )
);

-- 4. Revoke EXECUTE on SECURITY DEFINER helper functions from anon/public.
-- They are used by RLS / triggers and don't need to be callable via the API.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.current_institution_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_default_propina() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_conversation_on_message() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
-- get_or_create_dm needs to be callable by authenticated users
REVOKE EXECUTE ON FUNCTION public.get_or_create_dm(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;
