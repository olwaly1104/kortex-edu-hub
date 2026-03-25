import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { candidaturas, periodos, cursos, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const ITEMS_PER_PAGE = 8;
const allStates: EstadoCandidatura[] = ["pendente", "docs_aprovados", "convocado", "aguarda_resultados", "aprovado", "reprovado", "desistiu"];

export default function SecretariaCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState("all");
  const [filterCurso, setFilterCurso] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return candidaturas.filter(c => {
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.bi.includes(search)) return false;
      if (filterPeriodo !== "all" && c.periodo !== filterPeriodo) return false;
      if (filterCurso !== "all" && c.cursoOpcao1 !== filterCurso) return false;
      if (filterEstado !== "all" && c.estado !== filterEstado) return false;
      return true;
    });
  }, [search, filterPeriodo, filterCurso, filterEstado]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidaturas</h1>
        <p className="text-muted-foreground">Gerir candidaturas de admissão</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar por nome ou BI..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={filterPeriodo} onValueChange={v => { setFilterPeriodo(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                {periodos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCurso} onValueChange={v => { setFilterCurso(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Curso" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Cursos</SelectItem>
                {cursos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={v => { setFilterEstado(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                {allStates.map(s => <SelectItem key={s} value={s}>{estadoLabels[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Nº BI</TableHead>
                <TableHead>1ª Opção</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data Submissão</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(c => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/secretaria/admissoes/candidaturas/${c.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-sm">{c.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.bi}</TableCell>
                  <TableCell className="text-sm">{c.cursoOpcao1}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(c.dataSubmissao).toLocaleDateString("pt-AO")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma candidatura encontrada.</TableCell></TableRow>
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
        </CardContent>
      </Card>
    </div>
  );
}
