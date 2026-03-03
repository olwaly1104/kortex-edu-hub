import { useState } from "react";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const data = selectedYear ? coordNotas.filter(n => n.year === selectedYear) : coordNotas;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas do Curso</h1>
        <Badge variant="outline">Média Geral: {coordCursoInfo.mediaGeral}</Badge>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={selectedYear === null ? "default" : "outline"} onClick={() => setSelectedYear(null)}>Todos os Anos</Button>
        {coordCursoInfo.years.map(y => (
          <Button key={y.year} size="sm" variant={selectedYear === y.year ? "default" : "outline"} onClick={() => setSelectedYear(y.year)}>{y.year}º Ano</Button>
        ))}
      </div>
      {data.map(yearData => (
        <div key={yearData.year}>
          <h2 className="text-lg font-semibold text-foreground mb-3">{yearData.year}º Ano — Média {coordCursoInfo.years.find(y => y.year === yearData.year)?.mediaGeral}</h2>
          <Card className="overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Disciplina</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Aprovados</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Reprovados</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Taxa Sucesso</th>
              </tr></thead>
              <tbody>{yearData.disciplinas.map(d => {
                const total = d.aprovados + d.reprovados;
                const taxa = total > 0 ? Math.round((d.aprovados / total) * 100) : 0;
                return (
                  <tr key={d.code} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.code}</p></td>
                    <td className="p-3 text-center"><span className={d.media >= 10 ? "text-accent font-bold" : "text-destructive font-bold"}>{d.media}</span></td>
                    <td className="p-3 text-center text-accent font-medium">{d.aprovados}</td>
                    <td className="p-3 text-center text-destructive font-medium">{d.reprovados}</td>
                    <td className="p-3 text-center"><Badge variant={taxa >= 80 ? "default" : "secondary"} className="text-[10px]">{taxa}%</Badge></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </Card>
        </div>
      ))}
    </div>
  );
}
