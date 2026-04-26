import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle, AlertTriangle, Calendar as CalendarIcon, BarChart3,
  Inbox, Building2, ArrowRight, Users, ListChecks,
} from "lucide-react";
import {
  gapKpis, solicitacoes, gapAtendimentos, gapEstudantesSeguimento,
  solicitacoesPorDestino, destinoConfig, estadoSolicitacaoConfig,
  ticketCategoriaConfig, tipoConfig, categoriaConfig,
} from "@/data/gapData";

const TODAY_STR = "2025-12-16";

export default function GapDashboard() {
  const totalSolicitacoes = solicitacoes.length;
  // Single consolidated KPI row — essentials only
  const kpis = [
    { label: "Recebidas",        value: gapKpis.recebidas,       icon: Inbox,        iconBg: "bg-orange-50 text-orange-600",   sub: "novas" },
    { label: "Em Execução",      value: gapKpis.emExecucao,      icon: Clock,        iconBg: "bg-amber-50 text-amber-600",     sub: "no destino" },
    { label: "Concluídas",       value: gapKpis.concluidas,      icon: CheckCircle,  iconBg: "bg-emerald-50 text-emerald-600", sub: "este mês" },
    { label: "Agendamentos Hoje",value: gapKpis.atendimentosHoje,icon: CalendarIcon, iconBg: "bg-primary/10 text-primary",     sub: "sessões" },
    { label: "Estudantes Activos",value: gapKpis.estudantesAtivos,icon: Users,       iconBg: "bg-pink-50 text-pink-600",       sub: "em seguimento" },
  ];
  void totalSolicitacoes;

  const maxDest = Math.max(...solicitacoesPorDestino.map(c => c.count), 1);
  const totalSol = solicitacoes.length;
  const estadoStats = (Object.keys(estadoSolicitacaoConfig) as (keyof typeof estadoSolicitacaoConfig)[]).map(s => ({
    estado: s,
    label: estadoSolicitacaoConfig[s].label,
    color: estadoSolicitacaoConfig[s].color,
    count: solicitacoes.filter(t => t.estado === s).length,
  }));

  const proximosAtendimentos = gapAtendimentos
    .filter(a => a.estado === "agendado")
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);

  const riscoAlto  = gapEstudantesSeguimento.filter(e => e.risco === "alto");
  const riscoMedio = gapEstudantesSeguimento.filter(e => e.risco === "medio");
  const riscoBaixo = gapEstudantesSeguimento.filter(e => e.risco === "baixo");
  void riscoAlto; void riscoMedio; void riscoBaixo;

  // Solicitações em atraso — prazo SLA já ultrapassado
  const today = new Date(TODAY_STR); today.setHours(0, 0, 0, 0);
  const solicitacoesEmAtraso = solicitacoes
    .filter(s => s.estado !== "concluida" && s.estado !== "rejeitada")
    .map(s => {
      const sla = s.slaDias ?? tipoConfig[s.tipo]?.slaDias;
      if (!sla) return null;
      const base = new Date(s.dataEncaminhamento ?? s.dataSubmissao);
      base.setDate(base.getDate() + sla);
      const diff = Math.ceil((base.getTime() - today.getTime()) / 86400000);
      return { sol: s, diff, prazo: base };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.diff < 0)
    .sort((a, b) => a.diff - b.diff);

  const slaConcluidas = solicitacoes.filter(s => s.estado === "concluida").length;
  const slaEmAtraso = solicitacoesEmAtraso.length;
  const slaPct = totalSol > 0 ? Math.round((slaConcluidas / totalSol) * 100) : 0;
  const totalDest = solicitacoesPorDestino.reduce((a, c) => a + c.count, 0);

  // Solicitações por motivo (categoria funcional)
  const motivoStats = (Object.keys(categoriaConfig) as (keyof typeof categoriaConfig)[]).map(cat => {
    const sols = solicitacoes.filter(s => tipoConfig[s.tipo]?.categoria === cat);
    const total = sols.length;
    const concluidas = sols.filter(s => s.estado === "concluida").length;
    const emExecucao = sols.filter(s => s.estado === "em_execucao" || s.estado === "recebida").length;
    const atraso = solicitacoesEmAtraso.filter(({ sol }) => tipoConfig[sol.tipo]?.categoria === cat).length;
    // top 3 tipos
    const tipoCounts = new Map<string, number>();
    sols.forEach(s => tipoCounts.set(s.tipo, (tipoCounts.get(s.tipo) ?? 0) + 1));
    const topTipos = Array.from(tipoCounts.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([tipo, count]) => ({ label: tipoConfig[tipo]?.label ?? tipo, count }));
    return { categoria: cat, cfg: categoriaConfig[cat], total, concluidas, emExecucao, atraso, topTipos };
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Dashboard GAP
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Gabinete de Apoio ao Estudante — monitorização do pipeline de solicitações encaminhadas e acompanhamento individual.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 px-3 py-1.5">
          Ano Letivo 2024/2025
        </Badge>
      </div>

      {/* Single consolidated KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${k.iconBg}`}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Próximos Agendamentos + Em Atraso — topo */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> Próximos Agendamentos
            </h2>
            <Link to="/gap/agendamentos" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {proximosAtendimentos.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card">
                <div className="text-center w-10 shrink-0">
                  <p className="text-base font-bold text-foreground leading-none">{new Date(a.data).getDate()}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}</p>
                </div>
                <div className="w-px h-10 bg-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{a.estudante}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{a.motivo}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${ticketCategoriaConfig[a.categoria].color}`}>
                    {ticketCategoriaConfig[a.categoria].label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{a.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Em Atraso */}
        <Card className="overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground leading-tight">Em Atraso</h2>
                <p className="text-[11px] text-muted-foreground truncate">Solicitações em atraso</p>
              </div>
              {solicitacoesEmAtraso.length > 0 && (
                <Badge variant="outline" className="ml-1 text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                  {solicitacoesEmAtraso.length}
                </Badge>
              )}
            </div>
            <Link to="/gap/solicitacoes" className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {solicitacoesEmAtraso.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sem solicitações em atraso.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Solicitação</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estudante</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Responsável</th>
                    <th className="text-center p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoesEmAtraso.slice(0, 5).map(({ sol, diff }) => {
                    const tCfg = tipoConfig[sol.tipo];
                    const dCfg = destinoConfig[sol.destino];
                    return (
                      <tr
                        key={sol.id}
                        onClick={() => (window.location.href = `/gap/solicitacoes/${sol.id}`)}
                        className={cn("border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer")}
                      >
                        <td className="p-3">
                          <p className="font-medium text-foreground leading-tight text-xs line-clamp-1">{tCfg?.label ?? sol.tipo}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{sol.id}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-foreground leading-tight line-clamp-1">{sol.estudante}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{sol.matricula}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-foreground leading-tight line-clamp-1">{sol.responsavelDestino ?? "—"}</p>
                          <Badge variant="outline" className={`mt-0.5 text-[9px] px-1.5 py-0 ${dCfg?.color ?? ""}`}>{dCfg?.label ?? sol.destino}</Badge>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-semibold tabular-nums">
                            <Clock className="w-3 h-3" /> {Math.abs(diff)}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Solicitações por Motivo — 3 categorias funcionais */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Solicitações por Motivo</h2>
            <span className="text-[11px] text-muted-foreground">· categoria funcional do pedido</span>
          </div>
          <Link to="/gap/solicitacoes" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {motivoStats.map(m => {
            const Icon = m.cfg.icon;
            const pct = totalSol > 0 ? Math.round((m.total / totalSol) * 100) : 0;
            return (
              <Card key={m.categoria} className="p-5 hover:shadow-md transition-shadow flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${m.cfg.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">{m.cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{pct}% do total</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{m.total}</p>
                </div>

                {/* Distribution bar */}
                <div className="mt-4">
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
                    {m.total > 0 && (
                      <>
                        <div className="bg-emerald-500" style={{ width: `${(m.concluidas / m.total) * 100}%` }} />
                        <div className="bg-sky-500" style={{ width: `${(m.emExecucao / m.total) * 100}%` }} />
                        <div className="bg-destructive" style={{ width: `${(m.atraso / m.total) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Concluídas</p>
                      <p className="text-xs font-bold text-emerald-600 tabular-nums mt-0.5">{m.concluidas}</p>
                    </div>
                    <div className="border-x border-border">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Em Curso</p>
                      <p className="text-xs font-bold text-sky-600 tabular-nums mt-0.5">{m.emExecucao}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Atraso</p>
                      <p className="text-xs font-bold text-destructive tabular-nums mt-0.5">{m.atraso}</p>
                    </div>
                  </div>
                </div>

                {/* Top tipos */}
                <div className="mt-4 pt-3 border-t border-border flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Pedidos mais frequentes</p>
                  <div className="space-y-1.5">
                    {m.topTipos.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic">Sem dados</p>
                    ) : m.topTipos.map((t, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-foreground line-clamp-1 flex-1">{t.label}</p>
                        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums shrink-0">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Por Destino + Estado — fim da página */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Solicitações por Destino */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Solicitações por Destino
            </h2>
            <Link to="/gap/solicitacoes" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Departamento responsável após o encaminhamento automático</p>
          <div className="space-y-2.5">
            {solicitacoesPorDestino.map(c => {
              const pct = totalDest > 0 ? (c.count / totalDest) * 100 : 0;
              return (
                <div key={c.destino} className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] shrink-0 w-[110px] justify-center ${destinoConfig[c.destino].color}`}>{c.label}</Badge>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(c.count / maxDest) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums w-8 text-right">{c.count}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-9 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total encaminhadas</span>
            <span className="font-semibold text-foreground tabular-nums">{totalDest}</span>
          </div>
        </Card>

        {/* Estado das solicitações */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Estado das Solicitações</h2>
            <Link to="/gap/solicitacoes" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {estadoStats.map(s => {
              const pct = totalSol > 0 ? (s.count / totalSol) * 100 : 0;
              return (
                <div key={s.estado} className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] shrink-0 w-[110px] justify-center ${s.color}`}>{s.label}</Badge>
                  <div className="flex-1">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums w-8 text-right">{s.count}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-9 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SLA Cumprido</p>
              <p className="text-sm font-bold text-emerald-600 tabular-nums mt-0.5">{slaPct}%</p>
            </div>
            <div className="border-x border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Concluídas</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{slaConcluidas}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em Atraso</p>
              <p className="text-sm font-bold text-destructive tabular-nums mt-0.5">{slaEmAtraso}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
