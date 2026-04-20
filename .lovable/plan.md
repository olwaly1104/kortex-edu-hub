

User uploaded the CTI solicitações PDF. They confirm: each PDF lists requests for one destination department. CTI is just the first — Financeiro and others will follow. For now, I should:

1. Parse the CTI PDF to extract the exact list of request types CTI handles.
2. Build out the `Solicitacao` model with proper categories.
3. Seed CTI requests using the real types from the document.
4. Leave the data structure ready to receive Académica, Financeiro, GAP requests in future uploads.

I already have the model design from the previous plan. This iteration just narrows the seed data to CTI only (with realistic types from the PDF), and prepares the routing map so additional departments slot in cleanly.

I cannot parse the PDF in plan mode (read-only), so I'll do that as the first step once approved.

## Plan: seed CTI solicitações from the uploaded document

### Step 1 — Parse the PDF
Use `document--parse_document` on `user-uploads://CENTRO_DE_TECNOLOGIAS_DE_INFORMAÇÃO_-_CTI_solicitacoes.pdf` to extract the official CTI request types and their categories/subcategories.

### Step 2 — Update `src/data/gapData.ts`

**Replace the ticket model** with the request-tracking model (already designed in the previous plan):

```ts
type Destino = "CTI" | "Académica" | "Financeiro" | "GAP" | "Secretaria";

type EstadoSolicitacao =
  | "recebida" | "encaminhada" | "em_execucao" | "concluida" | "rejeitada";

interface Solicitacao {
  id; estudante; matricula; curso; ano;
  tipo;                    // exact label from PDF, e.g. "Segunda via de cartão"
  categoria;               // sub-grouping from PDF (e.g. "Cartão de estudante")
  destino;                 // auto = "CTI" for all in this batch
  assunto; descricao;
  estado; prioridade;
  dataSubmissao; dataEncaminhamento; dataConclusao?;
  responsavelDestino?;     // e.g. "Eng. Paulo Neto · CTI"
  slaDias;
  historico: { data; actor; accao; nota? }[];
  anexos?;
}
```

**Add a routing map** `tipoToDestino` so future Financeiro/Académica types route correctly. For now, all entries point to CTI.

**Seed ~12–15 solicitações** using the actual types from the PDF, distributed across:
- Estados: 3 recebida, 3 encaminhada, 4 em_execucao, 4 concluida, 1 rejeitada
- Prioridades: mix
- Realistic CTI staff: "Eng. Paulo Neto", "Téc. Sara Domingos"
- Each with a 2–4 step `historico` audit trail (submissão → encaminhamento CTI → execução → conclusão)

### Step 3 — `Solicitacoes.tsx` (route `/gap/solicitacoes`)
Already restructured in the previous turn. Adjust to:
- Replace **chat dialog** with a **tracking dialog** (audit timeline, no message composer).
- Add **Destino** column + filter (currently only "CTI" — but the filter is ready).
- Add **Categoria** filter (CTI sub-categories from the PDF).
- Add **SLA badge** column (no prazo / em risco / atrasado, computed from `slaDias` vs `dataEncaminhamento`).
- GAP actions (monitor role): "Adicionar nota interna", "Marcar urgente", "Pedir actualização" — no responder.
- Helper text: *"As solicitações são submetidas pelo estudante no Portal e encaminhadas automaticamente ao departamento responsável. O GAP acompanha a execução."*

### Step 4 — `Dashboard.tsx`, `Inicio.tsx`, `EstudanteProfile.tsx`
- Dashboard: rename "por Categoria" widget → **"Solicitações por Destino"** (CTI dominante por agora). Add **SLA em Risco** KPI.
- Início: "Pedidos Recentes" reframed as "Últimas solicitações encaminhadas" (sem CTAs de criação).
- EstudanteProfile: lista de solicitações mostra Destino + Estado de execução (sem "última mensagem").

### Files touched
- `src/data/gapData.ts` — model + CTI seed data
- `src/pages/gap/Tickets.tsx` — tracking dialog, Destino/Categoria filters, SLA
- `src/pages/gap/Dashboard.tsx` — Destino widget, SLA KPI
- `src/pages/gap/Inicio.tsx` — copy
- `src/pages/gap/EstudanteProfile.tsx` — request list reframe

### Ready for next uploads
When you upload Financeiro/Académica PDFs, I'll just append types to `tipoToDestino` and add seed entries — no structural changes needed.

