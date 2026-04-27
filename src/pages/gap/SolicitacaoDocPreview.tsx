import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type Solicitacao, estadoSolicitacaoConfig, destinoConfig, tipoConfig,
} from "@/data/gapData";

type Props = {
  solicitacao: Solicitacao;
  anexos: { nome: string; tamanho: string }[];
};

const fmtDataHora = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  const data = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  return iso.includes(":") ? `${data} · ${hora}` : data;
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

export default function SolicitacaoDocPreview({ solicitacao: s, anexos }: Props) {
  const { toast } = useToast();
  const st = estadoSolicitacaoConfig[s.estado];
  const dest = destinoConfig[s.destino];
  const tipoCfg = tipoConfig[s.tipo];

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Pedido-{s.id}</span>
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
            onClick={() => toast({ title: "Documento exportado", description: `Pedido-${s.id}.pdf` })}
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
                <p className="font-mono text-[11px] font-semibold tracking-tight">Pedido-{s.id}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* ── Document title ─────────────────────────────────── */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">
              Relatório de Solicitação
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">
              {tipoCfg?.label ?? s.tipo}
            </h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-12 pb-4 space-y-5 overflow-hidden">
            {/* I · Detalhes do Pedido */}
            <Section number="I" title="Detalhes do Pedido">
              <div className="border border-foreground/20 rounded-sm overflow-hidden">
                <div className="grid grid-cols-3 bg-foreground/[0.035] border-b border-foreground/20">
                  <div className="px-3 py-1.5 border-r border-foreground/15">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Discente</p>
                  </div>
                  <div className="px-3 py-1.5 border-r border-foreground/15">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Pedido</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold">Encaminhamento</p>
                  </div>
                </div>
                <div className="grid grid-cols-3">
                  <GroupCell rows={[
                    ["Nome", s.discente],
                    ["Matrícula", s.matricula],
                    ["Curso", s.curso],
                    ["Ano", `${s.ano}º`],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Referência", s.id],
                    ["Categoria", tipoCfg?.categoria ?? "—"],
                    ["Estado", st.label],
                    ["Submetido", fmtDataHora(s.dataSubmissao)],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Destino", dest.label],
                    ["Responsável", s.responsavelDestino ?? `Equipa ${dest.label}`],
                    ["Encaminhado", fmtDataHora(s.dataEncaminhamento)],
                    ["Conclusão", fmtDataHora(s.dataConclusao)],
                  ]} />
                </div>
              </div>
            </Section>

            {/* II · Motivo + Descrição */}
            <Section number="II" title="Motivo do Pedido">
              <div className="border border-foreground/20 border-t-2 border-t-doc-accent rounded-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-foreground/[0.035] border-b border-foreground/20">
                  <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1">Assunto</p>
                  <h4 className="text-[13px] font-bold leading-snug tracking-tight text-foreground">
                    {s.assunto}
                  </h4>
                </div>
                <div className="px-4 py-2.5 bg-background">
                  <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-1">Descrição</p>
                  <p className="text-[10px] leading-relaxed whitespace-pre-line line-clamp-6 text-foreground/85">
                    {s.descricao}
                  </p>
                  {s.notaInterna && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-foreground/20">
                      <p className="text-[7.5px] uppercase tracking-[0.22em] text-doc-accent font-bold mb-0.5">
                        Nota Interna
                      </p>
                      <p className="text-[10px] leading-snug whitespace-pre-line line-clamp-2 text-foreground/85 italic">
                        {s.notaInterna}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* III · Cronologia */}
            <Section number="III" title="Cronologia">
              <div className="border border-foreground/20 rounded-sm overflow-hidden">
                <table className="w-full text-[9.5px]">
                  <thead className="bg-foreground/[0.035]">
                    <tr className="border-b border-foreground/20">
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
                        <td className="px-3 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataHora(h.data)}</td>
                        <td className="px-3 py-1 font-medium">{h.accao}</td>
                        <td className="px-3 py-1 text-foreground/70 truncate">{h.actor || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* IV · Anexos */}
            {anexos.length > 0 && (
              <Section number="IV" title="Anexos">
                <div className="border border-foreground/20 rounded-sm overflow-hidden">
                  <table className="w-full text-[9.5px]">
                    <thead className="bg-foreground/[0.035]">
                      <tr className="border-b border-foreground/20">
                        <th className="text-left px-3 py-1.5 font-bold w-[6%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">#</th>
                        <th className="text-left px-3 py-1.5 font-bold text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Ficheiro</th>
                        <th className="text-right px-3 py-1.5 font-bold w-[18%] text-doc-accent uppercase tracking-[0.16em] text-[7.5px]">Tamanho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {anexos.slice(0, 4).map((a, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-3 py-1 font-medium truncate">{a.nome}</td>
                          <td className="px-3 py-1 text-right text-foreground/60 tabular-nums">{a.tamanho}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="px-12 pb-8 pt-3 border-t border-foreground/30">
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
      <div className="flex items-baseline gap-2 mb-2 pb-1 border-b border-foreground/20">
        <span className="text-[8.5px] font-mono font-bold text-doc-accent tabular-nums">{number}.</span>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-doc-accent">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function GroupCell({ rows, bordered }: { rows: [string, string][]; bordered?: boolean }) {
  return (
    <dl className={`px-3 py-2 space-y-1 ${bordered ? "border-r border-foreground/15" : ""}`}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline gap-2 text-[10px]">
          <dt className="text-doc-accent/70 w-[78px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
