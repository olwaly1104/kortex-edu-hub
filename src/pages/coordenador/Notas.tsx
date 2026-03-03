import { useState } from "react";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, CheckCircle, TrendingUp } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const data = selectedYear ? coordNotas.filter(n => n.year === selectedYear) : coordNotas;

  // Compute média geral based on selected year
  const mediaGeral = selectedYear
    ? coordCursoInfo.years.find(y => y.year === selectedYear)?.mediaGeral ?? coordCursoInfo.mediaGeral
    : coordCursoInfo.mediaGeral;

  const totalAprovados = data.reduce((s, y) => s + y.disciplinas.reduce((a, d) => a + d.aprovados, 0), 0);
  const totalReprovados = data.reduce((s, y) => s + y.disciplinas.reduce((a, d) => a + d.reprovados, 0), 0);
  const totalAlunos = totalAprovados + totalReprovados;
  const taxaSucesso = totalAlunos > 0 ? Math.round((totalAprovados / totalAlunos) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas do Curso</h1>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Ano:</span>
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >Todos</button>
        {coordCursoInfo.years.map(y => (
          <button
            key={y.year}
            onClick={() => setSelectedYear(y.year)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === y.year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >{y.year}º Ano</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Sucesso</span>
          </div>
          <p className={`text-2xl font-bold ${taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{taxaSucesso}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aprovados</span>
          </div>
          <p className="text-2xl font-bold text-accent">{totalAprovados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reprovados</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{totalReprovados}</p>
        </Card>
      </div>

      {/* Disciplinas */}
      {data.map(yearData => (
        <div key={yearData.year}>
          <h2 className="text-lg font-semibold text-foreground mb-3">{yearData.year}º Ano</h2>
          <div className="space-y-2">
            {yearData.disciplinas.map(d => {
              const total = d.aprovados + d.reprovados;
              const taxa = total > 0 ? Math.round((d.aprovados / total) * 100) : 0;
              return (
                <Card key={d.code} className={`p-4 flex items-center gap-4 border-l-[3px] ${d.media >= 10 ? "border-l-accent" : "border-l-destructive"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{d.code}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 shrink-0 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                      <p className={`text-sm font-bold ${d.media >= 10 ? "text-accent" : "text-destructive"}`}>{d.media}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Aprovados</p>
                      <p className="text-sm font-bold text-accent">{d.aprovados}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Reprovados</p>
                      <p className="text-sm font-bold text-destructive">{d.reprovados}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                      <Badge variant={taxa >= 80 ? "default" : "secondary"} className="text-[10px]">{taxa}%</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
