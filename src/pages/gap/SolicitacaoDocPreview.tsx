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
    <div className="flex flex-col h-full bg-muted/30">
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
      <div className="flex-1 overflow-y-auto py-8 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0"
          style={{ width: "210mm", minHeight: "297mm" }}
        >

          {/* Header institucional */}
          <div className="px-10 pt-10 pb-6 border-b-2 border-primary">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">
                  Universidade Privada
                </p>
                <h1 className="text-[20px] font-bold text-foreground tracking-tight mt-0.5 leading-tight">
                  Gabinete de Apoio Académico
                </h1>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Faculdade de Ciências Exatas · Curso de Arquitectura
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  Documento
                </p>
                <p className="font-mono text-[13px] font-bold text-foreground mt-0.5">
                  Pedido-{s.id}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Emitido a {fmtDataLong(new Date())}
                </p>
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="px-10 pt-7 pb-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-1.5">
              Relatório de Solicitação
            </p>
            <h2 className="text-[22px] font-bold text-foreground leading-tight tracking-tight">
              {tipoCfg?.label ?? s.tipo}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${tone.bg} ${tone.text} ${tone.border} text-[10.5px] font-semibold uppercase tracking-wider`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                {st.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Categoria: <span className="font-semibold text-foreground">{tipoCfg?.categoria ?? "—"}</span>
              </span>
            </div>
          </div>

          {/* Section: Identificação */}
          <Section title="1. Identificação do Discente">
            <DocTable
              rows={[
                ["Nome", s.discente],
                ["Matrícula", s.matricula],
                ["Curso", s.curso],
                ["Faculdade", s.faculdade],
                ["Ano curricular", `${s.ano}º ano`],
              ]}
            />
          </Section>

          {/* Section: Detalhes da Solicitação */}
          <Section title="2. Detalhes da Solicitação">
            <DocTable
              rows={[
                ["Referência", s.id],
                ["Assunto", s.assunto],
                ["Tipo de pedido", tipoCfg?.label ?? s.tipo],
                ["Categoria", tipoCfg?.categoria ?? "—"],
                ["Prioridade", prio?.label ?? s.prioridade],
                ["Estado actual", st.label],
              ]}
            />
          </Section>

          {/* Section: Encaminhamento & SLA */}
          <Section title="3. Encaminhamento & SLA">
            <DocTable
              rows={[
                ["Destino", dest.label],
                ["Responsável atribuído", s.responsavelDestino ?? `Equipa ${dest.label}`],
                ["Data de submissão", fmtDataHora(dataInicio)],
                ["Hora de aceitação / atribuição", fmtDataHora(dataAceite)],
                ["SLA contratado", `${s.slaDias} ${s.slaDias === 1 ? "dia útil" : "dias úteis"}`],
                [
                  s.estado === "concluida" || s.estado === "rejeitada" ? "Dias até conclusão" : "Dias decorridos",
                  s.estado === "concluida" || s.estado === "rejeitada"
                    ? (diasConclusao !== null ? `${diasConclusao} ${diasConclusao === 1 ? "dia" : "dias"}` : "—")
                    : (diasDecorridos !== null ? `${diasDecorridos} ${diasDecorridos === 1 ? "dia" : "dias"}` : "—"),
                ],
              ]}
            />
          </Section>

          {/* Section: Descrição */}
          <Section title="4. Descrição do Pedido">
            <div className="rounded border border-border bg-muted/20 px-4 py-3">
              <p className="text-[12.5px] text-foreground leading-[1.7] whitespace-pre-line">
                {s.descricao}
              </p>
            </div>
            {s.notaInterna && (
              <div className="mt-3 rounded border border-amber-200 bg-amber-50/60 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-800 font-bold mb-1">Nota interna</p>
                <p className="text-[12.5px] text-foreground leading-[1.7] whitespace-pre-line">{s.notaInterna}</p>
              </div>
            )}
          </Section>

          {/* Section: Cronologia */}
          <Section title="5. Cronologia do Processo">
            <div className="overflow-hidden rounded border border-border">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="bg-primary/5 border-b border-border">
                    <th className="text-left px-3 py-2 font-semibold text-foreground w-[26%]">Data & Hora</th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground w-[34%]">Acção</th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">Responsável / Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {s.historico.map((h, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-3 py-2 text-foreground/80 tabular-nums whitespace-nowrap">{fmtDataHora(h.data)}</td>
                      <td className="px-3 py-2 text-foreground font-medium">{h.accao}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <div>{h.actor || "—"}</div>
                        {h.nota && <div className="text-[10.5px] text-muted-foreground/80 italic mt-0.5">{h.nota}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section: Anexos */}
          {anexos.length > 0 && (
            <Section title="6. Documentos Anexados">
              <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border">
                      <th className="text-left px-3 py-2 font-semibold text-foreground w-[8%]">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-foreground">Ficheiro</th>
                      <th className="text-right px-3 py-2 font-semibold text-foreground w-[20%]">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {anexos.map((a, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-2 text-foreground font-medium">{a.nome}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">{a.tamanho}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Section: Resumo Final */}
          <Section title={`${anexos.length > 0 ? "7" : "6"}. Resumo do Processo`}>
            <DocTable
              rows={[
                ["Data de submissão", fmtDataHora(dataInicio)],
                ["Hora de aceitação", fmtDataHora(dataAceite)],
                ["Data de conclusão", dataFim ? fmtDataHora(dataFim) : "Pendente"],
                [
                  "Tempo total de execução",
                  s.estado === "concluida" || s.estado === "rejeitada"
                    ? (diasConclusao !== null ? `${diasConclusao} ${diasConclusao === 1 ? "dia" : "dias"}` : "—")
                    : (diasDecorridos !== null ? `${diasDecorridos} ${diasDecorridos === 1 ? "dia" : "dias"} (em curso)` : "—"),
                ],
                ["Cumprimento de SLA", `${s.slaDias} ${s.slaDias === 1 ? "dia útil" : "dias úteis"} contratados`],
                ["Estado final", st.label],
                ["Total de movimentos", String(s.historico.length)],
              ]}
            />
          </Section>

          {/* Footer */}
          <div className="px-10 pb-10 pt-6 mt-4 border-t border-border">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
                  Este documento foi gerado automaticamente pelo Gabinete de Apoio Académico
                  com base nos registos oficiais da plataforma. Para questões adicionais,
                  contacte <span className="font-semibold text-foreground">gap@upra.kor</span>.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="border-t border-foreground/30 pt-1.5 min-w-[180px]">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                    Coordenação do GAP
                  </p>
                  <p className="text-[11px] font-semibold text-foreground mt-0.5">
                    Dra. Helena Cabral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-10 py-5">
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-primary font-bold mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DocTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-[12px]">
        <tbody className="divide-y divide-border">
          {rows.map(([k, v], i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <td className="px-3 py-2 text-muted-foreground font-medium w-[35%] align-top">{k}</td>
              <td className="px-3 py-2 text-foreground font-semibold">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
