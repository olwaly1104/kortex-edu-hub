import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessoesProva, candidaturas, periodos } from "@/data/admissoesData";
import { Award, Search, CheckCircle, XCircle, Clock, Users, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const MIN_PASSING_GRADE = 10;
const ITEMS_PER_PAGE = 10;

export default function SecretariaResultados() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("all");
  const [filterPeriodo, setFilterPeriodo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  // All candidates that have been evaluated (have nota)
  const allEvaluated = candidaturas.filter(c => c.nota !== undefined || c.estado === "aguarda_resultados" || c.estado === "aprovado" || c.estado === "reprovado");

  const filtered = useMemo(() => {
    let list = allEvaluated;

    if (search) list = list.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()) || c.bi.includes(search));
    if (filterPeriodo !== "all") list = list.filter(c => c.periodo === filterPeriodo);
    if (filterSession !== "all") {
      const session = sessoesProva.find(s => s.id === filterSession);
      if (session) list = list.filter(c => session.candidatosIds.includes(c.id));
    }
    if (filterStatus === "aprovado") list = list.filter(c => c.nota !== undefined && c.nota >= MIN_PASSING_GRADE);
    if (filterStatus === "reprovado") list = list.filter(c => c.nota !== undefined && c.nota < MIN_PASSING_GRADE);
    if (filterStatus === "pendente") list = list.filter(c => c.nota === undefined);

    return list;
  }, [search, filterSession, filterPeriodo, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalAvaliados = allEvaluated.filter(c => c.nota !== undefined).length;
  const totalAprovados = allEvaluated.filter(c => c.nota !== undefined && c.nota >= MIN_PASSING_GRADE).length;
  const totalReprovados = allEvaluated.filter(c => c.nota !== undefined && c.nota < MIN_PASSING_GRADE).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
        <p className="text-sm text-muted-foreground mt-1">Notas das provas de acesso geral · Nota mínima: {MIN_PASSING_GRADE}/20</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Avaliados", value: `${totalAvaliados}/${allEvaluated.length}`, color: "text-primary bg-primary/10" },
          { icon: CheckCircle, label: "Aprovados", value: totalAprovados, color: "text-green-600 bg-green-100" },
          { icon: XCircle, label: "Reprovados", value: totalReprovados, color: "text-red-600 bg-red-100" },
          { icon: Clock, label: "Pendentes", value: allEvaluated.filter(c => c.nota === undefined).length, color: "text-yellow-600 bg-yellow-100" },
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

      {/* Table with filters */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar candidato..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={filterPeriodo} onValueChange={v => { setFilterPeriodo(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                {periodos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSession} onValueChange={v => { setFilterSession(v); setPage(1); }}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Sessão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Sessões</SelectItem>
                {sessoesProva.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Resultado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>1ª Opção</TableHead>
              <TableHead>Sessão</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(c => {
              const sessao = sessoesProva.find(s => s.candidatosIds.includes(c.id));
              const result = c.nota !== undefined ? (c.nota >= MIN_PASSING_GRADE ? "aprovado" : "reprovado") : null;
              return (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/secretaria/admissoes/candidaturas/${c.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.bi}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.cursoOpcao1}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sessao ? (
                      <div>
                        <p className="text-foreground text-xs font-medium">{new Date(sessao.data).toLocaleDateString("pt-AO")}</p>
                        <p className="text-xs">{sessao.sala}</p>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-sm font-bold">
                    {c.nota !== undefined ? `${c.nota}/20` : <span className="text-muted-foreground font-normal">—</span>}
                  </TableCell>
                  <TableCell>
                    {result === "aprovado" && <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">Aprovado</Badge>}
                    {result === "reprovado" && <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">Reprovado</Badge>}
                    {result === null && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px]">Pendente</Badge>}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum resultado encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">{filtered.length} resultado(s)</p>
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
