import { coordCursoInfo, coordTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Layers, Users, BookOpen, Award, ChevronRight, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function CoordenadorAnos() {
  const info = coordCursoInfo;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" /> Os Meus Anos — {info.name}
        </h1>
        <p className="text-muted-foreground mt-1">{info.years.length} anos curriculares</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {info.years.map(y => {
          const turmas = coordTurmas.filter(t => t.year === y.year);
          const avgPresenca = turmas.length
            ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length)
            : 0;

          return (
            <Link key={y.year} to={`/coordenador/anos/${y.year}`}>
              <Card className="p-5 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{y.year}º Ano</h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2.5 rounded-lg bg-muted/40">
                    <p className="text-lg font-bold text-foreground">{y.turmas}</p>
                    <p className="text-[10px] text-muted-foreground">Turmas</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/40">
                    <p className="text-lg font-bold text-foreground">{y.disciplinas}</p>
                    <p className="text-[10px] text-muted-foreground">Disciplinas</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-muted/40">
                    <p className="text-lg font-bold text-foreground">{y.estudantes}</p>
                    <p className="text-[10px] text-muted-foreground">Estudantes</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className={y.mediaGeral >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{y.mediaGeral}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className={y.taxaSucesso >= 80 ? "text-accent font-medium" : "text-secondary font-medium"}>{y.taxaSucesso}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className={avgPresenca >= 75 ? "text-accent font-medium" : "text-destructive font-medium"}>{avgPresenca}%</span>
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
