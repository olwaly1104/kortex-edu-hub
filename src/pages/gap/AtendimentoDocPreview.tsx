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
    <div className="flex flex-col h-full bg-muted/30">
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
      <div className="flex-1 overflow-y-auto py-8 px-4 bg-muted/30">
        <div
          className="mx-auto bg-white shadow-md border border-border print:shadow-none print:border-0"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header institucional */}
          <div className="px-10 pt-10 pb-6 border-b-2 border-primary">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">Universidade Privada</p>
                <h1 className="text-[20px] font-bold text-foreground tracking-tight mt-0.5 leading-tight">
                  Gabinete de Apoio Académico
                </h1>
                <p className="text-[11px] text-muted-foreground mt-1">{a.faculdade} · {a.curso}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Documento</p>
                <p className="font-mono text-[13px] font-bold text-foreground mt-0.5">Resumo-{a.id}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Emitido a {fmtDataLong(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Title block */}
          <div className="px-10 pt-7 pb-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-1.5">
              Relatório de Atendimento
            </p>
            <h2 className="text-[22px] font-bold text-foreground leading-tight tracking-tight">{a.motivo}</h2>
            <div className="mt-3 inline-flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${tone.bg} ${tone.text} ${tone.border} text-[10.5px] font-semibold uppercase tracking-wider`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                {tone.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Categoria: <span className="font-semibold text-foreground">{cat?.label ?? a.categoria}</span>
              </span>
            </div>
          </div>

          {/* 1. Identificação */}
          <Section title="1. Identificação do Discente">
            <DocTable rows={[
              ["Nome", a.discente],
              ["Matrícula", a.matricula],
              ["Curso", a.curso],
              ["Faculdade", a.faculdade],
              ["Ano curricular", `${a.ano}º ano`],
            ]}/>
          </Section>

          {/* 2. Sessão */}
          <Section title="2. Detalhes da Sessão">
            <DocTable rows={[
              ["Referência", a.id],
              ["Motivo", a.motivo],
              ["Categoria", cat?.label ?? a.categoria],
              ["Data", fmtData(a.data)],
              ["Horário", `${startTime} – ${endTime}`],
              ["Duração", a.duracao],
              ["Modalidade", a.tipo === "online" ? "Online" : "Presencial"],
              ["Local", a.tipo === "presencial" && a.sala ? a.sala : "—"],
              ["Responsável GAP", a.responsavel],
              ["Estado actual", tone.label],
            ]}/>
          </Section>

          {/* 3. Descrição */}
          <Section title="3. Descrição do Atendimento">
            <div className="rounded border border-border bg-muted/20 px-4 py-3">
              <p className="text-[12.5px] text-foreground leading-[1.7] whitespace-pre-line">
                {a.descricao || "Sem descrição adicional."}
              </p>
            </div>
          </Section>

          {/* 4. Participantes */}
          <Section title="4. Participantes da Sessão">
            <div className="overflow-hidden rounded border border-border">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="bg-primary/5 border-b border-border">
                    <th className="text-left px-3 py-2 font-semibold text-foreground w-[8%]">#</th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground">Nome</th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground w-[25%]">Função</th>
                    <th className="text-left px-3 py-2 font-semibold text-foreground w-[28%]">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">01</td>
                    <td className="px-3 py-2 text-foreground font-medium">{a.discente}</td>
                    <td className="px-3 py-2 text-muted-foreground">Discente</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.matricula} · {a.ano}º ano</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">02</td>
                    <td className="px-3 py-2 text-foreground font-medium">{a.responsavel}</td>
                    <td className="px-3 py-2 text-muted-foreground">Responsável GAP</td>
                    <td className="px-3 py-2 text-muted-foreground">Gabinete de Apoio Académico</td>
                  </tr>
                  {extras.map((p, i) => (
                    <tr key={i} className={(i + 2) % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{String(i + 3).padStart(2, "0")}</td>
                      <td className="px-3 py-2 text-foreground font-medium">{p.nome}</td>
                      <td className="px-3 py-2 text-muted-foreground capitalize">
                        {p.tipo === "encarregado" ? "Encarregado / Família" : "Escola / Externo"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {p.relacao}{p.contacto ? ` · ${p.contacto}` : ""}
                        {p.tipo !== "encarregado" ? ` · ${p.confirmado ? "Confirmado" : "Pendente"}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 5. Notas / Resumo */}
          {a.notas && (
            <Section title="5. Notas da Sessão">
              <div className="rounded border border-border bg-muted/20 px-4 py-3">
                <p className="text-[12.5px] text-foreground leading-[1.7] whitespace-pre-line">{a.notas}</p>
              </div>
            </Section>
          )}

          <Section title={`${a.notas ? "6" : "5"}. Resumo do Processo`}>
            <DocTable rows={[
              ["Data agendada", fmtData(a.data)],
              ["Horário previsto", `${startTime} – ${endTime}`],
              ["Modalidade", a.tipo === "online" ? "Online" : "Presencial"],
              ["Estado final", tone.label],
              ["Total de participantes", String(2 + extras.length)],
            ]}/>
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
                  <p className="text-[11px] font-semibold text-foreground mt-0.5">Dra. Helena Cabral</p>
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
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-primary font-bold mb-2.5">{title}</h3>
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
