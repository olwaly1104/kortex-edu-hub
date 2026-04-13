import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordTurmas, coordDocentes, coordEstudantes, coordSolicitacoes } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, CheckCircle,
  GraduationCap, MapPin, Play,
  UserX, ClipboardCheck, BarChart3,
  CheckSquare, XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function CoordenadorCursoDashboard() {
  const { user } = useAuth();
  const info = coordCursoInfo;


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

  const estudantesEmRisco = coordEstudantes
    .filter(e => e.status === "risco")
    .sort((a, b) => (a.media ?? 0) - (b.media ?? 0));

  const stats = [
    { icon: ClipboardCheck, label: "Minha Presença", value: "96%", color: "text-primary bg-primary/10" },
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BarChart3, label: "Presença Geral", value: "89%", color: "text-secondary bg-secondary/10" },
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
          <Link to="/coordenador/curso" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Detalhes <ChevronRight className="w-4 h-4" />
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
            <Link to="/coordenador/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
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

      {/* Row 2: Alertas em Risco (wider) + Solicitações */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Alertas em Risco — 3 columns: Docentes | Turmas | Estudantes */}
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">Alertas em Risco</h2>
          </div>

          <div className="grid grid-cols-3 gap-0 flex-1">
            {/* Docentes em Risco */}
            <div className="pr-3 border-r border-border flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Docentes
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{docentesEmRisco.length}</Badge>
                </h3>
                <Link to="/coordenador/docentes" className="text-[10px] text-primary hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {docentesEmRisco.slice(0, 5).map(d => (
                  <Link key={d.id} to="/coordenador/docentes" className="flex-1 flex">
                    <div className="px-2.5 py-1.5 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer w-full flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{d.name.replace("Prof. ", "")}</p>
                      <div className="flex items-center justify-between mt-1 text-[9px]">
                        <span className={`flex items-center gap-0.5 ${d.presenca < 85 ? "text-destructive font-medium" : "text-muted-foreground"}`}><Clock className="w-2.5 h-2.5" />{d.presenca}%</span>
                        <span className={`flex items-center gap-0.5 ${d.taxaEntrega < 80 ? "text-destructive font-medium" : "text-muted-foreground"}`}><ClipboardCheck className="w-2.5 h-2.5" />{d.taxaEntrega}%</span>
                        <span className={`flex items-center gap-0.5 ${d.mediaGeral < 11 ? "text-destructive font-medium" : "text-muted-foreground"}`}><BarChart3 className="w-2.5 h-2.5" />{d.mediaGeral}/20</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Turmas em Risco */}
            <div className="px-3 border-r border-border flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> Turmas
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{turmasEmRisco.length}</Badge>
                </h3>
                <Link to="/coordenador/anos" className="text-[10px] text-primary hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="space-y-1.5">
                {turmasEmRisco.slice(0, 5).map(t => (
                  <Link key={t.id} to={`/coordenador/anos/${t.year}/turma/${t.id}`} className="block">
                    <div className="px-2.5 py-1.5 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer w-full flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{t.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{t.year}º Ano • {t.director}</p>
                      <div className="flex items-center justify-between mt-1 text-[9px]">
                        <span className={`flex items-center gap-0.5 ${t.presenca < 80 ? "text-destructive font-medium" : "text-muted-foreground"}`}><Clock className="w-2.5 h-2.5" />{t.presenca}%</span>
                        <span className={`flex items-center gap-0.5 ${t.taxaEntrega < 85 ? "text-destructive font-medium" : "text-muted-foreground"}`}><ClipboardCheck className="w-2.5 h-2.5" />{t.taxaEntrega}%</span>
                        <span className={`flex items-center gap-0.5 ${t.media < 12 ? "text-destructive font-medium" : "text-muted-foreground"}`}><BarChart3 className="w-2.5 h-2.5" />{t.media}/20</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Estudantes em Risco */}
            <div className="pl-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <UserX className="w-3 h-3" /> Estudantes
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{estudantesEmRisco.length}</Badge>
                </h3>
                <Link to="/coordenador/estudantes" className="text-[10px] text-primary hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {estudantesEmRisco.slice(0, 5).map(e => (
                  <Link key={e.id} to="/coordenador/estudantes" className="flex-1 flex">
                    <div className="px-2.5 py-1.5 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer w-full flex flex-col justify-center">
                      <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{e.name}</p>
                      <p className="text-[9px] text-muted-foreground">{e.year}º Ano • Turma {e.turma}</p>
                      <div className="flex items-center justify-between mt-1 text-[9px]">
                        <span className="flex items-center gap-0.5 text-destructive font-medium"><BarChart3 className="w-2.5 h-2.5" />{e.media !== null && e.media !== undefined ? `${e.media}/20` : "—"}</span>
                        <span className={`flex items-center gap-0.5 ${e.presenca < 70 ? "text-destructive font-medium" : "text-muted-foreground"}`}><Clock className="w-2.5 h-2.5" />{e.presenca}%</span>
                        <span className={`flex items-center gap-0.5 ${e.taxaEntrega < 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}><ClipboardCheck className="w-2.5 h-2.5" />{e.taxaEntrega}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Solicitações */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> Solicitações
            </h2>
            <Link to="/coordenador/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {(() => {
            const pendentes = coordSolicitacoes.filter(s => s.status === "pendente");
            const recentes = coordSolicitacoes.slice(0, 5);
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold">{pendentes.length}</span>
                    <span className="text-xs">Pendentes</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">{coordSolicitacoes.filter(s => s.status === "aprovado").length}</span>
                    <span className="text-xs">Aprovadas</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600">
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">{coordSolicitacoes.filter(s => s.status === "rejeitado").length}</span>
                    <span className="text-xs">Rejeitadas</span>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {recentes.map(sol => {
                    const statusCls = sol.status === "pendente" ? "bg-amber-100 text-amber-700" : sol.status === "aprovado" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600";
                    return (
                      <div key={sol.id} className="flex items-center gap-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{sol.title}</p>
                          <p className="text-[11px] text-muted-foreground">{sol.requester} • {sol.date}</p>
                        </div>
                        <Badge className={`${statusCls} text-[10px] shrink-0`}>
                          {sol.status === "pendente" ? "Pendente" : sol.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}
