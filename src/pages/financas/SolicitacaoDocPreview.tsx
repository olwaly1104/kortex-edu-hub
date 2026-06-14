import { Printer, Download, FileText, FileImage, FileSpreadsheet, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type FinSolicitacao, finStatusMeta, finTypeMeta, prettyDate,
} from "@/data/financasSolicitacoesData";

type Props = { solicitacao: FinSolicitacao };

const fmtLong = (d: Date) => d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

export default function FinancasSolicitacaoDocPreview({ solicitacao: s }: Props) {
  const { toast } = useToast();
  const st = finStatusMeta[s.status];
  const tm = finTypeMeta[s.type];
  const counterpart = s.direction === "recebida" ? s.requester : (s.destinatario ?? "—");

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Pedido-{s.ref}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento institucional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => toast({ title: "Documento exportado", description: `Pedido-${s.ref}.pdf` })}>
            <Download className="w-3 h-3" /> Descarregar
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 bg-muted/30">
        <div className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col text-foreground" style={{ width: "210mm", height: "297mm" }}>
          {/* Header */}
          <div className="px-12 pt-9 pb-4">
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-foreground">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold tracking-tight leading-tight mt-0.5">Direcção Financeira</h1>
                <p className="text-[9px] text-foreground/60 mt-0.5">Reitoria · Gestão Orçamental e Tesouraria</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Pedido-{s.ref}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* Title */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">Relatório de Solicitação Financeira</p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{s.title}</h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-12 pb-4 space-y-5 overflow-hidden">
            <Section number="I" title="Detalhes do Pedido">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <div className="grid grid-cols-3 bg-doc-accent/[0.06] border-b border-doc-accent/35">
                  <CellHead label={s.direction === "recebida" ? "Requerente" : "Emissor"} />
                  <CellHead label="Pedido" />
                  <CellHead label={s.direction === "recebida" ? "Destino" : "Destinatário"} last />
                </div>
                <div className="grid grid-cols-3">
                  <GroupCell rows={[
                    ["Nome", s.direction === "recebida" ? s.requester : "Direcção Financeira"],
                    ["Função", s.requesterRole ?? "—"],
                    ["ID", s.requesterMatricula ?? "—"],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Referência", s.ref],
                    ["Categoria", tm.label],
                    ["Estado", st.label],
                    ["Submetido", prettyDate(s.date)],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Destino", counterpart],
                    ["Responsável", s.responsavel ?? "Equipa Financeira"],
                    ["Prazo", prettyDate(s.dueDate)],
                  ]} />
                </div>
              </div>
            </Section>

            <Section number="II" title="Motivo do Pedido">
              <div className="border-t-[3px] border-doc-accent bg-doc-accent/[0.035] px-5 py-4">
                <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1.5">Assunto</p>
                <h4 className="text-[14px] font-bold leading-snug tracking-tight text-foreground mb-3">{s.title}</h4>
                <p className="text-[10.5px] leading-[1.6] whitespace-pre-line line-clamp-6 text-foreground/85">{s.description}</p>
                {s.anexos && s.anexos.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {s.anexos.slice(0, 4).map((a, i) => {
                      const ic = anexoIcon(a.tipo);
                      return (
                        <div key={i} className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border border-doc-accent/30 bg-white">
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${ic.cls}`}>
                            <ic.Icon className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[8.5px] font-semibold text-foreground/85 truncate max-w-[180px]">{a.nome}</span>
                          <Paperclip className="w-2.5 h-2.5 text-doc-accent ml-0.5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            <Section number="III" title="Cronologia">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <table className="w-full text-[9.5px]">
                  <thead className="bg-doc-accent/[0.06]">
                    <tr className="border-b border-doc-accent/35">
                      <th className="text-left px-3 py-1.5 font-bold w-[6%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">#</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[26%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Data &amp; Hora</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[36%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Acção</th>
                      <th className="text-left px-3 py-1.5 font-bold text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {s.historico.slice(0, 6).map((h, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{h.data}</td>
                        <td className="px-3 py-1 font-medium">{h.accao}</td>
                        <td className="px-3 py-1 text-foreground/70 truncate">{h.actor || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          <div className="px-12 pb-8 pt-3 border-t border-foreground/30">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-foreground/60 leading-snug max-w-sm">
                Documento gerado automaticamente pela Direcção Financeira com base nos registos oficiais da plataforma.
                Contacto: <span className="font-semibold text-foreground">financas@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/60 pt-1 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-wider text-foreground/60 font-semibold">Direcção Financeira</p>
                  <p className="text-[10px] font-semibold">Dr. Manuel Sousa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CellHead({ label, last }: { label: string; last?: boolean }) {
  return (
    <div className={`px-3 py-1.5 ${last ? "" : "border-r border-doc-accent/25"}`}>
      <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">{label}</p>
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
          <dt className="text-foreground/55 w-[78px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function anexoIcon(t: "pdf" | "doc" | "image" | "sheet") {
  if (t === "image") return { Icon: FileImage, cls: "bg-violet-50 border-violet-200 text-violet-600" };
  if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
  if (t === "doc")   return { Icon: FileText, cls: "bg-sky-50 border-sky-200 text-sky-600" };
  return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
}
