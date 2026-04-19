import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HelpCircle, Clock, CheckCircle, Users, Heart, TrendingUp,
  Smile, AlertTriangle, Calendar as CalendarIcon, BarChart3,
} from "lucide-react";
import {
  gapKpis, gapTickets, gapAtendimentos, gapEstudantesSeguimento,
  gapCategoriaStats, categoriaConfig, ticketStatusConfig,
} from "@/data/gapData";

export default function GapDashboard() {
  const kpis = [
    { label: "Solicitações Abertas", value: gapKpis.ticketsAbertos, icon: HelpCircle, color: "text-orange-600 bg-orange-100", trend: "+3 hoje" },
    { label: "Em Andamento", value: gapKpis.ticketsEmAndamento, icon: Clock, color: "text-blue-600 bg-blue-100", trend: "" },
    { label: "Resolvidas (30d)", value: gapKpis.ticketsResolvidos30d, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100", trend: "+12% vs mês ant." },
    { label: "Agendamentos Hoje", value: gapKpis.atendimentosHoje, icon: CalendarIcon, color: "text-primary bg-primary/10", trend: "" },
    { label: "Estudantes Activos", value: gapKpis.estudantesAtivos, icon: Heart, color: "text-pink-600 bg-pink-100", trend: "" },
    { label: "Risco Alto", value: gapKpis.estudantesRiscoAlto, icon: AlertTriangle, color: "text-destructive bg-destructive/10", trend: "" },
    { label: "Tempo Médio Resp.", value: gapKpis.tempoMedioResposta, icon: TrendingUp, color: "text-amber-600 bg-amber-100", trend: "" },
    { label: "Satisfação", value: `${gapKpis.satisfacao}%`, icon: Smile, color: "text-emerald-600 bg-emerald-100", trend: "+2pp" },
  ];

  const maxCat = Math.max(...gapCategoriaStats.map(c => c.count), 1);
  const ticketsByStatus = (Object.keys(ticketStatusConfig) as Array<keyof typeof ticketStatusConfig>).map(s => ({
    estado: s,
    label: ticketStatusConfig[s].label,
    color: ticketStatusConfig[s].color,
    count: gapTickets.filter(t => t.estado === s).length,
  }));

  const totalTickets = gapTickets.length;
  const proximosAtendimentos = gapAtendimentos
    .filter(a => a.estado === "agendado")
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);

  const riscoAlto = gapEstudantesSeguimento.filter(e => e.risco === "alto");
  const riscoMedio = gapEstudantesSeguimento.filter(e => e.risco === "medio");
  const riscoBaixo = gapEstudantesSeguimento.filter(e => e.risco === "baixo");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Dashboard GAP
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gabinete de Apoio ao Estudante — visão analítica e operacional
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
        {/* Distribuição por categoria */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Distribuição por Categoria</h2>
          <div className="space-y-3">
            {gapCategoriaStats.map(c => (
              <div key={c.categoria}>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className={`text-[10px] ${categoriaConfig[c.categoria].color}`}>
                    {c.label}
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">{c.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Estado das solicitações */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Estado das Solicitações</h2>
          <div className="space-y-3">
            {ticketsByStatus.map(s => {
              const pct = totalTickets > 0 ? (s.count / totalTickets) * 100 : 0;
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
            <span className="text-muted-foreground">Taxa de resolução (30d)</span>
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
                  <p className="text-base font-bold text-foreground leading-none">
                    {new Date(a.data).getDate()}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">
                    {new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}
                  </p>
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
