import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, User,
  FileText, CheckCircle2, X, MessageSquare, Mail, Phone,
  BriefcaseBusiness, GraduationCap, Building2, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

const TODAY = "2025-12-16";

const estadoConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado:  { label: "Agendado",  color: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
  concluido: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
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
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  const fmtLong = (dt: Date) => dt.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/gap/agendamentos")}
          className="gap-1.5 h-8 -ml-2 group text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar a Agendamentos
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

      {/* HEADER CARD — clean, single line of metadata */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono text-muted-foreground">{atendimento.id}</span>
              <span className="text-muted-foreground/40">·</span>
              <Badge variant="outline" className={cn("text-[10px] gap-1.5", est.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
              {countdownLabel && (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                  {countdownLabel}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
              {atendimento.motivo}
            </h1>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              <CalendarIcon className="w-3 h-3" /> Data
            </div>
            <p className="text-sm font-medium text-foreground capitalize">{fmtLong(d)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              <Clock className="w-3 h-3" /> Horário
            </div>
            <p className="text-sm font-medium text-foreground tabular-nums">
              {startTime} – {endTime} <span className="text-muted-foreground font-normal">· {atendimento.duracao}</span>
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              <ModalityIcon className="w-3 h-3" /> Local
            </div>
            <p className="text-sm font-medium text-foreground">
              {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "Presencial")}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              <BriefcaseBusiness className="w-3 h-3" /> Responsável
            </div>
            <p className="text-sm font-medium text-foreground truncate">{atendimento.responsavel}</p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — Motivo & notas */}
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Motivo da Sessão</h3>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed pl-3 border-l-2 border-primary/30">
              {atendimento.motivo}
            </p>

            {atendimento.notas && (
              <div className="mt-5 pt-5 border-t border-border">
                <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Notas do Profissional
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{atendimento.notas}"
                </p>
              </div>
            )}
          </section>

          {/* Action footer */}
          {atendimento.estado === "agendado" && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-foreground">Acções da sessão</p>
                  <p className="text-[11px] text-muted-foreground">Gerir o estado deste agendamento</p>
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
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                  </Button>
                </div>
              </div>
            </div>
          )}

          {atendimento.estado === "concluido" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900">Sessão concluída com sucesso</p>
                <p className="text-[11px] text-emerald-700/80 mt-0.5">Realizada em {fmtLong(d)} · {startTime}–{endTime}</p>
              </div>
            </div>
          )}

          {atendimento.estado === "cancelado" && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-4.5 h-4.5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-900">Sessão cancelada</p>
                <p className="text-[11px] text-red-700/80 mt-0.5">Esta sessão foi cancelada e não será realizada.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Estudante card */}
        <aside className="rounded-xl border border-border bg-card overflow-hidden h-fit">
          <div className="p-5 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">
              Estudante
            </h3>

            {/* Avatar + name + comms inline */}
            <div className="flex items-start gap-3 mb-4">
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                {initials}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/gap/estudantes/${atendimento.matricula}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight block truncate"
                >
                  {atendimento.estudante}
                </Link>
                <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums flex items-center gap-1">
                  <Hash className="w-2.5 h-2.5" /> {atendimento.matricula}
                </p>

                {/* Chat / Email inline next to student */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => handleAction("Chat aberto")}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" /> Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("Email enviado")}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("Chamada iniciada")}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Ligar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Academic info */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</p>
                <p className="text-xs font-medium text-foreground truncate">{atendimento.curso}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</p>
                <p className="text-xs font-medium text-foreground truncate">{atendimento.faculdade}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</p>
                <p className="text-xs font-medium text-foreground">{atendimento.ano}º ano</p>
              </div>
            </div>
          </div>

          <Link
            to={`/gap/estudantes/${atendimento.matricula}`}
            className="border-t border-border py-3 text-center text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors block"
          >
            Ver perfil completo →
          </Link>
        </aside>
      </div>
    </div>
  );
}
