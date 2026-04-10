import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { reitorCoordsDetail, reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserCog, Search, Users, CheckCircle, ClipboardList, Award, ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const facultyIdMap: Record<string, string> = {};
reitorFaculties.forEach(f => {
  facultyIdMap[f.name] = f.id;
  facultyIdMap[f.name.replace("Faculdade de ", "Fac. ")] = f.id;
});

type SortField = "presenca" | "taxaEntrega" | "mediaGeral";
type SortDir = "asc" | "desc";

export default function ReitorCoordenadores() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterFaculty, setFilterFaculty] = useState<string>("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const faculties = [...new Set(reitorCoordsDetail.map(c => c.faculty))];

  const isSortActive = sortField !== null;
  const isFilterActive = filterStatus !== "todos";
  const isFacultyActive = filterFaculty !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isFilterActive || isSearchActive || isFacultyActive;

  const sortLabel = sortField === "presenca" ? "Presença" : sortField === "taxaEntrega" ? "Entrega" : sortField === "mediaGeral" ? "Média" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";
  const filterLabel = filterStatus === "excelente" ? "Excelente" : filterStatus === "normal" ? "Normal" : filterStatus === "risco" ? "Em Risco" : "";

  const getEstado = (c: typeof reitorCoordsDetail[0]) =>
    (c.presenca < 85 || c.taxaEntrega < 80 || c.mediaGeral < 11) ? "risco"
    : (c.presenca >= 93 && c.taxaEntrega >= 90 && c.mediaGeral >= 14) ? "excelente"
    : "normal";

  const filtered = useMemo(() => {
    let list = reitorCoordsDetail
      .filter(c => filterFaculty === "todos" || c.faculty === filterFaculty)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.course.toLowerCase().includes(search.toLowerCase()))
      .filter(c => filterStatus === "todos" || getEstado(c) === filterStatus);
    if (sortField) {
      list = [...list].sort((a, b) => {
        const va = a[sortField] as number;
        const vb = b[sortField] as number;
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }
    return list;
  }, [search, filterFaculty, sortField, sortDir, filterStatus]);

  const totalCoord = reitorCoordsDetail.length;
  const presencaGeral = Math.round(reitorCoordsDetail.reduce((s, c) => s + c.presenca, 0) / totalCoord);
  const taxaEntregaGeral = Math.round(reitorCoordsDetail.reduce((s, c) => s + c.taxaEntrega, 0) / totalCoord);
  const mediaGeral = +(reitorCoordsDetail.reduce((s, c) => s + c.mediaGeral, 0) / totalCoord).toFixed(1);

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); setFilterFaculty("todos"); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><UserCog className="w-6 h-6 text-primary" /> Coordenadores da Universidade</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><UserCog className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Coordenadores</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCoord}</p>
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

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterFaculty === "todos" ? "default" : "outline"} onClick={() => setFilterFaculty("todos")} className="text-xs">Todas Faculdades</Button>
          {faculties.map(f => (
            <Button key={f} size="sm" variant={filterFaculty === f ? "default" : "outline"} onClick={() => setFilterFaculty(f)} className="text-xs">{f}</Button>
          ))}
        </div>
        <div className="border-t border-border" />
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar coordenador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">{s.label}</Button>
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
                  { key: "presenca", label: "Presença" },
                  { key: "taxaEntrega", label: "Entrega" },
                  { key: "mediaGeral", label: "Média" },
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

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isFacultyActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterFaculty("todos")}>
                Faculdade: {filterFaculty} <X className="w-2.5 h-2.5" />
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
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Docentes</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turmas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Cadeiras</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Taxa Entrega</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Taxa Aprovação</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Média Geral</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(c => {
            const estado = getEstado(c);
            const estadoStyle = estado === "excelente"
              ? "bg-accent/15 text-accent border-accent/30"
              : estado === "risco"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-muted text-muted-foreground border-border";
            return (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/reitor/coordenadores/${c.id}`)}>
                <td className="p-3"><span className="font-medium text-foreground">{c.name}</span><p className="text-[11px] text-muted-foreground">{c.email}</p></td>
                <td className="p-3 text-muted-foreground text-xs">{c.course}</td>
                <td className="p-3 text-xs">{facultyIdMap[c.faculty] ? <Link to={`/reitor/faculdades/${facultyIdMap[c.faculty]}`} className="text-primary hover:underline" onClick={e => e.stopPropagation()}>{c.faculty}</Link> : <span className="text-muted-foreground">{c.faculty}</span>}</td>
                <td className="p-3 text-center font-medium text-foreground">{c.estudantesTotal}</td>
                <td className="p-3 text-center">{c.docentesTotal}</td>
                <td className="p-3 text-center">{c.turmasTotal}</td>
                <td className="p-3 text-center">{c.cadeirasTotal}</td>
                <td className="p-3 text-center"><span className={c.presenca >= 90 ? "text-accent font-medium" : "text-destructive font-medium"}>{c.presenca}%</span></td>
                <td className="p-3 text-center"><span className={c.taxaEntrega >= 80 ? "text-accent font-medium" : "text-destructive font-medium"}>{c.taxaEntrega}%</span></td>
                <td className="p-3 text-center"><span className={`font-medium ${c.taxaAprovacao >= 70 ? "text-accent" : c.taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>{c.taxaAprovacao}%</span></td>
                <td className="p-3 text-center"><span className={c.mediaGeral >= 10 ? "text-accent font-bold" : "text-destructive font-bold"}>{c.mediaGeral}</span></td>
                <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", estadoStyle)}>{estado === "risco" ? "Em Risco" : estado === "excelente" ? "Excelente" : "Normal"}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum coordenador encontrado.</p>}
      </Card>
    </div>
  );
}
