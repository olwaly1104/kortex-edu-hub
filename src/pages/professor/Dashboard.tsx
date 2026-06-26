import { useAuth } from "@/contexts/AuthContext";
import { profDisciplines, profLessons, profStudents, profTasks, profTodayClasses, allTurmas } from "@/data/professorData";
const announcements: any[] = [];
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Users, Video, Calendar, ChevronRight,
  Clock, MapPin, Play, AlertTriangle, CheckCircle,
  Eye, Megaphone, GraduationCap, UserCheck,
  UserX, ClipboardCheck, BarChart3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalStudents = allTurmas.reduce((s, t) => s + t.students, 0);
  const atRiskStudents = profStudents.filter(s => s.status === "risco");

  // Calculate overall attendance for professor
  const allStudentsUnique = profStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
  const overallAttendance = allStudentsUnique.length > 0
    ? Math.round(allStudentsUnique.reduce((s, st) => s + st.attendance, 0) / allStudentsUnique.length)
    : 0;

  // Attendance breakdown mock
  const totalAulas = 48;
  const presencas = Math.round(totalAulas * overallAttendance / 100);
  const faltasJustificadas = 4;
  const faltasNaoJustificadas = totalAulas - presencas - faltasJustificadas;

  const stats = [
    { icon: Users, label: "Estudantes", value: totalStudents, color: "text-accent bg-accent/10" },
    { icon: GraduationCap, label: "Turmas", value: allTurmas.length, color: "text-primary bg-primary/10" },
    { icon: BookOpen, label: "Cadeiras", value: profDisciplines.length, color: "text-secondary bg-secondary/10" },
    { icon: UserCheck, label: "Minha Presença", value: `${overallAttendance}%`, color: "text-accent bg-accent/10" },
  ];

  const statusConfig = {
    concluída: { label: "Rever", color: "bg-accent/10 text-accent", icon: CheckCircle, action: "rever" },
    em_curso: { label: "Ver Aula", color: "bg-secondary/10 text-secondary", icon: Play, action: "ver" },
    agendada: { label: "Ver Aula", color: "bg-muted text-muted-foreground", icon: Clock, action: "ver" },
  };

  const recentRecorded = [...profLessons]
    .filter(l => l.status === "publicada")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bom dia, {user?.name?.split(" ").pop()} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Painel do Professor — Universidade Privada de Angola</p>
        </div>
        <Link to="/professor/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground hidden sm:inline">Meu Perfil</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {s.label === "Minha Presença" && (
                <p className="text-[10px] text-muted-foreground mt-0.5">Este mês · {presencas}P {faltasJustificadas}J {faltasNaoJustificadas}F</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's classes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Aulas de Hoje
              </h2>
              <Link to="/professor/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver calendário <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {profTodayClasses.map((aula, i) => {
                const disc = profDisciplines.find(d => d.id === aula.disciplineId);
                const cfg = statusConfig[aula.status];
                const StatusIcon = cfg.icon;
                const isActive = aula.status === "em_curso";
                return (
                  <div key={i} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="text-center shrink-0 w-14">
                      <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{aula.time.split(" – ")[0]}</p>
                      <p className="text-[10px] text-muted-foreground">{aula.time.split(" – ")[1]}</p>
                    </div>
                    <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: disc?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{aula.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{aula.room}</span>
                        <span>{aula.turma}</span>
                      </div>
                    </div>
                    <Badge variant={isActive ? "default" : "outline"} className="text-[10px] gap-1 shrink-0">
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant={aula.status === "concluída" ? "outline" : "default"}
                      className="gap-1.5 text-xs h-7 px-2"
                      onClick={() => navigate(`/professor/disciplines/${aula.disciplineId}`)}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label === "Rever" ? "Rever" : "Ver"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
          </div>

          {/* Recent recorded lessons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-secondary" /> Aulas Recentes
              </h2>
              <Link to="/professor/lessons" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentRecorded.map(lesson => {
                const disc = profDisciplines.find(d => d.id === lesson.disciplineId);
                const turma = allTurmas.find(t => t.id === lesson.turmaId);
                return (
                  <Card key={lesson.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="h-28 bg-muted/40 flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-background/80 text-foreground text-[10px] gap-1">
                          <Eye className="w-3 h-3" /> {lesson.views}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: disc?.color }} />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                        <span style={{ color: disc?.color }}>{disc?.code}</span>
                        <span>•</span>
                        <span>{turma?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                        <span>{lesson.date}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lesson.attendance}/{lesson.totalStudents}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Alertas em Risco — 2 columns: Turmas | Estudantes */}
          {(atRiskStudents.length > 0 || allTurmas.some(t => {
            const ts = profStudents.filter(s => s.turmaId === t.id);
            const unique = ts.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
            const avg = unique.length > 0 && unique.some(s => s.avgGrade !== null)
              ? Math.round(unique.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / unique.filter(s => s.avgGrade !== null).length * 10) / 10
              : null;
            const att = unique.length > 0 ? Math.round(unique.reduce((s, st) => s + st.attendance, 0) / unique.length) : 0;
            return att < 80 || (avg !== null && avg < 12);
          })) && (() => {
            const turmasEmRisco = allTurmas.filter(t => {
              const ts = profStudents.filter(s => s.turmaId === t.id);
              const unique = ts.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
              const avg = unique.length > 0 && unique.some(s => s.avgGrade !== null)
                ? Math.round(unique.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / unique.filter(s => s.avgGrade !== null).length * 10) / 10
                : null;
              const att = unique.length > 0 ? Math.round(unique.reduce((s, st) => s + st.attendance, 0) / unique.length) : 0;
              return att < 80 || (avg !== null && avg < 12);
            }).map(t => {
              const ts = profStudents.filter(s => s.turmaId === t.id);
              const unique = ts.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
              const avg = unique.length > 0 && unique.some(s => s.avgGrade !== null)
                ? Math.round(unique.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / unique.filter(s => s.avgGrade !== null).length * 10) / 10
                : null;
              const att = unique.length > 0 ? Math.round(unique.reduce((s, st) => s + st.attendance, 0) / unique.length) : 0;
              const entrega = unique.length > 0 ? Math.round(unique.reduce((s, st) => s + (st.submittedTasks / Math.max(st.totalTasks, 1) * 100), 0) / unique.length) : 0;
              return { ...t, avg, att, entrega };
            });

            return (
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h2 className="text-base font-semibold text-foreground">Alertas em Risco</h2>
                </div>
                <div className="grid grid-cols-2 gap-0 flex-1">
                  {/* Turmas em Risco */}
                  <div className="pr-3 border-r border-border flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" /> Turmas
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{turmasEmRisco.length}</Badge>
                      </h3>
                      <Link to="/professor/disciplines" className="text-[10px] text-primary hover:underline">
                        Ver todos
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {turmasEmRisco.slice(0, 5).map(t => {
                        const disc = profDisciplines.find(d => d.turmas.some(tr => tr.id === t.id));
                        return (
                          <Link key={t.id} to={`/professor/disciplines?turma=${t.id}`} className="block">
                            <div className="px-2.5 py-1.5 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer w-full flex flex-col justify-center">
                              <p className="text-[11px] font-semibold text-foreground leading-tight">{t.name}</p>
                              <p className="text-[9px] text-muted-foreground">{t.year}º Ano · {t.course}</p>
                              <div className="flex items-center justify-between mt-1 text-[9px]">
                                <span className={`flex items-center gap-0.5 ${t.att < 80 ? "text-destructive font-medium" : "text-muted-foreground"}`}><Clock className="w-2.5 h-2.5" />{t.att}%</span>
                                <span className={`flex items-center gap-0.5 ${t.entrega < 80 ? "text-destructive font-medium" : "text-muted-foreground"}`}><ClipboardCheck className="w-2.5 h-2.5" />{t.entrega}%</span>
                                <span className={`flex items-center gap-0.5 ${t.avg !== null && t.avg < 12 ? "text-destructive font-medium" : "text-muted-foreground"}`}><BarChart3 className="w-2.5 h-2.5" />{t.avg ?? "—"}/20</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estudantes em Risco */}
                  <div className="pl-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Estudantes
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{atRiskStudents.length}</Badge>
                      </h3>
                      <Link to="/professor/students?status=risco" className="text-[10px] text-primary hover:underline">
                        Ver todos
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {atRiskStudents.slice(0, 5).map(e => (
                        <Link key={e.id} to={`/professor/students/${e.id}`} className="block">
                          <div className="px-2.5 py-1.5 rounded-lg border border-border bg-card border-l-[3px] border-l-destructive hover:bg-muted/40 transition-colors cursor-pointer w-full flex flex-col justify-center">
                            <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{e.name}</p>
                            <p className="text-[9px] text-muted-foreground">{e.turma}</p>
                            <div className="flex items-center justify-between mt-1 text-[9px]">
                              <span className="flex items-center gap-0.5 text-destructive font-medium"><BarChart3 className="w-2.5 h-2.5" />{e.avgGrade !== null ? `${e.avgGrade}/20` : "—"}</span>
                              <span className={`flex items-center gap-0.5 ${e.attendance < 70 ? "text-destructive font-medium" : "text-muted-foreground"}`}><Clock className="w-2.5 h-2.5" />{e.attendance}%</span>
                              <span className={`flex items-center gap-0.5 ${(e.submittedTasks / Math.max(e.totalTasks, 1) * 100) < 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}><ClipboardCheck className="w-2.5 h-2.5" />{Math.round(e.submittedTasks / Math.max(e.totalTasks, 1) * 100)}%</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>

        <div className="space-y-6">
          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              </h2>
              <Link to="/professor/announcements" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentAnnouncements.map(ann => {
                const style = typeStyles[ann.type] || typeStyles.geral;
                return (
                  <Card key={ann.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                      <span className="text-[11px] text-muted-foreground ml-auto">{ann.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{ann.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* My Turmas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> As Minhas Turmas
              </h2>
              <Link to="/professor/disciplines" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {allTurmas.map(turma => {
                const turmaStudents = profStudents.filter(s => s.turmaId === turma.id);
                const unique = turmaStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
                const avg = unique.length > 0 && unique.some(s => s.avgGrade !== null)
                  ? Math.round(unique.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / unique.filter(s => s.avgGrade !== null).length * 10) / 10
                  : null;
                const attendance = unique.length > 0
                  ? Math.round(unique.reduce((s, st) => s + st.attendance, 0) / unique.length)
                  : 0;
                const graded = unique.filter(s => s.avgGrade !== null);
                const approved = graded.filter(s => (s.avgGrade || 0) >= 10).length;
                const taxaAprovacao = graded.length > 0 ? Math.round((approved / graded.length) * 100) : null;

                const estado = taxaAprovacao !== null && taxaAprovacao >= 85 ? "excelente" : (taxaAprovacao !== null && taxaAprovacao < 60) || attendance < 75 ? "risco" : "normal";
                const estadoStyle = estado === "excelente" ? "bg-accent/10 text-accent border-accent/30" : estado === "risco" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30";

                return (
                  <Link key={turma.id} to={`/professor/disciplines?turma=${turma.id}`}>
                    <Card className="px-4 py-3 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{turma.name}</p>
                            <Badge variant="outline" className={`text-[9px] ${estadoStyle}`}>
                              {estado === "excelente" ? "Excelente" : estado === "risco" ? "Em Risco" : "Normal"}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{turma.course} · {turma.year}º Ano · {turma.students} estudantes</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] shrink-0">
                          <div className="text-center">
                            <p className={`font-bold ${attendance >= 75 ? "text-accent" : "text-destructive"}`}>{attendance}%</p>
                            <p className="text-[9px] text-muted-foreground">Presença</p>
                          </div>
                          <div className="text-center">
                            <p className={`font-bold ${avg !== null && avg >= 10 ? "text-accent" : avg !== null ? "text-destructive" : "text-muted-foreground"}`}>{avg ?? "—"}</p>
                            <p className="text-[9px] text-muted-foreground">Média</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}