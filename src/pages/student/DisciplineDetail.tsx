import { useParams, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { disciplines, lessons, grades, calendarEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, User, Users, Clock, MapPin, Video, FileText, GraduationCap, ClipboardList, Play, Download, ChevronDown, ChevronRight, Eye, Calendar, CheckCircle, AlertCircle, TrendingUp, FolderOpen, Link2, ExternalLink, Mail } from "lucide-react";
import { useState } from "react";

export default function DisciplineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const disc = disciplines.find(d => d.id === id);
  const discLessons = lessons.filter(l => l.disciplineId === id);
  const discGrades = grades.find(g => g.disciplineId === id);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  if (!disc) return <div className="p-8 text-muted-foreground">Cadeira não encontrada.</div>;

  const total = disc.attendance.present + disc.attendance.absent + disc.attendance.justified;
  const attendancePct = Math.round((disc.attendance.present / total) * 100);
  const allTasks = discLessons.flatMap(l => l.tasks.map(t => ({ ...t, lessonNumber: l.number, lessonTitle: l.title })));

  const publishedEvals = discGrades?.evaluations.filter(e => e.published && e.grade !== null) || [];
  const totalEvals = discGrades?.evaluations.length || 0;
  const weightedSum = publishedEvals.reduce((sum, e) => sum + (e.grade! * e.weight), 0);
  const totalWeight = publishedEvals.reduce((sum, e) => sum + e.weight, 0);
  const avg = totalWeight > 0 ? weightedSum / totalWeight : null;

  const progressPct = Math.round((disc.progress.watched / disc.progress.total) * 100);

  // Get participants from all lessons of this discipline
  const allParticipants = new Set<string>();
  discLessons.forEach(l => l.participants.forEach(p => allParticipants.add(p)));
  const participantList = Array.from(allParticipants).filter(p => !p.startsWith("Prof.")).sort();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/student/disciplines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às cadeiras
      </Link>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${disc.color}12, ${disc.color}06)` }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.07]" style={{ background: disc.color, transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: disc.color, color: "white" }}>
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono" style={{ borderColor: disc.color + "40", color: disc.color }}>{disc.code}</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{disc.name}</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">{disc.summary}</p>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Professor</span>
          </div>
          <p className="font-semibold text-foreground text-sm">{disc.professor}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground truncate">{disc.professorEmail}</p>
          </div>
        </Card>

        <Card className="p-4 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Horário</span>
          </div>
          <p className="font-semibold text-foreground text-sm">{disc.schedule}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{disc.room}</span>
          </div>
        </Card>

        <Card className="p-4 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${attendancePct >= 75 ? "text-accent" : "text-destructive"}`}>{attendancePct}%</span>
          </div>
          <Progress value={attendancePct} className="h-1.5 mt-2" />
          <p className="text-[11px] text-muted-foreground mt-1.5">{disc.attendance.present}P / {disc.attendance.absent}F / {disc.attendance.justified}J</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="participants" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "participants", icon: Users, label: "Participantes" },
              { value: "lessons", icon: Video, label: "Gravações" },
              { value: "materials", icon: FileText, label: "Conteúdos" },
              { value: "tasks", icon: ClipboardList, label: "Tarefas" },
              { value: "exams", icon: GraduationCap, label: "Exames" },
              { value: "calendar", icon: Calendar, label: "Calendário" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-2"
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Participantes */}
        <TabsContent value="participants" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{participantList.length} colegas nesta cadeira</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {participantList.map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
              </div>
            ))}
          </div>
          {participantList.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum participante encontrado.</p>
          )}
        </TabsContent>

        {/* Gravações */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{disc.progress.watched} de {disc.progress.total} gravações assistidas</p>
            <div className="flex items-center gap-2">
              <Progress value={progressPct} className="w-24 h-1.5" />
              <span className="text-xs font-medium text-muted-foreground">{progressPct}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {discLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group border-l-[3px]"
                style={{ borderLeftColor: lesson.progress === 100 ? "hsl(var(--accent))" : lesson.progress > 0 ? disc.color : "transparent" }}
                onClick={() => navigate(`/student/disciplines/${id}/lessons/${lesson.id}`)}
              >
                <div className="w-24 h-16 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: disc.color + "15" }}>
                    <Play className="w-5 h-5 ml-0.5" style={{ color: disc.color }} />
                  </div>
                  {lesson.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="h-1 rounded-b-xl" style={{ width: `${lesson.progress}%`, background: lesson.progress === 100 ? "hsl(var(--accent))" : disc.color }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: disc.color + "12", color: disc.color }}>#{lesson.number}</span>
                    <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                    <span>{lesson.uploadDate}</span>
                    {lesson.materials.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id); }}
                        className="flex items-center gap-1 hover:underline" style={{ color: disc.color }}
                      >
                        <FileText className="w-3 h-3" />{lesson.materials.length} ficheiro(s)
                        {expandedLesson === lesson.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                    {lesson.tasks.length > 0 && (
                      <span className="flex items-center gap-1 text-secondary">
                        <ClipboardList className="w-3 h-3" />{lesson.tasks.length} tarefa(s)
                      </span>
                    )}
                  </div>
                  {expandedLesson === lesson.id && lesson.materials.length > 0 && (
                    <div className="mt-3 pl-1 space-y-1.5 border-l-2 ml-1" style={{ borderColor: disc.color + "30" }} onClick={e => e.stopPropagation()}>
                      {lesson.materials.map((mat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1 pl-3">
                          <FileText className="w-3 h-3" style={{ color: disc.color }} />
                          <span className="text-foreground">{mat.name}</span>
                          <span className="uppercase text-muted-foreground/50 text-[10px]">{mat.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {lesson.progress > 0 && lesson.progress < 100 && (
                  <span className="text-xs font-semibold shrink-0 px-2 py-1 rounded-full" style={{ background: disc.color + "12", color: disc.color }}>{lesson.progress}%</span>
                )}
                {lesson.progress === 100 && (
                  <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                )}
              </Card>
            ))}
            {discLessons.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma aula gravada disponível.</p>}
          </div>
        </TabsContent>

        {/* Conteúdos */}
        <TabsContent value="materials" className="space-y-4">
          {discLessons.filter(l => l.materials.length > 0).length > 0 ? (
            discLessons.filter(l => l.materials.length > 0).map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ background: disc.color + "08" }}>
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: disc.color + "15", color: disc.color }}>#{lesson.number}</span>
                  <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                </div>
                <div className="divide-y">
                  {lesson.materials.map((mat, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: disc.color + "12" }}>
                        <FileText className="w-4 h-4" style={{ color: disc.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{mat.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{mat.type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Descarregar"><Download className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum conteúdo disponível.</p>
          )}
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tasks" className="space-y-3">
          {allTasks.length > 0 ? allTasks.map((task) => {
            const statusCfg = {
              entregue: { icon: CheckCircle, label: "Entregue", color: "hsl(var(--accent))", bg: "hsl(var(--accent) / 0.1)" },
              atrasada: { icon: AlertCircle, label: "Atrasada", color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)" },
              pendente: { icon: Clock, label: "Pendente", color: disc.color, bg: disc.color + "12" },
            };
            const cfg = statusCfg[task.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={task.id}
                className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all border-l-[3px]"
                style={{ borderLeftColor: cfg.color }}
                onClick={() => navigate(`/student/disciplines/${id}/tasks?taskId=${task.id}`)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <ClipboardList className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>Aula {task.lessonNumber}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>{task.assignedDate} → {task.dueDate}</span>
                    <Badge variant="outline" className="text-[10px] gap-1 ml-1">
                      <MapPin className="w-3 h-3" /> Presencial
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" style={{ color: cfg.color }}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
              </Card>
            );
          }) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma tarefa atribuída.</p>
          )}
        </TabsContent>

        {/* Exames */}
        <TabsContent value="exams" className="space-y-5">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ background: disc.color + "08" }}>
              <GraduationCap className="w-5 h-5" style={{ color: disc.color }} />
              <h3 className="font-semibold text-foreground">Avaliações</h3>
            </div>
            {discGrades ? (
              <div className="divide-y">
                {discGrades.evaluations.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/student/disciplines/${id}/evaluation?index=${i}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        ev.published && ev.grade !== null
                          ? ev.grade >= 10 ? "bg-accent/10" : "bg-destructive/10"
                          : ""
                      )} style={!(ev.published && ev.grade !== null) ? { background: disc.color + "12" } : {}}>
                        {ev.published && ev.grade !== null ? (
                          <span className={`text-sm font-bold ${ev.grade >= 10 ? "text-accent" : "text-destructive"}`}>{ev.grade}</span>
                        ) : (
                          <GraduationCap className="w-4 h-4" style={{ color: disc.color }} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ev.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{ev.date}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span>Peso: {ev.weight}%</span>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <MapPin className="w-3 h-3" /> Presencial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {ev.published && ev.grade !== null ? (
                      <div className="flex items-center gap-1.5 text-accent shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">{ev.grade}/{ev.maxGrade}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0" style={{ color: disc.color }}>
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Pendente</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-5">Sem informação de avaliação.</p>
            )}
          </Card>
        </TabsContent>

        {/* Calendário */}
        <TabsContent value="calendar" className="space-y-4">
          {(() => {
            const taskDates = allTasks.map(t => ({ title: t.title, date: t.dueDate, type: "tarefa" as const }));
            const examDates = discGrades?.evaluations.map(e => ({ title: e.name, date: e.date, type: "exame" as const })) || [];
            const allDates = [...taskDates, ...examDates];
            const typeLabels: Record<string, string> = { tarefa: "Tarefa", exame: "Exame" };

            return allDates.length > 0 ? (
              <div className="space-y-2">
                {allDates.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer border" style={{ borderLeftWidth: 3, borderLeftColor: disc.color }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: disc.color + "12" }}>
                      {item.type === "exame" ? <GraduationCap className="w-4 h-4" style={{ color: disc.color }} /> : <ClipboardList className="w-4 h-4" style={{ color: disc.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0" style={{ borderColor: disc.color + "30", color: disc.color }}>
                      {typeLabels[item.type] || item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma data importante registada.</p>
              </Card>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}