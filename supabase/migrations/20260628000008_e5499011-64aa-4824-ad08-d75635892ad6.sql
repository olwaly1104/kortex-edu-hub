
-- ===== anuncios: restrict INSERT to staff roles in caller's institution =====
DROP POLICY IF EXISTS "anuncios_insert_self" ON public.anuncios;
CREATE POLICY "anuncios_insert_staff_own_institution"
  ON public.anuncios FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    AND institution_id = public.current_institution_id()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'coordenador')
      OR public.has_role(auth.uid(), 'decano')
      OR public.has_role(auth.uid(), 'reitor')
      OR public.has_role(auth.uid(), 'financas')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
    )
  );

-- ===== estudantes: restrict SELECT to staff roles =====
DROP POLICY IF EXISTS "Institution members read estudantes" ON public.estudantes;
CREATE POLICY "Staff read estudantes"
  ON public.estudantes FOR SELECT TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
      OR public.has_role(auth.uid(), 'financas')
      OR public.has_role(auth.uid(), 'coordenador')
      OR public.has_role(auth.uid(), 'decano')
      OR public.has_role(auth.uid(), 'reitor')
    )
  );

-- ===== docentes: restrict SELECT to staff/admin roles =====
DROP POLICY IF EXISTS "Institution members read docentes" ON public.docentes;
CREATE POLICY "Staff read docentes"
  ON public.docentes FOR SELECT TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
      OR public.has_role(auth.uid(), 'financas')
      OR public.has_role(auth.uid(), 'coordenador')
      OR public.has_role(auth.uid(), 'decano')
      OR public.has_role(auth.uid(), 'reitor')
    )
  );

-- ===== staff: restrict SELECT to staff/admin roles =====
DROP POLICY IF EXISTS "Institution members read staff" ON public.staff;
CREATE POLICY "Admin/HR read staff"
  ON public.staff FOR SELECT TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'financas')
      OR public.has_role(auth.uid(), 'reitor')
      OR public.has_role(auth.uid(), 'decano')
    )
  );

-- ===== fin_despesa_categorias: restrict writes to finance/admin =====
DROP POLICY IF EXISTS "owner can insert" ON public.fin_despesa_categorias;
DROP POLICY IF EXISTS "owner can update" ON public.fin_despesa_categorias;
DROP POLICY IF EXISTS "owner can delete" ON public.fin_despesa_categorias;
CREATE POLICY "finance insert despesa categorias"
  ON public.fin_despesa_categorias FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'financas'))
  );
CREATE POLICY "finance update despesa categorias"
  ON public.fin_despesa_categorias FOR UPDATE TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'financas'))
  )
  WITH CHECK (
    owner_user_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'financas'))
  );
CREATE POLICY "finance delete despesa categorias"
  ON public.fin_despesa_categorias FOR DELETE TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'financas'))
  );

-- ===== orcamentos: restrict SELECT to finance/admin =====
DROP POLICY IF EXISTS "Institution members read orcamentos" ON public.orcamentos;
CREATE POLICY "Finance read orcamentos"
  ON public.orcamentos FOR SELECT TO authenticated
  USING (
    owner_user_id = public.current_institution_id()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'financas')
      OR public.has_role(auth.uid(), 'reitor')
      OR public.has_role(auth.uid(), 'decano')
    )
  );

-- ===== candidaturas: replace permissive INSERT (true) with column-scoped check =====
DROP POLICY IF EXISTS "Anyone can submit candidatura" ON public.candidaturas;
CREATE POLICY "Public candidatura submission"
  ON public.candidaturas FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(btrim(email)) > 0
    AND length(btrim(email)) <= 200
  );

-- ===== set_institution_fiscal: require admin/financas =====
CREATE OR REPLACE FUNCTION public.set_institution_fiscal(_nome_legal text, _nif text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  inst uuid := public.current_institution_id();
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'financas')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  IF inst IS NULL THEN
    RAISE EXCEPTION 'No institution context';
  END IF;
  UPDATE public.profiles
     SET nome_legal = COALESCE(NULLIF(btrim(_nome_legal), ''), nome_legal),
         nif        = COALESCE(NULLIF(btrim(_nif), ''), nif)
   WHERE id = inst;
END;
$function$;

-- ===== storage.discentes: restrict to staff roles =====
DROP POLICY IF EXISTS "Authenticated read discentes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert discentes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update discentes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete discentes" ON storage.objects;

CREATE POLICY "Staff read discentes objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'discentes'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
      OR public.has_role(auth.uid(), 'financas')
    )
  );
CREATE POLICY "Staff insert discentes objects"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'discentes'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
    )
  );
CREATE POLICY "Staff update discentes objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'discentes'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
    )
  )
  WITH CHECK (
    bucket_id = 'discentes'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
    )
  );
CREATE POLICY "Staff delete discentes objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'discentes'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'academica')
      OR public.has_role(auth.uid(), 'gap')
      OR public.has_role(auth.uid(), 'inscricoes')
    )
  );
