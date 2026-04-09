import { grades, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Award, Calendar, CheckCircle, Clock, TrendingUp, Search, ArrowUpDown, X, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type SortField = "grade" | "weight" | "date";
type SortDir = "asc" | "desc";

export default function StudentGrades() {
  const navigate = useNavigate();
  const [filterDisc, setFilterDisc] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Flatten all evaluations
  const allEvals = grades.flatMap(g =>
    g.evaluations.map((ev, i) => ({
      ...ev,
      index: i,
      disciplineId: g.disciplineId,
      disciplineName: g.disciplineName,
      disciplineColor: disciplines.find(d => d.id === g.disciplineId)?.color || "",
      disciplineCode: disciplines.find(d => d.id === g.disciplineId)?.code || "",
    }))
  );

  const allPublished = allEvals.filter(e => e.published && e.grade !== null);
  const overallAvg = allPublished.length > 0
    ? Math.round(allPublished.reduce((s, e) => s + (e.grade || 0), 0) / allPublished.length * 10) / 10
    : null;
  const totalPending = allEvals.filter(e => !e.published || e.grade === null).length;
  const totalPublished = allPublished.length;
  const approved = allPublished.filter(e => (e.grade || 0) >= 10).length;
  const approvalRate = allPublished.length > 0 ? Math.round(approved / allPublished.length * 100) : 0;

  const isSortActive = sortField !== null;
  const isFilterActive = filterStatus !== "todos";
  const isFacultyActive = filterDisc !== "todos";
  const isSearchActive = searchTerm !== "";
  const hasActiveControls = isSortActive || isFilterActive || isSearchActive || isFacultyActive;

  const sortLabel = sortField === "grade" ? "Nota" : sortField === "weight" ? "Peso" : sortField === "date" ? "Data" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";
  const filterLabel = filterStatus === "publicada" ? "Publicada" : filterStatus === "pendente" ? "Pendente" : "";

  const filtered = useMemo(() => {
    let list = allEvals
      .filter(e => filterDisc === "todos" || e.disciplineId === filterDisc)
      .filter(e => {
        if (filterStatus === "todos") return true;
        if (filterStatus === "publicada") return e.published && e.grade !== null;
        if (filterStatus === "pendente") return !e.published || e.grade === null;
        return true;
      })
      .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortField) {
      list = [...list].sort((a, b) => {
        let va = 0, vb = 0;
        if (sortField === "grade") { va = a.grade ?? -1; vb = b.grade ?? -1; }
        else if (sortField === "weight") { va = a.weight; vb = b.weight; }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [filterDisc, filterStatus, searchTerm, sortField, sortDir, allEvals]);

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearchTerm(""); setFilterDisc("todos"); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-primary" /> Notas
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={cn("text-2xl font-bold", overallAvg && overallAvg >= 10 ? "text-accent" : overallAvg ? "text-destructive" : "text-muted-foreground")}>{overallAvg ?? "—"}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publicadas</span>
          </div>
          <p className="text-2xl font-bold text-accent">{totalPublished}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-secondary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Aprovação</span>
          </div>
          <p className={cn("text-2xl font-bold", approvalRate >= 50 ? "text-accent" : "text-destructive")}>{approvalRate}%</p>
        </Card>
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Discipline filter row */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterDisc === "todos" ? "default" : "outline"} onClick={() => setFilterDisc("todos")} className="text-xs">Todas Cadeiras</Button>
          {disciplines.map(d => (
            <Button key={d.id} size="sm" variant={filterDisc === d.id ? "default" : "outline"} onClick={() => setFilterDisc(d.id)} className="text-xs">{d.name}</Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + status + sort row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
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
              { key: "publicada", label: "Publicada" },
              { key: "pendente", label: "Pendente" },
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
                  { key: "weight", label: "Peso" },
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
                Cadeira: {disciplines.find(d => d.id === filterDisc)?.name} <X className="w-2.5 h-2.5" />
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
              <th className="text-left p-3 font-medium text-muted-foreground">Avaliação</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Cadeira</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Peso</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Nota</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, idx) => {
              const isPublished = ev.published && ev.grade !== null;
              return (
                <tr
                  key={`${ev.disciplineId}-${ev.index}`}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/student/disciplines/${ev.disciplineId}/evaluation?index=${ev.index}`)}
                >
                  <td className="p-3">
                    <p className="font-medium text-foreground text-sm">{ev.name}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-medium" style={{ color: ev.disciplineColor }}>{ev.disciplineName}</span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {ev.date}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-foreground">{ev.weight}%</span>
                  </td>
                  <td className="p-3 text-center">
                    {isPublished ? (
                      <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-transparent">Publicada</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-secondary/10 text-secondary border-transparent">Pendente</Badge>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {isPublished ? (
                      <span className={cn("font-bold text-sm", (ev.grade || 0) >= 10 ? "text-accent" : "text-destructive")}>{ev.grade}/{ev.maxGrade}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma avaliação encontrada.</p>}
      </Card>
    </div>
  );
}
