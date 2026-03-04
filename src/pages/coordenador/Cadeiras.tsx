import { coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, MapPin, Calendar, User, ClipboardCheck, Clock, Search, ArrowUpDown, X } from "lucide-react";
import { useState, useMemo } from "react";

type SortField = "none" | "media-asc" | "media-desc" | "presenca-asc" | "presenca-desc" | "entrega-asc" | "entrega-desc" | "estudantes-asc" | "estudantes-desc";

export default function CoordenadorCadeiras() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("none");

  const hasFilters = selectedYear !== null || search !== "" || sortBy !== "none";

  const filtered = useMemo(() => {
    let list = coordDisciplinas
      .filter(d => selectedYear === null || d.year === selectedYear)
      .filter(d => {
        if (!search) return true;
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.professor.toLowerCase().includes(q);
      });

    if (sortBy !== "none") {
      const [field, dir] = sortBy.split("-") as [string, string];
      list = [...list].sort((a, b) => {
        let va = 0, vb = 0;
        if (field === "media") { va = a.media ?? 0; vb = b.media ?? 0; }
        else if (field === "presenca") { va = a.presenca; vb = b.presenca; }
        else if (field === "entrega") { va = a.taxaEntrega; vb = b.taxaEntrega; }
        else if (field === "estudantes") { va = a.estudantes; vb = b.estudantes; }
        return dir === "asc" ? va - vb : vb - va;
      });
    }

    return list;
  }, [selectedYear, search, sortBy]);

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
    setSortBy("none");
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

      {/* Year toggle + Search + Sort */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Ano:</span>
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >Todos</button>
            {coordCursoInfo.years.map(y => (
              <button
                key={y.year}
                onClick={() => setSelectedYear(y.year)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === y.year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >{y.year}º Ano</button>
            ))}
          </div>
          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar cadeira..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Ordenar:</span>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="Sem ordenação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem ordenação</SelectItem>
              <SelectItem value="media-desc">Média ↓ (maior)</SelectItem>
              <SelectItem value="media-asc">Média ↑ (menor)</SelectItem>
              <SelectItem value="presenca-desc">Presença ↓ (maior)</SelectItem>
              <SelectItem value="presenca-asc">Presença ↑ (menor)</SelectItem>
              <SelectItem value="entrega-desc">Entrega ↓ (maior)</SelectItem>
              <SelectItem value="entrega-asc">Entrega ↑ (menor)</SelectItem>
              <SelectItem value="estudantes-desc">Estudantes ↓ (maior)</SelectItem>
              <SelectItem value="estudantes-asc">Estudantes ↑ (menor)</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-9 gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Discipline cards grouped by year */}
      {(selectedYear ? [selectedYear] : [...new Set(coordDisciplinas.map(d => d.year))].sort()).map(year => {
        const yearDisciplinas = filtered.filter(d => d.year === year);
        if (yearDisciplinas.length === 0) return null;
        return (
          <div key={year}>
            <h2 className="text-lg font-semibold text-foreground mb-3">{year}º Ano</h2>
            <div className="space-y-2">
              {yearDisciplinas.map(d => (
                <Card key={d.id} className={`p-4 border-l-[3px] ${(d.media ?? 0) >= 10 ? "border-l-accent" : "border-l-destructive"} hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{d.name}</p>
                        <Badge variant="outline" className="text-[10px] font-mono">{d.code}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{coordCursoInfo.name}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.professor}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.diasAula}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Estudantes</p>
                        <p className="text-xs font-bold text-foreground">{d.estudantes}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                        <p className={`text-xs font-bold ${(d.media ?? 0) >= 10 ? "text-accent" : "text-destructive"}`}>{d.media ?? "–"}/20</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                        <p className={`text-xs font-bold ${d.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{d.presenca}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                        <p className={`text-xs font-bold ${d.taxaEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{d.taxaEntrega}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
