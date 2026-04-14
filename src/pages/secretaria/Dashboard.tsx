import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { reitorSolicitacoes } from "@/data/institutionData";
import { candidaturas } from "@/data/admissoesData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Clock, ChevronRight,
  FileText, Calendar as CalendarIcon,
  Megaphone, CheckCircle, MapPin, Play,
  ClipboardCheck, BarChart3, UserCheck, AlertCircle,
  ArrowDownLeft, XCircle, Eye, Award,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeIcons: Record<string, React.ElementType> = {
  nota: Award,
  plano: FileText,
  horário: CalendarIcon,
  transferência: Users,
  recurso: AlertTriangle,
  material: FileText,
  reunião: CalendarIcon,
};

const typeLabels: Record<string, string> = {
  nota: "Nota", plano: "Plano", horário: "Horário", transferência: "Transferência",
  recurso: "Recurso", material: "Material", reunião: "Reunião",
};

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  média: "bg-secondary/10 text-secondary",
  baixa: "bg-muted text-muted-foreground",
};

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};


export default function SecretariaDashboard() {
  const { user } = useAuth();
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  const total = candidaturas.length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const pendentesCount = candidaturas.filter(c => c.estado === "pendente").length;
  const incompletosCount = candidaturas.filter(c => c.estado === "incompleto").length;

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

  const recentCandidaturas = [...candidaturas].slice(0, 5);

  const pedidosRecentes = [
    { id: "p1", title: "Declaração de matrícula", student: "Ana Sousa", date: "08 Abr", icon: FileText, statusLabel: "Aberto", statusColor: "bg-orange-50 text-orange-600", badgeColor: "bg-orange-100 text-orange-700" },
    { id: "p2", title: "Pedido de equivalência", student: "Carlos Mendes", date: "07 Abr", icon: ClipboardCheck, statusLabel: "Em Curso", statusColor: "bg-primary/10 text-primary", badgeColor: "bg-primary/10 text-primary" },
    { id: "p3", title: "Certidão de habilitações", student: "Maria João", date: "06 Abr", icon: FileText, statusLabel: "Resolvido", statusColor: "bg-emerald-50 text-emerald-600", badgeColor: "bg-emerald-100 text-emerald-700" },
    { id: "p4", title: "Transferência de curso", student: "Pedro Lopes", date: "05 Abr", icon: Users, statusLabel: "Aberto", statusColor: "bg-orange-50 text-orange-600", badgeColor: "bg-orange-100 text-orange-700" },
  ];

  const stats = [
    { icon: ClipboardCheck, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
    { icon: UserCheck, label: "Aprovados", value: aprovados, color: "text-accent bg-accent/10" },
    { icon: BarChart3, label: "Pendentes", value: pendentesCount, color: "text-secondary bg-secondary/10" },
    { icon: AlertCircle, label: "Incompletos", value: incompletosCount, color: "text-accent bg-accent/10" },
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
            <p className="text-muted-foreground mt-1">
              Área Académica — UPRA
            </p>
          </div>
          <Link to="/secretaria/admissoes" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Admissões <ChevronRight className="w-4 h-4" />
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

      {/* Row 2: Pedidos Recentes + Acções Rápidas (stacked) + Solicitações */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Pedidos Recentes
                <Badge variant="outline" className="text-[10px] font-mono">{pedidosRecentes.length}</Badge>
              </h2>
              <Link to="/secretaria/apoio-estudante" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {pedidosRecentes.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${p.statusColor}`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.student} • {p.date}</p>
                  </div>
                  <Badge className={`${p.badgeColor} text-[10px] border-0`}>{p.statusLabel}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex-1">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> Acções Rápidas
            </h2>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Painel de Admissões", icon: BarChart3, path: "/secretaria/admissoes", color: "bg-primary/10 text-primary" },
                { label: "Gestão de Candidaturas", icon: ClipboardCheck, path: "/secretaria/admissoes/candidaturas", color: "bg-emerald-50 text-emerald-600" },
                { label: "Apoio ao Estudante", icon: Users, path: "/secretaria/apoio-estudante", color: "bg-amber-50 text-amber-600" },
                { label: "Provas de Acesso", icon: Award, path: "/secretaria/admissoes/provas-de-acesso", color: "bg-secondary/10 text-secondary" },
                { label: "Resultados e Convocações", icon: FileText, path: "/secretaria/admissoes/resultados", color: "bg-destructive/10 text-destructive" },
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
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-6 px-2 rounded-md text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                        <XCircle className="w-3 h-3" /> Rejeitar
                      </Button>
                      <Link to="/secretaria/solicitacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
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
