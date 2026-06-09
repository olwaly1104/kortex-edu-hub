import { Printer, Download } from "lucide-react";
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
  const estadoKey = c.estado === "incompleto" ? "pendente" : c.estado;

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
          className="mx-auto bg-white shadow-md print:shadow-none flex flex-col text-neutral-900"
          style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {/* Header */}
          <header className="px-12 pt-8 pb-3 border-b-2 border-neutral-900">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-neutral-500 font-semibold">
                  Universidade Privada · GAP
                </p>
                <h1 className="text-[18px] font-bold tracking-tight mt-1.5 text-neutral-900">
                  Relatório de Candidatura
                </h1>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold text-neutral-900">{displayId}</p>
                <p className="text-[9.5px] text-neutral-500 mt-0.5">Emitido {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </header>

          {/* Candidate banner */}
          <div className="px-12 pt-4 pb-3 bg-neutral-50 border-b border-neutral-300">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-neutral-500 font-semibold">Candidato</p>
                <p className="text-[15px] font-bold text-neutral-900 mt-0.5">{c.nome}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  BI {c.bi} · {c.periodo} · Submetido em {fmtDataShort(c.dataSubmissao)}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded border border-neutral-300 bg-white text-[10px] uppercase tracking-wider font-bold text-neutral-800">
                {estadoLabels[estadoKey]}
              </span>
            </div>
          </div>

          <div className="flex-1 px-12 py-5 space-y-5">
            {/* Etapas */}
            {steps.map((s, idx) => (
              <Section key={s.n} n={String(idx + 1).padStart(2, "0")} title={s.title}>
                <XTable rows={s.rows.map(r => [r.label, r.value] as [string, string])} />
              </Section>
            ))}

            {/* Cronologia */}
            <Section n={String(steps.length + 1).padStart(2, "0")} title="Cronologia">
              <table className="w-full border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-neutral-100">
                    <Th className="w-24">Data</Th>
                    <Th className="w-52">Acção</Th>
                    <Th>Detalhe</Th>
                  </tr>
                </thead>
                <tbody>
                  {cronologia.map((h, i) => (
                    <tr key={i}>
                      <Td className="tabular-nums text-neutral-600">{fmtDataShort(h.data)}</Td>
                      <Td className="font-semibold">{h.accao}</Td>
                      <Td className="text-neutral-600">{h.detalhe}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Documentos */}
            <Section n={String(steps.length + 2).padStart(2, "0")} title="Documentos Entregues">
              <table className="w-full border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-neutral-100">
                    <Th className="w-10 text-center">#</Th>
                    <Th>Documento</Th>
                    <Th className="w-24 text-center">Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {c.documentos.map((d, i) => (
                    <tr key={i}>
                      <Td className="text-center tabular-nums text-neutral-500">{i + 1}</Td>
                      <Td>{d.nome}</Td>
                      <Td className="text-center font-semibold text-emerald-700">Entregue</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>

          {/* Footer */}
          <footer className="px-12 pb-6 pt-3 mt-auto border-t border-neutral-300">
            <div className="flex items-end justify-between gap-8">
              <p className="text-[9.5px] text-neutral-500 leading-relaxed max-w-sm">
                Documento gerado pelo Gabinete de Apoio Académico. Contacto:{" "}
                <span className="font-semibold text-neutral-700">gap@upra.kor</span>.
              </p>
              <div className="text-right">
                <div className="border-t border-neutral-400 pt-1 min-w-[200px]">
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

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-[10px] font-bold text-neutral-400 tabular-nums">{n}</span>
        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border border-neutral-300 px-3 py-1.5 text-left text-[10px] uppercase tracking-wider font-semibold text-neutral-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border border-neutral-300 px-3 py-1.5 align-top ${className}`}>{children}</td>;
}

function XTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse text-[11px]">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i}>
            <Td className="w-56 bg-neutral-50 font-semibold text-neutral-700 text-[10px] uppercase tracking-wider">
              {k}
            </Td>
            <Td>{v}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
