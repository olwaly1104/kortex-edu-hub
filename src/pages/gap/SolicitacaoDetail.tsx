import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, FileText, MessageSquare, Mail, Check, X, Hourglass, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  solicitacoes, Categoria,
  estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig,
} from "@/data/gapData";

export default function GapSolicitacaoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const selected = solicitacoes.find(s => s.id === id);

  if (!selected) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Solicitação não encontrada.</p>
        <Button onClick={() => navigate("/gap/solicitacoes")} className="mt-4" variant="outline">Voltar</Button>
      </div>
    );
  }

  const st = estadoSolicitacaoConfig[selected.estado];
  const dest = destinoConfig[selected.destino];
  const tipoCfg = tipoConfig[selected.tipo];
  const dSub = new Date(selected.dataSubmissao);
  const dConc = selected.dataConclusao ? new Date(selected.dataConclusao) : null;
  const fmt = (d: Date) => d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" });
  const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
  const initials = selected.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  const encaminhada = selected.historico.find(h => h.accao.toLowerCase().includes("encaminhada"));
  const executada = selected.historico.find(h => {
    const a = h.accao.toLowerCase();
    return a.includes("concluída") || a.includes("concluida") || a.includes("executada");
  });

  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "forwarded" | "accepted" | "rejected" | "executed" | "pending" | "scheduled" };
  const steps: Step[] = [];

  // 1) Submetida
  steps.push({
    label: "Solicitação submetida",
    data: submetida?.data,
    actor: submetida?.actor ?? "Portal do Estudante",
    tone: "submitted",
  });

  // 2) Encaminhada
  if (encaminhada) {
    steps.push({
      label: "Encaminhada para destino",
      data: encaminhada.data,
      actor: `${encaminhada.actor} → ${dest.label}`,
      tone: "forwarded",
    });
  } else {
    steps.push({
      label: "Aguarda encaminhamento",
      actor: dest.label,
      tone: "pending",
    });
  }

  // 3) Aceite / rejeitada / aguarda
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
    steps.push({ label: "Aguarda aceitação", actor: selected.responsavelDestino ?? dest.label, tone: "pending" });
  }

  // 4) Concluída / prevista
  if (selected.estado === "concluida") {
    steps.push({ label: "Concluída", data: executada?.data, actor: executada?.actor ?? selected.responsavelDestino, nota: executada?.nota, tone: "executed" });
  } else if (selected.estado === "rejeitada") {
    steps.push({ label: "Sem conclusão", actor: "Pedido encerrado por rejeição", tone: "pending" });
  } else {
    const sla = selected.slaDias ?? tipoCfg?.slaDias;
    let aside: string | undefined;
    let dataPrev: string | undefined;
    if (sla) {
      const base = new Date(selected.dataEncaminhamento ?? selected.dataSubmissao);
      base.setDate(base.getDate() + sla);
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
      const rel = diff < 0 ? `${Math.abs(diff)}d em atraso` : diff === 0 ? "hoje" : `em ${diff}d`;
      aside = `Conclusão prevista · ${rel}`;
      dataPrev = fmt(base);
    }
    steps.push({
      label: "Conclusão prevista",
      data: dataPrev,
      actor: selected.responsavelDestino ?? dest.label,
      aside,
      tone: "scheduled",
    });
  }

  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    forwarded: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected: "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    scheduled: "bg-amber-500 text-white ring-4 ring-amber-500/15",
    pending: "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/gap/solicitacoes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Solicitações
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Top bar — ID + categoria */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">{selected.id}</span>
            {tipoCfg && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] font-medium text-muted-foreground">{tipoCfg.categoria}</span>
              </>
            )}
          </div>
        </div>

        {/* Title block */}
        <div className="px-6 pt-5 pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground min-w-0 flex-1">
              {tipoCfg?.label ?? selected.tipo}
            </h1>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Estado</span>
              <Badge variant="outline" className={cn("text-[11px] font-medium px-2.5 py-0.5", st.color)}>{st.label}</Badge>
            </div>
          </div>
        </div>

        {/* 2-column body */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border">
          {/* LEFT — estudante + meta */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Estudante</p>
              <button
                type="button"
                onClick={() => navigate(`/gap/estudantes/${selected.matricula}`)}
                className="flex items-start gap-3 w-full text-left hover:bg-muted/40 -mx-2 px-2 py-1.5 rounded-md transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight hover:text-primary transition-colors">{selected.estudante}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{selected.matricula}</p>
                </div>
              </button>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <MessageSquare className="w-3 h-3" /> Chat
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <Mail className="w-3 h-3" /> Email
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                  <span className="text-[11px] font-medium text-foreground">{selected.ano}º</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.curso}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.faculdade}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Detalhes do Pedido</p>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Submetido</span>
                  <span className="text-[11px] font-medium text-foreground tabular-nums">{fmt(dSub)} · {fmtT(dSub)}</span>
                </div>
                {tipoCfg && (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
                    <Badge variant="outline" className={cn("text-[10px]", categoriaConfig[tipoCfg.categoria as Categoria]?.color)}>
                      {tipoCfg.categoria}
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Destino</span>
                  <Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</span>
                  {selected.responsavelDestino ? (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-primary hover:underline text-right truncate max-w-[150px]"
                      onClick={() => toast({ title: "Perfil do responsável", description: "Abertura do perfil institucional em breve." })}
                    >
                      {selected.responsavelDestino.split(" · ")[0]}
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic text-right">a atribuir</span>
                  )}
                </div>
                {dConc ? (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Concluído</span>
                    <span className="text-[11px] font-medium text-foreground tabular-nums">{fmt(dConc)} · {fmtT(dConc)}</span>
                  </div>
                ) : (() => {
                  const sla = selected.slaDias ?? tipoCfg?.slaDias;
                  if (!sla) return null;
                  const base = new Date(selected.dataEncaminhamento ?? selected.dataSubmissao);
                  base.setDate(base.getDate() + sla);
                  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
                  const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
                  const overdue = diff < 0;
                  return (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Concluído</span>
                      <span className="flex flex-col items-end gap-0.5">
                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums italic">prev. {fmt(base)}</span>
                        {overdue && (
                          <span className="text-[10px] font-semibold text-red-600 tabular-nums">
                            {Math.abs(diff)} {Math.abs(diff) === 1 ? "dia" : "dias"} de atraso
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </aside>

          {/* RIGHT — descrição + histórico */}
          <main className="p-6 space-y-6 min-w-0">
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Descrição do pedido</h3>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{selected.descricao}</p>
            </section>

            <div className="border-t border-border" />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Histórico</h3>
              </div>
              <ol className="space-y-0">
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  const Icon = s.tone === "rejected" ? X : s.tone === "pending" ? null : Check;
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
                        {s.aside && <p className="mt-1.5 text-[11px] text-muted-foreground/90 italic">{s.aside}</p>}
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
