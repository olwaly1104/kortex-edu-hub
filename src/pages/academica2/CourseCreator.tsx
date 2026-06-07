import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cursoTemplates, cadeirasTemplate, alocacaoCandidatos } from "@/data/academica2Data";
import { Sparkles, CheckCircle2, Loader2, Wand2, BookOpen, Users, Calendar, Rocket, RefreshCw, GraduationCap, ClipboardList, FileCheck2, CalendarDays, BrainCircuit, Megaphone, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type StepStatus = "pending" | "running" | "done";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: typeof BookOpen;
}

const steps: Step[] = [
  { id: "cursos", label: "Criar Cursos", description: "Importar catálogo de cursos da universidade.", icon: GraduationCap },
  { id: "cadeiras", label: "Gerar Cadeiras", description: "Criar cadeiras por curso e ano com ementa base.", icon: BookOpen },
  { id: "docentes", label: "Atribuir Docentes", description: "Distribuir docentes pelas cadeiras.", icon: Users },
  { id: "turmas", label: "Criar Turmas", description: "Alocar candidatos aprovados a turmas do 1º ano.", icon: ClipboardList },
  { id: "calendario", label: "Calendário Académico", description: "Semestres, feriados e épocas de exames.", icon: CalendarDays },
  { id: "exames", label: "Agendar Exames", description: "Mapa de exames presenciais (1ª e 2ª época).", icon: FileCheck2 },
  { id: "quizzes", label: "Quizzes", description: "Banco de quizzes por cadeira.", icon: BrainCircuit },
  { id: "publicar", label: "Publicar Ano Letivo", description: "Activar ano e notificar todos os perfis.", icon: Megaphone },
];

export default function CourseCreator() {
  const [anoLabel, setAnoLabel] = useState("2025/2026");
  const [startDate, setStartDate] = useState("01/09/2025");
  const [endDate, setEndDate] = useState("31/07/2026");
  const [semestres, setSemestres] = useState("2");
  const [sem1Start, setSem1Start] = useState("15/09/2025");
  const [sem1End, setSem1End] = useState("31/01/2026");
  const [sem2Start, setSem2Start] = useState("09/02/2026");
  const [sem2End, setSem2End] = useState("30/06/2026");

  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(
    Object.fromEntries(steps.map(s => [s.id, "pending"])) as Record<string, StepStatus>
  );
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<string>("cursos");

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
    setActive("cursos");
  };

  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const progress = (doneCount / steps.length) * 100;
  const activeStep = steps.find(s => s.id === active)!;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <Badge className="mb-2 gap-1"><Sparkles className="w-3 h-3" /> Criador Automático</Badge>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="w-6 h-6 text-primary" /> Criador de Ano Letivo</h1>
          <p className="text-muted-foreground mt-1 text-sm">Geração automática completa — sem prompts, basta executar.</p>
        </div>
        <div className="flex gap-2">
          {doneCount === steps.length && (
            <Button variant="outline" onClick={reset} className="gap-2"><RefreshCw className="w-4 h-4" /> Nova Geração</Button>
          )}
          <Button onClick={runAll} disabled={running} className="gap-2">
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> A gerar…</> : <><Rocket className="w-4 h-4" /> Gerar Tudo</>}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* LEFT: Parameters */}
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

          <div className="pt-3 border-t">
            <div className="flex justify-between text-xs mb-2"><span className="text-muted-foreground">Progresso</span><span className="font-semibold">{doneCount}/{steps.length}</span></div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

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
                    onClick={() => setActive(s.id)}
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

          {/* Detail panel per step */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <activeStep.icon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">{activeStep.label}</h2>
              <Badge variant="outline" className="ml-auto">{statuses[active] === "done" ? "Concluído" : statuses[active] === "running" ? "A executar" : "Pendente"}</Badge>
            </div>

            {active === "cursos" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cursoTemplates.map(c => (
                  <div key={c.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1"><p className="text-sm font-semibold">{c.name}</p><Badge variant="outline" className="text-[10px]">{c.code}</Badge></div>
                    <p className="text-[11px] text-muted-foreground">{c.faculty}</p>
                    <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>{c.years} anos</span><span>·</span><span>~{c.estudantesEsperados} est.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {active === "cadeiras" && (
              <div className="space-y-4">
                {Object.entries(cadeirasTemplate).map(([cid, anos]) => {
                  const curso = cursoTemplates.find(c => c.id === cid);
                  return (
                    <div key={cid}>
                      <p className="text-sm font-semibold mb-2">{curso?.name}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                        {anos.map((cadeiras, ano) => (
                          <div key={ano} className="border rounded-lg overflow-hidden">
                            <div className="bg-primary/10 px-2 py-1 border-b"><p className="text-[10px] font-bold text-primary">{ano + 1}º Ano</p></div>
                            <div className="p-1.5 space-y-1">
                              {cadeiras.map(c => <div key={c} className="text-[10px] px-1.5 py-1 rounded bg-muted/40 truncate">{c}</div>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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

            {active === "docentes" && (
              <p className="text-sm text-muted-foreground">108 docentes serão distribuídos automaticamente pelas cadeiras com base na sua especialidade e carga horária.</p>
            )}
            {active === "calendario" && (
              <div className="text-sm space-y-2">
                <p><strong>Ano:</strong> {startDate} → {endDate}</p>
                <p><strong>1º Semestre:</strong> {sem1Start} → {sem1End}</p>
                <p><strong>2º Semestre:</strong> {sem2Start} → {sem2End}</p>
              </div>
            )}
            {active === "exames" && (
              <p className="text-sm text-muted-foreground">Mapa de exames presenciais será gerado automaticamente para 1ª e 2ª época, com salas atribuídas por capacidade.</p>
            )}
            {active === "quizzes" && (
              <p className="text-sm text-muted-foreground">Banco inicial de 2 quizzes por cadeira será criado e disponibilizado aos docentes para personalização.</p>
            )}
            {active === "publicar" && (
              <p className="text-sm text-muted-foreground">Ao publicar, o ano letivo {anoLabel} fica activo e visível para todos os perfis (estudantes, docentes, coordenadores).</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
