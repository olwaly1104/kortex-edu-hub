import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { coordTurmaTasks, coordTurmas } from "@/data/institutionData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search, Clock, CheckCircle, Users,
  Calendar, AlertCircle, ClipboardList, BarChart3,
  MapPin, ArrowRight, ArrowUpDown, X, BookOpen,
} from "lucide-react";

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

type SortKey = "dueDate" | "weight" | "submissions" | "avgGrade";
type SortDir = "asc" | "desc";
type FilterStatus = "todas" | "publicada" | "encerrada";

export default function CoordenadorTarefas() {
  const navigate = useNavigate();
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todas");

  const years = [...new Set(coordTurmas.map(t => t.year))].sort();
  const turmasForYear = filterYear ? coordTurmas.filter(t => t.year === filterYear).sort((a, b) => a.name.localeCompare(b.name)) : [];

  const allTarefas = coordTurmaTasks.filter(t => t.type === "tarefa" || t.type === "quiz");

  const scopedTasks = useMemo(() => {
    let tasks = allTarefas;
    if (filterTurma !== "all") {
      tasks = tasks.filter(t => t.turmaId === filterTurma);
    } else if (filterYear) {
      const yearTurmaIds = coordTurmas.filter(t => t.year === filterYear).map(t => t.id);
      tasks = tasks.filter(t => yearTurmaIds.includes(t.turmaId));
    }
    return tasks;
  }, [filterYear, filterTurma, allTarefas]);

  const activeTasks = scopedTasks.filter(t => t.status === "publicada");
  const closedTasks = scopedTasks.filter(t => t.status === "encerrada");
  const pendentes = activeTasks.filter(t => t.submissions < t.totalStudents).length;
  const totalSubmissions = scopedTasks.reduce((s, t) => s + t.submissions, 0);
  const totalExpected = scopedTasks.filter(t => t.status !== "rascunho").reduce((s, t) => s + t.totalStudents, 0);
  const avgSubmissionRate = totalExpected > 0 ? Math.round(totalSubmissions / totalExpected * 100) : 0;
  const gradedTasks = closedTasks.filter(t => t.avgGrade !== null);
  const overallAvg = gradedTasks.length > 0 ? (gradedTasks.reduce((s, t) => s + (t.avgGrade || 0), 0) / gradedTasks.length).toFixed(1) : null;

  const filtered = useMemo(() => {
    let result = scopedTasks
      .filter(t => filterStatus === "todas" || t.status === filterStatus)
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.discipline.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va: number, vb: number;
        if (sortKey === "weight") { va = a.weight; vb = b.weight; }
        else if (sortKey === "submissions") { va = a.totalStudents > 0 ? a.submissions / a.totalStudents : 0; vb = b.totalStudents > 0 ? b.submissions / b.totalStudents : 0; }
        else if (sortKey === "avgGrade") { va = a.avgGrade ?? -1; vb = b.avgGrade ?? -1; }
        else { va = 0; vb = 0; }
        return sortDir === "desc" ? vb - va : va - vb;
      });
    }
    return result;
  }, [scopedTasks, filterStatus, searchTerm, sortKey, sortDir]);

  const hasActiveFilters = filterStatus !== "todas" || sortKey !== null || searchTerm !== "";
  const clearFilters = () => { setFilterStatus("todas"); setSortKey(null); setSearchTerm(""); };

  const handleYearClick = (year: number) => {
    if (filterYear === year) {
      setFilterYear(null);
      setFilterTurma("all");
    } else {
      setFilterYear(year);
      setFilterTurma("all");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-secondary" /> Tarefas do Curso
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral das tarefas atribuídas no curso</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Activas" value={activeTasks.length} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Pendente" value={pendentes} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={pendentes > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Encerradas" value={closedTasks.length} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Taxa Entrega" value={`${avgSubmissionRate}%`} icon={BarChart3} iconBg="bg-secondary/10" iconColor="text-secondary" valueClass={avgSubmissionRate >= 70 ? "text-secondary" : "text-destructive"} />
        <SummaryCard label="Nota Geral" value={overallAvg ?? "—"} icon={BookOpen} iconBg="bg-accent/10" iconColor="text-accent" valueClass={overallAvg && Number(overallAvg) >= 10 ? "text-accent" : overallAvg ? "text-destructive" : "text-muted-foreground"} />
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Row 1: Year toggles */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={!filterYear ? "default" : "outline"} onClick={() => { setFilterYear(null); setFilterTurma("all"); }} className="text-xs">
            Todos os Anos
          </Button>
          {years.map(y => (
            <Button key={y} size="sm" variant={filterYear === y ? "default" : "outline"} onClick={() => handleYearClick(y)} className="text-xs">
              {y}º Ano
            </Button>
          ))}
        </div>

        {/* Row 1.5: Turma toggles (when year is selected) */}
        {filterYear && turmasForYear.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-primary/20">
            <Button size="sm" variant={filterTurma === "all" ? "secondary" : "ghost"} onClick={() => setFilterTurma("all")} className="text-xs">
              Ver Todas
            </Button>
            {turmasForYear.map(t => (
              <Button key={t.id} size="sm" variant={filterTurma === t.id ? "secondary" : "ghost"} onClick={() => setFilterTurma(t.id)} className="text-xs">
                {t.name}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t border-border" />

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar tarefa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={clearFilters}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {([
              { key: "todas" as FilterStatus, label: "Todas" },
              { key: "publicada" as FilterStatus, label: "Activa" },
              { key: "encerrada" as FilterStatus, label: "Encerrada" },
            ]).map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">
                {s.label}
              </Button>
            ))}

            <div className="w-px h-6 bg-border" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${sortKey ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
                {[
                  { key: null, label: "Todos" },
                  { key: "weight" as SortKey, label: "Peso" },
                  { key: "submissions" as SortKey, label: "Taxa Entrega" },
                  { key: "avgGrade" as SortKey, label: "Média" },
                ].map(opt => (
                  <button key={String(opt.key)} onClick={() => setSortKey(opt.key)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortKey === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{opt.label}</button>
                ))}
                <div className="border-t border-border my-1" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sortKey && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortKey(null); setSortDir("desc"); }}>
                {sortKey === "weight" ? "Peso" : sortKey === "submissions" ? "Entrega" : "Média"}: {sortDir === "desc" ? "Maior" : "Menor"}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {filterStatus !== "todas" && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todas")}>
                Estado: {filterStatus === "publicada" ? "Activa" : "Encerrada"}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearchTerm("")}>
                Pesquisa: "{searchTerm}"
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
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
          const turma = coordTurmas.find(t => t.id === task.turmaId);
          const sStyle = statusStyle[task.status] || statusStyle.rascunho;
          const StatusIcon = sStyle.icon;
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
          const notSubmitted = task.totalStudents - task.submissions;
          const notaAtribuidaPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
          const pendingCorrection = task.submissions - task.corrected;

          return (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              onClick={() => navigate(`/coordenador/tarefas/${task.id}`)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{task.discipline}</span>
                    {turma && <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{turma.name} · {turma.year}º Ano</Badge>}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{task.type === "quiz" ? "Quiz" : "Tarefa"}</Badge>
                  </div>
                  <Badge className={`${sStyle.bg} gap-1 text-[10px] border-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {sStyle.label}
                  </Badge>
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
                  {task.status === "publicada" && notSubmitted > 0 && (
                    <span className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {notSubmitted} por submeter
                    </span>
                  )}
                  {task.avgGrade !== null && (
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Média: <span className={`font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</span>
                    </span>
                  )}
                </div>

                {task.status !== "rascunho" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" />Submetido</span>
                        <span className="font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
                      </div>
                      <Progress value={submissionPct} className="h-1.5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`flex items-center gap-1.5 ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}><CheckCircle className="w-3.5 h-3.5" />Nota Atribuída</span>
                        <span className={`font-semibold ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}>{task.corrected}/{task.submissions}{pendingCorrection > 0 ? ` · ${pendingCorrection} pendente` : ""}</span>
                      </div>
                      <Progress value={notaAtribuidaPct} className={`h-1.5 ${pendingCorrection > 0 ? "[&>div]:bg-destructive" : ""}`} />
                    </div>
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
