
# Plan

Big request — I'll group it into 6 self-contained pieces. All shipped in this single iteration.

## 1. Onboarding — replace "Cadeiras & Turmas" with "Configurar Área Académica"

In `src/pages/admin/Inicio.tsx`:
- Remove the standalone Faculdades & Cursos group (`fac`) — it moves inside the new group.
- Rename the `cad` group label to **"Configurar Área Académica"** and add Faculdades + Cursos steps to it, so the group contains: Faculdades, Cursos, Cadeiras, Turmas.
- Final top→bottom order stays: Discentes → Geopontos do Campus → Configurar Área Académica → Configurar Finanças → Configurar RH → Configurar GAP.

## 2. Sidebar — Finanças section under Staff

In `src/components/AppSidebar.tsx`, add a **Finanças** group below Staff containing:
- Dashboard, Receitas, Despesas, Salários, Orçamentos, **Discentes** (new), **Candidaturas** (new).
- Add **Candidaturas** to the Estudantes section right under Discentes, above Configuração.
- All routes mounted under `/admin/financas/*` and `/admin/candidaturas`, reusing existing finance/GAP page components (read-only mirror).

## 3. Discentes inside Finanças (new page)

`src/pages/admin/FinancasDiscentes.tsx` — clean institutional table (matrícula, nome, curso, ano, turma, estado financeiro) with row-click → `/admin/discente/:id` which opens a **default student profile** modeled after the Coordenador student profile (KPIs + academic history + finances tab focus). Uses same mock dataset already used elsewhere.

## 4. Criar Conta — real backend accounts

- Rename/repurpose the "Criar Conta" button next to "Ver Credenciais" on the admin landing.
- Modal fields: **Módulo** (select: Estudante, Professor, Coordenador, Decano, Reitor, Finanças, Académica, GAP, Inscrições, Admin), **Nome a apresentar**, **Email**, **Palavra-passe**.
- On submit: calls `supabase.auth.signUp` with `emailRedirectTo: window.location.origin`, writes role to a new `user_roles` table, profile auto-created via existing trigger.
- New migration: `app_role` enum + `user_roles` table + `has_role` security-definer function + GRANTs + RLS (admin can manage, users see their own).
- Enable Lovable Cloud email auth with auto-confirm OFF (default) so accounts are real. No Google by default since user only specified email/password.

## 5. Candidaturas — real table wired end-to-end

New migration `public.candidaturas`:
- Fields: nome, email, telefone, curso_pretendido, faculdade, sessao (1ª/2ª/3ª), documentos (jsonb), pagamento_status (pendente/pago), estado (recebida/em_analise/aprovada/rejeitada), origem ('site' default), notas.
- GRANTs: anon INSERT (public form), authenticated SELECT/UPDATE, service_role ALL.
- RLS: anon can insert only; authenticated can read & update (admin module gated client-side).

Wiring:
- `/inscricoes` portal form → `INSERT INTO candidaturas` (replaces current mock submit).
- GAP `Candidaturas.tsx` → reads from this table.
- New `/admin/candidaturas` and `/admin/financas/candidaturas` views → read-only mirror of GAP candidaturas list/detail with the same components.

## 6. Document templates — refresh with current info

Update doc-preview pages so PDFs match the newer per-page info:
- `src/pages/gap/SolicitacaoDocPreview.tsx`
- `src/pages/gap/AtendimentoDocPreview.tsx` (if drift exists)
- `src/pages/gap/CandidaturaDocPreview.tsx` — pull from new candidaturas row
- `src/pages/financas/DespesaDocPreview.tsx`
- `src/pages/financas/SolicitacaoDocPreview.tsx`

Each will read the same source-of-truth shown on the detail page so headers, IDs, dates, valores, beneficiários, anexos match exactly.

## 7. Verification before "done"

- Build/typecheck via harness.
- Manually click through: /admin (onboarding order), Criar Conta modal → submits → row in `user_roles`, /admin/financas/discentes table → row click → student profile, /inscricoes submit → row visible in GAP Candidaturas and admin mirror, doc previews open with matching data.

## Technical details

- New migration files: `xxx_user_roles.sql`, `xxx_candidaturas.sql`. Migrations include GRANTs + RLS in correct order.
- `has_role(_user_id uuid, _role app_role)` SECURITY DEFINER; used in policies to avoid recursion.
- Inscrições form switches from mock to `supabase.from('candidaturas').insert(...)`; keeps existing UI.
- Criar Conta uses `supabase.auth.signUp` directly (not edge function) — display_name passed via `options.data.display_name` so the existing `handle_new_user` trigger picks it up.
- No changes to `src/integrations/supabase/client.ts` or auto-generated types.

Approve and I'll execute all 7 in one pass.
