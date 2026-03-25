import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import {
  Users, FileText, CalendarDays, Clock, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, Eye, TrendingUp, AlertCircle,
} from "lucide-react";

const pipelineStates: EstadoCandidatura[] = ["incompleto", "pendente", "aprovado", "reprovado"];

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const total = candidaturas.length;
  const now = new Date();

  const incompletos = candidaturas.filter(c => c.estado === "incompleto");
  const unconfirmedPayments = candidaturas.filter(c => c.pagamento.estado === "pendente").length;
  const missingDocs = incompletos.length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const avaliados = candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : 0;

  const upcomingSessions = sessoesProva.filter(s => new Date(s.data) >= now);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bom dia, {user?.name?.split(" ").pop()} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Painel operacional — Secretaria Académica</p>
      </div>

      {/* Alerts */}
      {(unconfirmedPayments > 0 || missingDocs > 0) && (
        <div className="flex flex-wrap gap-3">
          {unconfirmedPayments > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{unconfirmedPayments}</strong> pagamento(s) por confirmar</span>
            </div>
          )}
          {missingDocs > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2.5 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span><strong>{missingDocs}</strong> candidatura(s) com documentos em falta</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
          { icon: AlertCircle, label: "Incompletos", value: missingDocs, color: "text-orange-600 bg-orange-100" },
          { icon: CheckCircle, label: "Aprovados", value: aprovados, color: "text-green-600 bg-green-100" },
          { icon: TrendingUp, label: "Taxa Aprovação", value: `${taxaAprovacao}%`, color: "text-primary bg-primary/10" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Pipeline de Candidaturas</h2>
          <Link to="/secretaria/admissoes/candidaturas" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todas <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {pipelineStates.map(state => {
            const count = candidaturas.filter(c => c.estado === state).length;
            return (
              <div key={state} className="text-center p-3 rounded-lg border border-border">
                <p className="text-xl font-bold text-foreground">{count}</p>
                <Badge className={`mt-1 text-[9px] border-0 ${estadoColors[state]}`}>{estadoLabels[state]}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fila de Ação - incompletos */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Fila de Ação
              <Badge variant="outline" className="text-[10px]">{incompletos.length}</Badge>
            </h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border">
            {incompletos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem candidaturas incompletas 🎉</p>
            ) : (
              incompletos.slice(0, 5).map(c => {
                const daysWaiting = Math.floor((now.getTime() - new Date(c.dataSubmissao).getTime()) / (1000 * 60 * 60 * 24));
                const docsEntregues = c.documentos.filter(d => d.entregue).length;
                return (
                  <Link key={c.id} to={`/secretaria/admissoes/candidaturas/${c.id}`}>
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">{c.cursoOpcao1} · Docs {docsEntregues}/{c.documentos.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${daysWaiting > 14 ? "text-red-600" : "text-muted-foreground"}`}>
                          {daysWaiting}d
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        {/* Próximas Provas */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Próximas Provas de Acesso
            </h2>
            <Link to="/secretaria/admissoes/provas-de-acesso" className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma sessão agendada.</p>
            ) : (
              upcomingSessions.map(s => (
                <Link key={s.id} to={`/secretaria/admissoes/provas-de-acesso/${s.id}`}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.sala} · {s.hora} · {s.periodo}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{new Date(s.data).toLocaleDateString("pt-AO")}</p>
                        <p className="text-xs text-muted-foreground">{s.candidatosIds.length}/{s.capacidadeMax}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: "/secretaria/admissoes/candidaturas", icon: FileText, label: "Candidaturas", desc: `${total} registadas`, color: "bg-primary/10 text-primary" },
          { to: "/secretaria/admissoes/provas-de-acesso", icon: CalendarDays, label: "Provas de Acesso", desc: `${sessoesProva.length} sessões`, color: "bg-purple-100 text-purple-700" },
          { to: "/secretaria/admissoes/resultados", icon: Eye, label: "Resultados", desc: `${avaliados} avaliados`, color: "bg-green-100 text-green-700" },
        ].map(link => (
          <Link key={link.to} to={link.to}>
            <Card className="p-4 hover:shadow-md hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
