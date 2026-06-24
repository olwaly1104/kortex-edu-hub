## 1. Remove "Módulo Kortex" field

Drop the field that sits below "Documentação Anexa" in:
- `src/components/admin/DocenteFormDialog.tsx`
- `src/components/admin/StaffFormDialog.tsx`
- `src/pages/admin/Discentes.tsx` (inline add form)

Also strip it from the `requiredOk` validation and from save payloads (keep the column in DB untouched — just stop sending/reading it from these forms).

## 2. Bloqueado badge (visual only)

Reuse the existing badge style from `src/pages/admin/FaculdadesCursos.tsx` (the same pattern already in `ConfigurarReceitas.tsx`).

Add the badge to each row when `row.bloqueado === true` in:
- Onboarding RH → Departamentos, Docentes table, Staff table
- Onboarding Espaços, Geopontos, Salários, Estudantes, Regras Presença
- Faculdades & Cursos (already present — verify both tables)
- Finanças → Configurar Receitas (Propinas por Curso, Taxas e Serviços)

Tables whose source has no `bloqueado` column today: read it as `row.bloqueado ?? false` so the badge simply never shows until the column exists. No migration in this pass.

## 3. Edit button on every row

Pattern (already used in RH Departamentos):
- Default row = read-only text
- Pencil icon toggles edit mode → inputs/selects appear
- Save icon commits

Apply to all tables listed in section 2. Where rows are already always-editable inputs (Pessoas, Espaços, Geopontos, Salários, Estudantes, Regras Presença, ConfigurarReceitas), wrap each row with the same `editing[id]` toggle and swap inputs ↔ read-only text.

## 4. Confirm dialogs

Add an `AlertDialog` for two actions on every row:
- **Delete** → "Tem a certeza que pretende eliminar este registo? Esta acção é irreversível." → Confirmar / Cancelar
- **Confirm Edit (Save)** → "Confirmar as alterações a este registo?" → Confirmar / Cancelar

Implementation: a small shared helper `useConfirm()` in `src/components/ui/confirm-dialog.tsx` that renders one `AlertDialog` driven by state, returns `confirm(opts) => Promise<boolean>`. Each table imports it and wraps its existing `remove()` / save handlers.

## Files touched

- New: `src/components/ui/confirm-dialog.tsx`
- Edited:
  - `src/components/admin/DocenteFormDialog.tsx`
  - `src/components/admin/StaffFormDialog.tsx`
  - `src/pages/admin/Discentes.tsx`
  - `src/pages/admin/onboarding/RH.tsx`
  - `src/pages/admin/onboarding/Pessoas.tsx`
  - `src/pages/admin/onboarding/Espacos.tsx`
  - `src/pages/admin/onboarding/Geopontos.tsx`
  - `src/pages/admin/onboarding/Salarios.tsx`
  - `src/pages/admin/onboarding/Estudantes.tsx`
  - `src/pages/admin/onboarding/RegrasPresenca.tsx`
  - `src/pages/admin/FaculdadesCursos.tsx`
  - `src/pages/financas/ConfigurarReceitas.tsx`

## Out of scope (ask later if needed)

- Adding a UI to actually toggle `bloqueado` on/off (you said "just a visual badge").
- Adding a `bloqueado` column to tables that don't have one yet (no DB migration).
