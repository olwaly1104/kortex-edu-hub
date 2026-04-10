import { useParams, Link } from "react-router-dom";
import { reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Users, CheckCircle, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

function generateTurmas(courseId: string, years: number, estudantes: number) {
  const turmas: { id: string; name: string; year: number; estudantes: number; disciplinas: number; media: number; aprov: number; avalDone: number; avalTotal: number; }[] = [];
  for (let y = 1; y <= years; y++) {
    const count = y <= 2 ? 2 : 1;
    for (let t = 0; t < count; t++) {
      const letter = String.fromCharCode(65 + t);
      const seed = (courseId + y + letter).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const media = +(10 + (seed % 60) / 10).toFixed(1);
      const disc = 4 + (seed % 4);
      const avalTotal = disc * 2;
      const avalDone = Math.round(avalTotal * (media >= 14 ? 0.9 : media >= 12 ? 0.75 : 0.6));
      const aprov = media >= 14 ? 87 : media >= 13 ? 79 : media >= 12 ? 72 : 61;
      turmas.push({
        id: `${courseId}-y${y}t${letter}`,
        name: `Turma ${letter}`,
        year: y,
        estudantes: Math.floor(estudantes / (years * count) + (seed % 10) - 5),
        disciplinas: disc,
        media,
        aprov,
        avalDone,
        avalTotal,
      });
    }
  }
  return turmas;
}

export default function ReitorNotasCursoDetail() {
  const { faculdadeId, cursoId } = useParams();
  const fac = reitorFaculties.find(f => f.id === faculdadeId);
  const course = fac?.courses.find(c => c.id === cursoId);
  const turmas = useMemo(() => course ? generateTurmas(course.id, course.years, course.estudantes) : [], [course]);
  const courseYears = [...new Set(turmas.map(t => t.year))].sort();
  const estado = course ? getEstado(course.mediaGeral) : getEstado(0);

  if (!fac || !course) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/reitor/notas" className="text-primary hover:underline">← Voltar às Notas</Link>
      <p className="mt-4">Curso não encontrado.</p>
    </div>
  );

  const aprov = course.mediaGeral >= 14 ? 87 : course.mediaGeral >= 13 ? 79 : course.mediaGeral >= 12 ? 72 : 61;

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to="/reitor/notas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às Notas
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{course.name}</h1>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0 bg-primary/5 border-primary/20">{course.code}</Badge>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>{estado.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <GraduationCap className="w-3 h-3" /> {course.coordinator}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">{fac.name}</Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {course.years} anos
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{course.estudantes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Turmas</p>
              <p className="text-sm font-bold text-foreground">{turmas.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${course.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{course.mediaGeral}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">% Aprovação</p>
              <p className={`text-sm font-bold ${aprov >= 70 ? "text-accent" : aprov >= 50 ? "text-foreground" : "text-destructive"}`}>{aprov}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><GraduationCap className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Docentes</p>
              <p className="text-sm font-bold text-foreground">{course.docentes}</p>
            </div>
          </div>
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
                  <Link key={t.id} to={`/reitor/notas/${faculdadeId}/${cursoId}/${t.id}`}>
                    <Card className="p-3 transition-all hover:shadow-md cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">{t.name}</p>
                            <Badge variant="outline" className={`text-[9px] ${tEstado.cls}`}>{tEstado.label}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.disciplinas} cadeiras</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Estudantes</p>
                            <p className="text-xs font-bold text-foreground">{t.estudantes}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Aval.</p>
                            <p className="text-xs font-bold text-foreground">{t.avalDone}/{t.avalTotal}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média</p>
                            <p className={`text-xs font-bold ${t.media >= 10 ? "text-accent" : "text-destructive"}`}>{t.media}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">% Aprov.</p>
                            <p className={`text-xs font-bold ${t.aprov >= 75 ? "text-accent" : t.aprov >= 60 ? "text-foreground" : "text-destructive"}`}>{t.aprov}%</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
