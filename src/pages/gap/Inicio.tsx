import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  HelpCircle, CalendarDays, Users, Heart,
  AlertTriangle, BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { gapTickets, gapAtendimentos, gapKpis, ticketStatusConfig, categoriaConfig, prioridadeConfig } from "@/data/gapData";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function GapInicio() {
  const { user } = useAuth();

  const stats = [
    { icon: HelpCircle, label: "Solicitações Abertas", value: gapKpis.ticketsAbertos, color: "text-orange-600 bg-orange-100" },
    { icon: Clock, label: "Em Andamento", value: gapKpis.ticketsEmAndamento, color: "text-primary bg-primary/10" },
    { icon: CalendarDays, label: "Agendamentos Hoje", value: gapKpis.atendimentosHoje, color: "text-emerald-600 bg-emerald-100" },
    { icon: AlertTriangle, label: "Risco Alto", value: gapKpis.estudantesRiscoAlto, color: "text-destructive bg-destructive/10" },
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

  const recentes = gapTickets
    .filter(t => t.estado === "aberto" || t.estado === "em_andamento")
    .slice(0, 4);

  const proxAgendamentos = gapAtendimentos
    .filter(a => a.estado === "agendado")
    .slice(0, 4);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              GAP — Gabinete de Apoio Psicopedagógico
            </p>
          </div>
          <Link to="/gap" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPIs */}
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

      {/* Row 2: Solicitações Recentes + Próximos Agendamentos + Acções */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Solicitações Recentes
              </h2>
              <Link to="/gap/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentes.map(t => {
                const cat = categoriaConfig[t.categoria];
                const st = ticketStatusConfig[t.estado];
                const pr = prioridadeConfig[t.prioridade];
                return (
                  <Link key={t.id} to="/gap/solicitacoes">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{t.assunto}</p>
                        <p className="text-[10px] text-muted-foreground">{t.estudante} · {t.curso}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${pr.color}`}>{pr.label}</Badge>
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
                { label: "Dashboard GAP", icon: BarChart3, path: "/gap", color: "bg-primary/10 text-primary" },
                { label: "Solicitações", icon: HelpCircle, path: "/gap/solicitacoes", color: "bg-orange-100 text-orange-600" },
                { label: "Agendamentos", icon: CalendarDays, path: "/gap/agendamentos", color: "bg-emerald-100 text-emerald-600" },
                { label: "Estudantes em Seguimento", icon: Heart, path: "/gap/estudantes", color: "bg-pink-100 text-pink-600" },
              ].map(a => (
                <Link key={a.path} to={a.path}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                      <a.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-medium text-foreground">{a.label}</p>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Próximos Agendamentos */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-secondary" /> Próximos Agendamentos
              <Badge variant="outline" className="text-[10px] ml-1">{proxAgendamentos.length}</Badge>
            </h2>
            <Link to="/gap/agendamentos" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {proxAgendamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem agendamentos 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {proxAgendamentos.map(a => {
                const cat = categoriaConfig[a.categoria];
                return (
                  <div key={a.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-center shrink-0 w-12">
                        <p className="text-sm font-bold text-foreground">{a.hora}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(a.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{a.estudante}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{a.motivo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                      <Badge variant="outline" className="text-[10px]">{a.tipo === "presencial" ? a.sala : "Online"}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> {a.responsavel.split(" ").slice(0, 2).join(" ")}
                      </span>
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
