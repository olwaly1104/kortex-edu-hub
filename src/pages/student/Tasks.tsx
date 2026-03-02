import { lessons, disciplines, grades } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ClipboardList, CheckCircle, AlertCircle, Clock, Calendar, MapPin, Award, BarChart3, Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

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

export default function StudentTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDisc, setFilterDisc] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const allTasks = lessons.flatMap(l => l.tasks.map(t => ({
    ...t,
    lessonNumber: l.number,
    lessonTitle: l.title,
    disciplineId: l.disciplineId,
    disciplineName: disciplines.find(d => d.id === l.disciplineId)?.name || "",
    disciplineColor: disciplines.find(d => d.id === l.disciplineId)?.color || "",
    disciplineCode: disciplines.find(d => d.id === l.disciplineId)?.code || "",
  })));

  const scopedTasks = useMemo(() => {
    return filterDisc === "all" ? allTasks : allTasks.filter(t => t.disciplineId === filterDisc);
  }, [filterDisc, allTasks]);

  const pending = scopedTasks.filter(t => t.status === "pendente").length;
  const submitted = scopedTasks.filter(t => t.status === "entregue").length;
  const late = scopedTasks.filter(t => t.status === "atrasada").length;
  const deliveryRate = scopedTasks.length > 0 ? Math.round(submitted / scopedTasks.length * 100) : 0;
  const gradedTasks = scopedTasks.filter(t => t.grade != null);
  const overallAvg = gradedTasks.length > 0 ? (gradedTasks.reduce((s, t) => s + (t.grade || 0), 0) / gradedTasks.length).toFixed(1) : null;

  const filtered = scopedTasks
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const statusConfig = {
    entregue: { icon: CheckCircle, label: "Entregue", color: "text-accent", bg: "bg-accent/10" },
    atrasada: { icon: AlertCircle, label: "Atrasada", color: "text-destructive", bg: "bg-destructive/10" },
    pendente: { icon: Clock, label: "Pendente", color: "text-secondary", bg: "bg-secondary/10" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-secondary" /> As Minhas Tarefas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{allTasks.length} tarefas no total</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Pendentes" value={pending} icon={Clock} iconBg="bg-secondary/10" iconColor="text-secondary" />
        <SummaryCard label="Entregues" value={submitted} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Atrasadas" value={late} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={late > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Taxa Entrega" value={`${deliveryRate}%`} icon={BarChart3} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Nota Geral" value={overallAvg ?? "—"} icon={TrendingUp} iconBg="bg-accent/10" iconColor="text-accent" valueClass={overallAvg && Number(overallAvg) >= 10 ? "text-accent" : overallAvg ? "text-destructive" : "text-muted-foreground"} />
      </div>

      {/* Discipline filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Disciplina:</span>
        <button
          onClick={() => setFilterDisc("all")}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterDisc === "all" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
        >Todas</button>
        {disciplines.map(d => (
          <button
            key={d.id}
            onClick={() => setFilterDisc(d.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterDisc === d.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
          >{d.code}</button>
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
            { key: "all", label: "Todos" },
            { key: "pendente", label: "Pendente" },
            { key: "entregue", label: "Entregue" },
            { key: "atrasada", label: "Atrasado" },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterStatus === s.key
                  ? s.key === "atrasada"
                    ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                    : "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
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
          const cfg = statusConfig[task.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              style={{ borderLeftWidth: 3, borderLeftColor: task.disciplineColor }}
              onClick={() => navigate(`/student/disciplines/${task.disciplineId}/tasks?taskId=${task.id}`)}
            >
              <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</p>
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}