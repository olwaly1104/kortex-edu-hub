import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, TrendingUp, GraduationCap } from "lucide-react";

export default function DecanoRelatorios() {
  const fac = decanoFaculty;
  const stats = [
    { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Total Cursos", value: fac.totalCursos, color: "text-primary bg-primary/10" },
    { icon: GraduationCap, label: "Total Docentes", value: fac.totalDocentes, color: "text-secondary bg-secondary/10" },
    { icon: TrendingUp, label: "Taxa Sucesso", value: `${fac.taxaSucesso}%`, color: "text-accent bg-accent/10" },
  ];
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Relatórios & Análise</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(s => (<Card key={s.label} className="p-4 flex items-center gap-4"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div><div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></Card>))}</div>
      <h2 className="text-lg font-semibold text-foreground">Desempenho por Curso</h2>
      <div className="space-y-3">{fac.courses.map(c => (<Card key={c.id} className="p-4"><div className="flex items-center justify-between mb-2"><p className="font-medium text-foreground">{c.name} ({c.code})</p><span className={`font-bold ${c.taxaSucesso >= 80 ? "text-accent" : c.taxaSucesso >= 70 ? "text-secondary" : "text-destructive"}`}>{c.taxaSucesso}%</span></div><div className="w-full bg-muted rounded-full h-2.5"><div className={`h-2.5 rounded-full ${c.taxaSucesso >= 80 ? "bg-accent" : c.taxaSucesso >= 70 ? "bg-secondary" : "bg-destructive"}`} style={{ width: `${c.taxaSucesso}%` }} /></div><p className="text-[10px] text-muted-foreground mt-1">Média: {c.mediaGeral} · {c.estudantes} est. · {c.docentes} doc.</p></Card>))}</div>
    </div>
  );
}
