import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, BookOpen, GraduationCap, TrendingUp, Award, ChevronRight, Layers, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function DecanoFaculdades() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <Building2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground tracking-tight">Meus Cursos</h1>
            </div>
            <p className="text-sm text-muted-foreground">{fac.name} — {fac.courses.length} cursos</p>
          </div>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes },
            { icon: BookOpen, label: "Cursos", value: fac.totalCursos },
            { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes },
            { icon: Award, label: "Média Global", value: "13.2/20" },
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

      {/* Course cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {fac.courses.map(c => {
          const turmas = decanoTurmas.filter(t => t.courseId === c.id);
          const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;

          return (
            <Link key={c.id} to={`/decano/cursos/${c.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                {/* Card header */}
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-foreground truncate">{c.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">{c.code}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Coordenador:</span>
                          <span>{c.coordinator}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary/60" />
                            <span className="font-medium text-foreground/70">Duração:</span>
                            <span>{c.years} anos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Badge
                              variant="outline"
                              className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}
                            >
                              {c.status === "activo" ? "Activo" : "Em Revisão"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-border/60" />

                {/* Metrics */}
                <div className="px-5 py-3 grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Estudantes</p>
                    <p className="text-lg font-bold text-foreground">{c.estudantes}</p>
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
                    <p className={`text-lg font-bold ${avgPresenca >= 80 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
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
