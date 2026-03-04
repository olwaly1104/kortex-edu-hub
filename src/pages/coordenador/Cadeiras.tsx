import { coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Award, ClipboardCheck, Clock, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useMemo } from "react";

type SortField = "media" | "presenca" | "entrega" | null;
type SortDir = "asc" | "desc";
type StatusFilter = "excelente" | "normal" | "risco";

export default function CoordenadorCadeiras() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);

  const toggleStatus = (s: StatusFilter) => {
    setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "desc") setSortDir("asc");
      else { setSortField(null); setSortDir("desc"); }
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const hasFilters = selectedYear !== null || search !== "" || sortField !== null || statusFilters.length > 0;

  const filtered = useMemo(() => {
    let list = coordDisciplinas
      .filter(d => selectedYear === null || d.year === selectedYear)
      .filter(d => {
        if (!search) return true;
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.professor.toLowerCase().includes(q);
      })
      .filter(d => statusFilters.length === 0 || statusFilters.includes(d.status as StatusFilter));

    if (sortField) {
      list = [...list].sort((a, b) => {
        let va = 0, vb = 0;
        if (sortField === "media") { va = a.media ?? 0; vb = b.media ?? 0; }
        else if (sortField === "presenca") { va = a.presenca; vb = b.presenca; }
        else if (sortField === "entrega") { va = a.taxaEntrega; vb = b.taxaEntrega; }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [selectedYear, search, sortField, sortDir, statusFilters]);

  const totalCadeiras = filtered.length;
  const avgPresenca = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + d.presenca, 0) / filtered.length)
    : 0;
  const avgTaxaEntrega = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + d.taxaEntrega, 0) / filtered.length)
    : 0;
  const avgMedia = filtered.length
    ? Math.round((filtered.reduce((s, d) => s + (d.media ?? 0), 0) / filtered.length) * 10) / 10
    : 0;

  const clearFilters = () => {
    setSelectedYear(null);
    setSearch("");
    setSortField(null);
    setSortDir("desc");
    setStatusFilters([]);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "desc" ? <ArrowDown className="w-3 h-3 text-primary" /> : <ArrowUp className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Cadeiras do Curso
        </h1>
        <p className="text-muted-foreground mt-1">{coordCursoInfo.name} · {coordCursoInfo.faculty}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeiras</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCadeiras}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença Geral</span>
          </div>
          <p className={`text-2xl font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardCheck className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa de Entrega</span>
          </div>
          <p className={`text-2xl font-bold ${avgTaxaEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{avgTaxaEntrega}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia}/20</p>
        </Card>
      </div>

      {/* Filters bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Year + Clear */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar cadeira..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ano:</span>
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedYear === null ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
              >Todos</button>
              {coordCursoInfo.years.map(y => (
                <button
                  key={y.year}
                  onClick={() => setSelectedYear(y.year)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedYear === y.year ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
                >{y.year}º</button>
              ))}
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[11px] h-7 gap-1 text-muted-foreground ml-auto">
                <X className="w-3 h-3" /> Limpar
              </Button>
            )}
          </div>

          {/* Row 2: Sort chips + Status chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ordenar:</span>
              {(["media", "presenca", "entrega"] as SortField[]).map(f => (
                <button
                  key={f}
                  onClick={() => toggleSort(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${sortField === f ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/60 text-muted-foreground hover:bg-muted border border-transparent"}`}
                >
                  {f === "media" ? "Média" : f === "presenca" ? "Presença" : "Entrega"}
                  <SortIcon field={f} />
                </button>
              ))}
            </div>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Estado:</span>
              <button
                onClick={() => toggleStatus("excelente")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${statusFilters.includes("excelente") ? "bg-accent/15 text-accent border-accent/30" : "bg-muted/60 text-muted-foreground hover:bg-muted border-transparent"}`}
              >Excelente</button>
              <button
                onClick={() => toggleStatus("normal")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${statusFilters.includes("normal") ? "bg-secondary/15 text-secondary-foreground border-border" : "bg-muted/60 text-muted-foreground hover:bg-muted border-transparent"}`}
              >Normal</button>
              <button
                onClick={() => toggleStatus("risco")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${statusFilters.includes("risco") ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted/60 text-muted-foreground hover:bg-muted border-transparent"}`}
              >Em Risco</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Cadeira</TableHead>
              <TableHead className="text-xs">Curso</TableHead>
              <TableHead className="text-xs">Ano</TableHead>
              <TableHead className="text-xs">Professor</TableHead>
              <TableHead className="text-xs text-center">Estudantes</TableHead>
              <TableHead className="text-xs text-center">Presença</TableHead>
              <TableHead className="text-xs text-center">Entrega</TableHead>
              <TableHead className="text-xs text-center">Média</TableHead>
              <TableHead className="text-xs text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{d.code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{coordCursoInfo.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.year}º</TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.professor}</TableCell>
                <TableCell className="text-xs font-bold text-foreground text-center">{d.estudantes}</TableCell>
                <TableCell className="text-center">
                  <span className={`text-xs font-bold ${d.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{d.presenca}%</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`text-xs font-bold ${d.taxaEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{d.taxaEntrega}%</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`text-xs font-bold ${(d.media ?? 0) >= 10 ? "text-accent" : "text-destructive"}`}>{d.media ?? "–"}/20</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`text-[10px] ${d.status === "excelente" ? "bg-accent/15 text-accent border-accent/30" : d.status === "risco" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border"}`} variant="outline">
                    {d.status === "excelente" ? "Excelente" : d.status === "risco" ? "Em Risco" : "Normal"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
