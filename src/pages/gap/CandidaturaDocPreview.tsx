import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Candidatura, estadoLabels } from "@/data/admissoesData";

type Props = {
  candidatura: Candidatura;
  steps: { n: number; title: string; rows: { label: string; value: string }[] }[];
  cronologia: { data: string; accao: string; detalhe: string; done?: boolean }[];
  displayId: string;
  photoIdx?: number;
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const fmtDataShort = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function CandidaturaDocPreview({
  candidatura: c, steps, cronologia, displayId, photoIdx = 12,
}: Props) {
  const { toast } = useToast();
  const estadoKey = c.estado === "incompleto" ? "pendente" : c.estado;

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-200/70">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-foreground">{displayId}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Ficha de Candidatura</span>
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
          {/* Top bar — institutional */}
          <div className="px-10 pt-6 pb-3 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-semibold">
              Universidade Privada · Gabinete de Apoio ao Processo
            </p>
            <p className="font-mono text-[11px] font-bold text-neutral-700">{displayId}</p>
          </div>

          {/* Header — photo + name + estado + submetido */}
          <header className="px-10 pb-6 border-b-2 border-neutral-900">
            <div className="flex items-end gap-5">
              <img
                src={`https://i.pravatar.cc/240?img=${photoIdx}`}
                alt={`Foto — ${c.nome}`}
                className="w-[88px] h-[110px] object-cover border border-neutral-400 bg-neutral-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 font-semibold mb-1">
                  Ficha de Candidatura
                </p>
                <h1 className="text-[26px] leading-[1.1] font-bold tracking-tight text-neutral-900">
                  {c.nome}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-[10.5px] text-neutral-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span className="uppercase tracking-[0.14em] font-bold text-neutral-900">
                      {estadoLabels[estadoKey]}
                    </span>
                  </span>
                  <span className="text-neutral-300">|</span>
                  <span>
                    Submetido a{" "}
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {fmtDataShort(c.dataSubmissao)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </header>


          <div className="flex-1 px-10 py-5 space-y-4">
            {/* Sections */}
            {steps.map(s => (
              <Section key={s.n} title={s.title}>
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
                    <tr key={i} className={i % 2 ? "bg-neutral-50/60" : ""}>
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
                    <tr key={i} className={i % 2 ? "bg-neutral-50/60" : ""}>
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
          <footer className="px-10 pb-6 pt-3 mt-auto border-t border-neutral-300 flex items-end justify-between gap-8">
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
          </footer>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-900 mb-1.5 pb-1 border-b border-neutral-300">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border border-neutral-400 px-3 py-1.5 text-left text-[10px] uppercase tracking-wider font-semibold text-neutral-700 bg-neutral-100 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`border border-neutral-300 px-2.5 py-1 align-top ${className}`}>{children}</td>;
}

/** Identity-strip cells (no zebra) */
function Th2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border border-neutral-400 px-2.5 py-1 text-left text-[9.5px] uppercase tracking-wider font-semibold text-neutral-600 bg-neutral-100 align-middle ${className}`}
    >
      {children}
    </th>
  );
}
function Td2({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`border border-neutral-300 px-2.5 py-1 align-middle text-neutral-900 ${className}`}>{children}</td>;
}

function XTable({ rows }: { rows: [string, string][] }) {
  type Cell = { k: string; v: string; full: boolean };
  const FORCE_FULL = new Set(["Encarregado"]);
  const cells: Cell[] = rows.map(([k, v]) => ({ k, v, full: v.length > 32 || k.length > 26 || FORCE_FULL.has(k) }));
  const lines: Cell[][] = [];
  let buf: Cell[] = [];
  for (const c of cells) {
    if (c.full) {
      if (buf.length) { lines.push(buf); buf = []; }
      lines.push([c]);
    } else {
      buf.push(c);
      if (buf.length === 2) { lines.push(buf); buf = []; }
    }
  }
  if (buf.length) lines.push(buf);

  const labelCls =
    "w-[22%] bg-neutral-100 font-semibold text-neutral-700 text-[9.5px] uppercase tracking-wider border-neutral-400";

  return (
    <table className="w-full border-collapse text-[10.5px] table-fixed">
      <tbody>
        {lines.map((line, i) => (
          <tr key={i}>
            {line.length === 1 && line[0].full ? (
              <>
                <Td className={labelCls}>{line[0].k}</Td>
                <Td colSpan={3}>{line[0].v}</Td>
              </>
            ) : line.length === 2 ? (
              <>
                <Td className={labelCls}>{line[0].k}</Td>
                <Td>{line[0].v}</Td>
                <Td className={labelCls}>{line[1].k}</Td>
                <Td>{line[1].v}</Td>
              </>
            ) : (
              <>
                <Td className={labelCls}>{line[0].k}</Td>
                <Td>{line[0].v}</Td>
                <Td className={labelCls + " opacity-0"}>&nbsp;</Td>
                <Td>&nbsp;</Td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
