import { useState, useMemo } from "react";
import { coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GraduationCap, Search, Users, CheckCircle, ClipboardList, Award, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";

type SortField = "presenca" | "taxaEntrega" | "mediaGeral";
type SortDir = "asc" | "desc";

export default function CoordenadorDocentes() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const isSortActive = sortField !== null;
  const isFilterActive = filterStatus !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isFilterActive || isSearchActive;

  const sortLabel = sortField === "presenca" ? "Presença" : sortField === "taxaEntrega" ? "Entrega" : sortField === "mediaGeral" ? "Média" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";
  const filterLabel = filterStatus === "excelente" ? "Excelente" : filterStatus === "normal" ? "Normal" : filterStatus === "risco" ? "Em Risco" : "";

  const filtered = useMemo(() => {
    let list = coordDocentes
      .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
      .filter(d => {
        if (filterStatus === "todos") return true;
        const estado = (d.presenca < 85 || d.taxaEntrega < 80 || d.mediaGeral < 11)
          ? "risco"
          : (d.presenca >= 93 && d.taxaEntrega >= 90 && d.mediaGeral >= 14)
            ? "excelente"
            : "normal";
        return estado === filterStatus;
      });

    if (sortField) {
      list = [...list].sort((a, b) => {
        const va = a[sortField] as number;
        const vb = b[sortField] as number;
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [search, sortField, sortDir, filterStatus]);

  const totalDocentes = coordDocentes.length;
  const presencaGeral = Math.round(coordDocentes.reduce((s, d) => s + d.presenca, 0) / totalDocentes);
  const taxaEntregaGeral = Math.round(coordDocentes.reduce((s, d) => s + d.taxaEntrega, 0) / totalDocentes);
  const mediaGeral = +(coordDocentes.reduce((s, d) => s + d.mediaGeral, 0) / totalDocentes).toFixed(1);

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Docentes do Curso</h1>
        <Badge variant="outline">{totalDocentes} docentes</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Docentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalDocentes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença Geral</span>
          </div>
          <p className={`text-2xl font-bold ${presencaGeral >= 75 ? "text-accent" : "text-destructive"}`}>{presencaGeral}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Entrega Geral</span>
          </div>
          <p className={`text-2xl font-bold ${taxaEntregaGeral >= 80 ? "text-accent" : "text-destructive"}`}>{taxaEntregaGeral}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}</p>
        </Card>
      </div>

      {/* Controls box - no year filter for Docentes */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Search + Sort + Filter row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar docente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>

          <div className="flex-1" />

          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${isSortActive ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                <ArrowUpDown className="w-3.5 h-3.5" />
                Ordenar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
              {[
                { key: "todos", label: "Todos" },
                { key: "presenca", label: "Presença" },
                { key: "taxaEntrega", label: "Entrega" },
                { key: "mediaGeral", label: "Média" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { if (opt.key === "todos") { setSortField(null); } else { setSortField(opt.key as SortField); } }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${(opt.key === "todos" && sortField === null) || sortField === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
              <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>
                Maior → Menor
              </button>
              <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>
                Menor → Maior
              </button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${isFilterActive ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 space-y-0.5" align="end" side="top">
              {[
                { key: "excelente", label: "Excelente" },
                { key: "normal", label: "Normal" },
                { key: "risco", label: "Em Risco" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setFilterStatus(filterStatus === opt.key ? "todos" : opt.key)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${filterStatus === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Active tags */}
        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isSortActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>
                {sortLabel}: {dirLabel}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isFilterActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>
                Estado: {filterLabel}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSearchActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}"
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Cadeiras</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turmas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Taxa Entrega</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Média Geral</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(d => {
            const estado = (d.presenca < 85 || d.taxaEntrega < 80 || d.mediaGeral < 11)
              ? "em risco"
              : (d.presenca >= 93 && d.taxaEntrega >= 90 && d.mediaGeral >= 14)
                ? "excelente"
                : "normal";
            const estadoStyle = estado === "excelente"
              ? "bg-accent/15 text-accent border-accent/30"
              : estado === "em risco"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-muted text-muted-foreground border-border";
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.email}</p></td>
                <td className="p-3 text-center font-medium text-foreground">{d.estudantesTotal}</td>
                <td className="p-3 text-center">{d.disciplinas}</td>
                <td className="p-3 text-center">{d.turmas}</td>
                <td className="p-3 text-center"><span className={d.presenca >= 90 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.presenca}%</span></td>
                <td className="p-3 text-center"><span className={d.taxaEntrega >= 80 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.taxaEntrega}%</span></td>
                <td className="p-3 text-center"><span className={d.mediaGeral >= 10 ? "text-accent font-bold" : "text-destructive font-bold"}>{d.mediaGeral}</span></td>
                <td className="p-3 text-center"><Badge variant="outline" className={`${estadoStyle} text-[10px]`}>{estado === "em risco" ? "Em Risco" : estado === "excelente" ? "Excelente" : "Normal"}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}
