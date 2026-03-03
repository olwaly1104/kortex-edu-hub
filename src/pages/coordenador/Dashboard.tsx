import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordSolicitacoes, coordTurmas } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, X, CheckCircle, ClipboardList,
  Eye, XCircle, GraduationCap, MapPin, Play,
  ArrowDownLeft, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const typeIcons: Record<string, React.ElementType> = {
  nota: Award,
  plano: FileText,
  horário: CalendarIcon,
  transferência: Users,
  recurso: AlertTriangle,
};

export default function CoordenadorCursoDashboard() {
  const { user } = useAuth();
  const info = coordCursoInfo;
  const pendentes = coordSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");
  const [showAllRisk, setShowAllRisk] = useState(false);

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

  const turmasEmRisco = coordTurmas.filter(
    t => t.presenca < 80 || t.media < 12 || t.taxaEntrega < 85
  );

  const stats = [
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Cadeiras Activas", value: info.disciplinasActivas, color: "text-primary bg-primary/10" },
    { icon: Clock, label: "Solicitações Pendentes", value: pendentes.length, color: "text-secondary bg-secondary/10" },
    { icon: Award, label: "Média Geral", value: info.mediaGeral, color: "text-accent bg-accent/10" },
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
              Coordenador de Curso — {info.name} • {info.faculty}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{info.code}</Badge>
            <Badge className="bg-accent text-accent-foreground text-xs">{info.years.length} Anos</Badge>
          </div>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda de Hoje */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
              </h2>
              <Link to="/coordenador/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
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

          {/* Solicitações Pendentes */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-secondary" /> Solicitações Pendentes
                <Badge variant="outline" className="text-[10px] ml-1">{pendentes.length}</Badge>
              </h2>
              <Link to="/coordenador/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {pendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem solicitações pendentes 🎉</p>
            ) : (
              <div className="space-y-2">
                {pendentes.slice(0, 3).map(sol => {
                  const Icon = typeIcons[sol.type] || FileText;
                  return (
                    <div key={sol.id} className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/60">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">{sol.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{sol.requester} • {sol.date}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link to="/coordenador/solicitacoes">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button size="sm" className="h-7 w-7 p-0 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Acções Rápidas */}
          <div className="space-y-2">
            {[
              { label: "Enviar pedido de contratação ao Decano", to: "/coordenador/solicitacoes" },
              { label: "Verificar notas pendentes de lançamento", to: "/coordenador/notas" },
              { label: "Consultar relatório de desempenho do curso", to: "/coordenador/relatorios" },
              { label: "Enviar comunicado aos docentes do curso", to: "/coordenador/chat" },
              { label: "Rever horários e salas das turmas activas", to: "/coordenador/anos" },
            ].map((s, i) => (
              <Link key={i} to={s.to}>
                <Card className="px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer group rounded-xl border border-border">
                  <p className="text-sm text-foreground">{s.label}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Anúncios */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              </h2>
              <Link to="/coordenador/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
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

          {/* Turmas em Risco */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Turmas em Risco
              </h2>
              {!showAllRisk && turmasEmRisco.length > 3 && (
                <button
                  onClick={() => setShowAllRisk(true)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todos <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {showAllRisk && (
                <button
                  onClick={() => setShowAllRisk(false)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              )}
            </div>

            {turmasEmRisco.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma turma em risco 🎉</p>
            ) : (
              <div className="space-y-2">
                {(showAllRisk ? turmasEmRisco : turmasEmRisco.slice(0, 3)).map(t => (
                  <Link key={t.id} to={`/coordenador/anos/${t.year}/turma/${t.id}`}>
                    <div className="px-3.5 py-3 rounded-xl border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground">{t.year}º Ano</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" /> Presença
                          </span>
                          <span className={`font-semibold ${t.presenca >= 80 ? "text-accent" : "text-destructive"}`}>{t.presenca}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <ClipboardList className="w-3 h-3" /> Entrega
                          </span>
                          <span className={`font-semibold ${t.taxaEntrega >= 85 ? "text-accent" : "text-destructive"}`}>{t.taxaEntrega}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Award className="w-3 h-3" /> Média
                          </span>
                          <span className={`font-semibold ${t.media >= 12 ? "text-accent" : "text-destructive"}`}>{t.media}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
