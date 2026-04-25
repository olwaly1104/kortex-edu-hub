import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  DoorOpen, GraduationCap, BookOpen, Hash, FileText, StickyNote,
  UserCircle2, Timer, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const estadoConfig: Record<string, { label: string; pill: string; dot: string; bar: string; soft: string; text: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-100 text-blue-800",       dot: "bg-blue-500",    bar: "from-blue-400 to-blue-600",       soft: "bg-blue-50",    text: "text-blue-700" },
  concluido: { label: "Concluído", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", bar: "from-emerald-400 to-emerald-600", soft: "bg-emerald-50", text: "text-emerald-700" },
  cancelado: { label: "Cancelado", pill: "bg-red-100 text-red-800",         dot: "bg-red-500",     bar: "from-red-400 to-red-600",         soft: "bg-red-50",     text: "text-red-700" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-100 text-amber-800",     dot: "bg-amber-500",   bar: "from-amber-400 to-amber-600",     soft: "bg-amber-50",   text: "text-amber-700" },
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
      <div className="p-8 max-w-5xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/gap/agendamentos")} className="gap-1.5 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar aos agendamentos
        </Button>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Agendamento não encontrado.</p>
        </div>
      </div>
    );
  }

  const cat = categoriaConfig[atendimento.categoria];
  const est = estadoConfig[atendimento.estado];
  const d = new Date(atendimento.data);
  const startTime = atendimento.hora;
  const endTime = addMinutesToHHMM(atendimento.hora, parseDuracaoMin(atendimento.duracao));
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");
  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  const dayNum = d.getDate();
  const monthShort = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "").toUpperCase();
  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Link to="/gap/agendamentos" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Agendamentos
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="font-mono text-foreground">{atendimento.id}</span>
      </nav>

      {/* HERO — Calendar-style appointment card */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-[200px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Date tile (left) */}
          <div className={cn("relative flex flex-col items-center justify-center py-7 px-4 bg-gradient-to-br", est.bar)}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/85 font-semibold">{monthShort}</p>
            <p className="text-[64px] leading-none font-bold text-white tabular-nums tracking-tight mt-1">{dayNum}</p>
            <p className="text-[11px] text-white/85 capitalize mt-1.5 font-medium">{weekday}</p>
            <div className="mt-4 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <p className="text-[10px] font-semibold text-white tabular-nums tracking-wide">{startTime} – {endTime}</p>
            </div>
          </div>

          {/* Header content (right) */}
          <div className="p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider", est.pill)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", est.dot)} />
                  {est.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] font-medium text-muted-foreground">{cat.label}</span>
              </div>
              <h1 className="text-[22px] font-semibold leading-snug tracking-tight text-foreground">
                {atendimento.motivo}
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1.5 capitalize">
                {weekday}, {fullDate} · {atendimento.duracao}
              </p>
            </div>

            {atendimento.estado === "agendado" && (
              <div className="flex items-center gap-2">
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

        {/* Quick facts strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border bg-muted/15">
          <FactCell icon={<Clock className="w-3.5 h-3.5" />} label="Horário" value={`${startTime} – ${endTime}`} />
          <FactCell icon={<ModalityIcon className="w-3.5 h-3.5" />} label="Modalidade" value={atendimento.tipo === "online" ? "Online" : "Presencial"} />
          <FactCell icon={<DoorOpen className="w-3.5 h-3.5" />} label="Local" value={atendimento.tipo === "presencial" && atendimento.sala ? atendimento.sala : "—"} />
          <FactCell icon={<UserCircle2 className="w-3.5 h-3.5" />} label="Responsável" value={atendimento.responsavel} />
        </div>
      </section>

      {/* Two-column body — content (wider) + student card (narrower) */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* MAIN — Session content stacked */}
        <main className="space-y-5 min-w-0">
          <Panel icon={<FileText className="w-3.5 h-3.5" />} title="Descrição da sessão">
            {atendimento.descricao ? (
              <p className="text-sm text-foreground/90 leading-relaxed">{atendimento.descricao}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem descrição adicional.</p>
            )}
          </Panel>

          {atendimento.notas && (
            <Panel icon={<StickyNote className="w-3.5 h-3.5" />} title="Notas do profissional">
              <div className="border-l-2 border-primary/40 pl-4 py-1">
                <p className="text-sm text-foreground/90 leading-relaxed italic">"{atendimento.notas}"</p>
                <p className="text-[11px] text-muted-foreground mt-2 not-italic">— {atendimento.responsavel}</p>
              </div>
            </Panel>
          )}

          {/* Status banner */}
          {atendimento.estado === "agendado" && (
            <div className="flex items-start gap-2.5 text-[13px] rounded-lg px-4 py-3 border border-border bg-muted/30">
              <Timer className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">A sessão será marcada como concluída automaticamente após <span className="font-semibold text-foreground tabular-nums">{endTime}</span>.</span>
            </div>
          )}
          {atendimento.estado === "concluido" && (
            <div className={cn("flex items-center gap-2.5 text-[13px] rounded-lg px-4 py-3 border", est.soft, "border-emerald-200")}>
              <CheckCircle2 className={cn("w-4 h-4 shrink-0", est.text)} />
              <span className="text-foreground">Sessão concluída em <span className="font-semibold">{fullDate}</span>.</span>
            </div>
          )}
          {atendimento.estado === "cancelado" && (
            <div className="flex items-center gap-2.5 text-[13px] text-destructive bg-destructive/10 rounded-lg px-4 py-3 border border-destructive/20">
              <X className="w-4 h-4 shrink-0" />
              <span>Este agendamento foi cancelado e não será realizado.</span>
            </div>
          )}
        </main>

        {/* SIDE — Student card (sticky-ready) */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Profile header */}
            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="block p-5 hover:bg-muted/30 transition-colors group border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-sm ring-2 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-0.5">Estudante</p>
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors truncate">{atendimento.estudante}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{atendimento.matricula}</p>
                </div>
              </div>
            </Link>

            {/* Academic data */}
            <div className="p-5 space-y-2.5 border-b border-border">
              <SideRow icon={<Hash className="w-3.5 h-3.5" />} label="Ano" value={`${atendimento.ano}º`} />
              <SideRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Curso" value={atendimento.curso} />
              <SideRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Faculdade" value={atendimento.faculdade} />
            </div>

            {/* Contact actions */}
            <div className="p-3 grid grid-cols-3 gap-1.5 bg-muted/15">
              <ContactBtn icon={<MessageSquare className="w-3.5 h-3.5" />} label="Chat" onClick={() => handleAction("Chat aberto")} />
              <ContactBtn icon={<Mail className="w-3.5 h-3.5" />} label="Email" onClick={() => handleAction("Email enviado")} />
              <ContactBtn icon={<Phone className="w-3.5 h-3.5" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function FactCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-5 py-3.5 border-r last:border-r-0 border-border [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{value}</p>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        {icon}
        <h3 className="text-[11px] uppercase tracking-[0.1em] font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SideRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0 w-16">{label}</span>
      <span className="text-[12px] font-medium text-foreground text-right truncate flex-1">{value}</span>
    </div>
  );
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-col items-center justify-center gap-1 rounded-md border border-border bg-background px-2 py-2 text-[11px] font-medium text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}
