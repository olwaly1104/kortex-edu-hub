import { useAuth } from "@/contexts/AuthContext";
import { coordAgendaEvents, announcements } from "@/data/mockData";
import { reitorSolicitacoes } from "@/data/institutionData";
import { alerts, recentTransactions, formatCurrency } from "@/data/financeModuleData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, Clock, CheckCircle, Play,
  Calendar as CalendarIcon, Megaphone, MapPin,
  AlertTriangle, Info, AlertCircle, Wallet, TrendingUp,
  TrendingDown, CreditCard, BarChart3, FileText,
  ArrowDownLeft, Users, Eye, XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const alertIcons = { warning: AlertTriangle, info: Info, error: AlertCircle };

const typeIcons: Record<string, React.ElementType> = {
  nota: FileText, plano: FileText, horário: CalendarIcon, transferência: Users, recurso: AlertTriangle,
};
const typeLabels: Record<string, string> = {
  nota: "Nota", plano: "Plano", horário: "Horário", transferência: "Transferência",
  recurso: "Recurso", material: "Material", reunião: "Reunião",
};
const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  média: "bg-secondary/10 text-secondary",
  baixa: "bg-muted text-muted-foreground",
};

export default function FinancasInicio() {
  const { user } = useAuth();
  const pendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  const TODAY_DATE = "2024-02-14";
  const todayAgenda = coordAgendaEvents
    .filter(e => e.date === TODAY_DATE)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = "10:45";
  const getEventStatus = (e: typeof coordAgendaEvents[0]) => {
    if (e.endTime <= now) return "concluída";
    if (e.startTime <= now && e.endTime > now) return "em_curso";
    return "agendada";
  };
  const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "outline" }> = {
    concluída: { label: "Concluída", icon: CheckCircle, variant: "outline" },
    em_curso: { label: "Em Curso", icon: Play, variant: "default" },
    agendada: { label: "Agendada", icon: Clock, variant: "outline" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Departamento Financeiro — UPRA
            </p>
          </div>
          <Link to="/financas/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((a) => {
            const Icon = alertIcons[a.type];
            const color = a.type === "error" ? "text-destructive bg-destructive/10 border-destructive/20" : a.type === "warning" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-blue-600 bg-blue-50 border-blue-200";
            return (
              <div key={a.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${color}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{a.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 1: Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
            </h2>
            <Link to="/financas/calendario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver calendário <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {todayAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem eventos hoje 🎉</p>
          ) : (
            <div className="divide-y divide-border">
              {todayAgenda.map(evento => {
                const status = getEventStatus(evento);
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;
                const isActive = status === "em_curso";
                return (
                  <div key={evento.id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className="text-center shrink-0 w-14">
                      <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{evento.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">{evento.endTime}</p>
                    </div>
                    <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: evento.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{evento.title}</p>
                      {evento.room && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{evento.room}
                        </p>
                      )}
                    </div>
                    <Badge variant={isActive ? "default" : "outline"} className="text-[10px] gap-1 shrink-0">
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
              <Badge variant="outline" className="text-[10px] font-mono">{announcements.length}</Badge>
            </h2>
            <Link to="/financas/anuncios" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map(an => {
              const style = typeStyles[an.type] || typeStyles.geral;
              return (
                <div key={an.id} className="px-3.5 py-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className={`${style.bg} text-[10px]`}>{style.label}</Badge>
                    <span className="text-[11px] text-muted-foreground ml-auto">{an.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">{an.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{an.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">— {an.author}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 2: Transações Recentes + Acções Rápidas */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Transações Recentes
              </h2>
              <Link to="/financas/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentTransactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === "receita" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {t.type === "receita" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</p>
                  </div>
                  <p className={`text-xs font-bold shrink-0 ${t.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                    {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Solicitações Pendentes */}
          <Card className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-secondary" /> Solicitações
                <Badge variant="outline" className="text-[10px] ml-1">{pendentes.length}</Badge>
              </h2>
              <Link to="/financas/solicitacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {pendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem solicitações pendentes 🎉</p>
            ) : (
              <div className="space-y-2.5">
                {pendentes.slice(0, 3).map(sol => {
                  const Icon = typeIcons[sol.type] || FileText;
                  return (
                    <div key={sol.id} className="px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-muted/60">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{sol.title}</p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">{typeLabels[sol.type] || sol.type}</Badge>
                        </div>
                        <Badge className={`${priorityStyles[sol.priority]} text-[8px] px-1.5 py-0 shrink-0`}>{sol.priority}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{sol.description}</p>
                      <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">{sol.requester}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{sol.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <Button variant="ghost" size="sm" className="h-6 px-2 rounded-md text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                          <XCircle className="w-3 h-3" /> Rejeitar
                        </Button>
                        <Link to="/financas/solicitacoes" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> Ver detalhes
                        </Link>
                        <Button size="sm" className="h-6 px-2 rounded-md text-[10px] bg-accent hover:bg-accent/90 text-accent-foreground gap-1">
                          <CheckCircle className="w-3 h-3" /> Aprovar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-4 lg:col-span-2 flex flex-col">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" /> Acções Rápidas
          </h2>
          <div className="flex flex-col gap-1.5 flex-1 justify-evenly">
            {[
              { label: "Dashboard financeiro completo", icon: BarChart3, path: "/financas/dashboard", color: "bg-primary/10 text-primary" },
              { label: "Gerir receitas e cobranças", icon: TrendingUp, path: "/financas/receitas", color: "bg-emerald-50 text-emerald-600" },
              { label: "Gerir despesas e aprovações", icon: TrendingDown, path: "/financas/despesas", color: "bg-red-50 text-red-600" },
              { label: "Processamento de salários", icon: CreditCard, path: "/financas/salarios", color: "bg-amber-50 text-amber-600" },
              { label: "Orçamentos departamentais", icon: Wallet, path: "/financas/orcamentos", color: "bg-secondary/10 text-secondary" },
            ].map(action => (
              <Link key={action.path} to={action.path}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <action.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
