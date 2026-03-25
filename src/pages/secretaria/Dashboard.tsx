import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import {
  Users, FileText, ChevronRight, Clock,
  CheckCircle, TrendingUp, AlertCircle, XCircle,
  CalendarDays, MapPin, AlertTriangle, ArrowRight,
  FileWarning, CreditCard,
} from "lucide-react";

const pipelineStates: EstadoCandidatura[] = ["incompleto", "pendente", "aprovado", "reprovado"];

const pipelineIcons: Record<EstadoCandidatura, React.ElementType> = {
  incompleto: FileWarning,
  pendente: Clock,
  aprovado: CheckCircle,
  reprovado: XCircle,
};

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const now = new Date();

  const total = candidaturas.length;
  const incompletos = candidaturas.filter(c => c.estado === "incompleto").length;
  const pendentes = candidaturas.filter(c => c.estado === "pendente").length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const reprovados = candidaturas.filter(c => c.estado === "reprovado").length;
  const avaliados = aprovados + reprovados;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : 0;

  // Alerts
  const docsPendentes = candidaturas.filter(c => c.estado === "incompleto");
  const pagamentosPendentes = candidaturas.filter(c => c.pagamento.estado === "pendente");

  // Upcoming exams
  const proximasProvas = sessoesProva
    .filter(s => new Date(s.data) >= now)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Action queue - candidates needing attention
  const filaAccao = candidaturas
    .filter(c => c.estado === "incompleto" || c.pagamento.estado === "pendente")
    .slice(0, 5);

  const stats = [
    { icon: Users, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
    { icon: AlertCircle, label: "Incompletos", value: incompletos, color: "text-orange-600 bg-orange-50", link: "/secretaria/admissoes/candidaturas" },
    { icon: Clock, label: "Pendentes", value: pendentes, color: "text-yellow-600 bg-yellow-50" },
    { icon: CheckCircle, label: "Aprovados", value: aprovados, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Painel de Acção
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Secretaria Académica — Admissões
          </p>
        </div>
        <Link to="/secretaria/admissoes/candidaturas">
          <Button variant="outline" size="sm" className="gap-1.5">
            Ver Candidaturas <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(docsPendentes.length > 0 || pagamentosPendentes.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {docsPendentes.length > 0 && (
            <Card className="p-4 border-l-4 border-l-orange-500 bg-orange-50/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{docsPendentes.length} candidatura{docsPendentes.length > 1 ? "s" : ""} com documentos em falta</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {docsPendentes.map(c => c.nome.split(" ").pop()).join(", ")}
                  </p>
                </div>
                <Link to="/secretaria/admissoes/candidaturas">
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 gap-1 text-xs">
                    Resolver <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
          {pagamentosPendentes.length > 0 && (
            <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50/30">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{pagamentosPendentes.length} pagamento{pagamentosPendentes.length > 1 ? "s" : ""} por confirmar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pagamentosPendentes.map(c => c.nome.split(" ").pop()).join(", ")}
                  </p>
                </div>
                <Link to="/secretaria/admissoes/candidaturas">
                  <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 gap-1 text-xs">
                    Verificar <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Pipeline + Upcoming Exams */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Pipeline */}
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Pipeline de Candidaturas</h2>
            <span className="text-xs text-muted-foreground">Taxa de Aprovação: <span className="font-semibold text-foreground">{taxaAprovacao}%</span></span>
          </div>

          {/* Pipeline bar */}
          <div className="flex rounded-lg overflow-hidden h-3 mb-5">
            {pipelineStates.map(state => {
              const count = candidaturas.filter(c => c.estado === state).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              const colors: Record<EstadoCandidatura, string> = {
                incompleto: "bg-orange-400",
                pendente: "bg-yellow-400",
                aprovado: "bg-green-500",
                reprovado: "bg-red-400",
              };
              return pct > 0 ? <div key={state} className={`${colors[state]}`} style={{ width: `${pct}%` }} /> : null;
            })}
          </div>

          {/* Pipeline cards */}
          <div className="grid grid-cols-4 gap-3">
            {pipelineStates.map(state => {
              const count = candidaturas.filter(c => c.estado === state).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const Icon = pipelineIcons[state];
              return (
                <div key={state} className="text-center p-3 rounded-lg border border-border">
                  <Icon className="w-4 h-4 mx-auto text-muted-foreground mb-1.5" />
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <Badge className={`mt-1 text-[9px] border-0 ${estadoColors[state]}`}>{estadoLabels[state]}</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Próximas Provas */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Próximas Provas
            </h2>
            <Link to="/secretaria/admissoes/provas-de-acesso" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {proximasProvas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sem provas agendadas</p>
            ) : (
              proximasProvas.map((s, i) => {
                const ocupacao = Math.round((s.candidatosIds.length / s.capacidadeMax) * 100);
                return (
                  <Link key={s.id} to={`/secretaria/admissoes/provas-de-acesso/${s.id}`}>
                    <div className="p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">{i + 1}ª Sessão</p>
                        <Badge variant="outline" className="text-[10px]">
                          {new Date(s.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.hora}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.sala}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={ocupacao} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-foreground">{s.candidatosIds.length}/{s.capacidadeMax}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Action Queue */}
      {filaAccao.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Fila de Acção
            </h2>
            <Badge variant="outline" className="text-[10px]">{filaAccao.length} pendente{filaAccao.length > 1 ? "s" : ""}</Badge>
          </div>
          <div className="space-y-2">
            {filaAccao.map(c => {
              const docsEntregues = c.documentos.filter(d => d.entregue).length;
              const totalDocs = c.documentos.length;
              const issues: string[] = [];
              if (c.estado === "incompleto") issues.push(`Docs ${docsEntregues}/${totalDocs}`);
              if (c.pagamento.estado === "pendente") issues.push("Pagamento pendente");

              return (
                <Link key={c.id} to={`/secretaria/admissoes/candidaturas/${c.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {c.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{c.cursoOpcao1}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {issues.map(issue => (
                        <Badge key={issue} variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
