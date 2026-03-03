import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, BarChart3, ChevronRight, AlertTriangle, Award, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { profDisciplines, profStudents, profTasks } from "@/data/professorData";
import { Badge } from "@/components/ui/badge";

export default function CoordinatorDashboard() {
  const { user } = useAuth();

  const totalDisciplines = profDisciplines.length;
  const totalStudents = new Set(profStudents.map(s => s.id)).size;
  const totalProfessors = 3;

  // Compute per-discipline stats
  const disciplineStats = profDisciplines.map(disc => {
    const students = profStudents.filter(s => s.disciplineId === disc.id);
    const withGrades = students.filter(s => s.avgGrade !== null);
    const avg = withGrades.length > 0
      ? withGrades.reduce((sum, s) => sum + (s.avgGrade || 0), 0) / withGrades.length
      : null;
    const approvalRate = students.length > 0
      ? Math.round((students.filter(s => (s.avgGrade || 0) >= 10).length / students.length) * 100)
      : 100;
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((s, st) => s + st.attendance, 0) / students.length)
      : 100;
    const atRisk = students.filter(s => s.status === "risco").length;
    const discTasks = profTasks.filter(t => t.disciplineId === disc.id);
    const pendingCorrection = discTasks.filter(t => t.status !== "rascunho" && t.avgGrade === null).length;
    const publishPct = Math.round((disc.publishedLessons / disc.totalLessons) * 100);

    return { disc, avg, approvalRate, avgAttendance, atRisk, pendingCorrection, publishPct, students };
  });

  const overallAvg = disciplineStats.filter(d => d.avg !== null).length > 0
    ? disciplineStats.filter(d => d.avg !== null).reduce((s, d) => s + (d.avg || 0), 0) / disciplineStats.filter(d => d.avg !== null).length
    : 0;

  // Discipline-level alerts
  const alerts: { text: string; type: "error" | "warning" | "info" }[] = [];

  const lowAvgDiscs = disciplineStats.filter(d => d.avg !== null && d.avg < 10);
  if (lowAvgDiscs.length > 0) {
    alerts.push({ text: `${lowAvgDiscs.length} cadeira(s) com média abaixo de 10`, type: "error" });
  }

  const highFailDiscs = disciplineStats.filter(d => d.approvalRate < 70);
  if (highFailDiscs.length > 0) {
    alerts.push({ text: `${highFailDiscs.length} cadeira(s) com taxa de aprovação < 70%`, type: "warning" });
  }

  const lowAttendanceDiscs = disciplineStats.filter(d => d.avgAttendance < 75);
  if (lowAttendanceDiscs.length > 0) {
    alerts.push({ text: `${lowAttendanceDiscs.length} cadeira(s) com presença média < 75%`, type: "warning" });
  }

  const uncorrectedDiscs = disciplineStats.filter(d => d.pendingCorrection > 0);
  if (uncorrectedDiscs.length > 0) {
    alerts.push({ text: `${uncorrectedDiscs.length} cadeira(s) com avaliações por corrigir`, type: "error" });
  }

  const riskDiscs = disciplineStats.filter(d => d.atRisk > 0);
  if (riskDiscs.length > 0) {
    alerts.push({ text: `${riskDiscs.length} cadeira(s) com alunos em risco`, type: "warning" });
  }

  const stats = [
    { icon: BookOpen, label: "Cadeiras", value: totalDisciplines.toString(), color: "text-primary bg-primary/10" },
    { icon: GraduationCap, label: "Professores", value: totalProfessors.toString(), color: "text-accent bg-accent/10" },
    { icon: Users, label: "Total Alunos", value: totalStudents.toString(), color: "text-secondary bg-secondary/10" },
    { icon: Award, label: "Média Geral", value: overallAvg.toFixed(1), color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral do Curso 🎓</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo, {user?.name} — <span className="font-medium">{user?.course}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Disciplines overview */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Cadeiras do Curso
          </h2>
          <div className="space-y-3">
            {disciplineStats.map(({ disc, avg, approvalRate, avgAttendance, publishPct, atRisk, pendingCorrection }) => (
              <Link to={`/coordinator/disciplines`} key={disc.id}>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: disc.color + "20", color: disc.color }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground text-sm truncate">{disc.name}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">{disc.code}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{disc.totalStudents} alunos</span>
                      <span>•</span>
                      <span>{publishPct}% publicado</span>
                      <span>•</span>
                      <span>Presença: {avgAttendance}%</span>
                      {avg !== null && (
                        <>
                          <span>•</span>
                          <span className={avg < 10 ? "text-destructive font-medium" : ""}>Média: {avg.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(atRisk > 0 || pendingCorrection > 0) && (
                      <AlertTriangle className="w-4 h-4 text-secondary" />
                    )}
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Eye className="w-3 h-3" /> Ver
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Alerts & quick access */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-secondary" /> Alertas por Cadeira
            </h3>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className={`text-xs p-2.5 rounded-lg ${
                    alert.type === "error" ? "bg-destructive/10 text-destructive" :
                    alert.type === "warning" ? "bg-secondary/10 text-secondary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {alert.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Sem alertas de momento.</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Acesso Rápido</h3>
            <div className="space-y-2">
              {[
                { label: "Cadeiras", path: "/coordinator/disciplines", icon: BookOpen },
                { label: "Professores", path: "/coordinator/professors", icon: GraduationCap },
                { label: "Alunos", path: "/coordinator/students", icon: Users },
                { label: "Relatórios", path: "/coordinator/reports", icon: BarChart3 },
              ].map(a => (
                <Link key={a.path} to={a.path} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <a.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
