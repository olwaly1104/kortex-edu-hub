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
type Flash = { front: string; back: string };
type QuizType = "mcq" | "written" | "fill" | "flash" | "exam";
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
  | (Base & { type: "flash";   items: Flash[] })
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
    id: "qz-008", code: "QZ-008", type: "flash",
    title: "Mestres da Arquitectura",
    cadeira: "História da Arquitectura", ano: 2,
    description: "Cartões com os arquitectos fundamentais dos sécs. XX e XXI.",
    difficulty: "Intermédio", minutes: 6,
    items: [
      { front: "Le Corbusier", back: "Suíço-francês (1887–1965). Cinco pontos da nova arquitectura, Unité d'Habitation, Villa Savoye, Ronchamp." },
      { front: "Mies van der Rohe", back: "Alemão-americano (1886–1969). «Less is more». Pavilhão de Barcelona, Seagram Building, Farnsworth House." },
      { front: "Frank Lloyd Wright", back: "Americano (1867–1959). Arquitectura orgânica. Casa da Cascata, Guggenheim NY, Robie House." },
      { front: "Álvaro Siza", back: "Português (n. 1933). Pritzker 1992. Piscinas de Leça, Faculdade de Arquitectura do Porto, Pavilhão de Portugal." },
      { front: "Zaha Hadid", back: "Iraquiano-britânica (1950–2016). Pritzker 2004. Fluidez, parametricismo. MAXXI Roma, Heydar Aliyev." },
      { front: "Tadao Ando", back: "Japonês (n. 1941). Betão à vista, luz, vazio. Igreja da Luz, Naoshima, Church on the Water." },
    ],
  },
  {
    id: "qz-009", code: "QZ-009", type: "flash",
    title: "Glossário de Construção",
    cadeira: "Construção I", ano: 2,
    description: "Elementos construtivos: paredes, lajes, coberturas, vãos.",
    difficulty: "Introdutório", minutes: 4,
    items: [
      { front: "Lintel", back: "Elemento estrutural horizontal sobre um vão (porta ou janela) que suporta a carga acima." },
      { front: "Padieira", back: "O mesmo que lintel — viga sobre um vão de porta ou janela." },
      { front: "Pano de parede", back: "Superfície contínua de parede entre dois elementos estruturais (pilares, paredes-mestras)." },
      { front: "Cota de soleira", back: "Altura do pavimento da entrada de um edifício em relação ao terreno." },
      { front: "Beirado", back: "Extremidade inferior de uma cobertura inclinada, que sobressai sobre a parede." },
    ],
  },
  {
    id: "qz-010", code: "QZ-010", type: "flash",
    title: "Geometria Descritiva",
    cadeira: "Geometria Descritiva", ano: 1,
    description: "Conceitos de projecção, vistas e representação no espaço.",
    difficulty: "Introdutório", minutes: 4,
    items: [
      { front: "Projecção ortogonal", back: "Representação de um objecto através das suas projecções perpendiculares aos planos horizontal e vertical." },
      { front: "Axonometria", back: "Projecção paralela que mantém medidas em três eixos; permite ler o objecto tridimensionalmente." },
      { front: "Perspectiva cónica", back: "Projecção central com ponto(s) de fuga, imita a visão humana." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Type metadata                                                      */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<QuizType, { label: string; icon: React.ElementType; description: string }> = {
  mcq:     { label: "Múltipla Escolha",  icon: Brain,           description: "Selecciona a resposta correcta entre opções." },
  written: { label: "Resposta Escrita",  icon: Pencil,          description: "Resposta aberta avaliada por palavras-chave." },
  fill:    { label: "Preencher Espaço",  icon: Type,            description: "Completa uma frase com o termo em falta." },
  flash:   { label: "Flashcards",        icon: Layers,          description: "Cartões de revisão rápida — frente e verso." },
  exam:    { label: "Exame de Treino",   icon: ClipboardCheck,  description: "Simulação cronometrada com perguntas mistas." },
};

const DIFF_STYLE: Record<Difficulty, string> = {
  "Introdutório": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Intermédio":   "bg-amber-50 text-amber-700 border-amber-200",
  "Avançado":     "bg-rose-50 text-rose-700 border-rose-200",
};

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
          <ArrowLeft className="w-4 h-4" /> Voltar ao Centro de Quizzes
        </button>
        <QuizHeader quiz={active} />
        {active.type === "mcq"     && <MCQGame quiz={active} />}
        {active.type === "written" && <WrittenGame quiz={active} />}
        {active.type === "fill"    && <FillGame quiz={active} />}
        {active.type === "flash"   && <FlashGame quiz={active} />}
        {active.type === "exam"    && <ExamGame quiz={active} />}
      </div>
    );
  }

  const total = QUIZZES.length;
  const totalItems = QUIZZES.reduce((s, q) => s + q.items.length, 0);
  const typeCounts: Record<QuizType | "all", number> = {
    all: total,
    mcq: QUIZZES.filter(q => q.type === "mcq").length,
    written: QUIZZES.filter(q => q.type === "written").length,
    fill: QUIZZES.filter(q => q.type === "fill").length,
    flash: QUIZZES.filter(q => q.type === "flash").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Editorial header */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-border pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-primary mb-1.5">Centro de Estudo · Arquitectura</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Quizzes & Flashcards</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            Treino dirigido às cadeiras do Curso de Arquitectura. Escolhe a tipologia, a cadeira e o quiz que pretendes realizar — cada exercício tem duração estimada, dificuldade e número de questões.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[280px]">
          <KpiStat label="Quizzes" value={total} />
          <KpiStat label="Questões" value={totalItems} />
          <KpiStat label="Cadeiras" value={cadeiras.length} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar filters */}
        <aside className="space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Filter className="w-3 h-3" /> Tipologia
            </p>
            <div className="space-y-1">
              <FilterRow active={typeFilter === "all"} onClick={() => setTypeFilter("all")} icon={Sparkles} label="Todos os tipos" count={typeCounts.all} />
              {(Object.keys(TYPE_META) as QuizType[]).map(t => (
                <FilterRow
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  icon={TYPE_META[t].icon}
                  label={TYPE_META[t].label}
                  count={typeCounts[t]}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> Cadeira
            </p>
            <div className="space-y-1">
              <FilterRow active={cadeiraFilter === "all"} onClick={() => setCadeiraFilter("all")} label="Todas as cadeiras" count={QUIZZES.length} />
              {cadeiras.map(c => (
                <FilterRow
                  key={c}
                  active={cadeiraFilter === c}
                  onClick={() => setCadeiraFilter(c)}
                  label={c}
                  count={QUIZZES.filter(q => q.cadeira === c).length}
                />
              ))}
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
              {filtered.length} {filtered.length === 1 ? "quiz" : "quizzes"}
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
                Nenhum quiz corresponde aos filtros aplicados.
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
  active, onClick, icon: Icon, label, count,
}: { active: boolean; onClick: () => void; icon?: React.ElementType; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>{count}</span>
    </button>
  );
}

function QuizRow({ quiz, onStart }: { quiz: AnyQuiz; onStart: () => void }) {
  const meta = TYPE_META[quiz.type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
      <div className="w-10 h-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground/70" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">{quiz.code}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">{quiz.cadeira}</span>
          <span className="text-[10px] text-muted-foreground">· {quiz.ano}º ano</span>
        </div>
        <h3 className="font-semibold text-foreground leading-tight mt-1 truncate">{quiz.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{quiz.description}</p>
      </div>

      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Badge variant="outline" className="text-[10px] font-medium">{meta.label}</Badge>
        <Badge variant="outline" className={cn("text-[10px] font-medium", DIFF_STYLE[quiz.difficulty])}>{quiz.difficulty}</Badge>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-[11px] text-muted-foreground shrink-0 min-w-[110px]">
        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{quiz.items.length}</span>
        <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{quiz.minutes} min</span>
      </div>

      <Button size="sm" onClick={onStart} className="gap-1.5 shrink-0">
        <Play className="w-3.5 h-3.5" /> Iniciar
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
        <div className="w-12 h-12 rounded-lg border border-border bg-muted/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-foreground/70" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-semibold text-muted-foreground">{quiz.code}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">{quiz.cadeira}</span>
            <span className="text-[10px] text-muted-foreground">· {quiz.ano}º ano</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-tight mt-1">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{quiz.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
          <Badge variant="outline" className={cn("text-[10px]", DIFF_STYLE[quiz.difficulty])}>{quiz.difficulty}</Badge>
          <Badge variant="outline" className="text-[10px] gap-1"><Layers className="w-3 h-3" />{quiz.items.length}</Badge>
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
        <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-primary" />{score} pts</span>
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
        <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-primary" />{score} pts</span>
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
/*  Flash Game                                                         */
/* ------------------------------------------------------------------ */

function FlashGame({ quiz }: { quiz: Extract<AnyQuiz, { type: "flash" }> }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const card = quiz.items[idx];

  const prev = () => { setIdx((idx - 1 + quiz.items.length) % quiz.items.length); setFlipped(false); };
  const next = () => { setIdx((idx + 1) % quiz.items.length); setFlipped(false); };
  const mark = (yes: boolean) => {
    setKnown(s => {
      const n = new Set(s);
      if (yes) n.add(idx); else n.delete(idx);
      return n;
    });
    next();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Cartão {idx + 1} / {quiz.items.length}</span>
        <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Dominados: {known.size} / {quiz.items.length}</span>
      </div>
      <Progress value={(known.size / quiz.items.length) * 100} className="h-1.5" />

      <button onClick={() => setFlipped(f => !f)} className="w-full" style={{ perspective: "1000px" }}>
        <div
          className="relative w-full h-[280px] transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-card flex flex-col items-center justify-center p-8 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge variant="outline" className="mb-4 gap-1"><Layers className="w-3 h-3" />Conceito</Badge>
            <p className="text-3xl font-bold text-foreground text-center">{card.front}</p>
            <p className="text-xs text-muted-foreground mt-6">Clica para revelar</p>
          </div>
          <div
            className="absolute inset-0 rounded-2xl border border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 shadow-sm"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <Badge variant="outline" className="mb-4 gap-1 border-primary-foreground/40 text-primary-foreground"><CheckCircle2 className="w-3 h-3" />Definição</Badge>
            <p className="text-lg font-medium text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={prev} className="gap-1"><ArrowLeft className="w-4 h-4" />Anterior</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mark(false)} className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
            <XCircle className="w-4 h-4" />Rever
          </Button>
          <Button size="sm" onClick={() => mark(true)} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="w-4 h-4" />Sei!
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={next} className="gap-1">Próximo<ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
