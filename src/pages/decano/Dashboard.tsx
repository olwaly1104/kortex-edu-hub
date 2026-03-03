import { useAuth } from "@/contexts/AuthContext";
import { decanoFaculty, decanoAprovacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, BookOpen, GraduationCap, TrendingUp, ChevronRight,
  Clock, FileText, Calendar, AlertTriangle, Award,
} from "lucide-react";
import { Link } from "react-router-dom";

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  média: "bg-secondary/10 text-secondary border-secondary/20",
  baixa: "bg-muted text-muted-foreground border-border",
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

  const stats = [
    { icon: Users, label: "Total Estudantes", value: fac.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Total Cursos", value: fac.totalCursos, color: "text-primary bg-primary/10" },
    { icon: GraduationCap, label: "Total Docentes", value: fac.totalDocentes, color: "text-secondary bg-secondary/10" },
    { icon: TrendingUp, label: "Taxa de Sucesso", value: `${fac.taxaSucesso}%`, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Decano — {fac.name}
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs hidden md:inline-flex">Decano</Badge>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Courses Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Cursos da Faculdade
              </h2>
              <Link to="/decano/faculdades" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Coordenador</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fac.courses.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.code} • {c.years} anos</p>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{c.coordinator}</td>
                        <td className="p-3 text-center font-medium">{c.estudantes}</td>
                        <td className="p-3 text-center">
                          <span className={c.taxaSucesso >= 80 ? "text-accent font-medium" : c.taxaSucesso >= 70 ? "text-secondary font-medium" : "text-destructive font-medium"}>
                            {c.taxaSucesso}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={c.status === "activo" ? "default" : "secondary"} className="text-[10px]">
                            {c.status === "activo" ? "Activo" : c.status === "em revisão" ? "Em Revisão" : "Suspenso"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Pending approvals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" /> Aprovações Pendentes
              </h2>
              <Link to="/decano/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendentes.map(ap => {
                const Icon = typeIcons[ap.type] || FileText;
                return (
                  <Card key={ap.id} className={`p-4 border-l-[3px] ${ap.priority === "alta" ? "border-l-destructive" : ap.priority === "média" ? "border-l-secondary" : "border-l-border"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${priorityStyles[ap.priority]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{ap.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ap.requester} • {ap.date}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Faculty Performance Summary */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" /> Desempenho por Curso
            </h2>
            <div className="space-y-3">
              {fac.courses.map(c => (
                <Card key={c.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{c.code}</p>
                    <span className={`text-sm font-bold ${c.taxaSucesso >= 80 ? "text-accent" : c.taxaSucesso >= 70 ? "text-secondary" : "text-destructive"}`}>
                      {c.taxaSucesso}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${c.taxaSucesso >= 80 ? "bg-accent" : c.taxaSucesso >= 70 ? "bg-secondary" : "bg-destructive"}`}
                      style={{ width: `${c.taxaSucesso}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Média: {c.mediaGeral} • {c.estudantes} estudantes</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
