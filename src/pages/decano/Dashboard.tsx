import { useAuth } from "@/contexts/AuthContext";
import { decanoFaculty, decanoAprovacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, BookOpen, GraduationCap, TrendingUp, ChevronRight,
  Clock, FileText, Calendar, AlertTriangle, Award, Building2,
  CheckCircle, XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const priorityStyles: Record<string, string> = {
  alta: "border-l-destructive",
  média: "border-l-secondary",
  baixa: "border-l-border",
};

const typeIcons: Record<string, React.ElementType> = {
  nota: Award,
  plano: FileText,
  horário: Calendar,
  transferência: Users,
  recurso: AlertTriangle,
};

export default function DecanoDashboard() {
  const { user } = useAuth();
  const fac = decanoFaculty;
  const pendentes = decanoAprovacoes.filter(a => a.status === "pendente");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bom dia, {user?.name?.split(" ").pop()} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Decano — {fac.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes, color: "bg-primary/10 text-primary" },
          { icon: BookOpen, label: "Total Cursos", value: fac.totalCursos, color: "bg-primary/10 text-primary" },
          { icon: GraduationCap, label: "Total Docentes", value: fac.totalDocentes, color: "bg-primary/10 text-primary" },
          { icon: TrendingUp, label: "Taxa de Sucesso", value: `${fac.taxaSucesso}%`, color: "bg-accent/10 text-accent" },
          { icon: Clock, label: "Pendentes", value: pendentes.length, color: "bg-secondary/10 text-secondary" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cursos da Faculdade</h2>
            <Link to="/decano/faculdades" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {fac.courses.map(c => (
              <Link key={c.id} to={`/decano/cursos/${c.id}`}>
                <Card className="p-4 border-l-[3px] border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{c.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                        <Badge className={`text-[10px] border-0 ${c.status === "activo" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                          {c.status === "activo" ? "Activo" : "Em Revisão"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {c.coordinator}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.estudantes} est.</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.years} anos</span>
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

        {/* Approvals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Aprovações Pendentes</h2>
            <Link to="/decano/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendentes.slice(0, 5).map(ap => {
              const Icon = typeIcons[ap.type] || FileText;
              return (
                <Card key={ap.id} className={`p-4 border-l-[3px] ${priorityStyles[ap.priority]}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{ap.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ap.requester} · {ap.date}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
