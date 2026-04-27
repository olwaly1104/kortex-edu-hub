import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type GapAtendimento, ticketCategoriaConfig } from "@/data/gapData";

type Props = { atendimento: GapAtendimento };

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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

const estadoLabel: Record<string, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  remarcar: "Remarcar",
};

export default function AtendimentoDocPreview({ atendimento: a }: Props) {
  const { toast } = useToast();
  const cat = ticketCategoriaConfig[a.categoria];
  const startTime = a.hora;
  const endTime = addMinutesToHHMM(a.hora, parseDuracaoMin(a.duracao));
  const extras = a.participantes ?? [];

  return (
    <div className="flex flex-col h-full min-h-0 bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-muted-foreground">Agendamento-{a.id}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground">Documento institucional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => window.print()}>
            <Printer className="w-3 h-3" /> Imprimir
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 text-[11px] gap-1.5"
            onClick={() => toast({ title: "Documento exportado", description: `Agendamento-${a.id}.pdf` })}
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
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.faculdade} · {a.curso}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Referência</p>
                <p className="font-mono text-[12px] font-bold text-foreground tracking-tight">Agendamento-{a.id}</p>
                <p className="text-[8.5px] text-muted-foreground mt-0.5">Emitido em {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </div>

          {/* ── Document title ─────────────────────────────────── */}
          <div className="px-10 pt-5 pb-4">
            <p className="text-[8.5px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
              Relatório de Agendamento
            </p>
            <h2 className="text-[18px] font-bold text-foreground leading-tight tracking-tight mt-1">{a.motivo}</h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-10 pb-4 space-y-4 overflow-hidden">
            {/* 1 · Detalhes do Agendamento */}
            <Section number="1" title="Detalhes do Agendamento">
              <div className="grid grid-cols-2 gap-0 border border-border rounded overflow-hidden">
                <div className="border-r border-border">
                  <SubHeader label="Discente" />
                  <KVList rows={[
                    ["Nome", a.discente],
                    ["Matrícula", a.matricula],
                    ["Curso", a.curso],
                    ["Ano", `${a.ano}º`],
                    ["Estado", estadoLabel[a.estado] ?? a.estado],
                    ["Categoria", cat?.label ?? a.categoria],
                  ]} />
                </div>
                <div>
                  <SubHeader label="Sessão" />
                  <KVList rows={[
                    ["Responsável", a.responsavel],
                    ["Modalidade", a.tipo === "online" ? "Online" : "Presencial"],
                    ["Local", a.tipo === "presencial" && a.sala ? a.sala : "—"],
                    ["Data", fmtData(a.data)],
                    ["Horário", `${startTime} – ${endTime}`],
                    ["Duração", a.duracao],
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
                    <p className="text-[10.5px] text-foreground font-semibold leading-snug">{a.motivo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[110px_1fr]">
                  <div className="px-3 py-2 bg-primary/[0.06] border-r border-border flex items-start">
                    <p className="text-[8.5px] uppercase tracking-wider text-primary font-bold">Descrição</p>
                  </div>
                  <div className="px-3 py-2 bg-background">
                    <p className="text-[10px] text-foreground leading-relaxed whitespace-pre-line line-clamp-5">
                      {a.descricao || "Sem descrição adicional."}
                    </p>
                  </div>
                </div>
                {a.notas && (
                  <div className="grid grid-cols-[110px_1fr]">
                    <div className="px-3 py-2 bg-amber-50 border-r border-amber-200 flex items-start">
                      <p className="text-[8.5px] uppercase tracking-wider text-amber-800 font-bold">Notas</p>
                    </div>
                    <div className="px-3 py-2 bg-amber-50/40">
                      <p className="text-[10px] text-foreground leading-snug whitespace-pre-line line-clamp-3">{a.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* 3 · Participantes */}
            <Section number="3" title="Participantes">
              <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-[9.5px]">
                  <thead>
                    <tr className="bg-primary/[0.05] border-b border-border">
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[6%]">#</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground">Nome</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[24%]">Função</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-foreground w-[30%]">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-background">
                      <td className="px-2.5 py-1 text-muted-foreground tabular-nums">01</td>
                      <td className="px-2.5 py-1 text-foreground font-medium truncate">{a.discente}</td>
                      <td className="px-2.5 py-1 text-muted-foreground">Discente</td>
                      <td className="px-2.5 py-1 text-muted-foreground truncate">{a.matricula} · {a.ano}º ano</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-2.5 py-1 text-muted-foreground tabular-nums">02</td>
                      <td className="px-2.5 py-1 text-foreground font-medium truncate">{a.responsavel}</td>
                      <td className="px-2.5 py-1 text-muted-foreground">Responsável GAP</td>
                      <td className="px-2.5 py-1 text-muted-foreground truncate">Gabinete de Apoio Académico</td>
                    </tr>
                    {extras.slice(0, 3).map((p, i) => (
                      <tr key={i} className={(i + 2) % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-2.5 py-1 text-muted-foreground tabular-nums">{String(i + 3).padStart(2, "0")}</td>
                        <td className="px-2.5 py-1 text-foreground font-medium truncate">{p.nome}</td>
                        <td className="px-2.5 py-1 text-muted-foreground">{p.tipo === "encarregado" ? "Encarregado" : "Externo"}</td>
                        <td className="px-2.5 py-1 text-muted-foreground truncate">
                          {p.relacao}{p.contacto ? ` · ${p.contacto}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
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
