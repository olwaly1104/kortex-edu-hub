import { Printer, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Candidatura, estadoLabels } from "@/data/admissoesData";

type Props = {
  candidatura: Candidatura;
  steps: { n: number; title: string; rows: { label: string; value: string }[] }[];
  cronologia: { data: string; accao: string; detalhe: string }[];
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const fmtDataShort = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function CandidaturaDocPreview({ candidatura: c, steps, cronologia }: Props) {
  const { toast } = useToast();
  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean) as string[];

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Cand-{c.id}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento institucional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Cand-${c.id}.pdf` })}
          >
            <Download className="w-3 h-3" /> Descarregar
          </Button>
        </div>
      </div>

      {/* A4 page */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col text-foreground"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="px-12 pt-9 pb-4">
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-foreground">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-foreground/60 font-semibold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold tracking-tight leading-tight mt-0.5">
                  Gabinete de Apoio Académico
                </h1>
                <p className="text-[9px] text-foreground/60 mt-0.5">
                  Faculdade de Ciências Exatas · Processo de Admissão
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Cand-{c.id}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* Title */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">
              Relatório de Candidatura
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">
              {c.nome}
            </h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-12 pb-4 space-y-5">
            {/* I · Identificação */}
            <Section number="I" title="Identificação do Candidato">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <div className="grid grid-cols-3 bg-doc-accent/[0.06] border-b border-doc-accent/35">
                  <div className="px-3 py-1.5 border-r border-doc-accent/25">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Candidato</p>
                  </div>
                  <div className="px-3 py-1.5 border-r border-doc-accent/25">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Candidatura</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Opções de Curso</p>
                  </div>
                </div>
                <div className="grid grid-cols-3">
                  <GroupCell rows={[
                    ["Nome", c.nome],
                    ["BI / Passaporte", c.bi],
                    ["Telemóvel", c.telefone],
                    ["Email", c.email],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Referência", c.id],
                    ["Período", c.periodo],
                    ["Estado", estadoLabels[c.estado]],
                    ["Submetido", fmtDataShort(c.dataSubmissao)],
                  ]} bordered />
                  <GroupCell rows={opcoes.map((o, i) => [`${i + 1}ª opção`, o]) as [string, string][]} />
                </div>
              </div>
            </Section>

            {/* II · Dados do Processo (etapas) */}
            {steps.map((s, idx) => (
              <Section key={s.n} number={romanize(idx + 2)} title={s.title}>
                <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-doc-accent/20">
                    {s.rows.map((r, i) => (
                      <div key={i} className="px-3 py-1.5 flex items-baseline gap-2 text-[10px] border-b border-doc-accent/15 last:border-b-0">
                        <span className="text-foreground/55 w-[42%] shrink-0 font-medium">{r.label}</span>
                        <span className="font-semibold flex-1 text-foreground">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            ))}

            {/* Cronologia */}
            <Section number={romanize(steps.length + 2)} title="Cronologia do Processo">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <table className="w-full text-[9.5px]">
                  <thead className="bg-doc-accent/[0.06]">
                    <tr className="border-b border-doc-accent/35">
                      <th className="text-left px-3 py-1.5 font-bold w-[6%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">#</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[22%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Data</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[32%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Etapa</th>
                      <th className="text-left px-3 py-1.5 font-bold text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Detalhe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    {cronologia.map((h, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataShort(h.data)}</td>
                        <td className="px-3 py-1 font-medium">{h.accao}</td>
                        <td className="px-3 py-1 text-foreground/70">{h.detalhe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Documentos */}
            <Section number={romanize(steps.length + 3)} title="Documentos Entregues">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden divide-y divide-foreground/10">
                {c.documentos.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-doc-accent/[0.02]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-doc-accent" />
                      <span className="text-[10px] font-medium text-foreground">{d.nome}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600">Entregue</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="px-12 pb-8 pt-3 border-t border-foreground/30">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-foreground/60 leading-snug max-w-sm">
                Documento gerado automaticamente pelo GAP com base nos registos oficiais da candidatura.
                Contacto: <span className="font-semibold text-foreground">gap@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/60 pt-1 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-wider text-foreground/60 font-semibold">Coordenação do GAP</p>
                  <p className="text-[10px] font-semibold">Dra. Helena Cabral</p>
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
          <dt className="text-foreground/55 w-[90px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function romanize(n: number) {
  const map: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII" };
  return map[n] ?? String(n);
}
