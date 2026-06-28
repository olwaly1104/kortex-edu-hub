import { useEffect, useMemo, useRef, useState } from "react";
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
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Presentation,
  Video as VideoIcon,
  UserCheck,
  UserX,
  AlarmClock,
  LogOut,
  Lock,
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
    { id: "r1", nome: "Capítulo 1 — Manual.pdf", tipo: "PDF" },
    { id: "r2", nome: "Cronologia da arquitectura.pdf", tipo: "PDF" },
  ],
  video: {
    titulo: "Vídeo introdutório · 4 min",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
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

// minutes between two HH:MM
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
  const aula = MOCK_LESSON; // futuro: buscar por lessonId

  const totalDurSec = (toMinutes(aula.fim) - toMinutes(aula.inicio)) * 60;

  // Clock & auto-start
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

  // Passo / chamada
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

  // Slides
  const [slideIdx, setSlideIdx] = useState(0);
  const slide = aula.slides[slideIdx];

  // Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (passo !== 2) return;
      if (e.key === "ArrowRight") setSlideIdx((i) => Math.min(i + 1, aula.slides.length - 1));
      if (e.key === "ArrowLeft") setSlideIdx((i) => Math.max(i - 1, 0));
      if (e.key.toLowerCase() === "p") togglePlay();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [passo, aula.slides.length]);

  const [confirmEnd, setConfirmEnd] = useState(false);

  const StatusBadge = (
    <Badge className="bg-primary text-primary-foreground gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      A Decorrer · {now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
    </Badge>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* HEADER */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => navigate("/professor")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground truncate">{aula.titulo}</h1>
                {started ? StatusBadge : (
                  <Badge variant="outline" className="gap-1.5">
                    <AlarmClock className="w-3 h-3" /> Começa em {minutesToStart > 0 ? `${minutesToStart}m` : "breve"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                <span>{aula.curso} · {aula.ano} · {aula.turma}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{aula.sala}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{aula.inicio} – {aula.fim}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{aula.alunos.length} alunos</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!started && (
              <Button variant="outline" onClick={() => setStarted(true)}>
                <Play className="w-4 h-4 mr-1.5" /> Iniciar Agora
              </Button>
            )}
            <Button variant="destructive" onClick={() => setConfirmEnd(true)}>
              <LogOut className="w-4 h-4 mr-1.5" /> Terminar Aula
            </Button>
          </div>
        </div>
      </Card>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* SIDEBAR — cronómetro + passos */}
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
              Tempo Decorrido
            </p>
            <p className="text-4xl font-bold text-primary tabular-nums mt-2">
              {fmtDuration(elapsedSec)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums mt-1">
              de {fmtDuration(totalDurSec)}
            </p>
            <Progress value={(elapsedSec / totalDurSec) * 100} className="mt-3 h-1.5" />
          </Card>

          <Card className="p-3">
            {([
              { n: 1 as Passo, label: "Chamada", icon: UserCheck, done: chamadaConfirmada },
              { n: 2 as Passo, label: "Conteúdo da Aula", icon: Presentation, done: false, lock: !chamadaConfirmada },
              { n: 3 as Passo, label: "Encerramento", icon: CheckCircle2, done: false },
            ] as const).map((s) => {
              const active = passo === s.n;
              const locked = (s as any).lock;
              return (
                <button
                  key={s.n}
                  disabled={locked}
                  onClick={() => setPasso(s.n)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    active && "bg-primary/10 text-primary",
                    !active && !locked && "hover:bg-muted",
                    locked && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0",
                    active ? "bg-primary text-primary-foreground" : s.done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.label}</p>
                    {s.n === 1 && (
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {counts.presente + counts.atraso}/{aula.alunos.length} presentes
                      </p>
                    )}
                  </div>
                  {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </button>
              );
            })}
          </Card>
        </div>

        {/* MAIN ZONE */}
        <div className="space-y-6">
          {passo === 1 && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" /> Chamada
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Marca a presença antes de iniciar o conteúdo da aula.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />{counts.presente} Presentes</Badge>
                  <Badge variant="outline" className="gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{counts.atraso} Atraso</Badge>
                  <Badge variant="outline" className="gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" />{counts.falta} Faltas</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Button size="sm" variant="outline" onClick={() => setAll("presente")}>Marcar todos presentes</Button>
                <Button size="sm" variant="ghost" onClick={() => setAll(null)}>Limpar</Button>
                <div className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {presentRate}% presença
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {aula.alunos.map((a, i) => {
                  const v = presencas[a.id];
                  return (
                    <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <p className="text-sm truncate flex-1 min-w-0">{a.nome}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {([
                          { k: "presente" as const, Icon: UserCheck, color: "text-primary", bg: "bg-primary/15" },
                          { k: "atraso" as const, Icon: Clock, color: "text-amber-600", bg: "bg-amber-500/15" },
                          { k: "falta" as const, Icon: UserX, color: "text-destructive", bg: "bg-destructive/15" },
                        ]).map(({ k, Icon, color, bg }) => (
                          <button
                            key={k}
                            onClick={() => setPresencas((p) => ({ ...p, [a.id]: p[a.id] === k ? null : k }))}
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center border border-transparent transition-colors",
                              v === k ? `${bg} ${color} border-current/30` : "text-muted-foreground hover:bg-muted",
                            )}
                            aria-label={k}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end mt-4">
                <Button
                  onClick={() => {
                    setChamadaConfirmada(true);
                    setPasso(2);
                    toast.success("Chamada confirmada");
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirmar Chamada e Avançar
                </Button>
              </div>
            </Card>
          )}

          {passo === 2 && (
            <>
              {/* Slides */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Slides</h3>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {slideIdx + 1} / {aula.slides.length}
                  </div>
                </div>
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-muted to-background flex items-center justify-center relative">
                  <div className="text-center px-8">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Slide {slide.n}</p>
                    <p className="text-2xl font-semibold text-foreground mt-2">{slide.titulo}</p>
                  </div>
                  <Button size="icon" variant="secondary" className="absolute top-3 right-3 h-8 w-8" onClick={() => toast.info("Modo apresentação em breve")}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                  <Button variant="outline" size="sm" disabled={slideIdx === 0} onClick={() => setSlideIdx((i) => i - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <div className="hidden md:flex items-center gap-1.5">
                    {aula.slides.map((s, i) => (
                      <button
                        key={s.n}
                        onClick={() => setSlideIdx(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === slideIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                        )}
                      />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" disabled={slideIdx === aula.slides.length - 1} onClick={() => setSlideIdx((i) => i + 1)}>
                    Seguinte <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Video */}
                <Card className="overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                    <VideoIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">{aula.video.titulo}</h3>
                  </div>
                  <video
                    ref={videoRef}
                    src={aula.video.src}
                    className="w-full aspect-video bg-black"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  />
                  <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
                    <Button size="sm" variant="outline" onClick={togglePlay}>
                      {playing ? <><Pause className="w-3.5 h-3.5 mr-1.5" /> Pausar</> : <><Play className="w-3.5 h-3.5 mr-1.5" /> Reproduzir</>}
                    </Button>
                    <p className="text-[11px] text-muted-foreground ml-auto">Atalho: P</p>
                  </div>
                </Card>

                {/* Recursos */}
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Recursos da Aula</h3>
                  </div>
                  <div className="space-y-2">
                    {aula.recursos.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.nome}</p>
                          <p className="text-[11px] text-muted-foreground">{r.tipo}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`"${r.nome}" partilhado com a turma`)}>
                          Partilhar
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => setPasso(3)}>
                  Avançar para encerramento <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {passo === 3 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
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
