import { useParams, Link, useNavigate } from "react-router-dom";
import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BookOpen, Users, GraduationCap, Award,
  CheckCircle, ChevronRight, Layers, Clock, Calendar,
} from "lucide-react";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function DecanoCursoDetail() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const course = decanoFaculty.courses.find(c => c.id === cursoId);

  if (!course) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/decano/faculdades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Curso não encontrado.</p>
    </div>
  );

  const turmas = decanoTurmas.filter(t => t.courseId === cursoId);
  const courseYears = [...new Set(turmas.map(t => t.year))].sort();
  const estado = getEstado(course.mediaGeral);
  const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;

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
              <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>
                {estado.label}
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

        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: "Estudantes", value: course.estudantes, color: "" },
            { icon: GraduationCap, label: "Docentes", value: course.docentes, color: "" },
            { icon: Award, label: "Média Geral", value: `${course.mediaGeral}/20`, color: course.mediaGeral >= 10 ? "text-accent" : "text-destructive" },
            { icon: CheckCircle, label: "Presença", value: `${avgPresenca}%`, color: avgPresenca >= 75 ? "text-accent" : "text-destructive" },
            { icon: BookOpen, label: "Turmas", value: turmas.length, color: "" },
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

      {/* Year sections with turma cards */}
      {courseYears.map(year => {
        const yearTurmas = turmas.filter(t => t.year === year);
        return (
          <div key={year} className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{year}º Ano</h2>
            <div className="space-y-1.5">
              {yearTurmas.map(t => {
                const tEstado = getEstado(t.media);
                return (
                  <Card
                    key={t.id}
                    className="p-3 transition-all cursor-pointer hover:shadow-md border-l-[3px] group"
                    style={{ borderLeftColor: t.media >= 14 ? "hsl(var(--accent))" : t.media >= 10 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
                    onClick={() => {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{t.name}</p>
                        <Badge variant="outline" className={`text-[9px] ${tEstado.cls}`}>
                          {tEstado.label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] gap-0.5">
                          <Calendar className="w-2.5 h-2.5" /> {t.disciplinas} cadeiras
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground uppercase leading-tight">Estudantes</p>
                          <p className="text-xs font-bold text-foreground">{t.estudantes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média</p>
                          <p className={`text-xs font-bold ${t.media >= 10 ? "text-accent" : "text-destructive"}`}>{t.media}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground uppercase leading-tight">Presença</p>
                          <p className={`text-xs font-bold ${t.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{t.presenca}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground uppercase leading-tight">Entrega</p>
                          <p className={`text-xs font-bold ${t.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{t.taxaEntrega}%</p>
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
  );
}
