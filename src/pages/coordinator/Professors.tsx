import { profDisciplines, profStudents, profTasks, profLessons } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, TrendingUp, Video, Award } from "lucide-react";

// Mock professors linked to disciplines
const mockProfessors = [
  { id: "p1", name: "Prof. António Silva", email: "prof.silva@upra.kor", disciplines: ["pd1"] },
  { id: "p2", name: "Prof. Maria Santos", email: "prof.santos@upra.kor", disciplines: ["pd2"] },
  { id: "p3", name: "Prof. Pedro Ferreira", email: "prof.ferreira@upra.kor", disciplines: ["pd3"] },
];

export default function CoordinatorProfessors() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Professores</h1>
        <p className="text-muted-foreground mt-1">{mockProfessors.length} professores nas cadeiras do curso</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary"><GraduationCap className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{mockProfessors.length}</p><p className="text-xs text-muted-foreground">Total Professores</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/10 text-accent"><BookOpen className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{profDisciplines.length}</p><p className="text-xs text-muted-foreground">Cadeiras</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary/10 text-secondary"><Users className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{new Set(profStudents.map(s => s.id)).size}</p><p className="text-xs text-muted-foreground">Total Alunos</p></div>
        </Card>
      </div>

      {/* Professor cards */}
      <div className="space-y-4">
        {mockProfessors.map(prof => {
          const discs = profDisciplines.filter(d => prof.disciplines.includes(d.id));
          const students = profStudents.filter(s => prof.disciplines.includes(s.disciplineId));
          const tasks = profTasks.filter(t => prof.disciplines.includes(t.disciplineId));
          const lessons = profLessons.filter(l => prof.disciplines.includes(l.disciplineId));
          const withGrades = students.filter(s => s.avgGrade !== null);
          const avg = withGrades.length > 0
            ? withGrades.reduce((sum, s) => sum + (s.avgGrade || 0), 0) / withGrades.length
            : null;
          const publishedLessons = lessons.filter(l => l.status === "publicada").length;
          const avgAttendance = students.length > 0
            ? Math.round(students.reduce((s, st) => s + st.attendance, 0) / students.length)
            : 0;
          const submissionRate = tasks.length > 0
            ? Math.round(tasks.reduce((s, t) => s + (t.totalStudents > 0 ? (t.submissions / t.totalStudents) * 100 : 0), 0) / tasks.length)
            : 0;

          return (
            <Card key={prof.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {prof.name.split(" ").filter(n => n.length > 2).map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{prof.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{prof.email}</p>

                  {/* Disciplines */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {discs.map(d => (
                      <Badge key={d.id} variant="outline" className="text-[10px]" style={{ borderColor: d.color + "40", color: d.color }}>
                        {d.name} ({d.code})
                      </Badge>
                    ))}
                  </div>

                  {/* Turmas */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {discs.flatMap(d => d.turmas).map(t => (
                      <Badge key={t.id} variant="secondary" className="text-[10px]">{t.name}</Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Média Turmas</p>
                    <p className={`text-sm font-bold ${avg && avg >= 10 ? "text-accent" : "text-destructive"}`}>{avg?.toFixed(1) ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                    <p className={`text-sm font-bold ${avgAttendance >= 75 ? "text-accent" : "text-destructive"}`}>{avgAttendance}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                    <p className="text-sm font-bold text-foreground">{submissionRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Aulas</p>
                    <p className="text-sm font-bold text-foreground">{publishedLessons}</p>
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
