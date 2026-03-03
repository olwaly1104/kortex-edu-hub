import { reitoriaInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
export default function ReitoriaFaculdades() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Faculdades</h1>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th><th className="text-left p-3 font-medium text-muted-foreground">Decano</th><th className="text-center p-3 font-medium text-muted-foreground">Cursos</th><th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th><th className="text-center p-3 font-medium text-muted-foreground">Docentes</th><th className="text-center p-3 font-medium text-muted-foreground">Média</th><th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th></tr></thead>
      <tbody>{reitoriaInfo.faculties.map(f => (<tr key={f.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium text-foreground">{f.name}</td><td className="p-3 text-muted-foreground">{f.dean}</td><td className="p-3 text-center">{f.courses}</td><td className="p-3 text-center">{f.estudantes.toLocaleString()}</td><td className="p-3 text-center">{f.docentes}</td><td className="p-3 text-center"><span className={f.mediaGeral >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{f.mediaGeral}</span></td><td className="p-3 text-center"><Badge variant={f.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{f.taxaSucesso}%</Badge></td></tr>))}</tbody></table></Card>
    </div>
  );
}
