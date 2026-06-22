DROP POLICY IF EXISTS "Admin manages own estudantes" ON public.estudantes;
DROP POLICY IF EXISTS "Institution members can read estudantes" ON public.estudantes;

CREATE POLICY "Institution members read estudantes"
  ON public.estudantes FOR SELECT TO authenticated
  USING (owner_user_id = public.current_institution_id());

CREATE POLICY "Institution members insert estudantes"
  ON public.estudantes FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = public.current_institution_id());

CREATE POLICY "Institution members update estudantes"
  ON public.estudantes FOR UPDATE TO authenticated
  USING (owner_user_id = public.current_institution_id())
  WITH CHECK (owner_user_id = public.current_institution_id());

CREATE POLICY "Institution members delete estudantes"
  ON public.estudantes FOR DELETE TO authenticated
  USING (owner_user_id = public.current_institution_id());