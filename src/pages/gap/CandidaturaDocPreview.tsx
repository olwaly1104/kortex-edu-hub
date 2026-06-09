import { Printer, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Candidatura, estadoLabels } from "@/data/admissoesData";

type Props = {
  candidatura: Candidatura;
  steps: { n: number; title: string; rows: { label: string; value: string }[] }[];
  cronologia: { data: string; accao: string; detalhe: string }[];
  displayId: string;
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const fmtDataShort = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function CandidaturaDocPreview({ candidatura: c, steps, cronologia, displayId }: Props) {
  const { toast } = useToast();
  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean) as string[];

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-foreground">{displayId}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Relatório de Candidatura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `${displayId}.pdf` })}
          >
            <Download className="w-3 h-3" /> Descarregar
          </Button>
        </div>
      </div>

      {/* A4 page */}
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-4">
        <div
          className="mx-auto bg-white shadow-md print:shadow-none flex flex-col text-neutral-900 font-sans"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header — minimal, clean */}
          <header className="px-16 pt-14 pb-8">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-neutral-500 font-semibold">
                  Universidade Privada · GAP
                </p>
                <h1 className="text-[22px] font-bold tracking-tight leading-tight mt-3 text-neutral-900">
                  Relatório de Candidatura
                </h1>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Faculdade de Ciências Exatas · Processo de Admissão
                </p>
              </div>
              <div className="text-right shrink-0 pt-1">
                <p className="font-mono text-[12px] font-semibold tracking-tight text-neutral-900">{displayId}</p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Emitido em {fmtDataLong(new Date())}
                </p>
              </div>
            </div>
            <div className="mt-6 h-px bg-neutral-200" />
          </header>

          {/* Candidate summary */}
          <section className="px-16 pb-8">
            <div className="grid grid-cols-[1fr_auto] items-end gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-neutral-400 font-semibold mb-1.5">
                  Candidato
                </p>
                <h2 className="text-[20px] font-semibold tracking-tight leading-tight text-neutral-900">
                  {c.nome}
                </h2>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Submetido em {fmtDataShort(c.dataSubmissao)} · {c.periodo}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-[10px] uppercase tracking-[0.16em] font-bold text-neutral-700">
                {estadoLabels[c.estado === "incompleto" ? "pendente" : c.estado]}
              </div>
            </div>
          </section>

          {/* Body */}
          <div className="flex-1 px-16 pb-10 space-y-10">
            {/* Identificação */}
            <Block label="01" title="Identificação">
              <KVGrid
                rows={[
                  ["BI / Passaporte", c.bi],
                  ["Período de admissão", c.periodo],
                  ["Referência", displayId],
                  ["Estado", estadoLabels[c.estado === "incompleto" ? "pendente" : c.estado]],
                ]}
              />
            </Block>

            {/* Opções de curso */}
            <Block label="02" title="Opções de Curso">
              <ol className="divide-y divide-neutral-100">
                {opcoes.map((o, i) => (
                  <li key={i} className="flex items-center gap-4 py-2.5">
                    <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[12px] text-neutral-900 font-medium">{o}</span>
                  </li>
                ))}
              </ol>
            </Block>

            {/* Etapas */}
            {steps.map((s, idx) => (
              <Block key={s.n} label={String(idx + 3).padStart(2, "0")} title={s.title}>
                <KVGrid rows={s.rows.map(r => [r.label, r.value] as [string, string])} />
              </Block>
            ))}

            {/* Cronologia */}
            <Block label={String(steps.length + 3).padStart(2, "0")} title="Cronologia">
              <ul className="relative pl-5 space-y-3.5">
                {cronologia.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-neutral-900" />
                    {i < cronologia.length - 1 && (
                      <span className="absolute -left-[15px] top-3 bottom-[-14px] w-px bg-neutral-200" />
                    )}
                    <div className="flex items-baseline gap-3">
                      <p className="text-[12px] font-semibold text-neutral-900">{h.accao}</p>
                      <p className="text-[10px] text-neutral-500 tabular-nums">{fmtDataShort(h.data)}</p>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">{h.detalhe}</p>
                  </li>
                ))}
              </ul>
            </Block>

            {/* Documentos */}
            <Block label={String(steps.length + 4).padStart(2, "0")} title="Documentos Entregues">
              <ul className="divide-y divide-neutral-100">
                {c.documentos.map((d, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-[12px] text-neutral-900">{d.nome}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Entregue
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          {/* Footer */}
          <footer className="px-16 pb-14 pt-6 mt-auto">
            <div className="h-px bg-neutral-200 mb-5" />
            <div className="flex items-end justify-between gap-8">
              <p className="text-[9.5px] text-neutral-500 leading-relaxed max-w-sm">
                Documento gerado automaticamente pelo Gabinete de Apoio Académico com base nos registos oficiais da candidatura.
                Para esclarecimentos: <span className="font-semibold text-neutral-700">gap@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-neutral-300 pt-1.5 min-w-[200px]">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">
                    Coordenação do GAP
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-900 mt-0.5">Dra. Helena Cabral</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Block({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[60px_1fr] gap-6">
      <div className="pt-1">
        <p className="font-mono text-[10px] font-semibold text-neutral-400 tabular-nums">{label}</p>
      </div>
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.22em] font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-200">
          {title}
        </h3>
        {children}
      </div>
    </section>
  );
}

function KVGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-2.5">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <dt className="text-[9.5px] uppercase tracking-[0.14em] text-neutral-400 font-semibold">{k}</dt>
          <dd className="text-[12px] text-neutral-900 font-medium leading-snug">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
