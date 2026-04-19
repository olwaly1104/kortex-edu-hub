import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { reitorSolicitacoes } from "@/data/institutionData";
import {
  gapTickets, gapAtendimentos, gapKpis,
  ticketStatusConfig, categoriaConfig, prioridadeConfig,
} from "@/data/gapData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  HelpCircle, ArrowDownLeft, Users, Eye, XCircle,
  Heart, AlertCircle, BarChart3, Library, TrendingUp,
  Smile, FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const solTypeIcons: Record<string, React.ElementType> = {
  nota: HelpCircle, plano: HelpCircle, horário: CalendarIcon, transferência: Users, recurso: AlertCircle,
};
const solTypeLabels: Record<string, string> = {
  nota: "Nota", plano: "Plano", horário: "Horário", transferência: "Transferência",
  recurso: "Recurso", material: "Material", reunião: "Reunião",
};
const solPriorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  média: "bg-secondary/10 text-secondary",
  baixa: "bg-muted text-muted-foreground",
};

export default function GapInicio() {
  const { user } = useAuth();
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  const stats = [
    { icon: HelpCircle, label: "Tickets Abertos", value: gapKpis.ticketsAbertos, color: "text-orange-600 bg-orange-100" },
    { icon: Clock, label: "Em Andamento", value: gapKpis.ticketsEmAndamento, color: "text-blue-600 bg-blue-100" },
    { icon: CalendarIcon, label: "Atendimentos Hoje", value: gapKpis.atendimentosHoje, color: "text-primary bg-primary/10" },
    { icon: Heart, label: "Estudantes Acompanhados", value: gapKpis.estudantesAtivos, color: "text-pink-600 bg-pink-100" },
  ];

  const TODAY_DATE = "2024-02-14";
  const todayAgenda = coordAgendaEvents
    .filter(e => e.date === TODAY_DATE)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = "10:45";
  const getEventStatus = (e: typeof coordAgendaEvents[0]) => {
    if (e.endTime <= now) return "concluída";
    if (e.startTime <= now && e.endTime > now) return "em_curso";
    return "agendada";
  };
  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "outline" }> = {
    concluída: { label: "Concluída", icon: CheckCircle, variant: "outline" },
    em_curso: { label: "Em Curso", icon: Play, variant: "default" },
    agendada: { label: "Agendada", icon: Clock, variant: "outline" },
  };

  const ticketsRecentes = [...gapTickets]
    .filter(t => t.estado !== "resolvido")
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 4);

  const proxAtendimentos = gapAtendimentos
    .filter(a => a.estado === "agendado")
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 3);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-pink-50 via-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              GAP — Gabinete de Apoio ao Estudante · UPRA
            </p>
          </div>
          <Link to="/gap/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 1: Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
            </h2>
            <Link to="/gap/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver calendário <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todayAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem eventos hoje 🎉</p>
          ) : (
            <div className="divide-y divide-border">
              {todayAgenda.map(evento => {
                const status = getEventStatus(evento);
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;
                const isActive = status === "em_curso";
                return (
                  <div key={evento.id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="text-center shrink-0 w-14">
                      <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{evento.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">{evento.endTime}</p>
                    </div>
                    <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: evento.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{evento.title}</p>
                      {evento.room && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{evento.room}
                        </p>
                      )}
                    </div>
                    <Badge variant={isActive ? "default" : "outline"} className="text-[10px] gap-1 shrink-0">
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              <Badge variant="outline" className="text-[10px] font-mono">{announcements.length}</Badge>
            </h2>
            <Link to="/gap/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map(an => {
              const style = typeStyles[an.type] || typeStyles.geral;
              return (
                <div key={an.id} className="px-3.5 py-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">{an.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">{an.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{an.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">— {an.author}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 2: Tickets/Atendimentos + Acções Rápidas left, Solicitações right */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Tickets Recentes
              </h2>
              <Link to="/gap/tickets" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {ticketsRecentes.map(t => {
                const cat = categoriaConfig[t.categoria];
                const st = ticketStatusConfig[t.estado];
                const pr = prioridadeConfig[t.prioridade];
                return (
                  <Link key={t.id} to="/gap/tickets" className="block">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{t.assunto}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{t.estudante}</span>
                          <Badge variant="outline" className={`text-[9px] ${cat.color}`}>{cat.label}</Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${pr.color} shrink-0`}>{pr.label}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${st.color} shrink-0`}>{st.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 flex-1">
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> Acções Rápidas
            </h2>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Dashboard de apoio", icon: BarChart3, path: "/gap/dashboard", color: "bg-primary/10 text-primary" },
                { label: "Gerir tickets", icon: HelpCircle, path: "/gap/tickets", color: "bg-orange-100 text-orange-600" },
                { label: "Agendar atendimento", icon: CalendarIcon, path: "/gap/atendimentos", color: "bg-emerald-100 text-emerald-600" },
                { label: "Estudantes em seguimento", icon: Heart, path: "/gap/estudantes", color: "bg-pink-100 text-pink-600" },
                { label: "Base de conhecimento", icon: Library, path: "/gap/conhecimento", color: "bg-purple-100 text-purple-600" },
              ].map(action => (
                <Link key={action.path} to={action.path}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                      <action.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-medium text-foreground">{action.label}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Solicitações Pendentes */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-secondary" /> Solicitações
              <Badge variant="outline" className="text-[10px] ml-1">{pendentes.length}</Badge>
            </h2>
            <Link to="/gap/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {pendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem solicitações pendentes 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {pendentes.slice(0, 3).map(sol => {
                const Icon = solTypeIcons[sol.type] || FileText;
                return (
                  <div key={sol.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted/60">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{sol.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{solTypeLabels[sol.type] || sol.type}</Badge>
                      </div>
                      <Badge className={`${solPriorityStyles[sol.priority]} text-[8px] px-1.5 py-0 shrink-0`}>{sol.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{sol.description}</p>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">{sol.requester}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{sol.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-6 px-2 rounded-md text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                        <XCircle className="w-3 h-3" /> Rejeitar
                      </Button>
                      <Link to="/gap/solicitacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                        <Eye className="w-3 h-3" /> Ver detalhes
                      </Link>
                      <Button size="sm" className="h-6 px-2 rounded-md text-[10px] bg-accent hover:bg-accent/90 text-accent-foreground gap-1">
                        <CheckCircle className="w-3 h-3" /> Aprovar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
