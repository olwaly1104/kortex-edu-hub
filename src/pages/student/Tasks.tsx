import { lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClipboardList, CheckCircle, AlertCircle, Clock, Calendar, Award, BarChart3, Search, TrendingUp, ArrowUpDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type SortField = "dueDate" | "grade";
type SortDir = "asc" | "desc";

export default function StudentTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterDisc, setFilterDisc] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
    return filterDisc === "todos" ? allTasks : allTasks.filter(t => t.disciplineId === filterDisc);
  }, [filterDisc, allTasks]);

  const pending = scopedTasks.filter(t => t.status === "pendente").length;
  const submitted = scopedTasks.filter(t => t.status === "entregue").length;
  const late = scopedTasks.filter(t => t.status === "atrasada").length;
  const deliveryRate = scopedTasks.length > 0 ? Math.round(submitted / scopedTasks.length * 100) : 0;
  const gradedTasks = scopedTasks.filter(t => t.grade != null);
  const overallAvg = gradedTasks.length > 0 ? (gradedTasks.reduce((s, t) => s + (t.grade || 0), 0) / gradedTasks.length).toFixed(1) : null;

  const isSortActive = sortField !== null;
  const isFilterActive = filterStatus !== "todos";
  const isFacultyActive = filterDisc !== "todos";
  const isSearchActive = searchTerm !== "";
  const hasActiveControls = isSortActive || isFilterActive || isSearchActive || isFacultyActive;

  const sortLabel = sortField === "dueDate" ? "Prazo" : sortField === "grade" ? "Nota" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";
  const filterLabel = filterStatus === "pendente" ? "Pendente" : filterStatus === "entregue" ? "Entregue" : filterStatus === "atrasada" ? "Atrasada" : "";

  const filtered = useMemo(() => {
    let list = scopedTasks
      .filter(t => filterStatus === "todos" || t.status === filterStatus)
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortField) {
      list = [...list].sort((a, b) => {
        let va = 0, vb = 0;
        if (sortField === "grade") { va = a.grade ?? 0; vb = b.grade ?? 0; }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [scopedTasks, filterStatus, searchTerm, sortField, sortDir]);

  const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string; bg: string }> = {
    entregue: { icon: CheckCircle, label: "Entregue", color: "text-accent", bg: "bg-accent/10" },
    atrasada: { icon: AlertCircle, label: "Atrasada", color: "text-destructive", bg: "bg-destructive/10" },
    pendente: { icon: Clock, label: "Pendente", color: "text-secondary", bg: "bg-secondary/10" },
  };

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearchTerm(""); setFilterDisc("todos"); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-primary" /> As Minhas Tarefas
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-secondary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entregues</span>
          </div>
          <p className="text-2xl font-bold text-accent">{submitted}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atrasadas</span>
          </div>
          <p className={cn("text-2xl font-bold", late > 0 ? "text-destructive" : "text-foreground")}>{late}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Entrega</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{deliveryRate}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nota Geral</span>
          </div>
          <p className={cn("text-2xl font-bold", overallAvg && Number(overallAvg) >= 10 ? "text-accent" : overallAvg ? "text-destructive" : "text-muted-foreground")}>{overallAvg ?? "—"}</p>
        </Card>
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Discipline filter row */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterDisc === "todos" ? "default" : "outline"} onClick={() => setFilterDisc("todos")} className="text-xs">Todas Cadeiras</Button>
          {disciplines.map(d => (
            <Button key={d.id} size="sm" variant={filterDisc === d.id ? "default" : "outline"} onClick={() => setFilterDisc(d.id)} className="text-xs">{d.code}</Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + status + sort row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar tarefa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
          </div>

          <div className="flex-1" />

          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="flex items-center gap-2">
            {[
              { key: "todos", label: "Todos" },
              { key: "pendente", label: "Pendente" },
              { key: "entregue", label: "Entregue" },
              { key: "atrasada", label: "Atrasada" },
            ].map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">
                {s.label}
              </Button>
            ))}

            <div className="w-px h-6 bg-border" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${isSortActive ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
                {[
                  { key: "todos", label: "Todos" },
                  { key: "grade", label: "Nota" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => { if (opt.key === "todos") { setSortField(null); } else { setSortField(opt.key as SortField); } }} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${(opt.key === "todos" && sortField === null) || sortField === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{opt.label}</button>
                ))}
                <div className="border-t border-border my-1" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active tags */}
        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isFacultyActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterDisc("todos")}>
                Cadeira: {disciplines.find(d => d.id === filterDisc)?.code} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSortActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>
                {sortLabel}: {dirLabel} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isFilterActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>
                Estado: {filterLabel} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSearchActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearchTerm("")}>
                Pesquisa: "{searchTerm}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Tarefa</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Cadeira</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Prazo</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Nota</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => {
              const cfg = statusConfig[task.status];
              return (
                <tr
                  key={task.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/student/disciplines/${task.disciplineId}/tasks?taskId=${task.id}`)}
                >
                  <td className="p-3">
                    <p className="font-medium text-foreground text-sm">{task.title}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-medium" style={{ color: task.disciplineColor }}>{task.disciplineCode}</span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {task.grade != null ? (
                      <span className={cn("font-bold text-sm", task.grade >= 10 ? "text-accent" : "text-destructive")}>{task.grade}/20</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className={cn("text-[10px]", cfg.bg, cfg.color, "border-transparent")}>{cfg.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma tarefa encontrada.</p>}
      </Card>
    </div>
  );
}
