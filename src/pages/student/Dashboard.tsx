import { useAuth } from "@/contexts/AuthContext";
import { disciplines, announcements, lessons, calendarEvents, grades } from "@/data/mockData";
import { payments } from "@/data/financeData";
import { BookOpen, Wallet, Calendar, Bell, ChevronRight, Clock, MapPin, Play, BarChart3, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayEvents = calendarEvents.filter(e => e.type === "aula").slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);
  const continueLessons = lessons.filter(l => l.progress > 0).slice(0, 3);

  // Overall average
  const allPublished = grades.flatMap(g => g.evaluations.filter(e => e.published && e.grade !== null));
  const overallAvg = allPublished.length > 0
    ? Math.round(allPublished.reduce((s, e) => s + (e.grade || 0), 0) / allPublished.length * 10) / 10
    : null;

  // General attendance
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

  const quickSuggestions = [
    { label: "Perguntar à área financeira sobre pagamentos", to: "/student/chat" },
    { label: "Ver notas do último exame de Matemática", to: "/student/grades" },
    { label: "Consultar horário de atendimento do professor", to: "/student/contacts" },
    { label: "Verificar prazos de entrega pendentes", to: "/student/tasks" },
    { label: "Consultar livros disponíveis na biblioteca", to: "/student/library" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bom dia, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.course} — {user?.year}º Ano — Turma 24B
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Universidade Privada de Angola</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: "Presença Geral", value: `${generalPct}%`, color: generalPct >= 75 ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10" },
          { icon: BarChart3, label: "Média Geral", value: overallAvg !== null ? overallAvg : "—", color: overallAvg !== null && overallAvg >= 10 ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10", suffix: overallAvg !== null ? "/20" : "" },
          { icon: BookOpen, label: "Cadeiras", value: disciplines.length, color: "text-primary bg-primary/10" },
          { icon: Wallet, label: "Situação Financeira", value: payments.some(p => p.status === 'overdue') ? "Em dívida" : payments.some(p => p.status === 'pending') ? "Pendente" : "Em dia", color: payments.some(p => p.status === 'overdue') ? "text-destructive bg-destructive/10" : payments.some(p => p.status === 'pending') ? "text-yellow-600 bg-yellow-500/10" : "text-accent bg-accent/10", link: "/student/finances" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <p className={`font-bold text-foreground ${typeof stat.value === 'string' && stat.value.length > 10 ? 'text-xs' : 'text-2xl'}`}>{stat.value}</p>
                {"suffix" in stat && stat.suffix && <span className="text-sm text-muted-foreground font-medium">{stat.suffix}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Horário de Hoje
            </h2>
            <Link to="/student/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver calendário <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayEvents.map((event, idx) => {
              const disc = disciplines.find(d => d.name === event.discipline);
              const isPast = idx < todayEvents.length - 1;
              const matchingLesson = disc ? lessons.find(l => l.disciplineId === disc.id) : null;
              return (
                <Card key={event.id} className="p-4 flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full shrink-0" style={{ background: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.startTime} - {event.endTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.room}</span>
                      <span>{event.professor}</span>
                    </div>
                  </div>
                  {isPast && matchingLesson ? (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => navigate(`/student/disciplines/${disc!.id}/lessons/${matchingLesson.id}`)}>
                      <Play className="w-3.5 h-3.5" /> Rever
                    </Button>
                  ) : matchingLesson ? (
                    <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => navigate(`/student/disciplines/${disc!.id}/lessons/${matchingLesson.id}`)}>
                      <Play className="w-3.5 h-3.5" /> Ver Aula
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" disabled>
                      <Clock className="w-3.5 h-3.5" /> Em breve
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Continue watching - 3 videos */}
          {continueLessons.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mt-6">
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

          {/* Ações Rápidas - phrase suggestions */}
          <h2 className="text-lg font-semibold text-foreground mt-6">Ações Rápidas</h2>
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

          {/* Attendance - General first, then all disciplines */}
          <h2 className="text-lg font-semibold text-foreground mt-6">Presenças</h2>
          
          {/* General attendance card */}
          <Card className="p-4 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Presença Geral</p>
              <span className={`text-lg font-bold ${generalPct >= 75 ? "text-accent" : "text-destructive"}`}>{generalPct}%</span>
            </div>
            <Progress value={generalPct} className="h-2" />
            <p className="text-[11px] text-muted-foreground mt-1.5">{totalPresent}P / {totalAbsent}F / {totalJustified}J</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Engenharia Informática — 2º Ano</p>
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
