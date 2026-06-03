import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, TrendingDown, Tag, Calendar, User, UserCheck,
  FileText, Check, X, Clock, CheckCircle2, XCircle, Send, Wallet, MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { despesas, formatCurrency } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  aprovada: { label: "Aprovada", cls: "bg-accent/15 text-accent border-accent/30", icon: CheckCircle2 },
  pendente: { label: "Pendente", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  rejeitada: { label: "Rejeitada", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
};

function fmtDateLong(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtDateShort(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DespesaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const despesa = useMemo(() => despesas.find(d => d.id === id), [id]);

  if (!despesa) {
    return (
      <div className="p-8 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/financas/despesas")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Despesa não encontrada.</p>
        </Card>
      </div>
    );
  }

  const sc = statusConfig[despesa.status] || statusConfig.pendente;
  const StatusIcon = sc.icon;

  type Step = {
    icon: any;
    title: string;
    actor?: string;
    actorRole?: string;
    date?: string;
    description?: string;
    state: "done" | "current" | "pending" | "rejected";
  };

  const steps: Step[] = [
    {
      icon: Send,
      title: "Solicitação criada",
      actor: despesa.requestedBy,
      actorRole: despesa.requesterRole,
      date: despesa.date,
      description: despesa.justification,
      state: "done",
    },
    {
      icon: UserCheck,
      title: "Em análise",
      actor: despesa.responsavel,
      actorRole: despesa.responsavelRole,
      date: despesa.date,
      description: "Atribuída ao responsável financeiro para análise e validação.",
      state: "done",
    },
    despesa.status === "aprovada"
      ? {
          icon: CheckCircle2,
          title: "Aprovada",
          actor: despesa.approvedBy,
          actorRole: "Director Financeiro",
          date: despesa.approvedDate,
          description: "A despesa foi aprovada e enviada para processamento.",
          state: "done" as const,
        }
      : despesa.status === "rejeitada"
        ? {
            icon: XCircle,
            title: "Rejeitada",
            actor: despesa.approvedBy,
            actorRole: "Director Financeiro",
            date: despesa.approvedDate,
            description: "A solicitação foi rejeitada e devolvida ao requerente.",
            state: "rejected" as const,
          }
        : {
            icon: Clock,
            title: "Aguarda decisão",
            actor: despesa.responsavel,
            actorRole: despesa.responsavelRole,
            description: "A aguardar aprovação ou rejeição pelo responsável.",
            state: "current" as const,
          },
    despesa.status === "aprovada"
      ? {
          icon: Wallet,
          title: despesa.paidDate ? "Pagamento processado" : "A processar pagamento",
          actor: "Tesouraria",
          actorRole: "Departamento Financeiro",
          date: despesa.paidDate,
          description: despesa.paidDate
            ? `Transferência efectuada no valor de ${formatCurrency(despesa.amount)}.`
            : "Pagamento agendado para os próximos dias úteis.",
          state: despesa.paidDate ? ("done" as const) : ("current" as const),
        }
      : despesa.status === "pendente"
        ? {
            icon: Wallet,
            title: "Pagamento",
            description: "Disponível após aprovação.",
            state: "pending" as const,
          }
        : null,
  ].filter(Boolean) as Step[];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/financas/despesas")} className="gap-1 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Voltar a Despesas
      </Button>

      {/* Header card */}
      <Card className="p-6 border-border/70">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-mono">#{despesa.id.toUpperCase()}</span>
                  <span>•</span>
                  <span>{fmtDateLong(despesa.date)}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{despesa.description}</h1>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="text-[11px] gap-1">
                    <Tag className="w-3 h-3" /> {despesa.category}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[11px] gap-1", sc.cls)}>
                    <StatusIcon className="w-3 h-3" /> {sc.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor</p>
                <p className="text-3xl font-bold text-destructive">-{formatCurrency(despesa.amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {despesa.status === "pendente" && (
          <>
            <Separator className="my-5" />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => toast({ title: "Despesa rejeitada" })}
              >
                <X className="w-4 h-4" /> Rejeitar
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => toast({ title: "Despesa aprovada" })}
              >
                <Check className="w-4 h-4" /> Aprovar
              </Button>
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Histórico do Pedido
            </h2>
            <span className="text-xs text-muted-foreground">{steps.length} etapas</span>
          </div>

          <ol className="relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;
              const palette =
                step.state === "rejected"
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : step.state === "done"
                    ? "bg-accent/15 text-accent border-accent/30"
                    : step.state === "current"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-muted text-muted-foreground border-border";
              const linePalette =
                step.state === "done" ? "bg-accent/40" : "bg-border";
              return (
                <li key={idx} className="relative pl-12 pb-6 last:pb-0">
                  {!isLast && (
                    <span className={cn("absolute left-[19px] top-9 bottom-0 w-px", linePalette)} />
                  )}
                  <span
                    className={cn(
                      "absolute left-0 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center",
                      palette
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="pt-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">{step.title}</p>
                      {step.date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {fmtDateShort(step.date)}
                        </span>
                      )}
                    </div>
                    {step.actor && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span className="text-foreground font-medium">{step.actor}</span>
                        {step.actorRole && <span>· {step.actorRole}</span>}
                      </p>
                    )}
                    {step.description && (
                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/50">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Right column — metadata + comprovativo */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Detalhes
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Solicitado por</dt>
                <dd className="font-medium text-foreground">{despesa.requestedBy || "—"}</dd>
                {despesa.requesterRole && (
                  <dd className="text-xs text-muted-foreground">{despesa.requesterRole}</dd>
                )}
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Responsável</dt>
                <dd className="font-medium text-foreground">{despesa.responsavel || "—"}</dd>
                {despesa.responsavelRole && (
                  <dd className="text-xs text-muted-foreground">{despesa.responsavelRole}</dd>
                )}
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoria</dt>
                <dd className="font-medium text-foreground">{despesa.category}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data do pedido</dt>
                <dd className="font-medium text-foreground">{fmtDateLong(despesa.date)}</dd>
              </div>
              {despesa.approvedDate && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {despesa.status === "rejeitada" ? "Rejeitada em" : "Aprovada em"}
                    </dt>
                    <dd className="font-medium text-foreground">{fmtDateLong(despesa.approvedDate)}</dd>
                  </div>
                </>
              )}
              {despesa.paidDate && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paga em</dt>
                    <dd className="font-medium text-foreground">{fmtDateLong(despesa.paidDate)}</dd>
                  </div>
                </>
              )}
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Comprovativo
            </h3>
            {despesa.status === "aprovada" ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => toast({ title: "Comprovativo aberto" })}
              >
                <FileText className="w-4 h-4" /> Abrir comprovativo
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Não tem. Comprovativo é gerado após aprovação e pagamento.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Comunicação
            </h3>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => toast({ title: "A abrir mensagem..." })}>
              <MessageSquare className="w-4 h-4" /> Mensagem ao solicitante
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
