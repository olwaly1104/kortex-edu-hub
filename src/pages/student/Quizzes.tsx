import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft,
  Brain, Pencil, Type, Layers, Trophy, Timer, Play, Search, Filter, BookOpen,
  ClipboardCheck, AlertTriangle,
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

const DIFF_STYLE: Record<Difficulty, string> = {
  "Introdutório": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Intermédio":   "bg-amber-50 text-amber-700 border-amber-200",
  "Avançado":     "bg-rose-50 text-rose-700 border-rose-200",
};

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
    return (
      <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
        <button
          onClick={() => setActiveId(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Centro de Estudo
        </button>
        <QuizHeader quiz={active} />
        {active.type === "mcq"     && <MCQGame quiz={active} />}
        {active.type === "written" && <WrittenGame quiz={active} />}
        {active.type === "fill"    && <FillGame quiz={active} />}
        
        {active.type === "exam"    && <ExamGame quiz={active} />}
      </div>
    );
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
                    tag={cc.tag}
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
        <span className={cn("w-2.5 h-2.5 rounded-sm shrink-0 ring-1 ring-black/5", dot)} />
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

      <div className="hidden md:flex items-center gap-6 shrink-0 pr-2">
        <div className="flex flex-col items-end gap-1 min-w-[64px]">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Duração</span>
          <span className="text-xs font-semibold text-foreground flex items-center gap-1 tabular-nums">
            <Timer className="w-3 h-3 text-muted-foreground" />{quiz.minutes} min
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[80px]">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Dificuldade</span>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", DIFF_STYLE[quiz.difficulty])}>
            {quiz.difficulty}
          </span>
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={onStart} className="gap-1.5 shrink-0 h-8 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
        <Play className="w-3 h-3" /> Iniciar
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Active quiz header                                                 */
/* ------------------------------------------------------------------ */

function QuizHeader({ quiz }: { quiz: AnyQuiz }) {
  const meta = TYPE_META[quiz.type];
  const Icon = meta.icon;
  return (
    <div className="border-b border-border pb-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div className={cn("w-12 h-12 rounded-lg border flex items-center justify-center shrink-0", meta.tile)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] font-semibold border", meta.tag)}>{meta.label}</Badge>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">{quiz.cadeira}</span>
            <span className="text-[10px] text-muted-foreground">· {quiz.ano}º ano</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight mt-1">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{quiz.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px]", DIFF_STYLE[quiz.difficulty])}>{quiz.difficulty}</Badge>
          <Badge variant="outline" className="text-[10px] gap-1"><Timer className="w-3 h-3" />{quiz.minutes} min</Badge>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MCQ Game                                                           */
/* ------------------------------------------------------------------ */

