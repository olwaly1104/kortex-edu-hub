import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, Clock, Paperclip, FileImage, FileSpreadsheet, Eye, Download, Check, X, Hourglass, MessageSquare, Mail, Phone, Building2, Receipt, BadgeCheck, Wallet, Landmark, Layers, CalendarDays, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { findDespesa, finStatusMetaDespesa, prettyDate, type DespesaAnexo } from "@/data/financasDespesasData";
import { formatCurrency } from "@/data/financeModuleData";
import FinancasDespesaDocPreview from "./DespesaDocPreview";

export default function FinancasDespesaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [docOpen, setDocOpen] = useState(false);
  const d = findDespesa(id);

  if (!d) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <EmptyState title="Despesa não encontrada" description={`Não existe nenhuma despesa com o identificador ${id ?? "—"}.`} />
      </div>
    );
  }

  const st = finStatusMetaDespesa[d.status];
  const dSub = new Date(d.date);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/financas/despesas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Despesas
      </Link>

      <Card className="overflow-hidden p-0 gap-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Lectivo 2024/2025</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/financas/despesas" className="text-muted-foreground hover:text-foreground transition-colors">Despesas</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{d.ref}</span>
        </div>

        {/* Title block */}
        <div className="px-6 pt-4 pb-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
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
                <p className="text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
                  {dSub.getFullYear()}
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{d.description}</h1>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", st.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                  {st.label}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">{d.category}</Badge>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600 tabular-nums tracking-tight">
                -{formatCurrency(d.amount)}
              </div>
            </div>

            {/* Right — REF + Doc pill */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background text-[11px] font-mono font-semibold text-foreground">
                {d.ref}
              </div>
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">Despesa-{d.ref}</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">Gerado automaticamente</span>
                </div>
                <span className="self-stretch w-px bg-border mx-0.5" />
                <button type="button" onClick={() => setDocOpen(true)} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver documento">
                  <Eye className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => toast({ title: "Documento exportado", description: `Despesa-${d.ref}.pdf` })} className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Descarregar">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column body: Identificação left · resto right */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border border-t border-border">
          {/* LEFT — Requerente · Responsável · Detalhes */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <PersonBlock label="Requerente" name={d.requestedBy} role={d.requesterRole} />
            <div className="pt-4 border-t border-border">
              <PersonBlock label="Responsável" name={d.responsavel} role={d.responsavelRole} />
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-3">Detalhes</p>

              {/* Fornecedor card */}
              <div className="rounded-lg border border-border bg-background p-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/15">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Fornecedor</p>
                    <p className="text-[13px] font-semibold text-foreground leading-tight mt-0.5 truncate">{d.fornecedor ?? "—"}</p>
                    {d.nif && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted/40">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">NIF</span>
                        <span className="text-[10.5px] font-mono font-semibold text-foreground tabular-nums">{d.nif}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documentos fiscais */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <DocCard
                  icon={Receipt}
                  tone="amber"
                  label="Factura"
                  numero={d.facturaNum}
                  date={d.facturaData}
                />
                <DocCard
                  icon={BadgeCheck}
                  tone="emerald"
                  label="Comprovativo"
                  numero={d.comprovativoNum}
                  date={d.comprovativoData}
                />
              </div>

              {/* Detail rows */}
              <dl className="rounded-lg border border-border bg-background divide-y divide-border overflow-hidden">
                <DetailRow icon={Wallet}       label="Método"   value={d.metodoPagamento ?? "—"} />
                {d.iban && <DetailRow icon={Landmark} label="IBAN" value={d.iban} mono />}
                <DetailRow icon={Layers}       label="Rubrica"  value={d.rubricaOrcamental ?? "—"} />
                <DetailRow icon={CalendarDays} label="Submetido" value={prettyDate(d.date)} />
                <DetailRow icon={CalendarClock} label="Prazo"   value={prettyDate(d.dueDate)} />
              </dl>
            </div>

          </aside>


          {/* RIGHT — Justificação, Anexos, Cronologia */}
          <div className="p-6 space-y-6 min-w-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-2">Justificação</p>
              <p className="text-xs leading-relaxed text-foreground/85 whitespace-pre-line">{d.justificacao}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-2">Anexos ({d.anexos.length})</p>
              <ul className="space-y-1.5">
                {d.anexos.map((a, i) => {
                  const ic = anexoIcon(a.tipo);
                  return (
                    <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${ic.cls}`}>
                        <ic.Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate flex-1">{a.nome}</span>
                      {a.size && <span className="text-[10px] text-muted-foreground shrink-0">{a.size}</span>}
                      <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                    </li>
                  );
                })}
              </ul>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Cronologia</h3>
              </div>
              <ol className="space-y-0">
                {d.historico.map((h, i) => {
                  const isLast = i === d.historico.length - 1;
                  const tone = toneFor(h.accao);
                  const Icon = tone.icon;
                  return (
                    <li key={i} className="flex gap-3 relative">
                      <div className="flex flex-col items-center shrink-0 w-5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10", tone.cls)}>
                          {Icon && <Icon className="w-3 h-3" strokeWidth={3} />}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className={cn("flex-1 min-w-0", !isLast && "pb-5")}>
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{h.accao}</p>
                          <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{h.data}</span>
                        </div>
                        {h.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{h.actor}</p>}
                        {h.nota && (
                          <div className="mt-2 pl-3 border-l-2 border-border">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-0.5">Parecer / Notas</p>
                            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{h.nota}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

        </div>
      </Card>

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[90vh]">
          <DialogHeader className="px-4 py-3 border-b border-border">
            <DialogTitle className="text-sm font-semibold">Documento · Despesa-{d.ref}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-3rem)] overflow-auto">
            <FinancasDespesaDocPreview despesa={d} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-muted-foreground w-[120px] shrink-0">{k}</dt>
      <dd className="font-medium text-foreground flex-1 truncate">{v}</dd>
    </div>
  );
}

function PersonBlock({ label, name, role }: { label: string; name: string; role?: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">{label}</p>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">{name}</p>
          {role && <p className="text-[11px] text-muted-foreground mt-0.5">{role}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><MessageSquare className="w-3 h-3" /> Chat</Button>
        <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Mail className="w-3 h-3" /> Email</Button>
        <Button variant="outline" size="sm" className="h-7 px-1 text-[11px] gap-1"><Phone className="w-3 h-3" /> Ligar</Button>
      </div>
    </div>
  );
}

function DocCard({
  icon: Icon,
  tone,
  label,
  ref,
  date,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "emerald";
  label: string;
  ref?: string;
  date?: string;
}) {
  const toneCls =
    tone === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center gap-2">
        <div className={cn("w-7 h-7 rounded-md border flex items-center justify-center shrink-0", toneCls)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{label}</p>
      </div>
      <p className="text-[11.5px] font-mono font-semibold text-foreground tabular-nums mt-1.5 truncate">{ref ?? "—"}</p>
      <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">{date ? prettyDate(date) : "Pendente"}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2">
      <div className="w-6 h-6 rounded-md bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3" />
      </div>
      <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold w-[68px] shrink-0">{label}</span>
      <span className={cn("text-[11.5px] font-medium text-foreground flex-1 truncate text-right", mono && "font-mono tabular-nums")}>{value}</span>
    </div>
  );
}

function toneFor(accao: string) {
  const a = accao.toLowerCase();
  if (a.includes("rejeit")) return { icon: X,         cls: "bg-destructive text-destructive-foreground ring-4 ring-destructive/15" };
  if (a.includes("aprov"))  return { icon: Check,     cls: "bg-emerald-500 text-white ring-4 ring-emerald-500/15" };
  if (a.includes("pag"))    return { icon: Check,     cls: "bg-emerald-500 text-white ring-4 ring-emerald-500/15" };
  if (a.includes("submet")) return { icon: Check,     cls: "bg-emerald-500 text-white ring-4 ring-emerald-500/15" };
  return { icon: Hourglass, cls: "bg-amber-400 text-white ring-4 ring-amber-400/40" };
}

function anexoIcon(t: DespesaAnexo["tipo"]) {
  if (t === "image") return { Icon: FileImage,       cls: "bg-violet-50 border-violet-200 text-violet-600" };
  if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
  if (t === "doc")   return { Icon: FileText,        cls: "bg-sky-50 border-sky-200 text-sky-600" };
  return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
}
