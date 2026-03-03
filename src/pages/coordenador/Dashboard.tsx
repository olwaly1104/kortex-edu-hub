import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordAprovacoes, coordTurmas } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, X, CheckCircle, ClipboardList,
  Eye, XCircle, GraduationCap, MapPin, Play,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const info = coordCursoInfo;
  const pendentes = coordAprovacoes.filter(a => a.status === "pendente");
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

  // Turmas em risco: presença < 80% OR média < 12 OR taxaEntrega < 85%
  const turmasEmRisco = coordTurmas.filter(
    t => t.presenca < 80 || t.media < 12 || t.taxaEntrega < 85
  );

  const stats = [
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Cadeiras Activas", value: info.disciplinasActivas, color: "text-primary bg-primary/10" },
    { icon: Clock, label: "Aprovações Pendentes", value: info.aprovacoesPendentes, color: "text-secondary bg-secondary/10" },
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
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
              </h2>
              <Link to="/coordenador/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver calendário <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {todayAgenda.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground text-center">Sem eventos hoje 🎉</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayAgenda.map(evento => {
                  const status = getEventStatus(evento);
                  const cfg = statusConfig[status];
                  const StatusIcon = cfg.icon;
                  return (
                    <Card key={evento.id} className="p-4 flex items-center gap-4">
                      <div className="w-1.5 h-12 rounded-full shrink-0" style={{ background: evento.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{evento.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{evento.startTime} - {evento.endTime}</span>
                          {evento.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{evento.room}</span>}
                        </div>
                      </div>
                      <Badge variant={status === "em_curso" ? "default" : "outline"} className="text-[10px] gap-1 shrink-0">
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aprovações Pendentes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" /> Aprovações Pendentes
                <Badge variant="outline" className="text-[10px] ml-1">{pendentes.length}</Badge>
              </h2>
              <Link to="/coordenador/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendentes.slice(0, 3).map(ap => {
                const Icon = typeIcons[ap.type] || FileText;
                return (
                  <Card key={ap.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{ap.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ap.requester} • {ap.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Link to="/coordenador/aprovacoes" className="flex-1">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 w-full">
                          <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                        </Button>
                      </Link>
                      <Button size="sm" className="text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground h-8 px-3">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3">
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Anúncios — same as student/professor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              </h2>
              <Link to="/coordenador/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map(an => {
                const style = typeStyles[an.type] || typeStyles.geral;
                return (
                  <Card key={an.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                      <span className="text-[11px] text-muted-foreground ml-auto">{an.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{an.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{an.content}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">— {an.author}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Turmas em Risco — card style like Os Meus Anos */}
          <div>
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
              <Card className="p-4">
                <p className="text-sm text-muted-foreground text-center">Nenhuma turma em risco 🎉</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {(showAllRisk ? turmasEmRisco : turmasEmRisco.slice(0, 3)).map(t => (
                  <Link key={t.id} to={`/coordenador/anos/${t.year}/turma/${t.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-[3px] border-l-destructive">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground">{t.year}º Ano • {info.name}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>

                      {/* Metrics — vertical list like turma cards in Anos */}
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Presença
                          </span>
                          <span className={`font-semibold ${t.presenca >= 80 ? "text-accent" : "text-destructive"}`}>{t.presenca}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5" /> Taxa de Entrega
                          </span>
                          <span className={`font-semibold ${t.taxaEntrega >= 85 ? "text-accent" : "text-destructive"}`}>{t.taxaEntrega}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" /> Média Geral
                          </span>
                          <span className={`font-semibold ${t.media >= 12 ? "text-accent" : "text-destructive"}`}>{t.media}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
