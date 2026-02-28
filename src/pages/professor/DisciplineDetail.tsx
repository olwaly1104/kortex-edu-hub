import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { profDisciplines, profLessons, profTasks, profStudents, profGradeCriteria, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, BookOpen, Users, Clock, MapPin, Video, FileText,
  GraduationCap, ClipboardList, Play, Eye, Calendar, CheckCircle,
  AlertCircle, Monitor, TrendingUp, Upload, Edit,
  AlertTriangle, Search, Settings,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ProfessorDisciplineDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const disc = profDisciplines.find(d => d.id === id);

  const initialTurma = searchParams.get("turma") || "all";
  const [selectedTurma, setSelectedTurma] = useState(initialTurma);

  const discLessons = profLessons.filter(l => l.disciplineId === id && (selectedTurma === "all" || l.turmaId === selectedTurma));
  const discTasks = profTasks.filter(t => t.disciplineId === id && (selectedTurma === "all" || t.turmaId === selectedTurma));
  const discStudents = profStudents.filter(s => s.disciplineId === id && (selectedTurma === "all" || s.turmaId === selectedTurma));
  const [studentSearch, setStudentSearch] = useState("");

  // Grade criteria state
  const existingCriteria = profGradeCriteria.find(c => c.disciplineId === id);
  const [criteria, setCriteria] = useState(existingCriteria?.criteria || [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]);

  if (!disc) return <div className="p-8 text-muted-foreground">Disciplina não encontrada.</div>;

  const publishPct = Math.round((disc.publishedLessons / disc.totalLessons) * 100);
  const avgAttendance = discStudents.length > 0
    ? Math.round(discStudents.reduce((s, st) => s + st.attendance, 0) / discStudents.length)
    : 0;
  const avgGrade = (() => {
    const withGrades = discStudents.filter(s => s.avgGrade !== null);
    return withGrades.length > 0
      ? Math.round(withGrades.reduce((s, st) => s + (st.avgGrade || 0), 0) / withGrades.length * 10) / 10
      : null;
  })();

  const statusConfig = {
    publicada: { label: "Publicada", color: "bg-accent/10 text-accent", icon: CheckCircle },
    agendada: { label: "Agendada", color: "bg-secondary/10 text-secondary", icon: Clock },
    rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Edit },
  };

  const taskStatusConfig = {
    publicada: { label: "Activa", color: "bg-secondary/10 text-secondary" },
    encerrada: { label: "Encerrada", color: "bg-accent/10 text-accent" },
    rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  };

  const filteredStudents = discStudents.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSaveCriteria = () => {
    toast({ title: "Critérios guardados!", description: "Os critérios de avaliação foram actualizados." });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/professor/disciplines" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às disciplinas
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${disc.color}12, ${disc.color}06)` }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.07]" style={{ background: disc.color, transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: disc.color, color: "white" }}>
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono" style={{ borderColor: disc.color + "40", color: disc.color }}>{disc.code}</Badge>
              {disc.turmas.map(t => (
                <Badge key={t.id} variant="outline" className="text-[10px]">{t.name}</Badge>
              ))}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{disc.name}</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">{disc.summary}</p>
          </div>
        </div>
      </div>

      {/* Turma selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Turma:</span>
        <button
          onClick={() => setSelectedTurma("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedTurma === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >Todas</button>
        {disc.turmas.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTurma(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedTurma === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >{t.name}</button>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{discStudents.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <Video className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aulas</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{discLessons.filter(l => l.status === "publicada").length}</span>
            <span className="text-sm text-muted-foreground">/{discLessons.length}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <TrendingUp className="w-4 h-4" />
            </div>
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{avgAttendance}%</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lessons" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "lessons", icon: Video, label: "Aulas" },
              { value: "materials", icon: FileText, label: "Conteúdos" },
              { value: "tasks", icon: ClipboardList, label: "Avaliações" },
              { value: "students", icon: Users, label: "Estudantes" },
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

        {/* ── Aulas ── */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{discLessons.filter(l => l.status === "publicada").length} publicadas, {discLessons.filter(l => l.status === "agendada").length} agendadas</p>
            <Button size="sm" className="gap-1.5">
              <Upload className="w-4 h-4" /> Nova Aula
            </Button>
          </div>
          <div className="space-y-3">
            {discLessons.map(lesson => {
              const cfg = statusConfig[lesson.status];
              const StatusIcon = cfg.icon;
              const turma = allTurmas.find(t => t.id === lesson.turmaId);
              return (
                <Card key={lesson.id} className="p-4 flex items-center gap-4 border-l-[3px]" style={{ borderLeftColor: lesson.status === "publicada" ? "hsl(var(--accent))" : lesson.status === "agendada" ? disc.color : "hsl(var(--muted))" }}>
                  <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: disc.color + "12", color: disc.color }}>#{lesson.number}</span>
                      <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lesson.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                      <span>{lesson.date}</span>
                      {turma && selectedTurma === "all" && <Badge variant="outline" className="text-[10px]">{turma.name}</Badge>}
                      {lesson.status === "publicada" && (
                        <>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{lesson.views}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lesson.attendance}/{lesson.totalStudents}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge className={`${cfg.color} gap-1 text-[10px]`}>
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Conteúdos ── */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{disc.totalMaterials} materiais carregados</p>
            <Button size="sm" className="gap-1.5">
              <Upload className="w-4 h-4" /> Carregar Material
            </Button>
          </div>
          {discLessons.filter(l => l.materials.length > 0).map(lesson => (
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
                      <p className="text-[10px] text-muted-foreground">{mat.type.toUpperCase()} • {mat.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* ── Avaliações ── */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{discTasks.length} avaliações</p>
            <Button size="sm" className="gap-1.5">
              <ClipboardList className="w-4 h-4" /> Nova Avaliação
            </Button>
          </div>
          <div className="space-y-3">
            {discTasks.map(task => {
              const tcfg = taskStatusConfig[task.status];
              const submPct = Math.round((task.submissions / task.totalStudents) * 100);
              return (
                <Card key={task.id} className="p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-shadow" style={{ borderLeftColor: disc.color }} onClick={() => navigate(`/professor/tasks/${task.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <Badge className={`${tcfg.color} text-[10px]`}>{tcfg.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {task.type === "tarefa" ? "Tarefa" : task.type === "quiz" ? "Quiz" : "Exame"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                      <p className="text-xs font-medium text-foreground">{task.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Entregas</p>
                      <p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Peso</p>
                      <p className="text-xs font-medium text-foreground">{task.weight}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                      <p className={`text-xs font-medium ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>
                        {task.avgGrade !== null ? `${task.avgGrade}/20` : "—"}
                      </p>
                    </div>
                  </div>
                  <Progress value={submPct} className="h-1.5 mt-3" />
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Estudantes ── */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar estudante..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente ({discStudents.filter(s => s.status === "excelente").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Normal ({discStudents.filter(s => s.status === "normal").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco ({discStudents.filter(s => s.status === "risco").length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {filteredStudents.map(student => {
              const statusColors = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
              const statusLabels = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
              const statusBadge = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };
              return (
                <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                      <Badge className={`${statusBadge[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{student.email} • {student.turma}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                      <p className={`text-sm font-bold ${student.attendance >= 75 ? "text-accent" : "text-destructive"}`}>{student.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                      <p className={`text-sm font-bold ${student.avgGrade && student.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{student.avgGrade ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Entregas</p>
                      <p className="text-sm font-bold text-foreground">{student.submittedTasks}/{student.totalTasks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Última</p>
                      <p className="text-xs text-muted-foreground">{student.lastActive}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Critério ── */}
        <TabsContent value="criteria" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-primary" /> Critérios de Classificação
            </h2>
            <p className="text-sm text-muted-foreground">Defina os intervalos de nota para cada nível de desempenho nesta disciplina.</p>
          </div>

          <Card className="p-6 space-y-4">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Input
                      value={c.label}
                      onChange={e => {
                        const updated = [...criteria];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setCriteria(updated);
                      }}
                      className="max-w-[200px] h-9 text-sm font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">Nota mínima:</span>
                    <Input
                      type="number"
                      value={c.minGrade}
                      onChange={e => {
                        const updated = [...criteria];
                        updated[i] = { ...updated[i], minGrade: Number(e.target.value) };
                        setCriteria(updated);
                      }}
                      className="w-20 h-9 text-sm font-bold text-center"
                      min="0"
                      max="20"
                    />
                    <span className="text-xs text-muted-foreground">/20 valores</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {i === 0
                      ? `Nota ≥ ${c.minGrade}`
                      : i === criteria.length - 1
                        ? `Nota < ${criteria[i - 1].minGrade}`
                        : `${c.minGrade} ≤ Nota < ${criteria[i - 1].minGrade}`
                    }
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Estudantes</p>
                  <p className="text-lg font-bold text-foreground">
                    {discStudents.filter(s => {
                      if (s.avgGrade === null) return false;
                      if (i === 0) return s.avgGrade >= c.minGrade;
                      if (i === criteria.length - 1) return s.avgGrade < criteria[i - 1].minGrade;
                      return s.avgGrade >= c.minGrade && s.avgGrade < criteria[i - 1].minGrade;
                    }).length}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveCriteria} className="gap-2">
              <CheckCircle className="w-4 h-4" /> Guardar Critérios
            </Button>
          </div>

          {/* Distribution preview */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição Actual</h3>
            <div className="space-y-3">
              {criteria.map((c, i) => {
                const count = discStudents.filter(s => {
                  if (s.avgGrade === null) return false;
                  if (i === 0) return s.avgGrade >= c.minGrade;
                  if (i === criteria.length - 1) return s.avgGrade < criteria[i - 1].minGrade;
                  return s.avgGrade >= c.minGrade && s.avgGrade < criteria[i - 1].minGrade;
                }).length;
                const pct = discStudents.length > 0 ? Math.round((count / discStudents.length) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium text-foreground w-24">{c.label}</span>
                    <div className="flex-1">
                      <div className="h-6 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color, opacity: 0.7 }} />
                      </div>
                    </div>
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
