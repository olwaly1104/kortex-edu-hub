import { coordCursoInfo, coordDisciplinas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, BookOpen, Award, ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CoordenadorAnos() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const info = coordCursoInfo;
  const yearDiscs = selectedYear ? coordDisciplinas.filter(d => d.year === selectedYear) : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Os Meus Anos — {info.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {info.years.map(y => (
          <Card key={y.year} className={cn("p-5 cursor-pointer hover:shadow-md transition-shadow", selectedYear === y.year && "ring-2 ring-primary")} onClick={() => setSelectedYear(selectedYear === y.year ? null : y.year)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{y.year}º Ano</h3>
              <ChevronRight className={cn("w-5 h-5 text-muted-foreground transition-transform", selectedYear === y.year && "rotate-90")} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className="text-lg font-bold text-foreground">{y.turmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
              <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className="text-lg font-bold text-foreground">{y.disciplinas}</p><p className="text-[10px] text-muted-foreground">Disciplinas</p></div>
              <div className="text-center p-2.5 rounded-lg bg-muted/40"><p className="text-lg font-bold text-foreground">{y.estudantes}</p><p className="text-[10px] text-muted-foreground">Estudantes</p></div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1 text-sm"><Award className="w-4 h-4 text-muted-foreground" /><span className={y.mediaGeral >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{y.mediaGeral}</span></div>
              <div className="flex items-center gap-1 text-sm"><TrendingUp className="w-4 h-4 text-muted-foreground" /><span className={y.taxaSucesso >= 80 ? "text-accent font-medium" : "text-secondary font-medium"}>{y.taxaSucesso}%</span></div>
            </div>
          </Card>
        ))}
      </div>
      {selectedYear && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Disciplinas do {selectedYear}º Ano</h2>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Disciplina</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Professor</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th>
              </tr></thead>
              <tbody>{yearDiscs.map(d => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.code}</p></td>
                  <td className="p-3 text-muted-foreground">{d.professor}</td>
                  <td className="p-3 text-center">{d.estudantes}</td>
                  <td className="p-3 text-center"><span className={d.media !== null && d.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.media ?? "—"}</span></td>
                  <td className="p-3 text-center"><Badge variant={d.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{d.taxaSucesso}%</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
