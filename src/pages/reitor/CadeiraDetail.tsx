import { useParams, Link, useNavigate } from "react-router-dom";
import { reitorFaculties, reitorEstudantesDetail } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, BookOpen, Users, Clock, MapPin, Video, FileText,
  GraduationCap, ClipboardList, Play, Eye, Calendar, CheckCircle,
  TrendingUp, Edit, Search, FolderOpen, Award,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

function generateTurmas(courseId: string, years: number, estudantes: number) {
  const turmas: { id: string; name: string; year: number; estudantes: number; disciplinas: number; media: number; presenca: number; }[] = [];
  for (let y = 1; y <= years; y++) {
    const count = y <= 2 ? 2 : 1;
    for (let t = 0; t < count; t++) {
      const letter = String.fromCharCode(65 + t);
      const seed = (courseId + y + letter).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      turmas.push({
        id: `${courseId}-y${y}t${letter}`,
        name: `Turma ${letter}`,
        year: y,
        estudantes: Math.floor(estudantes / (years * count) + (seed % 10) - 5),
        disciplinas: 4 + (seed % 4),
        media: +(10 + (seed % 60) / 10).toFixed(1),
        presenca: 72 + (seed % 20),
      });
    }
  }
  return turmas;
}

function generateCadeiras(turmaId: string, turma: { estudantes: number; year: number }) {
  const cadeiras = [
    { name: "Matemática I", code: "MAT101", professor: "Prof. João Silva", diasAula: "Seg, Qua, Sex", location: "Sala 101" },
    { name: "Física Aplicada", code: "FIS101", professor: "Prof. Ana Costa", diasAula: "Ter, Qui", location: "Lab F1" },
    { name: "Desenho Técnico", code: "DTE101", professor: "Prof. Carlos Mendes", diasAula: "Seg, Qua", location: "Atelier A2" },
    { name: "Programação", code: "PRG101", professor: "Prof. Rita Lopes", diasAula: "Ter, Qui, Sex", location: "Lab I3" },
    { name: "Química Geral", code: "QUI101", professor: "Prof. Marta Reis", diasAula: "Seg, Qui", location: "Lab Q1" },
  ];
  return cadeiras.map((c, i) => {
    const seed = (turmaId + i).split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
    return {
      id: `${turmaId}-cad${i + 1}`,
      ...c,
      year: turma.year,
      estudantes: turma.estudantes,
      media: +(10 + (seed % 60) / 10).toFixed(1),
      presenca: 72 + (seed % 20),
      taxaEntrega: 70 + (seed % 25),
      taxaAprovacao: 65 + (seed % 30),
      status: i < 3 ? "normal" as const : i === 3 ? "excelente" as const : "risco" as const,
    };
  });
}

function generateLessons(cadeiraCode: string) {
  return Array.from({ length: 4 }, (_, i) => {
    const seed = (cadeiraCode + i).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    return {
      id: `${cadeiraCode}-l${i + 1}`,
      number: i + 1,
      title: `Aula ${i + 1}`,
      date: `${String(5 + i * 3).padStart(2, "0")}/02/2024`,
      duration: "1h 30min",
      status: i < 3 ? "publicada" as const : "agendada" as const,
      views: 15 + (seed % 20),
      summary: `Conteúdo da aula ${i + 1}.`,
      attendance: 25 + (seed % 10),
      totalStudents: 34,
      materials: [{ name: `Slides Aula ${i + 1}`, type: "pdf", size: "2.1 MB" }, { name: `Exercícios ${i + 1}`, type: "pdf", size: "350 KB" }],
    };
  });
}

function generateTasks(cadeiraName: string) {
  return [
    { id: `${cadeiraName}-t1`, title: "Exercícios Práticos", description: "Resolver exercícios do capítulo 3.", type: "tarefa" as const, dueDate: "10/02/2024", status: "encerrada" as const, submissions: 28, totalStudents: 34, avgGrade: 12.8, weight: 15 },
    { id: `${cadeiraName}-t2`, title: "Teste Intermédio", description: "Teste sobre os primeiros 4 capítulos.", type: "exame" as const, dueDate: "14/02/2024", status: "encerrada" as const, submissions: 34, totalStudents: 34, avgGrade: 13.2, weight: 30 },
    { id: `${cadeiraName}-t3`, title: "Quiz Rápido", description: "Quiz sobre matéria recente.", type: "quiz" as const, dueDate: "20/02/2024", status: "publicada" as const, submissions: 30, totalStudents: 34, avgGrade: 11.5, weight: 10 },
  ];
}

