import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, BookOpen, GraduationCap, TrendingUp, Award, ChevronRight, Layers, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function DecanoFaculdades() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Meus Cursos
        </h1>
        <p className="text-muted-foreground mt-1">{fac.courses.length} cursos — {fac.name}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes },
          { icon: BookOpen, label: "Cursos", value: fac.totalCursos },
          { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes },
          { icon: TrendingUp, label: "Taxa de Sucesso", value: `${fac.taxaSucesso}%` },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Course cards - premium design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {fac.courses.map(c => {
          const turmas = decanoTurmas.filter(t => t.courseId === c.id);
          const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;
          const avgEntrega = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.taxaEntrega, 0) / turmas.length) : 0;
          const statusColor = c.taxaSucesso >= 85 ? "border-l-accent" : c.taxaSucesso >= 75 ? "border-l-secondary" : "border-l-destructive";

          return (
            <Link key={c.id} to={`/decano/cursos/${c.id}`}>
              <Card className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-[4px] ${statusColor}`}>
                {/* Header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-foreground truncate">{c.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">{c.code}</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                          {c.status === "activo" ? "Activo" : "Em Revisão"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1 bg-background/80">
                          <GraduationCap className="w-3 h-3" /> {c.coordinator}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1 bg-background/80">
                          <Layers className="w-3 h-3" /> {c.years} anos
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="px-5 pb-3 grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estudantes</p>
                    <p className="text-lg font-bold text-foreground">{c.estudantes}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Docentes</p>
                    <p className="text-lg font-bold text-foreground">{c.docentes}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Turmas</p>
                    <p className="text-lg font-bold text-foreground">{turmas.length}</p>
                  </div>
                </div>

                {/* Performance row */}
                <div className="px-5 pb-3 grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                    <p className={`text-sm font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                    <p className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                    <p className={`text-sm font-bold ${avgPresenca >= 80 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                    <p className={`text-sm font-bold ${avgEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{avgEntrega}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-5 pb-4">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground uppercase">Taxa de Sucesso</span>
                    <span className="font-semibold text-foreground">{c.taxaSucesso}%</span>
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
