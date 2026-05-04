import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  DoorOpen, GraduationCap, FileText,
  UserCircle2, Timer, ChevronRight, Download, Eye, Share2, Users,
  Home, Briefcase, CheckCircle, CircleDashed,
  Paperclip, FileImage, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig, getComentariosAtendimento } from "@/data/gapData";
import AtendimentoDocPreview from "./AtendimentoDocPreview";

const estadoConfig: Record<string, { label: string; pill: string; dot: string }> = {
  agendado:  { label: "Agendado",  pill: "bg-blue-100 text-blue-800",       dot: "bg-blue-500" },
  concluido: { label: "Concluído", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", pill: "bg-red-100 text-red-800",         dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  pill: "bg-amber-100 text-amber-800",     dot: "bg-amber-500" },
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

function getUserId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return String(100000 + (hash % 900000));
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
  const initials = atendimento.discente.split(" ").slice(0, 2).map(n => n[0]).join("");
  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const dayNum = d.getDate();
  const monthShort = d.toLocaleDateString("pt-AO", { month: "short" }).replace(".", "").toUpperCase();

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

      {/* ONE UNIFIED CARD */}
      <article className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Top bar — breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/20 text-[10px] uppercase tracking-[0.12em] font-semibold">
          <span className="text-primary">Ano Lectivo 2024/2025</span>
          <span className="text-muted-foreground/40">·</span>
          <Link to="/gap/agendamentos" className="text-muted-foreground hover:text-foreground transition-colors">Agendamentos</Link>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-foreground normal-case tracking-normal">{atendimento.id}</span>
        </div>

        {/* Title block — compact outlined box (mirrors Solicitação detail) */}
        <div className="px-6 pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
            {/* Date tile */}
            <div className="shrink-0 w-[60px] rounded-md border border-border overflow-hidden bg-background text-center">
              <div className="bg-primary/90 py-0.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-primary-foreground font-bold">{monthShort}</p>
              </div>
              <div className="py-1">
                <p className="text-[24px] leading-none font-bold text-foreground tabular-nums tracking-tight">{dayNum}</p>
                <p className="text-[8.5px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5 capitalize">{weekday.slice(0, 3)}</p>
              </div>
            </div>

            {/* Title + badges */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {atendimento.motivo}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider", est.pill)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", est.dot)} />
                  {est.label}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider gap-1", cat.color)}>
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </Badge>
              </div>
            </div>

            {/* Right — Doc pill */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md border border-border bg-background shadow-sm">
                <div className="w-6 h-6 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">Resumo-{atendimento.id}</span>
                  <span className="text-[9px] tracking-[0.02em] text-muted-foreground font-medium">
                    Gerado automaticamente
                  </span>
                </div>
                <span className="self-stretch w-px bg-border mx-0.5" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 px-1 h-5 rounded text-[10px] text-primary hover:bg-muted font-medium transition-colors" title="Partilhas">
                      <Users className="w-3 h-3" /> 4
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-base flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary" /> Partilhado com 4 pessoas
                      </DialogTitle>
                      <DialogDescription className="text-[12px]">
                        Pessoas com acesso ao documento <span className="font-medium text-foreground">Resumo-{atendimento.id}</span>.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Ver documento">
                      <Eye className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[95vw] h-[92vh] p-0 gap-0 overflow-hidden">
                    <AtendimentoDocPreview atendimento={atendimento} />
                  </DialogContent>
                </Dialog>
                <button
                  type="button"
                  onClick={() => handleAction("Relatório exportado")}
                  className="w-5 h-5 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Exportar"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Action bar — pushed up, right under title block */}
          {atendimento.estado === "agendado" && (
            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
                <Timer className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Conclusão automática após <span className="font-semibold text-foreground tabular-nums">{endTime}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11.5px] gap-1.5 bg-background" onClick={() => handleAction("Sessão remarcada")}>
                  <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[11.5px] gap-1.5 bg-background border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleAction("Sessão cancelada")}
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </div>
            </div>
          )}
          {atendimento.estado === "concluido" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2 text-[12px] text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Sessão concluída em <span className="font-semibold tabular-nums">{fullDate}</span></span>
            </div>
          )}
          {atendimento.estado === "cancelado" && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 flex items-center gap-2 text-[12px] text-destructive">
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>Este agendamento foi cancelado e não será realizado.</span>
            </div>
          )}
        </div>


        {/* Body — single column */}
        <div className="border-t border-border">
          <main className="p-6 min-w-0">
            <div className="rounded-lg border border-border bg-background divide-y divide-border">
              {/* Detalhes da sessão */}
              <section className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Detalhes da sessão</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                  <FactItem icon={<Clock className="w-3.5 h-3.5" />} label="Horário" value={`${startTime} – ${endTime}`} sub={atendimento.duracao} />
                  <FactItem icon={<CalendarIcon className="w-3.5 h-3.5" />} label="Data" value={fullDate} />
                  <FactItem icon={<ModalityIcon className="w-3.5 h-3.5" />} label="Modalidade" value={atendimento.tipo === "online" ? "Online" : "Presencial"} />
                  <FactItem icon={<DoorOpen className="w-3.5 h-3.5" />} label="Local" value={atendimento.tipo === "presencial" && atendimento.sala ? atendimento.sala : "—"} />
                </div>
              </section>

              {/* Descrição */}
              <section className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Descrição</h3>
                </div>
                {atendimento.descricao ? (
                  <p className="text-[13.5px] text-foreground/90 leading-[1.65] whitespace-pre-line">{atendimento.descricao}</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground italic">Sem descrição adicional.</p>
                )}
              </section>

              {/* Participantes — todos */}
              {(() => {
                const extras = atendimento.participantes ?? [];
                const total = 2 + extras.length;
                return (
                  <section className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Participantes</h3>
                      <span className="text-[10px] text-muted-foreground font-medium tabular-nums">· {total}</span>
                    </div>
                    <div className="divide-y divide-border">
                      <ParticipantRow
                        onClick={() => navigate(`/gap/estudantes/${atendimento.matricula}`)}
                        avatarClasses="bg-primary/10 text-primary ring-primary/20"
                        initials={initials}
                        name={atendimento.discente}
                        sub={`${atendimento.matricula} · ${atendimento.curso} · ${atendimento.ano}º ano`}
                        badge={{ icon: GraduationCap, label: "Discente", classes: "bg-primary/10 text-primary border-primary/20" }}
                        contactName={atendimento.discente}
                        onAction={handleAction}
                      />
                      <ParticipantRow
                        onClick={() => handleAction(`Perfil de ${atendimento.responsavel}`)}
                        avatarClasses="bg-primary/10 text-primary ring-primary/20"
                        initials={atendimento.responsavel.split(" ").slice(0, 2).map(n => n[0]).join("")}
                        name={atendimento.responsavel}
                        sub={`GAP · ID ${getUserId(atendimento.responsavel)}`}
                        badge={{ icon: UserCircle2, label: "Responsável", classes: "bg-violet-50 text-violet-700 border-violet-200" }}
                        contactName={atendimento.responsavel}
                        onAction={handleAction}
                      />
                      {extras.map((p, idx) => {
                        const isFamily = p.tipo === "encarregado";
                        const TypeIcon = isFamily ? Home : Briefcase;
                        const pInitials = p.nome.split(" ").filter(w => w.length > 2).slice(0, 2).map(n => n[0]).join("");
                        const sub = p.contacto && isFamily ? `${p.relacao} · ${p.contacto}` : p.relacao;
                        return (
                          <ParticipantRow
                            key={idx}
                            onClick={isFamily ? undefined : () => handleAction(`Perfil de ${p.nome}`)}
                            avatarClasses={isFamily ? "bg-pink-50 text-pink-700 ring-pink-200" : "bg-blue-50 text-blue-700 ring-blue-200"}
                            initials={pInitials}
                            name={p.nome}
                            sub={sub}
                            badge={{
                              icon: TypeIcon,
                              label: isFamily ? "Família" : "Escola",
                              classes: isFamily ? "bg-pink-50 text-pink-700 border-pink-200" : "bg-blue-50 text-blue-700 border-blue-200",
                            }}
                            status={!isFamily ? (p.confirmado ? "confirmado" : "pendente") : undefined}
                            contactName={p.nome}
                            onAction={handleAction}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })()}
            </div>
          </main>
        </div>

      </article>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function ParticipantRow({
  onClick, avatarClasses, initials, name, sub, badge, status, contactName, onAction,
}: {
  onClick?: () => void;
  avatarClasses: string;
  initials: string;
  name: string;
  sub: string;
  badge: { icon: React.ComponentType<{ className?: string }>; label: string; classes: string };
  status?: "confirmado" | "pendente";
  contactName?: string;
  onAction?: (action: string) => void;
}) {
  const BadgeIcon = badge.icon;
  const inner = (
    <>
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-[11px] ring-1", avatarClasses)}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn("text-[13px] font-semibold leading-tight truncate", onClick && "group-hover:text-primary transition-colors")}>{name}</p>
          <Badge variant="outline" className={cn("text-[9.5px] font-semibold px-1.5 py-0 h-[16px] uppercase tracking-wider gap-1", badge.classes)}>
            <BadgeIcon className="w-2.5 h-2.5" />
            {badge.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{sub}</p>
      </div>
      {status && (
        <span className={cn("shrink-0 inline-flex items-center gap-1 text-[10px] font-medium", status === "confirmado" ? "text-emerald-700" : "text-amber-700")}>
          {status === "confirmado" ? (<><CheckCircle className="w-3 h-3" /> Confirmado</>) : (<><CircleDashed className="w-3 h-3" /> Pendente</>)}
        </span>
      )}
      {contactName && onAction && (
        <div className="shrink-0 flex items-center gap-1 ml-2">
          <ContactIconBtn icon={<MessageSquare className="w-3.5 h-3.5" />} title="Chat" onClick={() => onAction(`Chat com ${contactName}`)} />
          <ContactIconBtn icon={<Mail className="w-3.5 h-3.5" />} title="Email" onClick={() => onAction(`Email para ${contactName}`)} />
          <ContactIconBtn icon={<Phone className="w-3.5 h-3.5" />} title="Ligar" onClick={() => onAction(`Chamada para ${contactName}`)} />
        </div>
      )}
    </>
  );
  if (!onClick) {
    return <div className="flex items-center gap-3 px-3.5 py-2.5">{inner}</div>;
  }
  return (
    <button type="button" onClick={onClick} className="group flex items-center gap-3 px-3.5 py-2.5 w-full text-left hover:bg-muted/40 transition-colors">
      {inner}
    </button>
  );
}

function ContactIconBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
    >
      {icon}
    </button>
  );
}

function FactItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight truncate">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
