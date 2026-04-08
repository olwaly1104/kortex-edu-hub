import { useParams, Link, useNavigate } from "react-router-dom";
import { decanoTurmas, decanoFaculty, decanoEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, GraduationCap, Users, BookOpen, CheckCircle, Search,
  TrendingUp, Calendar, Video, Clock, Play, Eye, FileText, MapPin,
  ClipboardList, Edit, Settings, Download, AlertCircle, FolderOpen, Award,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

// Generate mock lessons for any turma
function generateLessons(turmaId: string, turma: { estudantes: number; name: string }) {
  const disciplines = ["Matemática I", "Física Aplicada", "Desenho Técnico", "Programação", "Química Geral"];
  const codes = ["MAT101", "FIS101", "DTE101", "PRG101", "QUI101"];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${turmaId}-l${i + 1}`,
    turmaId,
    number: i + 1,
    title: `Aula ${i + 1} — ${disciplines[i % disciplines.length]}`,
    discipline: disciplines[i % disciplines.length],
    disciplineCode: codes[i % codes.length],
    date: `${String(5 + i * 3).padStart(2, "0")}/02/2024`,
    duration: "1h 30min",
    status: i < 4 ? "publicada" as const : "agendada" as const,
    views: Math.floor(Math.random() * 20 + 15),
    summary: `Conteúdo da aula ${i + 1} de ${disciplines[i % disciplines.length]}.`,
    materials: [{ name: `Slides Aula ${i + 1}`, type: "pdf", size: "2.1 MB" }, { name: `Exercícios ${i + 1}`, type: "pdf", size: "350 KB" }],
    attendance: Math.floor(turma.estudantes * 0.85 + Math.random() * turma.estudantes * 0.1),
    totalStudents: turma.estudantes,
  }));
}

function generateTasks(turmaId: string, turma: { estudantes: number }) {
  return [
    { id: `${turmaId}-t1`, turmaId, title: "Exercícios de Cálculo", description: "Resolver 15 exercícios de limites e derivadas.", discipline: "Matemática I", dueDate: "10/02/2024", dueTime: "23:59", assignedDate: "05/02/2024", type: "tarefa" as const, status: "encerrada" as const, submissions: Math.floor(turma.estudantes * 0.88), totalStudents: turma.estudantes, avgGrade: 12.8, weight: 15, corrected: Math.floor(turma.estudantes * 0.88) },
    { id: `${turmaId}-t2`, turmaId, title: "Relatório de Laboratório", description: "Relatório da experiência de física.", discipline: "Física Aplicada", dueDate: "18/02/2024", dueTime: "23:59", assignedDate: "08/02/2024", type: "tarefa" as const, status: "publicada" as const, submissions: Math.floor(turma.estudantes * 0.72), totalStudents: turma.estudantes, avgGrade: null, weight: 10, corrected: 0 },
    { id: `${turmaId}-t3`, turmaId, title: "Teste 1 — Matemática", description: "Teste sobre limites e continuidade.", discipline: "Matemática I", dueDate: "14/02/2024", dueTime: "09:00", assignedDate: "01/02/2024", type: "exame" as const, status: "encerrada" as const, submissions: turma.estudantes, totalStudents: turma.estudantes, avgGrade: 13.2, weight: 30, corrected: turma.estudantes },
    { id: `${turmaId}-t4`, turmaId, title: "Quiz — Física", description: "Quiz rápido sobre mecânica.", discipline: "Física Aplicada", dueDate: "20/02/2024", dueTime: "14:00", assignedDate: "15/02/2024", type: "quiz" as const, status: "publicada" as const, submissions: Math.floor(turma.estudantes * 0.9), totalStudents: turma.estudantes, avgGrade: 11.5, weight: 10, corrected: Math.floor(turma.estudantes * 0.9) },
  ];
}

function generateResources(turmaId: string) {
  return [
    { id: `${turmaId}-r1`, turmaId, name: "Manual de Cálculo I", discipline: "Matemática I", type: "pdf" as const, size: "5.2 MB", uploadDate: "03/02/2024", downloads: 32 },
    { id: `${turmaId}-r2`, turmaId, name: "Guia de Laboratório", discipline: "Física Aplicada", type: "pdf" as const, size: "1.8 MB", uploadDate: "04/02/2024", downloads: 28 },
    { id: `${turmaId}-r3`, turmaId, name: "Folha de Fórmulas", discipline: "Matemática I", type: "pdf" as const, size: "450 KB", uploadDate: "05/02/2024", downloads: 35 },
  ];
}

function generateCalendar(turmaId: string) {
  return [
    { id: `${turmaId}-ev1`, turmaId, title: "Teste 1 — Matemática", date: "14/02/2024", type: "exame" as const, description: "Teste sobre limites e continuidade. Sala 101, 09:00." },
    { id: `${turmaId}-ev2`, turmaId, title: "Entrega — Relatório de Lab", date: "18/02/2024", type: "entrega" as const, description: "Prazo final para entrega do relatório." },
    { id: `${turmaId}-ev3`, turmaId, title: "Carnaval — Feriado", date: "13/02/2024", type: "feriado" as const, description: "Sem aulas." },
    { id: `${turmaId}-ev4`, turmaId, title: "Seminário de Engenharia", date: "25/02/2024", type: "evento" as const, description: "Seminário aberto sobre inovação." },
  ];
}

function generateCadeiras(turmaId: string, turma: { estudantes: number; year: number }) {
  const cadeiras = [
    { name: "Matemática I", code: "MAT101", professor: "Prof. João Silva", diasAula: "Seg, Qua, Sex", location: "Sala 101" },
    { name: "Física Aplicada", code: "FIS101", professor: "Prof. Ana Costa", diasAula: "Ter, Qui", location: "Lab F1" },
    { name: "Desenho Técnico", code: "DTE101", professor: "Prof. Carlos Mendes", diasAula: "Seg, Qua", location: "Atelier A2" },
    { name: "Programação", code: "PRG101", professor: "Prof. Rita Lopes", diasAula: "Ter, Qui, Sex", location: "Lab I3" },
    { name: "Química Geral", code: "QUI101", professor: "Prof. Marta Reis", diasAula: "Seg, Qui", location: "Lab Q1" },
  ];
  return cadeiras.map((c, i) => ({
    id: `${turmaId}-cad${i + 1}`,
    ...c,
    year: turma.year,
    estudantes: turma.estudantes,
    media: +(10 + Math.random() * 6).toFixed(1),
    presenca: Math.floor(72 + Math.random() * 20),
    taxaEntrega: Math.floor(70 + Math.random() * 25),
    taxaAprovacao: Math.floor(65 + Math.random() * 30),
    status: i < 3 ? "normal" as const : i === 3 ? "excelente" as const : "risco" as const,
  }));
}

export default function DecanoTurmaDetail() {
  const { cursoId, turmaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const turma = decanoTurmas.find(t => t.id === turmaId);
  const course = decanoFaculty.courses.find(c => c.id === cursoId);

  const turmaLetter = turma?.name.replace("Turma ", "") || "";
  const estudantes = turma && course ? decanoEstudantes.filter(e => e.course === course.name && e.year === turma.year && e.turma === turmaLetter) : [];
  const lessons = useMemo(() => turma ? generateLessons(turma.id, turma) : [], [turma?.id]);
  const tasks = useMemo(() => turma ? generateTasks(turma.id, turma) : [], [turma?.id]);
  const resources = useMemo(() => turma ? generateResources(turma.id) : [], [turma?.id]);
  const calendar = useMemo(() => turma ? generateCalendar(turma.id) : [], [turma?.id]);
  const cadeiras = useMemo(() => turma ? generateCadeiras(turma.id, turma) : [], [turma?.id]);

  const [studentSearch, setStudentSearch] = useState("");
  const [criteria, setCriteria] = useState([
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]);

  if (!turma || !course) return (
    <div className="p-8 text-muted-foreground">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <p className="mt-4">Turma não encontrada.</p>
    </div>
  );

  const conteudos = lessons.filter(l => l.status === "publicada").flatMap(l =>
    l.materials.map(m => ({ ...m, lessonId: l.id, lessonTitle: l.title, lessonNumber: l.number, date: l.date, discipline: l.discipline, disciplineCode: l.disciplineCode }))
  );

  const avaliacoes = tasks.filter(t => t.type === "exame" || t.type === "quiz");
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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/decano/cursos/${cursoId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {course.name}
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
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
                <BookOpen className="w-3 h-3" /> {course.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> {turma.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {turma.year}º Ano · {decanoFaculty.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p><p className="text-sm font-bold text-foreground">{turma.estudantes}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5 text-primary" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p><p className={`text-sm font-bold ${turma.media >= 10 ? "text-accent" : "text-destructive"}`}>{turma.media}/20</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p><p className={`text-sm font-bold ${turma.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{turma.presenca}%</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0"><ClipboardList className="w-3.5 h-3.5 text-secondary" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Entrega</p><p className={`text-sm font-bold ${turma.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{turma.taxaEntrega}%</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-accent" /></div>
            <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Aprovado</p><p className={`text-sm font-bold ${turma.taxaSucesso >= 70 ? "text-accent" : "text-destructive"}`}>{turma.taxaSucesso}%</p></div>
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
              { value: "calendar", icon: Calendar, label: "Calendário" },
              { value: "criteria", icon: Settings, label: "Critério" },
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente ({estudantes.filter(s => s.status === "excelente").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Normal ({estudantes.filter(s => s.status === "normal").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco ({estudantes.filter(s => s.status === "risco").length})</span>
            </div>
          </div>
          <div className="space-y-2">
            {filteredStudents.map(student => (
              <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => navigate(`/decano/estudantes/${student.id}`)}>
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
          <p className="text-sm text-muted-foreground">{lessons.filter(l => l.status === "publicada").length} publicadas, {lessons.filter(l => l.status === "agendada").length} agendadas</p>
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
                        <Badge variant="outline" className="text-[10px] font-mono">{lesson.disciplineCode}</Badge>
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
              );
            })}
          </div>
        </TabsContent>

        {/* Conteúdos */}
        <TabsContent value="conteudos" className="space-y-5">
          <p className="text-sm text-muted-foreground">{conteudos.length} conteúdos disponíveis</p>
          {lessons.filter(l => l.status === "publicada").map(lesson => {
            const lessonConteudos = conteudos.filter(c => c.lessonId === lesson.id);
            if (lessonConteudos.length === 0) return null;
            return (
              <Card key={lesson.id} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Video className="w-4 h-4 text-primary" /></div>
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
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.type.toUpperCase()} • {c.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="shrink-0"><Download className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tasks" className="space-y-4">
          <p className="text-sm text-muted-foreground">{tasks.filter(t => t.type === "tarefa").length} tarefas</p>
          <div className="space-y-3">
            {tasks.filter(t => t.type === "tarefa").map(task => {
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
          </div>
        </TabsContent>

        {/* Avaliações */}
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
          </div>
        </TabsContent>

        {/* Recursos */}
        <TabsContent value="resources" className="space-y-4">
          <p className="text-sm text-muted-foreground">{resources.length} recursos disponíveis</p>
          <div className="space-y-2">
            {resources.map(res => (
              <Card key={res.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{res.name}</p>
                  <p className="text-[11px] text-muted-foreground">{res.type.toUpperCase()} • {res.size} • {res.discipline} • {res.uploadDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Download className="w-3 h-3" />{res.downloads}</span>
                  <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendário */}
        <TabsContent value="calendar" className="space-y-4">
          <p className="text-sm text-muted-foreground">{calendar.length} datas importantes</p>
          <div className="space-y-2">
            {calendar.map(ev => (
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
          </div>
        </TabsContent>

        {/* Critério */}
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
            <Button onClick={() => toast({ title: "Critérios guardados!", description: "Os critérios de avaliação foram actualizados." })} className="gap-2"><CheckCircle className="w-4 h-4" /> Guardar Critérios</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
