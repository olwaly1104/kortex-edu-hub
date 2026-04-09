import { useParams, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { disciplines, lessons, grades, calendarEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, BookOpen, User, Users, Clock, MapPin, Video, FileText,
  GraduationCap, ClipboardList, Play, Download, ChevronDown, ChevronRight,
  Eye, Calendar, CheckCircle, AlertCircle, TrendingUp, FolderOpen,
  Mail, LogIn, Award,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

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
  const avg = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null;

  const progressPct = Math.round((disc.progress.watched / disc.progress.total) * 100);

  const allParticipants = new Set<string>();
  discLessons.forEach(l => l.participants.forEach(p => allParticipants.add(p)));
  const participantList = Array.from(allParticipants).filter(p => !p.startsWith("Prof.")).sort();

  // Lesson status helper
  const getLessonStatus = (lesson: typeof lessons[0]) => {
    if (lesson.progress >= 100) return "concluída";
    if (lesson.progress > 0) return "a_decorrer";
    return "agendada";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/student/disciplines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às cadeiras
      </Link>

      {/* Unified Card Header — matching coordenador CadeiraDetail */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{disc.name}</h1>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{disc.code}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-3xl">{disc.summary}</p>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Link to="/student/contacts" onClick={e => e.stopPropagation()}>
                <Badge variant="outline" className="text-[11px] bg-background/80 gap-1 hover:bg-muted cursor-pointer">
                  <GraduationCap className="w-3 h-3" /> {disc.professor}
                </Badge>
              </Link>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Clock className="w-3 h-3" /> {disc.schedule}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <MapPin className="w-3 h-3" /> {disc.room}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Mail className="w-3 h-3" /> {disc.professorEmail}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Avaliações</p>
              <p className="text-sm font-bold text-foreground">{publishedEvals.length}/{totalEvals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Aulas</p>
              <p className="text-sm font-bold text-foreground">{disc.progress.watched}/{disc.progress.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p>
              <p className={`text-sm font-bold ${attendancePct >= 75 ? "text-accent" : "text-destructive"}`}>{attendancePct}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Tarefas</p>
              <p className="text-sm font-bold text-foreground">{allTasks.filter(t => t.status === "entregue").length}/{allTasks.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média</p>
              <p className={`text-sm font-bold ${avg !== null && avg >= 10 ? "text-accent" : avg !== null ? "text-destructive" : "text-muted-foreground"}`}>{avg !== null ? `${avg}/20` : "—"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="lessons" className="space-y-5">
        <div className="border-b overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "lessons", icon: Video, label: "Aulas" },
              { value: "materials", icon: FolderOpen, label: "Conteúdos" },
              { value: "tasks", icon: ClipboardList, label: "Tarefas" },
              { value: "exams", icon: Award, label: "Avaliações" },
              { value: "participants", icon: Users, label: "Participantes" },
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

        {/* Aulas */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{disc.progress.watched} de {disc.progress.total} aulas assistidas</p>
            <div className="flex items-center gap-2">
              <Progress value={progressPct} className="w-24 h-1.5" />
              <span className="text-xs font-medium text-muted-foreground">{progressPct}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {discLessons.map((lesson) => {
              const status = getLessonStatus(lesson);
              return (
                <Card
                  key={lesson.id}
                  className="p-4 border-l-[3px] hover:shadow-md transition-all cursor-pointer"
                  style={{ borderLeftColor: status === "concluída" ? "hsl(var(--accent))" : status === "a_decorrer" ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
                  onClick={() => navigate(`/student/disciplines/${id}/lessons/${lesson.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 relative overflow-hidden">
                      <Play className="w-5 h-5 text-muted-foreground/60" />
                      {lesson.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <div className="h-1 rounded-b-xl" style={{ width: `${lesson.progress}%`, background: lesson.progress === 100 ? "hsl(var(--accent))" : "hsl(var(--primary))" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                        <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                        <span>{lesson.uploadDate}</span>
                        {lesson.materials.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id); }}
                            className="flex items-center gap-1 text-primary hover:underline"
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
                        <div className="mt-3 pl-1 space-y-1.5 border-l-2 border-primary/20 ml-1" onClick={e => e.stopPropagation()}>
                          {lesson.materials.map((mat, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1 pl-3">
                              <FileText className="w-3 h-3 text-primary" />
                              <span className="text-foreground">{mat.name}</span>
                              <span className="uppercase text-muted-foreground/50 text-[10px]">{mat.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {status === "concluída" ? (
                        <Badge className="bg-accent/10 text-accent text-[10px] gap-1">
                          <CheckCircle className="w-3 h-3" /> Concluída
                        </Badge>
                      ) : status === "a_decorrer" ? (
                        <Badge className="bg-primary/10 text-primary text-[10px] gap-1">
                          <Clock className="w-3 h-3" /> A Decorrer
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground text-[10px] gap-1">
                          <Clock className="w-3 h-3" /> Agendada
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {discLessons.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma aula disponível.</p>}
          </div>
        </TabsContent>

        {/* Conteúdos */}
        <TabsContent value="materials" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {discLessons.reduce((s, l) => s + l.materials.length, 0)} ficheiros disponíveis
          </p>
          {discLessons.filter(l => l.materials.length > 0).length > 0 ? (
            discLessons.filter(l => l.materials.length > 0).map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-2 bg-primary/5">
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                  <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                  <span className="text-[10px] text-muted-foreground ml-auto">{lesson.uploadDate}</span>
                </div>
                <div className="divide-y">
                  {lesson.materials.map((mat, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
                        <FileText className="w-4 h-4 text-primary" />
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
              entregue: { icon: CheckCircle, label: "Entregue", cls: "bg-accent/10 text-accent" },
              atrasada: { icon: AlertCircle, label: "Atrasada", cls: "bg-destructive/10 text-destructive" },
              pendente: { icon: Clock, label: "Pendente", cls: "bg-primary/10 text-primary" },
            };
            const cfg = statusCfg[task.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={task.id}
                className="p-4 border-l-[3px] hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeftColor: task.status === "entregue" ? "hsl(var(--accent))" : task.status === "atrasada" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                onClick={() => navigate(`/student/disciplines/${id}/tasks?taskId=${task.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.cls)}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Aula {task.lessonNumber}</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span>{task.assignedDate} → {task.dueDate}</span>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px] gap-1", cfg.cls)}>
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </Badge>
                </div>
              </Card>
            );
          }) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma tarefa atribuída.</p>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="exams" className="space-y-3">
          {discGrades ? (
            discGrades.evaluations.map((ev, i) => {
              const hasGrade = ev.published && ev.grade !== null;
              const passed = hasGrade && ev.grade! >= 10;
              return (
                <Card
                  key={i}
                  className="p-4 border-l-[3px] hover:shadow-md transition-all cursor-pointer"
                  style={{ borderLeftColor: hasGrade ? (passed ? "hsl(var(--accent))" : "hsl(var(--destructive))") : "hsl(var(--muted))" }}
                  onClick={() => navigate(`/student/disciplines/${id}/evaluation?index=${i}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      hasGrade ? (passed ? "bg-accent/10" : "bg-destructive/10") : "bg-muted"
                    )}>
                      {hasGrade ? (
                        <span className={`text-sm font-bold ${passed ? "text-accent" : "text-destructive"}`}>{ev.grade}</span>
                      ) : (
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{ev.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{ev.date}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span>Peso: {ev.weight}%</span>
                        {ev.room && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.room}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {hasGrade ? (
                      <Badge className="bg-accent/10 text-accent text-[10px] gap-1">
                        <CheckCircle className="w-3 h-3" /> {ev.grade}/{ev.maxGrade}
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-[10px] gap-1">
                        <Clock className="w-3 h-3" /> Pendente
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem informação de avaliação.</p>
          )}
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participants" className="space-y-4">
          <p className="text-sm text-muted-foreground">{participantList.length} colegas nesta cadeira</p>
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
      </Tabs>
    </div>
  );
}