function MCQGame({ quiz }: { quiz: Extract<AnyQuiz, { type: "mcq" }> }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = quiz.items.length;
  const current = quiz.items[idx];

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.answer) setScore(s => s + 1);
  };
  const next = () => {
    if (idx + 1 >= total) setDone(true);
    else { setIdx(idx + 1); setSelected(null); }
  };
  const restart = () => { setIdx(0); setSelected(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <Card className="p-8 text-center space-y-4">
        <Trophy className="w-14 h-14 mx-auto text-primary" />
        <h3 className="text-2xl font-bold text-foreground">{pct}% acertaste</h3>
        <p className="text-muted-foreground">{score} de {total} respostas correctas</p>
        <Progress value={pct} className="h-2 max-w-sm mx-auto" />
        <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Repetir quiz</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Pergunta {idx + 1} / {total}</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{score} certas</span>
      </div>
      <Progress value={((idx + (selected !== null ? 1 : 0)) / total) * 100} className="h-1.5" />
      <h3 className="text-lg font-semibold text-foreground">{current.q}</h3>
      <div className="grid sm:grid-cols-2 gap-2">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.answer;
          const isPicked = i === selected;
          const show = selected !== null;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={selected !== null}
              className={cn(
                "text-left p-3 rounded-lg border-2 transition-all flex items-center gap-2",
                !show && "border-border hover:border-primary hover:bg-primary/5",
                show && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                show && isPicked && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                show && !isCorrect && !isPicked && "border-border opacity-50"
              )}
            >
              <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
              <span className="text-sm flex-1">{opt}</span>
              {show && isCorrect && <CheckCircle2 className="w-4 h-4" />}
              {show && isPicked && !isCorrect && <XCircle className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground border-l-4 border-primary">
          <p className="font-semibold mb-1">Explicação</p>
          <p className="text-muted-foreground">{current.explain}</p>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={next} disabled={selected === null} className="gap-2">
          {idx + 1 >= total ? "Terminar" : "Próxima"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Written Game                                                       */
/* ------------------------------------------------------------------ */

function WrittenGame({ quiz }: { quiz: Extract<AnyQuiz, { type: "written" }> }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const current = quiz.items[idx];

  const matches = current.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase()));
  const pct = Math.round((matches.length / current.keywords.length) * 100);

  const next = () => {
    setIdx((idx + 1) % quiz.items.length);
    setAnswer(""); setSubmitted(false);
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Resposta {idx + 1} / {quiz.items.length}</span>
        <Badge variant="outline" className="gap-1"><Pencil className="w-3 h-3" />Aberto</Badge>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{current.q}</h3>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={submitted}
        placeholder="Escreve a tua resposta..."
        className="w-full min-h-[140px] rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {submitted && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={pct} className="h-2 flex-1" />
            <span className="text-sm font-bold text-foreground">{pct}%</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {current.keywords.map(k => {
              const hit = matches.includes(k);
              return (
                <Badge key={k} variant="outline" className={cn("text-[10px]", hit ? "border-emerald-500 text-emerald-700 bg-emerald-50" : "border-destructive/30 text-muted-foreground")}>
                  {hit ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}{k}
                </Badge>
              );
            })}
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-sm border-l-4 border-primary">
            <p className="font-semibold mb-1 text-foreground">Resposta-modelo</p>
            <p className="text-muted-foreground">{current.sample}</p>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {!submitted
          ? <Button onClick={() => setSubmitted(true)} disabled={answer.trim().length < 10} className="gap-2"><CheckCircle2 className="w-4 h-4" />Submeter</Button>
          : <Button onClick={next} className="gap-2">Próxima <ArrowRight className="w-4 h-4" /></Button>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Fill Game                                                          */
/* ------------------------------------------------------------------ */

function FillGame({ quiz }: { quiz: Extract<AnyQuiz, { type: "fill" }> }) {
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = quiz.items[idx];

  const isRight = value.trim().toLowerCase() === current.answer.toLowerCase();
  const [before, after] = current.sentence.split("___");

  const check = () => {
    setChecked(true);
    if (isRight) setScore(s => s + 1);
  };
  const next = () => {
    if (idx + 1 >= quiz.items.length) setDone(true);
    else { setIdx(idx + 1); setValue(""); setChecked(false); }
  };
  const restart = () => { setIdx(0); setValue(""); setChecked(false); setScore(0); setDone(false); };

  if (done) {
    return (
      <Card className="p-8 text-center space-y-4">
        <Trophy className="w-14 h-14 mx-auto text-primary" />
        <h3 className="text-2xl font-bold text-foreground">{score} / {quiz.items.length}</h3>
        <p className="text-muted-foreground">Espaços preenchidos correctamente</p>
        <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Repetir</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Preenche {idx + 1} / {quiz.items.length}</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{score} certas</span>
      </div>
      <div className="text-lg text-foreground leading-relaxed flex items-center flex-wrap gap-2">
        <span>{before}</span>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={checked}
          placeholder="..."
          className={cn(
            "inline-flex w-40 h-9 text-center font-bold",
            checked && isRight && "border-emerald-500 bg-emerald-50 text-emerald-700",
            checked && !isRight && "border-destructive bg-destructive/10 text-destructive"
          )}
        />
        <span>{after}</span>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Sparkles className="w-3 h-3" />Dica: {current.hint}</p>
      {checked && (
        <div className={cn("rounded-lg p-3 text-sm flex items-center gap-2", isRight ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive")}>
          {isRight ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {isRight ? "Correcto!" : <>Resposta certa: <span className="font-bold">{current.answer}</span></>}
        </div>
      )}
      <div className="flex justify-end">
        {!checked
          ? <Button onClick={check} disabled={!value.trim()} className="gap-2"><CheckCircle2 className="w-4 h-4" />Verificar</Button>
          : <Button onClick={next} className="gap-2">{idx + 1 >= quiz.items.length ? "Terminar" : "Próxima"} <ArrowRight className="w-4 h-4" /></Button>}
      </div>
    </Card>
  );
}


/* ------------------------------------------------------------------ */
/*  Exam Game — timed, mixed-question simulation                       */
/* ------------------------------------------------------------------ */

function ExamGame({ quiz }: { quiz: Extract<AnyQuiz, { type: "exam" }> }) {
  const total = quiz.items.length;
  const totalPoints = quiz.items.reduce((s, it) => s + (it.points ?? 10), 0);
  const passing = quiz.passingScore ?? 50;

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(quiz.minutes * 60);

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
    // written: keyword ratio
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
      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Briefing do Exame</h3>
            <p className="text-sm text-muted-foreground">Lê com atenção antes de iniciar.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <BriefStat label="Duração" value={`${quiz.minutes} min`} />
          <BriefStat label="Secções" value={3} />
          <BriefStat label="Aprovação" value={`${passing}%`} />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
          <p className="font-semibold text-foreground">Composição</p>
          <ul className="text-muted-foreground space-y-1">
            <li>• {counts.mcq} perguntas de múltipla escolha</li>
            <li>• {counts.fill} perguntas de preenchimento</li>
            <li>• {counts.written} perguntas de resposta aberta</li>
          </ul>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-900">
            O cronómetro começa ao iniciar e <strong>não pode ser pausado</strong>. Ao terminar o tempo, o exame é submetido automaticamente.
          </p>
        </div>

        <Button onClick={() => setStarted(true)} className="w-full gap-2" size="lg">
          <Play className="w-4 h-4" /> Iniciar Exame
        </Button>
      </Card>
    );
  }

  /* ------ Result screen ------ */
  if (submitted) {
    return (
      <Card className="p-8 space-y-6">
        <div className="text-center space-y-3">
          <Trophy className={cn("w-14 h-14 mx-auto", passed ? "text-emerald-600" : "text-amber-500")} />
          <h3 className="text-3xl font-bold text-foreground">{pct}%</h3>
          <p className="text-muted-foreground">Resultado da simulação</p>
          <Badge variant="outline" className={cn("text-xs", passed ? "border-emerald-500 text-emerald-700 bg-emerald-50" : "border-amber-500 text-amber-700 bg-amber-50")}>
            {passed ? "Aprovado" : "Reprovado"} · mínimo {passing}%
          </Badge>
        </div>
        <Progress value={pct} className="h-2" />

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Revisão por questão</p>
          {quiz.items.map((it, i) => {
            const s = scoreFor(i);
            const p = it.points ?? 10;
            const full = s === p;
            const none = s === 0;
            const k = it.kind === "mcq" ? "mcq" : it.kind === "fill" ? "fill" : "written";
            const m = TYPE_META[k];
            const label = full ? "Correcto" : none ? "Incorrecto" : "Parcial";
            return (
              <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
                  <Badge variant="outline" className={cn("text-[10px] font-semibold border", m.tag)}>{m.label}</Badge>
                  <span className="truncate text-foreground/80">{it.kind === "fill" ? it.sentence : it.q}</span>
                </div>
                <span className={cn(
                  "font-bold text-[11px] shrink-0 ml-3 px-2 py-0.5 rounded-full border",
                  full ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                  none ? "text-destructive bg-destructive/10 border-destructive/20" :
                  "text-amber-700 bg-amber-50 border-amber-200"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <Button onClick={restart} className="w-full gap-2" variant="outline">
          <RotateCcw className="w-4 h-4" /> Repetir Exame
        </Button>
      </Card>
    );
  }

  /* ------ Active exam ------ */
  const current = quiz.items[idx];
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-10 bg-card/95 backdrop-blur">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-foreground">Questão {idx + 1} / {total}</span>
          <span className="text-muted-foreground">Respondidas: {answered}/{total}</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-bold text-sm",
          timeLow ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-foreground"
        )}>
          <Timer className="w-4 h-4" /> {mm}:{ss}
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          {(() => {
            const k = current.kind === "mcq" ? "mcq" : current.kind === "fill" ? "fill" : "written";
            const m = TYPE_META[k];
            return <Badge variant="outline" className={cn("text-[10px] font-semibold border", m.tag)}>{m.label}</Badge>;
          })()}
        </div>

        {current.kind === "mcq" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">{current.q}</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {current.options.map((opt, i) => {
                const picked = answers[idx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers(a => ({ ...a, [idx]: i }))}
                    className={cn(
                      "text-left p-3 rounded-lg border-2 transition-all flex items-center gap-2",
                      picked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className={cn("w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                      picked ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {current.kind === "fill" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">Preenche o espaço:</h3>
            <div className="text-base text-foreground leading-relaxed flex items-center flex-wrap gap-2">
              <span>{current.sentence.split("___")[0]}</span>
              <Input
                value={(answers[idx] as string) ?? ""}
                onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                placeholder="..."
                className="inline-flex w-44 h-9 text-center font-bold"
              />
              <span>{current.sentence.split("___")[1]}</span>
            </div>
          </>
        )}

        {current.kind === "written" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">{current.q}</h3>
            <textarea
              value={(answers[idx] as string) ?? ""}
              onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
              placeholder="Escreve a tua resposta..."
              className="w-full min-h-[160px] rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">A pontuação é atribuída pela cobertura de conceitos-chave.</p>
          </>
        )}
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>

        <div className="flex flex-wrap gap-1 max-w-md justify-center">
          {quiz.items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "w-7 h-7 rounded text-[10px] font-bold border transition-colors",
                i === idx ? "border-primary bg-primary text-primary-foreground" :
                answers[i] !== undefined ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                "border-border bg-card text-muted-foreground hover:border-primary/50"
              )}
            >{i + 1}</button>
          ))}
        </div>

        {idx + 1 < total ? (
          <Button onClick={() => setIdx(i => i + 1)} className="gap-1">Próxima <ArrowRight className="w-4 h-4" /></Button>
        ) : (
          <Button onClick={() => setSubmitted(true)} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="w-4 h-4" /> Submeter
          </Button>
        )}
      </div>
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
