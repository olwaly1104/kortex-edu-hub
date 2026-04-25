import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  User, DoorOpen, GraduationCap, BookOpen, Hash, FileText, StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; pill: string; dot: string; bar: string; ring: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-100 text-blue-800",       dot: "bg-blue-500",    bar: "bg-blue-500",    ring: "ring-blue-200" },
  concluido: { label: "Concluído", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", bar: "bg-emerald-500", ring: "ring-emerald-200" },
  cancelado: { label: "Cancelado", pill: "bg-red-100 text-red-800",         dot: "bg-red-500",     bar: "bg-red-500",     ring: "ring-red-200" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-100 text-amber-800",     dot: "bg-amber-500",   bar: "bg-amber-500",   ring: "ring-amber-200" },
};

function parseDuracaoMin(d: string): number {
  if (!d) return 0;
  const s = d.toLowerCase().replace(/\s+/g, "");
  let total = 0;
  const h = s.match(/(\d+)h/);
  if (h) total += parseInt(h[1], 10) * 60;
  const m = s.match(/(\d+)(?:min|m)(?!s)/);
  if (m) total += parseInt(m[1], 10);
  if (!h && !m) {
    const n = s.match(/(\d+)/);
    if (n) total = parseInt(n[1], 10);
  }
  return total;
}
function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export default function GapAtendimentoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const atendimento = useMemo(() => gapAtendimentos.find(a => a.id === id), [id]);

  if (!atendimento) {
    return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/gap/agendamentos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Agendamentos
      </Link>

      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">{atendimento.id}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] font-medium text-muted-foreground truncate">Agendamento GAP</span>
          </div>
          <Badge variant="outline" className={cn("text-[11px] font-medium px-2.5 py-0.5", est.pill)}>
            {est.label}
          </Badge>
        </div>

        {/* Title block */}
        <div className="px-6 pt-5 pb-5 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">Sessão</p>
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {atendimento.motivo}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{weekday}, {fullDate}</p>
            </div>

            {atendimento.estado === "agendado" && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 px-3 text-[12px] gap-1.5" onClick={() => handleAction("Sessão remarcada")}>
                  <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[12px] gap-1.5 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleAction("Sessão cancelada")}
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Body — same structure as Solicitações: Estudante left, Sessão right */}
        <div className="grid md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
          {/* LEFT — estudante */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <section>
              <SectionTitle>Estudante</SectionTitle>
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="flex items-start gap-3 w-full text-left hover:bg-muted/40 -mx-2 px-2 py-1.5 rounded-md transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{atendimento.estudante}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{atendimento.matricula}</p>
                </div>
              </Link>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <ContactBtn icon={<MessageSquare className="w-3 h-3" />} label="Chat" onClick={() => handleAction("Chat aberto")} />
                <ContactBtn icon={<Mail className="w-3 h-3" />} label="Email" onClick={() => handleAction("Email enviado")} />
                <ContactBtn icon={<Phone className="w-3 h-3" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <SectionTitle>Dados académicos</SectionTitle>
              <div className="space-y-2.5">
                <SideRow icon={<Hash className="w-3.5 h-3.5" />} label="Ano" value={`${atendimento.ano}º`} />
                <SideRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Curso" value={atendimento.curso} />
                <SideRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Faculdade" value={atendimento.faculdade} />
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <SectionTitle>Resumo</SectionTitle>
              <div className="space-y-2">
                <MiniRow label="Categoria" value={cat.label} />
                <MiniRow label="Estado" value={est.label} />
                <MiniRow label="Responsável" value={atendimento.responsavel} />
              </div>
            </section>
          </aside>

          {/* RIGHT — sessão */}
          <main className="p-6 space-y-6 min-w-0">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Detalhes da sessão</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-border rounded-lg overflow-hidden bg-background">
                <DetailCell icon={<Clock className="w-3.5 h-3.5" />} label="Horário" value={`${startTime} – ${endTime}`} sub={atendimento.duracao} />
                <DetailCell icon={<CalendarIcon className="w-3.5 h-3.5" />} label="Data" value={`${dayNum} ${monthShort}`} sub={fullDate} />
                <DetailCell icon={<ModalityIcon className="w-3.5 h-3.5" />} label="Modalidade" value={atendimento.tipo === "online" ? "Online" : "Presencial"} />
                <DetailCell icon={<DoorOpen className="w-3.5 h-3.5" />} label="Local" value={atendimento.tipo === "presencial" && atendimento.sala ? atendimento.sala : "—"} />
              </div>
            </section>

            <section className="space-y-4">
              <LabeledBlock icon={<FileText className="w-3.5 h-3.5" />} title="Motivo">
                <p className="text-sm font-medium text-foreground leading-relaxed">{atendimento.motivo}</p>
              </LabeledBlock>

              <LabeledBlock icon={<MessageSquare className="w-3.5 h-3.5" />} title="Descrição">
                {atendimento.descricao ? (
                  <p className="text-sm text-foreground/85 leading-relaxed">{atendimento.descricao}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sem descrição adicional.</p>
                )}
              </LabeledBlock>

              {atendimento.notas && (
                <LabeledBlock icon={<StickyNote className="w-3.5 h-3.5" />} title="Notas do profissional">
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="text-sm text-foreground/85 leading-relaxed italic">“{atendimento.notas}”</p>
                    <p className="text-[11px] text-muted-foreground mt-2">— {atendimento.responsavel}</p>
                  </div>
                </LabeledBlock>
              )}
            </section>

            <section className="border-t border-border pt-4">
              <SectionTitle>Estado da sessão</SectionTitle>
              {atendimento.estado === "agendado" && (
                <div className="flex items-start gap-2.5 text-[12.5px] text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border">
                  <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>A sessão será marcada como concluída automaticamente após {endTime}.</span>
                </div>
              )}
              {atendimento.estado === "concluido" && (
                <div className="flex items-center gap-2.5 text-[13px] text-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Sessão concluída em <span className="font-semibold">{fullDate}</span>.</span>
                </div>
              )}
              {atendimento.estado === "cancelado" && (
                <div className="flex items-center gap-2.5 text-[13px] text-destructive bg-destructive/10 rounded-lg px-4 py-3 border border-destructive/20">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Este agendamento foi cancelado e não será realizado.</span>
                </div>
              )}
            </section>
          </main>
        </div>
      </article>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">
      {children}
    </p>
  );
}

function DetailCell({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 border-b sm:border-r border-border last:border-b-0 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:last:border-r-0 lg:border-b-0">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight truncate">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function LabeledBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5 text-muted-foreground">
        {icon}
        <h3 className="text-[11px] uppercase tracking-[0.1em] font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SideRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <MiniRow label={label} value={value} />
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-[11px] font-medium text-foreground text-right truncate">{value}</span>
    </div>
  );
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-foreground hover:text-primary hover:border-primary/25 hover:bg-primary/5 transition-colors"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      {label}
    </button>
  );
}
