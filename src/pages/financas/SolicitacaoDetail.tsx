import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, FileText, MessageSquare, Mail, Phone, Check, X, Hourglass, Send,
  Eye, Download, Users, Share2, Paperclip, FileImage, FileSpreadsheet, CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  finSolicitacoes, finStatusMeta, finTypeMeta,
} from "@/data/financasSolicitacoesData";
import FinancasSolicitacaoDocPreview from "./SolicitacaoDocPreview";

export default function FinancasSolicitacaoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const baseSelected = finSolicitacoes.find(s => s.id === id);
  const [statusOverride, setStatusOverride] = useState<typeof baseSelected extends undefined ? never : null | "em_execucao" | "executada" | "rejeitado">(null);

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
  const counterpart = isRecebida ? selected.requester : (selected.destinatario ?? "—");
  const counterpartRole = isRecebida ? selected.requesterRole : "Destinatário";

  const dSub = new Date(selected.date);
  const fmt = (d: Date) => d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
  const initials = counterpart.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const anexos = selected.anexos ?? [];

  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "accepted" | "rejected" | "executed" | "pending" | "scheduled" };
  const steps: Step[] = [];

  const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  steps.push({
    label: "Solicitação submetida",
    data: submetida?.data, actor: submetida?.actor ?? selected.requester,
    tone: "submitted",
  });

  if (selected.status === "rejeitado") {
    const rej = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"));
    steps.push({ label: "Solicitação rejeitada", data: rej?.data, actor: rej?.actor ?? "Direcção Financeira", nota: rej?.nota, tone: "rejected" });
  } else if (selected.status === "em_execucao" || selected.status === "executada") {
    const ap = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("aprov"));
    steps.push({ label: "Em execução", data: ap?.data, actor: ap?.actor ?? "Direcção Financeira", nota: ap?.nota, tone: "accepted" });
    if (selected.status === "executada") {
      const ex = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("execut"));
      steps.push({ label: "Solicitação executada", data: ex?.data, actor: ex?.actor ?? "Direcção Financeira", nota: ex?.nota, tone: "executed" });
    }
  } else if (selected.dueDate) {
    const base = new Date(selected.dueDate);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
    const overdue = diff < 0;
    const aside = overdue
      ? `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} em atraso`
      : diff === 0 ? "Prazo termina hoje" : `Faltam ${diff} ${diff === 1 ? "dia" : "dias"}`;
    steps.push({
      label: `Aguarda decisão · prevista ${fmt(base)}`,
      actor: isRecebida ? "Direcção Financeira" : counterpart,
      aside, tone: overdue ? "rejected" : "scheduled",
    });
  } else {
    steps.push({ label: "Aguarda decisão", actor: isRecebida ? "Direcção Financeira" : counterpart, tone: "scheduled" });
  }

  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted:  "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected:  "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed:  "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    scheduled: "bg-amber-500 text-white ring-4 ring-amber-500/15",
    pending:   "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  const handleAction = (action: "em_execucao" | "rejeitado") => {
    toast({
      title: action === "em_execucao" ? "Solicitação em execução" : "Solicitação rejeitada",
      description: `O pedido ${selected.ref} foi ${action === "em_execucao" ? "colocado em execução" : "rejeitado"}.`,
    });
  };

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
                <span className="text-sm font-semibold text-foreground">{selected.status === "atrasado" ? "Decisão em atraso" : "Aguarda decisão"}</span>
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
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors" onClick={() => handleAction("rejeitado")}>
                  <XCircle className="w-3.5 h-3.5" /> Rejeitar
                </Button>
                <Button size="sm" className="h-7 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" onClick={() => handleAction("em_execucao")}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
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
                {isRecebida ? "Requerente" : "Destinatário"}
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

                {anexos.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">
                      Anexos <span className="text-muted-foreground/70 normal-case tracking-normal tabular-nums">({anexos.length})</span>
                    </p>
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
                  </div>
                )}
              </div>
            </section>

            {/* Histórico */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Histórico</h3>
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
                          <p className="text-sm font-medium text-foreground">{s.label}</p>
                          {s.data && <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{s.data}</span>}
                        </div>
                        {s.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor}</p>}
                        {s.aside && (
                          <p className={cn("mt-1.5 text-[11px] italic",
                            s.aside.includes("atraso") ? "text-red-600 font-semibold not-italic" : "text-muted-foreground/90"
                          )}>{s.aside}</p>
                        )}
                        {s.nota && <p className="mt-2 text-xs text-foreground/75 leading-relaxed pl-3 border-l-2 border-border">{s.nota}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        </div>
      </Card>
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
