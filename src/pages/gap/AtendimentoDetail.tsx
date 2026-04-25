import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  GraduationCap, Building2, Hash, User, FileText, DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; pill: string; dot: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500" },
  concluido: { label: "Concluído", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", pill: "bg-red-50 text-red-700 ring-1 ring-red-200",             dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-500" },
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

  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/gap/agendamentos")}
          className="gap-2 h-9 -ml-3 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Agendamentos</span>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">{atendimento.id}</span>
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", est.pill)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
            {est.label}
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] font-medium", cat.color)}>{cat.label}</Badge>
          {isToday && atendimento.estado === "agendado" && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 font-medium">Hoje</Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {atendimento.motivo}
        </h1>
        <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5" />
          {weekday}, {fullDate}
          <span className="text-border">·</span>
          <Clock className="w-3.5 h-3.5" />
          <span className="tabular-nums">{startTime} – {endTime}</span>
          <span className="text-border">·</span>
          <span>{atendimento.duracao}</span>
        </p>
      </header>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="space-y-5">
          {/* Detalhes da Sessão */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Detalhes da Sessão</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Motivo</p>
                <p className="text-sm font-medium text-foreground leading-snug">{atendimento.motivo}</p>
              </div>
              <div className="h-px bg-border/70" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Descrição</p>
                {atendimento.descricao ? (
                  <p className="text-sm text-foreground/85 leading-relaxed">{atendimento.descricao}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/70 italic">Sem descrição adicional.</p>
                )}
              </div>
            </div>
          </section>

          {/* Estudante */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Estudante</h2>
            </div>
            <div className="px-5 py-4 flex items-center gap-4">
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-sm hover:scale-105 transition-transform shadow-sm"
              >
                {initials}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/gap/estudantes/${atendimento.matricula}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate"
                >
                  {atendimento.estudante}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Hash className="w-2.5 h-2.5" />{atendimento.matricula}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-2.5 h-2.5" />{atendimento.curso}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5" />{atendimento.faculdade}</span>
                  <span className="text-border">·</span>
                  <span>{atendimento.ano}º ano</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleAction("Chat aberto")}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border bg-background hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <MessageSquare className="w-3 h-3" /> Chat
              </button>
              <button
                type="button"
                onClick={() => handleAction("Email enviado")}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border bg-background hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Mail className="w-3 h-3" /> Email
              </button>
              <button
                type="button"
                onClick={() => handleAction("Chamada iniciada")}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border bg-background hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Phone className="w-3 h-3" /> Ligar
              </button>
            </div>
          </section>

          {/* Notas */}
          {atendimento.notas && (
            <section className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Notas do Profissional</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-foreground/80 leading-relaxed italic">"{atendimento.notas}"</p>
              </div>
            </section>
          )}
        </div>

        {/* Side column */}
        <aside className="space-y-5">
          {/* Quando & Onde */}
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Informação</h2>
            </div>
            <dl className="divide-y divide-border">
              <div className="px-5 py-3 flex items-start gap-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Horário</dt>
                  <dd className="text-sm font-medium text-foreground tabular-nums mt-0.5">{startTime} – {endTime}</dd>
                  <dd className="text-[11px] text-muted-foreground">{atendimento.duracao}</dd>
                </div>
              </div>
              <div className="px-5 py-3 flex items-start gap-3">
                <ModalityIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Modalidade</dt>
                  <dd className="text-sm font-medium text-foreground capitalize mt-0.5">{atendimento.tipo}</dd>
                </div>
              </div>
              {(atendimento.tipo === "presencial" && atendimento.sala) && (
                <div className="px-5 py-3 flex items-start gap-3">
                  <DoorOpen className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sala</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">{atendimento.sala}</dd>
                  </div>
                </div>
              )}
              <div className="px-5 py-3 flex items-start gap-3">
                <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Responsável</dt>
                  <dd className="text-sm font-medium text-foreground mt-0.5">{atendimento.responsavel}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Status / Actions */}
          {atendimento.estado === "agendado" && (
            <section className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Acções</h2>
              </div>
              <div className="px-5 py-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg" onClick={() => handleAction("Sessão remarcada")}>
                  <CalendarIcon className="w-3.5 h-3.5" /> Remarcar sessão
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2 rounded-lg"
                  onClick={() => handleAction("Sessão cancelada")}
                >
                  <X className="w-3.5 h-3.5" /> Cancelar sessão
                </Button>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  A sessão será concluída automaticamente após o horário previsto.
                </p>
              </div>
            </section>
          )}

          {atendimento.estado === "concluido" && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Sessão concluída</p>
                <p className="text-[11px] text-emerald-700/80">{startTime}–{endTime}</p>
              </div>
            </section>
          )}

          {atendimento.estado === "cancelado" && (
            <section className="rounded-xl border border-red-200 bg-red-50/60 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900">Sessão cancelada</p>
                <p className="text-[11px] text-red-700/80">Não realizada.</p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
