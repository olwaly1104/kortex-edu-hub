import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Users, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function DecanoNotas() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Notas da Faculdade
        </h1>
        <p className="text-muted-foreground mt-1">{fac.name} · {fac.courses.length} cursos</p>
      </div>

      <div className="space-y-3">
        {fac.courses.map(c => (
          <Link key={c.id} to={`/decano/cursos/${c.id}`}>
            <Card className="p-5 border-l-[3px] hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: c.taxaSucesso >= 80 ? "hsl(var(--accent))" : c.taxaSucesso >= 70 ? "hsl(var(--secondary))" : "hsl(var(--destructive))" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                </div>
                <Badge className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                  {c.status === "activo" ? "Activo" : "Em Revisão"}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média Geral</p>
                  <p className={`text-lg font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa Sucesso</p>
                  <p className={`text-lg font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estudantes</p>
                  <p className="text-lg font-bold text-foreground">{c.estudantes}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Docentes</p>
                  <p className="text-lg font-bold text-foreground">{c.docentes}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Taxa de Sucesso</span>
                  <span className="font-semibold">{c.taxaSucesso}%</span>
                </div>
                <Progress value={c.taxaSucesso} className="h-1.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
