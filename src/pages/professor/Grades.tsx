import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profDisciplines, profTasks, profStudents, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Users, Clock, CheckCircle, ClipboardList, FolderKanban, BookOpen, GraduationCap, BarChart3 } from "lucide-react";

const getEvalIcon = (type: string) => {
  if (type === "exame") return ClipboardList;
  if (type === "quiz") return FolderKanban;
  return BookOpen;
};

export default function ProfessorGrades() {
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");

  const allGraded = profTasks.filter(t => t.status === "encerrada" && t.avgGrade !== null);
  const overallAvg = allGraded.length > 0
    ? Math.round(allGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / allGraded.length * 10) / 10
    : null;

  // Filter tasks by turma
  const filteredTasks = filterTurma === "all"
    ? profTasks
    : profTasks.filter(t => t.turmaId === filterTurma);

  // Group by turma
  const turmasToShow = filterTurma === "all" ? allTurmas : allTurmas.filter(t => t.id === filterTurma);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-secondary" /> Notas
      </h1>

      {/* Overall average */}
      {overallAvg !== null && (
        <Card className="p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${overallAvg >= 10 ? "bg-accent/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`w-6 h-6 ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Média Geral dos Estudantes</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-3xl font-bold ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`}>{overallAvg}</span>
              <span className="text-sm text-muted-foreground font-medium">/ 20</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{allGraded.length} avaliações corrigidas</p>
          </div>
        </Card>
      )}

      {/* Turma filter */}
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground self-center mr-1">Turma:</span>
        <button onClick={() => setFilterTurma("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTurma === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Todas</button>
        {allTurmas.map(t => (
          <button key={t.id} onClick={() => setFilterTurma(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTurma === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.name}</button>
        ))}
      </div>

      {/* Turma sections */}
      <div className="space-y-6">
        {turmasToShow.map(turma => {
          const turmaTasks = profTasks.filter(t => t.turmaId === turma.id);
          const turmaGraded = turmaTasks.filter(t => t.avgGrade !== null);
          const turmaAvg = turmaGraded.length > 0
            ? Math.round(turmaGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / turmaGraded.length * 10) / 10
            : null;

          if (turmaTasks.length === 0) return null;

          return (
            <div key={turma.id}>
              {/* Turma header */}
              <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{turma.name}</h3>
                      <p className="text-xs text-muted-foreground">{turma.course} • {turmaTasks.length} avaliações · {turma.students} estudantes</p>
                    </div>
                  </div>
                  {turmaAvg !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Média</p>
                      <p className={`text-xl font-bold ${turmaAvg >= 10 ? "text-accent" : "text-destructive"}`}>{turmaAvg}</p>
                    </div>
                  )}
                </div>

                {/* Tasks grouped by discipline within turma */}
                <div className="divide-y">
                  {turmaTasks.map(task => {
                    const disc = profDisciplines.find(d => d.id === task.disciplineId);
                    const EvalIcon = getEvalIcon(task.type);
                    return (
                      <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/professor/tasks/${task.id}`)}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          task.avgGrade !== null
                            ? task.avgGrade >= 10 ? "bg-accent/10" : "bg-destructive/10"
                            : "bg-muted"
                        }`}>
                          {task.avgGrade !== null ? (
                            <span className={`text-sm font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}</span>
                          ) : (
                            <EvalIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{task.title}</p>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                            <span className="text-[10px] text-muted-foreground">{disc?.code}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{task.dueDate}</span>
                            <span>•</span>
                            <span>Peso: {task.weight}%</span>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              {task.modality === "online" ? "Online" : "Presencial"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{task.submissions}/{task.totalStudents}</span>
                          </div>
                          {task.avgGrade !== null ? (
                            <div className="flex items-center gap-1.5 text-accent">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Corrigido</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">Pendente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
