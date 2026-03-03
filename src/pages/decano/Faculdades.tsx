import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp } from "lucide-react";

export default function DecanoFaculdades() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Cursos da Faculdade — {decanoFaculty.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decanoFaculty.courses.map(c => (
          <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div><p className="font-bold text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.code} · {c.years} anos · Coord: {c.coordinator}</p></div>
              <Badge variant={c.status === "activo" ? "default" : "secondary"} className="text-[10px]">{c.status === "activo" ? "Activo" : "Em Revisão"}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{c.estudantes}</p><p className="text-[9px] text-muted-foreground">Estudantes</p></div>
              <div className="text-center p-2 rounded-lg bg-muted/40"><p className="text-sm font-bold">{c.docentes}</p><p className="text-[9px] text-muted-foreground">Docentes</p></div>
              <div className="text-center p-2 rounded-lg bg-muted/40"><p className={`text-sm font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p><p className="text-[9px] text-muted-foreground">Média</p></div>
              <div className="text-center p-2 rounded-lg bg-muted/40"><p className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p><p className="text-[9px] text-muted-foreground">Sucesso</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
