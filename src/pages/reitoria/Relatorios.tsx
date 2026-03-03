import { reitoriaInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { BarChart3, Building2, Users, GraduationCap, TrendingUp } from "lucide-react";
export default function ReitoriaRelatorios() {
  const uni = reitoriaInfo;
  const stats = [
    { icon: Building2, label: "Faculdades", value: uni.totalFaculdades, color: "text-primary bg-primary/10" },
    { icon: Users, label: "Estudantes", value: uni.totalEstudantes.toLocaleString(), color: "text-accent bg-accent/10" },
    { icon: GraduationCap, label: "Docentes", value: uni.totalDocentes, color: "text-secondary bg-secondary/10" },
    { icon: TrendingUp, label: "Taxa Sucesso", value: `${uni.taxaSucesso}%`, color: "text-accent bg-accent/10" },
  ];
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Relatórios & Análise</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(s => (<Card key={s.label} className="p-4 flex items-center gap-4"><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-5 h-5" /></div><div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></Card>))}</div>
      <h2 className="text-lg font-semibold text-foreground">Comparação de Faculdades</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{uni.faculties.map(f => (<Card key={f.id} className="p-4"><div className="flex items-center justify-between mb-2"><p className="font-medium text-foreground truncate">{f.name.replace("Faculdade de ","")}</p><span className={`font-bold ${f.taxaSucesso >= 80 ? "text-accent" : f.taxaSucesso >= 70 ? "text-secondary" : "text-destructive"}`}>{f.taxaSucesso}%</span></div><div className="w-full bg-muted rounded-full h-2.5 mb-2"><div className={`h-2.5 rounded-full ${f.taxaSucesso >= 80 ? "bg-accent" : f.taxaSucesso >= 70 ? "bg-secondary" : "bg-destructive"}`} style={{ width: `${f.taxaSucesso}%` }} /></div><div className="flex justify-between text-[10px] text-muted-foreground"><span>Média: {f.mediaGeral}</span><span>{f.estudantes} est. · {f.docentes} doc.</span></div></Card>))}</div>
    </div>
  );
}
