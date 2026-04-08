import { useAuth } from "@/contexts/AuthContext";
import { decanoFaculty, decanoAprovacoes, decanoTurmas, decanoCoordenadores } from "@/data/institutionData";
import { announcements, coordAgendaEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, CheckCircle, GraduationCap, MapPin, Play,
  ArrowDownLeft, UserX, ClipboardCheck, BarChart3,
  Eye, XCircle, UserCog, Building2, Layers,
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

export default function DecanoDashboard() {
  const { user } = useAuth();
  const fac = decanoFaculty;
  const pendentes = decanoAprovacoes.filter(a => a.status === "pendente");

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
  const coordsEmRisco = decanoCoordenadores.filter(c => c.presenca < 85 || c.taxaEntrega < 80 || c.mediaGeral < 11);
  const cursosEmRisco = decanoFaculty.courses.filter(c => c.mediaGeral < 12 || c.taxaSucesso < 75);
  const turmasEmRisco = decanoTurmas.filter(t => t.presenca < 80 || t.media < 12 || t.taxaEntrega < 85);

  // Anos em risco: aggregate turmas by courseId+year
  const anosMap = new Map<string, { courseId: string; courseName: string; year: number; media: number; presenca: number; taxaEntrega: number; turmas: number }>();
  decanoTurmas.forEach(t => {
    const key = `${t.courseId}-${t.year}`;
    const existing = anosMap.get(key);
    if (!existing) {
      anosMap.set(key, { courseId: t.courseId, courseName: t.courseName, year: t.year, media: t.media, presenca: t.presenca, taxaEntrega: t.taxaEntrega, turmas: 1 });
    } else {
      existing.media = +((existing.media * existing.turmas + t.media) / (existing.turmas + 1)).toFixed(1);
      existing.presenca = Math.round((existing.presenca * existing.turmas + t.presenca) / (existing.turmas + 1));
      existing.taxaEntrega = Math.round((existing.taxaEntrega * existing.turmas + t.taxaEntrega) / (existing.turmas + 1));
      existing.turmas++;
    }
  });
  const anosEmRisco = [...anosMap.values()].filter(a => a.presenca < 80 || a.media < 12 || a.taxaEntrega < 85);

  const stats = [
    { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Total Cursos", value: fac.totalCursos, color: "text-primary bg-primary/10" },
    { icon: GraduationCap, label: "Total Docentes", value: fac.totalDocentes, color: "text-primary bg-primary/10" },
    { icon: Award, label: "Média Geral", value: "13.2", color: "text-accent bg-accent/10" },
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
              Decano — {fac.name}
            </p>
          </div>
          <Link to="/decano/faculdades" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Cursos <ChevronRight className="w-4 h-4" />
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
            <Link to="/decano/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
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
            <Link to="/decano/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
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
              {/* Coordenadores */}
              <div className="pr-3 border-r border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <UserCog className="w-3 h-3" /> Coord.
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{coordsEmRisco.length}</Badge>
                  </h3>
                  <Link to="/decano/coordenadores" className="text-[10px] text-primary hover:underline">Ver todos</Link>
                </div>
                <div className="space-y-1.5">
                  {coordsEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhum ✓</p>
                  ) : coordsEmRisco.slice(0, 3).map(c => (
                    <Link key={c.id} to={`/decano/coordenadores/${c.id}`} className="block">
                      <div className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                          <span className={c.presenca < 85 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.presenca}%</span>
                          <span className={c.mediaGeral < 11 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.mediaGeral}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Cursos */}
              <div className="px-3 border-r border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Cursos
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{cursosEmRisco.length}</Badge>
                  </h3>
                  <Link to="/decano/faculdades" className="text-[10px] text-primary hover:underline">Ver todos</Link>
                </div>
                <div className="space-y-1.5">
                  {cursosEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhum ✓</p>
                  ) : cursosEmRisco.slice(0, 3).map(c => (
                    <Link key={c.id} to={`/decano/cursos/${c.id}`} className="block">
                      <div className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                          <span className={c.mediaGeral < 12 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.mediaGeral}</span>
                          <span className={c.taxaSucesso < 75 ? "text-destructive font-medium" : "text-muted-foreground"}>{c.taxaSucesso}%</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Anos */}
              <div className="pl-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Anos
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{anosEmRisco.length}</Badge>
                  </h3>
                  <Link to="/decano/faculdades" className="text-[10px] text-primary hover:underline">Ver todos</Link>
                </div>
                <div className="space-y-1.5">
                  {anosEmRisco.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-3">Nenhum ✓</p>
                  ) : anosEmRisco.slice(0, 3).map(a => (
                    <Link key={`${a.courseId}-${a.year}`} to={`/decano/cursos/${a.courseId}`} className="block">
                      <div className="px-2.5 py-1.5 rounded-md border border-border bg-card border-l-2 border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer">
                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{a.year}º Ano — {a.courseName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                          <span className={a.presenca < 80 ? "text-destructive font-medium" : "text-muted-foreground"}>{a.presenca}%</span>
                          <span className={a.media < 12 ? "text-destructive font-medium" : "text-muted-foreground"}>{a.media}</span>
                        </div>
                      </div>
                    </Link>
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
            <div className="grid grid-cols-2 gap-2 flex-1 content-start">
              {[
                { label: "Coordenadores", icon: UserCog, path: "/decano/coordenadores", color: "bg-primary/10 text-primary" },
                { label: "Cursos", icon: Building2, path: "/decano/faculdades", color: "bg-accent/10 text-accent" },
                { label: "Estudantes", icon: Users, path: "/decano/estudantes", color: "bg-secondary/10 text-secondary" },
                { label: "Docentes", icon: GraduationCap, path: "/decano/docentes", color: "bg-primary/10 text-primary" },
                { label: "Notas", icon: Award, path: "/decano/notas", color: "bg-accent/10 text-accent" },
                { label: "Relatórios", icon: BarChart3, path: "/decano/relatorios", color: "bg-secondary/10 text-secondary" },
              ].map(action => (
                <Link key={action.path} to={action.path}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                      <action.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-medium text-foreground">{action.label}</p>
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
            <Link to="/decano/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                      <Link to="/decano/aprovacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
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
