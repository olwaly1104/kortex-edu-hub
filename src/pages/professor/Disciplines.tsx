import { profDisciplines, profLessons, profTasks, profStudents, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, MapPin, ChevronRight, Video, FileText, GraduationCap, Calendar, CheckCircle, AlertCircle, BarChart3, ClipboardList, UserCheck } from "lucide-react";

export default function ProfessorDisciplines() {
  // Global stats
  const totalStudents = allTurmas.reduce((s, t) => s + t.students, 0);
  const allStudentsUnique = profStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
  const allStudentsWithGrades = allStudentsUnique.filter(s => s.avgGrade !== null);
  const aprovados = allStudentsWithGrades.filter(s => (s.avgGrade || 0) >= 10).length;
  const totalWithGrades = allStudentsWithGrades.length;
  const taxaAprovacao = totalWithGrades > 0 ? Math.round((aprovados / totalWithGrades) * 100) : 0;
  const overallAvg = allStudentsWithGrades.length > 0
    ? Math.round(allStudentsWithGrades.reduce((s, st) => s + (st.avgGrade || 0), 0) / allStudentsWithGrades.length * 10) / 10
    : 0;
  const overallAttendance = allStudentsUnique.length > 0
    ? Math.round(allStudentsUnique.reduce((s, st) => s + st.attendance, 0) / allStudentsUnique.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> As Minhas Turmas
        </h1>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> <span className="font-bold text-foreground">{totalStudents}</span> Estudantes</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> <span className="font-bold text-foreground">{allTurmas.length}</span> Turmas</span>
          <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Presença <span className={`font-bold ${overallAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{overallAttendance}%</span></span>
          <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Média <span className={`font-bold ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`}>{overallAvg}/20</span></span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Aprov. <span className={`font-bold ${taxaAprovacao >= 70 ? "text-accent" : taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaAprovacao}%</span>
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
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{turma.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{room}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{scheduleDays}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{turmaDiscs.map(d => d.code).join(", ")}</span>
                    </div>
                  </div>
                  <Link to={`/professor/turma/${turma.id}`}>
                    <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                </div>

                {/* Key metrics row */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{turma.students}</p>
                    <p className="text-[10px] text-muted-foreground">Estudantes</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className={`text-lg font-bold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>
                      {avgAttendance}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Presença</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className={`text-lg font-bold ${avgGrade !== null && avgGrade >= 10 ? "text-accent" : avgGrade !== null ? "text-destructive" : "text-muted-foreground"}`}>
                      {avgGrade ?? "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/50">
                    <p className={`text-lg font-bold ${turmaAprovPct >= 70 ? "text-accent" : turmaAprovPct >= 50 ? "text-foreground" : "text-destructive"}`}>
                      {turmaAprovPct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Aprovação</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Avaliações</span>
                    <span className="font-semibold text-foreground">{turmaEncerradas}/{turmaTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Conteúdos</span>
                    <span className="font-semibold text-foreground">{totalContents}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Aulas Gravadas</span>
                      <span className="font-semibold text-foreground">{turmaPublished}/{turmaLessons.length}</span>
                    </div>
                    <Progress value={lessonPct} className="h-1.5" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
