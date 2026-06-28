import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Clock, FileText, MessageSquare, Mail, Phone, Check, X, Hourglass, Send,
  Eye, Download, Users, Share2, Paperclip, FileImage, FileSpreadsheet, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Lock, Pencil, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  finStatusMeta, finTypeMeta, type FinSolicitacao,
} from "@/data/financasSolicitacoesData";
import { fetchFinSolicitacao } from "@/hooks/useFinSolicitacoes";
import FinancasSolicitacaoDocPreview from "./SolicitacaoDocPreview";

export default function FinancasSolicitacaoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [baseSelected, setBaseSelected] = useState<FinSolicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusOverride, setStatusOverride] = useState<null | "em_execucao" | "executada" | "rejeitado">(null);
  const [pendingAction, setPendingAction] = useState<null | "em_execucao" | "executada" | "rejeitado">(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionFiles, setActionFiles] = useState<File[]>([]);
  const [actionStep, setActionStep] = useState<0 | 1 | 2>(0);
  const [maxStep, setMaxStep] = useState<0 | 1 | 2>(0);
  const [declarationChecked, setDeclarationChecked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchFinSolicitacao(id).then(r => { setBaseSelected(r); setLoading(false); });
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">A carregar…</div>;
  }

  if (!baseSelected) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Solicitação não encontrada.</p>
        <Button onClick={() => navigate("/financas/solicitacoes")} className="mt-4" variant="outline">Voltar</Button>
      </div>
    );
  }

  const selected = { ...baseSelected, status: (statusOverride ?? baseSelected.status) as typeof baseSelected.status };

  const st = finStatusMeta[selected.status];
  const tm = finTypeMeta[selected.type];
  const isRecebida = selected.direction === "recebida";
  const counterpart = selected.requester;
  const counterpartRole = selected.requesterRole;

  const dSub = new Date(selected.date);
  const fmt = (d: Date) => d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
  const initials = counterpart.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const anexos = selected.anexos ?? [];

  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; previsao?: string; anexos?: typeof anexos; tone: "submitted" | "accepted" | "rejected" | "executed" | "pending" | "scheduled" };
  const steps: Step[] = [];

  const decisionActor = isRecebida ? "Direcção Financeira" : counterpart;
  const isRejected = selected.status === "rejeitado";
  const isExecucao = selected.status === "em_execucao" || selected.status === "executada";
  const isExecutada = selected.status === "executada";

  // Forecast helpers
  const baseDue = selected.dueDate ? new Date(selected.dueDate) : null;
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const decisionForecast = baseDue ?? addDays(hoje, 5);
  const execStartForecast = addDays(decisionForecast, 1);
  const execEndForecast = addDays(decisionForecast, 5);

  // 1. Submetida
  const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  steps.push({
    label: "Solicitação submetida",
    data: submetida?.data, actor: submetida?.actor ?? selected.requester,
    nota: submetida?.nota, anexos: submetida?.anexos,
    tone: "submitted",
  });

  // 2. Decisão (aprovada / rejeitada)
  if (isRejected) {
    const rej = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"));
    steps.push({ label: "Solicitação rejeitada", data: rej?.data, actor: rej?.actor ?? decisionActor, nota: rej?.nota, anexos: rej?.anexos, tone: "rejected" });
  } else if (isExecucao) {
    const ap = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("aprov"));
    steps.push({ label: "Solicitação em Execução", data: ap?.data, actor: ap?.actor ?? decisionActor, nota: ap?.nota, anexos: ap?.anexos, tone: "accepted" });
  } else {
    const diff = Math.ceil((decisionForecast.getTime() - hoje.getTime()) / 86400000);
    const overdue = diff < 0;
    const aside = overdue
      ? `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} em atraso`
      : diff === 0 ? "Prazo termina hoje" : `Faltam ${diff} ${diff === 1 ? "dia" : "dias"}`;
    steps.push({
      label: "Aguardando decisão",
      actor: decisionActor,
      previsao: `Previsão · ${fmt(decisionForecast)}`,
      aside,
      tone: overdue ? "rejected" : "scheduled",
    });
  }

  // 3 & 4. Execução / Concluída — skip if rejected
  if (!isRejected) {
    if (isExecucao) {
      // mid-step: execução in progress
      if (!isExecutada) {
        steps.push({
          label: "Solicitação executada",
          actor: "Direcção Financeira",
          previsao: `Previsão · ${fmt(execEndForecast)}`,
          tone: "pending",
        });
      }
      if (isExecutada) {
        const ex = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("execut"));
        steps.push({ label: "Solicitação executada", data: ex?.data, actor: ex?.actor ?? "Direcção Financeira", nota: ex?.nota, anexos: ex?.anexos, tone: "executed" });
      }
    } else {
      steps.push({
        label: "Em execução",
        actor: "Direcção Financeira",
        previsao: `Previsão · ${fmt(execStartForecast)}`,
        tone: "pending",
      });
      steps.push({
        label: "Solicitação executada",
        actor: "Direcção Financeira",
        previsao: `Previsão · ${fmt(execEndForecast)}`,
        tone: "pending",
      });
    }
  }


  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted:  "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected:  "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed:  "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    scheduled: "bg-amber-400 text-white ring-4 ring-amber-400/40 animate-pulse",
    pending:   "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  const openAction = (action: "em_execucao" | "rejeitado" | "executada") => {
    setActionNotes("");
    setActionFiles([]);
    setActionStep(0);
    setMaxStep(0);
    setDeclarationChecked(false);
    setPendingAction(action);
  };

  const goToStep = (s: 0 | 1 | 2) => {
    if (s <= maxStep) setActionStep(s);
  };
  const advance = () => {
    const next = Math.min(2, actionStep + 1) as 0 | 1 | 2;
    setActionStep(next);
    if (next > maxStep) setMaxStep(next);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const action = pendingAction;
    setStatusOverride(action);
    const titles: Record<typeof action, string> = {
      em_execucao: "Solicitação aprovada",
      rejeitado: "Solicitação rejeitada",
      executada: "Solicitação executada",
    };
    const descs: Record<typeof action, string> = {
      em_execucao: `O pedido ${selected.ref} foi aprovado e está em execução.`,
      rejeitado: `O pedido ${selected.ref} foi rejeitado.`,
      executada: `O pedido ${selected.ref} foi marcado como executado.`,
    };
    toast({ title: titles[action], description: descs[action] });
    setPendingAction(null);
    setActionNotes("");
    setActionFiles([]);
  };

  const actionMeta: Record<"em_execucao" | "rejeitado" | "executada", { title: string; desc: string; cta: string; tone: string; accent: string; iconBg: string; icon: typeof Check; notesLabel: string; notesPlaceholder: string }> = {
    em_execucao: {
      title: "Aprovar solicitação",
      desc: "Carregue anexos ou evidências para registo da aprovação.",
      cta: "Confirmar",
      tone: "bg-emerald-600 hover:bg-emerald-700 text-white",
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      icon: CheckCircle2,
      notesLabel: "Parecer / Justificação",
      notesPlaceholder: "Ex: Pedido validado conforme orçamento de Maio. Em conformidade com a política financeira.",
    },
    rejeitado: {
      title: "Rejeitar solicitação",
      desc: "Carregue anexos ou evidências para registo da rejeição.",
      cta: "Rejeitar",
      tone: "bg-red-600 hover:bg-red-700 text-white",
      accent: "text-red-600",
      iconBg: "bg-red-50 text-red-600 ring-1 ring-red-100",
      icon: XCircle,
      notesLabel: "Motivo da rejeição",
      notesPlaceholder: "Ex: Documentação incompleta. Falta fatura original e comprovativo bancário.",
    },
    executada: {
      title: "Confirmar execução",
      desc: "Carregue anexos ou evidências para registo da execução.",
      cta: "Confirmar execução",
      tone: "bg-blue-600 hover:bg-blue-700 text-white",
      accent: "text-blue-600",
      iconBg: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
      icon: Check,
      notesLabel: "Notas da execução",
      notesPlaceholder: "Ex: Reembolso transferido para IBAN do requerente em 14/06/2026. Ref. transação TRX-44821.",
    },
  };

  const pm = pendingAction ? actionMeta[pendingAction] : null;


  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/financas/solicitacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Solicitações
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Lectivo 2024/2025</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/financas/solicitacoes" className="text-muted-foreground hover:text-foreground transition-colors">Solicitações</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{selected.ref}</span>
        </div>

        {/* Decision bar */}
        {isRecebida && (selected.status === "pendente" || selected.status === "atrasado") && (
          <div className="px-6 pt-3">
            <div className={cn("flex items-center justify-between rounded-lg border px-4 py-2.5", selected.status === "atrasado" ? "border-orange-200 bg-orange-50/40" : "border-border bg-background")}>
              <div className="flex items-center gap-2.5">
                <Hourglass className={cn("w-4 h-4 shrink-0", selected.status === "atrasado" ? "text-orange-600" : "text-amber-600")} />
                <span className="text-sm font-semibold text-foreground">{selected.status === "atrasado" ? "Decisão em atraso" : "Aguardando decisão"}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {selected.dueDate ? (() => {
                    const base = new Date(selected.dueDate);
                    const hoje = new Date(); hoje.setHours(0,0,0,0);
                    const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
                    if (diff < 0) return `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} em atraso`;
                    if (diff === 0) return "Prazo termina hoje";
                    return `${diff} ${diff === 1 ? "dia" : "dias"} restantes`;
                  })() : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors" onClick={() => openAction("rejeitado")}>
                  <XCircle className="w-3.5 h-3.5" /> Rejeitar
                </Button>
                <Button size="sm" className="h-7 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" onClick={() => openAction("em_execucao")}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Execution bar — after approval */}
        {isRecebida && selected.status === "em_execucao" && (
          <div className="px-6 pt-3">
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Hourglass className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="text-sm font-semibold text-foreground">Em execução</span>
                <span className="text-[11px] text-muted-foreground">Aguarda confirmação de execução</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-7 text-[11px] gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition-colors" onClick={() => openAction("executada")}>
                  <Check className="w-3.5 h-3.5" /> Confirmar execução
                </Button>
              </div>
            </div>
          </div>
        )}


        {/* Title block */}
        <div className="px-6 pt-4 pb-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
            {/* Date tile */}
            <div className="shrink-0 w-[60px] rounded-md border border-border overflow-hidden bg-background text-center">
              <div className="bg-primary/90 py-0.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-primary-foreground font-bold">
                  {dSub.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "")}
                </p>
              </div>
              <div className="py-1">
                <p className="text-[24px] leading-none font-bold text-foreground tabular-nums tracking-tight">
                  {String(dSub.getDate()).padStart(2, "0")}
                </p>
                <p className="text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5 capitalize">
                  {dSub.toLocaleDateString("pt-PT", { weekday: "short" }).replace(".", "").slice(0, 3)}
                </p>
              </div>
            </div>

            {/* Title + badges */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{selected.title}</h1>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", st.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                  {st.label}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", tm.cls)}>
                  <tm.icon className="w-3 h-3" /> {tm.label}
                </Badge>
              </div>
            </div>

            {/* Right — REF + Doc pill */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(selected.ref); toast({ title: "Referência copiada", description: selected.ref }); }}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
              >
                {selected.ref}
              </button>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">Pedido-{selected.ref}</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">Gerado automaticamente</span>
                </div>
                <span className="self-stretch w-px bg-border mx-0.5" />

                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 px-1 h-5 rounded text-[10px] text-primary hover:bg-muted font-medium transition-colors" title="Partilhas">
                      <Users className="w-3 h-3" /> 3
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary" /> Partilhado com 3 pessoas
                      </DialogTitle>
                      <DialogDescription className="text-[12px]">
                        Pessoas com acesso ao documento <span className="font-medium text-foreground">Pedido-{selected.ref}</span>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 mt-2">
                      {[
                        { name: "Prof. Dr. António Mendes", role: "Reitor", access: "Visualizar" },
                        { name: "Dr. Manuel Sousa", role: "Direcção Financeira", access: "Editar" },
                        { name: selected.requester, role: counterpartRole ?? "Requerente", access: "Visualizar" },
                      ].map((p, i) => {
                        const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("");
                        return (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">{ini}</div>
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
                      <DialogTitle>Documento Pedido-{selected.ref}</DialogTitle>
                      <DialogDescription>Pré-visualização do documento institucional gerado.</DialogDescription>
                    </DialogHeader>
                    <FinancasSolicitacaoDocPreview solicitacao={selected} />
                  </DialogContent>
                </Dialog>

                <button
                  type="button"
                  onClick={() => toast({ title: "Documento exportado", description: `Pedido-${selected.ref}` })}
                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column body */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border border-t border-border">
          {/* LEFT */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">
                Requerente
              </p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">{counterpart}</p>
                  {counterpartRole && <p className="text-[11px] text-muted-foreground mt-0.5">{counterpartRole}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><MessageSquare className="w-3 h-3" /> Chat</Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Mail className="w-3 h-3" /> Email</Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Phone className="w-3 h-3" /> Ligar</Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Responsável</p>
              {(() => {
                const respFull = selected.responsavel ?? "Dr. Manuel Sousa · Direcção Financeira";
                const [respName, respRole] = respFull.split(" · ");
                return (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                        {respName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground leading-tight truncate">{respName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{respRole ?? "Direcção Financeira"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><MessageSquare className="w-3 h-3" /> Chat</Button>
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Mail className="w-3 h-3" /> Email</Button>
                      <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Phone className="w-3 h-3" /> Ligar</Button>
                    </div>
                  </>
                );
              })()}
            </div>

          </aside>

          {/* RIGHT */}
          <main className="p-6 space-y-6 min-w-0">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Detalhes da Solicitação</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                <FactItem label="Submetido" value={fmt(dSub)} />
                <FactItem label="Hora" value={fmtT(dSub)} />
                <FactItem label="Categoria" value={tm.label} />
                <FactItem label="Estado" value={st.label} />
              </div>
            </section>

            <div className="border-t border-border" />

            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Descrição da Solicitação</h3>
              </div>
              <div className="rounded-lg border border-border bg-background overflow-hidden divide-y divide-border">
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-1.5">Justificação</p>
                  <p className="text-[13.5px] text-foreground/90 leading-[1.65] whitespace-pre-line">{selected.description}</p>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">
                    Anexos <span className="text-muted-foreground/70 normal-case tracking-normal tabular-nums">({anexos.length})</span>
                  </p>
                  {anexos.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">Anexo 0</p>
                  ) : (
                    <ul className="divide-y divide-border/70">
                      {anexos.map((a, i) => {
                        const { Icon, cls } = anexoIcon(a.tipo);
                        return (
                          <li key={i} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                            <div className={cn("w-8 h-8 rounded-md border flex items-center justify-center shrink-0", cls)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium text-foreground leading-tight truncate">{a.nome}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.tamanho}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button type="button" onClick={() => toast({ title: "A abrir anexo", description: a.nome })} className="w-7 h-7 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => toast({ title: "Anexo descarregado", description: a.nome })} className="w-7 h-7 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Descarregar">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* Cronologia */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Cronologia</h3>
              </div>
              <ol className="space-y-0">
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  const Icon =
                    s.tone === "rejected" ? X :
                    s.tone === "scheduled" ? Hourglass :
                    s.tone === "pending" ? null :
                    Check;
                  return (
                    <li key={i} className="flex gap-3 relative">
                      <div className="flex flex-col items-center shrink-0 w-5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10", nodeCls[s.tone])}>
                          {Icon && <Icon className="w-3 h-3" strokeWidth={3} />}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className={cn("flex-1 min-w-0", !isLast && "pb-5")}>
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className={cn("text-sm font-medium", s.tone === "pending" ? "text-muted-foreground" : "text-foreground")}>{s.label}</p>
                          {s.data && <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{s.data}</span>}
                          {!s.data && s.previsao && <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 tabular-nums whitespace-nowrap font-medium">{s.previsao}</span>}
                        </div>
                        {s.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor}</p>}
                        {s.aside && (
                          <p className={cn("mt-1.5 text-[11px] italic",
                            s.aside.includes("atraso") ? "text-red-600 font-semibold not-italic" : "text-muted-foreground/90"
                          )}>{s.aside}</p>
                        )}
                        {s.nota && (
                          <div className="mt-2 pl-3 border-l-2 border-border">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-0.5">Parecer / Notas</p>
                            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{s.nota}</p>
                          </div>
                        )}
                        {s.anexos && s.anexos.length > 0 && (
                          <div className="mt-2 pl-3 border-l-2 border-border">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-1">
                              Anexos <span className="normal-case tracking-normal tabular-nums">({s.anexos.length})</span>
                            </p>
                            <ul className="space-y-1">
                              {s.anexos.map((a, ai) => {
                                const Ic = a.tipo === "image" ? FileImage : a.tipo === "sheet" ? FileSpreadsheet : FileText;
                                const cls = a.tipo === "image" ? "text-violet-600" : a.tipo === "sheet" ? "text-emerald-600" : "text-red-600";
                                return (
                                  <li key={ai} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-border bg-background hover:bg-muted/20 transition-colors">
                                    <Ic className={cn("w-3 h-3 shrink-0", cls)} />
                                    <span className="text-[11px] font-medium text-foreground truncate flex-1 leading-tight">{a.nome}</span>
                                    <span className="text-[9.5px] text-muted-foreground tabular-nums shrink-0">{a.tamanho}</span>
                                    <div className="flex items-center shrink-0">
                                      <button type="button" onClick={() => toast({ title: "A abrir anexo", description: a.nome })} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver">
                                        <Eye className="w-2.5 h-2.5" />
                                      </button>
                                      <button type="button" onClick={() => toast({ title: "Anexo descarregado", description: a.nome })} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Descarregar">
                                        <Download className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        </div>
      </Card>
      {/* Action confirmation dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(o) => { if (!o) { setPendingAction(null); setActionStep(0); } }}>
        <DialogContent className="max-w-[520px] p-0 gap-0 overflow-hidden">
          {pm && (
            <>
              {/* Header */}
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", pm.iconBg)}>
                    <pm.icon className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-[15px] leading-tight font-semibold">
                      {actionStep === 0 ? pm.title : "Confirmar transição de estado"}
                    </DialogTitle>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{selected.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard?.writeText(selected.ref); toast({ title: "Referência copiada", description: selected.ref }); }}
                    className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
                  >
                    {selected.ref}
                  </button>
                </div>
                <DialogDescription className="sr-only">{pm.desc}</DialogDescription>
              </div>

              {actionStep === 0 ? (
                <>
                  {/* Data + Requerente */}
                  <div className="px-5 pt-3 pb-2 border-b border-border bg-muted/10 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Data</span>
                      <span className="text-[12px] font-semibold text-foreground tabular-nums">{fmt(dSub)}</span>
                    </div>
                    <span className="w-px h-3 bg-border" />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground shrink-0">Requerente</span>
                      <span className="text-[12px] font-semibold text-foreground truncate">{selected.requester}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{counterpartRole}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-3 space-y-3">
                    <section className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <Label htmlFor="action-notes" className="text-[11px] uppercase tracking-[0.08em] font-semibold text-foreground">
                          Parecer / Notas
                        </Label>
                        <span className="text-[10px] text-muted-foreground">Obrigatório</span>
                      </div>
                      <Textarea
                        id="action-notes"
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder={pm.notesPlaceholder}
                        rows={3}
                        className="resize-none text-sm leading-relaxed"
                      />
                    </section>

                    <section className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <Label className="text-[11px] uppercase tracking-[0.08em] font-semibold text-foreground">
                          Anexos e evidências
                        </Label>
                        <span className="text-[10px] text-muted-foreground">
                          {actionFiles.length > 0 ? `${actionFiles.length} ${actionFiles.length === 1 ? "ficheiro" : "ficheiros"}` : "Opcional"}
                        </span>
                      </div>

                      <label className="group flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/10 hover:border-primary/40 hover:bg-primary/[0.03] transition-colors cursor-pointer px-3 py-1.5">
                        <span className="w-5 h-5 rounded-full border border-border bg-background flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0">
                          <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </span>
                        <span className="text-[12px] text-foreground/80 flex-1 truncate">
                          Carregar anexo <span className="text-muted-foreground">(PDF, DOCX, XLSX, PNG, JPG)</span>
                        </span>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => setActionFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
                        />
                      </label>

                      {actionFiles.length > 0 && (
                        <ul className="space-y-1 pt-0.5">
                          {actionFiles.map((f, i) => {
                            const ext = f.name.split(".").pop()?.toUpperCase() ?? "FILE";
                            const isImg = /^(PNG|JPG|JPEG|WEBP|GIF)$/.test(ext);
                            const isSheet = /^(XLS|XLSX|CSV)$/.test(ext);
                            const Ic = isImg ? FileImage : isSheet ? FileSpreadsheet : FileText;
                            const cls = isImg ? "text-violet-600"
                              : isSheet ? "text-emerald-600"
                              : "text-red-600";
                            return (
                              <li key={i} className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-md border border-border bg-background hover:bg-muted/20 transition-colors">
                                <Ic className={cn("w-3.5 h-3.5 shrink-0", cls)} />
                                <span className="text-[12px] font-medium text-foreground truncate flex-1 leading-tight">{f.name}</span>
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                  {f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / 1024 / 1024).toFixed(1)} MB`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActionFiles(prev => prev.filter((_, idx) => idx !== i))}
                                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                  title="Remover"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </section>
                  </div>

                  <DialogFooter className="px-5 py-2.5 border-t border-border bg-muted/20 gap-2 sm:gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[12px]">Cancelar</Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      className={cn("h-7 text-[12px] gap-1.5", pm.tone)}
                      onClick={() => setActionStep(1)}
                      disabled={!actionNotes.trim()}
                    >
                      <pm.icon className="w-3.5 h-3.5" /> {pm.cta}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  {(() => {
                    const fromMeta = finStatusMeta[selected.status];
                    const toMeta = finStatusMeta[pendingAction!];
                    return (
                      <>
                        <div className="px-5 pt-3 pb-2 border-b border-border bg-muted/10 flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Data</span>
                            <span className="text-[12px] font-semibold text-foreground tabular-nums">{fmt(dSub)}</span>
                          </div>
                          <span className="w-px h-3 bg-border" />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground shrink-0">Requerente</span>
                            <span className="text-[12px] font-semibold text-foreground truncate">{selected.requester}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{counterpartRole}</span>
                          </div>
                        </div>
                      <div className="px-5 py-4 space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-2">
                            Transição de estado
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-[10.5px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", fromMeta.cls)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", fromMeta.dot)} />
                              {fromMeta.label}
                            </Badge>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <Badge variant="outline" className={cn("text-[10.5px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", toMeta.cls)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", toMeta.dot)} />
                              {toMeta.label}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-2">
                            Ação será registada. Requerente e responsáveis serão notificados.
                          </p>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/20 px-3.5 py-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="declaration"
                              checked={declarationChecked}
                              onCheckedChange={(c) => setDeclarationChecked(c === true)}
                              className="mt-0.5 shrink-0"
                            />
                            <Label htmlFor="declaration" className="text-[12.5px] text-foreground/90 leading-relaxed cursor-pointer font-normal block">
                              Eu declaro que esta solicitação está em <span className="font-semibold text-foreground">{toMeta.label.toLowerCase()}</span>.
                            </Label>
                          </div>
                        </div>
                      </div>
                      </>
                    );
                  })()}

                  <DialogFooter className="px-5 py-2.5 border-t border-border bg-muted/20 gap-2 sm:gap-2 sm:justify-between">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[12px]">Cancelar</Button>
                    </DialogClose>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-[12px] gap-1" onClick={() => setActionStep(0)}>
                        <ChevronLeft className="w-3.5 h-3.5" /> Voltar
                      </Button>
                      <Button
                        size="sm"
                        className={cn("h-7 text-[12px] gap-1.5", pm.tone)}
                        onClick={confirmAction}
                        disabled={!declarationChecked}
                      >
                        <pm.icon className="w-3.5 h-3.5" /> Confirmar
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}

function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground leading-tight truncate">{value}</p>
    </div>
  );
}

function anexoIcon(t: "pdf" | "doc" | "image" | "sheet") {
  if (t === "image") return { Icon: FileImage, cls: "bg-violet-50 border-violet-200 text-violet-600" };
  if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
  if (t === "doc")   return { Icon: FileText, cls: "bg-sky-50 border-sky-200 text-sky-600" };
  return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
}
