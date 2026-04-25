import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  User, DoorOpen, ChevronRight, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; pill: string; dot: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70",          dot: "bg-blue-500" },
  concluido: { label: "Concluído", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", pill: "bg-red-50 text-red-700 ring-1 ring-red-200/70",             dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",       dot: "bg-amber-500" },
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
  const monthName = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "").toUpperCase();
  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Breadcrumb / top bar */}
        <div className="flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
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
          <button
            onClick={() => handleAction("Menu")}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* UNIFIED CARD */}
        <article className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          {/* Header */}
          <header className="p-6 lg:p-7 border-b border-border">
            <div className="flex items-start gap-5">
              {/* Date tile */}
              <div className={cn(
                "shrink-0 w-[78px] rounded-xl border overflow-hidden text-center bg-background",
                isToday ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
              )}>
                <div className={cn(
                  "text-[10px] font-bold py-1.5 tracking-[0.12em]",
                  isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {monthName}
                </div>
                <div className="text-[34px] font-bold text-foreground py-1.5 tabular-nums leading-none">{dayNum}</div>
                <div className="text-[10px] text-muted-foreground pb-2 capitalize">{weekday.slice(0, 3)}</div>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", est.pill)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                    {est.label}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] font-medium", cat.color)}>{cat.label}</Badge>
                  {isToday && atendimento.estado === "agendado" && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 font-semibold">Hoje</Badge>
                  )}
                </div>
                <h1 className="text-[22px] lg:text-[24px] font-semibold leading-tight tracking-tight text-foreground">
                  {atendimento.motivo}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-2 capitalize">
                  {weekday}, {fullDate}
                </p>
              </div>
            </div>
          </header>

          {/* Facts strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border border-b border-border bg-muted/15">
            <FactCell
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Horário"
              value={`${startTime} – ${endTime}`}
              hint={atendimento.duracao}
            />
            <FactCell
              icon={<ModalityIcon className="w-3.5 h-3.5" />}
              label="Modalidade"
              value={atendimento.tipo === "online" ? "Online" : "Presencial"}
              hint={atendimento.tipo === "online" ? "Videochamada" : "No campus"}
            />
            <FactCell
              icon={<DoorOpen className="w-3.5 h-3.5" />}
              label="Local"
              value={atendimento.tipo === "online" ? "Sessão remota" : (atendimento.sala ?? "—")}
              hint={atendimento.tipo === "online" ? "Link no email" : "Gabinete"}
            />
            <FactCell
              icon={<User className="w-3.5 h-3.5" />}
              label="Responsável"
              value={atendimento.responsavel.replace(/^(Dr\.|Dra\.)\s+/, "")}
              hint={atendimento.responsavel.startsWith("Dra.") ? "Dra." : "Dr."}
            />
          </div>

          {/* Body — split: Estudante | Sessão */}
          <div className="grid lg:grid-cols-[300px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* LEFT — Estudante */}
            <aside className="p-6">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">Estudante</p>

              <div className="flex items-start gap-3 mb-4">
                <Link
                  to={`/gap/estudantes/${atendimento.matricula}`}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-[14px] hover:opacity-90 transition-opacity shadow-sm"
                >
                  {initials}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/gap/estudantes/${atendimento.matricula}`}
                    className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors block leading-tight"
                  >
                    {atendimento.estudante}
                  </Link>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{atendimento.matricula}</p>
                </div>
              </div>

              <dl className="space-y-2 mb-4">
                <Row label="Curso" value={atendimento.curso} />
                <Row label="Faculdade" value={atendimento.faculdade} />
                <Row label="Ano" value={`${atendimento.ano}º ano`} />
              </dl>

              <div className="flex items-center gap-1 -mx-1">
                <ContactBtn icon={<MessageSquare className="w-3.5 h-3.5" />} label="Chat" onClick={() => handleAction("Chat aberto")} />
                <ContactBtn icon={<Mail className="w-3.5 h-3.5" />} label="Email" onClick={() => handleAction("Email enviado")} />
                <ContactBtn icon={<Phone className="w-3.5 h-3.5" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
              </div>
            </aside>

            {/* RIGHT — Sessão */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">Sobre a sessão</p>
                <div className="space-y-4">
                  <div>
                    <Label>Motivo</Label>
                    <p className="text-[14px] font-medium text-foreground leading-snug">{atendimento.motivo}</p>
                  </div>
                  <div className="border-t border-border" />
                  <div>
                    <Label>Descrição</Label>
                    {atendimento.descricao ? (
                      <p className="text-[13.5px] text-foreground/85 leading-relaxed">{atendimento.descricao}</p>
                    ) : (
                      <p className="text-[13.5px] text-muted-foreground/60 italic">Sem descrição adicional.</p>
                    )}
                  </div>
                </div>
              </div>

              {atendimento.notas && (
                <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/40 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold mb-1.5">Notas do profissional</p>
                  <p className="text-[13px] text-emerald-900/85 leading-relaxed italic">"{atendimento.notas}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer — actions / status */}
          {atendimento.estado === "agendado" && (
            <footer className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] text-muted-foreground leading-snug">
                Será concluída automaticamente após o horário previsto.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg h-9" onClick={() => handleAction("Sessão remarcada")}>
                  <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-1.5 rounded-lg h-9"
                  onClick={() => handleAction("Sessão cancelada")}
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </div>
            </footer>
          )}

          {atendimento.estado === "concluido" && (
            <footer className="px-6 py-4 border-t border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Sessão concluída</p>
                <p className="text-[11px] text-emerald-700/80">{fullDate} · {startTime}–{endTime}</p>
              </div>
            </footer>
          )}

          {atendimento.estado === "cancelado" && (
            <footer className="px-6 py-4 border-t border-red-200 bg-red-50/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <X className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900">Sessão cancelada</p>
                <p className="text-[11px] text-red-700/80">Este agendamento não foi realizado.</p>
              </div>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function FactCell({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-[13px] font-semibold text-foreground truncate tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{hint}</p>}
    </div>
  );
}


function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right truncate">{value}</span>
    </div>
  );
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary px-2 py-1.5 rounded-md hover:bg-background transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBlock({ tone, icon, title, subtitle }: { tone: "emerald" | "red"; icon: React.ReactNode; title: string; subtitle: string }) {
  const styles = tone === "emerald"
    ? { box: "border-emerald-200 bg-emerald-50/60", iconBg: "bg-emerald-100 text-emerald-600", title: "text-emerald-900", sub: "text-emerald-700/80" }
    : { box: "border-red-200 bg-red-50/60", iconBg: "bg-red-100 text-red-600", title: "text-red-900", sub: "text-red-700/80" };
  return (
    <div className={cn("rounded-xl border p-4 flex items-center gap-3", styles.box)}>
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", styles.iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={cn("text-sm font-semibold", styles.title)}>{title}</p>
        <p className={cn("text-[11px]", styles.sub)}>{subtitle}</p>
      </div>
    </div>
  );
}
