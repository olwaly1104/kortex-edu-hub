import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { plannerSteps, cursoTemplates, cadeirasTemplate } from "@/data/academica2Data";
import { Sparkles, CheckCircle2, Loader2, Wand2, BookOpen, Users, Calendar, ClipboardCheck, BrainCircuit, Rocket, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function CourseCreator() {
  const [anoLabel, setAnoLabel] = useState("2025/2026");
  const [startDate, setStartDate] = useState("01/09/2025");
  const [endDate, setEndDate] = useState("31/07/2026");
  const [prompt, setPrompt] = useState("Criar ano letivo completo replicando estrutura de 2024/2025, com auto-alocação de candidatos aprovados a turmas do 1º ano. Quizzes e exames presenciais por cadeira.");
  const [selectedCursos, setSelectedCursos] = useState<string[]>(cursoTemplates.map(c => c.id));

  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [previewCurso, setPreviewCurso] = useState("arq");

  const toggle = (id: string) => setSelectedCursos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const generate = async () => {
    setRunning(true);
    setDone(false);
    for (let i = 0; i < plannerSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 650));
    }
    setRunning(false);
    setDone(true);
    toast.success(`Ano letivo ${anoLabel} gerado com sucesso!`);
  };

  const reset = () => { setCurrentStep(-1); setDone(false); };

  const previewCadeiras = cadeirasTemplate[previewCurso] || cadeirasTemplate.arq;
  const totalCadeiras = selectedCursos.reduce((acc, id) => {
    const c = cursoTemplates.find(x => x.id === id);
    return acc + (c ? c.years * c.cadeirasPorAno : 0);
  }, 0);
  const totalTurmas = selectedCursos.reduce((acc, id) => {
    const c = cursoTemplates.find(x => x.id === id);
    return acc + (c ? c.years * 3 : 0);
  }, 0);
  const totalEst = selectedCursos.reduce((acc, id) => {
    const c = cursoTemplates.find(x => x.id === id);
    return acc + (c ? c.estudantesEsperados : 0);
  }, 0);

  const progress = currentStep < 0 ? 0 : done ? 100 : ((currentStep + 1) / plannerSteps.length) * 100;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2 gap-1"><Sparkles className="w-3 h-3" /> Criador Automático</Badge>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Wand2 className="w-6 h-6 text-primary" /> Criador de Ano Letivo</h1>
            <p className="text-muted-foreground mt-1 text-sm">Geração automática de cursos, cadeiras, turmas, exames e quizzes para um ano letivo completo.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 space-y-4 h-fit">
          <h2 className="text-base font-semibold flex items-center gap-2"><Rocket className="w-4 h-4 text-primary" /> Parâmetros</h2>

          <div className="space-y-2">
            <Label className="text-xs">Ano Letivo</Label>
            <Input value={anoLabel} onChange={e => setAnoLabel(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Início</Label>
              <Input value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fim</Label>
              <Input value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Instruções para a IA</Label>
            <Textarea rows={5} value={prompt} onChange={e => setPrompt(e.target.value)} className="resize-none text-xs" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Cursos a Incluir</Label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-lg p-2">
              {cursoTemplates.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-xs hover:bg-muted/40 px-2 py-1.5 rounded cursor-pointer">
                  <Checkbox checked={selectedCursos.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                  <span className="flex-1">{c.name}</span>
                  <Badge variant="outline" className="text-[9px]">{c.code}</Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center"><p className="text-lg font-bold text-primary">{selectedCursos.length}</p><p className="text-[10px] text-muted-foreground">Cursos</p></div>
            <div className="text-center"><p className="text-lg font-bold text-primary">{totalCadeiras}</p><p className="text-[10px] text-muted-foreground">Cadeiras</p></div>
            <div className="text-center"><p className="text-lg font-bold text-primary">~{totalTurmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
          </div>

          <Button className="w-full gap-2" onClick={generate} disabled={running || selectedCursos.length === 0}>
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> A gerar…</> : <><Sparkles className="w-4 h-4" /> Gerar Ano Letivo</>}
          </Button>
          {done && (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={reset}><RefreshCw className="w-3 h-3" /> Nova Geração</Button>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" /> Pipeline de Geração</h2>
            <Badge variant={done ? "default" : "outline"}>{done ? "Concluído" : running ? "Em progresso" : "Pronto"}</Badge>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="space-y-2">
            {plannerSteps.map((s, i) => {
              const status = currentStep < 0 ? "idle" : i < currentStep || done ? "done" : i === currentStep ? "running" : "pending";
              return (
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  status === "running" ? "border-primary bg-primary/5" : status === "done" ? "border-emerald-200 bg-emerald-50/50" : "border-border"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    status === "done" ? "bg-emerald-500 text-white" : status === "running" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : status === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{s.estimated}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Pré-visualização do Plano Curricular</h2>
          <Select value={previewCurso} onValueChange={setPreviewCurso}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cursoTemplates.filter(c => cadeirasTemplate[c.id]).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {previewCadeiras.map((cadeiras, ano) => (
            <div key={ano} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-3 py-2 border-b">
                <p className="text-xs font-bold text-primary">{ano + 1}º Ano</p>
                <p className="text-[10px] text-muted-foreground">{cadeiras.length} cadeiras</p>
              </div>
              <div className="p-2 space-y-1">
                {cadeiras.map(c => (
                  <div key={c} className="text-[11px] px-2 py-1.5 rounded bg-muted/40 truncate">{c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: "Cadeiras", value: totalCadeiras },
          { icon: Users, label: "Estudantes Esperados", value: totalEst.toLocaleString() },
          { icon: Calendar, label: "Semestres", value: 2 },
          { icon: BrainCircuit, label: "Quizzes Gerados", value: totalCadeiras * 2 },
        ].map(s => (
          <Card key={s.label} className="p-3 flex items-center gap-3">
            <s.icon className="w-8 h-8 p-1.5 bg-primary/10 text-primary rounded-lg" />
            <div><p className="text-lg font-bold">{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
