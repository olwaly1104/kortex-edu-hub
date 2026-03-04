import { coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Award, ClipboardCheck, Clock, Search, ArrowUp, ArrowDown, SlidersHorizontal, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";

type SortField = "media" | "presenca" | "entrega";
type SortDir = "asc" | "desc";

export default function CoordenadorCadeiras() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("media");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filtered = useMemo(() => {
    let list = coordDisciplinas
      .filter(d => selectedYear === null || d.year === selectedYear)
      .filter(d => {
        if (!search) return true;
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.professor.toLowerCase().includes(q);
      })
      .filter(d => {
        if (filterStatus === "todos" || ["media", "presenca", "entrega"].includes(filterStatus)) return true;
        return d.status === filterStatus;
      });

    list = [...list].sort((a, b) => {
      let va = 0, vb = 0;
      if (sortField === "media") { va = a.media ?? 0; vb = b.media ?? 0; }
      else if (sortField === "presenca") { va = a.presenca; vb = b.presenca; }
      else if (sortField === "entrega") { va = a.taxaEntrega; vb = b.taxaEntrega; }
      return sortDir === "asc" ? va - vb : vb - va;
    });

    return list;
  }, [selectedYear, search, sortField, sortDir, filterStatus]);

  const totalCadeiras = filtered.length;
  const avgPresenca = filtered.length ? Math.round(filtered.reduce((s, d) => s + d.presenca, 0) / filtered.length) : 0;
  const avgTaxaEntrega = filtered.length ? Math.round(filtered.reduce((s, d) => s + d.taxaEntrega, 0) / filtered.length) : 0;
  const avgMedia = filtered.length ? Math.round((filtered.reduce((s, d) => s + (d.media ?? 0), 0) / filtered.length) * 10) / 10 : 0;

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

      {/* Controls box */}
      <Card className="p-3 space-y-3">
        {/* Year filter */}
        <div className="flex flex-wrap gap-2">
          {[null, ...coordCursoInfo.years.map(y => y.year)].map(y => (
            <Button key={String(y)} size="sm" variant={selectedYear === y ? "default" : "outline"} onClick={() => setSelectedYear(y)}>
              {y === null ? "Todos os Anos" : `${y}º Ano`}
            </Button>
          ))}
        </div>

        {/* Search + Sort + Filter row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar cadeira..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>

          <div className="flex-1" />

          {(filterStatus !== "todos" || sortDir !== "desc") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground shrink-0 gap-1"
              onClick={() => { setFilterStatus("todos"); setSortField("media"); setSortDir("desc"); }}
            >
              <X className="w-3 h-3" /> Limpar filtros
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <ArrowDown className="w-3.5 h-3.5" />
                Ordenar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 space-y-0.5" align="end">
              <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>
                Maior
              </button>
              <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>
                Menor
              </button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtrar por{filterStatus !== "todos" && ":"} {filterStatus === "todos" ? "" : filterStatus === "excelente" ? "Excelente" : filterStatus === "normal" ? "Normal" : filterStatus === "risco" ? "Em Risco" : filterStatus === "media" ? "Média" : filterStatus === "presenca" ? "Presença" : "Entrega"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2 space-y-0.5" align="end">
              {[
                { key: "todos", label: "Todos" },
                { key: "media", label: "Média" },
                { key: "presenca", label: "Presença" },
                { key: "entrega", label: "Entrega" },
                { key: "excelente", label: "Excelente" },
                { key: "normal", label: "Normal" },
                { key: "risco", label: "Em Risco" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFilterStatus(opt.key);
                    if (["media", "presenca", "entrega"].includes(opt.key)) {
                      setSortField(opt.key as SortField);
                    }
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${filterStatus === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
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
