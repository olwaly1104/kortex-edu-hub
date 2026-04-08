import { useState } from "react";
import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Users, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DecanoNotas() {
  const fac = decanoFaculty;
  const [selectedCourse, setSelectedCourse] = useState<string>("todos");

  const courses = selectedCourse === "todos" ? fac.courses : fac.courses.filter(c => c.id === selectedCourse);

  const avgMedia = +(fac.courses.reduce((s, c) => s + c.mediaGeral, 0) / fac.courses.length).toFixed(1);
  const avgSucesso = Math.round(fac.courses.reduce((s, c) => s + c.taxaSucesso, 0) / fac.courses.length);
  const bestCourse = [...fac.courses].sort((a, b) => b.mediaGeral - a.mediaGeral)[0];
  const worstCourse = [...fac.courses].sort((a, b) => a.taxaSucesso - b.taxaSucesso)[0];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-6 h-6 text-primary" /> Notas da Faculdade
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Sucesso</span>
          </div>
          <p className={`text-2xl font-bold ${avgSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{avgSucesso}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Award className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Melhor Curso</span>
          </div>
          <p className="text-sm font-bold text-foreground">{bestCourse.name.replace("Engenharia ", "Eng. ")}</p>
          <p className="text-xs text-muted-foreground">Média {bestCourse.mediaGeral}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atenção</span>
          </div>
          <p className="text-sm font-bold text-foreground">{worstCourse.name.replace("Engenharia ", "Eng. ")}</p>
          <p className="text-xs text-muted-foreground">Sucesso {worstCourse.taxaSucesso}%</p>
        </Card>
      </div>

      {/* Course filter */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={selectedCourse === "todos" ? "default" : "outline"} onClick={() => setSelectedCourse("todos")} className="text-xs">Todos os Cursos</Button>
        {fac.courses.map(c => (
          <Button key={c.id} size="sm" variant={selectedCourse === c.id ? "default" : "outline"} onClick={() => setSelectedCourse(c.id)} className="text-xs">{c.name.replace("Engenharia ", "Eng. ")}</Button>
        ))}
      </div>

      {/* Course cards with grades */}
      <div className="space-y-3">
        {courses.map(c => {
          const turmas = decanoTurmas.filter(t => t.courseId === c.id);
          const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;
          return (
            <Link key={c.id} to={`/decano/cursos/${c.id}`}>
              <Card className="p-5 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: c.taxaSucesso >= 80 ? "hsl(var(--accent))" : c.taxaSucesso >= 70 ? "hsl(var(--secondary))" : "hsl(var(--destructive))" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                    <Badge className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                      {c.status === "activo" ? "Activo" : "Em Revisão"}
                    </Badge>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média Geral</p>
                    <p className={`text-lg font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa Sucesso</p>
                    <p className={`text-lg font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estudantes</p>
                    <p className="text-lg font-bold text-foreground">{c.estudantes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Presença</p>
                    <p className={`text-lg font-bold ${avgPresenca >= 80 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Turmas</p>
                    <p className="text-lg font-bold text-foreground">{turmas.length}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Taxa de Sucesso</span>
                    <span className="font-semibold">{c.taxaSucesso}%</span>
                  </div>
                  <Progress value={c.taxaSucesso} className="h-1.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
