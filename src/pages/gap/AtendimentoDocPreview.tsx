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
                <p className="text-[9px] text-foreground/60 mt-0.5">{a.faculdade} · {a.curso}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[11px] font-semibold tracking-tight">Agendamento-{a.id}</p>
                <p className="text-[8.5px] text-foreground/60 mt-0.5">{fmtDataLong(new Date())}</p>
              </div>
            </div>
            <div className="h-px bg-foreground/40 mt-[2px]" />
          </div>

          {/* ── Document title ─────────────────────────────────── */}
          <div className="px-12 pt-3 pb-5">
            <p className="text-[8.5px] uppercase tracking-[0.24em] text-foreground/55 font-semibold">
              Relatório de Agendamento
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{a.motivo}</h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-12 pb-4 space-y-5 overflow-hidden">
            {/* I · Motivo + Descrição */}
            <Section number="I" title="Motivo do Agendamento">
              <div>
                <h4 className="text-[13px] font-semibold leading-snug tracking-tight">{a.motivo}</h4>
                <p className="text-[10px] leading-relaxed whitespace-pre-line line-clamp-6 mt-2 text-foreground/85">
                  {a.descricao || "Sem descrição adicional."}
                </p>
                {a.notas && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-foreground/25">
                    <p className="text-[7.5px] uppercase tracking-[0.2em] text-foreground/55 font-semibold mb-0.5">
                      Notas
                    </p>
                    <p className="text-[10px] leading-snug whitespace-pre-line line-clamp-3 text-foreground/85 italic">
                      {a.notas}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* II · Detalhes */}
            <Section number="II" title="Detalhes do Agendamento">
              <div className="grid grid-cols-3 gap-x-8 gap-y-0">
                <Group label="Discente" rows={[
                  ["Nome", a.discente],
                  ["Matrícula", a.matricula],
                  ["Curso", a.curso],
                  ["Ano", `${a.ano}º`],
                ]} />
                <Group label="Sessão" rows={[
                  ["Referência", a.id],
                  ["Categoria", cat?.label ?? a.categoria],
                  ["Estado", estadoLabel[a.estado] ?? a.estado],
                  ["Modalidade", a.tipo === "online" ? "Online" : "Presencial"],
                ]} />
                <Group label="Calendarização" rows={[
                  ["Responsável", a.responsavel],
                  ["Local", a.tipo === "presencial" && a.sala ? a.sala : "—"],
                  ["Data", fmtData(a.data)],
                  ["Horário", `${startTime} – ${endTime}`],
                ]} />
              </div>
            </Section>

            {/* III · Participantes */}
            <Section number="III" title="Participantes">
              <table className="w-full text-[9.5px] border-t border-b border-foreground/30">
                <thead>
                  <tr className="border-b border-foreground/30">
                    <th className="text-left py-1.5 font-semibold w-[6%] text-foreground/70 uppercase tracking-wider text-[8px]">#</th>
                    <th className="text-left py-1.5 font-semibold text-foreground/70 uppercase tracking-wider text-[8px]">Nome</th>
                    <th className="text-left py-1.5 font-semibold w-[24%] text-foreground/70 uppercase tracking-wider text-[8px]">Função</th>
                    <th className="text-left py-1.5 font-semibold w-[30%] text-foreground/70 uppercase tracking-wider text-[8px]">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  <tr>
                    <td className="py-1 text-foreground/60 tabular-nums">01</td>
                    <td className="py-1 font-medium truncate">{a.discente}</td>
                    <td className="py-1 text-foreground/70">Discente</td>
                    <td className="py-1 text-foreground/70 truncate">{a.matricula} · {a.ano}º ano</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-foreground/60 tabular-nums">02</td>
                    <td className="py-1 font-medium truncate">{a.responsavel}</td>
                    <td className="py-1 text-foreground/70">Responsável GAP</td>
                    <td className="py-1 text-foreground/70 truncate">Gabinete de Apoio Académico</td>
                  </tr>
                  {extras.slice(0, 3).map((p, i) => (
                    <tr key={i}>
                      <td className="py-1 text-foreground/60 tabular-nums">{String(i + 3).padStart(2, "0")}</td>
                      <td className="py-1 font-medium truncate">{p.nome}</td>
                      <td className="py-1 text-foreground/70">{p.tipo === "encarregado" ? "Encarregado" : "Externo"}</td>
                      <td className="py-1 text-foreground/70 truncate">
                        {p.relacao}{p.contacto ? ` · ${p.contacto}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
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
      <div className="flex items-baseline gap-2 mb-2 pb-1 border-b border-foreground/30">
        <span className="text-[8.5px] font-mono font-bold text-foreground/55 tabular-nums">{number}.</span>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Group({ label, rows }: { label: string; rows: [string, string][] }) {
  return (
    <div>
      <p className="text-[7.5px] uppercase tracking-[0.22em] text-foreground/55 font-semibold pb-1 mb-1 border-b border-foreground/15">
        {label}
      </p>
      <dl className="space-y-0.5">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex items-baseline gap-2 text-[10px]">
            <dt className="text-foreground/60 w-[78px] shrink-0">{k}</dt>
            <dd className="font-semibold truncate flex-1">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
