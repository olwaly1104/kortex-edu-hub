import { useAuth } from "@/contexts/AuthContext";
import { reitoriaInfo, reitoriaAprovacoes, reitoriaDecanos } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, GraduationCap, TrendingUp, ChevronRight,
  Clock, FileText, Calendar, AlertTriangle, Award, BarChart3,
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

export default function ReitoriaDashboard() {
  const { user } = useAuth();
  const uni = reitoriaInfo;
  const pendentes = reitoriaAprovacoes.filter(a => a.status === "pendente");

  const stats = [
    { icon: Building2, label: "Total Faculdades", value: uni.totalFaculdades, color: "text-primary bg-primary/10" },
    { icon: Users, label: "Total Estudantes", value: uni.totalEstudantes.toLocaleString(), color: "text-accent bg-accent/10" },
    { icon: GraduationCap, label: "Total Docentes", value: uni.totalDocentes, color: "text-secondary bg-secondary/10" },
    { icon: TrendingUp, label: "Taxa de Sucesso", value: `${uni.taxaSucesso}%`, color: "text-accent bg-accent/10" },
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
              Reitoria — {uni.name}
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs hidden md:inline-flex">Reitoria</Badge>
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
          {/* Faculties Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Faculdades
              </h2>
              <Link to="/reitoria/faculdades" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Decano</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Cursos</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uni.faculties.map(f => (
                      <tr key={f.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 font-medium text-foreground">{f.name}</td>
                        <td className="p-3 text-muted-foreground">{f.dean}</td>
                        <td className="p-3 text-center">{f.courses}</td>
                        <td className="p-3 text-center">{f.estudantes.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={f.taxaSucesso >= 80 ? "text-accent font-medium" : f.taxaSucesso >= 70 ? "text-secondary font-medium" : "text-destructive font-medium"}>
                            {f.taxaSucesso}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Performance comparison */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent" /> Comparação de Desempenho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uni.faculties.map(f => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground truncate">{f.name.replace("Faculdade de ", "")}</p>
                    <span className={`text-sm font-bold ${f.taxaSucesso >= 80 ? "text-accent" : f.taxaSucesso >= 70 ? "text-secondary" : "text-destructive"}`}>
                      {f.taxaSucesso}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full ${f.taxaSucesso >= 80 ? "bg-accent" : f.taxaSucesso >= 70 ? "bg-secondary" : "bg-destructive"}`}
                      style={{ width: `${f.taxaSucesso}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Média: {f.mediaGeral}</span>
                    <span>{f.estudantes} est. • {f.docentes} doc.</span>
                  </div>
                </Card>
              ))}
            </div>
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
              <Link to="/reitoria/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
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

          {/* Decanos */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" /> Decanos
            </h2>
            <div className="space-y-3">
              {reitoriaDecanos.map(d => (
                <Card key={d.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {d.name.split(" ").map(n => n[0]).filter(c => c === c.toUpperCase()).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{d.faculty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{d.courses}</p>
                      <p className="text-[9px] text-muted-foreground">cursos</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
