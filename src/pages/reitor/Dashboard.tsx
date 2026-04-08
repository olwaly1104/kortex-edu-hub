import { useAuth } from "@/contexts/AuthContext";
import { reitorFaculties, reitoriaDecanos, reitorSolicitacoes, reitoriaInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, GraduationCap, TrendingUp, ChevronRight,
  Clock, AlertTriangle, Award, CheckSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

export default function ReitorDashboard() {
  const { user } = useAuth();
  const uni = reitoriaInfo;
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente");
  const riskFaculties = reitorFaculties.filter(f => f.mediaGeral < 13);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bom dia, {user?.name?.split(" ").pop()} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Reitor — {uni.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Building2, label: "Faculdades", value: uni.totalFaculdades, color: "text-primary bg-primary/10" },
          { icon: Users, label: "Total Estudantes", value: uni.totalEstudantes.toLocaleString(), color: "text-accent bg-accent/10" },
          { icon: GraduationCap, label: "Total Docentes", value: uni.totalDocentes, color: "text-secondary bg-secondary/10" },
          { icon: TrendingUp, label: "Taxa de Sucesso", value: `${uni.taxaSucesso}%`, color: "text-accent bg-accent/10" },
          { icon: CheckSquare, label: "Pendentes", value: pendentes.length, color: "text-amber-600 bg-amber-500/10" },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Alerts + Quick Actions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Risk Alerts */}
          {riskFaculties.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Alertas
              </h2>
              {riskFaculties.map(f => (
                <Link key={f.id} to={`/reitor/faculdades/${f.id}`}>
                  <Card className="p-4 border-l-[3px] border-l-destructive hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground">Média: {f.mediaGeral}/20 · Presença: {f.presenca}%</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Faculty Performance */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance por Faculdade</h2>
            {reitorFaculties.map(f => {
              const estado = getEstado(f.mediaGeral);
              return (
                <Link key={f.id} to={`/reitor/faculdades/${f.id}`}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{f.name}</p>
                        <Badge variant="outline" className={`text-[9px] ${estado.cls}`}>{estado.label}</Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span>{f.totalCursos} cursos</span>
                      <span>{f.totalEstudantes} est.</span>
                      <span>{f.totalDocentes} doc.</span>
                      <span className={f.mediaGeral >= 13 ? "text-accent font-semibold" : "text-destructive font-semibold"}>Média: {f.mediaGeral}</span>
                      <span className={f.presenca >= 80 ? "text-accent font-semibold" : "text-destructive font-semibold"}>Presença: {f.presenca}%</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Solicitações */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Solicitações Pendentes</h2>
            <Link to="/reitor/solicitacoes" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          {pendentes.slice(0, 4).map(sol => (
            <Card key={sol.id} className="p-4 border-l-[3px] border-l-amber-500">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{sol.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sol.requester} · {sol.date}</p>
                </div>
                <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  <Clock className="w-2.5 h-2.5 mr-0.5" /> Pendente
                </Badge>
              </div>
            </Card>
          ))}
          {pendentes.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente 🎉</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
