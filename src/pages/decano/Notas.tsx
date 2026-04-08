import { useState } from "react";
import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Users, CheckCircle, Calendar, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function DecanoNotas() {
  const navigate = useNavigate();
  const fac = decanoFaculty;
  const [selectedCourse, setSelectedCourse] = useState<string>("todos");

  const courses = selectedCourse === "todos" ? fac.courses : fac.courses.filter(c => c.id === selectedCourse);

  const avgMedia = +(fac.courses.reduce((s, c) => s + c.mediaGeral, 0) / fac.courses.length).toFixed(1);
  const totalEstudantes = fac.courses.reduce((s, c) => s + c.estudantes, 0);
  const allTurmas = decanoTurmas.filter(t => courses.some(c => c.id === t.courseId));
  const avgPresenca = allTurmas.length ? Math.round(allTurmas.reduce((s, t) => s + t.presenca, 0) / allTurmas.length) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Notas da Faculdade
        </h1>
        <p className="text-muted-foreground mt-1">{fac.name}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Course toggles */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedCourse === "todos" ? "default" : "outline"} onClick={() => setSelectedCourse("todos")} className="text-xs">
            Todos os Cursos
          </Button>
          {fac.courses.map(c => (
            <Button key={c.id} size="sm" variant={selectedCourse === c.id ? "default" : "outline"} onClick={() => setSelectedCourse(selectedCourse === c.id ? "todos" : c.id)} className="text-xs">
              {c.name.replace("Engenharia ", "Eng. ")}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{totalEstudantes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p>
              <p className={`text-sm font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Cursos</p>
              <p className="text-sm font-bold text-foreground">{courses.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Clock className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Turmas</p>
              <p className="text-sm font-bold text-foreground">{allTurmas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course cards with turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(c => {
          const courseTurmas = decanoTurmas.filter(t => t.courseId === c.id);
          const years = [...new Set(courseTurmas.map(t => t.year))].sort();

          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {c.name.replace("Engenharia ", "Eng. ")}
                </h2>
                <Badge variant="outline" className="text-[9px] font-mono">{c.code}</Badge>
              </div>
              <div className="space-y-1.5">
                {years.map(year => {
                  const yearTurmas = courseTurmas.filter(t => t.year === year);
                  const avgM = +(yearTurmas.reduce((s, t) => s + t.media, 0) / yearTurmas.length).toFixed(1);
                  const avgP = Math.round(yearTurmas.reduce((s, t) => s + t.presenca, 0) / yearTurmas.length);
                  const estado = getEstado(avgM);

                  return (
                    <Card
                      key={`${c.id}-${year}`}
                      className="p-3 transition-all cursor-pointer hover:shadow-md border-l-[3px] group"
                      style={{ borderLeftColor: avgM >= 14 ? "hsl(var(--accent))" : avgM >= 10 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
                      onClick={() => navigate(`/decano/cursos/${c.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{year}º Ano</p>
                          <Badge variant="outline" className={`text-[9px] ${estado.cls}`}>
                            {estado.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{yearTurmas.length} turma{yearTurmas.length > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média</p>
                            <p className={`text-xs font-bold ${avgM >= 10 ? "text-accent" : "text-destructive"}`}>{avgM}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Presença</p>
                            <p className={`text-xs font-bold ${avgP >= 75 ? "text-accent" : "text-destructive"}`}>{avgP}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Estudantes</p>
                            <p className="text-xs font-bold text-foreground">{yearTurmas.reduce((s, t) => s + t.estudantes, 0)}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </div>
                    </Card>
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
