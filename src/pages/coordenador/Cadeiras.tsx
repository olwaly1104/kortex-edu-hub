import { coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, MapPin, Calendar, User, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function CoordenadorCadeiras() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filtered = selectedYear
    ? coordDisciplinas.filter(d => d.year === selectedYear)
    : coordDisciplinas;

  const totalCadeiras = filtered.length;
  const totalEstudantes = filtered.reduce((s, d) => s + d.estudantes, 0);
  const avgMedia = filtered.length
    ? Math.round((filtered.reduce((s, d) => s + (d.media ?? 0), 0) / filtered.length) * 10) / 10
    : 0;
  const avgTaxaSucesso = filtered.length
    ? Math.round(filtered.reduce((s, d) => s + d.taxaSucesso, 0) / filtered.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Cadeiras do Curso
        </h1>
        <p className="text-muted-foreground mt-1">{coordCursoInfo.name} · {coordCursoInfo.faculty}</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-2 flex-wrap">
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeiras</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCadeiras}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalEstudantes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${avgMedia >= 10 ? "text-accent" : "text-destructive"}`}>{avgMedia}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Sucesso</span>
          </div>
          <p className={`text-2xl font-bold ${avgTaxaSucesso >= 75 ? "text-accent" : "text-destructive"}`}>{avgTaxaSucesso}%</p>
        </Card>
      </div>

      {/* Discipline cards grouped by year */}
      {(selectedYear ? [selectedYear] : [...new Set(coordDisciplinas.map(d => d.year))].sort()).map(year => {
        const yearDisciplinas = filtered.filter(d => d.year === year);
        if (yearDisciplinas.length === 0) return null;
        return (
          <div key={year}>
            <h2 className="text-lg font-semibold text-foreground mb-3">{year}º Ano</h2>
            <div className="space-y-2">
              {yearDisciplinas.map(d => (
                <Card key={d.id} className={`p-4 border-l-[3px] ${(d.media ?? 0) >= 10 ? "border-l-accent" : "border-l-destructive"} hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{d.name}</p>
                        <Badge variant="outline" className="text-[10px] font-mono">{d.code}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{d.professor}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.diasAula}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                        <p className={`text-xs font-bold ${(d.media ?? 0) >= 10 ? "text-accent" : "text-destructive"}`}>{d.media ?? "–"}/20</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Estudantes</p>
                        <p className="text-xs font-bold text-foreground">{d.estudantes}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                        <p className={`text-xs font-bold ${d.taxaSucesso >= 75 ? "text-accent" : "text-destructive"}`}>{d.taxaSucesso}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
