import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, FileText, MessageSquare, Mail, Phone, Check, X, Hourglass, Send,
  Eye, Download, Paperclip, FileImage, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  solicitacoes, Categoria,
  estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig,
  getComentariosSolicitacao,
} from "@/data/gapData";
import SolicitacaoDocPreview from "@/pages/gap/SolicitacaoDocPreview";

const STUDENT_MATRICULA = "2024001";

const estadoDot: Record<string, string> = {
  recebida: "bg-amber-500",
  em_execucao: "bg-sky-500",
  concluida: "bg-emerald-500",
  rejeitada: "bg-destructive",
  em_atraso: "bg-orange-500",
};

type Anexo = { nome: string; tamanho: string; tipo: "pdf" | "image" | "doc" | "sheet" };

function anexoIcon(t: Anexo["tipo"]) {
  if (t === "image") return { Icon: FileImage, cls: "bg-violet-50 border-violet-200 text-violet-600" };
  if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
  if (t === "doc")   return { Icon: FileText, cls: "bg-sky-50 border-sky-200 text-sky-600" };
  return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
}

export default function StudentSolicitacaoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find in mock data; if not present (it was created in-session), show fallback.
  const selected = solicitacoes.find(s => s.id === id && s.matricula === STUDENT_MATRICULA);

  if (!selected) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Solicitação não encontrada ou ainda não sincronizada.</p>
        <Button onClick={() => navigate("/student/solicitacoes")} className="mt-4" variant="outline">Voltar</Button>
      </div>
    );
  }

  const st = estadoSolicitacaoConfig[selected.estado];
  const dest = destinoConfig[selected.destino];
  const tipoCfg = tipoConfig[selected.tipo];
  const dSub = new Date(selected.dataSubmissao);
  const fmt = (d: Date) => d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });

  const anexos: Anexo[] = (selected.anexos ?? []).map(a => ({
    nome: a.nome,
    tamanho: "—",
    tipo: a.nome.toLowerCase().endsWith(".jpg") || a.nome.toLowerCase().endsWith(".png") ? "image"
      : a.nome.toLowerCase().endsWith(".xlsx") || a.nome.toLowerCase().endsWith(".csv") ? "sheet"
      : a.nome.toLowerCase().endsWith(".docx") ? "doc"
      : "pdf",
  }));

  const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  const executada = selected.historico.find(h => {
    const a = h.accao.toLowerCase();
    return a.includes("concluída") || a.includes("concluida") || a.includes("executada");
  });

  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "accepted" | "rejected" | "executed" | "scheduled" | "pending" };
  const steps: Step[] = [];

  steps.push({
    label: "Solicitação submetida",
    data: submetida?.data,
    actor: submetida?.actor ?? "Portal do Discente",
    tone: "submitted",
  });

  if (selected.estado === "rejeitada") {
    const rej = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"));
    steps.push({ label: "Solicitação rejeitada", data: rej?.data, actor: rej?.actor ?? selected.responsavelDestino, nota: rej?.nota, tone: "rejected" });
  } else if (selected.estado === "em_execucao" || selected.estado === "concluida") {
    const aceite = selected.historico.find(h => {
      const a = h.accao.toLowerCase();
      return !a.includes("submetida") && !a.includes("encaminhada") && !a.includes("concluí") && !a.includes("conclui") && !a.includes("executada") && !a.includes("rejeit");
    });
    steps.push({ label: "Solicitação aceite", data: aceite?.data, actor: aceite?.actor ?? selected.responsavelDestino, nota: aceite?.nota, tone: "accepted" });
  } else {
    const baseAccept = new Date("2025-12-14");
    const hojeA = new Date(); hojeA.setHours(0, 0, 0, 0);
    const diffA = Math.ceil((baseAccept.getTime() - hojeA.getTime()) / 86400000);
    const asideAccept = diffA < 0 ? `${Math.abs(diffA)} ${Math.abs(diffA) === 1 ? "dia" : "dias"} em atraso`
      : diffA === 0 ? "Prazo termina hoje"
      : `Faltam ${diffA} ${diffA === 1 ? "dia" : "dias"}`;
    steps.push({
      label: `Aguarda aceitação · prevista ${fmt(baseAccept)}`,
      actor: selected.responsavelDestino ?? dest.label,
      aside: asideAccept,
      tone: "scheduled",
    });
  }

  if (selected.estado === "concluida") {
    steps.push({ label: "Concluída", data: executada?.data, actor: executada?.actor ?? selected.responsavelDestino, nota: executada?.nota, tone: "executed" });
  } else if (selected.estado === "rejeitada") {
    steps.push({ label: "Sem conclusão", actor: "Pedido encerrado por rejeição", tone: "pending" });
  } else {
    const base = new Date("2025-12-15");
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
    const aside = diff < 0 ? `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} em atraso`
      : diff === 0 ? "Prazo termina hoje"
      : `Faltam ${diff} ${diff === 1 ? "dia" : "dias"}`;
    steps.push({
      label: `Conclusão prevista · ${fmt(base)}`,
      actor: selected.responsavelDestino ?? dest.label,
      aside,
      tone: "scheduled",
    });
  }

  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected: "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    scheduled: "bg-amber-500 text-white ring-4 ring-amber-500/15",
    pending: "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  const comentarios = getComentariosSolicitacao(selected.id, selected.responsavelDestino ?? `Equipa ${dest.label}`);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/student/solicitacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Minhas Solicitações
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Top bar — breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Lectivo 2025/2026</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/student/solicitacoes" className="text-muted-foreground hover:text-foreground transition-colors">Minhas Solicitações</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{selected.id}</span>
        </div>

        {/* Title block with date tile + PDF doc pill */}
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
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {tipoCfg?.label ?? selected.tipo}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", st.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", estadoDot[selected.estado])} />
                  {st.label}
                </Badge>
                {tipoCfg && (() => {
                  const catCfg = categoriaConfig[tipoCfg.categoria as Categoria];
                  const CatIcon = catCfg?.icon;
                  return (
                    <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", catCfg?.color)}>
                      {CatIcon && <CatIcon className="w-3 h-3" />}
                      {tipoCfg.categoria}
                    </Badge>
                  );
                })()}
              </div>
            </div>

            {/* Right — ID + PDF doc pill */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(selected.id); toast({ title: "ID copiado", description: selected.id }); }}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-mono font-semibold text-foreground transition-colors"
              >
                {selected.id}
              </button>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">Pedido-{selected.id}.pdf</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">
                    Documento institucional
                  </span>
                </div>
                <span className="self-stretch w-px bg-border mx-0.5" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver PDF">
                      <Eye className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Documento Pedido-{selected.id}</DialogTitle>
                      <DialogDescription>Pré-visualização do documento institucional gerado.</DialogDescription>
                    </DialogHeader>
                    <SolicitacaoDocPreview solicitacao={selected} anexos={anexos.map(a => ({ nome: a.nome, tamanho: a.tamanho }))} />
                  </DialogContent>
                </Dialog>
                <button
                  type="button"
                  onClick={() => toast({ title: "PDF descarregado", description: `Pedido-${selected.id}.pdf` })}
                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Descarregar PDF"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column body */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border border-t border-border">
          {/* LEFT — Responsável & destino */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Encaminhado para</p>
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ring-1", dest.color)}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">{dest.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Departamento institucional</p>
                </div>
              </div>
            </div>

            {selected.responsavelDestino && (() => {
              const respFull = selected.responsavelDestino;
              const [respName, respRole] = respFull.split(" · ");
              return (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Responsável</p>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                      {respName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">{respName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{respRole ?? "Profissional"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1">
                      <MessageSquare className="w-3 h-3" /> Chat
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </Button>
                  </div>
                </div>
              );
            })()}

            <div className="pt-4 border-t border-border space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Submetido</span>
                <span className="text-[11px] font-medium text-foreground">{fmt(dSub)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Hora</span>
                <span className="text-[11px] font-medium text-foreground tabular-nums">{fmtT(dSub)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo SLA</span>
                <span className="text-[11px] font-medium text-foreground">{selected.slaDias} dias úteis</span>
              </div>
            </div>
          </aside>

          {/* RIGHT — descrição + anexos + comentários + histórico */}
          <main className="p-6 space-y-6 min-w-0">
            {/* Assunto */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Assunto</h3>
              </div>
              <p className="text-[15px] font-semibold text-foreground leading-snug">{selected.assunto}</p>
            </section>

            <div className="border-t border-border" />

            {/* Descrição */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Descrição do Pedido</h3>
              </div>
              <div className="rounded-lg border border-border bg-background overflow-hidden divide-y divide-border">
                <div className="px-4 py-3">
                  <p className="text-[13.5px] text-foreground/90 leading-[1.65] whitespace-pre-line">
                    {selected.descricao}
                  </p>
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
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{selected.discente}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toast({ title: "A abrir anexo", description: a.nome })}
                                className="w-7 h-7 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                title="Ver"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toast({ title: "Anexo descarregado", description: a.nome })}
                                className="w-7 h-7 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                title="Descarregar"
                              >
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

            {comentarios.length > 0 && (
              <>
                <div className="border-t border-border" />
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">
                        Notas &amp; Comentários
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-mono">{comentarios.length}</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background divide-y divide-border">
                    {comentarios.map((c, i) => {
                      const ini = c.actor.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
                      return (
                        <div key={i} className="flex gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-[10px] ring-1 ring-primary/15">
                            {ini}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <p className="text-[12.5px] font-semibold text-foreground leading-tight">{c.actor}</p>
                              <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{c.data}</span>
                            </div>
                            <p className="text-[12.5px] text-foreground/85 leading-[1.55] mt-1 whitespace-pre-line">
                              {c.texto}
                            </p>
                            {c.anexo && (() => {
                              const ic = anexoIcon(c.anexo.tipo);
                              return (
                                <button
                                  type="button"
                                  onClick={() => toast({ title: "A abrir anexo", description: c.anexo!.nome })}
                                  className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30 hover:bg-muted/60 transition-colors max-w-full"
                                >
                                  <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center shrink-0", ic.cls)}>
                                    <ic.Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 text-left">
                                    <p className="text-[11.5px] font-semibold text-foreground leading-tight truncate">{c.anexo.nome}</p>
                                    <p className="text-[10px] text-muted-foreground tabular-nums">{c.anexo.tamanho}</p>
                                  </div>
                                  <Paperclip className="w-3 h-3 text-muted-foreground ml-1 shrink-0" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            <div className="border-t border-border" />

            <section>
              <div className="flex items-center gap-2 mb-4">
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
                          <p className={cn(
                            "mt-1.5 text-[11px] italic",
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
