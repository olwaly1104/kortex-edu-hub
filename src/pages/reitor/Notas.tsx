import { useState } from "react";
import { reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Users, CheckCircle, Building2, BookOpen, ChevronRight, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function ReitorNotas() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("todos");

  const faculties = selectedFaculty === "todos"
    ? reitorFaculties
    : reitorFaculties.filter(f => f.id === selectedFaculty);

  const allCourses = faculties.flatMap(f => f.courses);
  const totalEstudantes = faculties.reduce((s, f) => s + f.totalEstudantes, 0);
  const avgMedia = +(faculties.reduce((s, f) => s + f.mediaGeral, 0) / faculties.length).toFixed(1);
  const avgAprov = Math.round(faculties.reduce((s, f) => s + f.taxaSucesso, 0) / faculties.length);
  const avgSucesso = Math.round(faculties.reduce((s, f) => s + f.taxaSucesso, 0) / faculties.length);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Notas da Universidade
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Desempenho académico por faculdade e curso</p>
      </div>

      {/* Filter + KPIs */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedFaculty === "todos" ? "default" : "outline"} onClick={() => setSelectedFaculty("todos")} className="text-xs">
            Todas as Faculdades
          </Button>
          {reitorFaculties.map(f => (
            <Button key={f.id} size="sm" variant={selectedFaculty === f.id ? "default" : "outline"} onClick={() => setSelectedFaculty(selectedFaculty === f.id ? "todos" : f.id)} className="text-xs">
              {f.name.replace("Faculdade de ", "")}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Faculdades</p>
              <p className="text-sm font-bold text-foreground">{faculties.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Cursos</p>
              <p className="text-sm font-bold text-foreground">{allCourses.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{totalEstudantes.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Sucesso</p>
              <p className={`text-sm font-bold ${avgSucesso >= 75 ? "text-accent" : avgSucesso >= 50 ? "text-foreground" : "text-destructive"}`}>{avgSucesso}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty sections with course cards */}
      <div className="space-y-6">
        {faculties.map(f => {
          const fEstado = getEstado(f.mediaGeral);
          return (
            <div key={f.id} className="space-y-3">
              {/* Faculty header */}
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{f.name}</h2>
                <Badge variant="outline" className={`text-[9px] ${fEstado.cls}`}>{fEstado.label}</Badge>
              </div>

              {/* Course cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {f.courses.map(c => {
                  const cEstado = getEstado(c.mediaGeral);
                  const turmas = c.years * 2;
                  const avaliacoes = Math.round(c.estudantes / 10);
                  const aprov = c.mediaGeral >= 14 ? 87 : c.mediaGeral >= 13 ? 79 : c.mediaGeral >= 12 ? 72 : 61;
                  return (
                    <Link key={c.id} to={`/reitor/faculdades/${f.id}/cursos/${c.id}`}>
                      <Card className="p-0 transition-all cursor-pointer hover:shadow-md group overflow-hidden">
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-3 pt-3 pb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                            <Badge variant="outline" className="text-[9px] font-mono shrink-0 bg-primary/5 border-primary/20">{c.code}</Badge>
                            <Badge variant="outline" className={`text-[9px] shrink-0 ${cEstado.cls}`}>{cEstado.label}</Badge>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 px-3 pb-2.5">
                          <span className="text-[10px] text-muted-foreground">{c.coordinator}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <Link
                            to={`/reitor/faculdades/${f.id}`}
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                          >
                            <UserCog className="w-2.5 h-2.5" /> Decano: {f.dean.replace(/^(Prof\.\s*)?(Profª\.\s*)?(Dr\.\s*)?(Dra\.\s*)?/, "")}
                          </Link>
                        </div>

                        {/* Stats footer */}
                        <div className="grid grid-cols-4 bg-muted/30 border-t border-border">
                          <div className="px-3 py-2 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Turmas</p>
                            <p className="text-xs font-bold text-foreground">{turmas}</p>
                          </div>
                          <div className="px-3 py-2 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Est.</p>
                            <p className="text-xs font-bold text-foreground">{c.estudantes}</p>
                          </div>
                          <div className="px-3 py-2 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média</p>
                            <p className={`text-xs font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                          </div>
                          <div className="px-3 py-2 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">% Aprov.</p>
                            <p className={`text-xs font-bold ${aprov >= 75 ? "text-accent" : aprov >= 60 ? "text-foreground" : "text-destructive"}`}>{aprov}%</p>
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
    </div>
  );
}
