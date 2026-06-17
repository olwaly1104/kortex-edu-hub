## Goal

Restore the old institutional dashboard layout for `src/pages/financas/Inicio.tsx`, matching the pattern used in Coordenador / Secretaria / Decano dashboards. The right side of the welcome hero (which on those roles shows "Ano Lectivo 2024/2025") will instead show an **Onboarding** progress chip for Finanças.

## Layout (top → bottom)

```
┌──────────────────────────────────────────────────────────────┐
│ Hero: "Bom dia, {nome} 👋"          Onboarding · 2/4 →       │
│       Finanças — UPRA                (links to next step)    │
└──────────────────────────────────────────────────────────────┘
[ Minha Presença ] [ Solicitações ] [ Agenda ] [ Lançamentos ]
┌─────────────── Agenda de Hoje (2/3) ────────┐ ┌─ Anúncios ──┐
│ time | bar | title · sala  · status         │ │ 3 cards     │
└─────────────────────────────────────────────┘ └─────────────┘
┌─────────────── Solicitações Pendentes ──────────────────────┐
│ list with priority + Aprovar / Rejeitar / Ver detalhes      │
└─────────────────────────────────────────────────────────────┘
```

## Pieces

### 1. Welcome hero
- `Card` with `border-l-4 border-l-primary`, `p-6`.
- Left: `h1` greeting + subtitle "Finanças — UPRA".
- Right: **Onboarding chip** instead of the "Ver Detalhes" link.
  - Reads finance onboarding steps from `OnboardingStepBanner` (`fin.pro`, `fin.des`, `fin.sal`, `fin.mul`) and the `markOnboardingStepDone` storage key to compute `done/total`.
  - Displays `Onboarding · {done}/{total}` and links to the next pending step's path (or `/admin` when complete).
  - Listens to `storage` events so it updates live, same pattern as `OnboardingStepBanner`.

### 2. KPI strip (4 cards, same visual as Coordenador `stats`)
- `Minha Presença` — `96%`, primary
- `Solicitações` — count of pending finance solicitações
- `Agenda` — events count today
- `Lançamentos` — recent transactions count

Values can come from existing finance mock data (`reitorSolicitacoes` filtered, `coordAgendaEvents`); placeholder zeros where no source exists yet.

### 3. Agenda de Hoje + Anúncios row
- `grid lg:grid-cols-3 gap-6`, agenda spans 2 cols.
- Reuse the exact agenda renderer from Coordenador (time block, color bar, title + sala, status badge with `em_curso` highlight) using `coordAgendaEvents` filtered to TODAY_DATE.
- Anúncios card shows top 3 of `announcements` with the same `typeStyles` chip + meta + content, "Ver todos" link to `/financas/anuncios`.

### 4. Solicitações Pendentes
- Full-width card listing top 3 pending finance solicitações using existing styling (icon + title + priority + requester + date + Aprovar/Rejeitar/Ver detalhes).
- "Ver todas" links to `/financas/solicitacoes`.

## Files

- **Edit** `src/pages/financas/Inicio.tsx` — replace the current 60-line placeholder with the layout above. Remove the `FinHeader` import here (the welcome hero replaces it on Início; other pages keep `FinHeader`).
- No new routes, no new data files. Reuses `mockData`, `institutionData`, `OnboardingStepBanner` storage helpers.

## Out of scope (for this step)

- Receitas and Despesas redesigns — handled in follow-up turns once Início is approved.
- Real data wiring for KPIs beyond what the other dashboards already use.
