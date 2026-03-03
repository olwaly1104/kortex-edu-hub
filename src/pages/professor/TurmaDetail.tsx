import { useParams, Link } from "react-router-dom";
import { profDisciplines, profLessons, profTasks, profStudents, allTurmas, profGradeCriteria } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, BookOpen, Users, Clock, Video, FileText,
  GraduationCap, ClipboardList, Play, Eye, Calendar, CheckCircle,
  TrendingUp, Search, Edit, Settings, Download, AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ProfessorTurmaDetail() {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const turma = allTurmas.find(t => t.id === turmaId);

  const turmaDiscs = profDisciplines.filter(d => d.turmas.some(t => t.id === turmaId));
  const turmaLessons = profLessons.filter(l => l.turmaId === turmaId);
  const turmaTasks = profTasks.filter(t => t.turmaId === turmaId);
  const turmaStudents = profStudents.filter(s => s.turmaId === turmaId);
  const uniqueStudents = turmaStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);

  const [studentSearch, setStudentSearch] = useState("");

  // Criteria
  const firstDisc = turmaDiscs[0];
  const existingCriteria = firstDisc ? profGradeCriteria.find(c => c.disciplineId === firstDisc.id) : null;
  const [criteria, setCriteria] = useState(existingCriteria?.criteria || [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]);

  // Resources from all lessons
  const allMaterials = turmaLessons.flatMap(l => l.materials.map(m => ({ ...m, lesson: l.title, lessonNumber: l.number, disc: profDisciplines.find(d => d.id === l.disciplineId) })));

  // Calendar events
  const calendarEvents = [
    ...turmaTasks.filter(t => t.status === "publicada").map(t => ({ id: t.id, title: t.title, date: t.dueDate, type: "entrega" as const, description: t.description })),
    ...turmaTasks.filter(t => t.type === "exame").map(t => ({ id: `ex-${t.id}`, title: t.title, date: t.dueDate, type: "exame" as const, description: t.description })),
  ];

  if (!turma) return <div className="p-8 text-muted-foreground">Turma não encontrada.</div>;

  const avgGrade = (() => {
    const withGrades = uniqueStudents.filter(s => s.avgGrade !== null);
    return withGrades.length > 0
      ? Math.round(withGrades.reduce((s, st) => s + (st.avgGrade || 0), 0) / withGrades.length * 10) / 10
      : null;
  })();
  const avgAttendance = uniqueStudents.length > 0
    ? Math.round(uniqueStudents.reduce((s, st) => s + st.attendance, 0) / uniqueStudents.length)
    : 0;

  const filteredStudents = uniqueStudents.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadgeMap: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

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

  const calendarTypeColors: Record<string, string> = {
    exame: "border-l-destructive",
    entrega: "border-l-secondary",
    reunião: "border-l-primary",
    feriado: "border-l-accent",
    evento: "border-l-primary",
  };
  const calendarTypeLabels: Record<string, string> = { exame: "Exame", entrega: "Entrega", reunião: "Reunião", feriado: "Feriado", evento: "Evento" };
  const calendarTypeBadge: Record<string, string> = { exame: "bg-destructive/10 text-destructive", entrega: "bg-secondary/10 text-secondary", reunião: "bg-primary/10 text-primary", feriado: "bg-accent/10 text-accent", evento: "bg-primary/10 text-primary" };

  const handleSaveCriteria = () => {
    toast({ title: "Critérios guardados!", description: "Os critérios de avaliação foram actualizados." });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/professor/disciplines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às turmas
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-primary/5">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5" style={{ transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px]">{turma.name}</Badge>
              {turmaDiscs.map(d => (
                <Badge key={d.id} variant="outline" className="text-xs font-mono">{d.code}</Badge>
              ))}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{turma.name}</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">
              {turmaDiscs.map(d => d.name).join(", ")}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{turma.course}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{turma.year}º Ano</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{uniqueStudents.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Video className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aulas</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{turmaLessons.filter(l => l.status === "publicada").length}</span>
            <span className="text-sm text-muted-foreground">/{turmaLessons.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média</span>
          </div>
          {avgGrade !== null ? (
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{avgGrade}</span>
              <span className="text-sm text-muted-foreground">/20</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-muted-foreground">—</p>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{avgAttendance}%</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "students", icon: Users, label: "Estudantes" },
              { value: "lessons", icon: Video, label: "Aulas" },
              { value: "tasks", icon: ClipboardList, label: "Tarefas" },
              { value: "resources", icon: FileText, label: "Recursos" },
              { value: "calendar", icon: Calendar, label: "Calendário" },
              { value: "criteria", icon: Settings, label: "Critério" },
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

        {/* ── Estudantes ── */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Pesquisar estudante..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente ({uniqueStudents.filter(s => s.status === "excelente").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Normal ({uniqueStudents.filter(s => s.status === "normal").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco ({uniqueStudents.filter(s => s.status === "risco").length})</span>
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
                    <Badge className={`${statusBadgeMap[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{student.email}</p>
                </div>
                <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Presença</p><p className={`text-sm font-bold ${student.attendance >= 75 ? "text-accent" : "text-destructive"}`}>{student.attendance}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Média</p><p className={`text-sm font-bold ${student.avgGrade && student.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{student.avgGrade ?? "—"}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-sm font-bold text-foreground">{student.submittedTasks}/{student.totalTasks}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Última</p><p className="text-xs text-muted-foreground">{student.lastActive}</p></div>
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
              const disc = profDisciplines.find(d => d.id === lesson.disciplineId);
              return (
                <Card key={lesson.id} className="p-4 flex items-center gap-4 border-l-[3px]" style={{ borderLeftColor: lesson.status === "publicada" ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>
                  <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-muted-foreground/60" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                      <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                      {disc && <Badge variant="outline" className="text-[10px] font-mono">{disc.code}</Badge>}
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
                </Card>
              );
            })}
            {turmaLessons.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma aula nesta turma.</p>}
          </div>
        </TabsContent>

        {/* ── Tarefas ── */}
        <TabsContent value="tasks" className="space-y-4">
          <p className="text-sm text-muted-foreground">{turmaTasks.length} tarefas / avaliações</p>
          <div className="space-y-3">
            {turmaTasks.map(task => {
              const tcfg = taskStatusConfig[task.status];
              const submPct = Math.round((task.submissions / task.totalStudents) * 100);
              return (
                <Card key={task.id} className="p-4 border-l-[3px] border-l-primary cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/professor/tasks/${task.id}`)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{task.type === "tarefa" ? "Tarefa" : task.type === "quiz" ? "Quiz" : "Exame"}</Badge>
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
            {turmaTasks.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma tarefa nesta turma.</p>}
          </div>
        </TabsContent>

        {/* ── Recursos ── */}
        <TabsContent value="resources" className="space-y-4">
          <p className="text-sm text-muted-foreground">{allMaterials.length} recursos disponíveis</p>
          <div className="space-y-2">
            {allMaterials.map((mat, i) => (
              <Card key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{mat.name}</p>
                  <p className="text-[11px] text-muted-foreground">{mat.type.toUpperCase()} • {mat.size} • Aula #{mat.lessonNumber}: {mat.lesson}</p>
                </div>
                {mat.disc && <Badge variant="outline" className="text-[10px] font-mono">{mat.disc.code}</Badge>}
                <Button variant="ghost" size="icon" className="shrink-0"><Download className="w-4 h-4" /></Button>
              </Card>
            ))}
            {allMaterials.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum recurso disponível.</p>}
          </div>
        </TabsContent>

        {/* ── Calendário ── */}
        <TabsContent value="calendar" className="space-y-4">
          <p className="text-sm text-muted-foreground">{calendarEvents.length} datas importantes</p>
          <div className="space-y-2">
            {calendarEvents.map(ev => (
              <Card key={ev.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${calendarTypeColors[ev.type]}`}>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  {ev.type === "exame" ? <AlertCircle className="w-5 h-5 text-destructive" /> : ev.type === "entrega" ? <ClipboardList className="w-5 h-5 text-secondary" /> : <Calendar className="w-5 h-5 text-primary" />}
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
            {calendarEvents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum evento agendado.</p>}
          </div>
        </TabsContent>

        {/* ── Critério ── */}
        <TabsContent value="criteria" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-primary" /> Critérios de Classificação</h2>
            <p className="text-sm text-muted-foreground">Defina os intervalos de nota para cada nível de desempenho nesta turma.</p>
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
                  <p className="text-lg font-bold text-foreground">{uniqueStudents.filter(s => { if (s.avgGrade === null) return false; if (i === 0) return s.avgGrade >= c.minGrade; if (i === criteria.length - 1) return s.avgGrade < criteria[i - 1].minGrade; return s.avgGrade >= c.minGrade && s.avgGrade < criteria[i - 1].minGrade; }).length}</p>
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
                const count = uniqueStudents.filter(s => { if (s.avgGrade === null) return false; if (i === 0) return s.avgGrade >= c.minGrade; if (i === criteria.length - 1) return s.avgGrade < criteria[i - 1].minGrade; return s.avgGrade >= c.minGrade && s.avgGrade < criteria[i - 1].minGrade; }).length;
                const pct = uniqueStudents.length > 0 ? Math.round((count / uniqueStudents.length) * 100) : 0;
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
