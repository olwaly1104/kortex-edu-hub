import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import {
  Users, FileText, CalendarDays, Clock, ChevronRight,
  AlertTriangle, Award, CheckCircle, XCircle, Pause,
  ClipboardList, TrendingUp,
} from "lucide-react";

const pipelineStates: EstadoCandidatura[] = ["pendente", "docs_aprovados", "convocado", "aguarda_resultados", "aprovado", "reprovado", "desistiu"];

const pipelineIcons: Record<EstadoCandidatura, React.ElementType> = {
  pendente: Clock,
  docs_aprovados: CheckCircle,
  convocado: CalendarDays,
  aguarda_resultados: Pause,
  aprovado: Award,
  reprovado: XCircle,
  desistiu: Pause,
};

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const counts = pipelineStates.map(s => ({ state: s, count: candidaturas.filter(c => c.estado === s).length }));
  const total = candidaturas.length;

  const pendingDocs = candidaturas.filter(c => c.estado === "pendente");
  const unconfirmedPayments = candidaturas.filter(c => c.pagamento.estado === "pendente").length;
  const missingDocs = candidaturas.filter(c => c.estado === "pendente" && c.documentos.some(d => !d.entregue)).length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const taxaAprovacao = candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length > 0
    ? Math.round((aprovados / candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length) * 100)
    : 0;

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingSessions = sessoesProva.filter(s => {
    const d = new Date(s.data);
    return d >= now && d <= in7days;
  });

  const stats = [
    { icon: Users, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
    { icon: FileText, label: "Pendentes", value: pendingDocs.length, color: "text-secondary bg-secondary/10" },
    { icon: CalendarDays, label: "Sessões Agendadas", value: sessoesProva.filter(s => new Date(s.data) >= now).length, color: "text-primary bg-primary/10" },
    { icon: TrendingUp, label: "Taxa Aprovação", value: `${taxaAprovacao}%`, color: "text-accent bg-accent/10" },
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
              Secretaria Académica — Painel Operacional de Admissões
            </p>
          </div>
          <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Candidaturas <ChevronRight className="w-4 h-4" />
          </Link>
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

      {/* Alerts */}
      {(unconfirmedPayments > 0 || missingDocs > 0) && (
        <div className="flex flex-wrap gap-3">
          {unconfirmedPayments > 0 && (
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary px-4 py-2.5 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{unconfirmedPayments}</strong> pagamento(s) por confirmar</span>
            </div>
          )}
          {missingDocs > 0 && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2.5 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{missingDocs}</strong> candidatura(s) com documentos em falta</span>
            </div>
          )}
        </div>
      )}

      {/* Pipeline */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Pipeline de Candidaturas
          </h2>
          <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {counts.map(({ state, count }) => {
            const Icon = pipelineIcons[state];
            return (
              <div key={state} className="text-center p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <Badge className={`mt-1.5 text-[10px] border-0 ${estadoColors[state]}`}>{estadoLabels[state]}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Row: Fila de Ação + Próximas Provas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" /> Fila de Ação
              <Badge variant="outline" className="text-[10px] ml-1">{pendingDocs.length}</Badge>
            </h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem candidaturas pendentes 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingDocs.slice(0, 5).map(c => {
                const daysWaiting = Math.floor((now.getTime() - new Date(c.dataSubmissao).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={c.id} to={`/secretaria/admissoes/candidaturas/${c.id}`}>
                    <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">{c.cursoOpcao1}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${daysWaiting > 14 ? "text-destructive" : "text-muted-foreground"}`}>
                        {daysWaiting} dias
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Próximas Provas (7 dias)
            </h2>
            <Link to="/secretaria/admissoes/convocacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma prova nos próximos 7 dias.</p>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.curso}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{s.sala}</span>
                      <span>{s.hora}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{new Date(s.data).toLocaleDateString("pt-AO")}</p>
                    <p className="text-xs text-muted-foreground">{s.candidatosIds.length}/{s.capacidadeMax} candidatos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
