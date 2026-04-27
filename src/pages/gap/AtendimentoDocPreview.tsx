import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type GapAtendimento, ticketCategoriaConfig } from "@/data/gapData";

type Props = { atendimento: GapAtendimento };

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

function parseDuracaoMin(d: string): number {
  if (!d) return 0;
  const s = d.toLowerCase().replace(/\s+/g, "");
  let total = 0;
  const h = s.match(/(\d+)h/); if (h) total += parseInt(h[1], 10) * 60;
  const m = s.match(/(\d+)(?:min|m)(?!s)/); if (m) total += parseInt(m[1], 10);
  if (!h && !m) { const n = s.match(/(\d+)/); if (n) total = parseInt(n[1], 10); }
  return total;
}
function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

const estadoTone: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  agendado:  { bg: "bg-sky-50",     text: "text-sky-800",     border: "border-sky-200",     dot: "bg-sky-500",     label: "Agendado" },
  concluido: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500", label: "Concluído" },
  cancelado: { bg: "bg-red-50",     text: "text-red-800",     border: "border-red-200",     dot: "bg-red-500",     label: "Cancelado" },
  remarcar:  { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200",   dot: "bg-amber-500",   label: "Remarcar" },
};

export default function AtendimentoDocPreview({ atendimento: a }: Props) {
  const { toast } = useToast();
  const cat = ticketCategoriaConfig[a.categoria];
  const tone = estadoTone[a.estado] ?? estadoTone.agendado;
  const startTime = a.hora;
  const endTime = addMinutesToHHMM(a.hora, parseDuracaoMin(a.duracao));
  const extras = a.participantes ?? [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Resumo-{a.id}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento institucional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Resumo-${a.id}.pdf` })}
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
          {/* Header */}
          <div className="px-8 pt-7 pb-3 border-b-2 border-primary">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.18em] text-primary font-bold">Universidade Privada</p>
                <h1 className="text-[15px] font-bold text-foreground tracking-tight leading-tight">Gabinete de Apoio Académico</h1>
                <p className="text-[9px] text-muted-foreground">{a.faculdade} · {a.curso}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-bold text-foreground">Resumo-{a.id}</p>
                <p className="text-[8.5px] text-muted-foreground">Emitido a {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="px-8 pt-4 pb-3">
            <p className="text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Relatório de Atendimento</p>
            <h2 className="text-[16px] font-bold text-foreground leading-tight tracking-tight mt-0.5">{a.motivo}</h2>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${tone.bg} ${tone.text} ${tone.border} text-[8.5px] font-semibold uppercase tracking-wider`}>
                <span className={`w-1 h-1 rounded-full ${tone.dot}`} />{tone.label}
              </span>
              <span className="text-[8.5px] text-muted-foreground">Categoria <span className="font-semibold text-foreground">{cat?.label ?? a.categoria}</span></span>
              <span className="text-[8.5px] text-muted-foreground">· {a.tipo === "online" ? "Online" : "Presencial"}</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 px-8 pb-3 space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <Block title="1. Discente">
                <KV rows={[
                  ["Nome", a.discente],
                  ["Matrícula", a.matricula],
                  ["Curso", a.curso],
                  ["Ano", `${a.ano}º`],
                ]} />
              </Block>
              <Block title="2. Sessão">
                <KV rows={[
                  ["Referência", a.id],
                  ["Responsável", a.responsavel],
                  ["Local", a.tipo === "presencial" && a.sala ? a.sala : "—"],
                  ["Duração", a.duracao],
                ]} />
              </Block>
            </div>

            <Block title="3. Datas-Chave">
              <div className="grid grid-cols-3 border border-border rounded overflow-hidden">
                {[
                  ["Data", fmtData(a.data)],
                  ["Horário", `${startTime} – ${endTime}`],
                  ["Estado", tone.label],
                ].map(([k, v], i) => (
                  <div key={i} className={`px-2.5 py-1.5 ${i < 2 ? "border-r border-border" : ""}`}>
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</p>
                    <p className="text-[10.5px] font-semibold text-foreground tabular-nums leading-tight mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="4. Descrição">
              <div className="rounded border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-4">
                  {a.descricao || "Sem descrição adicional."}
                </p>
              </div>
            </Block>

            <Block title="5. Participantes">
              <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-[9.5px]">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border">
                      <th className="text-left px-2 py-1 font-semibold text-foreground w-[6%]">#</th>
                      <th className="text-left px-2 py-1 font-semibold text-foreground">Nome</th>
                      <th className="text-left px-2 py-1 font-semibold text-foreground w-[24%]">Função</th>
                      <th className="text-left px-2 py-1 font-semibold text-foreground w-[30%]">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-2 py-1 text-muted-foreground tabular-nums">01</td>
                      <td className="px-2 py-1 text-foreground font-medium truncate">{a.discente}</td>
                      <td className="px-2 py-1 text-muted-foreground">Discente</td>
                      <td className="px-2 py-1 text-muted-foreground truncate">{a.matricula} · {a.ano}º ano</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-2 py-1 text-muted-foreground tabular-nums">02</td>
                      <td className="px-2 py-1 text-foreground font-medium truncate">{a.responsavel}</td>
                      <td className="px-2 py-1 text-muted-foreground">Responsável GAP</td>
                      <td className="px-2 py-1 text-muted-foreground truncate">Gabinete de Apoio Académico</td>
                    </tr>
                    {extras.slice(0, 3).map((p, i) => (
                      <tr key={i} className={(i + 2) % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-2 py-1 text-muted-foreground tabular-nums">{String(i + 3).padStart(2, "0")}</td>
                        <td className="px-2 py-1 text-foreground font-medium truncate">{p.nome}</td>
                        <td className="px-2 py-1 text-muted-foreground">{p.tipo === "encarregado" ? "Encarregado" : "Externo"}</td>
                        <td className="px-2 py-1 text-muted-foreground truncate">
                          {p.relacao}{p.contacto ? ` · ${p.contacto}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>

            {a.notas && (
              <Block title="6. Notas">
                <div className="rounded border border-border bg-muted/20 px-3 py-2">
                  <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-3">{a.notas}</p>
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
