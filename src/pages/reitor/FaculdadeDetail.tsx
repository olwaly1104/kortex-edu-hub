import { useParams, Link } from "react-router-dom";
import { reitorFaculties, reitoriaDecanos } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BookOpen, Users, GraduationCap, Award,
  CheckCircle, ChevronRight, Clock,
} from "lucide-react";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

function countCourseTurmas(years: number) {
  let t = 0;
  for (let y = 1; y <= years; y++) t += y <= 2 ? 2 : 1;
  return t;
}

export default function ReitorFaculdadeDetail() {
  const { faculdadeId } = useParams();
  const fac = reitorFaculties.find(f => f.id === faculdadeId);

  if (!fac) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/reitor/faculdades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Faculdade não encontrada.</p>
    </div>
  );

  const estado = getEstado(fac.mediaGeral);
  const dean = reitoriaDecanos.find(d => d.id === fac.deanId);
  const totalTurmas = fac.courses.reduce((s, c) => s + countCourseTurmas(c.years), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/reitor/faculdades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a As Minhas Faculdades
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{fac.name}</h1>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>{estado.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {dean ? (
                <Link to={`/reitor/decanos/${dean.id}`} onClick={e => e.stopPropagation()}>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1 hover:bg-primary/10 transition-colors cursor-pointer">
                    <GraduationCap className="w-3 h-3" /> {fac.dean}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                  <GraduationCap className="w-3 h-3" /> {fac.dean}
                </Badge>
              )}
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {fac.totalCursos} cursos
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> {totalTurmas} turmas
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: "Estudantes", value: fac.totalEstudantes.toLocaleString(), color: "" },
            { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes, color: "" },
            { icon: Award, label: "Média Geral", value: `${fac.mediaGeral}/20`, color: fac.mediaGeral >= 10 ? "text-accent" : "text-destructive" },
            { icon: CheckCircle, label: "Presença", value: `${fac.presenca}%`, color: fac.presenca >= 75 ? "text-accent" : "text-destructive" },
            { icon: BookOpen, label: "% Aprov.", value: `${fac.taxaSucesso}%`, color: fac.taxaSucesso >= 75 ? "text-accent" : "text-destructive" },
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

      {/* Course cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {fac.courses.map(c => {
          const cEstado = getEstado(c.mediaGeral);
          const cTurmas = countCourseTurmas(c.years);
          return (
            <Link key={c.id} to={`/reitor/faculdades/${faculdadeId}/cursos/${c.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-foreground truncate">{c.name}</h3>
                        <Badge className="text-[10px] font-mono shrink-0 bg-primary/10 text-primary border border-primary/20">{c.code}</Badge>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${cEstado.cls}`}>{cEstado.label}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Coordenador:</span>
                          <span>{c.coordinator}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Duração:</span>
                          <span>{c.years} anos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Turmas:</span>
                          <span>{cTurmas} turmas</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="px-5 py-3 bg-muted/30 grid grid-cols-5 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Estudantes</p>
                    <p className="text-lg font-bold text-foreground">{c.estudantes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Turmas</p>
                    <p className="text-lg font-bold text-foreground">{cTurmas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Docentes</p>
                    <p className="text-lg font-bold text-foreground">{c.docentes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Média</p>
                    <p className={`text-lg font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Presença</p>
                    <p className={`text-lg font-bold ${c.presenca >= 80 ? "text-accent" : "text-destructive"}`}>{c.presenca}%</p>
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
