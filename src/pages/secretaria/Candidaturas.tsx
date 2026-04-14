import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { candidaturas, sessoesProva, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";
import { Search, ChevronLeft, ChevronRight, Eye, Users, Clock, CheckCircle, AlertCircle, X } from "lucide-react";

const ITEMS_PER_PAGE = 8;
const allStates: EstadoCandidatura[] = ["incompleto", "pendente", "aprovado", "reprovado"];

type StatusFilter = "todas" | EstadoCandidatura;

export default function SecretariaCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterSessao, setFilterSessao] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = candidaturas.filter(c => {
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.bi.includes(search)) return false;
      if (filterSessao && c.sessaoProvaId !== filterSessao) return false;
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
  }, [search, filterSessao, filterStatus, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Summary KPIs
  const total = candidaturas.length;
  const incompletos = candidaturas.filter(c => c.estado === "incompleto").length;
  const pendentes = candidaturas.filter(c => c.estado === "pendente").length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;

  const statusToggles: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "incompleto", label: "Incompleto" },
    { key: "pendente", label: "Pendente" },
    { key: "aprovado", label: "Aprovado" },
    { key: "reprovado", label: "Reprovado" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidaturas</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerir candidaturas de admissão</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Total", value: total, color: "text-primary bg-primary/10" },
          { icon: AlertCircle, label: "Incompletos", value: incompletos, color: "text-orange-600 bg-orange-100" },
          { icon: Clock, label: "Pendentes", value: pendentes, color: "text-yellow-600 bg-yellow-100" },
          { icon: CheckCircle, label: "Aprovados", value: aprovados, color: "text-green-600 bg-green-100" },
        ].map(s => (
          <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls box — matching Avaliações pattern */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Row 1: Session toggles */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={!filterSessao ? "default" : "outline"} onClick={() => { setFilterSessao(null); setPage(1); }} className="text-xs">
            Todas as Sessões
          </Button>
          {sessoesProva.map((s, i) => (
            <Button key={s.id} size="sm" variant={filterSessao === s.id ? "default" : "outline"} onClick={() => { setFilterSessao(s.id); setPage(1); }} className="text-xs">
              {i + 1}ª Sessão
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Row 2: Search + status toggles + sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar candidato..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
          </div>
          {search && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={() => setSearch("")}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {statusToggles.map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => { setFilterStatus(s.key); setPage(1); }} className="text-xs">
                {s.label}
              </Button>
            ))}

            <div className="w-px h-6 bg-border" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {([
                  { key: "recente", label: "Mais Recente" },
                  { key: "antiga", label: "Mais Antiga" },
                  { key: "nome-az", label: "Nome A–Z" },
                  { key: "nome-za", label: "Nome Z–A" },
                ] as { key: SortOption; label: string }[]).map(o => (
                  <DropdownMenuItem key={o.key} onClick={() => setSortBy(o.key)} className={sortBy === o.key ? "bg-accent font-medium" : ""}>
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
              const sessaoIndex = sessao ? sessoesProva.indexOf(sessao) + 1 : null;
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
                    {sessaoIndex ? <span className="text-xs">{sessaoIndex}ª Sessão</span> : <span className="text-muted-foreground">—</span>}
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
