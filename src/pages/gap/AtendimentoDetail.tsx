import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, User,
  FileText, CheckCircle2, X, MessageSquare, Mail, Check, ArrowRight,
  ClipboardList, Sparkles, History, Target,
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
  const isPast = atendimento.data < TODAY;
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  const fmtFull = (dt: Date) => dt.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const fmtShort = (dt: Date) => dt.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" });
  const dayName = d.toLocaleDateString("pt-AO", { weekday: "short" }).replace(".", "").toUpperCase();
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthName = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "").toUpperCase();

  // Build timeline steps
  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "accepted" | "rejected" | "executed" | "pending" };
  const steps: Step[] = [];

  steps.push({
    label: "Sessão marcada",
    data: `${fmtShort(d)} · ${startTime}`,
    actor: atendimento.responsavel,
    aside: `Modalidade: ${atendimento.tipo === "online" ? "Online" : "Presencial"}${atendimento.sala ? ` · ${atendimento.sala}` : ""}`,
    tone: "submitted",
  });

  if (atendimento.estado === "concluido") {
    steps.push({ label: "Sessão concluída", data: `${fmtShort(d)} · ${endTime}`, actor: atendimento.responsavel, nota: atendimento.notas, tone: "executed" });
  } else if (atendimento.estado === "cancelado") {
    steps.push({ label: "Sessão cancelada", actor: atendimento.responsavel, tone: "rejected" });
  } else if (atendimento.estado === "remarcar") {
    steps.push({ label: "Aguarda remarcação", actor: atendimento.responsavel, tone: "pending" });
  } else {
    steps.push({
      label: isPast ? "Sessão por registar" : isToday ? "Decorre hoje" : "Aguarda data agendada",
      actor: atendimento.responsavel,
      aside: `Início previsto: ${fmtShort(d)} · ${startTime}–${endTime}`,
      tone: "pending",
    });
  }

  const nodeCls: Record<Step["tone"], string> = {
    submitted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    accepted: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    rejected: "bg-destructive text-destructive-foreground ring-4 ring-destructive/15",
    executed: "bg-emerald-500 text-white ring-4 ring-emerald-500/15",
    pending: "bg-background border-2 border-dashed border-border text-muted-foreground",
  };

  const handleAction = (action: string) => {
    toast({ title: action, description: `Acção registada para ${atendimento.id}.` });
  };

  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl">
      {/* Top action bar — prominent Voltar + Ver Relatório */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={() => navigate("/gap/agendamentos")}
          className="gap-2 h-9 shadow-sm hover:bg-muted hover:border-foreground/20 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar a Agendamentos
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 h-9 shadow-sm"
            onClick={() => toast({ title: "Relatório do atendimento", description: "Geração do relatório detalhado em breve." })}
          >
            <FileText className="w-4 h-4 text-primary" /> Ver Relatório
          </Button>
        </div>
      </div>

      {/* HERO — Date strip + title + state */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.03] overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 p-6">
          {/* Date tile */}
          <div className="shrink-0 w-full md:w-[110px]">
            <div className="rounded-xl border border-border bg-card overflow-hidden text-center">
              <div className={cn(
                "text-[10px] font-bold tracking-wider py-1.5 text-white",
                isToday ? "bg-primary" : "bg-muted-foreground/80",
              )}>
                {isToday ? "HOJE" : dayName}
              </div>
              <div className="py-3">
                <div className="text-3xl font-bold text-foreground tabular-nums leading-none">{dayNum}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">{monthName}</div>
              </div>
              <div className="border-t border-border bg-muted/30 py-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-foreground tabular-nums">
                <Clock className="w-3 h-3 text-muted-foreground" /> {startTime}
              </div>
            </div>
          </div>

          {/* Title + chips */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{atendimento.id}</span>
                <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
                <Badge variant="outline" className={cn("text-[10px] gap-1.5", est.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
                </Badge>
              </div>
              <h1 className="text-xl font-semibold leading-snug tracking-tight text-foreground">
                {atendimento.motivo}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 capitalize">{fmtFull(d)}</p>
            </div>

            {/* Quick facts row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs pt-3 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-foreground font-medium tabular-nums">{startTime} – {endTime}</span>
                <span className="text-muted-foreground">· {atendimento.duracao}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ModalityIcon className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-foreground font-medium capitalize">{atendimento.tipo}</span>
                {atendimento.sala && <span className="text-muted-foreground">· {atendimento.sala}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-foreground font-medium">{atendimento.responsavel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-column body */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        {/* LEFT — Estudante + meta */}
        <aside className="space-y-5">
          {/* Estudante card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Estudante</h3>
            </div>
            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="flex items-start gap-3 group -mx-2 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center shrink-0 font-semibold text-sm ring-1 ring-primary/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                  {atendimento.estudante}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{atendimento.matricula}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                <MessageSquare className="w-3 h-3" /> Chat
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                <Mail className="w-3 h-3" /> Email
              </Button>
            </div>
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                <span className="text-[11px] font-medium text-foreground">{atendimento.ano}º</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[170px]">{atendimento.curso}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[170px]">{atendimento.faculdade}</span>
              </div>
            </div>
            <Link
              to={`/gap/estudantes/${atendimento.matricula}`}
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              Ver perfil completo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Detalhes da Sessão */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <ClipboardList className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Detalhes da Sessão</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</span>
                <span className="text-[11px] font-medium text-foreground tabular-nums text-right capitalize">{fmtShort(d)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Horário</span>
                <span className="text-[11px] font-medium text-foreground tabular-nums">{startTime} – {endTime}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Duração</span>
                <span className="text-[11px] font-medium text-foreground">{atendimento.duracao}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
                <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Modalidade</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground capitalize">
                  <ModalityIcon className="w-3 h-3 text-muted-foreground" />
                  {atendimento.tipo}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Local</span>
                <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[170px]">
                  {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "—")}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</span>
                <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[170px]">{atendimento.responsavel}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT — Conteúdo principal */}
        <main className="space-y-5 min-w-0">
          {/* Motivo / Descrição */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Descrição do Pedido</h3>
                <p className="text-[11px] text-muted-foreground">Motivo e contexto da sessão</p>
              </div>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed pl-3 border-l-2 border-primary/40">
              {atendimento.motivo}
            </p>
          </section>

          {/* Quando & Onde */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Logística da Sessão</h3>
                <p className="text-[11px] text-muted-foreground">Quando, onde e com quem</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Data</span>
                </div>
                <p className="text-sm font-medium text-foreground capitalize leading-tight">{fmtFull(d)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Horário</span>
                </div>
                <p className="text-sm font-medium text-foreground tabular-nums leading-tight">{startTime} – {endTime}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{atendimento.duracao}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <ModalityIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Modalidade</span>
                </div>
                <p className="text-sm font-medium text-foreground capitalize leading-tight">{atendimento.tipo}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "—")}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Responsável</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-tight">{atendimento.responsavel}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">GAP</p>
              </div>
            </div>
          </section>

          {/* Notas (if exists) */}
          {atendimento.notas && (
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Notas da Sessão</h3>
                  <p className="text-[11px] text-muted-foreground">Observações registadas pelo profissional</p>
                </div>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed pl-3 border-l-2 border-amber-400/60">
                {atendimento.notas}
              </p>
            </section>
          )}

          {/* Histórico timeline */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <History className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
                <p className="text-[11px] text-muted-foreground">Linha do tempo da sessão</p>
              </div>
            </div>
            <ol className="space-y-0">
              {steps.map((s, i) => {
                const isLast = i === steps.length - 1;
                const Icon = s.tone === "rejected" ? X : s.tone === "pending" ? null : Check;
                return (
                  <li key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center shrink-0 w-5">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10", nodeCls[s.tone])}>
                        {Icon && <Icon className="w-3 h-3" strokeWidth={3} />}
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className={cn("flex-1 min-w-0", !isLast && "pb-5")}>
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        {s.data && <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{s.data}</span>}
                      </div>
                      {s.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor}</p>}
                      {s.aside && <p className="mt-1.5 text-[11px] text-muted-foreground/90 italic">{s.aside}</p>}
                      {s.nota && <p className="mt-2 text-xs text-foreground/75 leading-relaxed pl-3 border-l-2 border-border">{s.nota}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Action footer */}
          {atendimento.estado === "agendado" && (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] text-muted-foreground italic">Acções rápidas para esta sessão</p>
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Concluída
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
