import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft,
  Brain, Pencil, Type, Layers, Trophy, Timer, Play, Search, Filter, BookOpen,
  ClipboardCheck, AlertTriangle, Flame, Zap, Gauge,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MCQ = { q: string; options: string[]; answer: number; explain: string };
type Written = { q: string; keywords: string[]; sample: string };
type Fill = { sentence: string; answer: string; hint: string };
type QuizType = "mcq" | "written" | "fill" | "exam";
type Difficulty = "Introdutório" | "Intermédio" | "Avançado";

type ExamQ =
  | { kind: "mcq"; q: string; options: string[]; answer: number; points?: number }
  | { kind: "fill"; sentence: string; answer: string; points?: number }
  | { kind: "written"; q: string; keywords: string[]; sample: string; points?: number };

type Base = {
  id: string;
  code: string;          // QZ-001
  title: string;
  cadeira: string;
  ano: 1 | 2 | 3 | 4 | 5;
  description: string;
  difficulty: Difficulty;
  minutes: number;
};

type AnyQuiz =
  | (Base & { type: "mcq";     items: MCQ[] })
  | (Base & { type: "written"; items: Written[] })
  | (Base & { type: "fill";    items: Fill[] })
  | (Base & { type: "exam";    items: ExamQ[]; passingScore?: number });

/* ------------------------------------------------------------------ */
/*  Content — Curso de Arquitectura (ARQ)                              */
/* ------------------------------------------------------------------ */

