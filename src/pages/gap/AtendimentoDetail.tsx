import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  FileText, CheckCircle2, X, MessageSquare, Mail, Phone,
  GraduationCap, Building2, Hash, User,
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/gap/agendamentos")} className="gap-1.5 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/gap/agendamentos")}
          className="gap-1.5 h-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8"
          onClick={() => toast({ title: "Relatório do atendimento", description: "Geração do relatório em breve." })}
        >
          <FileText className="w-3.5 h-3.5 text-primary" /> Ver Relatório
        </Button>
      </div>

      {/* SINGLE PAGE — main card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header strip */}
        <div className="px-6 py-5 border-b border-border flex items-start gap-5">
          {/* Date tile */}
          <div className="shrink-0 w-16 rounded-lg overflow-hidden border border-border text-center bg-background">
            <div className={cn("text-[10px] font-bold py-1 text-white", isToday ? "bg-primary" : "bg-muted-foreground/70")}>
              {monthName}
            </div>
            <div className="text-2xl font-bold text-foreground py-2 tabular-nums">{dayNum}</div>
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-muted-foreground">{atendimento.id}</span>
              <span className="text-muted-foreground/40">·</span>
              <Badge variant="outline" className={cn("text-[10px] gap-1.5", est.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
              {isToday && atendimento.estado === "agendado" && (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">Hoje</Badge>
              )}
            </div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">
              {atendimento.motivo}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {weekday}, {fullDate} · {startTime}–{endTime}
            </p>
          </div>
        </div>

        {/* Quick metadata row */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/20">
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
              <Clock className="w-3 h-3" /> Duração
            </div>
            <p className="text-sm font-medium text-foreground tabular-nums">{atendimento.duracao}</p>
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
              <ModalityIcon className="w-3 h-3" /> Local
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "Presencial")}
            </p>
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
              <User className="w-3 h-3" /> Modalidade
            </div>
            <p className="text-sm font-medium text-foreground capitalize">{atendimento.tipo}</p>
          </div>
        </div>

        {/* Estudante row */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-4 flex-wrap">
          <Link
            to={`/gap/estudantes/${atendimento.matricula}`}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold text-sm hover:opacity-90 transition-opacity"
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
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1"><Hash className="w-2.5 h-2.5" />{atendimento.matricula}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1"><GraduationCap className="w-2.5 h-2.5" />{atendimento.curso}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5" />{atendimento.faculdade}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{atendimento.ano}º ano</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAction("Chat aberto")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Chat
            </button>
            <button
              type="button"
              onClick={() => handleAction("Email enviado")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <Mail className="w-3 h-3" /> Email
            </button>
            <button
              type="button"
              onClick={() => handleAction("Chamada iniciada")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <Phone className="w-3 h-3" /> Ligar
            </button>
          </div>
        </div>

        {/* Motivo */}
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Motivo da Sessão
          </h3>
          <p className="text-sm text-foreground/85 leading-relaxed pl-3 border-l-2 border-primary/30">
            {atendimento.motivo}
          </p>
        </div>

        {/* Notas */}
        {atendimento.notas && (
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Notas do Profissional
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              "{atendimento.notas}"
            </p>
          </div>
        )}

        {/* Status footer */}
        {atendimento.estado === "agendado" && (
          <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap bg-muted/20">
            <p className="text-[11px] text-muted-foreground">Gerir o estado deste agendamento</p>
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
        )}

        {atendimento.estado === "concluido" && (
          <div className="px-6 py-4 bg-emerald-50/50 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium text-emerald-900">Sessão concluída · {fullDate} · {startTime}–{endTime}</p>
          </div>
        )}

        {atendimento.estado === "cancelado" && (
          <div className="px-6 py-4 bg-red-50/50 flex items-center gap-3">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-sm font-medium text-red-900">Sessão cancelada</p>
          </div>
        )}
      </div>
    </div>
  );
}
