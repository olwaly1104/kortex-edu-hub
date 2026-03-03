import { reitoriaCoords } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
export default function ReitoriaCoordenadores() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Coordenadores</h1>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Nome</th><th className="text-left p-3 font-medium text-muted-foreground">Curso</th><th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th><th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th></tr></thead>
      <tbody>{reitoriaCoords.map(c => (<tr key={c.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3"><p className="font-medium text-foreground">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.email}</p></td><td className="p-3 text-muted-foreground">{c.course}</td><td className="p-3 text-muted-foreground">{c.faculty}</td><td className="p-3 text-center font-medium">{c.estudantes}</td></tr>))}</tbody></table></Card>
    </div>
  );
}
