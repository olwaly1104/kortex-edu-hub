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
  const monthShort = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "").toUpperCase();
  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/gap/agendamentos")}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Agendamentos
          <span className="text-muted-foreground/40 mx-1">/</span>
          <span className="font-mono text-foreground">{atendimento.id}</span>
        </button>

        {/* ─── UNIFIED CARD ─── */}
        <article className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* HEADER — date tile + title + status */}
          <header className="relative p-6 lg:p-8 border-b border-border">
            <div className={cn("absolute top-0 left-0 right-0 h-1", est.bar)} />

            <div className="flex items-start gap-5">
              {/* Date tile */}
              <div className={cn("shrink-0 w-20 text-center rounded-xl border-2 overflow-hidden bg-background ring-4", est.ring)}
                style={{ borderColor: "transparent" }}
              >
                <div className={cn("text-[10px] font-bold tracking-widest text-white py-1", est.bar)}>
                  {monthShort}
                </div>
                <div className="py-2">
                  <div className="text-3xl font-bold text-foreground tabular-nums leading-none">{dayNum}</div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-1 px-1 truncate">{weekday}</div>
                </div>
              </div>

              {/* Title block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold", est.pill)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                    {est.label}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] font-medium", cat.color)}>{cat.label}</Badge>
                  {isToday && atendimento.estado === "agendado" && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 font-semibold">Hoje</Badge>
                  )}
                </div>
                <h1 className="text-[20px] lg:text-[24px] font-semibold leading-tight tracking-tight text-foreground">
                  {atendimento.motivo}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-[13px] text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground tabular-nums">{startTime} – {endTime}</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{atendimento.duracao}</span>
                </div>
              </div>

              {/* Quick actions */}
              {atendimento.estado === "agendado" && (
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-lg" onClick={() => handleAction("Sessão remarcada")}>
                    <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-1.5 h-9 rounded-lg"
                    onClick={() => handleAction("Sessão cancelada")}
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* INFO STRIP — 3 cells */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-muted/20">
            <InfoCell icon={<ModalityIcon className="w-4 h-4" />} label="Modalidade" value={atendimento.tipo === "online" ? "Sessão Online" : "Presencial"} />
            <InfoCell icon={<DoorOpen className="w-4 h-4" />} label="Local" value={atendimento.tipo === "presencial" && atendimento.sala ? atendimento.sala : "—"} />
            <InfoCell icon={<User className="w-4 h-4" />} label="Responsável" value={atendimento.responsavel} />
          </div>

          {/* BODY — 2 columns */}
          <div className="grid lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* LEFT — session content */}
            <div className="p-6 lg:p-8 space-y-6 min-w-0">
              <Block icon={<FileText className="w-3.5 h-3.5" />} title="Descrição">
                {atendimento.descricao ? (
                  <p className="text-[14px] text-foreground/85 leading-relaxed">{atendimento.descricao}</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground/60 italic">Sem descrição adicional.</p>
                )}
              </Block>

              {atendimento.notas && (
                <Block icon={<StickyNote className="w-3.5 h-3.5" />} title="Notas do profissional">
                  <div className="rounded-lg bg-amber-50/60 border border-amber-200/70 px-4 py-3">
                    <p className="text-[14px] text-amber-950 leading-relaxed italic">"{atendimento.notas}"</p>
                    <p className="text-[11px] text-amber-700/80 mt-2 not-italic">— {atendimento.responsavel}</p>
                  </div>
                </Block>
              )}

              {/* Status footnote */}
              {atendimento.estado === "agendado" && (
                <div className="flex items-start gap-2.5 text-[12.5px] text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
                  <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>A sessão será marcada como concluída automaticamente após {endTime}.</span>
                </div>
              )}
              {atendimento.estado === "concluido" && (
                <div className="flex items-center gap-2.5 text-[13px] text-emerald-900 bg-emerald-50 rounded-lg px-4 py-3 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sessão concluída em <span className="font-semibold">{fullDate}</span>.</span>
                </div>
              )}
              {atendimento.estado === "cancelado" && (
                <div className="flex items-center gap-2.5 text-[13px] text-red-900 bg-red-50 rounded-lg px-4 py-3 border border-red-200">
                  <X className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Este agendamento foi cancelado e não será realizado.</span>
                </div>
              )}
            </div>

            {/* RIGHT — student panel */}
            <aside className="p-6 bg-muted/10 space-y-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">Estudante</p>

              {/* Profile */}
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-semibold text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                    {atendimento.estudante}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{atendimento.matricula}</p>
                </div>
              </Link>

              {/* Academic mini-list */}
              <div className="space-y-2.5 pt-1 border-t border-border pt-4">
                <MiniRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Curso" value={atendimento.curso} />
                <MiniRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Faculdade" value={atendimento.faculdade} />
                <MiniRow icon={<Hash className="w-3.5 h-3.5" />} label="Ano" value={`${atendimento.ano}º`} />
              </div>

              {/* Quick contact */}
              <div className="pt-4 border-t border-border space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Contactar</p>
                <ContactBtn icon={<MessageSquare className="w-3.5 h-3.5" />} label="Chat" onClick={() => handleAction("Chat aberto")} />
                <ContactBtn icon={<Mail className="w-3.5 h-3.5" />} label="Email" onClick={() => handleAction("Email enviado")} />
                <ContactBtn icon={<Phone className="w-3.5 h-3.5" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
              </div>

              {/* Mobile actions */}
              {atendimento.estado === "agendado" && (
                <div className="flex md:hidden flex-col gap-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-lg w-full" onClick={() => handleAction("Sessão remarcada")}>
                    <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 h-9 rounded-lg w-full"
                    onClick={() => handleAction("Sessão cancelada")}
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-6 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-[13px] font-medium text-foreground truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
        {icon}
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className="text-[12.5px] text-foreground font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
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
