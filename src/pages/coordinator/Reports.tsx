import { profDisciplines, profStudents, profTasks } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Users, CheckCircle, Clock, BookOpen, Eye } from "lucide-react";

export default function CoordinatorReports() {
  const allGraded = profTasks.filter(t => t.status === "encerrada" && t.avgGrade !== null);
  const overallAvg = allGraded.length > 0
    ? Math.round(allGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / allGraded.length * 10) / 10
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" /> Relatórios do Curso
          </h1>
          <p className="text-muted-foreground mt-1">Visão analítica das disciplinas</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" /> Apenas leitura
        </Badge>
      </div>

      {overallAvg !== null && (
        <Card className="p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${overallAvg >= 10 ? "bg-accent/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`w-6 h-6 ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Média Geral do Curso</p>
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

      <div className="space-y-6">
        {profDisciplines.map(disc => {
          const tasks = profTasks.filter(t => t.disciplineId === disc.id);
          const students = profStudents.filter(s => s.disciplineId === disc.id);
          const graded = tasks.filter(t => t.avgGrade !== null);
          const avg = graded.length > 0 ? Math.round(graded.reduce((s, t) => s + (t.avgGrade || 0), 0) / graded.length * 10) / 10 : null;
          const atRisk = students.filter(s => s.status === "risco").length;
          const approvalRate = students.length > 0
            ? Math.round((students.filter(s => (s.avgGrade || 0) >= 10).length / students.length) * 100)
            : 100;

          return (
            <Card key={disc.id} className="overflow-hidden">
              <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: disc.color }} />
                  <div>
                    <h3 className="font-semibold text-foreground">{disc.name}</h3>
                    <p className="text-xs text-muted-foreground">{tasks.length} avaliações · {disc.totalStudents} estudantes · Aprovação: {approvalRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {atRisk > 0 && (
                    <Badge className="bg-destructive/10 text-destructive text-[10px]">{atRisk} em risco</Badge>
                  )}
                  {avg !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Média</p>
                      <p className={`text-xl font-bold ${avg >= 10 ? "text-accent" : "text-destructive"}`}>{avg}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="divide-y">
                {tasks.map(task => (
                  <div key={task.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      task.avgGrade !== null
                        ? task.avgGrade >= 10 ? "bg-accent/10" : "bg-destructive/10"
                        : "bg-muted"
                    }`}>
                      {task.avgGrade !== null ? (
                        <span className={`text-sm font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}</span>
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{task.dueDate}</span>
                        <span>•</span>
                        <span>Peso: {task.weight}%</span>
                        <Badge variant="outline" className="text-[10px]">{task.modality === "online" ? "Online" : "Presencial"}</Badge>
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
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
