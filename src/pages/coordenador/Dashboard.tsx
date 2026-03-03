import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordSolicitacoes, coordTurmas, coordDocentes } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, X, CheckCircle, ClipboardList,
  Eye, XCircle, GraduationCap, MapPin, Play,
  ArrowDownLeft,
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

  const docentesEmRisco = coordDocentes.filter(d => d.presenca < 85 || d.taxaEntrega < 80 || d.mediaGeral < 11);

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

      {/* Row 1: Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
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
      </div>

      {/* Row 2: Alertas em Risco + Solicitações */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">Alertas em Risco</h2>
          </div>

          <div className="grid grid-cols-2 gap-0">
            {/* Docentes em Risco */}
            <div className="pr-4 border-r border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Docentes
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{docentesEmRisco.length}</Badge>
                </h3>
                <Link to="/coordenador/docentes" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {docentesEmRisco.length > 0 ? (
                <div className="space-y-1.5">
                  {docentesEmRisco.map(d => (
                    <Link key={d.id} to="/coordenador/docentes">
                      <div className="px-2.5 py-2 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <p className="text-[11px] font-semibold text-foreground leading-tight">{d.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className={d.presenca < 85 ? "text-destructive font-medium" : "text-muted-foreground"}>{d.presenca}%</span>
                          <span className={d.taxaEntrega < 80 ? "text-destructive font-medium" : "text-muted-foreground"}>{d.taxaEntrega}%</span>
                          <span className={d.mediaGeral < 11 ? "text-destructive font-medium" : "text-muted-foreground"}>{d.mediaGeral}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum docente em risco 🎉</p>
              )}
            </div>

            {/* Turmas em Risco */}
            <div className="pl-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Turmas
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{turmasEmRisco.length}</Badge>
                </h3>
                {!showAllRisk && turmasEmRisco.length > 3 && (
                  <button onClick={() => setShowAllRisk(true)} className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {showAllRisk && (
                  <button onClick={() => setShowAllRisk(false)} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                    <X className="w-3 h-3" /> Fechar
                  </button>
                )}
              </div>
              {turmasEmRisco.length > 0 ? (
                <div className="space-y-1.5">
                  {(showAllRisk ? turmasEmRisco : turmasEmRisco.slice(0, 3)).map(t => (
                    <Link key={t.id} to={`/coordenador/anos/${t.year}/turma/${t.id}`}>
                      <div className="px-2.5 py-2 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-foreground leading-tight">{t.name}</p>
                          <span className="text-[10px] text-muted-foreground">{t.year}º Ano</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className={t.presenca >= 80 ? "text-muted-foreground" : "text-destructive font-medium"}>{t.presenca}%</span>
                          <span className={t.taxaEntrega >= 85 ? "text-muted-foreground" : "text-destructive font-medium"}>{t.taxaEntrega}%</span>
                          <span className={t.media >= 12 ? "text-muted-foreground" : "text-destructive font-medium"}>{t.media}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma turma em risco 🎉</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-secondary" /> Solicitações
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
                  <div key={sol.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/60 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1 leading-tight">{sol.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{sol.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{sol.requester} • {sol.date}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <Button size="sm" className="h-6 w-6 p-0 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                        <XCircle className="w-3 h-3" />
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
