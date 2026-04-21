import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, User,
  FileText, CheckCircle2, X, MessageSquare, Mail, Check, ArrowRight,
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
  const isPast = atendimento.data < TODAY;
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");

  const fmtFull = (dt: Date) => dt.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const fmtShort = (dt: Date) => dt.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" });

  // Build timeline steps (mirrors Solicitação Histórico style)
  type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "accepted" | "rejected" | "executed" | "pending" };
  const steps: Step[] = [];

  // 1. Marcado
  steps.push({
    label: "Sessão marcada",
    data: `${fmtShort(d)} · ${startTime}`,
    actor: atendimento.responsavel,
    aside: `Modalidade: ${atendimento.tipo === "online" ? "Online" : "Presencial"}${atendimento.sala ? ` · ${atendimento.sala}` : ""}`,
    tone: "submitted",
  });

  // 2. Decorrer / Concluída / Cancelada
  if (atendimento.estado === "concluido") {
    steps.push({
      label: "Sessão concluída",
      data: `${fmtShort(d)} · ${endTime}`,
      actor: atendimento.responsavel,
      nota: atendimento.notas,
      tone: "executed",
    });
  } else if (atendimento.estado === "cancelado") {
    steps.push({
      label: "Sessão cancelada",
      actor: atendimento.responsavel,
      tone: "rejected",
    });
  } else if (atendimento.estado === "remarcar") {
    steps.push({
      label: "Aguarda remarcação",
      actor: atendimento.responsavel,
      tone: "pending",
    });
  } else {
    // agendado
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

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={() => navigate("/gap/agendamentos")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Agendamentos
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-medium font-mono">{atendimento.id}</span>
      </div>

      {/* Editorial card — same structure as Solicitação detail dialog */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Top bar — ID + categoria */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">{atendimento.id}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] font-medium text-muted-foreground">{cat.label}</span>
          </div>
          {isToday && (
            <Badge variant="outline" className="text-[10px] font-bold h-5 bg-primary text-primary-foreground border-primary">
              HOJE
            </Badge>
          )}
        </div>

        {/* Title block */}
        <div className="px-6 pt-5 pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-1">Pedido de Atendimento</p>
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {atendimento.motivo}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Estado</span>
              <Badge variant="outline" className={cn("text-[11px] font-medium px-2.5 py-0.5 gap-1.5", est.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                {est.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* 2-column body */}
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border">
          {/* LEFT — estudante + meta sidebar */}
          <aside className="p-5 space-y-5 bg-muted/15">
            {/* Estudante */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Estudante</p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/gap/estudantes/${atendimento.matricula}`}
                    className="text-sm font-semibold text-foreground hover:text-primary hover:underline leading-tight block truncate"
                  >
                    {atendimento.estudante}
                  </Link>
                  <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{atendimento.matricula}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <MessageSquare className="w-3 h-3" /> Chat
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                  <Mail className="w-3 h-3" /> Email
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                  <span className="text-[11px] font-medium text-foreground">{atendimento.ano}º</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{atendimento.curso}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{atendimento.faculdade}</span>
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
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Detalhes da Sessão</p>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</span>
                  <span className="text-[11px] font-medium text-foreground tabular-nums text-right capitalize">
                    {fmtShort(d)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Horário</span>
                  <span className="text-[11px] font-medium text-foreground tabular-nums">
                    {startTime} – {endTime}
                  </span>
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
                    {atendimento.tipo === "online"
                      ? <Video className="w-3 h-3 text-muted-foreground" />
                      : <MapPin className="w-3 h-3 text-muted-foreground" />}
                    {atendimento.tipo}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Local</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">
                    {atendimento.tipo === "online" ? "Sessão Online" : (atendimento.sala ?? "—")}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</span>
                  <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">
                    {atendimento.responsavel}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT — motivo + histórico */}
          <main className="p-6 space-y-6 min-w-0">
            {/* Motivo */}
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Motivo da Sessão</h3>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{atendimento.motivo}</p>
            </section>

            <div className="border-t border-border" />

            {/* Quando & Onde — bloco visual destacado */}
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Quando & Onde</h3>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <span className="capitalize font-medium">{fmtFull(d)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <span className="tabular-nums font-medium">{startTime} – {endTime}</span>
                    <span className="text-muted-foreground"> · {atendimento.duracao}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  {atendimento.tipo === "online"
                    ? <Video className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    : <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
                  <div className="text-sm">
                    <span className="capitalize">{atendimento.tipo}</span>
                    {atendimento.sala && <span className="text-muted-foreground"> · {atendimento.sala}</span>}
                    {atendimento.tipo === "online" && <span className="text-muted-foreground"> · Sessão Online</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm">{atendimento.responsavel}</div>
                </div>
              </div>
            </section>

            {atendimento.notas && (
              <>
                <div className="border-t border-border" />
                <section>
                  <div className="flex items-center gap-2 mb-2.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Notas da Sessão</h3>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed border-l-2 border-primary/40 pl-3">
                    {atendimento.notas}
                  </p>
                </section>
              </>
            )}

            <div className="border-t border-border" />

            {/* Histórico timeline */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Histórico</h3>
              </div>
              <ol className="space-y-0">
                {steps.map((s, i) => {
                  const isLast = i === steps.length - 1;
                  const Icon = s.tone === "rejected" ? X : s.tone === "pending" ? null : Check;
                  return (
                    <li key={i} className="flex gap-3 relative">
                      <div className="flex flex-col items-center shrink-0 w-5">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10",
                          nodeCls[s.tone]
                        )}>
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
                        {s.aside && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground/90 italic">
                            {s.aside}
                          </p>
                        )}
                        {s.nota && (
                          <p className="mt-2 text-xs text-foreground/75 leading-relaxed pl-3 border-l-2 border-border">
                            {s.nota}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        </div>

        {/* Footer actions */}
        {atendimento.estado === "agendado" && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
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
        )}
      </div>
    </div>
  );
}
