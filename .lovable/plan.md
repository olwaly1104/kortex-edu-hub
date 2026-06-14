# Plan — Enrich Anúncio Detail Page

## 1. Departamento tag next to Categoria (above title)
Replace the single Categoria badge above the `<h1>` with a horizontal tag row containing two badges:
- **Categoria** badge — keep current style (colored dot + uppercase label).
- **Departamento** badge — outline style, `Building2` icon (w-3 h-3) + `{ann.department}`, same height/typography as Categoria. Clickable → links to `/financas/anuncios?dep=...` (same as in Dados).

Both badges sit in a `flex flex-wrap gap-1.5` row directly above the title.

## 2. Reduce "naked" feeling — add structure below the body
The page currently ends right after the body text, leaving the right Dados sidebar visually taller and a lot of empty space below. Additions (inside the main card, in the left column, after Conteúdo):

**a. Inline summary strip above Conteúdo**
A thin gradient/tinted row showing a one-line lead/resumo using the first sentence of `ann.content`, styled as an italic pull-quote with a left accent border in `primary`. Gives the body weight before the paragraph starts.

**b. "Documentos anexos" mini-section** (after the body)
Static mock list of 1–2 attachments (e.g. `Anuncio-{ID}.pdf`, plus a contextual file like `Programa.pdf` when type is event). Each row: file icon, name, size, Download button. Styled like the EduDrive file rows already used in finances.

**c. "Partilhado com" inline preview**
Below attachments: small horizontal stack of avatar circles (reuse `sharedWith` initials) + "{n} pessoas com acesso" label + "Ver todos" button that opens the existing dialog. Removes the hidden-only-in-header feeling.

## 3. Related anúncios section (outside the card)
Below the main card, add a "Mais do mesmo departamento" section using the existing `related` array (already computed but unused). Grid of compact cards (title, type badge, date). Only render if `related.length > 0`. This fills the bottom of the page meaningfully.

## 4. Sidebar polish
- Add a subtle section divider line between Dados items (already spaced; add `divide-y divide-border/60` wrapper) so the right column feels intentional rather than floating.
- Add an "Estado" MetaCell (e.g. "Publicado" with green dot) for parity with other detail pages.

## Out of scope
- No data model changes — attachments and estado are presentational mocks consistent with other finance/EduDrive views.
- No routing changes.

## Technical notes
File: `src/pages/financas/AnuncioDetail.tsx` only.
Imports to add: `Paperclip` (or reuse `FileText`) for attachments header. Reuse existing `sharedWith`, `related`, `TYPE_META`.
