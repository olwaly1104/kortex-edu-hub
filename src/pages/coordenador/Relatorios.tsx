import { coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, TrendingUp, Award } from "lucide-react";

export default function CoordenadorRelatorios() {
  const info = coordCursoInfo;
  const stats = [
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Disciplinas Activas", value: info.disciplinasActivas, color: "text-primary bg-primary/10" },
    { icon: Award, label: "Média Geral", value: info.mediaGeral, color: "text-secondary bg-secondary/10" },
    { icon: TrendingUp, label: "Taxa Sucesso Média", value: `${Math.round(info.years.reduce((s, y) => s + y.taxaSucesso, 0) / info.years.length)}%`, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Relatórios — {info.name}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </Card>
        ))}
      </div>
      <h2 className="text-lg font-semibold text-foreground">Desempenho por Ano</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {info.years.map(y => (
          <Card key={y.year} className="p-5">
            <h3 className="font-bold text-foreground mb-3">{y.year}º Ano</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estudantes</span><span className="font-medium">{y.estudantes}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Disciplinas</span><span className="font-medium">{y.disciplinas}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Média Geral</span><span className={`font-bold ${y.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{y.mediaGeral}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa Sucesso</span><span className={`font-bold ${y.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{y.taxaSucesso}%</span></div>
              <div className="w-full bg-muted rounded-full h-2 mt-1"><div className={`h-2 rounded-full ${y.taxaSucesso >= 80 ? "bg-accent" : "bg-secondary"}`} style={{ width: `${y.taxaSucesso}%` }} /></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
