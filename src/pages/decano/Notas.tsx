import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default function DecanoNotas() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas — {decanoFaculty.name}</h1>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Curso</th><th className="text-center p-3 font-medium text-muted-foreground">Média Geral</th><th className="text-center p-3 font-medium text-muted-foreground">Taxa Sucesso</th><th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th><th className="text-center p-3 font-medium text-muted-foreground">Estado</th></tr></thead>
      <tbody>{decanoFaculty.courses.map(c => (<tr key={c.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3"><p className="font-medium text-foreground">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.code}</p></td><td className="p-3 text-center"><span className={`font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</span></td><td className="p-3 text-center"><Badge variant={c.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{c.taxaSucesso}%</Badge></td><td className="p-3 text-center">{c.estudantes}</td><td className="p-3 text-center"><Badge variant={c.status === "activo" ? "default" : "secondary"} className="text-[10px]">{c.status === "activo" ? "Activo" : "Em Revisão"}</Badge></td></tr>))}</tbody></table></Card>
    </div>
  );
}
