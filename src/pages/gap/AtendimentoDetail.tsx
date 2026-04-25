import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  User, DoorOpen, ChevronRight, Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; pill: string; dot: string; accent: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70",          dot: "bg-blue-500",    accent: "from-blue-500 to-indigo-500" },
  concluido: { label: "Concluído", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70", dot: "bg-emerald-500", accent: "from-emerald-500 to-teal-500" },
  cancelado: { label: "Cancelado", pill: "bg-red-50 text-red-700 ring-1 ring-red-200/70",             dot: "bg-red-500",     accent: "from-red-500 to-rose-500" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",       dot: "bg-amber-500",   accent: "from-amber-500 to-orange-500" },
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
  const isToday = atendimento.data === TODAY;
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");
  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString("pt-AO", { month: "long" });
  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* TOP BAR */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <button
              onClick={() => navigate("/gap/agendamentos")}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Agendamentos
            </button>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-foreground font-medium font-mono">{atendimento.id}</span>
          </nav>

          {atendimento.estado === "agendado" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 rounded-lg" onClick={() => handleAction("Sessão remarcada")}>
                <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-1.5 h-8 rounded-lg"
                onClick={() => handleAction("Sessão cancelada")}
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT — left rail (estudante) + right (sessão sheet) */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 grid lg:grid-cols-[300px_1fr] gap-8">
        {/* ─── LEFT RAIL: ESTUDANTE ─── */}
        <aside className="space-y-5">
          {/* Profile block */}
          <div className="text-center pb-5 border-b border-border">
            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="inline-block mb-3"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-semibold text-xl shadow-md mx-auto hover:scale-105 transition-transform">
                {initials}
              </div>
            </Link>
            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="text-[15px] font-semibold text-foreground hover:text-primary transition-colors block leading-tight"
            >
              {atendimento.estudante}
            </Link>
            <p className="text-[11px] text-muted-foreground font-mono mt-1">Matrícula {atendimento.matricula}</p>
          </div>

          {/* Academic info */}
          <dl className="space-y-3 pb-5 border-b border-border">
            <RailRow label="Curso" value={atendimento.curso} />
            <RailRow label="Faculdade" value={atendimento.faculdade} />
            <RailRow label="Ano lectivo" value={`${atendimento.ano}º ano`} />
          </dl>

          {/* Quick contacts */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Contactar</p>
            <RailContact icon={<MessageSquare className="w-3.5 h-3.5" />} label="Iniciar chat" onClick={() => handleAction("Chat aberto")} />
            <RailContact icon={<Mail className="w-3.5 h-3.5" />} label="Enviar email" onClick={() => handleAction("Email enviado")} />
            <RailContact icon={<Phone className="w-3.5 h-3.5" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
          </div>
        </aside>

        {/* ─── RIGHT: SESSÃO SHEET ─── */}
        <main className="space-y-7 lg:border-l lg:border-border lg:pl-8 min-w-0">
          {/* TIME BLOCK — bold, agenda-style */}
          <div className="flex items-stretch gap-5">
            {/* Vertical accent bar */}
            <div className={cn("w-1 rounded-full bg-gradient-to-b shrink-0", est.accent)} />

            <div className="flex-1 min-w-0">
              <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground font-semibold capitalize mb-1">
                {weekday} · {monthName} {dayNum}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[40px] lg:text-[44px] font-bold text-foreground tabular-nums leading-none tracking-tight">
                  {startTime}
                </span>
                <span className="text-muted-foreground/50 text-2xl">—</span>
                <span className="text-[28px] lg:text-[32px] font-semibold text-muted-foreground tabular-nums leading-none">
                  {endTime}
                </span>
                <span className="text-[12px] text-muted-foreground ml-1">· {atendimento.duracao}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", est.pill)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                  {est.label}
                </span>
                <Badge variant="outline" className={cn("text-[10px] font-medium", cat.color)}>{cat.label}</Badge>
                {isToday && atendimento.estado === "agendado" && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 font-semibold">Hoje</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Logistics inline pills */}
          <div className="flex flex-wrap gap-2">
            <LogPill icon={<ModalityIcon className="w-3.5 h-3.5" />} label={atendimento.tipo === "online" ? "Sessão Online" : "Presencial"} />
            {atendimento.tipo === "presencial" && atendimento.sala && (
              <LogPill icon={<DoorOpen className="w-3.5 h-3.5" />} label={atendimento.sala} />
            )}
            <LogPill icon={<User className="w-3.5 h-3.5" />} label={atendimento.responsavel} />
          </div>

          <hr className="border-border" />

          {/* MOTIVO — large headline */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Motivo da sessão</p>
            <h1 className="text-[22px] lg:text-[26px] font-semibold leading-snug tracking-tight text-foreground">
              {atendimento.motivo}
            </h1>
          </div>

          {/* DESCRIÇÃO — prose block */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3">Descrição</p>
            {atendimento.descricao ? (
              <p className="text-[15px] text-foreground/85 leading-[1.7] max-w-prose">
                {atendimento.descricao}
              </p>
            ) : (
              <p className="text-[14px] text-muted-foreground/60 italic">Sem descrição adicional.</p>
            )}
          </div>

          {/* NOTAS — pull-quote style */}
          {atendimento.notas && (
            <figure className="relative pl-6 border-l-2 border-emerald-300 max-w-prose">
              <Quote className="absolute -left-3 top-0 w-5 h-5 text-emerald-400 bg-background p-0.5" />
              <blockquote className="text-[15px] text-foreground/85 leading-[1.7] italic">
                {atendimento.notas}
              </blockquote>
              <figcaption className="text-[11px] text-muted-foreground mt-2 not-italic">
                — {atendimento.responsavel}
              </figcaption>
            </figure>
          )}

          {/* STATUS FOOTNOTE */}
          {atendimento.estado === "agendado" && (
            <div className="flex items-start gap-2.5 text-[12px] text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>A sessão será marcada como concluída automaticamente após {endTime}.</span>
            </div>
          )}
          {atendimento.estado === "concluido" && (
            <div className="flex items-center gap-3 text-[13px] text-emerald-900 bg-emerald-50/70 rounded-lg px-4 py-3 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sessão concluída em <span className="font-semibold">{fullDate}</span> · {startTime}–{endTime}.</span>
            </div>
          )}
          {atendimento.estado === "cancelado" && (
            <div className="flex items-center gap-3 text-[13px] text-red-900 bg-red-50/70 rounded-lg px-4 py-3 border border-red-200">
              <X className="w-4 h-4 text-red-600 shrink-0" />
              <span>Este agendamento foi cancelado e não será realizado.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</dt>
      <dd className="text-[13px] text-foreground font-medium mt-0.5">{value}</dd>
    </div>
  );
}

function RailContact({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}

function LogPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted/60 border border-border text-[12px] font-medium text-foreground/80">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </span>
  );
}
