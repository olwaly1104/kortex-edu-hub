import { reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function ReitorNotas() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Notas por Faculdade
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do desempenho académico</p>
      </div>

      <div className="space-y-4">
        {reitorFaculties.map(f => {
          const estado = getEstado(f.mediaGeral);
          return (
            <Card key={f.id} className="overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{f.name}</h3>
                    <Badge variant="outline" className={`text-[9px] ${estado.cls}`}>{estado.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{f.totalEstudantes.toLocaleString()} estudantes</span>
                    <span className={`font-bold ${f.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>Média: {f.mediaGeral}/20</span>
                    <span className={`font-bold ${f.presenca >= 80 ? "text-accent" : "text-destructive"}`}>Presença: {f.presenca}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {f.courses.map(c => {
                    const cEstado = getEstado(c.mediaGeral);
                    return (
                      <Link key={c.id} to={`/reitor/faculdades/${f.id}/cursos/${c.id}`}>
                        <Card className="p-3 border-l-[3px] hover:shadow-md transition-all cursor-pointer"
                          style={{ borderLeftColor: c.mediaGeral >= 14 ? "hsl(var(--accent))" : c.mediaGeral >= 10 ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.estudantes} est. · {c.coordinator}</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className={`text-sm font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                              <p className={`text-[10px] ${c.presenca >= 80 ? "text-accent" : "text-destructive"}`}>{c.presenca}%</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
