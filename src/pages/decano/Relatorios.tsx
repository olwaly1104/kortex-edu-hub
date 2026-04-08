import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, BookOpen, TrendingUp, GraduationCap, Award } from "lucide-react";

export default function DecanoRelatorios() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Relatórios & Análise
        </h1>
        <p className="text-muted-foreground mt-1">{fac.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes },
          { icon: BookOpen, label: "Cursos", value: fac.totalCursos },
          { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes },
          { icon: TrendingUp, label: "Taxa Sucesso", value: `${fac.taxaSucesso}%` },
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

      {/* Performance by Course */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Desempenho por Curso</h2>
        <div className="space-y-3">
          {fac.courses.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{c.name}</p>
                  <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                </div>
                <span className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : c.taxaSucesso >= 70 ? "text-secondary" : "text-destructive"}`}>
                  {c.taxaSucesso}%
                </span>
              </div>
              <Progress value={c.taxaSucesso} className="h-1.5 mb-2" />
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Média: {c.mediaGeral}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.estudantes} est.</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {c.docentes} doc.</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
