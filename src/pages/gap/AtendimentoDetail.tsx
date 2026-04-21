import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, User,
  FileText, CheckCircle2, X, MessageSquare, Mail, ArrowRight,
  Sparkles, Phone, Hash, BriefcaseBusiness,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; color: string; dot: string; banner: string }> = {
  agendado:  { label: "Agendado",  color: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-500",    banner: "from-blue-600 to-blue-500" },
  concluido: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", banner: "from-emerald-600 to-emerald-500" },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500",     banner: "from-red-600 to-red-500" },
  remarcar:  { label: "Remarcar",  color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   banner: "from-amber-600 to-amber-500" },
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
      <div className="p-8">
        <Button variant="outline" size="sm" onClick={() => navigate("/gap/agendamentos")} className="gap-1.5 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar a Agendamentos
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
  const isPast = atendimento.data < TODAY;
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  const fmtLong = (dt: Date) => dt.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const dayName = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthName = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "");
  const yearNum = d.getFullYear();

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  // Countdown
  let countdownLabel = "";
  if (atendimento.estado === "agendado") {
    const now = new Date(TODAY);
    const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
    if (isToday) countdownLabel = "Hoje";
    else if (diff === 1) countdownLabel = "Amanhã";
    else if (diff > 1) countdownLabel = `Em ${diff} dias`;
    else if (diff < 0) countdownLabel = `Há ${Math.abs(diff)} dias`;
  }

  return (
    <div className="animate-fade-in">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-border">
        <div className="px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/gap/agendamentos")}
              className="gap-1.5 h-8 -ml-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Agendamentos
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[11px] font-mono text-muted-foreground">{atendimento.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => handleAction("Chat aberto")}>
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={() => handleAction("Email enviado")}>
              <Mail className="w-3.5 h-3.5" /> Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => toast({ title: "Relatório do atendimento", description: "Geração do relatório detalhado em breve." })}
            >
              <FileText className="w-3.5 h-3.5 text-primary" /> Ver Relatório
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* HERO — Agenda-style event cover */}
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
          {/* Colored banner */}
          <div className={cn("h-24 bg-gradient-to-r", est.banner)}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
          </div>

          {/* Overlay content — avatar + title */}
          <div className="px-6 lg:px-8 pb-6 -mt-12 relative">
            <div className="flex items-end gap-5 flex-wrap">
              {/* Big calendar tile */}
              <div className="shrink-0 w-24 rounded-xl bg-card border border-border shadow-md overflow-hidden ring-4 ring-background">
                <div className="bg-destructive/90 text-white text-center py-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{monthName}</span>
                </div>
                <div className="py-3 text-center bg-card">
                  <div className="text-4xl font-bold text-foreground tabular-nums leading-none">{dayNum}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{yearNum}</div>
                </div>
              </div>

              {/* Title block */}
              <div className="flex-1 min-w-0 pt-12">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] gap-1.5 bg-card", est.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
                  </Badge>
                  <Badge variant="outline" className={cn("text-[10px] bg-card", cat.color)}>{cat.label}</Badge>
                  {countdownLabel && (
                    <Badge variant="outline" className="text-[10px] bg-card border-primary/30 text-primary">
                      <Sparkles className="w-2.5 h-2.5 mr-1" /> {countdownLabel}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                  {atendimento.motivo}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {dayName} · {startTime} – {endTime} · {atendimento.duracao}
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal stat rail */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border divide-x divide-border bg-muted/20">
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                <CalendarIcon className="w-3 h-3" /> Data
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">{fmtLong(d)}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                <Clock className="w-3 h-3" /> Horário
              </div>
              <p className="text-sm font-semibold text-foreground tabular-nums">{startTime} – {endTime}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                <ModalityIcon className="w-3 h-3" /> Local
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "Presencial")}
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                <BriefcaseBusiness className="w-3 h-3" /> Responsável
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{atendimento.responsavel}</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT — 2-column asymmetric, no sidebar */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Motivo — wide left */}
          <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Motivo da Sessão</h3>
                  <p className="text-[11px] text-muted-foreground">Contexto e objectivo</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
            </div>

            <div className="rounded-lg bg-muted/30 p-5 border-l-4 border-primary">
              <p className="text-sm text-foreground leading-relaxed">
                {atendimento.motivo}
              </p>
            </div>

            {atendimento.notas && (
              <div className="mt-5 pt-5 border-t border-dashed border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <h4 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Notas do Profissional</h4>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed italic">"{atendimento.notas}"</p>
              </div>
            )}
          </section>

          {/* Estudante card — right */}
          <aside className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Estudante</h3>
              </div>
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shrink-0 font-bold text-base shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                    {atendimento.estudante}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5" /> {atendimento.matricula}
                  </p>
                </div>
              </Link>
            </div>

            <div className="p-5 space-y-2 flex-1">
              <div className="flex items-baseline justify-between gap-2 py-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                <span className="text-xs font-medium text-foreground">{atendimento.ano}º ano</span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                <span className="text-xs font-medium text-foreground text-right truncate max-w-[180px]">{atendimento.curso}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                <span className="text-xs font-medium text-foreground text-right truncate max-w-[180px]">{atendimento.faculdade}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
              <button
                type="button"
                onClick={() => handleAction("Chat aberto")}
                className="py-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex flex-col items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                type="button"
                onClick={() => handleAction("Email enviado")}
                className="py-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex flex-col items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => handleAction("Chamada iniciada")}
                className="py-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex flex-col items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Chamar
              </button>
            </div>

            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="border-t border-border py-2.5 text-center text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-1"
            >
              Ver perfil completo <ArrowRight className="w-3 h-3" />
            </Link>
          </aside>
        </div>

        {/* Action footer — only when agendado */}
        {atendimento.estado === "agendado" && (
          <div className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-5 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-foreground">Acções disponíveis</p>
              <p className="text-[11px] text-muted-foreground">Gerir o estado desta sessão</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleAction("Sessão remarcada")}>
                <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                onClick={() => handleAction("Sessão cancelada")}
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => handleAction("Sessão concluída")}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Concluir Sessão
              </Button>
            </div>
          </div>
        )}

        {/* Completed state — summary callout */}
        {atendimento.estado === "concluido" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">Sessão concluída com sucesso</p>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">Realizada em {fmtLong(d)} · {startTime}–{endTime}</p>
            </div>
          </div>
        )}

        {/* Cancelled state */}
        {atendimento.estado === "cancelado" && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-900">Sessão cancelada</p>
              <p className="text-[11px] text-red-700/80 mt-0.5">Esta sessão foi cancelada e não será realizada.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
