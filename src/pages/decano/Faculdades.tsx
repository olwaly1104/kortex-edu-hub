import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight, ChevronLeft, Layers, GraduationCap, Award, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DrillLevel = "courses" | "years" | "turmas";

export default function DecanoFaculdades() {
  const [level, setLevel] = useState<DrillLevel>("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const selectedCourse = decanoFaculty.courses.find(c => c.id === selectedCourseId);
  const courseYears = selectedCourse
    ? Array.from({ length: selectedCourse.years }, (_, i) => i + 1)
    : [];
  const yearTurmas = selectedCourseId && selectedYear
    ? decanoTurmas.filter(t => t.courseId === selectedCourseId && t.year === selectedYear)
    : [];

  // stats per year for the selected course
  const yearStats = (year: number) => {
    const turmas = decanoTurmas.filter(t => t.courseId === selectedCourseId && t.year === year);
    const totalEst = turmas.reduce((s, t) => s + t.estudantes, 0);
    const avgMedia = turmas.length ? +(turmas.reduce((s, t) => s + t.media, 0) / turmas.length).toFixed(1) : 0;
    const avgSucesso = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.taxaSucesso, 0) / turmas.length) : 0;
    return { turmas: turmas.length, estudantes: totalEst, media: avgMedia, taxaSucesso: avgSucesso };
  };

  const goBack = () => {
    if (level === "turmas") { setLevel("years"); setSelectedYear(null); }
    else if (level === "years") { setLevel("courses"); setSelectedCourseId(null); }
  };

  // Breadcrumb
  const breadcrumb = [decanoFaculty.name];
  if (selectedCourse) breadcrumb.push(selectedCourse.name);
  if (selectedYear) breadcrumb.push(`${selectedYear}º Ano`);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header with breadcrumb */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          {level === "courses" ? "Cursos da Faculdade" : level === "years" ? "Anos do Curso" : "Turmas"}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{b}</span>
            </span>
          ))}
        </div>
      </div>

      {level !== "courses" && (
        <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
      )}

      {/* LEVEL: Courses */}
      {level === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decanoFaculty.courses.map(c => (
            <Card
              key={c.id}
              className="p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setSelectedCourseId(c.id); setLevel("years"); }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.code} · {c.years} anos · Coord: {c.coordinator}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "activo" ? "default" : "secondary"} className="text-[10px]">
                    {c.status === "activo" ? "Activo" : "Em Revisão"}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{c.estudantes}</p><p className="text-[9px] text-muted-foreground">Estudantes</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{c.docentes}</p><p className="text-[9px] text-muted-foreground">Docentes</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className={`text-sm font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p><p className="text-[9px] text-muted-foreground">Média</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p><p className="text-[9px] text-muted-foreground">Sucesso</p></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* LEVEL: Years */}
      {level === "years" && selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseYears.map(year => {
            const stats = yearStats(year);
            return (
              <Card
                key={year}
                className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedYear(year); setLevel("turmas"); }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" /> {year}º Ano
                  </h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className="text-lg font-bold text-foreground">{stats.turmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className="text-lg font-bold text-foreground">{stats.estudantes}</p><p className="text-[10px] text-muted-foreground">Estudantes</p></div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className={`text-lg font-bold ${stats.media >= 10 ? "text-accent" : "text-destructive"}`}>{stats.media}</p><p className="text-[10px] text-muted-foreground">Média</p></div>
                </div>
                <div className="flex items-center justify-end mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span className={stats.taxaSucesso >= 80 ? "text-accent font-medium" : "text-secondary font-medium"}>{stats.taxaSucesso}%</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* LEVEL: Turmas */}
      {level === "turmas" && selectedYear && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yearTurmas.map(t => (
            <Card key={t.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> {t.name}
                </h3>
                <Badge variant="outline" className="text-[10px]">{selectedYear}º Ano</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Director: {t.director}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold text-foreground">{t.estudantes}</p><p className="text-[9px] text-muted-foreground">Estudantes</p></div>
                <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold text-foreground">{t.disciplinas}</p><p className="text-[9px] text-muted-foreground">Cadeiras</p></div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-1 text-xs"><Award className="w-3.5 h-3.5 text-muted-foreground" /><span className={t.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{t.media}</span></div>
                <div className="flex items-center gap-1 text-xs"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" /><span className={t.taxaSucesso >= 80 ? "text-accent font-medium" : "text-secondary font-medium"}>{t.taxaSucesso}%</span></div>
              </div>
            </Card>
          ))}
          {yearTurmas.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma turma encontrada para este ano.</p>
          )}
        </div>
      )}
    </div>
  );
}
