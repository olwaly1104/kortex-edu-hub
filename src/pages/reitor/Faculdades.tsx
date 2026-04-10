import { reitorFaculties, reitoriaInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, GraduationCap, Award, CheckCircle, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

function countTurmas(courses: { years: number }[]) {
  return courses.reduce((sum, c) => {
    let t = 0;
    for (let y = 1; y <= c.years; y++) t += y <= 2 ? 2 : 1;
    return sum + t;
  }, 0);
}

export default function ReitorFaculdades() {
  const uni = reitoriaInfo;
  const totalTurmas = countTurmas(reitorFaculties.flatMap(f => f.courses));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <Building2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">As Minhas Faculdades</h1>
              <Badge variant="outline" className="text-[10px] shrink-0">{uni.totalFaculdades} faculdades</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{uni.name}</p>
          </div>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Building2, label: "Faculdades", value: uni.totalFaculdades },
            { icon: Users, label: "Total Estudantes", value: uni.totalEstudantes.toLocaleString() },
            { icon: GraduationCap, label: "Total Docentes", value: uni.totalDocentes },
            { icon: Award, label: "Média Global", value: "13.4/20" },
            { icon: CheckCircle, label: "Presença Global", value: "85%" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{s.label}</p>
                <p className="text-sm font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Faculty cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {reitorFaculties.map(f => {
          const estado = getEstado(f.mediaGeral);
          const facTurmas = countTurmas(f.courses);
          return (
            <Link key={f.id} to={`/reitor/faculdades/${f.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-foreground truncate">{f.name}</h3>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>{estado.label}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Decano:</span>
                          <span>{f.dean}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Cursos:</span>
                          <span>{f.totalCursos} cursos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Turmas:</span>
                          <span>{facTurmas} turmas</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Docentes:</span>
                          <span>{f.totalDocentes}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="px-5 py-3 bg-muted/30 grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Estudantes</p>
                    <p className="text-lg font-bold text-foreground">{f.totalEstudantes.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Presença</p>
                    <p className={`text-lg font-bold ${f.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{f.presenca}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Média</p>
                    <p className={`text-lg font-bold ${f.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{f.mediaGeral}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">% Aprov.</p>
                    <p className={`text-lg font-bold ${f.taxaSucesso >= 75 ? "text-accent" : "text-destructive"}`}>{f.taxaSucesso}%</p>
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
