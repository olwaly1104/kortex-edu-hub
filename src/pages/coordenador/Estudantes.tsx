import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { coordEstudantes, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Search, TrendingUp, AlertTriangle, Award, ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "media" | "presenca" | "taxaEntrega";
type SortDir = "asc" | "desc";

const statusBadge: Record<string, { label: string; cls: string }> = {
  excelente: { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" },
  normal: { label: "Normal", cls: "bg-muted text-muted-foreground border-border" },
  risco: { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

export default function CoordenadorEstudantes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const isSortActive = sortField !== null;
  const isFilterActive = filterStatus !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isFilterActive || isSearchActive;

  const sortLabel = sortField === "media" ? "Média" : sortField === "presenca" ? "Presença" : sortField === "taxaEntrega" ? "Entrega" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";
  const filterLabel = filterStatus === "excelente" ? "Excelente" : filterStatus === "normal" ? "Normal" : filterStatus === "risco" ? "Em Risco" : "";

  const filtered = useMemo(() => {
    let list = coordEstudantes
      .filter(e => selectedYear === null || e.year === selectedYear)
      .filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      })
      .filter(e => filterStatus === "todos" || e.status === filterStatus);

    if (sortField) {
      list = [...list].sort((a, b) => {
        let va = 0, vb = 0;
        if (sortField === "media") { va = a.media ?? 0; vb = b.media ?? 0; }
        else if (sortField === "presenca") { va = a.presenca; vb = b.presenca; }
        else if (sortField === "taxaEntrega") { va = a.taxaEntrega; vb = b.taxaEntrega; }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [selectedYear, search, sortField, sortDir, filterStatus]);

  const totalEstudantes = coordCursoInfo.totalEstudantes;
  const excelentes = coordEstudantes.filter(e => e.status === "excelente").length;
  const normais = coordEstudantes.filter(e => e.status === "normal").length;
  const emRisco = coordEstudantes.filter(e => e.status === "risco").length;

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Estudantes do Curso</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalEstudantes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Award className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Excelentes</span>
          </div>
          <p className="text-2xl font-bold text-accent">{excelentes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Normal</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{normais}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Risco</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{emRisco}</p>
        </Card>
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Year filter */}
        <div className="flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5].map(y => (
            <Button key={String(y)} size="sm" variant={selectedYear === y ? "default" : "outline"} onClick={() => setSelectedYear(y)} className="text-xs">
              {y === null ? "Todos os Anos" : `${y}º Ano`}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + Sort + Filter row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar estudante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
              { key: "excelente", label: "Excelente" },
              { key: "normal", label: "Normal" },
              { key: "risco", label: "Em Risco" },
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
                  { key: "media", label: "Média" },
                  { key: "presenca", label: "Presença" },
                  { key: "taxaEntrega", label: "Entrega" },
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
            <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Ano</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turma</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Taxa Entrega</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Média Geral</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Tarefas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Avaliações</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(e => {
            const sb = statusBadge[e.status];
            return (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => navigate(`/coordenador/estudantes/${e.id}`)}>
                <td className="p-3 font-medium text-foreground">{e.name}</td>
                <td className="p-3 text-muted-foreground">{e.email}</td>
                <td className="p-3 text-muted-foreground text-xs">{e.faculdade}</td>
                <td className="p-3 text-center">{e.year}º</td>
                <td className="p-3 text-center">{e.turma}</td>
                <td className="p-3 text-center"><span className={e.presenca >= 75 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.presenca}%</span></td>
                <td className="p-3 text-center"><span className={e.taxaEntrega >= 80 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.taxaEntrega}%</span></td>
                <td className="p-3 text-center"><span className={e.media !== null && e.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.media ?? "—"}</span></td>
                <td className="p-3 text-center"><span className="font-medium text-foreground">{e.tarefasFeitas}/{e.tarefasTotal}</span></td>
                <td className="p-3 text-center"><span className="font-medium text-foreground">{e.avaliacoesFeitas}/{e.avaliacoesTotal}</span></td>
                <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", sb.cls)}>{sb.label}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}
