import { disciplines, lessons, grades } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, User, Clock, MapPin, ChevronRight, FileText, Video, Award, BarChart3 } from "lucide-react";

export default function StudentDisciplines() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">As Minhas Cadeiras</h1>
        <p className="text-muted-foreground mt-1">{disciplines.length} cadeiras inscritas</p>
      </div>

      {/* Recentes */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recentes</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {disciplines.map((disc) => (
            <Link to={`/student/disciplines/${disc.id}`} key={disc.id} className="shrink-0">
              <Card className="p-3 w-[200px] hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: disc.color + "20", color: disc.color }}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{disc.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{disc.code}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {disciplines.map((disc) => {
          const total = disc.attendance.present + disc.attendance.absent + disc.attendance.justified;
          const attendancePct = Math.round((disc.attendance.present / total) * 100);
          const progressPct = Math.round((disc.progress.watched / disc.progress.total) * 100);
          const discLessons = lessons.filter(l => l.disciplineId === disc.id);
          const totalContents = discLessons.reduce((s, l) => s + l.materials.length, 0);
          const discGrade = grades.find(g => g.disciplineId === disc.id);
          const publishedEvals = discGrade?.evaluations.filter(e => e.published && e.grade !== null) || [];
          const discAvg = publishedEvals.length > 0
            ? Math.round(publishedEvals.reduce((s, e) => s + (e.grade || 0), 0) / publishedEvals.length * 10) / 10
            : null;

          return (
            <Link to={`/student/disciplines/${disc.id}`} key={disc.id}>
              <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: disc.color + "20", color: disc.color }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{disc.name}</h3>
                    <p className="text-xs text-muted-foreground">{disc.code}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
                </div>

                <div className="space-y-2 text-sm text-muted-foreground flex-1">
                  <Link
                    to="/student/contacts"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />{disc.professor}
                  </Link>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{disc.schedule}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{disc.room}</div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-3">
                  {/* Presença */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><BarChart3 className="w-3 h-3 text-muted-foreground" /> Presença</span>
                      <span className={`font-semibold ${attendancePct >= 75 ? "text-accent" : "text-destructive"}`}>{attendancePct}%</span>
                    </div>
                    <Progress value={attendancePct} className="h-1.5" />
                  </div>
                  {/* Média Geral */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Award className="w-3 h-3 text-accent" /> Média Geral</span>
                      <span className={`font-semibold ${discAvg !== null && discAvg >= 10 ? "text-accent" : discAvg !== null ? "text-destructive" : "text-muted-foreground"}`}>
                        {discAvg !== null ? `${discAvg}/20` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Gravações */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3 text-muted-foreground" /> Gravações</span>
                      <span className="font-semibold text-foreground">{disc.progress.watched}/{disc.progress.total}</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </div>
                  {/* Conteúdos */}
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3 text-muted-foreground" /> Conteúdos</span>
                      <span className="font-semibold text-foreground">{totalContents}</span>
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