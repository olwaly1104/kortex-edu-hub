import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { reitorSolicitacoes } from "@/data/institutionData";
import { candidaturas } from "@/data/admissoesData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  CreditCard, FileWarning,
  ArrowDownLeft, Users, Eye, XCircle,
  FileText, ClipboardList, GraduationCap, HeartHandshake,
  BarChart3, UserCheck, UserX, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const typeIcons: Record<string, React.ElementType> = {
  nota: FileText, plano: FileText, horário: CalendarIcon, transferência: Users, recurso: AlertCircle,
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

const estadoBadge: Record<string, string> = {
  incompleto: "bg-orange-100 text-orange-700",
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-emerald-100 text-emerald-700",
  reprovado: "bg-red-100 text-red-700",
};
const estadoLabel: Record<string, string> = {
  incompleto: "Incompleto",
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  const docsPendentes = candidaturas.filter(c => c.estado === "incompleto");
  const pagamentosPendentes = candidaturas.filter(c => c.pagamento.estado === "pendente");

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

  const alerts = [
    ...(docsPendentes.length > 0 ? [{ id: "docs", message: `${docsPendentes.length} candidatura${docsPendentes.length > 1 ? "s" : ""} com documentos em falta`, icon: FileWarning }] : []),
    ...(pagamentosPendentes.length > 0 ? [{ id: "pay", message: `${pagamentosPendentes.length} pagamento${pagamentosPendentes.length > 1 ? "s" : ""} por confirmar`, icon: CreditCard }] : []),
  ];

  // Stats
  const total = candidaturas.length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const reprovados = candidaturas.filter(c => c.estado === "reprovado").length;
  const incompletosCount = docsPendentes.length;
  const pendentesCount = candidaturas.filter(c => c.estado === "pendente").length;

  const recentCandidaturas = [...candidaturas].slice(0, 5);

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
              Área Académica — UPRA
            </p>
          </div>
          <Link to="/secretaria/admissoes" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Admissões <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-amber-600 bg-amber-50 border-amber-200">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{a.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Candidaturas", value: total, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Aprovados", value: aprovados, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
          { label: "Pendentes", value: pendentesCount, icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Incompletos", value: incompletosCount, icon: AlertCircle, color: "bg-orange-50 text-orange-600" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 1: Agenda (2/3) + Anúncios + Solicitações stacked (1/3) */}
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

        {/* Right column: Anúncios then Solicitações */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
                <Badge variant="outline" className="text-[10px] font-mono">{announcements.length}</Badge>
              </h2>
              <Link to="/secretaria/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {announcements.slice(0, 2).map(an => {
                const style = typeStyles[an.type] || typeStyles.geral;
                return (
                  <div key={an.id} className="px-3.5 py-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                      <span className="text-[11px] text-muted-foreground ml-auto">{an.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">{an.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{an.content}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">— {an.author}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
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
                {pendentes.slice(0, 2).map(sol => {
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
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <Button variant="ghost" size="sm" className="h-6 px-2 rounded-md text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                          <XCircle className="w-3 h-3" /> Rejeitar
                        </Button>
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

      {/* Row 2: Candidaturas Recentes + Acções Rápidas */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Candidaturas Recentes
            </h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCandidaturas.map(c => (
              <Link key={c.id} to={`/secretaria/admissoes/candidaturas/${c.id}`}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {c.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.cursoOpcao1}</p>
                  </div>
                  <Badge className={`${estadoBadge[c.estado]} text-[10px] border-0`}>{estadoLabel[c.estado]}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2 flex flex-col">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" /> Acções Rápidas
          </h2>
          <div className="flex flex-col gap-1.5 flex-1 justify-evenly">
            {[
              { label: "Painel de Admissões", icon: BarChart3, path: "/secretaria/admissoes", color: "bg-primary/10 text-primary" },
              { label: "Gestão de Candidaturas", icon: ClipboardList, path: "/secretaria/admissoes/candidaturas", color: "bg-emerald-50 text-emerald-600" },
              { label: "Apoio ao Estudante", icon: HeartHandshake, path: "/secretaria/apoio-estudante", color: "bg-amber-50 text-amber-600" },
              { label: "Provas de Acesso", icon: GraduationCap, path: "/secretaria/admissoes/provas-de-acesso", color: "bg-secondary/10 text-secondary" },
              { label: "Resultados e Convocações", icon: FileText, path: "/secretaria/admissoes/resultados", color: "bg-red-50 text-red-600" },
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
    </div>
  );
}
