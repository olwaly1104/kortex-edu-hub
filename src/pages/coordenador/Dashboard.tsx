import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordSolicitacoes, coordTurmas, coordDocentes, coordEstudantes } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, X, CheckCircle, ClipboardList,
  Eye, XCircle, GraduationCap, MapPin, Play,
  ArrowDownLeft, UserX, ClipboardCheck, BarChart3,
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

const typeLabels: Record<string, string> = {
  nota: "Nota",
  plano: "Plano",
  horário: "Horário",
  transferência: "Transferência",
  recurso: "Recurso",
  material: "Material",
  reunião: "Reunião",
};

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  média: "bg-secondary/10 text-secondary",
  baixa: "bg-muted text-muted-foreground",
};

export default function CoordenadorCursoDashboard() {
  const { user } = useAuth();
  const info = coordCursoInfo;
  const pendentes = coordSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

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

        {/* Solicitações — 3 items, clean */}
        <Card className="p-5 lg:col-span-2">
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
            <div className="space-y-2.5">
              {pendentes.slice(0, 3).map(sol => {
                const Icon = typeIcons[sol.type] || FileText;
                return (
                  <div key={sol.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                    {/* Header: icon + title + priority */}
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

                    {/* Description — 1 line only */}
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{sol.description}</p>

                    {/* Requester + Date row */}
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

                    {/* Actions: Rejeitar left — Ver detalhes center — Aprovar right */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-6 px-2 rounded-md text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                        <XCircle className="w-3 h-3" /> Rejeitar
                      </Button>
                      <Link to="/coordenador/solicitacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
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
