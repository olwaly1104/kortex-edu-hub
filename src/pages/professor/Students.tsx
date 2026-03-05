import { profStudents, profTasks, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Search, AlertTriangle, TrendingUp, UserCheck, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

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

type SortKey = "attendance" | "avgGrade" | "submissions";
type SortDir = "asc" | "desc";
type FilterStatus = "excelente" | "normal" | "risco";

export default function ProfessorStudents() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [search, setSearch] = useState("");
  const [filterTurma, setFilterTurma] = useState<string>("todos");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatuses, setFilterStatuses] = useState<FilterStatus[]>(
    initialStatus && ["excelente", "normal", "risco"].includes(initialStatus) ? [initialStatus as FilterStatus] : []
  );

  const scopedStudents = useMemo(() => {
    return filterTurma === "todos" ? profStudents : profStudents.filter(s => s.turmaId === filterTurma);
  }, [filterTurma]);

  const total = scopedStudents.length;
  const excellent = scopedStudents.filter(s => s.status === "excelente").length;
  const normal = scopedStudents.filter(s => s.status === "normal").length;
  const atRisk = scopedStudents.filter(s => s.status === "risco").length;

  const filtered = useMemo(() => {
    let result = scopedStudents
      .filter(s => filterStatuses.length === 0 || filterStatuses.includes(s.status as FilterStatus))
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va: number, vb: number;
        if (sortKey === "attendance") { va = a.attendance; vb = b.attendance; }
        else if (sortKey === "avgGrade") { va = a.avgGrade ?? -1; vb = b.avgGrade ?? -1; }
        else { va = a.totalTasks > 0 ? a.submittedTasks / a.totalTasks : 0; vb = b.totalTasks > 0 ? b.submittedTasks / b.totalTasks : 0; }
        return sortDir === "desc" ? vb - va : va - vb;
      });
    }
    return result;
  }, [scopedStudents, filterStatuses, search, sortKey, sortDir]);

  const toggleFilterStatus = (s: FilterStatus) => {
    setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const hasActiveFilters = filterStatuses.length > 0 || sortKey !== null || search !== "";
  const clearFilters = () => { setFilterStatuses([]); setSortKey(null); setSearch(""); };

  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadge: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Os Meus Estudantes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{profStudents.length} estudantes no total</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={total} icon={Users} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Excelentes" value={excellent} icon={TrendingUp} iconBg="bg-accent/10" iconColor="text-accent" valueClass="text-accent" />
        <SummaryCard label="Normal" value={normal} icon={UserCheck} iconBg="bg-secondary/10" iconColor="text-secondary" valueClass="text-secondary" />
        <SummaryCard label="Em Risco" value={atRisk} icon={AlertTriangle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={atRisk > 0 ? "text-destructive" : undefined} />
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterTurma === "todos" ? "default" : "outline"} onClick={() => setFilterTurma("todos")} className="text-xs">
            Todas as Turmas
          </Button>
          {allTurmas.map(t => (
            <Button key={t.id} size="sm" variant={filterTurma === t.id ? "default" : "outline"} onClick={() => setFilterTurma(t.id)} className="text-xs">
              {t.name}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar estudante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>

          <div className="flex-1" />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={clearFilters}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

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
                { key: "attendance" as SortKey, label: "Presença" },
                { key: "avgGrade" as SortKey, label: "Média" },
                { key: "submissions" as SortKey, label: "Entregas" },
              ].map(opt => (
                <button key={String(opt.key)} onClick={() => setSortKey(opt.key)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortKey === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{opt.label}</button>
              ))}
              <div className="border-t border-border my-1" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
              <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
              <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${filterStatuses.length > 0 ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 space-y-0.5" align="end" side="top">
              {([
                { key: "excelente" as FilterStatus, label: "Excelente" },
                { key: "normal" as FilterStatus, label: "Normal" },
                { key: "risco" as FilterStatus, label: "Em Risco" },
              ]).map(s => (
                <button key={s.key} onClick={() => toggleFilterStatus(s.key)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${filterStatuses.includes(s.key) ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{s.label}</button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sortKey && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortKey(null); setSortDir("desc"); }}>
                {sortKey === "attendance" ? "Presença" : sortKey === "avgGrade" ? "Média" : "Entregas"}: {sortDir === "desc" ? "Maior" : "Menor"}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {filterStatuses.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => toggleFilterStatus(s)}>
                Estado: {statusLabels[s]}
                <X className="w-2.5 h-2.5" />
              </Badge>
            ))}
            {search && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}"
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map(student => {
          // Count tarefas and avaliações for this student's turma
          const studentTasks = profTasks.filter(t => t.turmaId === student.turmaId);
          const tarefas = studentTasks.filter(t => t.type === "tarefa" || t.type === "quiz");
          const avaliacoes = studentTasks.filter(t => t.type === "exame");
          const tarefasEncerradas = tarefas.filter(t => t.status === "encerrada").length;
          const avaliacoesEncerradas = avaliacoes.filter(t => t.status === "encerrada").length;
          const entregaPct = student.totalTasks > 0 ? Math.round((student.submittedTasks / student.totalTasks) * 100) : 0;

          return (
          <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                <Badge className={`${statusBadge[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{student.email} • {student.turma}</p>
            </div>
            <div className="grid grid-cols-6 gap-3 shrink-0 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                <p className={`text-sm font-bold ${student.attendance >= 75 ? "text-accent" : "text-destructive"}`}>{student.attendance}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                <p className={`text-sm font-bold ${student.avgGrade && student.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{student.avgGrade ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                <p className={`text-sm font-bold ${entregaPct >= 80 ? "text-accent" : entregaPct >= 50 ? "text-foreground" : "text-destructive"}`}>{entregaPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Tarefas</p>
                <p className="text-sm font-bold text-foreground">{student.submittedTasks}/{student.totalTasks}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Avaliações</p>
                <p className="text-sm font-bold text-foreground">{avaliacoesEncerradas}/{avaliacoes.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Última</p>
                <p className="text-xs text-muted-foreground">{student.lastActive}</p>
              </div>
            </div>
          </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum estudante encontrado.</p>
        )}
      </div>
    </div>
  );
}