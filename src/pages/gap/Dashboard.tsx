import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HelpCircle, Clock, CheckCircle, Heart,
  Smile, AlertTriangle, Calendar as CalendarIcon, BarChart3,
  Send, Inbox, Building2,
} from "lucide-react";
import {
  gapKpis, solicitacoes, gapAtendimentos, gapEstudantesSeguimento,
  solicitacoesPorDestino, destinoConfig, estadoSolicitacaoConfig,
  ticketCategoriaConfig as categoriaConfig,
} from "@/data/gapData";

export default function GapDashboard() {
  const totalSolicitacoes = solicitacoes.length;
  // Primary KPIs — pipeline de solicitações
  const primaryKpis = [
    { label: "Recebidas",    value: gapKpis.recebidas,    icon: Inbox,        iconBg: "bg-orange-50 text-orange-600",   sub: "novas" },
    { label: "Em Execução",  value: gapKpis.emExecucao,   icon: Clock,        iconBg: "bg-amber-50 text-amber-600",     sub: "no destino" },
    { label: "Concluídas",   value: gapKpis.concluidas,   icon: CheckCircle,  iconBg: "bg-emerald-50 text-emerald-600", sub: "este mês" },
    { label: "Total",        value: totalSolicitacoes,    icon: Send,         iconBg: "bg-primary/10 text-primary",     sub: "em circuito" },
  ];
  // Secondary — operação GAP
  const secondaryKpis = [
    { label: "Agendamentos Hoje", value: gapKpis.atendimentosHoje, icon: CalendarIcon, iconBg: "bg-primary/10 text-primary" },
    { label: "Estudantes Activos", value: gapKpis.estudantesAtivos, icon: Heart, iconBg: "bg-pink-50 text-pink-600" },
    { label: "Satisfação", value: `${gapKpis.satisfacao}%`, icon: Smile, iconBg: "bg-emerald-50 text-emerald-600" },
  ];

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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Dashboard GAP
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gabinete de Apoio ao Estudante — monitorização de solicitações encaminhadas e acompanhamento
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-4">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon className="w-5 h-5" />
              </div>
              {k.trend && <span className="text-[10px] text-muted-foreground">{k.trend}</span>}
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Solicitações por Destino */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Solicitações por Destino
          </h2>
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
          <h2 className="text-base font-semibold text-foreground mb-4">Estado das Solicitações</h2>
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
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" /> Próximos Agendamentos
          </h2>
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

        {/* Risco dos estudantes */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" /> Nível de Risco
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="text-xs text-muted-foreground">Risco Alto</p>
                <p className="text-xl font-bold text-destructive">{riscoAlto.length}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div>
                <p className="text-xs text-muted-foreground">Risco Médio</p>
                <p className="text-xl font-bold text-amber-600">{riscoMedio.length}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div>
                <p className="text-xs text-muted-foreground">Risco Baixo</p>
                <p className="text-xl font-bold text-emerald-600">{riscoBaixo.length}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Suppress unused import warning when HelpCircle isn't used
void HelpCircle;
