import { lessons, disciplines, grades } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, CheckCircle, AlertCircle, Clock, Calendar, MapPin, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StudentTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDisc, setFilterDisc] = useState<string>("all");

  const allTasks = lessons.flatMap(l => l.tasks.map(t => ({
    ...t,
    lessonNumber: l.number,
    lessonTitle: l.title,
    disciplineId: l.disciplineId,
    disciplineName: disciplines.find(d => d.id === l.disciplineId)?.name || "",
    disciplineColor: disciplines.find(d => d.id === l.disciplineId)?.color || "",
    disciplineCode: disciplines.find(d => d.id === l.disciplineId)?.code || "",
  })));

  const filtered = allTasks
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => filterDisc === "all" || t.disciplineId === filterDisc);

  const pending = allTasks.filter(t => t.status === "pendente").length;
  const submitted = allTasks.filter(t => t.status === "entregue").length;
  const late = allTasks.filter(t => t.status === "atrasada").length;

  const statusConfig = {
    entregue: { icon: CheckCircle, label: "Entregue", color: "text-accent", bg: "bg-accent/10" },
    atrasada: { icon: AlertCircle, label: "Atrasada", color: "text-destructive", bg: "bg-destructive/10" },
    pendente: { icon: Clock, label: "Pendente", color: "text-secondary", bg: "bg-secondary/10" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-secondary" /> As Minhas Tarefas
        </h1>
        <p className="text-muted-foreground mt-1">{allTasks.length} tarefas no total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{pending}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{submitted}</p>
          <p className="text-xs text-muted-foreground">Entregues</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{late}</p>
          <p className="text-xs text-muted-foreground">Atrasadas</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {(["all", "pendente", "entregue", "atrasada"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              {s === "all" ? "Todas" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-2">
          <button onClick={() => setFilterDisc("all")} className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            filterDisc === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}>Todas</button>
          {disciplines.map(d => (
            <button key={d.id} onClick={() => setFilterDisc(d.id)} className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterDisc === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>{d.code}</button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma tarefa encontrada</p>
          </Card>
        )}
        {filtered.map(task => {
          const cfg = statusConfig[task.status];
          const StatusIcon = cfg.icon;
          return (
            <Card
              key={task.id}
              className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all border-l-[3px]"
              style={{ borderLeftColor: task.disciplineColor }}
              onClick={() => navigate(`/student/disciplines/${task.disciplineId}/tasks?taskId=${task.id}`)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{task.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span style={{ color: task.disciplineColor }}>{task.disciplineName}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <MapPin className="w-3 h-3" /> Presencial
                  </Badge>
                  {task.grade != null && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span className={task.grade >= 10 ? "text-accent font-bold" : "text-destructive font-bold"}>{task.grade}/20</span>
                    </span>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 shrink-0 ${cfg.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{cfg.label}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
