## 1. Sistema page — GB utilizados bar

`src/pages/admin/Sistema.tsx`
- Replace **Faculdades** and **Cursos** KPI cards with a single full-width **Armazenamento** card containing a thin progress bar (`Progress` component), showing `X.X MB / 50 GB`.
- Source: list `discentes` storage bucket via `supabase.storage.from("discentes").list("", { limit: 1000 })` (recursive walk on subfolders) and sum `metadata.size`. Cap visualised total at 50 GB.
- Keep Perfis + Acessos cards. New grid becomes 2 KPIs + 1 wider storage card.

## 2. Docente form — remove categoria, merge morada into Identificação

`src/components/admin/DocenteFormDialog.tsx`
- Drop **Categoria** field entirely; on save set `categoria = moduloKortex` label (so existing data shape unchanged).
- Remove "Morada de Residência" section; move Província / Município / Endereço into the Identificação Pessoal grid (extend to 4 cols).

`src/pages/admin/Docentes.tsx` (legacy dialog) — same removals.

`src/lib/peopleStorage.ts` — keep `categoria` field optional (no migration).

## 3. Docente profile cleanup + Ver/Descarregar

`src/pages/admin/DocenteProfile.tsx`
- Remove Categoria badge in header and Categoria InfoRow in "Afiliação Institucional".
- Delete the standalone "Localização" and "Contacto" SectionCards (already covered in Informações Pessoais).
- Replace the moduloLabel badge + hand-rolled Docente pill with `<ModuleTag modulo={docente.moduloKortex} />` (single source of truth from chat).
- Add a header action row "Ver documento" / "Descarregar" that opens a `Dialog` containing a new `DocenteDocPreview` component (A4 layout cloned from `DiscenteDocPreview` with docente fields).

New file: `src/pages/admin/DocenteDocPreview.tsx` (~250 lines, structurally identical to DiscenteDocPreview, with sections: Identificação Pessoal, Afiliação Institucional, Contacto & Morada, Formação Académica; documentos checklist: BI, CV, Diploma, Foto).

## 4. Staff profile page + auto-doc

New file: `src/pages/admin/StaffProfile.tsx` — mirror of DocenteProfile structure but for `StaffRow` fields (no Faculdade/Grau; uses Departamento + Função). Header uses `<ModuleTag modulo={staff.moduloKortex} />`.

New file: `src/pages/admin/StaffDocPreview.tsx` — mirror of DocenteDocPreview tuned to staff fields (Identificação Pessoal, Afiliação Institucional [Departamento/Função/Módulo], Contacto & Morada). Documentos: BI, CV, Foto.

`src/App.tsx` — register `/admin/staff/:staffId` → `AdminStaffProfile`.

Make staff rows clickable across: `src/pages/admin/Staff.tsx`, `src/pages/admin/onboarding/Pessoas.tsx` (staff panel) — navigate to `/admin/staff/:id`.

## 5. ModuleTag everywhere on profile pages and admin tables

Replace ad-hoc pills with `<ModuleTag>`:
- `src/pages/admin/Docentes.tsx` table — Cargo column.
- `src/pages/admin/Staff.tsx` table — Módulo column.
- `src/pages/admin/onboarding/Pessoas.tsx` — both Docente and Staff tables.
- `src/pages/admin/DocenteProfile.tsx` — Cargo badge.
- New `StaffProfile.tsx` — Módulo badge.

## 6. Smart CSV import

New shared component: `src/components/admin/CsvImportDialog.tsx`
- Opens from "Importar CSV" button (added next to "Adicionar X" in Docentes, Staff, Discentes config screens).
- Drag-drop or file picker (`.csv`).
- Parses with native `FileReader` + simple CSV splitter (handles quoted values, `,` separator).
- Props: `template: { header: string; required: boolean; key: string }[]`, `validators: Record<key, (val, ctx) => string|null>`, `referenceData: { faculdades, cursos, departamentos }`, `onConfirm(rows)`.
- Preview table: each row gets a status pill `Pronto` / `Aviso` / `Erro`. Columns show parsed value plus inline messages, e.g. "Faculdade 'CIE' não encontrada (sugestão: Ciências Exatas)". Fuzzy match by lowercase normalized contains/startsWith.
- Footer KPIs: `X prontos · Y avisos · Z erros`. "Importar X registos" button only imports `Pronto + Aviso` (skips errors).
- Download template button generates a CSV with headers + 1 sample row.

Wire-up:
- `src/pages/admin/onboarding/Pessoas.tsx` (Docentes panel) — add "Importar CSV" next to "Adicionar docente"; template: prefixo, primeiro_nome, ultimo_nome, telemovel, faculdade, departamento, grau, cargo, modulo_kortex. Fuzzy-match faculdade against `faculdades` table; departamento against `departamentos`. On confirm, batch insert via `saveDocentes([...existing, ...newRows])`.
- `src/pages/admin/onboarding/Pessoas.tsx` (Staff panel) — template: prefixo, primeiro_nome, ultimo_nome, telemovel, departamento, funcao, modulo_kortex.
- `src/pages/admin/Discentes.tsx` — template: primeiro_nome, ultimo_nome, telemovel, bilhete, faculdade, curso, ano, turma, regime, encarregado_nome, encarregado_telefone, encarregado_parentesco. Match curso by sigla or designacao within selected faculdade.

## 7. Out of scope (will NOT touch)

- Backend RLS / storage bucket policies (already configured).
- Existing onboarding wizard step ordering.
- Other modules' profile pages (decano/coordenador/reitor) — request was explicitly about admin/finanças staff click-through.

## Risks
- The discentes bucket size may be empty → show `0 B / 50 GB`. That's expected.
- CSV fuzzy match is heuristic; flagged warnings let the user proceed knowingly.
- DocenteDocPreview adds ~250 LOC; mirrors DiscenteDocPreview to keep visual consistency.
