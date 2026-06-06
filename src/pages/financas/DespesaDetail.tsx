import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, TrendingDown, Tag, Calendar, User, UserCheck,
  FileText, Clock, CheckCircle2, XCircle, Send, Wallet, MessageSquare,
  Users, Share2, Eye, Download, AlertTriangle, Upload, Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { despesas, formatCurrency } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DespesaDocPreview from "./DespesaDocPreview";

const statusConfig: Record<string, { label: string; cls: string; dot: string; icon: any }> = {
  aprovada: { label: "Aprovada", cls: "bg-accent/15 text-accent border-accent/30", dot: "bg-accent", icon: CheckCircle2 },
  pendente: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: Clock },
  rejeitada: { label: "Rejeitada", cls: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive", icon: XCircle },
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
      state: "done",
    },
    {
      icon: UserCheck,
      title: "Em análise",
      actor: despesa.responsavel,
      actorRole: despesa.responsavelRole,
      date: despesa.date,
      state: "done",
    },
    despesa.status === "aprovada"
      ? { icon: CheckCircle2, title: "Aprovada", actor: despesa.approvedBy, actorRole: "Director Financeiro", date: despesa.approvedDate, state: "done" as const }
      : despesa.status === "rejeitada"
        ? { icon: XCircle, title: "Rejeitada", actor: despesa.approvedBy, actorRole: "Director Financeiro", date: despesa.approvedDate, state: "rejected" as const }
        : { icon: Clock, title: "Aguarda decisão", actor: despesa.responsavel, actorRole: despesa.responsavelRole, state: "current" as const },
    despesa.status === "aprovada"
      ? {
          icon: Wallet,
          title: despesa.paidDate ? "Pagamento processado" : "A processar pagamento",
          actor: "Tesouraria",
          actorRole: "Departamento Financeiro",
          date: despesa.paidDate,
          state: despesa.paidDate ? ("done" as const) : ("current" as const),
        }
      : despesa.status === "pendente"
        ? { icon: Wallet, title: "Pagamento", state: "pending" as const }
        : null,
  ].filter(Boolean) as Step[];

  const facturaPresent = despesa.status !== "pendente";
  const comprovativoPresent = despesa.status === "aprovada" && !!despesa.paidDate;
  const missingCount = (facturaPresent ? 0 : 1) + (comprovativoPresent ? 0 : 1);
  const hasAlert = !facturaPresent || (despesa.status === "aprovada" && !comprovativoPresent);

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-6xl">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/financas/despesas")} className="gap-1 -ml-2 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar a Despesas
      </Button>

      {/* ── ONE COHESIVE PAGE CARD ─────────────────────────────────── */}
      <Card className="overflow-hidden border-border/70">

        {/* ════════ 1. IDENTITY HEADER ════════ */}
        <div className="p-6 lg:p-8 bg-gradient-to-br from-muted/30 via-background to-background border-b border-border">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/15">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5 font-mono">
                  <span className="font-semibold">#{despesa.id.toUpperCase()}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{fmtDateLong(despesa.date)}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">{despesa.description}</h1>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Badge variant="outline" className="text-[10.5px] gap-1 font-medium">
                    <Tag className="w-3 h-3" /> {despesa.category}
                  </Badge>
                  {despesa.department && (
                    <Badge variant="outline" className="text-[10.5px] gap-1 font-medium">
                      <Building2 className="w-3 h-3" /> {despesa.department}
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("text-[10.5px] gap-1 font-semibold", sc.cls)}>
                    <StatusIcon className="w-3 h-3" /> {sc.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-semibold mb-1">Valor</p>
              <p className="text-3xl lg:text-[34px] font-bold text-destructive tabular-nums leading-none">
                -{formatCurrency(despesa.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* ════════ 2. KEY METADATA STRIP ════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border border-b border-border">
          <MetaCell label="Solicitante" value={despesa.requestedBy || "—"} sub={despesa.requesterRole} />
          <MetaCell label="Responsável" value={despesa.responsavel || "—"} sub={despesa.responsavelRole} />
          <MetaCell
            label={despesa.status === "rejeitada" ? "Rejeitada em" : "Aprovada em"}
            value={fmtDateShort(despesa.approvedDate)}
            sub={despesa.approvedBy}
          />
          <MetaCell label="Pagamento" value={fmtDateShort(despesa.paidDate)} sub={despesa.paidDate ? "Tesouraria" : "—"} />
        </div>

        {/* ════════ 3. DOCUMENTS BLOCK ════════ */}
        <div className="p-6 lg:p-8 border-b border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
                <FileText className="w-4 h-4 text-primary" /> Documentos
              </h2>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Factura e comprovativo de pagamento obrigatórios.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {missingCount > 0 ? (
                <Badge variant="outline" className="text-[10.5px] gap-1 bg-amber-50 text-amber-700 border-amber-200 font-semibold">
                  <AlertTriangle className="w-3 h-3" /> {missingCount} em falta
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10.5px] gap-1 bg-accent/15 text-accent border-accent/30 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Completo
                </Badge>
              )}

              {/* Doc pill: sharing / view / export */}
              <div className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <span className="text-[10.5px] font-mono font-semibold text-muted-foreground">
                  Despesa-{despesa.id.toUpperCase()}
                </span>
                <span className="self-stretch w-px bg-border mx-1" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 px-1.5 h-6 rounded text-[10.5px] text-primary hover:bg-muted font-semibold transition-colors" title="Partilhas">
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
                    <button type="button" className="w-6 h-6 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver documento">
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
                  className="w-6 h-6 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {hasAlert && (
            <div className="flex items-start gap-2.5 p-3 rounded-md border bg-amber-50/70 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[12px] leading-snug text-amber-900">
                <p className="font-semibold mb-0.5">Documentos em falta</p>
                <p className="text-amber-800/90">
                  {!facturaPresent
                    ? "Esta despesa ainda não tem factura. O ficheiro deve ser carregado pelo requerente para validar o pedido."
                    : "A despesa está aprovada mas o comprovativo de pagamento ainda não foi carregado."}
                </p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Factura */}
            {facturaPresent ? (
              <DocTile
                kind="factura"
                fileName={`FAC-${despesa.id.toUpperCase()}.pdf`}
                onClick={() => toast({ title: "Factura aberta", description: `FAC-${despesa.id.toUpperCase()}.pdf` })}
              />
            ) : (
              <DocTileMissing label="Factura" onUpload={() => toast({ title: "Carregar factura" })} />
            )}

            {/* Comprovativo */}
            {comprovativoPresent ? (
              <DocTile
                kind="comprovativo"
                fileName={`COMP-${despesa.id.toUpperCase()}.pdf`}
                onClick={() => toast({ title: "Comprovativo aberto", description: `COMP-${despesa.id.toUpperCase()}.pdf` })}
              />
            ) : despesa.status === "aprovada" ? (
              <DocTileMissing label="Comprovativo" onUpload={() => toast({ title: "Carregar comprovativo" })} />
            ) : (
              <DocTilePending label="Comprovativo" hint="Disponível após pagamento" />
            )}
          </div>
        </div>

        {/* ════════ 4. JUSTIFICAÇÃO ════════ */}
        {despesa.justification && (
          <div className="p-6 lg:p-8 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3 tracking-tight">
              <MessageSquare className="w-4 h-4 text-primary" /> Justificação
            </h2>
            <p className="text-[13.5px] leading-relaxed text-foreground/85 bg-muted/30 rounded-lg p-4 border border-border/50 whitespace-pre-line">
              {despesa.justification}
            </p>
          </div>
        )}

        {/* ════════ 5. CRONOLOGIA ════════ */}
        <div className="p-6 lg:p-8 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
              <Clock className="w-4 h-4 text-primary" /> Cronologia
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">{steps.length} etapas</span>
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
              const linePalette = step.state === "done" ? "bg-accent/40" : "bg-border";
              return (
                <li key={idx} className="relative pl-11 pb-5 last:pb-0">
                  {!isLast && <span className={cn("absolute left-[17px] top-9 bottom-0 w-px", linePalette)} />}
                  <span className={cn("absolute left-0 top-0 w-9 h-9 rounded-full border-2 flex items-center justify-center", palette)}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="pt-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-semibold text-[13px] text-foreground">{step.title}</p>
                      {step.date && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium tabular-nums">
                          <Calendar className="w-3 h-3" /> {fmtDateShort(step.date)}
                        </span>
                      )}
                    </div>
                    {step.actor && (
                      <p className="text-[11.5px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span className="text-foreground font-medium">{step.actor}</span>
                        {step.actorRole && <span>· {step.actorRole}</span>}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ════════ 6. FOOTER ACTIONS ════════ */}
        <div className="px-6 lg:px-8 py-4 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11.5px] text-muted-foreground">
            Registado a <span className="font-medium text-foreground">{fmtDateLong(despesa.date)}</span> · Ref. <span className="font-mono font-semibold text-foreground">{despesa.id.toUpperCase()}</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-[12px]"
            onClick={() => toast({ title: "A abrir mensagem..." })}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Mensagem ao solicitante
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function MetaCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-5 py-4 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1">{label}</p>
      <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function DocTile({
  kind, fileName, onClick,
}: { kind: "factura" | "comprovativo"; fileName: string; onClick: () => void }) {
  const isFac = kind === "factura";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3.5 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
    >
      <div className={cn(
        "w-11 h-11 rounded-lg border flex items-center justify-center shrink-0",
        isFac ? "bg-red-50 border-red-200" : "bg-accent/15 border-accent/30"
      )}>
        {isFac ? <FileText className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-accent" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-0.5">
          {isFac ? "Factura" : "Comprovativo de pagamento"}
        </p>
        <p className="text-[12.5px] font-semibold text-foreground truncate font-mono">{fileName}</p>
      </div>
      <Download className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
    </button>
  );
}

function DocTileMissing({ label, onUpload }: { label: string; onUpload: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/40">
      <div className="w-11 h-11 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-amber-700 font-semibold mb-0.5">{label}</p>
        <p className="text-[12.5px] font-semibold text-amber-900">Em falta</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-[11.5px] gap-1 border-amber-300 text-amber-800 hover:bg-amber-100"
        onClick={onUpload}
      >
        <Upload className="w-3 h-3" /> Carregar
      </Button>
    </div>
  );
}

function DocTilePending({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-dashed border-border bg-muted/20">
      <div className="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-0.5">{label}</p>
        <p className="text-[12.5px] font-semibold text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
