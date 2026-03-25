import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { coordSolicitacoes } from "@/data/institutionData";
import {
  Users, FileText, CalendarDays, Clock, ChevronRight,
  CheckCircle, TrendingUp, AlertCircle, Megaphone,
  Calendar as CalendarIcon, Play, MapPin, ArrowDownLeft,
  AlertTriangle,
} from "lucide-react";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
};

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  média: "bg-secondary/10 text-secondary",
  baixa: "bg-muted text-muted-foreground",
};

const typeIcons: Record<string, React.ElementType> = {
  nota: TrendingUp,
  plano: FileText,
  horário: CalendarIcon,
  transferência: Users,
  recurso: AlertTriangle,
};

const typeLabels: Record<string, string> = {
  nota: "Nota", plano: "Plano", horário: "Horário",
  transferência: "Transferência", recurso: "Recurso",
  material: "Material", reunião: "Reunião",
};

const pipelineStates: EstadoCandidatura[] = ["incompleto", "pendente", "aprovado", "reprovado"];

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const total = candidaturas.length;
  const now = new Date();
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const avaliados = candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : 0;
  const incompletos = candidaturas.filter(c => c.estado === "incompleto").length;

  const pendentes = coordSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  const TODAY_DATE = "2024-02-14";
  const todayAgenda = coordAgendaEvents
    .filter(e => e.date === TODAY_DATE)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nowTime = "10:45";
  const getEventStatus = (e: typeof coordAgendaEvents[0]) => {
    if (e.endTime <= nowTime) return "concluída";
    if (e.startTime <= nowTime && e.endTime > nowTime) return "em_curso";
    return "agendada";
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "outline" }> = {
    concluída: { label: "Concluída", icon: CheckCircle, variant: "outline" },
    em_curso: { label: "Em Curso", icon: Play, variant: "default" },
    agendada: { label: "Agendada", icon: Clock, variant: "outline" },
  };

  const stats = [
    { icon: Users, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
    { icon: AlertCircle, label: "Incompletos", value: incompletos, color: "text-orange-600 bg-orange-100" },
    { icon: CheckCircle, label: "Aprovados", value: aprovados, color: "text-green-600 bg-green-100" },
    { icon: TrendingUp, label: "Taxa Aprovação", value: `${taxaAprovacao}%`, color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Secretaria Académica — Painel de Admissões</p>
          </div>
          <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Candidaturas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>

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
            <Link to="/secretaria/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver calendário <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todayAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem eventos hoje 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayAgenda.map(evento => {
                const status = getEventStatus(evento);
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={evento.id} className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ background: evento.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm leading-tight">{evento.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{evento.startTime} – {evento.endTime}</span>
                        {evento.room && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evento.room}</span>}
                      </div>
                    </div>
                    <Badge variant={status === "em_curso" ? "default" : "outline"} className="text-[10px] gap-1 shrink-0">
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
            </h2>
            <Link to="/secretaria/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
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

      {/* Row 2: Pipeline + Solicitações */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Pipeline */}
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Pipeline de Candidaturas</h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {pipelineStates.map(state => {
              const count = candidaturas.filter(c => c.estado === state).length;
              return (
                <div key={state} className="text-center p-4 rounded-xl border border-border">
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <Badge className={`mt-1.5 text-[9px] border-0 ${estadoColors[state]}`}>{estadoLabels[state]}</Badge>
                </div>
              );
            })}
          </div>
          {/* Upcoming exams mini */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Próximas Provas
              </h3>
              <Link to="/secretaria/admissoes/provas-de-acesso" className="text-xs text-primary hover:underline">Ver todas</Link>
            </div>
            <div className="space-y-1.5">
              {sessoesProva.filter(s => new Date(s.data) >= now).slice(0, 2).map(s => (
                <Link key={s.id} to={`/secretaria/admissoes/provas-de-acesso/${s.id}`}>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-xs font-medium text-foreground">{s.nome}</p>
                      <p className="text-[11px] text-muted-foreground">{s.sala} · {s.hora}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground">{new Date(s.data).toLocaleDateString("pt-AO")}</p>
                      <p className="text-[11px] text-muted-foreground">{s.candidatosIds.length}/{s.capacidadeMax}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Solicitações */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-secondary" /> Solicitações
              <Badge variant="outline" className="text-[10px] ml-1">{pendentes.length}</Badge>
            </h2>
            <Link to="/secretaria/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {pendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem solicitações pendentes 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {pendentes.slice(0, 3).map(sol => {
                const Icon = typeIcons[sol.type] || FileText;
                return (
                  <div key={sol.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted/60">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{sol.title}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{typeLabels[sol.type] || sol.type}</Badge>
                      </div>
                      <Badge className={`${priorityStyles[sol.priority]} text-[8px] px-1.5 py-0 shrink-0`}>{sol.priority}</Badge>
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
