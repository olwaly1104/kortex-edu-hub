import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Transaction, formatCurrency } from "@/data/financeModuleData";

type Props = { despesa: Transaction };

const statusLabel: Record<string, string> = {
  aprovada: "Aprovada",
  pendente: "Pendente",
  rejeitada: "Rejeitada",
  pago: "Paga",
  em_atraso: "Em atraso",
  cancelado: "Cancelada",
};

const fmtDataLong = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
};
const fmtDataShort = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function DespesaDocPreview({ despesa: d }: Props) {
  const { toast } = useToast();

  const cronologia: { data?: string; accao: string; actor?: string }[] = [
    { data: d.date, accao: "Solicitação criada", actor: d.requestedBy || "—" },
    { data: d.date, accao: "Em análise", actor: d.responsavel || "—" },
    d.status === "aprovada"
      ? { data: d.approvedDate, accao: "Aprovada", actor: d.approvedBy || "—" }
      : d.status === "rejeitada"
        ? { data: d.approvedDate, accao: "Rejeitada", actor: d.approvedBy || "—" }
        : { accao: "Aguarda decisão", actor: d.responsavel || "—" },
    d.paidDate ? { data: d.paidDate, accao: "Pagamento processado", actor: "Tesouraria" } : null,
  ].filter(Boolean) as any[];

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Despesa-{d.id.toUpperCase()}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento financeiro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Despesa-${d.id.toUpperCase()}.pdf` })}
          >
            <Download className="w-3 h-3" /> Descarregar
          </Button>
        </div>
      </div>

      {/* A4 page */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col text-foreground"
          style={{ width: "210mm", height: "297mm" }}
        >
          {/* Header */}
          <div className="px-12 pt-9 pb-4">
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-foreground">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold tracking-tight leading-tight mt-0.5">Direcção Financeira</h1>
                <p className="text-[9px] text-foreground/60 mt-0.5">Departamento de Despesas · Tesouraria</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Despesa-{d.id.toUpperCase()}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date().toISOString())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* Title */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">
              Comprovativo de Despesa
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{d.description}</h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-12 pb-4 space-y-5 overflow-hidden">
            <Section number="I" title="Detalhes da Despesa">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <div className="grid grid-cols-3 bg-doc-accent/[0.06] border-b border-doc-accent/35">
                  <div className="px-3 py-1.5 border-r border-doc-accent/25">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Identificação</p>
                  </div>
                  <div className="px-3 py-1.5 border-r border-doc-accent/25">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Classificação</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Aprovação</p>
                  </div>
                </div>
                <div className="grid grid-cols-3">
                  <GroupCell rows={[
                    ["Referência", d.id.toUpperCase()],
                    ["Data do pedido", fmtDataShort(d.date)],
                    ["Solicitado por", d.requestedBy || "—"],
                    ["Função", d.requesterRole || "—"],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Categoria", d.category],
                    ["Departamento", d.department || "—"],
                    ["Responsável", d.responsavel || "—"],
                    ["Função", d.responsavelRole || "—"],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Estado", statusLabel[d.status] || d.status],
                    ["Aprovado por", d.approvedBy || "—"],
                    ["Data aprovação", fmtDataShort(d.approvedDate)],
                    ["Data pagamento", fmtDataShort(d.paidDate)],
                  ]} />
                </div>
              </div>
            </Section>

            <Section number="II" title="Valor & Justificação">
              <div className="border-t-[3px] border-doc-accent bg-doc-accent/[0.035] px-5 py-4">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1">Montante</p>
                    <p className="text-[22px] font-bold leading-none tabular-nums text-foreground">
                      -{formatCurrency(d.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1">Estado</p>
                    <p className="text-[12px] font-bold uppercase tracking-wider">{statusLabel[d.status] || d.status}</p>
                  </div>
                </div>
                {d.justification && (
                  <>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1.5 mt-3">
                      Justificação
                    </p>
                    <p className="text-[10.5px] leading-[1.6] whitespace-pre-line text-foreground/85">
                      {d.justification}
                    </p>
                  </>
                )}
              </div>
            </Section>

            <Section number="III" title="Cronologia">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <table className="w-full text-[9.5px]">
                  <thead className="bg-doc-accent/[0.06]">
                    <tr className="border-b border-doc-accent/35">
                      <th className="text-left px-3 py-1.5 font-bold w-[6%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">#</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[26%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Data</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[36%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Acção</th>
                      <th className="text-left px-3 py-1.5 font-bold text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {cronologia.map((h, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataShort(h.data)}</td>
                        <td className="px-3 py-1 font-medium">{h.accao}</td>
                        <td className="px-3 py-1 text-foreground/70 truncate">{h.actor || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="px-12 pb-8 pt-3 border-t border-foreground/30">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-foreground/60 leading-snug max-w-sm">
                Documento gerado automaticamente pela Direcção Financeira com base nos registos oficiais da plataforma.
                Contacto: <span className="font-semibold text-foreground">financas@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/60 pt-1 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-wider text-foreground/60 font-semibold">Director Financeiro</p>
                  <p className="text-[10px] font-semibold">{d.approvedBy || "Dr. Manuel Tavares"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2 pb-1 border-b border-doc-accent/35">
        <span className="text-[8.5px] font-mono font-bold text-doc-accent tabular-nums">{number}.</span>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function GroupCell({ rows, bordered }: { rows: [string, string][]; bordered?: boolean }) {
  return (
    <dl className={`px-3 py-2 space-y-1 ${bordered ? "border-r border-doc-accent/25" : ""}`}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline gap-2 text-[10px]">
          <dt className="text-foreground/55 w-[88px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
