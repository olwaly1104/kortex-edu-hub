import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type Solicitacao, estadoSolicitacaoConfig, destinoConfig, tipoConfig,
  type GapEstudanteSeguimento,
} from "@/data/gapData";

type Props = {
  discente: GapEstudanteSeguimento;
  solicitacoes: Solicitacao[];
  anoLetivo?: string;
};

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

export default function EstudanteRelatorioDoc({ discente, solicitacoes: sols, anoLetivo = "2023/2024" }: Props) {
  const { toast } = useToast();

  const recebidas = sols.filter(s => s.estado === "recebida").length;
  const emExec = sols.filter(s => s.estado === "em_execucao").length;
  const concluidas = sols.filter(s => s.estado === "concluida").length;
  const rejeitadas = sols.filter(s => s.estado === "rejeitada").length;
  const total = sols.length;

  // sort chronologically (oldest first → reads as a timeline)
  const ordered = [...sols].sort((a, b) =>
    a.dataSubmissao.localeCompare(b.dataSubmissao)
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">
            Relatório-{discente.matricula}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Histórico anual de solicitações</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Relatório-${discente.matricula}.pdf` })}
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
          {/* ── Header ─────────────────────────────────────────── */}
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
                <p className="font-mono text-[11px] font-semibold tracking-tight">Relatório-{discente.matricula}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* ── Document title ─────────────────────────────────── */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">
              Histórico Anual de Solicitações · Ano Letivo {anoLetivo}
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">
              {discente.nome}
            </h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-12 pb-6 space-y-5">
            {/* I · Identificação */}
            <Section number="I" title="Identificação do Discente">
              <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                <div className="grid grid-cols-2 bg-doc-accent/[0.06] border-b border-doc-accent/35">
                  <div className="px-3 py-1.5 border-r border-doc-accent/25">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Dados Académicos</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Acompanhamento</p>
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
              <div className="border-t-[3px] border-doc-accent bg-doc-accent/[0.035] px-5 py-3.5">
                <div className="grid grid-cols-5 gap-4">
                  <Stat label="Total" value={total} />
                  <Stat label="Recebidas" value={recebidas} />
                  <Stat label="Em Execução" value={emExec} />
                  <Stat label="Concluídas" value={concluidas} />
                  <Stat label="Rejeitadas" value={rejeitadas} />
                </div>
              </div>
            </Section>

            {/* III · Listagem de Solicitações */}
            <Section number="III" title="Solicitações Registadas">
              {ordered.length === 0 ? (
                <div className="border border-doc-accent/35 rounded-sm px-4 py-6 text-center">
                  <p className="text-[10px] text-foreground/60">
                    Nenhuma solicitação registada neste período.
                  </p>
                </div>
              ) : (
                <div className="border border-doc-accent/35 rounded-sm overflow-hidden">
                  <table className="w-full text-[9.5px]">
                    <thead className="bg-doc-accent/[0.06]">
                      <tr className="border-b border-doc-accent/35">
                        <th className="text-left px-3 py-1.5 font-bold w-[6%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">#</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[14%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Referência</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[12%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Submetido</th>
                        <th className="text-left px-3 py-1.5 font-bold text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Tipo de Pedido</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[18%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Encaminhamento</th>
                        <th className="text-left px-3 py-1.5 font-bold w-[14%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {ordered.map((s, i) => {
                        const st = estadoSolicitacaoConfig[s.estado];
                        const dest = destinoConfig[s.destino];
                        const tipoCfg = tipoConfig[s.tipo];
                        return (
                          <tr key={s.id}>
                            <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-3 py-1 font-mono font-semibold tabular-nums">{s.id}</td>
                            <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtData(s.dataSubmissao)}</td>
                            <td className="px-3 py-1 font-medium">{tipoCfg?.label ?? s.tipo}</td>
                            <td className="px-3 py-1 text-foreground/70 truncate">{dest.label}</td>
                            <td className="px-3 py-1">
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/80">
                                <span className={`w-1.5 h-1.5 rounded-full ${dotForEstado(s.estado)}`} />
                                {st.label}
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

          {/* ── Footer ───────────────────────────────────────── */}
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

/* ── Helpers ─────────────────────────────────────────── */

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
      <p className="text-[18px] font-bold tabular-nums leading-none text-doc-accent">{value}</p>
      <p className="text-[7.5px] uppercase tracking-[0.18em] text-foreground/60 font-bold mt-1">{label}</p>
    </div>
  );
}

function dotForEstado(e: Solicitacao["estado"]) {
  if (e === "recebida") return "bg-amber-500";
  if (e === "em_execucao") return "bg-sky-500";
  if (e === "concluida") return "bg-emerald-500";
  return "bg-destructive";
}

function riscoLabel(r: "alto" | "medio" | "baixo") {
  if (r === "alto") return "Risco Alto";
  if (r === "medio") return "Risco Médio";
  return "Risco Baixo";
}
