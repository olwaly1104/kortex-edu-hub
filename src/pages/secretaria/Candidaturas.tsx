import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { candidaturas, periodos, cursos, sessoesProva, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";
import { Search, ChevronLeft, ChevronRight, Eye, Users, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 8;
const allStates: EstadoCandidatura[] = ["incompleto", "pendente", "aprovado", "reprovado"];

type StatusFilter = "todas" | EstadoCandidatura;
type SortOption = "recente" | "antiga" | "nome-az" | "nome-za";

export default function SecretariaCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState("all");
  const [filterCurso, setFilterCurso] = useState("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = candidaturas.filter(c => {
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.bi.includes(search)) return false;
      if (filterPeriodo !== "all" && c.periodo !== filterPeriodo) return false;
      if (filterCurso !== "all" && c.cursoOpcao1 !== filterCurso) return false;
      if (filterStatus !== "todas" && c.estado !== filterStatus) return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case "recente": return new Date(b.dataSubmissao).getTime() - new Date(a.dataSubmissao).getTime();
        case "antiga": return new Date(a.dataSubmissao).getTime() - new Date(b.dataSubmissao).getTime();
        case "nome-az": return a.nome.localeCompare(b.nome);
        case "nome-za": return b.nome.localeCompare(a.nome);
        default: return 0;
      }
    });

    return list;
  }, [search, filterPeriodo, filterCurso, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Summary KPIs
  const total = candidaturas.length;
  const incompletos = candidaturas.filter(c => c.estado === "incompleto").length;
  const pendentes = candidaturas.filter(c => c.estado === "pendente").length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const reprovados = candidaturas.filter(c => c.estado === "reprovado").length;

  const sortLabels: Record<SortOption, string> = {
    "recente": "Mais Recente",
    "antiga": "Mais Antiga",
    "nome-az": "Nome A-Z",
    "nome-za": "Nome Z-A",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidaturas</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerir candidaturas de admissão</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total", value: total, color: "text-primary bg-primary/10" },
          { icon: AlertCircle, label: "Incompletos", value: incompletos, color: "text-orange-600 bg-orange-100" },
          { icon: Clock, label: "Pendentes", value: pendentes, color: "text-yellow-600 bg-yellow-100" },
          { icon: CheckCircle, label: "Aprovados", value: aprovados, color: "text-green-600 bg-green-100" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters row 1: Search + Status toggles + Sort */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar candidato..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(["todas", ...allStates] as const).map(s => (
              <Button
                key={s}
                size="sm"
                variant={filterStatus === s ? "default" : "ghost"}
                className={`text-xs h-8 px-3 ${filterStatus === s ? "" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setFilterStatus(s); setPage(1); }}
              >
                {s === "todas" ? "Todas" : estadoLabels[s]}
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortLabels[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setSortBy(key)}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filters row 2: Período + Curso */}
        <div className="flex items-center gap-3">
          <Select value={filterPeriodo} onValueChange={v => { setFilterPeriodo(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Períodos</SelectItem>
              {periodos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCurso} onValueChange={v => { setFilterCurso(v); setPage(1); }}>
            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead>1ª Opção</TableHead>
              <TableHead>Sessão</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Data Submissão</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(c => {
              const docsEntregues = c.documentos.filter(d => d.entregue).length;
              const totalDocs = c.documentos.length;
              const sessao = sessoesProva.find(s => s.candidatosIds.includes(c.id));
              return (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/secretaria/admissoes/candidaturas/${c.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-sm">{c.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${docsEntregues === totalDocs ? "text-green-600" : "text-orange-600"}`}>
                      {docsEntregues}/{totalDocs}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{c.cursoOpcao1}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sessao ? (
                      <span className="text-xs">{sessao.nome.replace("Prova de Acesso Geral — ", "")}</span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><Badge className={`text-[10px] ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(c.dataSubmissao).toLocaleDateString("pt-AO")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma candidatura encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">{filtered.length} candidatura(s)</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page}/{totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
