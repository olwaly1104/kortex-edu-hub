# Fix: Meu Perfil shows real counts from DB

## Problem
In `src/pages/admin/Perfil.tsx`, the four stat cards (Faculdades, Cursos, Docentes, Staff) read from localStorage onboarding flags and use **hardcoded values** (`progress["aca.fac"] ? 3 : 0`, etc.). They ignore the actual data created in the Admin area, so newly created faculdades never appear.

Meanwhile:
- Faculdades & Cursos live in the `faculdades` / `cursos` tables, exposed via `useFaculdades()` / `useCursos()` (already used in `FaculdadesCursos.tsx`).
- Docentes & Staff are persisted in localStorage via `loadDocentes()` / `loadStaff()` from `@/lib/peopleStorage`.

## Change

Edit only `src/pages/admin/Perfil.tsx`:

1. Replace the hardcoded `stats` array with live counts:
   - `Faculdades` ← `useFaculdades().data?.length ?? 0`
   - `Cursos` ← `useCursos().data?.length ?? 0`
   - `Docentes` ← `loadDocentes().length` (kept in sync via existing `focus`/`storage` listener pattern)
   - `Staff` ← `loadStaff().length` (same pattern; import from `peopleStorage`)
2. Add the imports (`useFaculdades`, `useCursos` from `@/lib/useInstitution`; `loadDocentes`, `loadStaff` from `@/lib/peopleStorage`).
3. Track docentes/staff counts in `useState` with a `focus`/`storage` listener so values refresh after admin edits in other tabs/pages (mirrors the pattern already used in `FaculdadesCursos.tsx`).
4. Remove the now-unused `PROGRESS_KEY` / `progress` reads.

No DB migration, no other files touched. UI layout/styles stay identical.

## Verification
After saving, creating/deleting a faculdade in `/admin/faculdades-cursos` updates the count on `/admin/perfil` (DB query refetches via React Query; switch routes or use the existing refresh listeners).
