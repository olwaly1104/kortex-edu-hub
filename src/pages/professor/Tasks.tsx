import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Plus, Search, Clock, CheckCircle, Users, Send,
  Calendar, AlertCircle, ClipboardList, BarChart3,
  MapPin, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusStyle: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho", icon: Clock },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa", icon: Clock },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada", icon: CheckCircle },
};

function SummaryCard({ label, value, icon: Icon, iconBg, iconColor, valueClass }: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; iconColor: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default function ProfessorTasks() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formDisc, setFormDisc] = useState(profDisciplines[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDue, setFormDue] = useState("");
  const [formWeight, setFormWeight] = useState("10");

  const allTarefas = profTasks.filter(t => t.type === "tarefa");

  const scopedTasks = useMemo(() => {
    return filterTurma === "all" ? allTarefas : allTarefas.filter(t => t.turmaId === filterTurma);
  }, [filterTurma, allTarefas]);

  const activeTasks = scopedTasks.filter(t => t.status === "publicada");
  const closedTasks = scopedTasks.filter(t => t.status === "encerrada");
  const porAtribuir = scopedTasks.filter(t => t.status === "encerrada" && t.avgGrade === null).length;
  const totalSubmissions = scopedTasks.reduce((s, t) => s + t.submissions, 0);
  const totalExpected = scopedTasks.filter(t => t.status !== "rascunho").reduce((s, t) => s + t.totalStudents, 0);
  const avgSubmissionRate = totalExpected > 0 ? Math.round(totalSubmissions / totalExpected * 100) : 0;
  const gradedTasks = closedTasks.filter(t => t.avgGrade !== null);
  const overallAvg = gradedTasks.length > 0 ? (gradedTasks.reduce((s, t) => s + (t.avgGrade || 0), 0) / gradedTasks.length).toFixed(1) : null;

  // Por Atribuir only available when viewing encerrada
  const isPorAtribuirEnabled = filterStatus === "encerrada";

  const filtered = scopedTasks
    .filter(t => {
      if (filterStatus === "all") return true;
      if (filterStatus === "por_atribuir") return t.status === "encerrada" && t.avgGrade === null;
      return t.status === filterStatus;
    })
    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = () => {
    if (!formTitle || !formDesc || !formDue) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, descrição e data limite.", variant: "destructive" });
      return;
    }
    toast({ title: "Tarefa criada!", description: `"${formTitle}" foi publicada.` });
    setShowForm(false);
    setFormTitle(""); setFormDesc(""); setFormDue("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-secondary" /> Tarefas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir tarefas atribuídas aos estudantes</p>
        </div>
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> {showForm ? "Cancelar" : "Nova Tarefa"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-primary/20 space-y-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Nova Tarefa
          </h2>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeira *</label>
            <select value={formDisc} onChange={e => setFormDisc(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {profDisciplines.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título *</label>
            <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Exercícios Capítulo 3" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição *</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descreva a tarefa..." className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Limite *</label>
              <Input type="date" value={formDue} onChange={e => setFormDue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Peso (%)</label>
              <Input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} min="0" max="100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" /> Publicar</Button>
          </div>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Activas" value={activeTasks.length} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Por Atribuir" value={porAtribuir} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={porAtribuir > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Encerradas" value={closedTasks.length} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Taxa Entrega" value={`${avgSubmissionRate}%`} icon={BarChart3} iconBg="bg-secondary/10" iconColor="text-secondary" />
        <SummaryCard label="Nota Geral" value={overallAvg ?? "—"} icon={BookOpen} iconBg="bg-accent/10" iconColor="text-accent" valueClass={overallAvg && Number(overallAvg) >= 10 ? "text-accent" : overallAvg ? "text-destructive" : "text-muted-foreground"} />
      </div>

      {/* Turma toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Turma:</span>
        <button
          onClick={() => setFilterTurma("all")}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === "all" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
        >Todas</button>
        {allTurmas.map(t => (
          <button key={t.id} onClick={() => setFilterTurma(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === t.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
          >{t.name}</button>
        ))}
      </div>

      {/* Search + status filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar tarefa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-lg" />
        </div>
        <div className="flex gap-1.5">
          {([
            { key: "all", label: "Todos", always: true },
            { key: "publicada", label: "Activa", always: true },
            { key: "encerrada", label: "Encerrada", always: true },
            { key: "por_atribuir", label: "Por Atribuir", always: false },
          ]).map(s => {
            const isEnabled = s.always || isPorAtribuirEnabled;
            return (
              <button
                key={s.key}
                onClick={() => isEnabled && setFilterStatus(s.key)}
                disabled={!isEnabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  !isEnabled
                    ? "bg-card text-muted-foreground/40 border-border/50 cursor-not-allowed"
                    : filterStatus === s.key
                      ? s.key === "por_atribuir"
                        ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                        : "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma tarefa encontrada</p>
          </div>
        )}
        {filtered.map(task => {
          const disc = profDisciplines.find(d => d.id === task.disciplineId);
          const turma = allTurmas.find(t => t.id === task.turmaId);
          const sStyle = statusStyle[task.status];
          const StatusIcon = sStyle.icon;
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
          const missingCount = task.totalStudents - task.submissions;
          const isPorAtribuir = task.status === "encerrada" && task.avgGrade === null;
          const naoEntregue = task.status === "encerrada" && task.submissions < task.totalStudents;

          return (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              onClick={() => navigate(`/professor/tasks/${task.id}`)}
            >
              <div className="h-1 rounded-t-xl" style={{ backgroundColor: disc?.color }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                    <span className="text-xs font-semibold" style={{ color: disc?.color }}>{disc?.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{disc?.code}</span>
                    {turma && <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{turma.name}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {isPorAtribuir && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px]">
                        <AlertCircle className="w-3 h-3" /> Por atribuir
                      </Badge>
                    )}
                    {naoEntregue && task.status === "encerrada" && (
                      <Badge className="bg-secondary/10 text-secondary border-0 text-[10px]">
                        {missingCount} não entregue — Nota 0
                      </Badge>
                    )}
                    <Badge className={`${sStyle.bg} gap-1 text-[10px] border-0`}>
                      <StatusIcon className="w-3 h-3" />
                      {sStyle.label}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {task.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Prazo: <span className="font-medium text-foreground">{task.dueDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Peso: <span className="font-medium text-foreground">{task.weight}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Presencial
                  </span>
                  {task.avgGrade !== null && (
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Média: <span className={`font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</span>
                    </span>
                  )}
                </div>

                {task.status !== "rascunho" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" />Entregas</span>
                      <span className="font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
                    </div>
                    <Progress value={submissionPct} className="h-1.5" />
                  </div>
                )}

                <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 group-hover:text-primary/60 transition-colors">
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}