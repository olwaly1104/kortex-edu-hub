import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type GapAtendimento, ticketCategoriaConfig,
  type GapEstudanteSeguimento,
} from "@/data/gapData";

type Props = {
  discente: GapEstudanteSeguimento;
  atendimentos: GapAtendimento[];
  anoLetivo?: string;
};

const ACCENT = "hsl(28 75% 32%)";
const ACCENT_BG_06 = "hsl(28 75% 32% / 0.06)";
const ACCENT_BG_03 = "hsl(28 75% 32% / 0.03)";
const ACCENT_BORDER_35 = "hsl(28 75% 32% / 0.35)";
const ACCENT_BORDER_25 = "hsl(28 75% 32% / 0.25)";

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const estadoLabel: Record<string, string> = {
  agendado: "Agendado", concluido: "Concluído",
  cancelado: "Cancelado", remarcar: "Remarcar",
};
const estadoDot: Record<string, string> = {
  agendado: "bg-sky-500", concluido: "bg-emerald-500",
  cancelado: "bg-destructive", remarcar: "bg-amber-500",
};

export default function EstudanteAgendamentosDoc({ discente, atendimentos, anoLetivo = "2023/2024" }: Props) {
  const { toast } = useToast();

  const total = atendimentos.length;
  const agendados = atendimentos.filter(a => a.estado === "agendado").length;
  const concluidos = atendimentos.filter(a => a.estado === "concluido").length;
  const cancelados = atendimentos.filter(a => a.estado === "cancelado").length;
  const remarcar = atendimentos.filter(a => a.estado === "remarcar").length;

  const ordered = [...atendimentos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">
            Agendamentos-{discente.matricula}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Histórico anual de agendamentos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Agendamentos-${discente.matricula}.pdf` })}
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
                  Faculdade de Ciências Exatas · Curso de Arquitectura
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Agendamentos-{discente.matricula}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* Title */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] font-semibold" style={{ color: ACCENT }}>
              Histórico Anual de Agendamentos · Ano Letivo {anoLetivo}
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{discente.nome}</h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-12 pb-6 space-y-5">
            {/* I · Identificação */}
            <Section number="I" title="Identificação do Discente">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <div className="grid grid-cols-2" style={{ background: ACCENT_BG_06, borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                  <div className="px-3 py-1.5" style={{ borderRight: `1px solid ${ACCENT_BORDER_25}` }}>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Dados Académicos</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Acompanhamento</p>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <GroupCell rows={[
                    ["Nome", discente.nome],
                    ["Matrícula", discente.matricula],
                    ["Curso", discente.curso],
                    ["Ano", `${discente.ano}º`],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Risco", riscoLabel(discente.risco)],
                    ["Sessões", `${discente.acompanhamentos}`],
                    ["Último contacto", fmtData(discente.ultimoContacto)],
                    ["Ano letivo", anoLetivo],
                  ]} />
                </div>
              </div>
            </Section>

            {/* II · Resumo */}
            <Section number="II" title="Resumo do Período">
              <div className="px-5 py-3.5" style={{ borderTop: `3px solid ${ACCENT}`, background: ACCENT_BG_03 }}>
                <div className="grid grid-cols-5 gap-4">
                  <Stat label="Total" value={total} />
                  <Stat label="Agendados" value={agendados} />
                  <Stat label="Concluídos" value={concluidos} />
                  <Stat label="Cancelados" value={cancelados} />
                  <Stat label="Remarcar" value={remarcar} />
                </div>
              </div>
            </Section>

            {/* III · Listagem */}
            <Section number="III" title="Agendamentos Registados">
              {ordered.length === 0 ? (
                <div className="rounded-sm px-4 py-6 text-center" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                  <p className="text-[10px] text-foreground/60">Nenhum agendamento registado neste período.</p>
                </div>
              ) : (
                <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                  <table className="w-full text-[9.5px]">
                    <thead style={{ background: ACCENT_BG_06 }}>
                      <tr style={{ borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                        <th className="text-left px-3 py-1.5 font-bold w-[5%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>#</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[12%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Ref.</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[14%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Data · Hora</th>
                        <th className="text-left px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Motivo</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[14%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Categoria</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[18%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Responsável</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[12%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {ordered.map((a, i) => {
                        const cat = ticketCategoriaConfig[a.categoria];
                        return (
                          <tr key={a.id}>
                            <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-3 py-1 font-mono font-semibold tabular-nums">{a.id}</td>
                            <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtData(a.data)} · {a.hora}</td>
                            <td className="px-3 py-1 font-medium truncate">{a.motivo}</td>
                            <td className="px-3 py-1 text-foreground/70">{cat?.label ?? a.categoria}</td>
                            <td className="px-3 py-1 text-foreground/70 truncate">{a.responsavel}</td>
                            <td className="px-3 py-1">
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/80">
                                <span className={`w-1.5 h-1.5 rounded-full ${estadoDot[a.estado] ?? "bg-muted-foreground"}`} />
                                {estadoLabel[a.estado] ?? a.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>

          {/* Footer */}
          <div className="px-12 pb-8 pt-3 border-t border-foreground/30 mt-auto">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-foreground/60 leading-snug max-w-sm">
                Documento gerado automaticamente pelo GAP com base nos registos oficiais da plataforma.
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
      <div className="flex items-baseline gap-2 mb-2 pb-1" style={{ borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
        <span className="text-[8.5px] font-mono font-bold tabular-nums" style={{ color: ACCENT }}>{number}.</span>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function GroupCell({ rows, bordered }: { rows: [string, string][]; bordered?: boolean }) {
  return (
    <dl className="px-3 py-2 space-y-1" style={bordered ? { borderRight: `1px solid ${ACCENT_BORDER_25}` } : undefined}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline gap-2 text-[10px]">
          <dt className="text-foreground/55 w-[100px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-[18px] font-bold tabular-nums leading-none" style={{ color: ACCENT }}>{value}</p>
      <p className="text-[7.5px] uppercase tracking-[0.18em] text-foreground/60 font-bold mt-1">{label}</p>
    </div>
  );
}

function riscoLabel(r: "alto" | "medio" | "baixo") {
  if (r === "alto") return "Risco Alto";
  if (r === "medio") return "Risco Médio";
  return "Risco Baixo";
}
