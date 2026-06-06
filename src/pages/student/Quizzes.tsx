import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft,
  Brain, Pencil, Type, Layers, Trophy, Timer, Play, BookOpen, BarChart3, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MCQ = { q: string; options: string[]; answer: number; explain: string };
type Written = { q: string; keywords: string[]; sample: string };
type Fill = { sentence: string; answer: string; hint: string };
type Flash = { front: string; back: string };
type QuizType = "mcq" | "written" | "fill" | "flash";
type Difficulty = "Fácil" | "Médio" | "Difícil";

type QuizMeta = {
  id: string;
  title: string;
  cadeira: string;
  color: string;
  description: string;
  difficulty: Difficulty;
  minutes: number;
};

type MCQQuiz = QuizMeta & { type: "mcq"; items: MCQ[] };
type WrittenQuiz = QuizMeta & { type: "written"; items: Written[] };
type FillQuiz = QuizMeta & { type: "fill"; items: Fill[] };
type FlashQuiz = QuizMeta & { type: "flash"; items: Flash[] };
type AnyQuiz = MCQQuiz | WrittenQuiz | FillQuiz | FlashQuiz;

/* ------------------------------------------------------------------ */
/*  Content — Engenharia Informática                                   */
/* ------------------------------------------------------------------ */

const QUIZZES: AnyQuiz[] = [
  /* ---------------- MULTIPLE CHOICE ---------------- */
  {
    id: "mcq-prog2",
    type: "mcq",
    title: "Estruturas de Dados em Java",
    cadeira: "Programação II",
    color: "#6366f1",
    description: "Pilhas, filas, listas ligadas e complexidade temporal. Testa o teu conhecimento das estruturas fundamentais.",
    difficulty: "Médio",
    minutes: 6,
    items: [
      { q: "Qual a complexidade temporal da pesquisa numa lista ligada simples não ordenada?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, explain: "Numa lista ligada é necessário percorrer cada nó até encontrar o elemento, no pior caso n nós." },
      { q: "Uma estrutura LIFO corresponde a:", options: ["Fila", "Pilha", "Árvore", "Hashmap"], answer: 1, explain: "Pilha (Stack) — o último elemento a entrar é o primeiro a sair." },
      { q: "Em Java, qual o método que adiciona um elemento ao topo de uma Stack?", options: ["add()", "insert()", "push()", "offer()"], answer: 2, explain: "java.util.Stack usa push() para inserir e pop() para remover do topo." },
      { q: "Notação polaca inversa (RPN) é tipicamente implementada com:", options: ["Fila", "Pilha", "Lista duplamente ligada", "Árvore AVL"], answer: 1, explain: "Os operandos são empilhados e o operador retira os dois últimos da pilha." },
      { q: "Numa fila (queue), FIFO significa:", options: ["Fast In Fast Out", "First In First Out", "Final In First Out", "First In Final Out"], answer: 1, explain: "First In, First Out — o primeiro a entrar é o primeiro a sair." },
    ],
  },
  {
    id: "mcq-mat2",
    type: "mcq",
    title: "Cálculo Integral",
    cadeira: "Matemática II",
    color: "#0ea5e9",
    description: "Primitivas, técnicas de integração e convergência de séries numéricas.",
    difficulty: "Difícil",
    minutes: 5,
    items: [
      { q: "Qual é a primitiva de cos(x)?", options: ["−sen(x) + C", "sen(x) + C", "tan(x) + C", "−cos(x) + C"], answer: 1, explain: "∫ cos(x) dx = sen(x) + C." },
      { q: "A série geométrica Σ rⁿ converge se e só se:", options: ["|r| > 1", "|r| < 1", "r = 1", "r > 0"], answer: 1, explain: "Converge para 1/(1−r) quando |r| < 1." },
      { q: "Qual técnica é mais adequada para ∫ x·eˣ dx?", options: ["Substituição", "Fracções parciais", "Integração por partes", "Substituição trigonométrica"], answer: 2, explain: "Com u = x e dv = eˣ dx, integração por partes dá xeˣ − eˣ + C." },
      { q: "Um integral impróprio é aquele em que:", options: ["A função é descontínua num único ponto interior", "Os limites são finitos e a função contínua", "Os limites são infinitos ou a função tem descontinuidade no intervalo", "Não tem primitiva elementar"], answer: 2, explain: "Têm limites em ±∞ ou descontinuidades dentro do intervalo." },
    ],
  },
  {
    id: "mcq-fis",
    type: "mcq",
    title: "Mecânica Clássica",
    cadeira: "Física Aplicada",
    color: "#f59e0b",
    description: "Leis de Newton, energia, trabalho e a primeira lei da termodinâmica.",
    difficulty: "Fácil",
    minutes: 4,
    items: [
      { q: "A segunda lei de Newton estabelece que:", options: ["F = m·v", "F = m·a", "F = m·g", "F = ½ m·v²"], answer: 1, explain: "Força resultante é igual à massa multiplicada pela aceleração." },
      { q: "Unidade SI de energia é:", options: ["Newton", "Watt", "Joule", "Pascal"], answer: 2, explain: "Joule (J) = N·m." },
      { q: "A primeira lei da termodinâmica é uma expressão de:", options: ["Entropia crescente", "Conservação de energia", "Conservação de momento", "Equilíbrio térmico"], answer: 1, explain: "ΔU = Q − W." },
    ],
  },

  /* ---------------- WRITTEN ---------------- */
  {
    id: "w-prog2",
    type: "written",
    title: "Conceitos de Estruturas de Dados",
    cadeira: "Programação II",
    color: "#6366f1",
    description: "Respostas abertas avaliadas por palavras-chave. Explica conceitos pelas tuas palavras.",
    difficulty: "Médio",
    minutes: 8,
    items: [
      { q: "Explica a diferença entre uma lista ligada simples e uma duplamente ligada.", keywords: ["próximo", "anterior", "ponteiro", "duplamente", "bidireccional"], sample: "Uma lista ligada simples tem nós com referência apenas ao próximo. A duplamente ligada mantém também referência ao anterior, permitindo percorrer nos dois sentidos com maior custo de memória." },
      { q: "Descreve um caso de uso real para uma estrutura de pilha.", keywords: ["undo", "histórico", "navegador", "chamadas", "recursão", "expressões"], sample: "O sistema de undo de um editor de texto: cada operação é empilhada e pode ser desfeita removendo do topo da pilha." },
    ],
  },
  {
    id: "w-mat2",
    type: "written",
    title: "Critérios de Convergência",
    cadeira: "Matemática II",
    color: "#0ea5e9",
    description: "Enuncia e justifica critérios de convergência de séries.",
    difficulty: "Difícil",
    minutes: 6,
    items: [
      { q: "Enuncia o critério da razão para convergência de séries.", keywords: ["limite", "razão", "an+1", "an", "menor", "1"], sample: "Seja L = lim |a_{n+1}/a_n|. Se L < 1, a série converge absolutamente; se L > 1, diverge; se L = 1, o critério é inconclusivo." },
    ],
  },
  {
    id: "w-fis",
    type: "written",
    title: "Energia & Trabalho",
    cadeira: "Física Aplicada",
    color: "#f59e0b",
    description: "Definições conceptuais com fórmulas e unidades.",
    difficulty: "Fácil",
    minutes: 5,
    items: [
      { q: "Define energia cinética e indica a sua fórmula.", keywords: ["movimento", "massa", "velocidade", "½", "quadrado"], sample: "Energia associada ao movimento de um corpo. E_c = ½ m v², onde m é a massa e v a velocidade." },
    ],
  },

  /* ---------------- FILL ---------------- */
  {
    id: "f-prog2",
    type: "fill",
    title: "Vocabulário Java",
    cadeira: "Programação II",
    color: "#6366f1",
    description: "Completa as frases com o termo técnico correcto.",
    difficulty: "Fácil",
    minutes: 4,
    items: [
      { sentence: "O método ___ remove e devolve o elemento do topo de uma pilha em Java.", answer: "pop", hint: "3 letras, oposto de push" },
      { sentence: "Uma estrutura FIFO chama-se ___.", answer: "fila", hint: "Em inglês, queue" },
      { sentence: "A complexidade de inserir no início de uma lista ligada é O(___).", answer: "1", hint: "Tempo constante" },
    ],
  },
  {
    id: "f-mat2",
    type: "fill",
    title: "Fórmulas Essenciais",
    cadeira: "Matemática II",
    color: "#0ea5e9",
    description: "Completa fórmulas e enunciados clássicos do cálculo.",
    difficulty: "Médio",
    minutes: 4,
    items: [
      { sentence: "∫ 1/x dx = ___|x| + C.", answer: "ln", hint: "Logaritmo natural" },
      { sentence: "A soma de uma série geométrica com |r|<1 é a/(1−___).", answer: "r", hint: "A razão" },
      { sentence: "A derivada de eˣ é ___.", answer: "eˣ", hint: "A própria função" },
    ],
  },
  {
    id: "f-fis",
    type: "fill",
    title: "Constantes Físicas",
    cadeira: "Física Aplicada",
    color: "#f59e0b",
    description: "Valores e unidades fundamentais que tens de memorizar.",
    difficulty: "Fácil",
    minutes: 3,
    items: [
      { sentence: "Aceleração da gravidade na Terra é aproximadamente ___ m/s².", answer: "9.8", hint: "Próximo de 10" },
      { sentence: "A unidade SI de potência é o ___.", answer: "watt", hint: "Nome do engenheiro escocês" },
    ],
  },

  /* ---------------- FLASH ---------------- */
  {
    id: "fl-prog2",
    type: "flash",
    title: "Glossário de Estruturas de Dados",
    cadeira: "Programação II",
    color: "#6366f1",
    description: "Cartões de revisão rápida. Marca os que dominas e revisita os outros.",
    difficulty: "Fácil",
    minutes: 5,
    items: [
      { front: "Stack", back: "Estrutura LIFO — Last In, First Out. Operações: push, pop, peek." },
      { front: "Queue", back: "Estrutura FIFO — First In, First Out. Operações: enqueue/offer, dequeue/poll." },
      { front: "Lista ligada", back: "Sequência de nós onde cada nó contém dados e referência ao próximo nó." },
      { front: "HashMap", back: "Estrutura chave-valor com acesso médio O(1), baseada em função de dispersão." },
      { front: "Recursão", back: "Função que se chama a si própria; usa a pilha de chamadas do sistema." },
    ],
  },
  {
    id: "fl-mat2",
    type: "flash",
    title: "Cartões de Cálculo",
    cadeira: "Matemática II",
    color: "#0ea5e9",
    description: "Definições e fórmulas-chave de integrais e séries.",
    difficulty: "Médio",
    minutes: 5,
    items: [
      { front: "Integração por partes", back: "∫ u dv = u·v − ∫ v du" },
      { front: "Série telescópica", back: "Série em que os termos se cancelam sucessivamente." },
      { front: "Critério da raiz", back: "L = lim ⁿ√|a_n|. Converge se L<1, diverge se L>1." },
      { front: "Integral definido", back: "∫ₐᵇ f(x)dx = F(b) − F(a), onde F é primitiva de f." },
    ],
  },
  {
    id: "fl-fis",
    type: "flash",
    title: "Conceitos de Física",
    cadeira: "Física Aplicada",
    color: "#f59e0b",
    description: "Trabalho, potência, entropia e outros conceitos centrais.",
    difficulty: "Fácil",
    minutes: 4,
    items: [
      { front: "Trabalho", back: "W = F · d · cos(θ). Unidade: Joule." },
      { front: "Potência", back: "P = W/t. Unidade: Watt = J/s." },
      { front: "Entropia", back: "Medida da desordem de um sistema; tende a aumentar num sistema isolado." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Type metadata                                                      */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<QuizType, { label: string; short: string; icon: React.ElementType; color: string; description: string }> = {
  mcq:     { label: "Múltipla Escolha", short: "MCQ",      icon: Brain,  color: "text-indigo-600 bg-indigo-50",   description: "Escolhe a resposta correcta entre várias opções." },
  written: { label: "Resposta Escrita", short: "Aberto",   icon: Pencil, color: "text-rose-600 bg-rose-50",       description: "Responde por palavras tuas; avaliado por palavras-chave." },
  fill:    { label: "Preenche o Espaço",short: "Preenche", icon: Type,   color: "text-amber-600 bg-amber-50",     description: "Escreve a palavra ou valor em falta numa frase." },
  flash:   { label: "Flashcards",       short: "Cartões",  icon: Layers, color: "text-emerald-600 bg-emerald-50", description: "Cartões de revisão rápida — vê a frente, revela o verso." },
};

const DIFF_COLOR: Record<Difficulty, string> = {
  "Fácil":   "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Médio":   "bg-amber-50 text-amber-700 border-amber-200",
  "Difícil": "bg-rose-50 text-rose-700 border-rose-200",
};

/* ------------------------------------------------------------------ */
/*  Page shell                                                         */
/* ------------------------------------------------------------------ */

export default function StudentQuizzes() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<QuizType>("mcq");
  const active = useMemo(() => QUIZZES.find(q => q.id === activeId) ?? null, [activeId]);

  if (active) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <button
          onClick={() => setActiveId(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao menu de quizzes
        </button>
        <QuizHeader quiz={active} />
        {active.type === "mcq"     && <MCQGame quiz={active} />}
        {active.type === "written" && <WrittenGame quiz={active} />}
        {active.type === "fill"    && <FillGame quiz={active} />}
        {active.type === "flash"   && <FlashGame quiz={active} />}
      </div>
    );
  }

  const byType = (t: QuizType) => QUIZZES.filter(q => q.type === t);
  const total = QUIZZES.length;
  const totalQuestions = QUIZZES.reduce((s, q) => s + q.items.length, 0);
  const cadeiras = new Set(QUIZZES.map(q => q.cadeira)).size;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Centro de Quizzes</h1>
              <p className="text-sm text-muted-foreground">Escolhe o tipo de quiz e a cadeira. Cada quiz tem a sua duração, dificuldade e número de perguntas.</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1"><Trophy className="w-3 h-3 text-primary" />{total} quizzes</Badge>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1"><BarChart3 className="w-3 h-3 text-primary" />{totalQuestions} perguntas</Badge>
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1"><BookOpen className="w-3 h-3 text-primary" />{cadeiras} cadeiras</Badge>
          </div>
        </div>
      </div>

      {/* Type tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as QuizType)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1">
          {(Object.keys(TYPE_META) as QuizType[]).map(t => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const count = byType(t).length;
            return (
              <TabsTrigger key={t} value={t} className="gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-[10px] font-bold opacity-70">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(TYPE_META) as QuizType[]).map(t => {
          const meta = TYPE_META[t];
          return (
            <TabsContent key={t} value={t} className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
                  <meta.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {byType(t).map(q => (
                  <QuizCard key={q.id} quiz={q} onStart={() => setActiveId(q.id)} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz card (in menu)                                                */
/* ------------------------------------------------------------------ */

function QuizCard({ quiz, onStart }: { quiz: AnyQuiz; onStart: () => void }) {
  const meta = TYPE_META[quiz.type];
  const Icon = meta.icon;
  return (
    <Card className="p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: quiz.color + "20", color: quiz.color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">{quiz.cadeira}</p>
          <h3 className="font-semibold text-foreground leading-tight mt-0.5 line-clamp-2">{quiz.title}</h3>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{quiz.description}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="gap-1 text-[10px]"><BarChart3 className="w-3 h-3" />{quiz.items.length} {quiz.type === "flash" ? "cartões" : "perguntas"}</Badge>
        <Badge variant="outline" className="gap-1 text-[10px]"><Timer className="w-3 h-3" />{quiz.minutes} min</Badge>
        <Badge variant="outline" className={cn("gap-1 text-[10px]", DIFF_COLOR[quiz.difficulty])}><Flame className="w-3 h-3" />{quiz.difficulty}</Badge>
      </div>

      <Button onClick={onStart} className="w-full gap-2 mt-auto group-hover:bg-primary/90">
        <Play className="w-4 h-4" /> Iniciar
      </Button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Active quiz header                                                 */
/* ------------------------------------------------------------------ */

function QuizHeader({ quiz }: { quiz: AnyQuiz }) {
  const meta = TYPE_META[quiz.type];
  const Icon = meta.icon;
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: quiz.color + "20", color: quiz.color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">{quiz.cadeira} · {meta.label}</p>
          <h2 className="text-xl font-bold text-foreground leading-tight mt-0.5">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1"><BarChart3 className="w-3 h-3" />{quiz.items.length}</Badge>
          <Badge variant="outline" className="gap-1"><Timer className="w-3 h-3" />{quiz.minutes} min</Badge>
          <Badge variant="outline" className={cn("gap-1", DIFF_COLOR[quiz.difficulty])}><Flame className="w-3 h-3" />{quiz.difficulty}</Badge>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MCQ Game                                                           */
/* ------------------------------------------------------------------ */

function MCQGame({ quiz }: { quiz: MCQQuiz }) {
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
        <h3 className="text-2xl font-bold text-foreground">{pct}% acertaste!</h3>
        <p className="text-muted-foreground">{score} de {total} corretas</p>
        <Progress value={pct} className="h-2 max-w-sm mx-auto" />
        <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Jogar de novo</Button>
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
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
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

function WrittenGame({ quiz }: { quiz: WrittenQuiz }) {
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
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
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

function FillGame({ quiz }: { quiz: FillQuiz }) {
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
        <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Tentar de novo</Button>
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
            "inline-flex w-32 h-9 text-center font-bold",
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

function FlashGame({ quiz }: { quiz: FlashQuiz }) {
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
            className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card flex flex-col items-center justify-center p-8 shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge variant="outline" className="mb-4 gap-1"><Layers className="w-3 h-3" />Conceito</Badge>
            <p className="text-3xl font-bold text-foreground text-center">{card.front}</p>
            <p className="text-xs text-muted-foreground mt-6">Clica para revelar</p>
          </div>
          <div
            className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 shadow-md"
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
