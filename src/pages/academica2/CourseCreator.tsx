import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursoTemplates, cadeirasTemplate, alocacaoCandidatos } from "@/data/academica2Data";
import { useAuth } from "@/contexts/AuthContext";
import { progressKey } from "@/lib/onboardingStorage";
import {
  Sparkles, CheckCircle2, Loader2, Wand2, BookOpen, Users, Calendar, Rocket, RefreshCw,
  GraduationCap, ClipboardList, FileCheck2, CalendarDays, BrainCircuit, Megaphone, ChevronRight,
  UserCog, Check, Pencil, Building2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type StepStatus = "pending" | "running" | "done";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: typeof BookOpen;
}

const ADMIN_STEP_KEYS: Record<string, string> = {
  faculdades: "aca.fac",
  cadeiras: "aca.cad",
  turmas: "aca.tur",
  calendario: "aca.cal",
};

const stepsAcademica: Step[] = [
  { id: "faculdades", label: "Confirmar Faculdades & Cursos", description: "Validar faculdades, decanos e cursos (com coordenador) de cada uma.", icon: Building2 },
  { id: "cadeiras", label: "Confirmar Cadeiras", description: "Alocar cadeiras, docentes e banco de quizzes por curso.", icon: BookOpen },
  { id: "turmas", label: "Criar Turmas", description: "Alocar candidatos aprovados a turmas do 1º ano.", icon: ClipboardList },
  { id: "calendario", label: "Calendário Académico", description: "Semestres, feriados e mapa de exames (1ª e 2ª época).", icon: CalendarDays },
  { id: "publicar", label: "Publicar Ano Letivo", description: "Activar ano e notificar todos os perfis.", icon: Megaphone },
];

const stepsAdmin: Step[] = [
  { id: "faculdades", label: "Confirmar Faculdades & Cursos", description: "Validar faculdades, decanos e cursos da instituição.", icon: Building2 },
  { id: "cadeiras", label: "Confirmar Cadeiras", description: "Rever cadeiras, docentes e ECTS por curso.", icon: BookOpen },
  { id: "turmas", label: "Confirmar Turmas", description: "Definir turmas iniciais e respectivas capacidades.", icon: ClipboardList },
  { id: "calendario", label: "Calendário Académico", description: "Definir ano letivo, semestres, feriados e mapa de exames.", icon: CalendarDays },
];

const coordenadoresPool = [
  "Dr. Fábio Costa", "Dra. Marta Lopes", "Dr. Hugo Faria", "Dra. Sílvia Antunes",
  "Dr. Tomás Henriques", "Dra. Sara Quintas", "Dr. Rui Pinto", "Dra. Helena Vaz",
];

const docentesPool = [
  "Prof. Sofia Martins", "Prof. Carlos Mendes", "Prof. Ana Costa", "Prof. António Silva",
  "Prof. Pedro Ferreira", "Prof. Hugo Faria", "Prof. Sílvia Antunes", "Prof. Tomás Henriques",
  "Prof. Luísa Brito", "Prof. João Almeida", "Prof. Inês Carvalho", "Prof. Rui Santos",
  "Prof. Margarida Sá", "Prof. Bruno Tavares", "Prof. Cláudia Nunes",
];

