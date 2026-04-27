import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type Solicitacao, estadoSolicitacaoConfig, destinoConfig, tipoConfig, prioridadeConfig,
} from "@/data/gapData";

type Props = {
  solicitacao: Solicitacao;
  anexos: { nome: string; tamanho: string }[];
};

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDataHora = (iso?: string) => {
  if (!iso) return "—";
  // Aceita "YYYY-MM-DD HH:mm" ou ISO
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  const data = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  // Mostrar hora apenas se a string original a continha
  return iso.includes(":") ? `${data} · ${hora}` : data;
};

const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const diffDias = (start?: string, end?: string) => {
  if (!start || !end) return null;
  const a = new Date(start.replace(" ", "T"));
  const b = new Date(end.replace(" ", "T"));
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const ms = b.getTime() - a.getTime();
  const dias = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  return dias;
};

export default function SolicitacaoDocPreview({ solicitacao: s, anexos }: Props) {
  const { toast } = useToast();
  const st = estadoSolicitacaoConfig[s.estado];
  const dest = destinoConfig[s.destino];
  const tipoCfg = tipoConfig[s.tipo];
  const prio = prioridadeConfig[s.prioridade];

  const submetida = s.historico.find(h => h.accao.toLowerCase().includes("submetida"));
  const aceite = s.historico.find(h => {
    const a = h.accao.toLowerCase();
    return a.includes("atribuíd") || a.includes("atribuid") || a.includes("aceit") || a.includes("iniciad");
  });
  const concluida = s.historico.find(h => {
    const a = h.accao.toLowerCase();
    return a.includes("concluí") || a.includes("conclui") || a.includes("executada") || a.includes("resolvida");
  });

  const dataAceite = aceite?.data ?? s.dataEncaminhamento;
  const dataFim = s.dataConclusao ?? concluida?.data;
  const dataInicio = submetida?.data ?? s.dataSubmissao;
  const diasConclusao = diffDias(dataInicio, dataFim);
  const diasDecorridos = diffDias(dataInicio, new Date().toISOString());

  // Estado → cor semântica do badge no doc
  const estadoTone: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    recebida:    { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200",   dot: "bg-amber-500" },
    em_execucao: { bg: "bg-sky-50",     text: "text-sky-800",     border: "border-sky-200",     dot: "bg-sky-500" },
    concluida:   { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
    rejeitada:   { bg: "bg-red-50",     text: "text-red-800",     border: "border-red-200",     dot: "bg-red-500" },
    em_atraso:   { bg: "bg-orange-50",  text: "text-orange-800",  border: "border-orange-200",  dot: "bg-orange-500" },
  };
  const tone = estadoTone[s.estado] ?? estadoTone.recebida;

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Pedido-{s.id}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento institucional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5"
            onClick={() => { window.print(); }}
          >
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

      {/* A4 page (210 × 297 mm) */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0 flex flex-col"
          style={{ width: "210mm", height: "297mm" }}
        >
          {/* Header */}
          <div className="px-8 pt-7 pb-3 border-b-2 border-primary">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-primary font-bold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold text-foreground tracking-tight leading-tight">Gabinete de Apoio Académico</h1>
                <p className="text-[9px] text-muted-foreground">Faculdade de Ciências Exatas · Curso de Arquitectura</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-bold text-foreground">Pedido-{s.id}</p>
                <p className="text-[8.5px] text-muted-foreground">Emitido a {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="px-8 pt-4 pb-3">
            <p className="text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Relatório de Solicitação</p>
            <h2 className="text-[16px] font-bold text-foreground leading-tight tracking-tight mt-0.5">{tipoCfg?.label ?? s.tipo}</h2>
          </div>

          {/* Body */}
          <div className="flex-1 px-8 pb-3 space-y-3 overflow-hidden">
            {/* 1. Detalhes do Pedido */}
            <Block title="1. Detalhes do Pedido">
              <div className="rounded border border-border overflow-hidden">
                {/* Discente · Responsável (side by side) */}
                <div className="grid grid-cols-2 divide-x divide-border bg-primary/5">
                  <div className="px-3 py-1 text-[8px] uppercase tracking-wider text-primary font-bold">Discente</div>
                  <div className="px-3 py-1 text-[8px] uppercase tracking-wider text-primary font-bold">Responsável</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                  <SubKV rows={[
                    ["Nome", s.discente],
                    ["Matrícula", s.matricula],
                    ["Curso", s.curso],
                    ["Ano", `${s.ano}º`],
                  ]} />
                  <SubKV rows={[
                    ["Destino", dest.label],
                    ["Responsável", s.responsavelDestino ?? `Equipa ${dest.label}`],
                    ["Estado", st.label],
                    ["Referência", s.id],
                  ]} />
                </div>

                {/* Meta do pedido */}
                <table className="w-full text-[10px] border-t border-border">
                  <tbody className="divide-y divide-border">
                    <tr className="bg-background">
                      <td className="px-2.5 py-1 text-muted-foreground font-medium w-[18%] align-top">Assunto</td>
                      <td className="px-2.5 py-1 text-foreground font-semibold" colSpan={3}>{s.assunto}</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-2.5 py-1 text-muted-foreground font-medium w-[18%] align-top">Categoria</td>
                      <td className="px-2.5 py-1 text-foreground font-semibold w-[32%]">{tipoCfg?.categoria ?? "—"}</td>
                      <td className="px-2.5 py-1 text-muted-foreground font-medium w-[18%] align-top border-l border-border">Tipo</td>
                      <td className="px-2.5 py-1 text-foreground font-semibold">{tipoCfg?.label ?? s.tipo}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Descrição */}
                <div className="border-t border-border bg-background px-3 py-2">
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Descrição</p>
                  <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-5">{s.descricao}</p>
                </div>

                {s.notaInterna && (
                  <div className="border-t border-amber-200 bg-amber-50/60 px-3 py-1.5">
                    <p className="text-[8px] uppercase tracking-wider text-amber-800 font-bold">Nota interna</p>
                    <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-2">{s.notaInterna}</p>
                  </div>
                )}
              </div>
            </Block>

            {/* 5 Cronologia */}
            <Block title="5. Cronologia">
              <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-[9.5px]">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border">
                      <th className="text-left px-2 py-1 font-semibold text-foreground w-[28%]">Data & Hora</th>
                      <th className="text-left px-2 py-1 font-semibold text-foreground w-[34%]">Acção</th>
                      <th className="text-left px-2 py-1 font-semibold text-foreground">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.historico.slice(0, 6).map((h, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-2 py-1 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataHora(h.data)}</td>
                        <td className="px-2 py-1 text-foreground font-medium">{h.accao}</td>
                        <td className="px-2 py-1 text-muted-foreground truncate">{h.actor || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>

            {/* 6 Anexos */}
            {anexos.length > 0 && (
              <Block title="6. Anexos">
                <div className="overflow-hidden rounded border border-border">
                  <table className="w-full text-[9.5px]">
                    <tbody className="divide-y divide-border">
                      {anexos.slice(0, 4).map((a, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-2 py-1 text-muted-foreground tabular-nums w-[6%]">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-2 py-1 text-foreground font-medium truncate">{a.nome}</td>
                          <td className="px-2 py-1 text-right text-muted-foreground tabular-nums w-[18%]">{a.tamanho}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Block>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-3 border-t border-border">
            <div className="flex items-end justify-between gap-6">
              <p className="text-[8px] text-muted-foreground leading-snug max-w-sm">
                Documento gerado automaticamente pelo GAP com base nos registos oficiais da plataforma.
                Contacto: <span className="font-semibold text-foreground">gap@upra.kor</span>.
              </p>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/40 pt-1 min-w-[160px]">
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[9px] uppercase tracking-[0.16em] text-primary font-bold mb-1">{title}</h3>
      {children}
    </div>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-[10px]">
        <tbody className="divide-y divide-border">
          {rows.map(([k, v], i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <td className="px-2.5 py-1 text-muted-foreground font-medium w-[38%] align-top">{k}</td>
              <td className="px-2.5 py-1 text-foreground font-semibold truncate">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
