import { useParams, useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, profStudents } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ClipboardList, BookOpen, FolderKanban, Calendar, Users,
  CheckCircle, Clock, Download, AlertCircle, FileText, MapPin, Eye,
  Save, Send, FileCheck, Check, RotateCcw
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const typeLabel: Record<string, string> = { tarefa: "Tarefa", quiz: "Quiz", exame: "Exame" };
const typeIcon: Record<string, React.ElementType> = { tarefa: BookOpen, quiz: FolderKanban, exame: ClipboardList };

export default function ProfessorTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const task = profTasks.find(t => t.id === taskId);

  if (!task) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Tarefa não encontrada.</p>
      </div>
    );
  }

  const disc = profDisciplines.find(d => d.id === task.disciplineId);
  const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
  const correctedPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
  const pendingCorrection = task.submissions - task.corrected;
  const isEncerrada = task.status === "encerrada";
  const isActiva = task.status === "publicada";

  const students = profStudents.filter(s => s.disciplineId === task.disciplineId);
  const mockSubmissions = students.map((s, i) => ({
    ...s,
    submitted: i < task.submissions,
    corrected: i < task.corrected,
    grade: i < task.corrected ? Math.round(((task.avgGrade || 12) + (Math.random() * 4 - 2)) * 10) / 10 : null,
    submittedDate: i < task.submissions ? task.dueDate : null,
    submittedTime: i < task.submissions ? `${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}` : null,
    fileName: i < task.submissions ? `${s.name.split(" ")[0]}_${task.title.replace(/\s+/g, "_").substring(0, 20)}.pdf` : null,
  }));

  const extraNotSubmitted = [
    { id: "ps_extra1", name: "Tiago Almeida", email: "3088@upra.kor", turma: "2º Ano Informática", disciplineId: task.disciplineId, attendance: 60, avgGrade: 9.0, submittedTasks: 1, totalTasks: 4, lastActive: "5 dias", status: "risco" as const, submitted: false, corrected: false, grade: null, submittedDate: null, submittedTime: null, fileName: null, turmaId: "" },
    { id: "ps_extra2", name: "Inês Cardoso", email: "3099@upra.kor", turma: "2º Ano Informática", disciplineId: task.disciplineId, attendance: 70, avgGrade: 10.5, submittedTasks: 2, totalTasks: 4, lastActive: "3 dias", status: "normal" as const, submitted: false, corrected: false, grade: null, submittedDate: null, submittedTime: null, fileName: null, turmaId: "" },
  ];

  const allSubmissions = [...mockSubmissions, ...extraNotSubmitted];
  const submittedList = allSubmissions.filter(s => s.submitted);
  const notSubmittedList = allSubmissions.filter(s => !s.submitted);

  // Calculate approval rate
  const computedGrades = allSubmissions.map(s => {
    if (s.grade !== null) return s.grade;
    if (isEncerrada) return 0;
    return null;
  }).filter((g): g is number => g !== null);
  
  const positiveGrades = computedGrades.filter(g => g >= 10).length;
  const totalGraded = computedGrades.length;
  const approvalRate = totalGraded > 0 ? Math.round((positiveGrades / totalGraded) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
          <span className="text-xs font-medium" style={{ color: disc?.color }}>{disc?.name}</span>
          <Badge variant="outline" className="text-[10px]">{disc?.code}</Badge>
          <Badge variant="outline" className="text-[10px]">{typeLabel[task.type]}</Badge>
          <Badge className={task.status === "encerrada" ? "bg-accent/10 text-accent" : task.status === "publicada" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
            {task.status === "encerrada" ? "Encerrada" : task.status === "publicada" ? "Activa" : "Rascunho"}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
        <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Prazo: <span className="font-semibold text-foreground">{task.dueDate}</span></span>
          <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Peso: <span className="font-semibold text-foreground">{task.weight}%</span></span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Presencial</span>
        </div>
      </div>

      {/* Submission & Grading KPIs */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header: Submissão e Notas */}
        <div className="px-5 py-3 border-b bg-muted/20">
          <h3 className="text-sm font-semibold text-foreground">Submissão e Notas</h3>
        </div>

        {/* Submetido & Corrigido bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /> Submetido</span>
              <span className="font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
            </div>
            <Progress value={submissionPct} className="h-2" />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`flex items-center gap-2 ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}><AlertCircle className="w-4 h-4" /> Corrigido</span>
              <span className={`font-semibold ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}>{task.corrected}/{task.submissions} ({correctedPct}%)</span>
            </div>
            <Progress value={correctedPct} className={`h-2 ${pendingCorrection > 0 ? "[&>div]:bg-destructive" : ""}`} />
            {isActiva && task.correctionDeadline && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Prazo de correcção: <span className="font-medium text-foreground">{task.correctionDeadline}</span></p>
            )}
          </div>
        </div>

        {/* Média, Taxa Aprovação, Taxa Reprovação */}
        {task.avgGrade !== null && (
          <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Média</p>
              <p className={`text-xl font-bold mt-1 ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Taxa Aprovação</p>
              <p className={`text-xl font-bold mt-1 ${approvalRate >= 50 ? "text-accent" : "text-destructive"}`}>{approvalRate}%</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Taxa Reprovação</p>
              <p className={`text-xl font-bold mt-1 ${(100 - approvalRate) > 50 ? "text-destructive" : "text-foreground"}`}>{100 - approvalRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        </div>
        <div className="border-t pt-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ficheiro Anexo</h4>
          <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30">
            <FileText className="w-3.5 h-3.5 text-destructive/60" />
            <div>
              <p className="text-xs font-medium text-foreground leading-tight">Guia da Tarefa.pdf</p>
              <p className="text-[10px] text-muted-foreground">PDF · 580 KB</p>
            </div>
            <button className="p-1 rounded hover:bg-muted/60 transition"><Eye className="w-3 h-3 text-muted-foreground" /></button>
            <button className="p-1 rounded hover:bg-muted/60 transition"><Download className="w-3 h-3 text-muted-foreground" /></button>
          </div>
        </div>
      </Card>

      {/* Submissions & Grading */}
      <GradingTable
        submittedList={submittedList}
        notSubmittedList={notSubmittedList}
        task={task}
        submissionPct={submissionPct}
        isEncerrada={isEncerrada}
        isActiva={isActiva}
        navigate={navigate}
      />
    </div>
  );
}

function GradingTable({ submittedList, notSubmittedList, task, submissionPct, isEncerrada, isActiva, navigate }: {
  submittedList: any[];
  notSubmittedList: any[];
  task: any;
  submissionPct: number;
  isEncerrada: boolean;
  isActiva: boolean;
  navigate: any;
}) {
  const { toast } = useToast();
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    submittedList.forEach(s => {
      if (s.grade !== null) initial[s.id] = String(s.grade);
    });
    if (isEncerrada) {
      notSubmittedList.forEach(s => { initial[s.id] = "0"; });
    }
    return initial;
  });

  const [atribuirGrade, setAtribuirGrade] = useState("");
  const [atribuirStudent, setAtribuirStudent] = useState<any>(null);
  const [atribuidos, setAtribuidos] = useState<Set<string>>(new Set());
  const handleGradeChange = (studentId: string, value: string) => {
    if (isEncerrada) return;
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrades = () => {
    toast({ title: "Notas guardadas!", description: "As notas foram actualizadas com sucesso." });
  };

  const confirmAtribuir = () => {
    if (!atribuirStudent || !atribuirGrade) return;
    const gradeNum = Number(atribuirGrade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      toast({ title: "Nota inválida", description: "Introduza um valor entre 0 e 20.", variant: "destructive" });
      return;
    }
    setGrades(prev => ({ ...prev, [atribuirStudent.id]: atribuirGrade }));
    setAtribuidos(prev => new Set(prev).add(atribuirStudent.id));
    toast({ title: "Nota atribuída!", description: `${atribuirStudent.name} recebeu ${atribuirGrade}/20.` });
    setAtribuirStudent(null);
    setAtribuirGrade("");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Submissões e Notas</h3>
            <Badge variant="outline" className="text-xs gap-1">
              <Users className="w-3 h-3" />
              {task.submissions}/{task.totalStudents} ({submissionPct}%)
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs"><Download className="w-3.5 h-3.5" /> Exportar</Button>
            {!isEncerrada && (
              <Button size="sm" className="gap-2 text-xs" onClick={handleSaveGrades}><Save className="w-3.5 h-3.5" /> Guardar Notas</Button>
            )}
          </div>
        </div>

        {/* Submitted students */}
        {submittedList.length > 0 && (
          <div>
            <div className="px-5 py-2.5 bg-muted/20 border-b">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3 h-3" /> Submetido ({submittedList.length})
              </p>
            </div>
            <div className="divide-y">
              {submittedList.map(student => {
                const isGraded = student.corrected || atribuidos.has(student.id);
                const gradeVal = grades[student.id];
                return (
                  <div key={student.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/professor/students/${student.id}`); }}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 hover:bg-primary/20 transition-colors"
                      title="Ver perfil"
                    >
                      {student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/professor/students/${student.id}`); }}
                        className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors text-left"
                      >
                        {student.name}
                      </button>
                      <p className="text-[11px] text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {student.submittedDate} · {student.submittedTime}
                    </div>
                    {student.fileName && (
                      <div className="flex items-center gap-1.5 rounded border px-2 py-1 bg-muted/20 shrink-0">
                        <FileText className="w-3 h-3 text-destructive/60" />
                        <span className="text-[11px] font-medium text-foreground max-w-[100px] truncate">{student.fileName}</span>
                        <button className="p-0.5 rounded hover:bg-muted/50 transition"><Eye className="w-3 h-3 text-muted-foreground" /></button>
                      </div>
                    )}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isEncerrada ? (
                        <span className={`text-sm font-bold w-14 text-right ${Number(gradeVal || 0) >= 10 ? "text-accent" : "text-destructive"}`}>
                          {gradeVal || "—"}/20
                        </span>
                      ) : isGraded ? (
                        <span className="text-sm font-bold text-muted-foreground w-14 text-right">{gradeVal || "—"}/20</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number" min="0" max="20" step="0.5"
                              value={gradeVal || ""}
                              onChange={e => handleGradeChange(student.id, e.target.value)}
                              className="w-14 h-7 text-center text-xs font-bold"
                              placeholder="—"
                            />
                            <span className="text-[11px] text-muted-foreground">/20</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`text-xs gap-1.5 h-7 w-full mt-2 transition-all border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground ${!gradeVal ? "opacity-40 pointer-events-none" : ""}`}
                            disabled={!gradeVal}
                            onClick={() => {
                              setAtribuirStudent(student);
                              setAtribuirGrade(gradeVal);
                            }}
                          >
                            Atribuir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Not submitted students */}
        {notSubmittedList.length > 0 && (
          <div>
            <div className="px-5 py-2.5 bg-destructive/5 border-y">
              <p className="text-[11px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Não submetido ({notSubmittedList.length})
              </p>
            </div>
            <div className="divide-y">
              {notSubmittedList.map(student => {
                const wasAtribuido = atribuidos.has(student.id);
                return (
                  <div key={student.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/professor/students/${student.id}`); }}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 hover:bg-muted/80 transition-colors"
                      title="Ver perfil"
                    >
                      {student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/professor/students/${student.id}`); }}
                        className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors text-left"
                      >
                        {student.name}
                      </button>
                      <p className="text-[11px] text-muted-foreground">{student.email}</p>
                    </div>
                    <span className="text-sm font-bold text-destructive w-14 text-right shrink-0">0/20</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Atribuir confirmation dialog */}
      <Dialog open={!!atribuirStudent} onOpenChange={() => setAtribuirStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Nota</DialogTitle>
            <DialogDescription>
              Confirma a atribuição da nota <span className="font-bold text-foreground">{atribuirGrade}/20</span> ao estudante <span className="font-semibold text-foreground">{atribuirStudent?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
              {atribuirStudent?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{atribuirStudent?.name}</p>
              <p className="text-xs text-muted-foreground">{atribuirStudent?.email}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-bold text-foreground">{atribuirGrade}</span>
              <span className="text-xs text-muted-foreground">/20 valores</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAtribuirStudent(null)}>Cancelar</Button>
            <Button onClick={confirmAtribuir} disabled={!atribuirGrade} className="gap-1.5">
              <CheckCircle className="w-4 h-4" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