export default function ReitorCadeiraDetail() {
  const { faculdadeId, cursoId, turmaId, cadeiraId } = useParams();
  const navigate = useNavigate();
  const fac = reitorFaculties.find(f => f.id === faculdadeId);
  const course = fac?.courses.find(c => c.id === cursoId);
  const turmas = useMemo(() => course ? generateTurmas(course.id, course.years, course.estudantes) : [], [course?.id]);
  const turma = turmas.find(t => t.id === turmaId);

  const cadeiras = useMemo(() => turma ? generateCadeiras(turma.id, turma) : [], [turma?.id]);
  const cadeira = cadeiras.find(c => c.id === cadeiraId);

  const [studentSearch, setStudentSearch] = useState("");

  const turmaLetter = turma?.name.replace("Turma ", "") || "";
  const estudantes = turma && course ? reitorEstudantesDetail.filter(e => e.course === course.name && e.year === turma.year && e.turma === turmaLetter) : [];
  const filteredStudents = estudantes.filter(e => e.name.toLowerCase().includes(studentSearch.toLowerCase()));

  const lessons = useMemo(() => cadeira ? generateLessons(cadeira.code) : [], [cadeira?.code]);
  const tasks = useMemo(() => cadeira ? generateTasks(cadeira.name) : [], [cadeira?.name]);

  const conteudos = lessons.filter(l => l.status === "publicada").flatMap(l =>
    l.materials.map(m => ({ ...m, lessonTitle: l.title, lessonNumber: l.number, date: l.date }))
  );

  if (!fac || !course || !turma || !cadeira) return (
    <div className="p-8 text-muted-foreground">
      <Link to={turma && course && fac ? `/reitor/faculdades/${faculdadeId}/cursos/${cursoId}/turma/${turmaId}` : "/reitor/faculdades"} className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Cadeira não encontrada.</p>
    </div>
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
      <Link to={`/reitor/faculdades/${faculdadeId}/cursos/${cursoId}/turma/${turmaId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar à {turma.name}
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
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
                <BookOpen className="w-3 h-3" /> {course.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {turma.year}º Ano · {turma.name} · {fac.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <MapPin className="w-3 h-3" /> {cadeira.location}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: "Estudantes", value: cadeira.estudantes, color: "" },
            { icon: Calendar, label: "Dias de Aula", value: cadeira.diasAula, color: "" },
            { icon: CheckCircle, label: "Presença", value: `${cadeira.presenca}%`, color: cadeira.presenca >= 75 ? "text-accent" : "text-destructive" },
            { icon: ClipboardList, label: "Taxa Entrega", value: `${cadeira.taxaEntrega}%`, color: cadeira.taxaEntrega >= 80 ? "text-accent" : "text-destructive" },
            { icon: TrendingUp, label: "Média Geral", value: `${cadeira.media}/20`, color: cadeira.media >= 10 ? "text-accent" : "text-destructive" },
          ].map(kpi => (
            <div key={kpi.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color || "text-foreground"}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
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
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-2">
                <tab.icon className="w-4 h-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
              <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer ${statusColors[student.status]}`} onClick={() => navigate(`/reitor/estudantes/${student.id}`)}>
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

        {/* Aulas */}
        <TabsContent value="lessons" className="space-y-4">
          <p className="text-sm text-muted-foreground">{lessons.filter(l => l.status === "publicada").length} publicadas de {lessons.length} aulas</p>
          <div className="space-y-3">
            {lessons.map(lesson => {
              const cfg = lessonStatusConfig[lesson.status];
              const StatusIcon = cfg.icon;
              return (
                <Card key={lesson.id} className="p-4 border-l-[3px] hover:shadow-md transition-shadow" style={{ borderLeftColor: lesson.status === "publicada" ? "hsl(var(--accent))" : "hsl(var(--muted))" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-muted-foreground/60" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{lesson.number}</span>
                        <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                      </div>
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
            const tarefas = tasks.filter(t => t.type === "tarefa");
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
            const avaliacoes = tasks.filter(t => t.type === "exame" || t.type === "quiz");
            return avaliacoes.length > 0 ? (
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
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        <div><p className="text-[10px] text-muted-foreground uppercase">Data</p><p className="text-xs font-medium text-foreground">{task.dueDate}</p></div>
                        <div><p className="text-[10px] text-muted-foreground uppercase">Entregas</p><p className="text-xs font-medium text-foreground">{task.submissions}/{task.totalStudents} ({submPct}%)</p></div>
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
      </Tabs>
    </div>
  );
}
