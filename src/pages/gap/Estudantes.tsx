import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronRight } from "lucide-react";
import { gapEstudantesSeguimento, gapTickets, gapAtendimentos } from "@/data/gapData";

export default function GapEstudantes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const enriched = useMemo(() => {
    return gapEstudantesSeguimento.map(e => {
      const tickets = gapTickets.filter(t => t.matricula === e.matricula);
      const ats = gapAtendimentos.filter(a => a.matricula === e.matricula);
      const abertos = tickets.filter(t => t.estado === "aberto" || t.estado === "em_andamento").length;
      return { ...e, tickets: tickets.length, abertos, agendamentos: ats.length };
    });
  }, []);

  const filtered = useMemo(() => {
    return enriched.filter(e => {
      if (!search) return true;
      const s = search.toLowerCase();
      return e.nome.toLowerCase().includes(s) || e.matricula.includes(search) || e.curso.toLowerCase().includes(s);
    });
  }, [enriched, search]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Estudantes</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Estudantes acompanhados pelo GAP — solicitações e agendamentos.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span> de {enriched.length} estudantes
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar nome, matrícula ou curso..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Estudante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead className="text-center">Solicitações</TableHead>
              <TableHead className="text-center">Agendamentos</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id} className="cursor-pointer" onClick={() => navigate(`/gap/estudantes/${e.matricula}`)}>
                <TableCell>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{e.nome}</p>
                    <p className="text-[11px] text-muted-foreground">{e.matricula}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-foreground">{e.curso}</p>
                  <p className="text-[11px] text-muted-foreground">{e.ano}º ano</p>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm font-semibold text-foreground">{e.tickets}</div>
                  {e.abertos > 0 && <div className="text-[10px] text-orange-600">{e.abertos} aberta{e.abertos > 1 ? "s" : ""}</div>}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-semibold text-foreground">{e.agendamentos}</span>
                </TableCell>
                <TableCell>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhum estudante encontrado</p></div>
        )}
      </Card>
    </div>
  );
}
