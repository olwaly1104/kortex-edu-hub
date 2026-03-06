import { useState } from "react";
import { coordTurmaTasks, coordTurmas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, Search, Clock, CheckCircle, Users,
  Calendar, AlertCircle, BarChart3, X,
} from "lucide-react";

const statusStyle: Record<string, { bg: string; label: string }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho" },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa" },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada" },
};

export default function CoordenadorTarefas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [filterYear, setFilterYear] = useState<string>("all");

  const tarefas = coordTurmaTasks.filter(t => t.type === "tarefa" || t.type === "quiz");

  const activas = tarefas.filter(t => t.status === "publicada").length;
  const encerradas = tarefas.filter(t => t.status === "encerrada").length;
  const pendentes = tarefas.filter(t => t.status === "publicada" && t.submissions < t.totalStudents).length;
  const totalConc = tarefas.length > 0 ? Math.round((encerradas / tarefas.length) * 100) : 0;

  const years = [...new Set(coordTurmas.map(t => t.year))].sort();

  const filtered = tarefas.filter(t => {
    if (filterStatus !== "todas" && t.status !== filterStatus) return false;
    if (filterYear !== "all") {
      const turma = coordTurmas.find(tr => tr.id === t.turmaId);
      if (!turma || turma.year !== parseInt(filterYear)) return false;
    }
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase()) && !t.discipline.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-primary" /> Tarefas do Curso
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Activas</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10"><Clock className="w-4 h-4 text-primary" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{activas}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Encerradas</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10"><CheckCircle className="w-4 h-4 text-accent" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{encerradas}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pendente</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10"><AlertCircle className="w-4 h-4 text-destructive" /></div>
          </div>
          <p className="text-2xl font-bold text-destructive">{pendentes}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Taxa de Conclusão</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/10"><BarChart3 className="w-4 h-4 text-secondary" /></div>
          </div>
          <p className={`text-2xl font-bold ${totalConc >= 70 ? "text-accent" : "text-destructive"}`}>{totalConc}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar tarefa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5">
          {["todas", "publicada", "encerrada"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s === "todas" ? "Todos" : s === "publicada" ? "Activas" : "Encerradas"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setFilterYear("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterYear === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            Todos Anos
          </button>
          {years.map(y => (
            <button key={y} onClick={() => setFilterYear(String(y))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterYear === String(y) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {y}º Ano
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(task => {
          const turma = coordTurmas.find(t => t.id === task.turmaId);
          const st = statusStyle[task.status] || statusStyle.rascunho;
          const submPct = Math.round((task.submissions / task.totalStudents) * 100);
          return (
            <Card key={task.id} className="p-4 border-l-[3px] border-l-primary">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">{task.title}</p>
                <Badge className={`${st.bg} text-[10px]`}>{st.label}</Badge>
                <Badge variant="outline" className="text-[10px]">{task.type === "quiz" ? "Quiz" : "Tarefa"}</Badge>
                {turma && <Badge variant="outline" className="text-[10px]">{turma.name} · {turma.year}º Ano</Badge>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{task.description}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div><p className="text-[10px] text-muted-foreground uppercase">Cadeira</p><p className="text-xs font-medium text-foreground">{task.discipline}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Entrega</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}</p></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Submetido</span>
                  <span className="font-medium text-foreground">{task.submissions}/{task.totalStudents}</span>
                </div>
                <Progress value={submPct} className="h-1.5" />
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma tarefa encontrada.</p>}
      </div>
    </div>
  );
}
