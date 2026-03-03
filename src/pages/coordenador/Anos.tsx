import { coordCursoInfo, coordTurmas, coordDisciplinas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Layers, Users, BookOpen, Award, ChevronRight, CheckCircle, UserCheck, GraduationCap, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

export default function CoordenadorAnos() {
  const info = coordCursoInfo;

  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalCadeiras = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const totalProfessores = new Set(coordDisciplinas.map(d => d.professor)).size;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" /> Os Meus Anos
        </h1>
        <p className="text-muted-foreground mt-1">{info.name} · {info.faculty}</p>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{info.totalEstudantes}</p>
              <p className="text-xs text-muted-foreground">Total Estudantes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalTurmas}</p>
              <p className="text-xs text-muted-foreground">Total Turmas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalProfessores}</p>
              <p className="text-xs text-muted-foreground">Total Professores</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCadeiras}</p>
              <p className="text-xs text-muted-foreground">Total Cadeiras</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Year cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {info.years.map(y => {
          const turmas = coordTurmas.filter(t => t.year === y.year);
          const avgPresenca = turmas.length
            ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length)
            : 0;
          const avgTaxaEntrega = turmas.length
            ? Math.round(turmas.reduce((s, t) => s + t.taxaEntrega, 0) / turmas.length)
            : 0;
          const yearProfessores = new Set(coordDisciplinas.filter(d => d.year === y.year).map(d => d.professor)).size;

          return (
            <Link key={y.year} to={`/coordenador/anos/${y.year}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all h-full group cursor-pointer">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-bold text-foreground">{y.year}º Ano</h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{info.name}</p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.estudantes}</p>
                      <p className="text-[10px] text-muted-foreground">Estud.</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.turmas}</p>
                      <p className="text-[10px] text-muted-foreground">Turmas</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{yearProfessores}</p>
                      <p className="text-[10px] text-muted-foreground">Prof.</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.disciplinas}</p>
                      <p className="text-[10px] text-muted-foreground">Cadeiras</p>
                    </div>
                  </div>

                  {/* Bottom metrics */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Presença</span>
                      <span className={`text-sm font-semibold tabular-nums ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Taxa de Entrega</span>
                      <span className={`text-sm font-semibold tabular-nums ${avgTaxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{avgTaxaEntrega}%</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Média Geral</span>
                      <span className={`text-sm font-semibold tabular-nums ${y.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{y.mediaGeral}</span>
                    </div>
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
