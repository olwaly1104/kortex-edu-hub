import { Printer, Download, Check } from "lucide-react";
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

  // Group sections: identity-related sections go in the left rail summary;
  // the rest render as main editorial blocks.
  const mainSteps = steps;

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
          {/* Hairline top accent */}
          <div className="h-1 bg-[hsl(142_65%_26%)]" />

          {/* Header */}
          <header className="px-12 pt-7 pb-5 flex items-start justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(142_65%_26%)] text-white flex items-center justify-center text-[13px] font-bold tracking-tight">
                U
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-semibold">
                  Universidade Privada
                </p>
                <p className="text-[11px] font-semibold text-neutral-700 mt-0.5">
                  Gabinete de Apoio ao Processo · GAP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.28em] text-neutral-500 font-semibold">Documento nº</p>
              <p className="font-mono text-[13px] font-bold text-neutral-900 mt-0.5">{displayId}</p>
              <p className="text-[9.5px] text-neutral-500 mt-0.5">Emitido a {fmtDataLong(new Date())}</p>
            </div>
          </header>

          {/* Title block */}
          <div className="px-12 pb-6">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[hsl(142_65%_26%)] font-bold">
              Ficha de Candidatura · {c.periodo}
            </p>
            <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight text-neutral-900 mt-2">
              {c.nome}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-neutral-600">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(142_65%_26%)]/10 text-[hsl(142_65%_26%)] font-semibold uppercase tracking-wider text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(142_65%_26%)]" />
                {estadoLabels[estadoKey]}
              </span>
              <span className="text-neutral-300">|</span>
              <span>BI <span className="font-semibold text-neutral-800">{c.bi}</span></span>
              <span className="text-neutral-300">|</span>
              <span>Submetido a <span className="font-semibold text-neutral-800">{fmtDataShort(c.dataSubmissao)}</span></span>
            </div>
          </div>

          {/* Body grid: left rail (photo + quick facts) + main */}
          <div className="px-12 pb-6 grid grid-cols-[160px_1fr] gap-8">
            {/* Left rail */}
            <aside className="space-y-4">
              <img
                src={`https://i.pravatar.cc/240?img=${photoIdx}`}
                alt={`Foto — ${c.nome}`}
                className="w-[160px] h-[200px] object-cover rounded-sm border border-neutral-200 bg-neutral-100"
              />
              <dl className="space-y-2.5 text-[10.5px]">
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">Email</dt>
                  <dd className="text-neutral-900 break-all">{c.email}</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">Telemóvel</dt>
                  <dd className="text-neutral-900 tabular-nums">{c.telefone}</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">Documentos</dt>
                  <dd className="text-neutral-900 font-semibold">{c.documentos.length} entregues</dd>
                </div>
              </dl>
            </aside>

            {/* Main column */}
            <main className="space-y-5 min-w-0">
              {mainSteps.map((s, idx) => (
                <Block key={s.n} n={idx + 1} title={s.title}>
                  <DefinitionGrid rows={s.rows} />
                </Block>
              ))}

              {/* Cronologia */}
              <Block n={mainSteps.length + 1} title="Cronologia">
                <ol className="relative pl-4 border-l border-neutral-200 space-y-2.5">
                  {cronologia.map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-[3px] w-3 h-3 rounded-full bg-white border-2 border-[hsl(142_65%_26%)] flex items-center justify-center">
                        {h.done && <Check className="w-2 h-2 text-[hsl(142_65%_26%)]" strokeWidth={4} />}
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] text-neutral-500 tabular-nums shrink-0 w-[68px]">
                          {fmtDataShort(h.data)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-neutral-900 leading-snug">{h.accao}</p>
                          <p className="text-[10px] text-neutral-500 leading-snug">{h.detalhe}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Block>

              {/* Documentos */}
              <Block n={mainSteps.length + 2} title="Documentos entregues">
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {c.documentos.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10.5px] text-neutral-800">
                      <span className="w-3.5 h-3.5 rounded-sm bg-[hsl(142_65%_26%)]/10 text-[hsl(142_65%_26%)] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" strokeWidth={4} />
                      </span>
                      <span className="truncate">{d.nome}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            </main>
          </div>

          {/* Footer */}
          <footer className="mt-auto px-12 pt-4 pb-6 border-t border-neutral-200 flex items-end justify-between gap-8">
            <div className="text-[9px] text-neutral-500 leading-relaxed max-w-sm">
              <p className="uppercase tracking-[0.18em] font-semibold text-neutral-600">Sobre este documento</p>
              <p className="mt-1">
                Ficha institucional gerada pelo GAP. Para esclarecimentos contacte{" "}
                <span className="font-semibold text-neutral-700">gap@upra.kor</span>.
              </p>
            </div>
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

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-2.5 pb-1.5 border-b border-neutral-200">
        <span className="font-mono text-[10px] font-bold text-[hsl(142_65%_26%)] tabular-nums">
          {String(n).padStart(2, "0")}
        </span>
        <h3 className="text-[11px] uppercase tracking-[0.22em] font-bold text-neutral-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DefinitionGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
      {rows.map((r, i) => {
        const wide = r.value.length > 38 || r.label.length > 26;
        return (
          <div key={i} className={wide ? "col-span-2" : ""}>
            <dt className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">
              {r.label}
            </dt>
            <dd className="text-[11.5px] text-neutral-900 mt-0.5 leading-snug">{r.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
