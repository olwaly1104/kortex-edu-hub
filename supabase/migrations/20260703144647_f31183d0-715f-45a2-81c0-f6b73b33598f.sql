
-- Deduplicate: keep one sessao per etapa, preferring one with actual data, most recent
WITH ranked AS (
  SELECT id, etapa_id,
    ROW_NUMBER() OVER (
      PARTITION BY etapa_id
      ORDER BY
        CASE WHEN mode IS NOT NULL AND mode <> '' AND (COALESCE(array_length(datas,1),0) > 0 OR data_fim IS NOT NULL) THEN 0 ELSE 1 END,
        updated_at DESC
    ) AS rn
  FROM public.candidaturas_sessoes
)
DELETE FROM public.candidaturas_sessoes s USING ranked r
WHERE s.id = r.id AND r.rn > 1;

-- Enforce one sessao per etapa going forward
ALTER TABLE public.candidaturas_sessoes
  ADD CONSTRAINT candidaturas_sessoes_etapa_unique UNIQUE (etapa_id);
