# Aula em Directo — Painel de Controlo do Professor

## 1. Refinar o botão "Entrar na Aula" (Dashboard)

No card **Agenda Hoje** do `/professor`:
- Substituir o botão `variant="outline"` (fundo branco e cinza neutro) por um chip sólido na cor primária quando a aula está **A Decorrer** (CTA principal), e versão suave para aulas futuras.
- Estados visuais:
  - **A Decorrer** → fundo verde primário, texto branco, ícone `LogIn`, hover mais escuro, ring suave verde a pulsar (`animate-pulse` discreto no ponto de status).
  - **Agendada** → outline verde primário, texto verde, sem fundo branco puro (usa `bg-primary/5`).
  - **Concluída** → ghost cinza com `Video` + "Rever".
- Linha lateral colorida (`bg-primary`) já existente fica mais espessa (`w-1`) e ganha cantos arredondados.

## 2. Nova página — Painel da Aula

Rota: `/professor/aula/:lessonId` (placeholder com dados mock por enquanto, pronto para ligar ao backend depois).

Layout (1 ecrã, sem scroll lateral):

```text
┌─────────────────────────────────────────────────────────────┐
│ HEADER     Teoria da Arquitectura I · ARQ · 1º Ano · T1     │
│            Sala A-204 · 10:00 – 12:00     [Terminar Aula]   │
├──────────────┬──────────────────────────────────────────────┤
│ CRONÓMETRO   │  PASSO ACTUAL                                │
│ 00:23:41     │  ──────────────────                          │
│ Decorrida    │  ① Chamada (a fazer)                         │
│ ─── / 02:00  │  ② Conteúdo da aula                          │
│ Barra verde  │  ③ Encerramento                              │
├──────────────┴──────────────────────────────────────────────┤
│ ZONA PRINCIPAL — muda conforme o passo                      │
│                                                             │
│  • Passo 1: grelha de chamada (alunos com botões            │
│    Presente / Atraso / Falta, marcação em massa, %)         │
│  • Passo 2: controlo de conteúdos                           │
│      ‑ Slides (anterior / seguinte, miniatura, fullscreen)  │
│      ‑ Vídeos (play/pause, scrub, ecrã cheio)               │
│      ‑ Recursos (PDFs, links partilhados em 1 clique)       │
│  • Passo 3: resumo + botão "Encerrar Aula"                  │
└─────────────────────────────────────────────────────────────┘
```

### Comportamento

- **Auto-start**: ao abrir, se a hora actual ≥ hora de início, o cronómetro inicia automaticamente. Caso contrário mostra "Começa em 04:12" e o botão "Iniciar Agora".
- **Chamada obrigatória primeiro**: passo 2 fica bloqueado até a chamada ser confirmada (mesmo que com 0 presenças explicitamente marcadas — exige carregar em "Confirmar Chamada"). Mostra contagem ao vivo (`18 / 24 presentes`).
- **Controlo de conteúdo**:
  - Slides: navegação com `←` / `→` no teclado, indicador `3 / 24`, botão fullscreen.
  - Vídeos: player simples (HTML5) com play/pause e barra de progresso.
  - Lista de recursos com acção "Partilhar com a turma" (placeholder).
- **Terminar aula**: dialog de confirmação, mostra sumário (duração, % presença, conteúdos cobertos) e fecha sessão.

## 3. Ligações

- Botão **Entrar na Aula** no Dashboard navega para `/professor/aula/aula-demo` (id mock).
- Página acessível também a partir de `Aulas` futuramente (não tocar agora).
- Atalhos de teclado: `P` toggle play/pause vídeo, `←/→` slides, `Esc` sair de fullscreen.

## Detalhes técnicos

- Novo ficheiro `src/pages/professor/AulaControlo.tsx`.
- Registar rota em `src/App.tsx` sob `/professor/aula/:lessonId`.
- Estado local (`useState` / `useReducer`) — sem backend nesta iteração; dados mock (1 turma, ~24 alunos, 3 slides, 1 vídeo). Marcado claramente como mock para substituir depois pelo `lessons` real.
- Reutilizar tokens semânticos (`bg-primary`, `text-primary`, `border-border`) — sem cores hard-coded.
- Componentes shadcn: `Card`, `Button`, `Badge`, `Progress`, `Dialog`, `Tabs` (para os 3 passos no header lateral).
- Cronómetro com `setInterval` em `useEffect` + cleanup.
- Sem nova dependência.