export default function CourseCreator() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const steps = isAdmin ? stepsAdmin : stepsAcademica;
  const [anoLabel, setAnoLabel] = useState("2025/2026");
  const [startDate, setStartDate] = useState("01/09/2025");
  const [endDate, setEndDate] = useState("31/08/2026");
  const [semestres, setSemestres] = useState("2");
  const [sem1Start, setSem1Start] = useState("15/09/2025");
  const [sem1End, setSem1End] = useState("31/01/2026");
  const [sem2Start, setSem2Start] = useState("09/02/2026");
  const [sem2End, setSem2End] = useState("30/06/2026");

  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(() => {
    if (isAdmin) {
      let prog: Record<string, boolean> = {};
      try { prog = JSON.parse(localStorage.getItem(progressKey(user?.email)) || "{}"); } catch {}
      return Object.fromEntries(stepsAdmin.map(s => [s.id, prog[ADMIN_STEP_KEYS[s.id]] ? "done" : "pending"])) as Record<string, StepStatus>;
    }
    return Object.fromEntries(stepsAcademica.map(s => [s.id, "pending"])) as Record<string, StepStatus>;
  });
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<string>("faculdades");
  const navigate = useNavigate();
  const stepRoute: Record<string, string> = {
    faculdades: "/areaacademica/criador/faculdades",
    cadeiras: "/areaacademica/criador/cadeiras",
    turmas: "/areaacademica/criador/turmas",
    calendario: "/areaacademica/criador/calendario",
  };

  // Course confirmation state
  type CursoState = {
    confirmed: boolean;
    editing: boolean;
    name: string;
    coordenador: string;
    estudantesEsperados: number;
    years: number;
  };
  const [cursosState, setCursosState] = useState<Record<string, CursoState>>(() =>
    Object.fromEntries(cursoTemplates.map(c => [c.id, {
      confirmed: false, editing: false, name: c.name,
      coordenador: c.coordenador, estudantesEsperados: c.estudantesEsperados, years: c.years,
    }])) as Record<string, CursoState>
  );
  const updateCurso = (id: string, patch: Partial<CursoState>) =>
    setCursosState(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const confirmAllCursos = () => {
    setCursosState(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, confirmed: true, editing: false }])) as Record<string, CursoState>);
    setStatuses(prev => ({ ...prev, cursos: "done" }));
    toast.success("Todos os cursos confirmados");
  };
  const confirmedCount = Object.values(cursosState).filter(c => c.confirmed).length;

  // Cadeiras allocation state
  const [cadeiraCurso, setCadeiraCurso] = useState<string>(Object.keys(cadeirasTemplate)[0]);
  type CadeiraAlloc = { name: string; docente: string; ects: number };
  const [cadeirasAlloc, setCadeirasAlloc] = useState<Record<string, CadeiraAlloc[][]>>(() => {
    const out: Record<string, CadeiraAlloc[][]> = {};
    Object.entries(cadeirasTemplate).forEach(([cid, anos]) => {
      out[cid] = anos.map(arr => arr.map((n, i) => ({
        name: n, docente: docentesPool[(i + cid.length) % docentesPool.length], ects: 6,
      })));
    });
    return out;
  });
  const updateCadeira = (cid: string, ano: number, idx: number, patch: Partial<CadeiraAlloc>) => {
    setCadeirasAlloc(prev => {
      const copy = { ...prev };
      copy[cid] = copy[cid].map((row, i) => i !== ano ? row : row.map((c, j) => j === idx ? { ...c, ...patch } : c));
      return copy;
    });
  };
  const confirmCadeiras = () => {
    setStatuses(prev => ({ ...prev, cadeiras: "done" }));
    toast.success("Cadeiras alocadas para todos os cursos");
  };
  const totalCadeiras = useMemo(() =>
    Object.values(cadeirasAlloc).reduce((acc, anos) => acc + anos.reduce((a, r) => a + r.length, 0), 0)
  , [cadeirasAlloc]);

  const runAll = async () => {
    setRunning(true);
    for (const s of steps) {
      setActive(s.id);
      setStatuses(prev => ({ ...prev, [s.id]: "running" }));
      await new Promise(r => setTimeout(r, 700));
      setStatuses(prev => ({ ...prev, [s.id]: "done" }));
    }
    setRunning(false);
    toast.success(`Ano letivo ${anoLabel} criado com sucesso!`);
  };

  const reset = () => {
    setStatuses(Object.fromEntries(steps.map(s => [s.id, "pending"])) as Record<string, StepStatus>);
    setActive("faculdades");
  };

  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const progress = (doneCount / steps.length) * 100;
  const activeStep = steps.find(s => s.id === active)!;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          {isAdmin ? (
            <>
              <Badge className="mb-2 gap-1"><ShieldCheck className="w-3 h-3" /> Onboarding institucional</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Configurar Área Académica</h1>
              <p className="text-muted-foreground mt-1 text-sm">Confirme a estrutura académica da instituição passo a passo.</p>
            </>
          ) : (
            <>
              <Badge className="mb-2 gap-1"><Sparkles className="w-3 h-3" /> Criador Automático</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="w-6 h-6 text-primary" /> Criador de Ano Letivo</h1>
              <p className="text-muted-foreground mt-1 text-sm">Geração automática completa — sem prompts, basta executar.</p>
            </>
          )}
        </div>
        {!isAdmin && (
          <div className="flex gap-2">
            {doneCount === steps.length && (
              <Button variant="outline" onClick={reset} className="gap-2"><RefreshCw className="w-4 h-4" /> Nova Geração</Button>
            )}
            <Button onClick={runAll} disabled={running} className="gap-2">
              {running ? <><Loader2 className="w-4 h-4 animate-spin" /> A gerar…</> : <><Rocket className="w-4 h-4" /> Gerar Tudo</>}
            </Button>
          </div>
        )}
      </div>

      {/* Top progress bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{isAdmin ? "Progresso da configuração" : "Progresso do Ano Letivo"}</span>
            {!isAdmin && <Badge variant="outline" className="text-xs">{anoLabel}</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{doneCount} de {steps.length} passos concluídos</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mt-3">
          {steps.map((s, i) => {
            const st = statuses[s.id];
            return (
              <div key={s.id} className="flex items-center gap-1.5 text-[10px] truncate">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                  st === "done" ? "bg-emerald-500 text-white" :
                  st === "running" ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>{st === "done" ? "✓" : i + 1}</span>
                <span className="truncate text-muted-foreground">{s.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className={isAdmin ? "" : "grid lg:grid-cols-[320px_1fr] gap-6"}>
        {/* LEFT: Parameters — academica only */}
        {!isAdmin && (
        <Card className="p-5 space-y-4 h-fit">
          <h2 className="text-base font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Parâmetros do Ano</h2>

          <div className="space-y-2">
            <Label className="text-xs">Ano Letivo</Label>
            <Input value={anoLabel} onChange={e => setAnoLabel(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label className="text-xs">Início</Label><Input value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-xs">Fim</Label><Input value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Nº de Semestres</Label>
            <Input value={semestres} onChange={e => setSemestres(e.target.value)} />
          </div>

          <div className="pt-3 border-t space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">1º Semestre</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[10px]">Início</Label><Input value={sem1Start} onChange={e => setSem1Start(e.target.value)} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-[10px]">Fim</Label><Input value={sem1End} onChange={e => setSem1End(e.target.value)} className="h-8 text-xs" /></div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">2º Semestre</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[10px]">Início</Label><Input value={sem2Start} onChange={e => setSem2Start(e.target.value)} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-[10px]">Fim</Label><Input value={sem2End} onChange={e => setSem2End(e.target.value)} className="h-8 text-xs" /></div>
            </div>
          </div>
        </Card>
        )}


        {/* RIGHT: Steps + Detail */}
        <div className="space-y-4">
          <Card className="p-2">
            <div className="grid gap-1">
              {steps.map((s, i) => {
                const st = statuses[s.id];
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => stepRoute[s.id] ? navigate(stepRoute[s.id]) : setActive(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isActive ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/40"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      st === "done" ? "bg-emerald-500 text-white" :
                      st === "running" ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {st === "done" ? <CheckCircle2 className="w-4 h-4" /> :
                       st === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       <span className="text-xs font-bold">{i + 1}</span>}
                    </div>
                    <s.icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Detail panel — only shown for non-routable steps */}
          {!stepRoute[active] && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <activeStep.icon className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold">{activeStep.label}</h2>
                <Badge variant="outline" className="ml-auto">{statuses[active] === "done" ? "Concluído" : statuses[active] === "running" ? "A executar" : "Pendente"}</Badge>
              </div>

              {active === "turmas" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Candidatos aprovados a alocar automaticamente a turmas do 1º ano:</p>
                  <div className="border rounded-lg divide-y">
                    {alocacaoCandidatos.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{c.email} · {c.curso}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{c.turmaSugerida}</Badge>
                        <Badge className={`text-[10px] ${
                          c.estado === "alocado" ? "bg-emerald-500" :
                          c.estado === "pendente" ? "bg-amber-500" : "bg-red-500"
                        }`}>{c.estado}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {active === "calendario" && (
                <div className="text-sm space-y-2">
                  <p><strong>Ano:</strong> {startDate} → {endDate}</p>
                  <p><strong>1º Semestre:</strong> {sem1Start} → {sem1End}</p>
                  <p><strong>2º Semestre:</strong> {sem2Start} → {sem2End}</p>
                  <p className="text-muted-foreground pt-2 border-t mt-2">Mapa de exames presenciais (1ª e 2ª época) gerado automaticamente com salas atribuídas por capacidade.</p>
                </div>
              )}
              {active === "publicar" && (
                <p className="text-sm text-muted-foreground">Ao publicar, o ano letivo {anoLabel} fica activo e visível para todos os perfis (estudantes, docentes, coordenadores).</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
