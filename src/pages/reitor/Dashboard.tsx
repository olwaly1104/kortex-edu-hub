import { useAuth } from "@/contexts/AuthContext";
import { reitorFaculties, reitorSolicitacoes, reitoriaInfo, reitorDecanosDetail } from "@/data/institutionData";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, GraduationCap, TrendingUp, ChevronRight,
  AlertTriangle, Clock, CheckSquare, Play, CheckCircle,
  Calendar as CalendarIcon, Megaphone, MapPin, UserCog, Eye,
  XCircle, ArrowDownLeft, BarChart3, Award, FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const typeIcons: Record<string, React.ElementType> = {
  nota: Award, plano: FileText, horário: CalendarIcon, transferência: Users, recurso: AlertTriangle,
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

export default function ReitorDashboard() {
  const { user } = useAuth();
  const uni = reitoriaInfo;
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

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

  // Alertas em risco
  const faculdadesEmRisco = reitorFaculties.filter(f => f.presenca < 83 || f.mediaGeral < 13);
  const decanosEmRisco = reitorDecanosDetail.filter(d => d.presenca < 85 || d.mediaGeral < 13);
  const cursosEmRisco = reitorFaculties.flatMap(f => f.courses.map(c => ({ ...c, faculty: f.name }))).filter(c => c.mediaGeral < 13 || c.presenca < 80);

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
              Reitor — {uni.name}
            </p>
          </div>
          <Link to="/reitor/faculdades" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Faculdades <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Row 1: Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
            </h2>
            <Link to="/reitor/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
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
            <Link to="/reitor/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
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

      {/* Row 2: Alertas em Risco + Solicitações */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          {/* Alertas em Risco */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-semibold text-foreground">Alertas em Risco</h2>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {/* Faculdades */}
              <div className="pr-3 border-r border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Faculdades
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{faculdadesEmRisco.length}</Badge>
                  </h3>
                  <Link to="/reitor/faculdades" className="text-[10px] text-primary hover:underline">Ver todas</Link>
                </div>
                <div className="space-y-1.5">
                  {faculdadesEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhuma ✓</p>
                  ) : faculdadesEmRisco.slice(0, 3).map(f => (
                    <Link key={f.id} to={`/reitor/faculdades/${f.id}`} className="block">
                      <div className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{f.name.replace("Faculdade de ", "")}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                          <span className={f.presenca < 83 ? "text-destructive font-medium" : "text-muted-foreground"}>{f.presenca}%</span>
                          <span className={f.mediaGeral < 13 ? "text-destructive font-medium" : "text-muted-foreground"}>{f.mediaGeral}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Decanos */}
              <div className="px-3 border-r border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <UserCog className="w-3 h-3" /> Decanos
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{decanosEmRisco.length}</Badge>
                  </h3>
                  <Link to="/reitor/decanos" className="text-[10px] text-primary hover:underline">Ver todos</Link>
                </div>
                <div className="space-y-1.5">
                  {decanosEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhum ✓</p>
                  ) : decanosEmRisco.slice(0, 3).map(d => (
                    <div key={d.id} className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                      <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{d.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                        <span className={d.presenca < 85 ? "text-destructive font-medium" : "text-muted-foreground"}>{d.presenca}%</span>
                        <span className={d.mediaGeral < 13 ? "text-destructive font-medium" : "text-muted-foreground"}>{d.mediaGeral}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Cursos */}
              <div className="pl-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Cursos
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{cursosEmRisco.length}</Badge>
                  </h3>
                  <Link to="/reitor/faculdades" className="text-[10px] text-primary hover:underline">Ver todos</Link>
                </div>
                <div className="space-y-1.5">
                  {cursosEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhum ✓</p>
                  ) : cursosEmRisco.slice(0, 3).map(c => (
                    <div key={c.id} className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                      <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                        <span className={c.presenca < 80 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.presenca}%</span>
                        <span className={c.mediaGeral < 13 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.mediaGeral}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Acções Rápidas */}
          <Card className="p-4 flex-1 flex flex-col">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" /> Acções Rápidas
            </h2>
            <div className="flex flex-col gap-1.5 flex-1 justify-evenly">
              {[
                { label: "Gerir faculdades e desempenho", icon: Building2, path: "/reitor/faculdades", color: "bg-primary/10 text-primary" },
                { label: "Consultar decanos da universidade", icon: UserCog, path: "/reitor/decanos", color: "bg-accent/10 text-accent" },
                { label: "Ver listagem de estudantes", icon: Users, path: "/reitor/estudantes", color: "bg-secondary/10 text-secondary" },
                { label: "Gerar relatórios académicos", icon: BarChart3, path: "/reitor/relatorios", color: "bg-primary/10 text-primary" },
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
            <Link to="/reitor/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                      <Link to="/reitor/solicitacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
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
