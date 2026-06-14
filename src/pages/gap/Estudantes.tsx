import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { gapEstudantesSeguimento, gapTickets, gapAtendimentos } from "@/data/gapData";
import { FinHeader } from "@/pages/financas/_FinHeader";

export default function GapEstudantes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const enriched = useMemo(() => {
    return gapEstudantesSeguimento.map(e => {
      const tickets = gapTickets.filter(t => t.matricula === e.matricula);
      const ats = gapAtendimentos.filter(a => a.matricula === e.matricula);
      const abertos = tickets.filter(t => t.estado === "aberto" || t.estado === "em_andamento").length;
      const faculdade = ats.find(a => a.matricula === e.matricula)?.faculdade ?? "—";
      return { ...e, faculdade, solicitacoes: tickets.length, abertos, agendamentos: ats.length };
    });
  }, []);

  const filtered = useMemo(() => {
    return enriched.filter(e => {
      if (!search) return true;
      const s = search.toLowerCase();
      return e.nome.toLowerCase().includes(s) || e.matricula.includes(search) || e.curso.toLowerCase().includes(s);
    });
  }, [enriched, search]);

  const kpis = {
    total: enriched.length,
    risco: enriched.filter(e => e.risco === "alto").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <FinHeader
        title="Discentes"
        subtitle="Discentes acompanhados pelo GAP — solicitações e agendamentos."
        icon={<Users className="w-6 h-6 text-primary" />}
      />

      {/* KPIs — only 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 max-w-xl">
        {[
          { label: "Discentes", value: kpis.total, icon: Users, iconBg: "bg-primary/10 text-primary" },
          { label: "Risco Alto", value: kpis.risco, icon: AlertTriangle, iconBg: "bg-red-50 text-red-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar discente, matrícula ou curso…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {filtered.length} de {enriched.length}
          </div>
        </div>
      </Card>

      {/* Table — same pattern as Solicitações/Agendamentos */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum discente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Discente</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
                  <th className="text-center p-3 font-medium text-muted-foreground whitespace-nowrap">Ano</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Solicitações</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Agendamentos</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr
                    key={e.id}
                    onClick={() => navigate(`/gap/estudantes/${e.matricula}`)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <p className="font-medium text-foreground leading-tight">{e.nome}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{e.matricula}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{e.faculdade}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{e.curso}</p>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground tabular-nums">{e.ano}º</p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="text-sm font-semibold text-foreground tabular-nums">{e.solicitacoes}</div>
                      {e.abertos > 0 && (
                        <div className="text-[10px] text-orange-600 mt-0.5">
                          {e.abertos} aberta{e.abertos > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm font-semibold text-foreground tabular-nums">{e.agendamentos}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
