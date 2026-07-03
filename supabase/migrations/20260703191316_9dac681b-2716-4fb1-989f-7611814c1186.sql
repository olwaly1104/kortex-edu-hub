UPDATE public.docentes d
SET modulo_kortex = ur.role::text
FROM public.user_roles ur
WHERE ur.user_id = d.id
  AND (d.modulo_kortex IS NULL OR d.modulo_kortex = '')
  AND ur.role::text IN ('professor','coordenador','decano','reitor');

UPDATE public.staff s
SET modulo_kortex = ur.role::text
FROM public.user_roles ur
WHERE ur.user_id = s.id
  AND (s.modulo_kortex IS NULL OR s.modulo_kortex = '')
  AND ur.role::text IN ('financas','academica','gap','inscricoes');