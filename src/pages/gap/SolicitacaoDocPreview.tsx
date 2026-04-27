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
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col"
          style={{ width: "210mm", height: "297mm" }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="px-10 pt-8 pb-4 border-b-[3px] border-primary">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.22em] text-primary font-bold">Universidade Privada</p>
                <h1 className="text-[16px] font-bold text-foreground tracking-tight leading-tight mt-0.5">
                  Gabinete de Apoio Académico
                </h1>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Faculdade de Ciências Exatas · Curso de Arquitectura
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Referência</p>
                <p className="font-mono text-[12px] font-bold text-foreground tracking-tight">Pedido-{s.id}</p>
                <p className="text-[8.5px] text-muted-foreground mt-0.5">Emitido em {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </div>

          {/* ── Document title ─────────────────────────────────── */}
          <div className="px-10 pt-5 pb-4">
            <p className="text-[8.5px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
              Relatório de Solicitação
            </p>
            <h2 className="text-[18px] font-bold text-foreground leading-tight tracking-tight mt-1">
              {tipoCfg?.label ?? s.tipo}
            </h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-10 pb-4 space-y-4 overflow-hidden">
            {/* 1 · Detalhes do Pedido */}
            <Section number="1" title="Detalhes do Pedido">
              <div className="grid grid-cols-2 gap-0 border border-border rounded overflow-hidden">
                <div className="border-r border-border">
                  <SubHeader label="Discente" />
                  <KVList rows={[
                    ["Nome", s.discente],
                    ["Matrícula", s.matricula],
                    ["Curso", s.curso],
                    ["Ano", `${s.ano}º`],
                    ["Estado", st.label],
                    ["Categoria", tipoCfg?.categoria ?? "—"],
                  ]} />
                </div>
                <div>
                  <SubHeader label="Encaminhamento" />
                  <KVList rows={[
                    ["Destino", dest.label],
                    ["Responsável", s.responsavelDestino ?? `Equipa ${dest.label}`],
                    ["Submetido", fmtDataHora(s.dataSubmissao)],
                    ["Encaminhado", fmtDataHora(s.dataEncaminhamento)],
                    ["Conclusão", fmtDataHora(s.dataConclusao)],
                    ["Prazo", fmtDataHora((s as any).prazo)],
                  ]} />
                </div>
              </div>
            </Section>

            {/* 2 · Motivo & Descrição */}
            <Section number="2" title="Motivo & Descrição">
              <div className="border border-border rounded overflow-hidden divide-y divide-border">
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="px-3 py-2 bg-primary/[0.06] border-r border-border flex items-center">
                    <p className="text-[8.5px] uppercase tracking-wider text-primary font-bold">Motivo</p>
                  </div>
                  <div className="px-3 py-2 bg-background">
                    <p className="text-[10.5px] text-foreground font-semibold leading-snug">{s.assunto}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="px-3 py-2 bg-primary/[0.06] border-r border-border flex items-start">
                    <p className="text-[8.5px] uppercase tracking-wider text-primary font-bold">Descrição</p>
                  </div>
                  <div className="px-3 py-2 bg-background">
                    <p className="text-[10px] text-foreground leading-relaxed whitespace-pre-line line-clamp-5">
                      {s.descricao}
                    </p>
                  </div>
                </div>
                {s.notaInterna && (
                  <div className="grid grid-cols-[110px_1fr]">
                    <div className="px-3 py-2 bg-amber-50 border-r border-amber-200 flex items-start">
                      <p className="text-[8.5px] uppercase tracking-wider text-amber-800 font-bold">Nota Interna</p>
                    </div>
                    <div className="px-3 py-2 bg-amber-50/40">
                      <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-2">
                        {s.notaInterna}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* 3 · Cronologia */}
            <Section number="3" title="Cronologia">
              <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-[9.5px]">
                  <thead>
                    <tr className="bg-primary/[0.05] border-b border-border">
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[6%]">#</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[26%]">Data & Hora</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[36%]">Acção</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.historico.slice(0, 6).map((h, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-2.5 py-1 text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-2.5 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataHora(h.data)}</td>
                        <td className="px-2.5 py-1 text-foreground font-medium">{h.accao}</td>
                        <td className="px-2.5 py-1 text-muted-foreground truncate">{h.actor || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 4 · Anexos */}
            {anexos.length > 0 && (
              <Section number="4" title="Anexos">
                <div className="overflow-hidden rounded border border-border">
                  <table className="w-full text-[9.5px]">
                    <tbody className="divide-y divide-border">
                      {anexos.slice(0, 4).map((a, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-2.5 py-1 text-muted-foreground tabular-nums w-[6%]">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-2.5 py-1 text-foreground font-medium truncate">{a.nome}</td>
                          <td className="px-2.5 py-1 text-right text-muted-foreground tabular-nums w-[18%]">{a.tamanho}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="px-10 pb-7 pt-3 border-t border-border">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-muted-foreground leading-snug max-w-sm">
                Documento gerado automaticamente pelo GAP com base nos registos oficiais da plataforma.
                Contacto: <span className="font-semibold text-foreground">gap@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/40 pt-1 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Coordenação do GAP</p>
                  <p className="text-[10px] font-semibold text-foreground">Dra. Helena Cabral</p>
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
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[8.5px] font-mono font-bold text-primary">{number}</span>
        <h3 className="text-[10px] uppercase tracking-[0.18em] text-foreground font-bold">{title}</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

function SubHeader({ label }: { label: string }) {
  return (
    <div className="px-2.5 py-1 bg-primary/[0.06] border-b border-border">
      <p className="text-[8.5px] uppercase tracking-wider text-primary font-bold">{label}</p>
    </div>
  );
}

function KVList({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-[10px]">
      <tbody className="divide-y divide-border">
        {rows.map(([k, v], i) => (
          <tr key={i}>
            <td className="px-2.5 py-1 text-muted-foreground font-medium w-[42%] align-top">{k}</td>
            <td className="px-2.5 py-1 text-foreground font-semibold truncate">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
