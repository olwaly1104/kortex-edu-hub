import { Printer, Download } from "lucide-react";
import logoAsset from "@/assets/logo-upra.asset.json";
import studentPhoto from "@/assets/student-id-photo.jpg";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Candidatura, estadoLabels } from "@/data/admissoesData";

type EtapaEstado = "completo" | "agendado" | "remarcado" | "falta" | "aprovado" | "reprovado";

type Props = {
  candidatura: Candidatura;
  steps: { n: number; title: string; rows: { label: string; value: string }[] }[];
  cronologia: { data: string; accao: string; detalhe: string; done?: boolean; estado?: EtapaEstado }[];
  displayId: string;
  photoIdx?: number;
};

const etapaEstadoCls: Record<EtapaEstado, string> = {
  completo: "bg-emerald-50 text-emerald-700 border-emerald-300",
  aprovado: "bg-emerald-50 text-emerald-700 border-emerald-300",
  agendado: "bg-sky-50 text-sky-700 border-sky-300",
  remarcado: "bg-amber-50 text-amber-700 border-amber-300",
  falta: "bg-red-50 text-red-700 border-red-300",
  reprovado: "bg-red-50 text-red-700 border-red-300",
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
          {/* Top bar — logo + institucional à esquerda, ID à direita */}
          <div className="px-10 pt-6 pb-3 flex items-center justify-between border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <img src={logoAsset.url} alt="UPRA" className="h-12 w-auto object-contain" />
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-neutral-900">Universidade Privada de Angola</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  Gabinete de Apoio
                </p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">Processo Nº</p>
              <p className="font-mono text-[12px] font-bold text-neutral-900 tabular-nums">{displayId}</p>
            </div>
          </div>

          {/* Header — photo + name + estado + submetido + documentos */}
          <header className="px-10 pt-5 pb-5 border-b-2 border-neutral-900">
            <div className="flex items-start gap-5">
              <img
                src={studentPhoto}
                alt={`Foto — ${c.nome}`}
                width={512}
                height={640}
                loading="lazy"
                className="w-[95px] h-[120px] object-cover border border-neutral-400 bg-neutral-100 shrink-0"
              />

              <div className="flex-1 min-w-0 pt-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500 font-bold mb-1.5">
                  Ficha de Candidatura
                </p>
                <h1 className="text-[22px] leading-[1.1] font-bold tracking-tight text-neutral-900">
                  {c.nome}
                </h1>
                <div className="mt-3 flex items-end gap-5 text-[10px] text-neutral-600">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">
                      Estado
                    </p>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                      <span className="uppercase tracking-[0.14em] font-bold text-neutral-900 text-[10.5px]">
                        {estadoLabels[estadoKey]}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-0.5">
                      Submetido em
                    </p>
                    <span className="font-semibold text-neutral-900 tabular-nums text-[10.5px]">
                      {fmtDataShort(c.dataSubmissao)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="w-[200px] shrink-0 border border-neutral-300 bg-white">
                <div className="px-2 py-1 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between">
                  <p className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-neutral-700">
                    Documentos
                  </p>
                  <p className="text-[9.5px] tabular-nums text-neutral-600 font-semibold">
                    {c.documentos.length}/{c.documentos.length}
                  </p>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {c.documentos.map((d, i) => (
                    <li key={i} className="flex items-center gap-1.5 px-2 py-[3px] text-[9.5px] text-neutral-800">
                      <span className="text-emerald-700 font-bold leading-none">✓</span>
                      <span className="truncate">{d.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <div className="flex-1 px-10 py-5 space-y-4">
            {/* Sections — dados verticais */}
            {steps.map(s => (
              <Section key={s.n} title={s.title}>
                <XTable rows={s.rows.map(r => [r.label, r.value] as [string, string])} />
              </Section>
            ))}

            {/* Etapas da Candidatura — full width, after data */}
            <Section title="Etapas da Candidatura">
              <div className="border border-neutral-300">
                <div className="px-3 py-1.5 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between">
                  <p className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-neutral-700">
                    Cronologia do processo
                  </p>
                  <p className="text-[10px] tabular-nums text-neutral-600 font-semibold">
                    {cronologia.filter(h => h.done !== false).length}/{cronologia.length}
                  </p>
                </div>
                <ul className="divide-y divide-neutral-200">
                  {cronologia.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-1.5 text-[10.5px]">
                      <span className={h.done !== false ? "flex-1 text-neutral-900 font-medium" : "flex-1 text-neutral-500"}>{h.accao}</span>
                      {h.estado && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9.5px] font-semibold uppercase tracking-wide ${etapaEstadoCls[h.estado]}`}>
                          {h.estado}
                        </span>
                      )}
                      <span className="text-neutral-500 tabular-nums text-[10px] w-[80px] text-right">{fmtDataShort(h.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          </div>


          {/* Footer */}
          <footer className="px-10 pb-6 pt-3 mt-auto border-t border-neutral-300 flex items-end justify-between gap-8">
            <p className="text-[9.5px] text-neutral-500 leading-relaxed max-w-sm">
              Documento gerado pelo Gabinete de Apoio. Contacto:{" "}
              <span className="font-semibold text-neutral-700">gap@upra.kor</span>.
            </p>
            <div className="text-right">
              <div className="border-t border-neutral-400 pt-1 min-w-[200px]">
                <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">
                  Coordenação do Gabinete de Apoio
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
  const labelCls =
    "w-[32%] bg-neutral-100 font-semibold text-neutral-700 text-[9.5px] uppercase tracking-wider border-neutral-400";
  return (
    <table className="w-full border-collapse text-[10.5px] table-fixed">
      <tbody>
        {rows.map(([k, v], i) => {
          const value = (v ?? "").toString().trim();
          return (
            <tr key={i}>
              <Td className={labelCls}>{k}</Td>
              <Td className={value ? "" : "text-neutral-400 italic"}>
                {value || "—"}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