const QUIZZES: AnyQuiz[] = [
  {
    id: "qz-001", code: "QZ-001", type: "mcq",
    title: "Movimentos do Século XX",
    cadeira: "História da Arquitectura", ano: 2,
    description: "Bauhaus, Modernismo, Brutalismo e Pós-Modernismo — autores e obras de referência.",
    difficulty: "Intermédio", minutes: 6,
    items: [
      { q: "Quem fundou a escola Bauhaus em 1919?", options: ["Le Corbusier", "Walter Gropius", "Mies van der Rohe", "Frank Lloyd Wright"], answer: 1, explain: "Walter Gropius fundou a Bauhaus em Weimar, unindo arte, artesanato e indústria." },
      { q: "A frase «menos é mais» é atribuída a:", options: ["Le Corbusier", "Louis Kahn", "Mies van der Rohe", "Alvar Aalto"], answer: 2, explain: "Mies van der Rohe condensou o ideal minimalista do Movimento Moderno." },
      { q: "A Villa Savoye (1929) é obra de:", options: ["Le Corbusier", "Oscar Niemeyer", "Tadao Ando", "Adolf Loos"], answer: 0, explain: "Demonstra os «cinco pontos» da nova arquitectura de Le Corbusier." },
      { q: "O termo Brutalismo deriva de:", options: ["Brutus, o romano", "Béton brut (betão à vista)", "Brute force", "Bruto, do italiano"], answer: 1, explain: "«Béton brut» — betão deixado à vista, sem revestimento." },
      { q: "Oscar Niemeyer foi central no projecto de:", options: ["Chandigarh", "Brasília", "Canberra", "Astana"], answer: 1, explain: "Niemeyer projectou os principais edifícios cívicos de Brasília, com Lúcio Costa no plano urbano." },
    ],
  },
  {
    id: "qz-002", code: "QZ-002", type: "mcq",
    title: "Sistemas Estruturais",
    cadeira: "Construção II", ano: 3,
    description: "Pórticos, lajes, fundações e comportamento de materiais à compressão e tracção.",
    difficulty: "Avançado", minutes: 7,
    items: [
      { q: "Qual o material que resiste melhor à tracção?", options: ["Betão simples", "Aço", "Tijolo", "Pedra natural"], answer: 1, explain: "O aço tem elevada resistência à tracção; o betão é forte à compressão." },
      { q: "Uma laje fungiforme apoia directamente em:", options: ["Vigas", "Paredes", "Pilares", "Tirantes"], answer: 2, explain: "Apoia-se directamente nos pilares, sem vigas intermédias." },
      { q: "Sapata isolada é uma fundação adequada quando:", options: ["O solo tem baixa capacidade portante", "Os pilares estão muito próximos", "O solo tem boa capacidade e pilares afastados", "Existe nível freático elevado"], answer: 2, explain: "Solo competente e cargas concentradas em pilares isolados." },
      { q: "Um arco trabalha essencialmente à:", options: ["Tracção", "Compressão", "Flexão", "Torção"], answer: 1, explain: "A geometria do arco conduz as cargas por compressão até aos apoios." },
    ],
  },
  {
    id: "qz-003", code: "QZ-003", type: "mcq",
    title: "Princípios de Composição",
    cadeira: "Projecto I", ano: 1,
    description: "Escala, proporção, ritmo, simetria e hierarquia no projecto arquitectónico.",
    difficulty: "Introdutório", minutes: 5,
    items: [
      { q: "A proporção áurea aproxima-se de:", options: ["1 : 1,414", "1 : 1,618", "1 : 2,000", "1 : 3,141"], answer: 1, explain: "Phi (φ) ≈ 1,618 — base de composições clássicas e renascentistas." },
      { q: "O Modulor foi desenvolvido por:", options: ["Vitrúvio", "Le Corbusier", "Palladio", "Loos"], answer: 1, explain: "Le Corbusier criou o Modulor a partir do corpo humano e da secção áurea." },
      { q: "Hierarquia em composição obtém-se por:", options: ["Escala, posição ou forma distinta", "Repetição igual de elementos", "Uso único de simetria axial", "Eliminação de contrastes"], answer: 0, explain: "Diferenciar um elemento por tamanho, localização ou forma cria hierarquia visual." },
    ],
  },
  {
    id: "qz-004", code: "QZ-004", type: "written",
    title: "Crítica de Obra — Pavilhão de Barcelona",
    cadeira: "Teoria da Arquitectura", ano: 3,
    description: "Análise escrita do Pavilhão de Mies van der Rohe (1929). Avaliação por palavras-chave.",
    difficulty: "Avançado", minutes: 10,
    items: [
      { q: "Descreve a relação entre planos verticais e espaço fluido no Pavilhão de Barcelona.", keywords: ["planos", "fluido", "Mies", "mármore", "contínuo", "interior", "exterior", "modernismo"], sample: "Mies organiza o pavilhão através de planos verticais autónomos — mármore, ónix e vidro — que orientam o espaço sem o fechar. A planta livre dissolve a fronteira entre interior e exterior, criando um percurso contínuo característico do Movimento Moderno." },
      { q: "Explica o papel do estereotomia vs tectónica em Mies neste edifício.", keywords: ["estereotomia", "tectónica", "pesado", "leve", "pedra", "metal", "cobertura"], sample: "A base pétrea remete à estereotomia (massa, peso, terra), enquanto a fina cobertura suportada por pilares cruciformes em aço cromado representa a tectónica (leveza, montagem, ar)." },
    ],
  },
  {
    id: "qz-005", code: "QZ-005", type: "written",
    title: "Sustentabilidade no Projecto",
    cadeira: "Construção Sustentável", ano: 4,
    description: "Resposta aberta sobre estratégias passivas e desempenho ambiental.",
    difficulty: "Intermédio", minutes: 8,
    items: [
      { q: "Indica três estratégias passivas para conforto térmico em climas quentes.", keywords: ["ventilação", "sombreamento", "orientação", "massa térmica", "vegetação", "pátio"], sample: "Orientação adequada do edifício, sombreamento de vãos com palas/brise-soleil, ventilação cruzada, uso de massa térmica e pátios sombreados com vegetação." },
    ],
  },
  {
    id: "qz-006", code: "QZ-006", type: "fill",
    title: "Vocabulário Clássico",
    cadeira: "História da Arquitectura", ano: 1,
    description: "Termos das ordens clássicas e elementos da arquitectura greco-romana.",
    difficulty: "Introdutório", minutes: 4,
    items: [
      { sentence: "A ordem ___ caracteriza-se pelo capitel com volutas em espiral.", answer: "jónica", hint: "Ordem grega intermédia" },
      { sentence: "O elemento horizontal sobre as colunas chama-se ___.", answer: "entablamento", hint: "Composto por arquitrave, friso e cornija" },
      { sentence: "O Panteão de Roma é coroado por uma ___.", answer: "cúpula", hint: "Cobertura semi-esférica" },
    ],
  },
  {
    id: "qz-007", code: "QZ-007", type: "fill",
    title: "Normas de Desenho Técnico",
    cadeira: "Desenho Técnico", ano: 1,
    description: "Escalas, cotagem e simbologia em desenho arquitectónico.",
    difficulty: "Introdutório", minutes: 3,
    items: [
      { sentence: "A escala mais comum para plantas de arquitectura é 1:___.", answer: "100", hint: "Cem" },
      { sentence: "Um corte transversal é representado por uma linha de ___ na planta.", answer: "corte", hint: "Indica o plano seccionado" },
      { sentence: "A cotagem em milímetros é a norma ___.", answer: "ISO", hint: "Sigla internacional" },
    ],
  },
  {
    id: "qz-011", code: "QZ-011", type: "exam",
    title: "Exame de Treino — História da Arquitectura",
    cadeira: "História da Arquitectura", ano: 2,
    description: "Simulação cronometrada cobrindo movimentos do séc. XX, vocabulário clássico e autores fundamentais.",
    difficulty: "Intermédio", minutes: 20, passingScore: 50,
    items: [
      { kind: "mcq", q: "A Bauhaus foi fundada em:", options: ["1909", "1919", "1929", "1945"], answer: 1, points: 10 },
      { kind: "mcq", q: "A frase «a forma segue a função» é de:", options: ["Le Corbusier", "Louis Sullivan", "Mies van der Rohe", "Adolf Loos"], answer: 1, points: 10 },
      { kind: "mcq", q: "Brasília foi planeada por:", options: ["Niemeyer e Costa", "Niemeyer e Le Corbusier", "Costa e Kahn", "Aalto e Niemeyer"], answer: 0, points: 10 },
      { kind: "fill", sentence: "A ordem grega mais antiga e robusta é a ___.", answer: "dórica", points: 10 },
      { kind: "fill", sentence: "O edifício circular romano coberto por cúpula chama-se ___.", answer: "panteão", points: 10 },
      { kind: "written", q: "Explica brevemente o conceito de «planta livre» em Le Corbusier.",
        keywords: ["pilares", "paredes", "estrutura", "liberdade", "flexível", "Corbusier"],
        sample: "A planta livre é possível porque a estrutura é transferida para pilares (pilotis), libertando as paredes interiores de funções portantes e permitindo divisões flexíveis adaptáveis ao programa.",
        points: 25 },
      { kind: "written", q: "Define «pós-modernismo» em arquitectura com pelo menos um autor de referência.",
        keywords: ["pós-modernismo", "Venturi", "história", "ornamento", "ecletismo", "Jencks"],
        sample: "Reacção ao Movimento Moderno (anos 70-80) que reabilita ornamento, citações históricas e ecletismo. Robert Venturi («Less is a bore») e Charles Jencks são referências centrais.",
        points: 25 },
    ],
  },
  {
    id: "qz-012", code: "QZ-012", type: "exam",
    title: "Exame de Treino — Construção e Estrutura",
    cadeira: "Construção II", ano: 3,
    description: "Simulação focada em materiais, sistemas estruturais e fundações. Cronometrado.",
    difficulty: "Avançado", minutes: 25, passingScore: 60,
    items: [
      { kind: "mcq", q: "Resistência característica do betão C25/30 (compressão) é:", options: ["20 MPa", "25 MPa", "30 MPa", "35 MPa"], answer: 1, points: 10 },
      { kind: "mcq", q: "Numa viga simplesmente apoiada com carga uniforme, o momento máximo é em:", options: ["Apoios", "Meio vão", "1/3 do vão", "1/4 do vão"], answer: 1, points: 10 },
      { kind: "mcq", q: "Uma sapata corrida usa-se sob:", options: ["Pilar isolado", "Parede contínua", "Laje fungiforme", "Pavimento térreo"], answer: 1, points: 10 },
      { kind: "fill", sentence: "O elemento horizontal que vence o vão entre dois apoios chama-se ___.", answer: "viga", points: 10 },
      { kind: "fill", sentence: "O aço é forte à tracção; o betão é forte à ___.", answer: "compressão", points: 10 },
      { kind: "written", q: "Descreve a função do recobrimento de armaduras no betão armado.",
        keywords: ["recobrimento", "corrosão", "aderência", "fogo", "armaduras", "durabilidade"],
        sample: "O recobrimento protege as armaduras da corrosão (penetração de cloretos/carbonatação), garante aderência aço-betão, oferece resistência ao fogo e contribui para a durabilidade do elemento estrutural.",
        points: 25 },
      { kind: "written", q: "Quando se opta por fundações profundas (estacas) em vez de directas?",
        keywords: ["solo", "competente", "estacas", "cargas", "freático", "profundidade"],
        sample: "Quando o solo superficial não tem capacidade portante adequada, há cargas muito elevadas, presença de nível freático elevado, ou quando o terreno competente está a profundidade significativa.",
        points: 25 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Type metadata                                                      */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<QuizType, {
  label: string;
  icon: React.ElementType;
  description: string;
  /** Tailwind classes for the colored category tag */
  tag: string;
  /** Tailwind classes for the colored icon tile */
  tile: string;
  /** Active-filter row classes */
  active: string;
  /** Dot color for the filter row indicator */
  dot: string;
}> = {
  mcq: {
    label: "Múltipla Escolha", icon: Brain,
    description: "Selecciona a resposta correcta entre opções.",
    tag:    "bg-blue-50 text-blue-700 border-blue-200",
    tile:   "bg-blue-50 text-blue-600 border-blue-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    dot:    "bg-blue-500",
  },
  written: {
    label: "Resposta Escrita", icon: Pencil,
    description: "Resposta aberta avaliada por palavras-chave.",
    tag:    "bg-violet-50 text-violet-700 border-violet-200",
    tile:   "bg-violet-50 text-violet-600 border-violet-200",
    active: "bg-violet-50 text-violet-700 border-violet-200",
    dot:    "bg-violet-500",
  },
  fill: {
    label: "Preencher Espaço", icon: Type,
    description: "Completa uma frase com o termo em falta.",
    tag:    "bg-amber-50 text-amber-700 border-amber-200",
    tile:   "bg-amber-50 text-amber-600 border-amber-200",
    active: "bg-amber-50 text-amber-700 border-amber-200",
    dot:    "bg-amber-500",
  },
  exam: {
    label: "Exame de Treino", icon: ClipboardCheck,
    description: "Simulação cronometrada com perguntas mistas.",
    tag:    "bg-rose-50 text-rose-700 border-rose-200",
    tile:   "bg-rose-50 text-rose-600 border-rose-200",
    active: "bg-rose-50 text-rose-700 border-rose-200",
    dot:    "bg-rose-500",
  },
};

const DIFF_META: Record<Difficulty, {
  label: string; level: 1 | 2 | 3;
  icon: React.ElementType; pill: string; bar: string;
}> = {
  "Introdutório": { label: "Introdutório", level: 1, icon: Gauge, pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  "Intermédio":   { label: "Intermédio",   level: 2, icon: Flame, pill: "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-amber-500"   },
  "Avançado":     { label: "Avançado",     level: 3, icon: Zap,   pill: "bg-rose-50 text-rose-700 border-rose-200",           bar: "bg-rose-500"    },
};

function DiffPill({ d, size = "sm" }: { d: Difficulty; size?: "sm" | "md" }) {
  const m = DIFF_META[d];
  const Icon = m.icon;
  const isMd = size === "md";
  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-md border font-bold uppercase tracking-wider shrink-0",
      isMd ? "px-2.5 py-1.5 text-[11px]" : "px-2 py-1 text-[10px]",
      m.pill,
    )}>
      <Icon className={isMd ? "w-3.5 h-3.5" : "w-3 h-3"} />
      <span>{m.label}</span>
      <span className="flex items-end gap-0.5 ml-0.5">
        {[1, 2, 3].map(n => (
          <span key={n} className={cn(
            "w-1 rounded-sm",
            n === 1 ? "h-1.5" : n === 2 ? "h-2.5" : "h-3.5",
            n <= m.level ? m.bar : "bg-current opacity-20",
          )} />
        ))}
      </span>
    </span>
  );
}

/* Color per Cadeira — used as a tag in rows and as a dot in the filter menu */
const CADEIRA_PALETTE = [
  { tag: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  { tag: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  { tag: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  { tag: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", dot: "bg-fuchsia-500" },
  { tag: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  { tag: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  { tag: "bg-lime-50 text-lime-700 border-lime-200", dot: "bg-lime-500" },
  { tag: "bg-pink-50 text-pink-700 border-pink-200", dot: "bg-pink-500" },
];
function cadeiraColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CADEIRA_PALETTE[h % CADEIRA_PALETTE.length];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentQuizzes() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | QuizType>("all");
  const [cadeiraFilter, setCadeiraFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const active = useMemo(() => QUIZZES.find(q => q.id === activeId) ?? null, [activeId]);

  const cadeiras = useMemo(() => Array.from(new Set(QUIZZES.map(q => q.cadeira))).sort(), []);

  const filtered = useMemo(() => QUIZZES.filter(q => {
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (cadeiraFilter !== "all" && q.cadeira !== cadeiraFilter) return false;
    if (search && !(`${q.title} ${q.cadeira} ${q.description}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [typeFilter, cadeiraFilter, search]);

  if (active) {
    return <ActiveQuizView quiz={active} onExit={() => setActiveId(null)} />;
  }

  const total = QUIZZES.length;
  const typeCounts: Record<QuizType | "all", number> = {
    all: total,
    mcq: QUIZZES.filter(q => q.type === "mcq").length,
    written: QUIZZES.filter(q => q.type === "written").length,
    fill: QUIZZES.filter(q => q.type === "fill").length,
    exam: QUIZZES.filter(q => q.type === "exam").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Editorial header */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-border pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-primary mb-1.5">UPRA · Arquitectura</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Centro de Estudo</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Treino dirigido às cadeiras do Curso de Arquitectura. Escolhe a tipologia, a cadeira e o exercício — cada actividade tem duração estimada e nível de dificuldade.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 min-w-[220px]">
          <KpiStat label="Actividades" value={total} />
          <KpiStat label="Cadeiras" value={cadeiras.length} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4 rounded-xl border border-border bg-card p-3">
          <div>
            <div className="flex items-center justify-between px-1.5 mb-2">
              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-muted-foreground flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Tipologia
              </p>
              <span className="text-[10px] text-muted-foreground tabular-nums">{typeCounts.all}</span>
            </div>
            <div className="space-y-0.5">
              <FilterRow active={typeFilter === "all"} onClick={() => setTypeFilter("all")} icon={Sparkles} label="Todos os tipos" count={typeCounts.all} />
              {(Object.keys(TYPE_META) as QuizType[]).map(t => (
                <FilterRow
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  icon={TYPE_META[t].icon}
                  label={TYPE_META[t].label}
                  count={typeCounts[t]}
                  tag={TYPE_META[t].tile}
                  activeClasses={TYPE_META[t].active}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between px-1.5 mb-2">
              <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Cadeira
              </p>
              <span className="text-[10px] text-muted-foreground tabular-nums">{cadeiras.length}</span>
            </div>
            <div className="space-y-0.5">
              <FilterRow active={cadeiraFilter === "all"} onClick={() => setCadeiraFilter("all")} icon={BookOpen} label="Todas as cadeiras" count={QUIZZES.length} />
              {cadeiras.map(c => {
                const cc = cadeiraColor(c);
                return (
                  <FilterRow
                    key={c}
                    active={cadeiraFilter === c}
                    onClick={() => setCadeiraFilter(c)}
                    label={c}
                    count={QUIZZES.filter(q => q.cadeira === c).length}
                    dot={cc.dot}
                  />
                );
              })}
            </div>
          </div>
        </aside>


        {/* Main list */}
        <main className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar por título, cadeira ou tópico..."
                className="pl-9 h-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "actividade" : "actividades"}
              {(typeFilter !== "all" || cadeiraFilter !== "all" || search) && (
                <button
                  onClick={() => { setTypeFilter("all"); setCadeiraFilter("all"); setSearch(""); }}
                  className="ml-2 text-primary hover:underline"
                >limpar filtros</button>
              )}
            </p>
          </div>

          <Card className="divide-y divide-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Nenhuma actividade corresponde aos filtros aplicados.
              </div>
            ) : (
              filtered.map(q => <QuizRow key={q.id} quiz={q} onStart={() => setActiveId(q.id)} />)
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents — menu                                               */
/* ------------------------------------------------------------------ */

function KpiStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
      <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function FilterRow({
  active, onClick, icon: Icon, label, count, dot, tag, activeClasses,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  label: string;
  count: number;
  dot?: string;
  tag?: string;
  activeClasses?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-md text-[13px] transition-all text-left",
        active
          ? activeClasses
            ? cn(activeClasses, "font-semibold shadow-sm")
            : "bg-primary/10 text-primary font-semibold shadow-sm"
          : "text-foreground/75 hover:bg-muted hover:text-foreground hover:translate-x-0.5"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-all",
          active ? "bg-current opacity-90" : "opacity-0"
        )}
      />
      {tag ? (
        <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded-md border shrink-0", tag)}>
          {Icon ? <Icon className="w-3 h-3" /> : dot ? <span className={cn("w-1.5 h-1.5 rounded-full", dot)} /> : null}
        </span>
      ) : Icon ? (
        <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "" : "text-muted-foreground group-hover:text-foreground")} />
      ) : dot ? (
        <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
      ) : null}
      <span className="flex-1 truncate">{label}</span>
      <span className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums min-w-[22px] text-center",
        active ? "bg-white/70 text-current" : "bg-muted/70 text-muted-foreground group-hover:bg-background"
      )}>{count}</span>
    </button>
  );
}

function QuizRow({ quiz, onStart }: { quiz: AnyQuiz; onStart: () => void }) {
  const meta = TYPE_META[quiz.type];
  const Icon = meta.icon;
  const cad = cadeiraColor(quiz.cadeira);
  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
      {/* Large category icon tile + label below */}
      <div className="shrink-0 flex flex-col items-center gap-1 w-14">
        <div className={cn("w-12 h-12 rounded-lg border flex items-center justify-center", meta.tile)}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[9px] font-semibold text-foreground/80 text-center leading-tight">{meta.label}</span>
      </div>

      <div className="flex-1 min-w-0">
        {/* Meta bar — cadeira only */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border", cad.tag)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cad.dot)} />
            {quiz.cadeira}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{quiz.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{quiz.description}</p>
      </div>

      <div className="hidden md:flex items-center shrink-0 pr-2">
        <DiffPill d={quiz.difficulty} />
      </div>

      <Button size="sm" variant="outline" onClick={onStart} className="gap-1.5 shrink-0 h-8 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
        <Play className="w-3 h-3" /> Iniciar
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared chrome for active quizzes                                   */
/* ------------------------------------------------------------------ */

/** Extracts the accent hue used across the active-quiz UI. */
function accent(quiz: AnyQuiz) {
  const meta = TYPE_META[quiz.type];
  const cad  = cadeiraColor(quiz.cadeira);
  return { meta, cad };
}

function QuizHeader({ quiz }: { quiz: AnyQuiz }) {
  const { meta, cad } = accent(quiz);
  const Icon = meta.icon;
  return (
    <Card className="relative overflow-hidden border-2 shadow-sm">
      {/* Side accent rail (category colour) */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", meta.dot)} />
      {/* Faint radial glow on the right */}
      <div
        aria-hidden
        className={cn("absolute -right-24 -top-24 w-80 h-80 rounded-full opacity-[0.10] blur-2xl pointer-events-none", meta.dot)}
      />

      <div className="relative p-6 pl-8 grid gap-6 md:grid-cols-[auto_1fr_auto] items-stretch">
        {/* Icon block */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className={cn("w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-sm", meta.tile)}>
            <Icon className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 text-center leading-tight max-w-[5rem]">
            {meta.label}
          </span>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex flex-col gap-2 justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border", cad.tag)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", cad.dot)} />
              {quiz.cadeira}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-md border border-border bg-muted/40">
              <Layers className="w-3 h-3" /> {quiz.items.length} {quiz.items.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <h2 className="text-[26px] font-bold text-foreground leading-[1.15] tracking-tight">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{quiz.description}</p>
        </div>

        {/* Difficulty rail — distinctive vertical block */}
        <div className="shrink-0 flex md:flex-col items-start md:items-end gap-2 md:border-l md:border-border md:pl-5">
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-muted-foreground">Dificuldade</span>
          <DiffPill d={quiz.difficulty} size="md" />
        </div>
      </div>
    </Card>
  );
}

/** Hook: monotonic seconds counter that runs while `running` is true. */
function useTimer(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return s;
}

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Wrapper that locks the "Voltar" exit while a game is in progress. */
function ActiveQuizView({ quiz, onExit }: { quiz: AnyQuiz; onExit: () => void }) {
  const [locked, setLocked] = useState(false);
  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      {locked ? (
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5" />
          Quiz em curso — termina para poderes sair.
        </div>
      ) : (
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Centro de Estudo
        </button>
      )}
      <QuizHeader quiz={quiz} />
      {quiz.type === "mcq"     && <MCQGame     quiz={quiz} onLockChange={setLocked} />}
      {quiz.type === "written" && <WrittenGame quiz={quiz} onLockChange={setLocked} />}
      {quiz.type === "fill"    && <FillGame    quiz={quiz} onLockChange={setLocked} />}
      {quiz.type === "exam"    && <ExamGame    quiz={quiz} onLockChange={setLocked} />}
    </div>
  );
}

/** Unified progress strip used by every game type. */
/** Clean cockpit strip used by every active game. */
function ProgressStrip({
  quiz, position, total, time,
}: {
  quiz: AnyQuiz;
  position: number;
  total: number;
  time?: number;
}) {
  const { meta } = accent(quiz);
  const pct = Math.max(0, Math.min(100, Math.round((position / total) * 100)));
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <StripStat label="Questão" value={
          <>
            <span className="text-foreground">{position}</span>
            <span className="text-muted-foreground/60 font-normal"> / {total}</span>
          </>
        } />
        {time !== undefined && (
          <StripStat
            label="Tempo"
            value={<span className="font-mono tracking-tight text-foreground">{fmtTime(time)}</span>}
          />
        )}
      </div>
      <div className="relative h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out", meta.dot)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StripStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-muted-foreground">{label}</span>
      <span className="text-base font-bold tabular-nums leading-none">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MCQ Game                                                           */
/* ------------------------------------------------------------------ */

function MCQGame({ quiz, onLockChange }: { quiz: Extract<AnyQuiz, { type: "mcq" }>; onLockChange?: (locked: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const total = quiz.items.length;
  const current = quiz.items[idx];
  const time = useTimer(!done);

  useEffect(() => { onLockChange?.(!done); }, [done, onLockChange]);
  useEffect(() => () => onLockChange?.(false), [onLockChange]);

  const picked = answers[idx];
  const score = quiz.items.reduce((s, it, i) => s + (answers[i] === it.answer ? 1 : 0), 0);

  const next = () => { if (idx + 1 >= total) setDone(true); else setIdx(idx + 1); };
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const restart = () => { setIdx(0); setAnswers({}); setDone(false); };

  if (done) {
    const review: ReviewItem[] = quiz.items.map((it, i) => ({
      n: i + 1,
      question: it.q,
      correct: answers[i] === it.answer,
      userAnswer: answers[i] !== undefined ? it.options[answers[i]] : null,
      correctAnswer: it.options[it.answer],
      explain: it.explain,
    }));
    return <ResultsCard quiz={quiz} score={score} total={total} time={time} onRestart={restart} review={review} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/30">
        <ProgressStrip quiz={quiz} position={idx + 1} total={total} time={time} />
      </div>

      <div className="p-6 space-y-5">
        <h3 className="text-lg font-semibold text-foreground leading-snug">{current.q}</h3>

        <div className="grid sm:grid-cols-2 gap-2.5">
          {current.options.map((opt, i) => {
            const isPicked = picked === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers(a => ({ ...a, [idx]: i }))}
                className={cn(
                  "text-left p-3.5 rounded-lg border-2 transition-all flex items-center gap-3 group/opt",
                  isPicked
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border transition-colors",
                  isPicked
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border group-hover/opt:border-primary/50",
                )}>{String.fromCharCode(65 + i)}</span>
                <span className="text-sm flex-1 font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={idx === 0} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        <span className="text-[11px] text-muted-foreground hidden sm:block">
          {picked === undefined ? "Selecciona uma opção." : "Resposta registada — podes alterar."}
        </span>
        <Button onClick={next} disabled={picked === undefined} className="gap-2">
          {idx + 1 >= total ? "Terminar" : "Próxima"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Written Game                                                       */
/* ------------------------------------------------------------------ */

function WrittenGame({ quiz, onLockChange }: { quiz: Extract<AnyQuiz, { type: "written" }>; onLockChange?: (locked: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const current = quiz.items[idx];
  const total = quiz.items.length;
  const { meta } = accent(quiz);
  const time = useTimer(true);

  // Written game has no terminal "done" state — lock while mounted, release on unmount.
  useEffect(() => { onLockChange?.(true); return () => onLockChange?.(false); }, [onLockChange]);

  const matches = current.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase()));
  const pct = current.keywords.length ? Math.round((matches.length / current.keywords.length) * 100) : 0;

  const next = () => {
    setIdx((idx + 1) % total);
    setAnswer(""); setSubmitted(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/30">
        <ProgressStrip quiz={quiz} position={idx + 1} total={total} time={time} />
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground leading-snug">{current.q}</h3>
        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Escreve a tua resposta..."
            className="w-full min-h-[160px] rounded-lg border border-input bg-background p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground tabular-nums">
            {answer.trim().length} caracteres
          </span>
        </div>

        {submitted && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Cobertura de conceitos</p>
                <span className="text-sm font-bold tabular-nums text-foreground">{matches.length}/{current.keywords.length} · {pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", meta.dot)} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {current.keywords.map(k => {
                  const hit = matches.includes(k);
                  return (
                    <span key={k} className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                      hit ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-border text-muted-foreground bg-muted/40"
                    )}>
                      {hit ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-50" />}{k}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Resposta-modelo
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">{current.sample}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {submitted ? "Avaliação baseada em palavras-chave." : "Mínimo 10 caracteres para submeter."}
        </span>
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)} disabled={answer.trim().length < 10} className="gap-2">
            <CheckCircle2 className="w-4 h-4" /> Submeter
          </Button>
        ) : (
          <Button onClick={next} className="gap-2">
            Próxima <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Fill Game                                                          */
/* ------------------------------------------------------------------ */

function FillGame({ quiz, onLockChange }: { quiz: Extract<AnyQuiz, { type: "fill" }>; onLockChange?: (locked: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const current = quiz.items[idx];
  const total = quiz.items.length;
  const time = useTimer(!done);

  useEffect(() => { onLockChange?.(!done); }, [done, onLockChange]);
  useEffect(() => () => onLockChange?.(false), [onLockChange]);

  const value = answers[idx] ?? "";
  const score = quiz.items.reduce((s, it, i) => s + ((answers[i] ?? "").trim().toLowerCase() === it.answer.toLowerCase() ? 1 : 0), 0);
  const [before, after] = current.sentence.split("___");

  const next = () => { if (idx + 1 >= total) setDone(true); else setIdx(idx + 1); };
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const restart = () => { setIdx(0); setAnswers({}); setDone(false); };

  if (done) {
    const review: ReviewItem[] = quiz.items.map((it, i) => {
      const ua = (answers[i] ?? "").trim();
      return {
        n: i + 1,
        question: it.sentence.replace("___", "_____"),
        correct: ua.toLowerCase() === it.answer.toLowerCase(),
        userAnswer: ua || null,
        correctAnswer: it.answer,
        explain: it.hint,
      };
    });
    return <ResultsCard quiz={quiz} score={score} total={total} time={time} onRestart={restart} review={review} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-muted/30">
        <ProgressStrip quiz={quiz} position={idx + 1} total={total} time={time} />
      </div>

      <div className="p-6 space-y-5">
        <div className="text-xl text-foreground leading-relaxed flex items-baseline flex-wrap gap-x-2 gap-y-3 font-medium">
          <span>{before}</span>
          <Input
            value={value}
            onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
            placeholder="..."
            className="inline-flex w-44 h-10 text-center font-bold text-base border-2 border-primary/30 focus-visible:border-primary"
          />
          <span>{after}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-amber-300 pl-3 py-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span><span className="font-semibold text-foreground/70">Dica:</span> {current.hint}</span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={idx === 0} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        <span className="text-[11px] text-muted-foreground hidden sm:block">
          {value.trim() ? "Resposta registada — podes alterar." : "Escreve o termo em falta."}
        </span>
        <Button onClick={next} disabled={!value.trim()} className="gap-2">
          {idx + 1 >= total ? "Terminar" : "Próxima"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared end-of-quiz results card                                    */
/* ------------------------------------------------------------------ */

type ReviewItem = {
  n: number;
  question: string;
  correct: boolean;
  userAnswer: string | null;
  correctAnswer: string;
  explain?: string;
};

function ResultsCard({
  quiz, score, total, time, onRestart, review,
}: {
  quiz: AnyQuiz; score: number; total: number; time?: number;
  onRestart: () => void; review?: ReviewItem[];
}) {
  const pct = Math.round((score / total) * 100);
  const tier =
    pct >= 80 ? { label: "Excelente", color: "text-emerald-700 bg-emerald-50 border-emerald-200" } :
    pct >= 50 ? { label: "Bom progresso", color: "text-amber-700 bg-amber-50 border-amber-200" } :
                { label: "Continua a treinar", color: "text-rose-700 bg-rose-50 border-rose-200" };
  const { meta } = accent(quiz);

  return (
    <Card className="overflow-hidden">
      <div className={cn("h-1 w-full", meta.dot)} />
      <div className="p-8 space-y-5">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">Resultado</p>
            <h3 className="text-5xl font-bold text-foreground tracking-tight tabular-nums mt-1">{pct}<span className="text-2xl text-muted-foreground">%</span></h3>
            <p className="text-sm text-muted-foreground mt-1">{score} de {total} respostas correctas{time !== undefined && <> · <span className="font-mono">{fmtTime(time)}</span></>}</p>
          </div>
          <Badge variant="outline" className={cn("text-[11px] font-semibold", tier.color)}>{tier.label}</Badge>
          <div className="max-w-sm mx-auto">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full transition-all duration-500", meta.dot)} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button onClick={onRestart} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Repetir</Button>
          </div>
        </div>

        {review && review.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3 text-left">
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-muted-foreground">Revisão · respostas e explicações</p>
            {review.map(r => (
              <div key={r.n} className={cn(
                "rounded-lg border p-4 space-y-3",
                r.correct ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40",
              )}>
                <div className="flex items-start gap-3">
                  <span className={cn(
                    "shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold tabular-nums text-white",
                    r.correct ? "bg-emerald-500" : "bg-rose-500",
                  )}>{r.n}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">{r.question}</p>
                    <div className="mt-2.5 grid sm:grid-cols-2 gap-2 text-xs">
                      <div className={cn(
                        "rounded-md border px-2.5 py-1.5 bg-card",
                        r.correct ? "border-emerald-200" : "border-rose-200",
                      )}>
                        <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5 flex items-center gap-1">
                          {r.correct ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          Tua resposta
                        </p>
                        <p className={cn("font-semibold", r.correct ? "text-emerald-700" : "text-rose-700")}>
                          {r.userAnswer ?? "— sem resposta —"}
                        </p>
                      </div>
                      {!r.correct && (
                        <div className="rounded-md border border-emerald-200 bg-card px-2.5 py-1.5">
                          <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resposta correcta
                          </p>
                          <p className="font-semibold text-emerald-700">{r.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                    {r.explain && (
                      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed flex gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                        <span>{r.explain}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Exam Game — timed, mixed-question simulation                       */
/* ------------------------------------------------------------------ */

function ExamGame({ quiz, onLockChange }: { quiz: Extract<AnyQuiz, { type: "exam" }>; onLockChange?: (locked: boolean) => void }) {
  const total = quiz.items.length;
  const totalPoints = quiz.items.reduce((s, it) => s + (it.points ?? 10), 0);
  const passing = quiz.passingScore ?? 50;
  const { meta } = accent(quiz);

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(quiz.minutes * 60);

  useEffect(() => { onLockChange?.(started && !submitted); }, [started, submitted, onLockChange]);
  useEffect(() => () => onLockChange?.(false), [onLockChange]);

  useEffect(() => {
    if (!started || submitted) return;
    if (remaining <= 0) { setSubmitted(true); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [started, submitted, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const timeLow = remaining <= 60;

  const scoreFor = (i: number): number => {
    const it = quiz.items[i];
    const pts = it.points ?? 10;
    const a = answers[i];
    if (a === undefined || a === "") return 0;
    if (it.kind === "mcq") return a === it.answer ? pts : 0;
    if (it.kind === "fill") return String(a).trim().toLowerCase() === it.answer.toLowerCase() ? pts : 0;
    const text = String(a).toLowerCase();
    const hits = it.keywords.filter(k => text.includes(k.toLowerCase())).length;
    return Math.round((hits / it.keywords.length) * pts);
  };

  const totalScore = quiz.items.reduce((s, _, i) => s + scoreFor(i), 0);
  const pct = Math.round((totalScore / totalPoints) * 100);
  const passed = pct >= passing;

  const restart = () => {
    setStarted(false); setIdx(0); setAnswers({}); setSubmitted(false);
    setRemaining(quiz.minutes * 60);
  };

  /* ------ Pre-start briefing ------ */
  if (!started) {
    const counts = {
      mcq: quiz.items.filter(i => i.kind === "mcq").length,
      fill: quiz.items.filter(i => i.kind === "fill").length,
      written: quiz.items.filter(i => i.kind === "written").length,
    };
    return (
      <Card className="overflow-hidden">
        <div className={cn("h-1 w-full", meta.dot)} />
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-xl border flex items-center justify-center shrink-0", meta.tile)}>
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">Briefing</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Antes de começares</h3>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <BriefStat label="Duração"   value={`${quiz.minutes} min`} />
            <BriefStat label="Questões"  value={total} />
            <BriefStat label="Aprovação" value={`${passing}%`} />
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">Composição</p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <CompPill type="mcq"     count={counts.mcq} />
              <CompPill type="fill"    count={counts.fill} />
              <CompPill type="written" count={counts.written} />
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-900 leading-relaxed">
              O cronómetro começa ao iniciar e <strong>não pode ser pausado</strong>. Ao terminar o tempo, o exame é submetido automaticamente.
            </p>
          </div>

          <Button onClick={() => setStarted(true)} className="w-full gap-2" size="lg">
            <Play className="w-4 h-4" /> Iniciar Exame
          </Button>
        </div>
      </Card>
    );
  }

  /* ------ Result screen ------ */
  if (submitted) {
    return (
      <Card className="overflow-hidden">
        <div className={cn("h-1 w-full", passed ? "bg-emerald-500" : "bg-amber-500")} />
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto",
              passed ? "bg-emerald-50" : "bg-amber-50"
            )}>
              <Trophy className={cn("w-8 h-8", passed ? "text-emerald-600" : "text-amber-500")} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">Resultado da simulação</p>
            <h3 className="text-5xl font-bold text-foreground tracking-tight tabular-nums">
              {pct}<span className="text-2xl text-muted-foreground">%</span>
            </h3>
            <p className="text-sm text-muted-foreground tabular-nums">{totalScore} / {totalPoints} pontos</p>
            <Badge variant="outline" className={cn(
              "text-[11px] font-semibold",
              passed ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                     : "border-amber-300 text-amber-700 bg-amber-50"
            )}>
              {passed ? "Aprovado" : "Reprovado"} · mínimo {passing}%
            </Badge>
            <div className="max-w-md mx-auto pt-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full transition-all", passed ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Revisão por questão</p>
            {quiz.items.map((it, i) => {
              const s = scoreFor(i);
              const p = it.points ?? 10;
              const full = s === p;
              const none = s === 0;
              const k = it.kind === "mcq" ? "mcq" : it.kind === "fill" ? "fill" : "written";
              const m = TYPE_META[k];
              const label = full ? "Correcto" : none ? "Incorrecto" : "Parcial";
              return (
                <div key={i} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3 text-sm hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-6">#{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0", m.tag)}>{m.label}</span>
                    <span className="truncate text-foreground/85">{it.kind === "fill" ? it.sentence : it.q}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{s}/{p}</span>
                    <span className={cn(
                      "font-semibold text-[10px] px-2 py-0.5 rounded-md border",
                      full ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                      none ? "text-destructive bg-destructive/10 border-destructive/20" :
                      "text-amber-700 bg-amber-50 border-amber-200"
                    )}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={restart} className="w-full gap-2" variant="outline">
            <RotateCcw className="w-4 h-4" /> Repetir Exame
          </Button>
        </div>
      </Card>
    );
  }

  /* ------ Active exam ------ */
  const current = quiz.items[idx];
  const answered = Object.keys(answers).length;
  const k = current.kind === "mcq" ? "mcq" : current.kind === "fill" ? "fill" : "written";
  const qMeta = TYPE_META[k];
  const QIcon = qMeta.icon;

  return (
    <div className="space-y-4">
      {/* Sticky cockpit */}
      <Card className="p-4 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-10 bg-card/95 backdrop-blur border-b-2 border-border">
        <div className="flex items-center gap-4 flex-1 min-w-[220px]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Questão</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{idx + 1} / {total}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Respondidas</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{answered} / {total}</span>
          </div>
          <div className="flex-1 max-w-[200px] hidden sm:block">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full transition-all", meta.dot)} style={{ width: `${(answered / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md font-mono font-bold text-base border-2",
          timeLow ? "bg-destructive/10 text-destructive border-destructive/40 animate-pulse"
                  : "bg-muted text-foreground border-transparent"
        )}>
          <Timer className="w-4 h-4" /> {mm}:{ss}
        </div>
      </Card>

      {/* Question card */}
      <Card className="overflow-hidden">
        <div className={cn("h-0.5 w-full", qMeta.dot)} />
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-md border", qMeta.tile)}>
              <QIcon className="w-3.5 h-3.5" />
            </span>
            <span className={cn("inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border", qMeta.tag)}>{qMeta.label}</span>
            <span className="text-[10px] text-muted-foreground">· {current.points ?? 10} pts</span>
          </div>
        </div>

        <div className="p-6 pt-3 space-y-5">
          {current.kind === "mcq" && (
            <>
              <h3 className="text-lg font-semibold text-foreground leading-snug">{current.q}</h3>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {current.options.map((opt, i) => {
                  const picked = answers[idx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers(a => ({ ...a, [idx]: i }))}
                      className={cn(
                        "text-left p-3.5 rounded-lg border-2 transition-all flex items-center gap-3 group/opt",
                        picked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <span className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border transition-colors",
                        picked ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border group-hover/opt:border-primary/50"
                      )}>{String.fromCharCode(65 + i)}</span>
                      <span className="text-sm flex-1 font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {current.kind === "fill" && (
            <>
              <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Preenche o espaço</h3>
              <div className="text-xl text-foreground leading-relaxed flex items-baseline flex-wrap gap-x-2 gap-y-3 font-medium">
                <span>{current.sentence.split("___")[0]}</span>
                <Input
                  value={(answers[idx] as string) ?? ""}
                  onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                  placeholder="..."
                  className="inline-flex w-48 h-10 text-center font-bold text-base border-2 border-primary/30 focus-visible:border-primary"
                />
                <span>{current.sentence.split("___")[1]}</span>
              </div>
            </>
          )}

          {current.kind === "written" && (
            <>
              <h3 className="text-lg font-semibold text-foreground leading-snug">{current.q}</h3>
              <textarea
                value={(answers[idx] as string) ?? ""}
                onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                placeholder="Escreve a tua resposta..."
                className="w-full min-h-[180px] rounded-lg border border-input bg-background p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Pontuação atribuída pela cobertura de conceitos-chave.
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Navigation footer */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {quiz.items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "w-8 h-8 rounded-md text-[11px] font-bold border-2 transition-all tabular-nums",
                i === idx
                  ? "border-primary bg-primary text-primary-foreground scale-110 shadow-sm"
                  : answers[i] !== undefined
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-500"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted"
              )}
              aria-label={`Ir para questão ${i + 1}`}
            >{i + 1}</button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {answered === total ? "Tudo respondido — podes submeter." : `${total - answered} por responder`}
          </span>
          {idx + 1 < total ? (
            <Button size="sm" onClick={() => setIdx(i => i + 1)} className="gap-1">Próxima <ArrowRight className="w-4 h-4" /></Button>
          ) : (
            <Button size="sm" onClick={() => setSubmitted(true)} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="w-4 h-4" /> Submeter
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <p className="text-2xl font-bold text-foreground leading-tight tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold">{label}</p>
    </div>
  );
}

function CompPill({ type, count }: { type: QuizType; count: number }) {
  const m = TYPE_META[type];
  const Icon = m.icon;
  return (
    <div className={cn("flex items-center gap-2.5 rounded-md border px-3 py-2", m.tile)}>
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80 truncate">{m.label}</p>
        <p className="text-sm font-bold tabular-nums">{count}</p>
      </div>
    </div>
  );
}
