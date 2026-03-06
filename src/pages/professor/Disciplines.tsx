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
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-primary" /> As Minhas Turmas
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estudantes</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Turmas</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/10">
              <GraduationCap className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{allTurmas.length}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Presença Geral</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10">
              <UserCheck className="w-4 h-4 text-accent" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${overallAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{overallAttendance}%</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Média Geral</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${overallAvg >= 10 ? "text-accent" : "text-destructive"}`}>{overallAvg}/20</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estado</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10">
              <CheckCircle className="w-4 h-4 text-accent" />
            </div>
          </div>
          <Badge className={`text-xs mt-1 border ${taxaAprovacao >= 85 ? "bg-accent/10 text-accent border-accent/30" : taxaAprovacao < 60 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"}`}>
            {taxaAprovacao >= 85 ? "Excelente" : taxaAprovacao < 60 ? "Em Risco" : "Normal"}
          </Badge>
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
            <Link key={turma.id} to={`/professor/turma/${turma.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-lg">{turma.name}</h3>
                      {turmaDiscs.length > 0 && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <BookOpen className="w-3 h-3" /> {turmaDiscs[0].name}
                        </Badge>
                      )}
                      <Badge className={`text-[10px] border ${turmaAprovPct >= 85 ? "bg-accent/10 text-accent border-accent/30" : turmaAprovPct < 60 || avgAttendance < 75 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"}`}>
                        {turmaAprovPct >= 85 ? "Excelente" : turmaAprovPct < 60 || avgAttendance < 75 ? "Em Risco" : "Normal"}
                      </Badge>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>

                  {/* Turma Info - Estudantes, Sala, Dias de Aula */}
                  <div className="flex items-center gap-3 flex-wrap text-sm mb-4 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5">
                      <Users className="w-4.5 h-4.5 text-primary" />
                      <span className="font-bold text-foreground text-base">{turma.students}</span>
                      <span className="text-muted-foreground">estudantes</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5">
                      <MapPin className="w-4.5 h-4.5 text-muted-foreground" />
                      <span className="font-bold text-foreground text-base">{room || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5">
                      <Calendar className="w-4.5 h-4.5 text-muted-foreground" />
                      <span className="font-bold text-foreground text-base">{scheduleDays || "—"}</span>
                    </div>
                  </div>

                  {/* Presença */}
                  <div className="flex items-center justify-between text-xs mb-3 pb-3 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" /> Presença
                    </span>
                    <span className={`font-semibold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{avgAttendance}%</span>
                  </div>

                  {/* Performance */}
                  <div className="space-y-2.5 mb-3 pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-accent" /> Média Geral
                      </span>
                      <span className={`font-semibold ${avgGrade !== null && avgGrade >= 10 ? "text-accent" : avgGrade !== null ? "text-destructive" : "text-muted-foreground"}`}>{avgGrade ?? "—"}/20</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" /> Taxa Aprovado
                      </span>
                      <span className={`font-semibold ${turmaAprovPct >= 70 ? "text-accent" : "text-destructive"}`}>{turmaAprovPct}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Taxa Reprovado
                      </span>
                      <span className={`font-semibold ${turmaReprovPct > 30 ? "text-destructive" : "text-foreground"}`}>{turmaReprovPct}%</span>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-2.5 mb-3 pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-primary" /> Tarefas
                      </span>
                      <span className="font-semibold text-foreground">{turmaTasks.filter(t => t.type === "tarefa" || t.type === "quiz").filter(t => t.status === "encerrada").length}/{turmaTasks.filter(t => t.type === "tarefa" || t.type === "quiz").length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-secondary" /> Taxa de Entrega
                      </span>
                      <span className={`font-semibold ${(() => { const totalSub = turmaTasks.reduce((s, t) => s + t.submissions, 0); const totalStu = turmaTasks.reduce((s, t) => s + t.totalStudents, 0); return totalStu > 0 ? Math.round((totalSub / totalStu) * 100) : 0; })() >= 80 ? "text-accent" : "text-destructive"}`}>
                        {(() => { const totalSub = turmaTasks.reduce((s, t) => s + t.submissions, 0); const totalStu = turmaTasks.reduce((s, t) => s + t.totalStudents, 0); return totalStu > 0 ? Math.round((totalSub / totalStu) * 100) : 0; })()}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-secondary" /> Avaliações
                      </span>
                      <span className="font-semibold text-foreground">{turmaTasks.filter(t => t.type === "exame").filter(t => t.status === "encerrada").length}/{turmaTasks.filter(t => t.type === "exame").length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Taxa de Conclusão
                      </span>
                      <span className="font-semibold text-foreground">{turmaConclusaoPct}%</span>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Conteúdos
                      </span>
                      <span className="font-semibold text-foreground">{totalContents}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-muted-foreground" /> Aulas Gravadas
                        </span>
                        <span className="font-semibold text-foreground">{turmaPublished}/{turmaLessons.length}</span>
                      </div>
                      <Progress value={lessonPct} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
