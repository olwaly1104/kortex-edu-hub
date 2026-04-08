import { useParams, Link } from "react-router-dom";
import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BookOpen, Users, GraduationCap, TrendingUp, Award,
  CheckCircle, ChevronRight, Layers, MapPin,
} from "lucide-react";

export default function DecanoCursoDetail() {
  const { cursoId } = useParams();
  const course = decanoFaculty.courses.find(c => c.id === cursoId);

  if (!course) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/decano/faculdades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Curso não encontrado.</p>
    </div>
  );

  const courseYears = Array.from({ length: course.years }, (_, i) => i + 1);

  const yearStats = (year: number) => {
    const turmas = decanoTurmas.filter(t => t.courseId === cursoId && t.year === year);
    const totalEst = turmas.reduce((s, t) => s + t.estudantes, 0);
    const avgMedia = turmas.length ? +(turmas.reduce((s, t) => s + t.media, 0) / turmas.length).toFixed(1) : 0;
    const avgSucesso = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.taxaSucesso, 0) / turmas.length) : 0;
    const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;
    return { turmas: turmas.length, estudantes: totalEst, media: avgMedia, taxaSucesso: avgSucesso, presenca: avgPresenca };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/decano/faculdades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Meus Cursos
      </Link>

      {/* Unified Card Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{course.name}</h1>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{course.code}</Badge>
              <Badge className={`text-[11px] border-0 shrink-0 ${course.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                {course.status === "activo" ? "Activo" : "Em Revisão"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <GraduationCap className="w-3 h-3" /> {course.coordinator}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {decanoFaculty.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Layers className="w-3 h-3" /> {course.years} anos
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: "Estudantes", value: course.estudantes, color: "" },
            { icon: GraduationCap, label: "Docentes", value: course.docentes, color: "" },
            { icon: Award, label: "Média Geral", value: course.mediaGeral, color: course.mediaGeral >= 10 ? "text-accent" : "text-destructive" },
            { icon: TrendingUp, label: "Taxa Sucesso", value: `${course.taxaSucesso}%`, color: course.taxaSucesso >= 80 ? "text-accent" : "text-secondary" },
            { icon: CheckCircle, label: "Estado", value: course.status === "activo" ? "Activo" : "Em Revisão", color: course.status === "activo" ? "text-accent" : "text-secondary" },
          ].map(kpi => (
            <div key={kpi.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color || "text-foreground"}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Year Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Anos Curriculares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courseYears.map(year => {
            const stats = yearStats(year);
            return (
              <Link key={year} to={`/decano/cursos/${cursoId}/ano/${year}`}>
                <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer border-l-[3px] border-l-primary">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">{year}º Ano</h3>
                    <Badge variant="outline" className="text-[10px]">{stats.turmas} turmas</Badge>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Estudantes</span>
                      <span className="font-semibold text-foreground">{stats.estudantes}</span>
                    </div>
                    <div className="border-t border-border/50" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><Award className="w-3 h-3" /> Média Geral</span>
                      <span className={`font-semibold ${stats.media >= 10 ? "text-accent" : "text-destructive"}`}>{stats.media}/20</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Taxa Sucesso</span>
                      <span className={`font-semibold ${stats.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{stats.taxaSucesso}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Presença</span>
                      <span className={`font-semibold ${stats.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{stats.presenca}%</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
