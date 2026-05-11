## Inscrições Portal — Single-Page Student Registration

A new login `inscricoes@upra.kor` opens a **single page** (no sidebar, no dashboard, no other menus) where the operator registers a new student. Submitting the form is what originates a student account/candidatura.

### 1. Role & Auth

- Add `"inscricoes"` to `UserRole` in `src/data/mockData.ts`.
- Add `currentInscricoes` mock user (`inscricoes@upra.kor`, name "Portal de Inscrições").
- `detectRole()`: `inscricoes*` → `inscricoes`.
- `AuthContext.tsx`: register the new mock user.
- `App.tsx`: `homeRedirectMap.inscricoes = "/inscricoes"`.
- `Login.tsx`: add seed-credentials hint line.

### 2. Layout — Minimal Shell

`src/layouts/InscricoesLayout.tsx` (does **not** use `AppSidebar`).

```text
┌─────────────────────────────────────────────────────────┐
│ [Kortex Educação]    Portal de Inscrições · UPRA   Sair │
├─────────────────────────────────────────────────────────┤
│                                                         │
│            < single registration page >                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Top bar only: logo + title + Logout.
- White background, `Inter`, primary `#1B3A6B`, same UI kit as the rest of the app.
- No navigation, no Início, no Calendário, nothing else.

### 3. The Single Page — `Registar Estudante`

Route: `/inscricoes` (index). One page, structured into clearly labeled sections inside one `Card`. All fields visible at once; the user fills top-to-bottom and submits.

```text
┌──────────────────────────────────────────────────────────┐
│ Registar Novo Estudante                                  │
│ Preencha os dados abaixo para criar a candidatura.       │
├──────────────────────────────────────────────────────────┤
│ ▸ Dados Pessoais                                         │
│   Nome completo · Nº BI · Data nasc. · Género ·          │
│   Naturalidade · Nacionalidade · Foto tipo passe         │
│                                                          │
│ ▸ Contactos & Morada                                     │
│   Email pessoal · Telemóvel · Província · Município ·    │
│   Bairro / Endereço                                      │
│                                                          │
│ ▸ Encarregado de Educação                                │
│   Nome · Nº BI · Parentesco · Telefone · Email           │
│                                                          │
│ ▸ Formação Académica                                     │
│   Escola anterior · Tipo de ensino · Ano de conclusão ·  │
│   Média final                                            │
│                                                          │
│ ▸ Curso Pretendido                                       │
│   Faculdade · Curso (1ª opção) · Curso (2ª opção) ·      │
│   Sessão de Prova (1ª / 2ª / 3ª)                         │
│                                                          │
│ ▸ Documentos (upload)                                    │
│   [BI]  [Declaração de Notas]  [Certidão Habilitações]   │
│   [Foto tipo passe]  [Comprovativo de pagamento]         │
│                                                          │
│ ☐ Confirmo que os dados são verdadeiros                  │
│                                  [ Limpar ]  [ Submeter ]│
└──────────────────────────────────────────────────────────┘
```

- Each section is a labeled group with a thin divider — visual hierarchy only, **not** steps.
- Inputs use the existing `Input`, `Label`, `Select`, `Textarea`, `Checkbox` from `@/components/ui/*`.
- Document uploads: drop-card with state `Em falta` / `Carregado` (filename), simulated (no Cloud upload — mock data).
- Required-field validation client-side; invalid → red border + small message.
- **Submit** → toast success + reset form to blank and show small inline confirmation strip ("✓ Candidatura CAND-2026-0142 criada — pronto para registar outro estudante.").

### 4. Routing

In `App.tsx`:

```tsx
<Route element={<InscricoesLayout />}>
  <Route path="/inscricoes" element={<InscricoesRegistar />} />
</Route>
```

Inscrições users redirect to `/inscricoes`; any other path falls back there.

### 5. Files

- **Add**
  - `src/layouts/InscricoesLayout.tsx`
  - `src/pages/inscricoes/Registar.tsx` (the single page)
  - `src/data/inscricoesData.ts` (faculdade/curso/sessão options + types)
- **Change**
  - `src/data/mockData.ts` — role + mock user + detectRole
  - `src/contexts/AuthContext.tsx` — register mock user
  - `src/App.tsx` — homeRedirectMap + route
  - `src/pages/Login.tsx` — seed credential hint

### 6. Memory

Add `mem://features/inscricoes/portal-overview` and a Core line:
> Inscrições role (`inscricoes@upra.kor`) is a single-page student-registration portal — no sidebar, no other menus; submitting the form originates a candidatura.

### Notes

- Terminology aligned with project memory: "Cadeira", "Sessão" (1ª/2ª/3ª), "Por regularizar", semantic colors.
- Visual language identical to the rest of the app (OneDrive-inspired card, Inter, primary `#1B3A6B`).
