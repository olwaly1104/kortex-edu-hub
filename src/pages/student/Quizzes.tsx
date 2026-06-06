import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft,
  Brain, Pencil, Type, Layers, Trophy, Timer, Zap, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Quiz content — Engenharia Informática                              */
/* ------------------------------------------------------------------ */

type MCQ = { q: string; options: string[]; answer: number; explain: string };
type Written = { q: string; keywords: string[]; sample: string };
type Fill = { sentence: string; answer: string; hint: string }; // sentence has ___
type Flash = { front: string; back: string };

type QuizPack = {
  id: string;
  title: string;
  subject: string;
  color: string;
  icon: React.ElementType;
  mcq: MCQ[];
  written: Written[];
  fill: Fill[];
  flash: Flash[];
};

const PACKS: QuizPack[] = [
  {
    id: "prog2",
    title: "Programação II",
    subject: "Estruturas de Dados em Java",
    color: "#6366f1",
    icon: Brain,
    mcq: [
      {
        q: "Qual a complexidade temporal da pesquisa numa lista ligada simples não ordenada?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answer: 2,
        explain: "Numa lista ligada é necessário percorrer cada nó até encontrar o elemento, no pior caso n nós.",
      },
      {
        q: "Uma estrutura LIFO corresponde a:",
        options: ["Fila", "Pilha", "Árvore", "Hashmap"],
        answer: 1,
        explain: "Pilha (Stack) — o último elemento a entrar é o primeiro a sair (Last In, First Out).",
      },
      {
        q: "Em Java, qual o método que adiciona um elemento ao topo de uma Stack?",
        options: ["add()", "insert()", "push()", "offer()"],
        answer: 2,
        explain: "java.util.Stack usa push() para inserir e pop() para remover do topo.",
      },
      {
        q: "Notação polaca inversa (RPN) é tipicamente implementada com:",
        options: ["Fila", "Pilha", "Lista duplamente ligada", "Árvore AVL"],
        answer: 1,
        explain: "Os operandos são empilhados e o operador retira os dois últimos da pilha.",
      },
      {
        q: "Numa fila (queue), FIFO significa:",
        options: ["Fast In Fast Out", "First In First Out", "Final In First Out", "First In Final Out"],
        answer: 1,
        explain: "First In, First Out — o primeiro a entrar é o primeiro a sair.",
      },
    ],
    written: [
      {
        q: "Explica a diferença entre uma lista ligada simples e uma duplamente ligada.",
        keywords: ["próximo", "anterior", "ponteiro", "duplamente", "bidireccional"],
        sample: "Uma lista ligada simples tem nós com referência apenas ao próximo. A duplamente ligada mantém também referência ao anterior, permitindo percorrer nos dois sentidos com maior custo de memória.",
      },
      {
        q: "Descreve um caso de uso real para uma estrutura de pilha.",
        keywords: ["undo", "histórico", "navegador", "chamadas", "recursão", "expressões"],
        sample: "O sistema de undo de um editor de texto: cada operação é empilhada e pode ser desfeita removendo do topo da pilha.",
      },
    ],
    fill: [
      { sentence: "O método ___ remove e devolve o elemento do topo de uma pilha em Java.", answer: "pop", hint: "3 letras, oposto de push" },
      { sentence: "Uma estrutura FIFO chama-se ___.", answer: "fila", hint: "Em inglês, queue" },
      { sentence: "A complexidade de inserir no início de uma lista ligada é O(___).", answer: "1", hint: "Tempo constante" },
    ],
    flash: [
      { front: "Stack", back: "Estrutura LIFO — Last In, First Out. Operações: push, pop, peek." },
      { front: "Queue", back: "Estrutura FIFO — First In, First Out. Operações: enqueue/offer, dequeue/poll." },
      { front: "Lista ligada", back: "Sequência de nós onde cada nó contém dados e referência ao próximo nó." },
      { front: "HashMap", back: "Estrutura chave-valor com acesso médio O(1), baseada em função de dispersão." },
      { front: "Recursão", back: "Função que se chama a si própria; usa a pilha de chamadas do sistema." },
    ],
  },
  {
    id: "mat2",
    title: "Matemática II",
    subject: "Cálculo Integral e Séries",
    color: "#0ea5e9",
    icon: Target,
    mcq: [
      {
        q: "Qual é a primitiva de cos(x)?",
        options: ["−sen(x) + C", "sen(x) + C", "tan(x) + C", "−cos(x) + C"],
        answer: 1,
        explain: "∫ cos(x) dx = sen(x) + C, pois a derivada de sen(x) é cos(x).",
      },
      {
        q: "A série geométrica Σ rⁿ converge se e só se:",
        options: ["|r| > 1", "|r| < 1", "r = 1", "r > 0"],
        answer: 1,
        explain: "Converge para 1/(1−r) quando |r| < 1; diverge caso contrário.",
      },
      {
        q: "Qual técnica é mais adequada para ∫ x·eˣ dx?",
        options: ["Substituição", "Fracções parciais", "Integração por partes", "Substituição trigonométrica"],
        answer: 2,
        explain: "Com u = x e dv = eˣ dx, integração por partes dá xeˣ − eˣ + C.",
      },
      {
        q: "Um integral impróprio é aquele em que:",
        options: ["A função é descontínua num único ponto interior", "Os limites são finitos e a função contínua", "Os limites são infinitos ou a função tem descontinuidade no intervalo", "Não tem primitiva elementar"],
        answer: 2,
        explain: "Improprios podem ter limites em ±∞ ou descontinuidades dentro do intervalo de integração.",
      },
    ],
    written: [
      {
        q: "Enuncia o critério da razão para convergência de séries.",
        keywords: ["limite", "razão", "an+1", "an", "menor", "1"],
        sample: "Seja L = lim |a_{n+1}/a_n|. Se L < 1, a série converge absolutamente; se L > 1, diverge; se L = 1, o critério é inconclusivo.",
      },
    ],
    fill: [
      { sentence: "∫ 1/x dx = ___|x| + C.", answer: "ln", hint: "Logaritmo natural" },
      { sentence: "A soma de uma série geométrica de razão r, com |r|<1, é a/(1−___).", answer: "r", hint: "A razão" },
      { sentence: "A derivada de eˣ é ___.", answer: "eˣ", hint: "A própria função" },
    ],
    flash: [
      { front: "Integração por partes", back: "∫ u dv = u·v − ∫ v du" },
      { front: "Série telescópica", back: "Série em que os termos se cancelam sucessivamente; soma é o primeiro menos o limite." },
      { front: "Critério da raiz", back: "L = lim ⁿ√|a_n|. Converge se L<1, diverge se L>1." },
      { front: "Integral definido", back: "∫ₐᵇ f(x)dx = F(b) − F(a), onde F é primitiva de f." },
    ],
  },
  {
    id: "fis",
    title: "Física Aplicada",
    subject: "Mecânica e Termodinâmica",
    color: "#f59e0b",
    icon: Zap,
    mcq: [
      {
        q: "A segunda lei de Newton estabelece que:",
        options: ["F = m·v", "F = m·a", "F = m·g", "F = ½ m·v²"],
        answer: 1,
        explain: "Força resultante é igual à massa multiplicada pela aceleração.",
      },
      {
        q: "Unidade SI de energia é:",
        options: ["Newton", "Watt", "Joule", "Pascal"],
        answer: 2,
        explain: "Joule (J) = N·m; Watt é potência (J/s); Pascal é pressão.",
      },
      {
        q: "A primeira lei da termodinâmica é uma expressão de:",
        options: ["Entropia crescente", "Conservação de energia", "Conservação de momento", "Equilíbrio térmico"],
        answer: 1,
        explain: "ΔU = Q − W: a variação de energia interna iguala calor absorvido menos trabalho realizado.",
      },
    ],
    written: [
      {
        q: "Define energia cinética e indica a sua fórmula.",
        keywords: ["movimento", "massa", "velocidade", "½", "quadrado"],
        sample: "Energia associada ao movimento de um corpo. E_c = ½ m v², onde m é a massa e v a velocidade.",
      },
    ],
    fill: [
      { sentence: "Aceleração da gravidade na Terra é aproximadamente ___ m/s².", answer: "9.8", hint: "Próximo de 10" },
      { sentence: "A unidade SI de potência é o ___.", answer: "watt", hint: "Nome do engenheiro escocês" },
    ],
    flash: [
      { front: "Trabalho", back: "W = F · d · cos(θ). Unidade: Joule." },
      { front: "Potência", back: "P = W/t. Unidade: Watt = J/s." },
      { front: "Entropia", back: "Medida da desordem de um sistema; tende a aumentar num sistema isolado." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Mode = "menu" | "mcq" | "written" | "fill" | "flash";

export default function StudentQuizzes() {
  const [packId, setPackId] = useState<string>(PACKS[0].id);
  const [mode, setMode] = useState<Mode>("menu");
  const pack = useMemo(() => PACKS.find(p => p.id === packId)!, [packId]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quizzes & Flashcards</h1>
            <p className="text-sm text-muted-foreground">Treina o que aprendeste com jogos dinâmicos por cadeira.</p>
          </div>
        </div>
      </div>

      {/* Pack selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PACKS.map(p => {
          const Icon = p.icon;
          const active = p.id === packId;
          return (
            <button
              key={p.id}
              onClick={() => { setPackId(p.id); setMode("menu"); }}
              className={cn(
                "text-left rounded-xl border p-4 transition-all hover:shadow-md",
                active ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: p.color + "20", color: p.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <Badge variant="outline" className="gap-1"><Brain className="w-3 h-3" />{p.mcq.length} MCQ</Badge>
                <Badge variant="outline" className="gap-1"><Pencil className="w-3 h-3" />{p.written.length}</Badge>
                <Badge variant="outline" className="gap-1"><Type className="w-3 h-3" />{p.fill.length}</Badge>
                <Badge variant="outline" className="gap-1"><Layers className="w-3 h-3" />{p.flash.length}</Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode tabs */}
      <Tabs value={mode === "menu" ? "mcq" : mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="mcq" className="gap-1.5"><Brain className="w-4 h-4" />Múltipla Escolha</TabsTrigger>
          <TabsTrigger value="written" className="gap-1.5"><Pencil className="w-4 h-4" />Escrita</TabsTrigger>
          <TabsTrigger value="fill" className="gap-1.5"><Type className="w-4 h-4" />Preenche</TabsTrigger>
          <TabsTrigger value="flash" className="gap-1.5"><Layers className="w-4 h-4" />Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="mcq" className="mt-4"><MCQGame key={pack.id + "mcq"} pack={pack} /></TabsContent>
        <TabsContent value="written" className="mt-4"><WrittenGame key={pack.id + "w"} pack={pack} /></TabsContent>
        <TabsContent value="fill" className="mt-4"><FillGame key={pack.id + "f"} pack={pack} /></TabsContent>
        <TabsContent value="flash" className="mt-4"><FlashGame key={pack.id + "fl"} pack={pack} /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MCQ Game                                                           */
/* ------------------------------------------------------------------ */

function MCQGame({ pack }: { pack: QuizPack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = pack.mcq.length;
  const current = pack.mcq[idx];

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

function WrittenGame({ pack }: { pack: QuizPack }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const current = pack.written[idx];

  const matches = current.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase()));
  const pct = Math.round((matches.length / current.keywords.length) * 100);

  const next = () => {
    setIdx((idx + 1) % pack.written.length);
    setAnswer(""); setSubmitted(false);
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Resposta escrita {idx + 1} / {pack.written.length}</span>
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
/*  Fill-in-the-blank Game                                             */
/* ------------------------------------------------------------------ */

function FillGame({ pack }: { pack: QuizPack }) {
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = pack.fill[idx];

  const isRight = value.trim().toLowerCase() === current.answer.toLowerCase();
  const [before, after] = current.sentence.split("___");

  const check = () => {
    setChecked(true);
    if (isRight) setScore(s => s + 1);
  };
  const next = () => {
    if (idx + 1 >= pack.fill.length) setDone(true);
    else { setIdx(idx + 1); setValue(""); setChecked(false); }
  };
  const restart = () => { setIdx(0); setValue(""); setChecked(false); setScore(0); setDone(false); };

  if (done) {
    return (
      <Card className="p-8 text-center space-y-4">
        <Trophy className="w-14 h-14 mx-auto text-primary" />
        <h3 className="text-2xl font-bold text-foreground">{score} / {pack.fill.length}</h3>
        <p className="text-muted-foreground">Espaços preenchidos correctamente</p>
        <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Tentar de novo</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Preenche {idx + 1} / {pack.fill.length}</span>
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
          : <Button onClick={next} className="gap-2">{idx + 1 >= pack.fill.length ? "Terminar" : "Próxima"} <ArrowRight className="w-4 h-4" /></Button>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Flashcards Game                                                    */
/* ------------------------------------------------------------------ */

function FlashGame({ pack }: { pack: QuizPack }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const card = pack.flash[idx];

  const prev = () => { setIdx((idx - 1 + pack.flash.length) % pack.flash.length); setFlipped(false); };
  const next = () => { setIdx((idx + 1) % pack.flash.length); setFlipped(false); };
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
        <span>Cartão {idx + 1} / {pack.flash.length}</span>
        <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Dominados: {known.size} / {pack.flash.length}</span>
      </div>
      <Progress value={(known.size / pack.flash.length) * 100} className="h-1.5" />

      <button
        onClick={() => setFlipped(f => !f)}
        className="w-full perspective-1000 group"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-[280px] transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card flex flex-col items-center justify-center p-8 shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge variant="outline" className="mb-4 gap-1"><Layers className="w-3 h-3" />Conceito</Badge>
            <p className="text-3xl font-bold text-foreground text-center">{card.front}</p>
            <p className="text-xs text-muted-foreground mt-6">Clica para revelar</p>
          </div>
          {/* Back */}
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
