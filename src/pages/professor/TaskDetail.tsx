import { useParams, useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, profStudents } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ClipboardList, BookOpen, FolderKanban, Calendar, Users,
  CheckCircle, Clock, Download, AlertCircle, FileText, MapPin, Eye,
  MessageCircle, Mail, Save,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const TypeIcon = typeIcon[task.type] || BookOpen;
  const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
  const isEncerrada = task.status === "encerrada";
  const isActiva = task.status === "publicada";

  // Mock student submissions
  const students = profStudents.filter(s => s.disciplineId === task.disciplineId);
  const mockSubmissions = students.map((s, i) => ({
    ...s,
    submitted: i < task.submissions,
    grade: task.avgGrade !== null ? Math.round((task.avgGrade + (Math.random() * 4 - 2)) * 10) / 10 : null,
    submittedDate: i < task.submissions ? task.dueDate : null,
    submittedTime: i < task.submissions ? `${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}` : null,
    fileName: i < task.submissions ? `${s.name.split(" ")[0]}_${task.title.replace(/\s+/g, "_").substring(0, 20)}.pdf` : null,
  }));

  const extraNotSubmitted = [
    { id: "ps_extra1", name: "Tiago Almeida", email: "3088@upra.kor", turma: "2º Ano Informática", disciplineId: task.disciplineId, attendance: 60, avgGrade: 9.0, submittedTasks: 1, totalTasks: 4, lastActive: "5 dias", status: "risco" as const, submitted: false, grade: null, submittedDate: null, submittedTime: null, fileName: null, turmaId: "" },
    { id: "ps_extra2", name: "Inês Cardoso", email: "3099@upra.kor", turma: "2º Ano Informática", disciplineId: task.disciplineId, attendance: 70, avgGrade: 10.5, submittedTasks: 2, totalTasks: 4, lastActive: "3 dias", status: "normal" as const, submitted: false, grade: null, submittedDate: null, submittedTime: null, fileName: null, turmaId: "" },
  ];

  const allSubmissions = [...mockSubmissions, ...extraNotSubmitted];
  const submittedList = allSubmissions.filter(s => s.submitted);
  const notSubmittedList = allSubmissions.filter(s => !s.submitted);

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
          {isActiva && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px]">
              <AlertCircle className="w-3 h-3" /> Por atribuir
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>

        <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Prazo: <span className="font-semibold text-foreground">{task.dueDate}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" />
            Média: <span className={`font-semibold ${task.avgGrade !== null ? (task.avgGrade >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>
              {task.avgGrade !== null ? `${task.avgGrade}/20` : "Pendente"}
            </span>
            <span className="text-xs text-muted-foreground">(peso {task.weight}%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Presencial
          </span>
        </div>
      </div>

      {/* 4 Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Prazo</p>
          <p className="text-sm font-semibold text-foreground">{task.dueDate}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Atribuída: {task.assignedDate}</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Submissões</p>
          <p className="text-sm font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</p>
        </Card>
        <Card className="p-4 text-center">
          <ClipboardList className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="text-sm font-semibold text-foreground">{task.weight}%</p>
        </Card>
        <Card className="p-4 text-center">
          {task.avgGrade !== null ? (
            <>
              <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Média</p>
              <p className={`text-sm font-semibold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</p>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Média</p>
              <p className="text-sm font-semibold text-muted-foreground">Pendente</p>
            </>
          )}
        </Card>
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

      {/* Student submissions with grading */}
      <GradingTable
        submittedList={submittedList}
        notSubmittedList={notSubmittedList}
        task={task}
        submissionPct={submissionPct}
        isEncerrada={isEncerrada}
        isActiva={isActiva}
      />
    </div>
  );
}

