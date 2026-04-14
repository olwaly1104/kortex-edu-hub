

## Plan: Rebuild Secretaria "Início" Page

The current `/secretaria` route renders `SecretariaDashboard.tsx` which is heavily focused on admissions pipeline data. The goal is to replace it with a clean, professional "Início" page following the same pattern used by Finanças, Coordenador, and other roles — a cockpit-style home with: welcome banner, agenda, announcements, alerts, and quick actions.

### What will change

**1. Rewrite `src/pages/secretaria/Dashboard.tsx`** — completely replace the current admissions-focused dashboard with a clean "Início" layout:

- **Welcome banner** — gradient card with greeting + "Área Académica — UPRA" subtitle + link to Admissions Dashboard
- **Alert chips** — pending documents, pending payments (from admissoesData)
- **Row 1: Agenda de Hoje (2/3) + Anúncios (1/3)** — reusing `coordAgendaEvents` and `announcements` from mockData, same pattern as Finanças Início
- **Row 2: Solicitações Pendentes + Acções Rápidas** — solicitations from `reitorSolicitacoes` with approve/reject buttons; quick action links to Dashboard Admissões, Candidaturas, Apoio ao Estudante, Provas de Acesso, Resultados
- All links point to `/secretaria/...` routes

**2. No routing changes needed** — `/secretaria` already renders `SecretariaDashboard`, which we'll rewrite in place.

**3. No new data files** — reuses existing `mockData`, `institutionData`, and `admissoesData` imports.

### Design

Follows the exact same visual structure as `src/pages/financas/Inicio.tsx`: gradient welcome card, alert chips, 2-column grid rows with Cards, same spacing/typography/badge patterns. Academica-specific quick actions instead of finance ones.

