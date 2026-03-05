import { profDisciplines, profLessons, profTasks, profStudents, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, MapPin, ChevronRight, Video, FileText, GraduationCap, Calendar, CheckCircle, AlertCircle, BarChart3, ClipboardList } from "lucide-react";

export default function ProfessorDisciplines() {
  // Global stats
  const totalEvals = profTasks.length;
  const allStudentsWithGrades = profStudents.filter(s => s.avgGrade !== null);
  const aprovados = allStudentsWithGrades.filter(s => (s.avgGrade || 0) >= 10).length;
  const reprovados = allStudentsWithGrades.filter(s => (s.avgGrade || 0) < 10).length;
  const totalWithGrades = allStudentsWithGrades.length;
  const taxaAprovacao = totalWithGrades > 0 ? Math.round((aprovados / totalWithGrades) * 100) : 0;
  const taxaReprovacao = totalWithGrades > 0 ? Math.round((reprovados / totalWithGrades) * 100) : 0;
  const encerradas = profTasks.filter(t => t.status === "encerrada").length;
  const taxaConclusao = profTasks.length > 0 ? Math.round((encerradas / profTasks.length) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> As Minhas Turmas
        </h1>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Faculdade de Engenharia</span>
          <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> {totalEvals} Avaliações</span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Aprov. <span className={`font-bold ${taxaAprovacao >= 70 ? "text-accent" : taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaAprovacao}%</span>
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Reprov. <span className={`font-bold ${taxaReprovacao > 30 ? "text-destructive" : "text-foreground"}`}>{taxaReprovacao}%</span>
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" /> Conclusão <span className="font-bold text-foreground">{taxaConclusao}%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {allTurmas.map(turma => {
          const turmaDiscs = profDisciplines.filter(d => d.turmas.some(t => t.id === turma.id));
          const turmaLessons = profLessons.filter(l => l.turmaId === turma.id);
          const turmaPublished = turmaLessons.filter(l => l.status === "publicada").length;
          const turmaTasks = profTasks.filter(t => t.turmaId === turma.id);
          const turmaActive = turmaTasks.filter(t => t.status === "publicada").length;
          const turmaStudents = profStudents.filter(s => s.turmaId === turma.id);
          const uniqueStudents = turmaStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
          const avgGrade = uniqueStudents.length > 0 && uniqueStudents.some(s => s.avgGrade !== null)
            ? Math.round(uniqueStudents.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / uniqueStudents.filter(s => s.avgGrade !== null).length * 10) / 10
            : null;
          const avgAttendance = uniqueStudents.length > 0
            ? Math.round(uniqueStudents.reduce((s, st) => s + st.attendance, 0) / uniqueStudents.length)
            : 0;
          const lessonPct = turmaLessons.length > 0 ? Math.round((turmaPublished / turmaLessons.length) * 100) : 0;
          const totalContents = turmaDiscs.reduce((s, d) => s + d.totalMaterials, 0);

          // Taxa aprovação per turma
          const turmaGraded = uniqueStudents.filter(s => s.avgGrade !== null);
          const turmaAprov = turmaGraded.filter(s => (s.avgGrade || 0) >= 10).length;
          const turmaReprov = turmaGraded.filter(s => (s.avgGrade || 0) < 10).length;
          const turmaAprovPct = turmaGraded.length > 0 ? Math.round((turmaAprov / turmaGraded.length) * 100) : 0;
          const turmaReprovPct = turmaGraded.length > 0 ? Math.round((turmaReprov / turmaGraded.length) * 100) : 0;
          const turmaEncerradas = turmaTasks.filter(t => t.status === "encerrada").length;
          const turmaConclusaoPct = turmaTasks.length > 0 ? Math.round((turmaEncerradas / turmaTasks.length) * 100) : 0;

          const scheduleDays = turmaDiscs.length > 0 ? turmaDiscs[0].schedule.split(" ")[0] : "";
          const room = turmaDiscs.length > 0 ? turmaDiscs[0].room : "";

          return (
            <Card key={turma.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-1.5 bg-primary" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{turma.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{turma.course} • {turma.year}º Ano</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{room}</span>
                    </div>
                  </div>
                  <Link to={`/professor/turma/${turma.id}`}>
                    <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                </div>

                {/* Key metrics row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{turma.students}</p>
                    <p className="text-[10px] text-muted-foreground">Estudantes</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className={`text-lg font-bold ${avgGrade !== null && avgGrade >= 10 ? "text-accent" : avgGrade !== null ? "text-destructive" : "text-muted-foreground"}`}>
                      {avgGrade ?? "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className={`text-lg font-bold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>
                      {avgAttendance}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Presença</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Dias</span>
                    <span className="font-semibold text-foreground">{scheduleDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Cadeiras</span>
                    <span className="font-semibold text-foreground">{turmaDiscs.map(d => d.code).join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Taxa Aprovação</span>
                    <span className={`font-bold ${turmaAprovPct >= 70 ? "text-accent" : turmaAprovPct >= 50 ? "text-foreground" : "text-destructive"}`}>{turmaAprovPct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Taxa Reprovação</span>
                    <span className={`font-bold ${turmaReprovPct > 30 ? "text-destructive" : "text-foreground"}`}>{turmaReprovPct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Conclusão</span>
                    <span className="font-semibold text-foreground">{turmaConclusaoPct}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Aulas Gravadas</span>
                      <span className="font-semibold text-foreground">{turmaPublished}/{turmaLessons.length}</span>
                    </div>
                    <Progress value={lessonPct} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Conteúdos</span>
                    <span className="font-semibold text-foreground">{totalContents}</span>
                  </div>
                  {turmaActive > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Tarefas activas</span>
                      <Badge className="bg-secondary/10 text-secondary text-[10px]">{turmaActive}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
