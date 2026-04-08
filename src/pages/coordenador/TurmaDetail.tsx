import { useParams, Link } from "react-router-dom";
import {
  coordTurmas, coordEstudantes, coordCursoInfo, coordDisciplinas,
  coordTurmaLessons, coordTurmaTasks, coordTurmaResources,
  coordTurmaCalendar, coordTurmaGradeCriteria,
} from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, GraduationCap, Users, BookOpen, CheckCircle, Search,
  TrendingUp, Calendar, Video, Clock, Play, Eye, FileText, MapPin,
  ClipboardList, Edit, Settings, Download, AlertCircle, FolderOpen, Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CoordenadorTurmaDetail() {
  const { year, turmaId } = useParams();
  const { toast } = useToast();
  const yearNum = parseInt(year || "1");
  const turma = coordTurmas.find(t => t.id === turmaId);
  const turmaLetter = turma?.name.replace("Turma ", "") || "";
  const estudantes = coordEstudantes.filter(e => e.year === yearNum && e.turma === turmaLetter);
  const turmaLessons = coordTurmaLessons.filter(l => l.turmaId === turmaId);
  const turmaTasks = coordTurmaTasks.filter(t => t.turmaId === turmaId);
  const turmaResources = coordTurmaResources.filter(r => r.turmaId === turmaId);
  const turmaCalendar = coordTurmaCalendar.filter(e => e.turmaId === turmaId);
  const existingCriteria = coordTurmaGradeCriteria.find(c => c.turmaId === turmaId);

  // Cadeiras (disciplinas) for this year
  const turmaCadeiras = coordDisciplinas.filter(d => d.year === yearNum);

  const [studentSearch, setStudentSearch] = useState("");
  const [criteria, setCriteria] = useState(existingCriteria?.criteria || [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]);

  if (!turma) return <div className="p-8 text-muted-foreground">Turma não encontrada.</div>;

  // Conteúdos — ensure at least 2 per published lesson
  const conteudos = turmaLessons.filter(l => l.status === "publicada").flatMap(l => {
    const mats = l.materials.length >= 2
      ? l.materials
      : l.materials.length === 1
        ? [...l.materials, { name: `Exercícios ${l.discipline}`, type: "pdf", size: "350 KB" }]
        : [{ name: `Slides Aula #${l.number}`, type: "pdf", size: "1.8 MB" }, { name: `Exercícios ${l.discipline}`, type: "pdf", size: "350 KB" }];
    return mats.slice(0, 2).map(m => ({ ...m, lessonId: l.id, lessonTitle: l.title, lessonNumber: l.number, date: l.date, discipline: l.discipline, disciplineCode: l.disciplineCode }));
  });

  // Avaliações
  const avaliacoes = turmaTasks.filter(t => t.type === "exame" || t.type === "quiz");

  const avgPresenca = estudantes.length > 0 ? Math.round(estudantes.reduce((s, e) => s + e.presenca, 0) / estudantes.length) : 0;
  const filteredStudents = estudantes.filter(e => e.name.toLowerCase().includes(studentSearch.toLowerCase()));

  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadgeStyle: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

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

  const calendarTypeColors: Record<string, string> = { exame: "border-l-destructive", entrega: "border-l-secondary", reunião: "border-l-primary", feriado: "border-l-accent", evento: "border-l-primary" };
  const calendarTypeLabels: Record<string, string> = { exame: "Exame", entrega: "Entrega", reunião: "Reunião", feriado: "Feriado", evento: "Evento" };
  const calendarTypeBadge: Record<string, string> = { exame: "bg-destructive/10 text-destructive", entrega: "bg-secondary/10 text-secondary", reunião: "bg-primary/10 text-primary", feriado: "bg-accent/10 text-accent", evento: "bg-primary/10 text-primary" };

  const resourceTypeIcons: Record<string, string> = { pdf: "PDF", video: "VID", slides: "SLD", exercicio: "EXR" };

  const handleSaveCriteria = () => {
    toast({ title: "Critérios guardados!", description: "Os critérios de avaliação foram actualizados." });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/coordenador/anos/${yearNum}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao {yearNum}º Ano
      </Link>

      {/* Unified Card */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{turma.name}</h1>
              <Badge className={`text-[11px] border-0 px-2.5 py-1 shrink-0 ${
                turma.media >= 14 ? "bg-accent/10 text-accent" : turma.media >= 10 ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
              }`}>
                {turma.media >= 14 ? "Excelente" : turma.media >= 10 ? "Normal" : "Em Risco"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2.5">Director: {turma.director}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {coordCursoInfo.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> {turma.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {yearNum}º Ano · {coordCursoInfo.faculty}
              </Badge>
              {turmaCadeiras.length > 0 && (
                <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                  <Clock className="w-3 h-3" /> {turmaCadeiras[0].diasAula}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{turma.estudantes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${turma.media >= 10 ? "text-accent" : "text-destructive"}`}>{turma.media}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p>
              <p className={`text-sm font-bold ${turma.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{turma.presenca}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0"><ClipboardList className="w-3.5 h-3.5 text-secondary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Entrega</p>
              <p className={`text-sm font-bold ${turma.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{turma.taxaEntrega}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Aprovado</p>
              <p className={`text-sm font-bold ${turma.taxaSucesso >= 70 ? "text-accent" : "text-destructive"}`}>{turma.taxaSucesso}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="cadeiras" className="space-y-5">
        <div className="border-b overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "cadeiras", icon: BookOpen, label: "Cadeiras" },
              { value: "students", icon: Users, label: "Estudantes" },
              { value: "lessons", icon: Video, label: "Aulas" },
              { value: "conteudos", icon: FolderOpen, label: "Conteúdos" },
              { value: "tasks", icon: ClipboardList, label: "Tarefas" },
              { value: "avaliacoes", icon: Award, label: "Avaliações" },
              { value: "resources", icon: FileText, label: "Recursos" },
              { value: "calendar", icon: Calendar, label: "Calendário" },
              { value: "criteria", icon: Settings, label: "Critério" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-2">
                <tab.icon className="w-4 h-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Cadeiras (coordenador only) ── */}
        <TabsContent value="cadeiras" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaCadeiras.length} cadeiras no {yearNum}º Ano</p>
          <div className="space-y-3">
            {turmaCadeiras.map(cadeira => (
              <Link key={cadeira.id} to={`/coordenador/anos/${yearNum}/turma/${turmaId}/cadeira/${cadeira.id}`}>
                <Card className="p-5 border-l-[3px] border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{cadeira.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{cadeira.code}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cadeira.professor}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {cadeira.diasAula}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cadeira.location}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 shrink-0 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                        <p className={`text-sm font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                        <p className={`text-sm font-bold ${cadeira.media !== null && cadeira.media >= 10 ? "text-accent" : "text-destructive"}`}>{cadeira.media ?? "—"}/20</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {turmaCadeiras.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma cadeira neste ano.</p>}
          </div>
        </TabsContent>

        {/* ── Estudantes ── */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Pesquisar estudante..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente ({estudantes.filter(s => s.status === "excelente").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Normal ({estudantes.filter(s => s.status === "normal").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco ({estudantes.filter(s => s.status === "risco").length})</span>
            </div>
          </div>
          <div className="space-y-2">
            {filteredStudents.map(student => (
              <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                    <Badge className={`${statusBadgeStyle[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{student.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 shrink-0 text-center">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Presença</p><p className={`text-sm font-bold ${student.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{student.presenca}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-sm font-bold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}</p></div>
                </div>
              </Card>
            ))}
            {filteredStudents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>}
          </div>
        </TabsContent>

        {/* ── Aulas ── */}
        <TabsContent value="lessons" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaLessons.filter(l => l.status === "publicada").length} publicadas, {turmaLessons.filter(l => l.status === "agendada").length} agendadas</p>
          <div className="space-y-3">
            {turmaLessons.map(lesson => {
              const cfg = lessonStatusConfig[lesson.status];
              const StatusIcon = cfg.icon;
              const firstCadeira = coordDisciplinas.find(d => d.code === lesson.disciplineCode);
              const cadeiraIdForLink = firstCadeira?.id || "c1";
              return (
                <Link key={lesson.id} to={`/coordenador/anos/${yearNum}/turma/${turmaId}/cadeira/${cadeiraIdForLink}/aula/${lesson.id}`}>
                <Card className="p-4 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: lesson.status === "publicada" ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-muted-foreground/60" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                        <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{lesson.disciplineCode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                        <span>{lesson.date}</span>
                        <span className="text-muted-foreground">{lesson.discipline}</span>
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
                  {/* Conteúdos / Ficheiros da aula */}
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
            {turmaLessons.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma aula nesta turma.</p>}
          </div>
        </TabsContent>

        {/* ── Conteúdos ── */}
        <TabsContent value="conteudos" className="space-y-5">
          <p className="text-sm text-muted-foreground">{conteudos.length} conteúdos disponíveis</p>
          {turmaLessons.filter(l => l.status === "publicada").map(lesson => {
            const lessonConteudos = conteudos.filter(c => c.lessonId === lesson.id);
            if (lessonConteudos.length === 0) return null;
            return (
              <Card key={lesson.id} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Aula #{lesson.number}</span>
                      <span className="text-sm font-semibold text-foreground">{lesson.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{lesson.disciplineCode}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.date} • {lesson.duration} • {lessonConteudos.length} ficheiros</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {lessonConteudos.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.type.toUpperCase()} • {c.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0" title="Ver"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="shrink-0" title="Descarregar"><Download className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {conteudos.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum conteúdo disponível.</p>}
        </TabsContent>

        {/* ── Tarefas ── */}
        <TabsContent value="tasks" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaTasks.filter(t => t.type === "tarefa").length} tarefas</p>
          <div className="space-y-3">
            {turmaTasks.filter(t => t.type === "tarefa").map(task => {
              const tcfg = taskStatusConfig[task.status];
              const submPct = Math.round((task.submissions / task.totalStudents) * 100);
              return (
                <Card key={task.id} className="p-4 border-l-[3px] border-l-primary">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">Tarefa</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">{task.discipline}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div><p className="text-[10px] text-muted-foreground uppercase">Entrega</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Peso</p><p className="text-xs font-medium text-foreground">{task.weight}%</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}</p></div>
                  </div>
                  <Progress value={submPct} className="h-1.5 mt-3" />
                </Card>
              );
            })}
            {turmaTasks.filter(t => t.type === "tarefa").length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma tarefa nesta turma.</p>}
          </div>
        </TabsContent>

        {/* ── Avaliações ── */}
        <TabsContent value="avaliacoes" className="space-y-4">
          <p className="text-sm text-muted-foreground">{avaliacoes.length} avaliações (exames e quizzes)</p>
          <div className="space-y-3">
            {avaliacoes.map(task => {
              const tcfg = taskStatusConfig[task.status];
              const submPct = Math.round((task.submissions / task.totalStudents) * 100);
              return (
                <Card key={task.id} className="p-4 border-l-[3px] border-l-destructive">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{task.type === "exame" ? "Exame" : "Quiz"}</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">{task.discipline}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div><p className="text-[10px] text-muted-foreground uppercase">Data</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Peso</p><p className="text-xs font-medium text-foreground">{task.weight}%</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}</p></div>
                  </div>
                  <Progress value={submPct} className="h-1.5 mt-3" />
                </Card>
              );
            })}
            {avaliacoes.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma avaliação nesta turma.</p>}
          </div>
        </TabsContent>

        {/* ── Recursos ── */}
        <TabsContent value="resources" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaResources.length} recursos disponíveis</p>
          <div className="space-y-2">
            {turmaResources.map(res => (
              <Card key={res.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{res.name}</p>
                  <p className="text-[11px] text-muted-foreground">{resourceTypeIcons[res.type]} • {res.size} • {res.discipline} • {res.uploadDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Download className="w-3 h-3" />{res.downloads}</span>
                  <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {turmaResources.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum recurso disponível.</p>}
          </div>
        </TabsContent>

        {/* ── Calendário ── */}
        <TabsContent value="calendar" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaCalendar.length} datas importantes</p>
          <div className="space-y-2">
            {turmaCalendar.map(ev => (
              <Card key={ev.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${calendarTypeColors[ev.type]}`}>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  {ev.type === "exame" ? <AlertCircle className="w-5 h-5 text-destructive" /> : ev.type === "entrega" ? <ClipboardList className="w-5 h-5 text-secondary" /> : ev.type === "feriado" ? <Calendar className="w-5 h-5 text-accent" /> : <Calendar className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{ev.title}</p>
                    <Badge className={`${calendarTypeBadge[ev.type]} text-[10px]`}>{calendarTypeLabels[ev.type]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</p>
                </div>
                <p className="text-xs font-medium text-foreground shrink-0">{ev.date}</p>
              </Card>
            ))}
            {turmaCalendar.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum evento agendado.</p>}
          </div>
        </TabsContent>

        {/* ── Critério ── */}
        <TabsContent value="criteria" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-primary" /> Critérios de Classificação</h2>
            <p className="text-sm text-muted-foreground">Intervalos de nota para cada nível de desempenho nesta turma.</p>
          </div>
          <Card className="p-6 space-y-4">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Input value={c.label} onChange={e => { const u = [...criteria]; u[i] = { ...u[i], label: e.target.value }; setCriteria(u); }} className="max-w-[200px] h-9 text-sm font-semibold" />
                    <span className="text-xs text-muted-foreground">Nota mínima:</span>
                    <Input type="number" value={c.minGrade} onChange={e => { const u = [...criteria]; u[i] = { ...u[i], minGrade: Number(e.target.value) }; setCriteria(u); }} className="w-20 h-9 text-sm font-bold text-center" min="0" max="20" />
                    <span className="text-xs text-muted-foreground">/20 valores</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{i === 0 ? `Nota ≥ ${c.minGrade}` : i === criteria.length - 1 ? `Nota < ${criteria[i - 1].minGrade}` : `${c.minGrade} ≤ Nota < ${criteria[i - 1].minGrade}`}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Estudantes</p>
                  <p className="text-lg font-bold text-foreground">
                    {estudantes.filter(s => {
                      if (s.media === null) return false;
                      if (i === 0) return s.media >= c.minGrade;
                      if (i === criteria.length - 1) return s.media < criteria[i - 1].minGrade;
                      return s.media >= c.minGrade && s.media < criteria[i - 1].minGrade;
                    }).length}
                  </p>
                </div>
              </div>
            ))}
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveCriteria} className="gap-2"><CheckCircle className="w-4 h-4" /> Guardar Critérios</Button>
          </div>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição Actual</h3>
            <div className="space-y-3">
              {criteria.map((c, i) => {
                const count = estudantes.filter(s => {
                  if (s.media === null) return false;
                  if (i === 0) return s.media >= c.minGrade;
                  if (i === criteria.length - 1) return s.media < criteria[i - 1].minGrade;
                  return s.media >= c.minGrade && s.media < criteria[i - 1].minGrade;
                }).length;
                const pct = estudantes.length > 0 ? Math.round((count / estudantes.length) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium text-foreground w-24">{c.label}</span>
                    <div className="flex-1"><div className="h-6 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color, opacity: 0.7 }} /></div></div>
                    <span className="text-sm font-bold text-foreground w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
