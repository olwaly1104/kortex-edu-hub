import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordAprovacoes, coordRecentActivity, coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  GraduationCap, AlertTriangle, CheckCircle, FileText,
  Calendar, TrendingUp, ArrowRight,
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

export default function CoordenadorCursoDashboard() {
  const { user } = useAuth();
  const info = coordCursoInfo;
  const pendentes = coordAprovacoes.filter(a => a.status === "pendente");

  const stats = [
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Cadeiras Activas", value: info.disciplinasActivas, color: "text-primary bg-primary/10" },
    { icon: Clock, label: "Aprovações Pendentes", value: info.aprovacoesPendentes, color: "text-secondary bg-secondary/10" },
    { icon: Award, label: "Média Geral", value: info.mediaGeral, color: "text-accent bg-accent/10" },
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
              Coordenador de Curso — {info.name} • {info.faculty}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{info.code}</Badge>
            <Badge className="bg-accent text-accent-foreground text-xs">{info.years.length} Anos</Badge>
          </div>
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
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick access to years */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Os Meus Anos
              </h2>
              <Link to="/coordenador/anos" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {info.years.map(y => (
                <Link key={y.year} to={`/coordenador/anos/${y.year}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-foreground">{y.year}º Ano</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className="text-sm font-bold text-foreground">{y.estudantes}</p>
                        <p className="text-[9px] text-muted-foreground">Estudantes</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                       <p className="text-sm font-bold text-foreground">{y.disciplinas}</p>
                        <p className="text-[9px] text-muted-foreground">Cadeiras</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className={`text-sm font-bold ${y.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{y.mediaGeral}</p>
                        <p className="text-[9px] text-muted-foreground">Média</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/40">
                        <p className={`text-sm font-bold ${y.taxaSucesso >= 80 ? "text-accent" : y.taxaSucesso >= 60 ? "text-secondary" : "text-destructive"}`}>{y.taxaSucesso}%</p>
                        <p className="text-[9px] text-muted-foreground">Sucesso</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Docentes Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Docentes do Curso
              </h2>
              <Link to="/coordenador/docentes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Cadeiras</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordDocentes.slice(0, 5).map(d => (
                      <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 font-medium text-foreground">{d.name}</td>
                        <td className="p-3 text-muted-foreground">{d.department}</td>
                        <td className="p-3 text-center">{d.disciplinas}</td>
                        <td className="p-3 text-center">
                          <span className={d.presenca >= 90 ? "text-accent" : "text-destructive"}>{d.presenca}%</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={d.status === "activo" ? "default" : "secondary"} className="text-[10px]">
                            {d.status === "activo" ? "Activo" : d.status === "licença" ? "Licença" : "Inactivo"}
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
              <Link to="/coordenador/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {pendentes.slice(0, 4).map(ap => {
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

          {/* Recent activity */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" /> Actividade Recente
            </h2>
            <div className="space-y-3">
              {coordRecentActivity.map(act => (
                <Card key={act.id} className="p-3">
                  <p className="text-sm text-foreground">{act.action}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{act.actor} • {act.date}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
