import { Printer, Download, FileText, FileImage, FileSpreadsheet, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type GapAtendimento, ticketCategoriaConfig, getComentariosAtendimento } from "@/data/gapData";

type Props = { atendimento: GapAtendimento };

const fmtData = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const fmtDataLong = (d: Date) =>
  d.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
const fmtDataHora = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  const data = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  return iso.includes(":") ? `${data} · ${hora}` : data;
};

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

// Distinct accent for Agendamento (amber/sienna) vs Solicitação (deep teal-green)
// Hard-coded HSL via inline style for printable doc consistency.
const ACCENT = "hsl(28 75% 32%)";        // deep amber/sienna
const ACCENT_BG_06 = "hsl(28 75% 32% / 0.06)";
const ACCENT_BG_03 = "hsl(28 75% 32% / 0.03)";
const ACCENT_BORDER_35 = "hsl(28 75% 32% / 0.35)";
const ACCENT_BORDER_25 = "hsl(28 75% 32% / 0.25)";
const ACCENT_BORDER_15 = "hsl(28 75% 32% / 0.15)";

export default function AtendimentoDocPreview({ atendimento: a }: Props) {
  const { toast } = useToast();
  const cat = ticketCategoriaConfig[a.categoria];
  const startTime = a.hora;
  const endTime = addMinutesToHHMM(a.hora, parseDuracaoMin(a.duracao));
  const extras = a.participantes ?? [];
  const comentarios = getComentariosAtendimento(a.id, a.responsavel);

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
            <p className="text-[8.5px] uppercase tracking-[0.24em] font-semibold" style={{ color: ACCENT }}>
              Relatório de Agendamento
            </p>
            <h2 className="text-[17px] font-bold leading-tight tracking-tight mt-1">{a.motivo}</h2>
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <div className="flex-1 px-12 pb-4 space-y-5">
            {/* I · Detalhes do Agendamento */}
            <Section number="I" title="Detalhes do Agendamento">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <div className="grid grid-cols-3" style={{ background: ACCENT_BG_06, borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                  <div className="px-3 py-1.5" style={{ borderRight: `1px solid ${ACCENT_BORDER_25}` }}>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Discente</p>
                  </div>
                  <div className="px-3 py-1.5" style={{ borderRight: `1px solid ${ACCENT_BORDER_25}` }}>
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Sessão</p>
                  </div>
                  <div className="px-3 py-1.5">
                    <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold" style={{ color: ACCENT }}>Responsável</p>
                  </div>
                </div>
                <div className="grid grid-cols-3">
                  <GroupCell rows={[
                    ["Nome", a.discente],
                    ["Matrícula", a.matricula],
                    ["Curso", a.curso],
                    ["Ano", `${a.ano}º`],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Referência", a.id],
                    ["Categoria", cat?.label ?? a.categoria],
                    ["Estado", estadoLabel[a.estado] ?? a.estado],
                    ["Modalidade", a.tipo === "online" ? "Online" : "Presencial"],
                  ]} bordered />
                  <GroupCell rows={[
                    ["Responsável", a.responsavel],
                    ["Local", a.tipo === "presencial" && a.sala ? a.sala : "—"],
                    ["Data", fmtData(a.data)],
                    ["Horário", `${startTime} – ${endTime}`],
                  ]} />
                </div>
              </div>
            </Section>

            {/* II · Motivo + Descrição */}
            <Section number="II" title="Motivo do Agendamento">
              <div className="px-5 py-4" style={{ borderTop: `3px solid ${ACCENT}`, background: ACCENT_BG_03 }}>
                <p className="text-[7.5px] uppercase tracking-[0.22em] font-bold mb-1.5" style={{ color: ACCENT }}>
                  Motivo
                </p>
                <h4 className="text-[14px] font-bold leading-snug tracking-tight text-foreground mb-3">
                  {a.motivo}
                </h4>
                <p className="text-[10.5px] leading-[1.6] whitespace-pre-line text-foreground/85">
                  {a.descricao || "Sem descrição adicional."}
                </p>
                {a.notas && (
                  <p
                    className="mt-2.5 text-[10px] leading-snug whitespace-pre-line text-foreground/65 italic pl-2.5"
                    style={{ borderLeft: `2px solid ${ACCENT_BORDER_35}` }}
                  >
                    <span
                      className="not-italic font-bold text-[7.5px] uppercase tracking-[0.22em] mr-1.5"
                      style={{ color: ACCENT }}
                    >Nota</span>
                    {a.notas}
                  </p>
                )}
              </div>
            </Section>

            {/* III · Participantes */}
            <Section number="III" title="Participantes">
              <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                <table className="w-full text-[9.5px]">
                  <thead style={{ background: ACCENT_BG_06 }}>
                    <tr style={{ borderBottom: `1px solid ${ACCENT_BORDER_35}` }}>
                      <th className="text-left px-3 py-1.5 font-bold w-[6%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>#</th>
                      <th className="text-left px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Nome</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[22%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Função</th>
                      <th className="text-left px-3 py-1.5 font-bold w-[32%] uppercase tracking-[0.16em] text-[7.5px]" style={{ color: ACCENT }}>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/10">
                    <tr>
                      <td className="px-3 py-1 text-foreground/60 tabular-nums">01</td>
                      <td className="px-3 py-1 font-medium truncate">{a.discente}</td>
                      <td className="px-3 py-1 text-foreground/70">Discente</td>
                      <td className="px-3 py-1 text-foreground/70 truncate">{a.matricula} · {a.ano}º ano</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1 text-foreground/60 tabular-nums">02</td>
                      <td className="px-3 py-1 font-medium truncate">{a.responsavel}</td>
                      <td className="px-3 py-1 text-foreground/70">Responsável GAP</td>
                      <td className="px-3 py-1 text-foreground/70 truncate">Gabinete de Apoio Académico</td>
                    </tr>
                    {extras.slice(0, 3).map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1 text-foreground/60 tabular-nums">{String(i + 3).padStart(2, "0")}</td>
                        <td className="px-3 py-1 font-medium truncate">{p.nome}</td>
                        <td className="px-3 py-1 text-foreground/70">{p.tipo === "encarregado" ? "Encarregado" : "Externo"}</td>
                        <td className="px-3 py-1 text-foreground/70 truncate">
                          {p.relacao}{p.contacto ? ` · ${p.contacto}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* IV · Notas & Comentários */}
            {comentarios.length > 0 && (
              <Section number="IV" title="Notas & Comentários">
                <div className="rounded-sm overflow-hidden divide-y divide-foreground/10" style={{ border: `1px solid ${ACCENT_BORDER_35}` }}>
                  {comentarios.map((c, i) => (
                    <div key={i} className="px-3 py-2" style={{ background: ACCENT_BG_03 }}>
                      <div className="flex items-baseline justify-between gap-3 mb-0.5">
                        <p className="text-[9.5px] font-bold text-foreground">{c.actor}</p>
                        <p className="text-[8px] text-foreground/55 tabular-nums whitespace-nowrap">{fmtDataHora(c.data)}</p>
                      </div>
                      <p className="text-[9.5px] leading-[1.55] text-foreground/85 whitespace-pre-line">{c.texto}</p>
                      {c.anexo && (() => {
                        const ic = anexoIcon(c.anexo.tipo);
                        return (
                          <div
                            className="mt-1.5 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-white"
                            style={{ border: `1px solid ${ACCENT_BORDER_35}` }}
                          >
                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${ic.cls}`}>
                              <ic.Icon className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[8.5px] font-semibold text-foreground/85 truncate max-w-[200px]">{c.anexo.nome}</span>
                            <span className="text-[8px] text-foreground/55 tabular-nums">{c.anexo.tamanho}</span>
                            <Paperclip className="w-2.5 h-2.5 ml-0.5" style={{ color: ACCENT }} />
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </Section>
            )}
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
          <dt className="text-foreground/55 w-[78px] shrink-0 font-medium">{k}</dt>
          <dd className="font-semibold truncate flex-1 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function anexoIcon(t: "pdf" | "doc" | "image" | "sheet") {
  if (t === "image") return { Icon: FileImage, cls: "bg-violet-50 border-violet-200 text-violet-600" };
  if (t === "sheet") return { Icon: FileSpreadsheet, cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
  if (t === "doc")   return { Icon: FileText, cls: "bg-sky-50 border-sky-200 text-sky-600" };
  return { Icon: FileText, cls: "bg-red-50 border-red-200 text-red-600" };
}

// Suppress unused warning for ACCENT_BORDER_15 if needed in future
void ACCENT_BORDER_15;
