import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle, AlertTriangle, Calendar as CalendarIcon, BarChart3,
  Inbox, Building2, ArrowRight, Users,
} from "lucide-react";
import {
  gapKpis, solicitacoes, gapAtendimentos, gapEstudantesSeguimento,
  solicitacoesPorDestino, destinoConfig, estadoSolicitacaoConfig,
  ticketCategoriaConfig as categoriaConfig, tipoConfig,
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
          <p className="text-[11px] text-muted-foreground mb-4">Departamento que executa o pedido após o encaminhamento automático</p>
          <div className="space-y-3">
            {solicitacoesPorDestino.map(c => (
              <div key={c.destino}>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className={`text-[10px] ${destinoConfig[c.destino].color}`}>{c.label}</Badge>
                  <span className="text-xs font-semibold text-foreground">{c.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(c.count / maxDest) * 100}%` }} />
                </div>
              </div>
            ))}
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
          <div className="space-y-3">
            {estadoStats.map(s => {
              const pct = totalSol > 0 ? (s.count / totalSol) * 100 : 0;
              return (
                <div key={s.estado}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className={`text-[10px] ${s.color}`}>{s.label}</Badge>
                    <span className="text-xs font-semibold text-foreground">{s.count} · {pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">SLA cumprido (mês)</span>
            <span className="font-semibold text-emerald-600">87%</span>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Próximos atendimentos */}
        <Card className="p-5 lg:col-span-2">
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
              <div key={a.id} className="flex items-center gap-4 px-3 py-2.5 rounded-xl border border-border bg-card">
                <div className="text-center w-12 shrink-0">
                  <p className="text-base font-bold text-foreground leading-none">{new Date(a.data).getDate()}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}</p>
                </div>
                <div className="w-px h-10 bg-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{a.estudante}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{a.motivo}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${categoriaConfig[a.categoria].color}`}>
                    {categoriaConfig[a.categoria].label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{a.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Em Atraso — solicitações com prazo SLA ultrapassado */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Em Atraso
            </h2>
            <Link
              to="/gap/solicitacoes"
              className="text-[11px] font-medium text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {solicitacoesEmAtraso.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Sem solicitações em atraso.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border -mx-1">
              {solicitacoesEmAtraso.slice(0, 6).map(({ sol, diff }) => {
                const tCfg = tipoConfig[sol.tipo];
                return (
                  <li key={sol.id}>
                    <Link
                      to={`/gap/solicitacoes/${sol.id}`}
                      className={cn(
                        "flex items-center gap-3 px-1 py-2.5 hover:bg-muted/40 rounded-md transition-colors"
                      )}
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-destructive/10 text-destructive">
                        <span className="text-sm font-bold tabular-nums">{Math.abs(diff)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{tCfg?.label ?? sol.tipo}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {sol.estudante} · {destinoConfig[sol.destino].label}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums whitespace-nowrap text-destructive">
                        {Math.abs(diff)}d atraso
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// Suppress unused import warning when HelpCircle isn't used
void HelpCircle;
