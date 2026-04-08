import { decanoFaculty, decanoTurmas, decanoCoordenadores } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BookOpen, GraduationCap, Award, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function DecanoFaculdades() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <Link to="/decano/faculdade">
        <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
          <div className="relative border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
            <div className="relative px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h1 className="text-xl font-bold text-foreground tracking-tight">Meus Cursos</h1>
                </div>
                <p className="text-sm text-muted-foreground">{fac.name}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
            </div>
          </div>
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes },
            { icon: BookOpen, label: "Cursos", value: fac.totalCursos },
            { icon: Clock, label: "Turmas", value: decanoTurmas.length },
            { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes },
            { icon: Award, label: "Média Global", value: "13.2/20" },
            { icon: CheckCircle, label: "Presença Global", value: "82%" },
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
      </Link>

      {/* Course cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {fac.courses.map(c => {
          const turmas = decanoTurmas.filter(t => t.courseId === c.id);
          const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;
          const estado = getEstado(c.mediaGeral);
          const totalDisciplinas = turmas.length > 0 ? turmas[0].disciplinas : 0;

          return (
            <Link key={c.id} to={`/decano/cursos/${c.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-foreground truncate">{c.name}</h3>
                        <Badge className="text-[10px] font-mono shrink-0 bg-primary/10 text-primary border border-primary/20">{c.code}</Badge>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>{estado.label}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Coordenador:</span>
                          {(() => {
                            const coord = decanoCoordenadores.find(co => co.name === c.coordinator);
                            return coord ? (
                              <Link to={`/decano/coordenadores/${coord.id}`} className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                                {c.coordinator}
                              </Link>
                            ) : <span>{c.coordinator}</span>;
                          })()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary/60" />
                          <span className="font-medium text-foreground/70">Duração:</span>
                          <span>{c.years} anos</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="px-5 py-3 bg-muted/30 grid grid-cols-4 gap-3">
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
