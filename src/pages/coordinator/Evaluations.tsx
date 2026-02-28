import { useState } from "react";
import { profTasks, profDisciplines } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ClipboardList, Search, Clock, CheckCircle, Users,
  FolderKanban, Calendar, AlertCircle, Eye,
} from "lucide-react";

const typeLabel: Record<string, string> = { tarefa: "Tarefa", quiz: "Quiz", exame: "Exame" };
const typeIcon: Record<string, React.ElementType> = { quiz: FolderKanban, exame: ClipboardList };
const statusStyle: Record<string, { bg: string; label: string }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho" },
  publicada: { bg: "bg-primary/10 text-primary", label: "Publicada" },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada" },
};

export default function CoordinatorEvaluations() {
  const [filterDisc, setFilterDisc] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = profTasks
    .filter(t => filterDisc === "all" || t.disciplineId === filterDisc)
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-secondary" /> Avaliações
          </h1>
          <p className="text-muted-foreground mt-1">Supervisão de todas as avaliações do curso</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" /> Apenas leitura
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary"><AlertCircle className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{profTasks.filter(t => t.status === "publicada").length}</p><p className="text-xs text-muted-foreground">Activas</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 text-accent"><CheckCircle className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{profTasks.filter(t => t.status === "encerrada").length}</p><p className="text-xs text-muted-foreground">Encerradas</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10 text-secondary"><Users className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{profTasks.reduce((s, t) => s + t.submissions, 0)}</p><p className="text-xs text-muted-foreground">Submissões</p></div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setFilterDisc("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDisc === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Todas</button>
          {profDisciplines.map(d => (
            <button key={d.id} onClick={() => setFilterDisc(d.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDisc === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{d.code}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "publicada", "encerrada", "rascunho"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s === "all" ? "Todos" : statusStyle[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation list */}
      <div className="space-y-3">
        {filtered.map(task => {
          const disc = profDisciplines.find(d => d.id === task.disciplineId);
          const TypeIcon = typeIcon[task.type] || ClipboardList;
          const sStyle = statusStyle[task.status];
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;

          return (
            <Card key={task.id} className="p-5 border-l-[3px]" style={{ borderLeftColor: disc?.color }}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">{task.title}</p>
                  <Badge variant="outline" className="text-[10px]">{typeLabel[task.type]}</Badge>
                  <Badge className={sStyle.bg}>{sStyle.label}</Badge>
                </div>
                {task.avgGrade !== null ? (
                  <div className="flex items-center gap-1.5 text-accent shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">{task.avgGrade}</span>
                  </div>
                ) : task.status !== "rascunho" ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Por corrigir</span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                <span className="text-xs font-medium" style={{ color: disc?.color }}>{disc?.name}</span>
                <span className="text-xs text-muted-foreground">({disc?.code})</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
                <span>Peso: {task.weight}%</span>
                <Badge variant="outline" className="text-[10px]">{task.modality === "online" ? "Online" : "Presencial"}</Badge>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma avaliação encontrada.</p>}
      </div>
    </div>
  );
}
