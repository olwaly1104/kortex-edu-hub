import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { disciplines, announcements, lessons, calendarEvents, grades } from "@/data/mockData";
import { payments } from "@/data/financeData";
import { BookOpen, Wallet, Calendar, Bell, ChevronRight, Clock, MapPin, Play, BarChart3, ArrowRight, CheckCircle, Building2, GraduationCap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayEvents = calendarEvents.filter(e => e.type === "aula" && e.date === "2024-02-14").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const recentAnnouncements = announcements.slice(0, 3);
  const continueLessons = lessons.filter(l => l.progress > 0 && l.progress < 100).slice(0, 3);

  const allPublished = grades.flatMap(g => g.evaluations.filter(e => e.published && e.grade !== null));
  const overallAvg = allPublished.length > 0
    ? Math.round(allPublished.reduce((s, e) => s + (e.grade || 0), 0) / allPublished.length * 10) / 10
    : null;

  const totalPresent = disciplines.reduce((s, d) => s + d.attendance.present, 0);
  const totalAbsent = disciplines.reduce((s, d) => s + d.attendance.absent, 0);
  const totalJustified = disciplines.reduce((s, d) => s + d.attendance.justified, 0);
  const totalAll = totalPresent + totalAbsent + totalJustified;
  const generalPct = Math.round((totalPresent / totalAll) * 100);

  const typeBadge: Record<string, string> = {
    urgente: "bg-destructive text-destructive-foreground",
    evento: "bg-secondary text-secondary-foreground",
    academico: "bg-primary text-primary-foreground",
    geral: "bg-muted text-muted-foreground",
  };

  const now = "10:45";
  const getEventStatus = (e: typeof calendarEvents[0]) => {
    if (e.endTime <= now) return "concluída";
    if (e.startTime <= now && e.endTime > now) return "em_curso";
    return "agendada";
  };
  const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    concluída: { label: "Concluída", icon: CheckCircle, cls: "bg-muted text-muted-foreground" },
    em_curso: { label: "A Decorrer", icon: Play, cls: "bg-accent/15 text-accent border-accent/30" },
    agendada: { label: "Agendada", icon: Clock, cls: "bg-muted text-muted-foreground" },
  };

  const quickSuggestions = [
    { label: "Perguntar à área financeira sobre pagamentos", to: "/student/chat" },
    { label: "Ver notas do último exame de Matemática", to: "/student/grades" },
    { label: "Consultar horário de atendimento do professor", to: "/student/contacts" },
    { label: "Verificar prazos de entrega pendentes", to: "/student/tasks" },
    { label: "Consultar livros disponíveis na biblioteca", to: "/student/library" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Professional Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-foreground">
            Bom dia, {user?.name?.split(" ")[0]} 👋
          </h1>
          <Link to="/student/profile" className="text-sm text-primary hover:underline flex items-center gap-1">
            Meu Perfil <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs font-medium px-2.5 py-1">
            <Building2 className="w-3 h-3" /> Universidade Privada de Angola
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs font-medium px-2.5 py-1">
            <GraduationCap className="w-3 h-3" /> Faculdade de Engenharia
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs font-medium px-2.5 py-1">
            <BookOpen className="w-3 h-3" /> {user?.course || "Engenharia Informática"}
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs font-medium px-2.5 py-1">
            <Calendar className="w-3 h-3" /> {user?.year || 2}º Ano
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs font-medium px-2.5 py-1">
            <Users className="w-3 h-3" /> Turma 24B
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${generalPct >= 75 ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10"}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{generalPct}%</p>
            <p className="text-xs text-muted-foreground">Presença Geral</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${overallAvg !== null && overallAvg >= 10 ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10"}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-foreground">{overallAvg !== null ? overallAvg : "—"}</p>
              {overallAvg !== null && <span className="text-sm text-muted-foreground font-medium">/20</span>}
            </div>
            <p className="text-xs text-muted-foreground">Média Geral</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-primary bg-primary/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{disciplines.length}</p>
            <p className="text-xs text-muted-foreground">Cadeiras</p>
          </div>
        </Card>

        {(() => {
          const hasOverdue = payments.some(p => p.status === 'overdue');
          const hasPending = payments.some(p => p.status === 'pending');
          const label = hasOverdue ? "Por regularizar" : hasPending ? "Pendente" : "Em dia";
          const dotColor = hasOverdue ? "bg-destructive" : hasPending ? "bg-yellow-500" : "bg-accent";
          const textColor = hasOverdue ? "text-destructive" : hasPending ? "text-yellow-600" : "text-accent";
          const iconBg = hasOverdue ? "text-destructive bg-destructive/10" : hasPending ? "text-yellow-600 bg-yellow-500/10" : "text-accent bg-accent/10";
          return (
            <Link to="/student/finances">
              <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Estado Financeiro</p>
                </div>
              </Card>
            </Link>
          );
        })()}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule - Reitor style */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Horário de Hoje
              </h2>
              <Link to="/student/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver calendário <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem aulas hoje 🎉</p>
            ) : (
              <div className="divide-y divide-border">
                {todayEvents.map(evento => {
                  const status = getEventStatus(evento);
                  const cfg = statusConfig[status];
                  const StatusIcon = cfg.icon;
                  const isActive = status === "em_curso";
                  const disc = disciplines.find(d => d.name === evento.discipline);
                  const matchingLesson = disc ? lessons.find(l => l.disciplineId === disc.id) : null;
                  return (
                    <div key={evento.id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                      <div className="text-center shrink-0 w-14">
                        <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{evento.startTime}</p>
                        <p className="text-[10px] text-muted-foreground">{evento.endTime}</p>
                      </div>
                      <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: evento.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{evento.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {evento.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{evento.room}
                            </span>
                          )}
                          {evento.professor && <span>{evento.professor}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[10px] gap-1 font-medium border-0 ${cfg.cls}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                        {status === "concluída" && matchingLesson ? (
                          <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] gap-1.5 font-medium" onClick={() => navigate(`/student/disciplines/${disc!.id}/lessons/${matchingLesson.id}`)}>
                            <Play className="w-3 h-3" /> Rever Aula
                          </Button>
                        ) : isActive && matchingLesson ? (
                          <Button size="sm" className="h-7 px-3 text-[10px] gap-1.5 font-medium bg-primary hover:bg-primary/90" onClick={() => navigate(`/student/disciplines/${disc!.id}/lessons/${matchingLesson.id}`)}>
                            <Play className="w-3 h-3" /> Entrar
                          </Button>
                        ) : status === "agendada" && matchingLesson ? (
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] gap-1.5 font-medium text-muted-foreground" onClick={() => navigate(`/student/disciplines/${disc!.id}/lessons/${matchingLesson.id}`)}>
                            <Clock className="w-3 h-3" /> Detalhes
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Continue watching */}
          {continueLessons.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mt-2">
                <Play className="w-5 h-5 text-secondary" /> Continuar a Assistir
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {continueLessons.map((lesson) => {
                  const disc = disciplines.find(d => d.id === lesson.disciplineId);
                  return (
                    <Link key={lesson.id} to={`/student/disciplines/${lesson.disciplineId}/lessons/${lesson.id}`}>
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-muted flex items-center justify-center relative">
                          <Play className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground">{disc?.name}</p>
                          <p className="text-sm font-medium text-foreground mt-0.5 truncate">Aula {lesson.number}: {lesson.title}</p>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Ações Rápidas */}
          <h2 className="text-lg font-semibold text-foreground mt-2">Ações Rápidas</h2>
          <div className="space-y-2">
            {quickSuggestions.map((s, i) => (
              <Link key={i} to={s.to}>
                <Card className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group">
                  <p className="text-sm text-foreground">{s.label}</p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Announcements */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" /> Anúncios
            </h2>
            <Link to="/student/announcements" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((ann) => (
              <Card key={ann.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={typeBadge[ann.type]}>{ann.type.charAt(0).toUpperCase() + ann.type.slice(1)}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{ann.date}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{ann.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
              </Card>
            ))}
          </div>

          {/* Attendance */}
          <h2 className="text-lg font-semibold text-foreground mt-6">Presenças</h2>
          <Card className="p-4 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Presença Geral</p>
              <span className={`text-lg font-bold ${generalPct >= 75 ? "text-accent" : "text-destructive"}`}>{generalPct}%</span>
            </div>
            <Progress value={generalPct} className="h-2" />
            <p className="text-[11px] text-muted-foreground mt-1.5">{totalPresent}P / {totalAbsent}F / {totalJustified}J</p>
          </Card>
          <div className="space-y-3">
            {disciplines.map((disc) => {
              const total = disc.attendance.present + disc.attendance.absent + disc.attendance.justified;
              const pct = Math.round((disc.attendance.present / total) * 100);
              return (
                <Card key={disc.id} className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{disc.name}</p>
                    <span className={`text-sm font-bold ${pct >= 75 ? "text-accent" : "text-destructive"}`}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{disc.attendance.present}P / {disc.attendance.absent}F / {disc.attendance.justified}J</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
