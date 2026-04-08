import { useParams, Link } from "react-router-dom";
import {
  coordDisciplinas, coordCursoInfo, coordEstudantes,
  coordTurmaLessons, coordTurmaTasks, coordTurmaResources,
} from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, BookOpen, Users, Clock, MapPin, Video, FileText,
  GraduationCap, ClipboardList, Play, Eye, Calendar, CheckCircle,
  TrendingUp, Edit, Search, Settings, FolderOpen, Award,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CoordenadorCadeiraDetail() {
  const { year, turmaId, cadeiraId } = useParams();
  const { toast } = useToast();
  const yearNum = parseInt(year || "1");
  const cadeira = coordDisciplinas.find(d => d.id === cadeiraId);

  const [studentSearch, setStudentSearch] = useState("");

  if (!cadeira) return <div className="p-8 text-muted-foreground">Cadeira não encontrada.</div>;

  // Get students for this year
  const estudantes = coordEstudantes.filter(e => e.year === yearNum);
  const filteredStudents = estudantes.filter(e => e.name.toLowerCase().includes(studentSearch.toLowerCase()));

  // Get lessons/tasks/resources for this turma
  const turmaLessons = coordTurmaLessons.filter(l => l.turmaId === turmaId && l.disciplineCode === cadeira.code);
  const allTurmaLessons = coordTurmaLessons.filter(l => l.turmaId === turmaId);
  const turmaTasks = coordTurmaTasks.filter(t => t.turmaId === turmaId && t.discipline === cadeira.name);
  const turmaResources = coordTurmaResources.filter(r => r.turmaId === turmaId && r.discipline === cadeira.name);

  const publishedLessons = turmaLessons.filter(l => l.status === "publicada").length;
  const avgPresenca = estudantes.length > 0
    ? Math.round(estudantes.reduce((s, e) => s + e.presenca, 0) / estudantes.length)
    : 0;

  // Conteúdos from published lessons
  const conteudos = turmaLessons.filter(l => l.status === "publicada").flatMap(l =>
    l.materials.map(m => ({ ...m, lessonTitle: l.title, lessonNumber: l.number, date: l.date }))
  );

  const statusBadgeStyle: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };

  const lessonStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    publicada: { label: "Publicada", color: "bg-accent/10 text-accent", icon: CheckCircle },
    agendada: { label: "Agendada", color: "bg-secondary/10 text-secondary", icon: Clock },
    rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Edit },
  };

  const taskStatusConfig: Record<string, { label: string; color: string }> = {
    publicada: { label: "Activa", color: "bg-secondary/10 text-secondary" },
    encerrada: { label: "Encerrada", color: "bg-accent/10 text-accent" },
    rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/coordenador/anos/${yearNum}/turma/${turmaId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar à turma
      </Link>

      {/* Unified Card */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{cadeira.name}</h1>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{cadeira.code}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <GraduationCap className="w-3 h-3" /> {cadeira.professor}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> Turma {turmaId?.replace("t", "").replace(/\d/, "").toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {yearNum}º Ano · {coordCursoInfo.faculty}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <MapPin className="w-3 h-3" /> {cadeira.location}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{cadeira.estudantes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Dias de Aula</p>
              <p className="text-sm font-bold text-foreground">{cadeira.diasAula}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p>
              <p className={`text-sm font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0"><ClipboardList className="w-3.5 h-3.5 text-secondary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Entrega</p>
              <p className={`text-sm font-bold ${cadeira.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{cadeira.taxaEntrega}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${cadeira.media !== null && cadeira.media >= 10 ? "text-accent" : "text-destructive"}`}>{cadeira.media ?? "—"}/20</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-5">
        <div className="border-b overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "students", icon: Users, label: "Estudantes" },
              { value: "lessons", icon: Video, label: "Aulas" },
              { value: "conteudos", icon: FolderOpen, label: "Conteúdos" },
              { value: "tasks", icon: ClipboardList, label: "Tarefas" },
              { value: "avaliacoes", icon: Award, label: "Avaliações" },
              { value: "resources", icon: FileText, label: "Recursos" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-2">
                <tab.icon className="w-4 h-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Aulas */}
        <TabsContent value="lessons" className="space-y-4">
          <p className="text-sm text-muted-foreground">{publishedLessons} publicadas de {turmaLessons.length || allTurmaLessons.length} aulas</p>
          <div className="space-y-3">
            {(turmaLessons.length > 0 ? turmaLessons : allTurmaLessons).map(lesson => {
              const cfg = lessonStatusConfig[lesson.status];
              const StatusIcon = cfg.icon;
              return (
                <Link key={lesson.id} to={`/coordenador/anos/${yearNum}/turma/${turmaId}/cadeira/${cadeiraId}/aula/${lesson.id}`}>
                <Card className="p-4 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: lesson.status === "publicada" ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-muted-foreground/60" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                        <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                        <span>{lesson.date}</span>
                        {lesson.status === "publicada" && (
                          <>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{lesson.views}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lesson.attendance}/{lesson.totalStudents}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={`${cfg.color} gap-1 text-[10px]`}><StatusIcon className="w-3 h-3" /> {cfg.label}</Badge>
                  </div>
                  {lesson.materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Conteúdos / Ficheiros</p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.materials.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
                            <FileText className="w-3 h-3 text-primary" />
                            <span className="text-foreground font-medium">{m.name}</span>
                            <span className="text-muted-foreground">{m.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
                </Link>
              );
            })}
          </div>
        </TabsContent>

        {/* Conteúdos */}
        <TabsContent value="conteudos" className="space-y-4">
          <p className="text-sm text-muted-foreground">{conteudos.length} ficheiros disponíveis</p>
          {conteudos.length > 0 ? (
            <div className="space-y-2">
              {conteudos.map((c, i) => (
                <Card key={i} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">Aula #{c.lessonNumber} — {c.lessonTitle} • {c.date}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.type.toUpperCase()} • {c.size}</span>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum conteúdo disponível.</p>
          )}
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tasks" className="space-y-4">
          {(() => {
            const tarefas = turmaTasks.filter(t => t.type === "tarefa");
            return tarefas.length > 0 ? (
              <div className="space-y-3">
                {tarefas.map(task => {
                  const tcfg = taskStatusConfig[task.status];
                  const submPct = Math.round((task.submissions / task.totalStudents) * 100);
                  return (
                    <Card key={task.id} className="p-4 border-l-[3px] border-l-primary">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{task.title}</p>
                            <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        <div><p className="text-[10px] text-muted-foreground uppercase">Entrega</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Peso</p><p className="text-xs font-medium text-foreground">{task.weight}%</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}</p></div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">Nenhuma tarefa.</p>;
          })()}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="avaliacoes" className="space-y-4">
          {(() => {
            const avaliacoes = turmaTasks.filter(t => t.type === "exame" || t.type === "quiz");
            return avaliacoes.length > 0 ? (
              <div className="space-y-3">
                {avaliacoes.map(task => {
                  const tcfg = taskStatusConfig[task.status];
                  const submPct = Math.round((task.submissions / task.totalStudents) * 100);
                  return (
                    <Card key={task.id} className="p-4 border-l-[3px] border-l-destructive">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{task.title}</p>
                            <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                            <Badge variant="outline" className="text-[10px]">{task.type === "quiz" ? "Quiz" : "Exame"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        <div><p className="text-[10px] text-muted-foreground uppercase">Data</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Realizadas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Peso</p><p className="text-xs font-medium text-foreground">{task.weight}%</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}</p></div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">Nenhuma avaliação.</p>;
          })()}
        </TabsContent>

        {/* Estudantes */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Pesquisar estudante..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
           {filteredStudents.map(student => (
              <Link key={student.id} to={`/coordenador/estudantes/${student.id}`}>
              <Card className={`p-4 flex items-center gap-4 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer ${statusColors[student.status]}`}>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                    <Badge variant="outline" className="text-[10px] font-mono">T{student.turma}</Badge>
                    <Badge className={`${statusBadgeStyle[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{student.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Presença</p><p className={`text-sm font-bold ${student.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{student.presenca}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Entrega</p><p className={`text-sm font-bold ${student.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{student.taxaEntrega}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-sm font-bold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}</p></div>
                </div>
              </Card>
              </Link>
            ))}
            {filteredStudents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>}
          </div>
        </TabsContent>

        {/* Recursos */}
        <TabsContent value="resources" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaResources.length} recursos</p>
          {turmaResources.length > 0 ? (
            <div className="space-y-2">
              {turmaResources.map(r => (
                <Card key={r.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.type.toUpperCase()} • {r.size} • {r.uploadDate}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.downloads} downloads</span>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum recurso.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
