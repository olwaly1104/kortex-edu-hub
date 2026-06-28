import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  FileText,
  Presentation,
  Video as VideoIcon,
  UserCheck,
  AlarmClock,
  LogOut,
  Lock,
  X,
  HelpCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// =============================================================
// MOCK DATA — substituir por backend (lessons / turma / alunos)
// =============================================================
const MOCK_LESSON = {
  id: "aula-demo",
  titulo: "Teoria da Arquitectura I",
  curso: "ARQ",
  ano: "1º Ano",
  turma: "T1",
  sala: "Sala A-204",
  inicio: "10:00",
  fim: "12:00",
  slides: [
    { n: 1, titulo: "Introdução · O que é arquitectura?" },
    { n: 2, titulo: "Vitruvius · Firmitas, Utilitas, Venustas" },
    { n: 3, titulo: "A cidade clássica" },
    { n: 4, titulo: "Renascimento · Proporção e ordem" },
    { n: 5, titulo: "Modernismo · Forma segue função" },
    { n: 6, titulo: "Discussão & síntese" },
  ],
  recursos: [
    { id: "r1", nome: "Capítulo 1 — Manual.pdf", tipo: "PDF", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    { id: "r2", nome: "Cronologia da arquitectura.pdf", tipo: "PDF", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  ],
  videos: [
    { id: "v1", nome: "Vídeo introdutório", duracao: "4 min", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { id: "v2", nome: "Estudo de caso · Vitruvius", duracao: "6 min", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ],
  quiz: {
    id: "qz-aula-demo",
    titulo: "Quiz · Fundamentos de Vitruvius",
    duracao: 8,
    questoes: [
      {
        id: "q1",
        enunciado: "Quais são os três princípios de Vitruvius?",
        opcoes: [
          "Forma, Função, Ornamento",
          "Firmitas, Utilitas, Venustas",
          "Estrutura, Espaço, Luz",
          "Cidade, Edifício, Detalhe",
        ],
        correta: 1,
      },
      {
        id: "q2",
        enunciado: "Em que tratado Vitruvius desenvolve esses princípios?",
        opcoes: ["De Architectura", "Os Quatro Livros", "Vers une Architecture", "Complexidade e Contradição"],
        correta: 0,
      },
      {
        id: "q3",
        enunciado: "Venustas corresponde a:",
        opcoes: ["Solidez", "Utilidade", "Beleza", "Proporção"],
        correta: 2,
      },
    ],
  },
  alunos: Array.from({ length: 24 }).map((_, i) => ({
    id: `est-${i + 1}`,
    nome: [
      "Ana Silva","Bruno Costa","Carla Mendes","Diogo Pinto","Elsa Tavares",
      "Filipe Lopes","Gabriela Rocha","Hugo Neves","Inês Sousa","João Almeida",
      "Kátia Ribeiro","Luís Faria","Marta Dias","Nuno Pereira","Olga Cunha",
      "Pedro Matos","Rita Gomes","Sofia Cardoso","Tiago Antunes","Vânia Marques",
      "Xavier Brito","Yara Santos","Zé Carvalho","Beatriz Reis",
    ][i],
  })),
};

type Presenca = "presente" | "atraso" | "falta" | null;
type Passo = 1 | 2 | 3;
type Aba = "slides" | "video" | "recursos" | "quiz";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function fmtDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function AulaControlo() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const aula = MOCK_LESSON;

  const totalDurSec = (toMinutes(aula.fim) - toMinutes(aula.inicio)) * 60;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = toMinutes(aula.inicio);
  const endMin = toMinutes(aula.fim);
  const auaShouldRun = nowMin >= startMin && nowMin < endMin;

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (auaShouldRun) setStarted(true);
  }, [auaShouldRun]);

  const elapsedSec = useMemo(() => {
    if (!started) return 0;
    const base = Math.max(0, (nowMin - startMin) * 60 + now.getSeconds());
    return Math.min(base, totalDurSec);
  }, [started, nowMin, startMin, totalDurSec, now]);

  const minutesToStart = startMin - nowMin;
  const progressPct = Math.min(100, (elapsedSec / totalDurSec) * 100);

  const [passo, setPasso] = useState<Passo>(1);
  const [chamadaConfirmada, setChamadaConfirmada] = useState(false);
  const [presencas, setPresencas] = useState<Record<string, Presenca>>(() => {
    const o: Record<string, Presenca> = {};
    aula.alunos.forEach((a) => (o[a.id] = null));
    return o;
  });
  const counts = useMemo(() => {
    const c = { presente: 0, atraso: 0, falta: 0, pendente: 0 };
    Object.values(presencas).forEach((v) => {
      if (!v) c.pendente++;
      else c[v]++;
    });
    return c;
  }, [presencas]);
  const presentRate = Math.round(((counts.presente + counts.atraso) / aula.alunos.length) * 100);

  const setAll = (v: Presenca) =>
    setPresencas(Object.fromEntries(aula.alunos.map((a) => [a.id, v])));

  const [aba, setAba] = useState<Aba>("slides");
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = aula.slides[slideIdx];

  const [viewer, setViewer] = useState<{ tipo: "video" | "doc"; nome: string; src: string } | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (passo !== 2 || viewer) return;
      if (aba === "slides") {
        if (e.key === "ArrowRight") setSlideIdx((i) => Math.min(i + 1, aula.slides.length - 1));
        if (e.key === "ArrowLeft") setSlideIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [passo, aba, aula.slides.length, viewer]);

  const [confirmEnd, setConfirmEnd] = useState(false);

  const [chamadaFullscreen, setChamadaFullscreen] = useState(false);
  const [apresentacao, setApresentacao] = useState(false);
  const [quizLancado, setQuizLancado] = useState(false);
  const [quizAberto, setQuizAberto] = useState(false);
  const [quizFullscreen, setQuizFullscreen] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);

  useEffect(() => {
    if (!quizFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuizFullscreen(false);
      if (e.key === "ArrowRight" || e.key === " ") setQuizIdx((i) => Math.min(i + 1, aula.quiz.questoes.length - 1));
      if (e.key === "ArrowLeft") setQuizIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quizFullscreen, aula.quiz.questoes.length]);

  // Modo apresentação: ESC para sair, setas para navegar
  useEffect(() => {
    if (!apresentacao) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setApresentacao(false);
      if (e.key === "ArrowRight" || e.key === " ") setSlideIdx((i) => Math.min(i + 1, aula.slides.length - 1));
      if (e.key === "ArrowLeft") setSlideIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apresentacao, aula.slides.length]);


  const conteudoHint = `${slideIdx + 1}/${aula.slides.length} slides · ${aula.videos.length} vídeos · ${aula.recursos.length} recursos`;

  const steps = [
    { n: 1 as Passo, label: "Chamada", icon: UserCheck, hint: `${counts.presente + counts.atraso}/${aula.alunos.length} presentes`, done: chamadaConfirmada, lock: false },
    { n: 2 as Passo, label: "Conteúdo", icon: Presentation, hint: conteudoHint, done: false, lock: !chamadaConfirmada },
    { n: 3 as Passo, label: "Encerramento", icon: CheckCircle2, hint: "Resumo & sair", done: false, lock: !chamadaConfirmada },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER (sticky, no sidebar — modo aula) */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground leading-tight truncate">{aula.titulo}</h1>
                {started ? (
                  <Badge className="bg-primary text-primary-foreground gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Aula A Decorrer
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 text-[11px]">
                    <AlarmClock className="w-3 h-3" /> Começa em {minutesToStart > 0 ? `${minutesToStart}m` : "breve"}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 text-[11px]"><Lock className="w-3 h-3" /> Modo Aula</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span>{aula.curso} · {aula.ano} · {aula.turma}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{aula.sala}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{aula.inicio} – {aula.fim}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{aula.alunos.length} alunos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!started && (
              <Button size="sm" variant="outline" onClick={() => setStarted(true)}>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Iniciar Agora
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate("/professor")}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Sair da Aula
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirmEnd(true)}>
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Terminar Aula
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-5 animate-fade-in">


      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        {/* LEFT RAIL */}
        <div className="space-y-3">
          {/* Timer */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">
              Tempo de Aula
            </p>
            <p className="text-3xl font-bold text-primary tabular-nums mt-1.5 leading-none">
              {fmtDuration(elapsedSec)}
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-[11px] text-muted-foreground tabular-nums">
                de {fmtDuration(totalDurSec)}
              </p>
              <p className="text-[11px] font-medium text-primary tabular-nums">
                {Math.round(progressPct)}%
              </p>
            </div>
            <Progress value={progressPct} className="mt-1.5 h-1.5" />
          </Card>

          {/* Steps */}
          <div className="space-y-1.5">
            {steps.map((s) => {
              const active = passo === s.n;
              const Icon = s.icon;
              return (
                <button
                  key={s.n}
                  disabled={s.lock}
                  onClick={() => setPasso(s.n)}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-2.5 rounded-md border text-left transition-all",
                    active && "border-primary bg-primary/5",
                    !active && !s.lock && "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
                    s.lock && "border-border bg-muted/30 opacity-60 cursor-not-allowed",
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                    active ? "bg-primary text-primary-foreground" :
                    s.done ? "bg-primary/15 text-primary" :
                    "bg-muted text-muted-foreground",
                  )}>
                    {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      {s.lock && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{s.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>


        {/* MAIN ZONE */}
        <div className="space-y-5">
          {passo === 1 && (
            <Card className={cn("p-5", chamadaFullscreen && "fixed inset-0 z-40 rounded-none overflow-auto p-8")}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-semibold">Chamada</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toca no nome para alternar presença · atraso · falta.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs tabular-nums">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /><span className="font-semibold text-foreground">{counts.presente}</span><span className="text-muted-foreground">presentes</span></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="font-semibold text-foreground">{counts.atraso}</span><span className="text-muted-foreground">atraso</span></span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /><span className="font-semibold text-foreground">{counts.falta}</span><span className="text-muted-foreground">faltas</span></span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setChamadaFullscreen((v) => !v)} title={chamadaFullscreen ? "Sair do ecrã inteiro" : "Ecrã inteiro"}>
                    {chamadaFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAll("presente")}>Todos presentes</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAll(null)}>Limpar</Button>
                <div className="ml-auto text-xs text-muted-foreground tabular-nums">
                  <span className="font-semibold text-foreground">{presentRate}%</span> presença
                </div>
              </div>

              <div className={cn(
                "grid gap-1.5 overflow-y-auto pr-1",
                chamadaFullscreen ? "sm:grid-cols-2 lg:grid-cols-3 max-h-[calc(100vh-220px)]" : "sm:grid-cols-2 max-h-[400px]",
              )}>
                {aula.alunos.map((a, i) => {
                  const v = presencas[a.id];
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-card">
                      <span className="text-[10px] text-muted-foreground tabular-nums w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-sm flex-1 min-w-0 break-words font-medium text-foreground">{a.nome}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {([
                          { k: "presente" as const, label: "Presente", activeCls: "bg-primary text-primary-foreground border-primary" },
                          { k: "atraso" as const, label: "Atraso", activeCls: "bg-amber-500 text-white border-amber-500" },
                          { k: "falta" as const, label: "Falta", activeCls: "bg-destructive text-destructive-foreground border-destructive" },
                        ]).map(({ k, label, activeCls }) => (
                          <button
                            key={k}
                            onClick={() => setPresencas((p) => ({ ...p, [a.id]: p[a.id] === k ? null : k }))}
                            className={cn(
                              "px-2.5 h-7 rounded-md border text-[11px] font-medium transition-colors",
                              v === k ? activeCls : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    setChamadaConfirmada(true);
                    setChamadaFullscreen(false);
                    setPasso(2);
                    toast.success("Chamada confirmada");
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirmar Chamada
                </Button>
              </div>
            </Card>
          )}


          {passo === 2 && (
            <>
              {/* Conteúdo tabs */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 w-fit">
                {([
                  { k: "slides" as Aba, label: "Slides", Icon: Presentation },
                  { k: "video" as Aba, label: "Vídeo", Icon: VideoIcon },
                  { k: "recursos" as Aba, label: "Recursos", Icon: FileText },
                  { k: "quiz" as Aba, label: "Quiz", Icon: HelpCircle },
                ]).map(({ k, label, Icon }) => (
                  <button
                    key={k}
                    onClick={() => setAba(k)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      aba === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {aba === "slides" && (
                <Card className="overflow-hidden">
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-muted/60 to-background flex items-center justify-center relative">
                    <div className="text-center px-10">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Slide {slide.n} de {aula.slides.length}</p>
                      <p className="text-4xl font-semibold text-foreground mt-4 leading-tight">{slide.titulo}</p>
                    </div>
                    <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={() => setApresentacao(true)}>
                      <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Modo Apresentação
                    </Button>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                    <Button variant="outline" disabled={slideIdx === 0} onClick={() => setSlideIdx((i) => i - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <div className="hidden md:flex items-center gap-1.5">
                      {aula.slides.map((s, i) => (
                        <button
                          key={s.n}
                          onClick={() => setSlideIdx(i)}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            i === slideIdx ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                          )}
                        />
                      ))}
                    </div>
                    <Button variant="outline" disabled={slideIdx === aula.slides.length - 1} onClick={() => setSlideIdx((i) => i + 1)}>
                      Seguinte <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {aba === "video" && (
                <Card className="divide-y divide-border">
                  {aula.videos.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <VideoIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.nome}</p>
                        <p className="text-xs text-muted-foreground">Vídeo · {v.duracao}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewer({ tipo: "video", nome: v.nome, src: v.src })}>
                        <Play className="w-3.5 h-3.5 mr-1.5" /> Ver
                      </Button>
                    </div>
                  ))}
                </Card>
              )}

              {aba === "recursos" && (
                <Card className="divide-y divide-border">
                  {aula.recursos.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.nome}</p>
                        <p className="text-xs text-muted-foreground">{r.tipo}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewer({ tipo: "doc", nome: r.nome, src: r.url })}>
                        <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Ver
                      </Button>
                    </div>
                  ))}
                </Card>
              )}

              {aba === "quiz" && (
                <Card className="divide-y divide-border">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{aula.quiz.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Quiz · {aula.quiz.questoes.length} questões · {aula.quiz.duracao} min
                      </p>
                    </div>
                    {quizLancado && (
                      <Badge className="bg-primary text-primary-foreground text-[11px] gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Lançado
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setQuizAberto(true)}>
                      <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Abrir
                    </Button>
                  </div>
                </Card>
              )}



              <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => setPasso(3)}>
                  Avançar para encerramento <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {passo === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Resumo da Aula
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Confirma o resumo e termina a sessão.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mt-5">
                <ResumoStat label="Duração" value={fmtDuration(elapsedSec)} />
                <ResumoStat label="Presença" value={`${presentRate}%`} sub={`${counts.presente + counts.atraso}/${aula.alunos.length}`} />
                <ResumoStat label="Slides cobertos" value={`${slideIdx + 1}/${aula.slides.length}`} />
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setPasso(2)}>Voltar</Button>
                <Button variant="destructive" onClick={() => setConfirmEnd(true)}>
                  <LogOut className="w-4 h-4 mr-1.5" /> Terminar Aula
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modo Apresentação — fullscreen overlay */}
      {apresentacao && (
        <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <Badge variant="outline" className="text-white border-white/30 bg-white/5 text-[11px] tabular-nums">
              {slideIdx + 1} / {aula.slides.length}
            </Badge>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setApresentacao(false)}>
              <X className="w-4 h-4 mr-1.5" /> Sair (Esc)
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center px-16">
            <div className="text-center max-w-5xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Slide {slide.n} · {aula.titulo}
              </p>
              <p className="text-6xl md:text-7xl font-semibold leading-tight mt-6">{slide.titulo}</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" disabled={slideIdx === 0} onClick={() => setSlideIdx((i) => i - 1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-1.5">
              {aula.slides.map((s, i) => (
                <button
                  key={s.n}
                  onClick={() => setSlideIdx(i)}
                  className={cn("h-1.5 rounded-full transition-all", i === slideIdx ? "w-8 bg-white" : "w-1.5 bg-white/30")}
                />
              ))}
            </div>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" disabled={slideIdx === aula.slides.length - 1} onClick={() => setSlideIdx((i) => i + 1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminar aula?</DialogTitle>
            <DialogDescription>
              Esta acção encerra a sessão. Duração registada: <strong>{fmtDuration(elapsedSec)}</strong>.
              Presença: <strong>{presentRate}%</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEnd(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success("Aula terminada");
                navigate("/professor");
              }}
            >
              Confirmar e Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz dialog */}
      <Dialog open={quizAberto} onOpenChange={setQuizAberto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {aula.quiz.titulo}
                  {quizLancado && (
                    <Badge className="bg-primary text-primary-foreground text-[11px] gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Lançado
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[11px]">{aula.quiz.questoes.length} questões</Badge>
                  <Badge variant="outline" className="text-[11px]"><Clock className="w-3 h-3 mr-1" />{aula.quiz.duracao} min</Badge>
                </DialogDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setQuizIdx(0);
                  setQuizLancado(true);
                  setQuizAberto(false);
                  setQuizFullscreen(true);
                  toast.success("Quiz iniciado");
                }}
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Iniciar quiz
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {aula.quiz.questoes.map((q, qi) => (
              <div key={q.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{qi + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{q.enunciado}</p>
                    <div className="grid sm:grid-cols-2 gap-2 mt-3">
                      {q.opcoes.map((o, oi) => (
                        <div
                          key={oi}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md border text-xs",
                            oi === q.correta
                              ? "border-primary/40 bg-primary/5 text-foreground"
                              : "border-border bg-card text-muted-foreground",
                          )}
                        >
                          <span className="font-semibold tabular-nums">{String.fromCharCode(65 + oi)}.</span>
                          <span className="flex-1 min-w-0">{o}</span>
                          {oi === q.correta && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz fullscreen mode */}
      {quizFullscreen && (() => {
        const q = aula.quiz.questoes[quizIdx];
        return (
          <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <Badge className="bg-primary text-primary-foreground gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Quiz A Decorrer
              </Badge>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-white border-white/30 bg-white/5 text-[11px] tabular-nums">
                  {quizIdx + 1} / {aula.quiz.questoes.length}
                </Badge>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => { setQuizFullscreen(false); setQuizLancado(false); }}>
                  <X className="w-4 h-4 mr-1.5" /> Encerrar (Esc)
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center px-16">
              <div className="max-w-5xl w-full">
                <p className="text-sm uppercase tracking-[0.3em] text-white/50 text-center">
                  Pergunta {quizIdx + 1} · {aula.quiz.titulo}
                </p>
                <p className="text-4xl md:text-5xl font-semibold leading-tight mt-6 text-center">{q.enunciado}</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-12">
                  {q.opcoes.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-4 px-6 py-5 rounded-xl border border-white/15 bg-white/5">
                      <span className="w-10 h-10 rounded-lg bg-white/10 text-white text-lg font-semibold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-xl md:text-2xl font-medium">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" disabled={quizIdx === 0} onClick={() => setQuizIdx((i) => i - 1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-1.5">
                {aula.quiz.questoes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizIdx(i)}
                    className={cn("h-1.5 rounded-full transition-all", i === quizIdx ? "w-8 bg-white" : "w-1.5 bg-white/30")}
                  />
                ))}
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" disabled={quizIdx === aula.quiz.questoes.length - 1} onClick={() => setQuizIdx((i) => i + 1)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Fullscreen viewer */}
      <Dialog open={!!viewer} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[92vh] p-0 gap-0 border-0 bg-black/95 [&>button]:hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
            <p className="text-sm font-medium text-white truncate">{viewer?.nome}</p>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={() => setViewer(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 bg-black">
            {viewer?.tipo === "video" ? (
              <video src={viewer.src} controls autoPlay className="w-full h-full object-contain bg-black" />
            ) : viewer ? (
              <iframe src={viewer.src} title={viewer.nome} className="w-full h-full bg-white" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function CountChip({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card">
      <span className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function ResumoStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground tabular-nums mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground tabular-nums">{sub}</p>}
    </div>
  );
}
