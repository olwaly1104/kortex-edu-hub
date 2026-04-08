import { decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BookOpen, GraduationCap, TrendingUp, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DecanoFaculdades() {
  const fac = decanoFaculty;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Meus Cursos
        </h1>
        <p className="text-muted-foreground mt-1">{fac.courses.length} cursos — {fac.name}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes },
          { icon: BookOpen, label: "Cursos", value: fac.totalCursos },
          { icon: GraduationCap, label: "Docentes", value: fac.totalDocentes },
          { icon: TrendingUp, label: "Taxa de Sucesso", value: `${fac.taxaSucesso}%` },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-3">
        {fac.courses.map(c => (
          <Link key={c.id} to={`/decano/cursos/${c.id}`}>
            <Card className="p-5 border-l-[3px] border-l-primary hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                    <Badge className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                      {c.status === "activo" ? "Activo" : "Em Revisão"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {c.coordinator}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.estudantes} estudantes</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.years} anos · {c.docentes} docentes</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                    <p className={`text-sm font-bold ${c.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{c.mediaGeral}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                    <p className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{c.taxaSucesso}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