function GradingTable({ submittedList, notSubmittedList, task, submissionPct, isEncerrada, isActiva }: {
  submittedList: any[];
  notSubmittedList: any[];
  task: any;
  submissionPct: number;
  isEncerrada: boolean;
  isActiva: boolean;
}) {
  const { toast } = useToast();
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    submittedList.forEach(s => {
      if (s.grade !== null) initial[s.id] = String(s.grade);
    });
    // For encerrada, not submitted get 0
    if (isEncerrada) {
      notSubmittedList.forEach(s => {
        initial[s.id] = "0";
      });
    }
    return initial;
  });

  const handleGradeChange = (studentId: string, value: string) => {
    if (isEncerrada) return; // immutable when encerrada
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrades = () => {
    toast({ title: "Notas guardadas!", description: "As notas foram actualizadas com sucesso." });
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Submissões e Notas</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {task.submissions}/{task.totalStudents}
            <span className="text-primary/70">·</span>
            <span>{submissionPct}%</span>
          </span>
          {isActiva && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px]">
              <AlertCircle className="w-3 h-3" /> Por atribuir
            </Badge>
          )}
          {isEncerrada && (
            <Badge className="bg-accent/10 text-accent gap-1 text-[10px]">
              <CheckCircle className="w-3 h-3" /> Notas atribuídas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Download className="w-3.5 h-3.5" /> Exportar</Button>
          {!isEncerrada && (
            <Button size="sm" className="gap-2" onClick={handleSaveGrades}><Save className="w-3.5 h-3.5" /> Guardar Notas</Button>
          )}
        </div>
      </div>

      {/* Submitted */}
      {submittedList.length > 0 && (
        <div className="divide-y">
          {submittedList.map(student => (
            <div key={student.id} className="px-5 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                {student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <span className="inline-flex items-center gap-0.5 ml-1">
                        <button className="p-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" title="Enviar mensagem"><MessageCircle className="w-3.5 h-3.5" /></button>
                        <button className="p-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" title="Enviar email"><Mail className="w-3.5 h-3.5" /></button>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-accent">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Entregue</span>
                    </div>
                    {/* Grade display/input */}
                    <div className="flex items-center gap-1">
                      {isEncerrada ? (
                        <span className={`text-sm font-bold w-16 text-center ${Number(grades[student.id] || 0) >= 10 ? "text-accent" : "text-destructive"}`}>
                          {grades[student.id] || "—"}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={grades[student.id] || ""}
                          onChange={e => handleGradeChange(student.id, e.target.value)}
                          className="w-16 h-8 text-center text-sm font-bold"
                          placeholder="—"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">/20</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {student.submittedDate} às {student.submittedTime}
                  </span>
                </div>
                {student.fileName && (
                  <div className="inline-flex items-center gap-2 rounded border px-2.5 py-1.5 bg-muted/20 mt-1">
                    <FileText className="w-3.5 h-3.5 text-destructive/60" />
                    <span className="text-xs font-medium text-foreground">{student.fileName}</span>
                    <button className="p-0.5 rounded hover:bg-muted/50 transition"><Eye className="w-3 h-3 text-muted-foreground" /></button>
                    <button className="p-0.5 rounded hover:bg-muted/50 transition"><Download className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {submittedList.length > 0 && notSubmittedList.length > 0 && (
        <div className="border-t border-border" />
      )}

      {/* Not submitted */}
      {notSubmittedList.length > 0 && (
        <div className="divide-y">
          {notSubmittedList.map(student => (
            <div key={student.id} className="px-5 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                {student.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <span className="inline-flex items-center gap-0.5 ml-1">
                        <button className="p-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" title="Enviar mensagem"><MessageCircle className="w-3.5 h-3.5" /></button>
                        <button className="p-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" title="Enviar email"><Mail className="w-3.5 h-3.5" /></button>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-destructive/70">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Não entregue</span>
                    </div>
                    {/* Grade display/input */}
                    <div className="flex items-center gap-1">
                      {isEncerrada ? (
                        <span className="text-sm font-bold w-16 text-center text-destructive">0</span>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={grades[student.id] || ""}
                          onChange={e => handleGradeChange(student.id, e.target.value)}
                          className="w-16 h-8 text-center text-sm font-bold"
                          placeholder="—"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">/20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
