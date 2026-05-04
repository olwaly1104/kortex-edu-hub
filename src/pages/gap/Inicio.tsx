import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  HelpCircle, CalendarDays, Users,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { gapTickets, gapAtendimentos, gapKpis, ticketCategoriaConfig } from "@/data/gapData";
import { solicitacoes, estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig as solCategoriaConfig, type Categoria } from "@/data/gapData";

const estadoDot: Record<string, string> = {
  recebida: "bg-amber-500",
  em_execucao: "bg-sky-500",
  concluida: "bg-emerald-500",
  rejeitada: "bg-destructive",
};

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function GapInicio() {
  const { user } = useAuth();

  const stats = [
    { icon: HelpCircle, label: "Recebidas", value: gapKpis.recebidas, color: "text-orange-600 bg-orange-100" },
    { icon: Clock, label: "Em Atraso", value: gapKpis.emExecucao, color: "text-amber-600 bg-amber-100" },
    { icon: CalendarDays, label: "Agendamentos Hoje", value: gapKpis.atendimentosHoje, color: "text-emerald-600 bg-emerald-100" },
    { icon: AlertTriangle, label: "SLA em Risco", value: gapKpis.slaEmRisco, color: "text-destructive bg-destructive/10" },
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

  const recentes = solicitacoes
    .filter(s => s.estado === "recebida" || s.estado === "em_execucao")
    .slice(0, 4);

  const proxAgendamentos = gapAtendimentos
    .filter(a => a.estado === "agendado")
    .slice(0, 3);

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

      {/* Row 2: Solicitações Recentes (main) + Próximos Agendamentos (side) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Solicitações Recentes
              <Badge variant="outline" className="text-[10px] font-mono">{recentes.length}</Badge>
            </h2>
            <Link to="/gap/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentes.map(s => {
              const st = estadoSolicitacaoConfig[s.estado];
              const dest = destinoConfig[s.destino];
              const tipoCfg = tipoConfig[s.tipo];
              const dSub = new Date(s.dataSubmissao);
              return (
                <Link key={s.id} to={`/gap/solicitacoes/${s.id}`}>
                  <div className="flex items-center gap-3 px-2 py-3 hover:bg-muted/40 transition-colors cursor-pointer">
                    {/* Date tile */}
                    <div className="shrink-0 w-11 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {dSub.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "")}
                      </p>
                      <p className="text-base font-bold text-foreground tabular-nums leading-none mt-0.5">
                        {String(dSub.getDate()).padStart(2, "0")}
                      </p>
                    </div>
                    <div className="w-px h-9 bg-border shrink-0" />
                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">
                        {tipoCfg?.label ?? s.tipo}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {s.discente} · <span className="font-mono">{s.id}</span>
                      </p>
                    </div>
                    {/* Badges */}
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {dest.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", st.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", estadoDot[s.estado])} />
                        {st.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="p-5">
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
                const cat = ticketCategoriaConfig[a.categoria];
                return (
                  <div key={a.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-center shrink-0 w-12">
                        <p className="text-sm font-bold text-foreground">{a.hora}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(a.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{a.discente}</p>
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
