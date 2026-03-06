import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profDisciplines, profTasks, allTurmas } from "@/data/professorData";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Users, Clock, CheckCircle, ClipboardList, FolderKanban, BookOpen, GraduationCap, MapPin, Calendar, ArrowRight } from "lucide-react";

const getEvalIcon = (type: string) => {
  if (type === "exame") return GraduationCap;
  if (type === "quiz") return FolderKanban;
  return ClipboardList;
};

export default function ProfessorGrades() {
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");

  const allGraded = profTasks.filter(t => t.status === "encerrada" && t.avgGrade !== null);
  const overallAvg = allGraded.length > 0
    ? Math.round(allGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / allGraded.length * 10) / 10
    : null;

  const turmasToShow = filterTurma === "all" ? allTurmas : allTurmas.filter(t => t.id === filterTurma);

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-secondary" /> Notas
      </h1>

      {/* Overall average */}
      {overallAvg !== null && (
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${overallAvg >= 10 ? "bg-accent/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`w-6 h-6 ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Média Geral dos Estudantes</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-3xl font-bold ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`}>{overallAvg}</span>
              <span className="text-sm text-muted-foreground font-medium">/ 20</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{allGraded.length} avaliações corrigidas</p>
          </div>
        </div>
      )}

      {/* Turma filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Turma:</span>
        <button
          onClick={() => setFilterTurma("all")}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === "all" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
        >Todas</button>
        {allTurmas.map(t => (
          <button key={t.id} onClick={() => setFilterTurma(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === t.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
          >{t.name}</button>
        ))}
      </div>

      {/* Turma sections */}
      <div className="space-y-5">
        {turmasToShow.map(turma => {
          const turmaTasks = profTasks.filter(t => t.turmaId === turma.id);
          const turmaGraded = turmaTasks.filter(t => t.avgGrade !== null);
          const turmaAvg = turmaGraded.length > 0
            ? Math.round(turmaGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / turmaGraded.length * 10) / 10
            : null;

          if (turmaTasks.length === 0) return null;

          return (
            <div key={turma.id} className="rounded-xl border-2 border-border bg-card overflow-hidden">
              {/* Turma header */}
              <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{turma.name}</h3>
                    <p className="text-xs text-muted-foreground">{turma.course} · {turmaTasks.length} avaliações · {turma.students} estudantes</p>
                  </div>
                </div>
                {turmaAvg !== null && (
                  <div className="text-right px-4 py-2 rounded-xl border border-border bg-card">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média</p>
                    <p className={`text-xl font-bold ${turmaAvg >= 10 ? "text-accent" : "text-destructive"}`}>{turmaAvg}</p>
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div className="divide-y divide-border">
                {turmaTasks.map(task => {
                  const disc = profDisciplines.find(d => d.id === task.disciplineId);
                  const EvalIcon = getEvalIcon(task.type);
                  return (
                    <div
                      key={task.id}
                      className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors group"
                      onClick={() => navigate(`/professor/tasks/${task.id}`)}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        task.avgGrade !== null
                          ? task.avgGrade >= 10 ? "bg-accent/10 border-accent/20" : "bg-destructive/10 border-destructive/20"
                          : "bg-muted border-border"
                      }`}>
                        {task.avgGrade !== null ? (
                          <span className={`text-sm font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}</span>
                        ) : (
                          <EvalIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{task.title}</p>
                          <Badge variant="outline" className="text-[10px] gap-1 rounded-md border-border">
                            {task.type === "exame" ? <GraduationCap className="w-3 h-3" /> : task.type === "quiz" ? <FolderKanban className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                            {task.type === "tarefa" ? "Tarefa" : task.type === "quiz" ? "Quiz" : "Exame"}
                          </Badge>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                          <span className="text-[10px] text-muted-foreground shrink-0">{disc?.code}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                          <span>·</span>
                          <span>Peso: {task.weight}%</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Presencial</span>
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
                            <span className="text-xs font-medium">Encerrada</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Pendente</span>
                          </div>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}