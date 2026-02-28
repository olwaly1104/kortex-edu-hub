import { profDisciplines, profLessons, profTasks, profStudents } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Clock, MapPin, ChevronRight, Video, FileText, GraduationCap, Eye, AlertTriangle } from "lucide-react";

export default function CoordinatorDisciplines() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Disciplinas do Curso</h1>
        <p className="text-muted-foreground mt-1">{profDisciplines.length} disciplinas sob supervisão</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {profDisciplines.map(disc => {
          const discLessons = profLessons.filter(l => l.disciplineId === disc.id);
          const discTasks = profTasks.filter(t => t.disciplineId === disc.id);
          const discStudents = profStudents.filter(s => s.disciplineId === disc.id);
          const publishPct = Math.round((disc.publishedLessons / disc.totalLessons) * 100);
          const pendingTasks = discTasks.filter(t => t.status === "publicada").length;
          const atRisk = discStudents.filter(s => s.status === "risco").length;
          const withGrades = discStudents.filter(s => s.avgGrade !== null);
          const avg = withGrades.length > 0
            ? withGrades.reduce((sum, s) => sum + (s.avgGrade || 0), 0) / withGrades.length
            : null;

          return (
            <Card key={disc.id} className="p-5 h-full flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: disc.color + "20", color: disc.color }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{disc.name}</h3>
                  <p className="text-xs text-muted-foreground">{disc.code}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] gap-1 shrink-0">
                  <Eye className="w-3 h-3" /> Supervisão
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{disc.summary}</p>

              <div className="space-y-2 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{disc.totalStudents} estudantes • {disc.turmas.length} turma(s)</div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{disc.schedule}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{disc.room}</div>
              </div>

              {/* Turmas badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {disc.turmas.map(t => (
                  <Badge key={t.id} variant="outline" className="text-[10px]" style={{ borderColor: disc.color + "40", color: disc.color }}>
                    {t.name}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> Aulas publicadas</span>
                    <span className="font-semibold text-foreground">{disc.publishedLessons}/{disc.totalLessons}</span>
                  </div>
                  <Progress value={publishPct} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> Materiais</span>
                  <span className="font-semibold text-foreground">{disc.totalMaterials}</span>
                </div>
                {avg !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Média da disciplina</span>
                    <span className={`font-semibold ${avg < 10 ? "text-destructive" : "text-foreground"}`}>{avg.toFixed(1)}</span>
                  </div>
                )}
                {pendingTasks > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Avaliações activas</span>
                    <Badge className="bg-secondary/10 text-secondary text-[10px]">{pendingTasks}</Badge>
                  </div>
                )}
                {atRisk > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Alunos em risco</span>
                    <Badge className="bg-destructive/10 text-destructive text-[10px]">{atRisk}</Badge>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
