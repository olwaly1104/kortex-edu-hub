import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, TrendingDown, Tag, Calendar, User, UserCheck,
  FileText, Check, X, Clock, CheckCircle2, XCircle, Send, Wallet, MessageSquare,
  Users, Share2, Eye, Download, Mail, ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { despesas, formatCurrency } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DespesaDocPreview from "./DespesaDocPreview";

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
              <div className="shrink-0 flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor</p>
                  <p className="text-3xl font-bold text-destructive">-{formatCurrency(despesa.amount)}</p>
                </div>
                <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                  <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <FileText className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-[11px] font-semibold text-foreground tabular-nums">Despesa-{despesa.id.toUpperCase()}</span>
                    <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">Gerado automaticamente</span>
                  </div>
                  <span className="self-stretch w-px bg-border mx-0.5" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="inline-flex items-center gap-1 px-1 h-5 rounded text-[10px] text-primary hover:bg-muted font-medium transition-colors" title="Partilhas">
                        <Users className="w-3 h-3" /> 4
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-base flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-primary" /> Partilhado com 4 pessoas
                        </DialogTitle>
                        <DialogDescription className="text-[12px]">
                          Pessoas com acesso ao documento <span className="font-medium text-foreground">Despesa-{despesa.id.toUpperCase()}</span>.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 mt-2">
                        {[
                          { name: "Dr. Manuel Tavares", role: "Director Financeiro", access: "Editar" },
                          { name: despesa.responsavel || "Responsável Financeiro", role: despesa.responsavelRole || "Tesouraria", access: "Editar" },
                          { name: despesa.requestedBy || "Solicitante", role: despesa.requesterRole || "Departamento", access: "Visualizar" },
                          { name: "Reitoria", role: "Auditoria", access: "Visualizar" },
                        ].map((p, i) => {
                          const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("");
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                                {ini}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{p.role}</p>
                              </div>
                              <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 shrink-0">{p.access}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver documento">
                        <Eye className="w-3 h-3" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
                      <DialogHeader className="sr-only">
                        <DialogTitle>Documento Despesa-{despesa.id.toUpperCase()}</DialogTitle>
                        <DialogDescription>Pré-visualização do documento financeiro gerado.</DialogDescription>
                      </DialogHeader>
                      <DespesaDocPreview despesa={despesa} />
                    </DialogContent>
                  </Dialog>
                  <button
                    type="button"
                    onClick={() => toast({ title: "Documento exportado", description: `Despesa-${despesa.id.toUpperCase()}.pdf` })}
                    className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Exportar"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        {/* Right column — detalhes + documentos unificados */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Detalhes da Despesa
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Solicitado por</dt>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <dd className="font-medium text-foreground truncate">{despesa.requestedBy || "—"}</dd>
                    {despesa.requesterRole && (
                      <dd className="text-xs text-muted-foreground truncate">{despesa.requesterRole}</dd>
                    )}
                  </div>
                  {despesa.requestedBy && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toast({ title: "Conversa aberta", description: `Chat com ${despesa.requestedBy}` })}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={`Chat com ${despesa.requestedBy}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Email", description: `Compor email para ${despesa.requestedBy}` })}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={`Email a ${despesa.requestedBy}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Responsável</dt>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <dd className="font-medium text-foreground truncate">{despesa.responsavel || "—"}</dd>
                    {despesa.responsavelRole && (
                      <dd className="text-xs text-muted-foreground truncate">{despesa.responsavelRole}</dd>
                    )}
                  </div>
                  {despesa.responsavel && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toast({ title: "Conversa aberta", description: `Chat com ${despesa.responsavel}` })}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={`Chat com ${despesa.responsavel}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast({ title: "Email", description: `Compor email para ${despesa.responsavel}` })}
                        className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={`Email a ${despesa.responsavel}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data do pedido</dt>
                <dd className="font-medium text-foreground">{fmtDateLong(despesa.date)}</dd>
              </div>
              <Separator />
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoria</dt>
                <dd className="font-medium text-foreground">{despesa.category}</dd>
              </div>
              <Separator />
              {(() => {
                const endDate = despesa.paidDate || despesa.approvedDate;
                let duration = "—";
                if (despesa.date) {
                  const end = endDate ? new Date(endDate) : new Date();
                  const start = new Date(despesa.date);
                  const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
                  duration = endDate
                    ? `${days} ${days === 1 ? "dia" : "dias"}`
                    : `${days} ${days === 1 ? "dia" : "dias"} (em curso)`;
                }
                return (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estado</dt>
                    <dd className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", sc.cls)}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </dd>
                    <dd className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Duração: <span className="text-foreground font-medium">{duration}</span></span>
                    </dd>
                  </div>
                );
              })()}
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

            {/* Documentos — secção inferior */}
            <Separator className="my-5" />
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Documentos
            </h4>
            <div className="space-y-2">
              {/* Factura — sempre disponível */}
              <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-muted/20 transition-all">
                <div className="w-9 h-9 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold text-foreground truncate">Factura</p>
                    <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">FAC-{despesa.id.toUpperCase()}.pdf</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast({ title: "Factura aberta", description: `FAC-${despesa.id.toUpperCase()}.pdf` })}
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Ver"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast({ title: "Download iniciado", description: `FAC-${despesa.id.toUpperCase()}.pdf` })}
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comprovativo — disponível só quando aprovada */}
              {despesa.status === "aprovada" ? (
                <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-muted/20 transition-all">
                  <div className="w-9 h-9 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-foreground truncate">Comprovativo</p>
                      <CheckCircle2 className="w-3 h-3 text-accent shrink-0" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">COMP-{despesa.id.toUpperCase()}.pdf</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toast({ title: "Comprovativo aberto", description: `COMP-${despesa.id.toUpperCase()}.pdf` })}
                      className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Ver"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast({ title: "Download iniciado", description: `COMP-${despesa.id.toUpperCase()}.pdf` })}
                      className="w-7 h-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-border bg-muted/15">
                  <div className="w-9 h-9 rounded-md bg-muted/60 border border-border flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-muted-foreground truncate">Comprovativo</p>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-destructive/80 bg-destructive/10 border border-destructive/20 px-1.5 py-px rounded">
                        <X className="w-2.5 h-2.5" /> Pendente
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 font-mono truncate">COMP-{despesa.id.toUpperCase()}.pdf</p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <span className="text-[10px] text-muted-foreground/70 italic pr-1">Após pagamento</span>
                  </div>
                </div>
              )}
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
