import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video,
  CheckCircle2, X, MessageSquare, Mail, Phone,
  DoorOpen, GraduationCap, BookOpen, Hash, FileText, StickyNote,
  UserCircle2, Timer, ChevronRight, Download, Eye, Share2, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig } from "@/data/gapData";

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
  const initials = atendimento.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");
  const ModalityIcon = atendimento.tipo === "online" ? Video : MapPin;

  const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
  const fullDate = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });
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
        {/* Top bar — sessão id + categoria */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">Sessão</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] font-mono font-semibold text-foreground shrink-0">{atendimento.id}</span>
          </div>
        </div>

        {/* Title block with moderate date tile */}
        <div className="px-6 pt-5 pb-5 flex items-start gap-5">
          {/* Date tile — moderate size */}
          <div className="shrink-0 w-[68px] rounded-lg border border-border overflow-hidden bg-background text-center">
            <div className="bg-primary/90 py-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground font-bold">{monthShort}</p>
            </div>
            <div className="py-1.5">
              <p className="text-[28px] leading-none font-bold text-foreground tabular-nums tracking-tight">{dayNum}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-1 capitalize">{weekday.slice(0, 3)}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-1.5">Sessão</p>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
              {atendimento.motivo}
            </h1>
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider", est.pill)}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", est.dot)} />
                {est.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider bg-muted/40">
                {cat.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action bar — below title */}
        {atendimento.estado === "agendado" && (
          <div className="flex items-center justify-end gap-2 px-6 pb-5">
            <Button variant="outline" size="sm" className="h-8 px-3 text-[12px] gap-1.5" onClick={() => handleAction("Sessão remarcada")}>
              <CalendarIcon className="w-3.5 h-3.5" /> Remarcar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[12px] gap-1.5 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleAction("Sessão cancelada")}
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </Button>
          </div>
        )}


        {/* Body — Estudante left | Sessão right (one continuous card, just a divider) */}
        <div className="grid md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
          {/* LEFT — estudante */}
          <aside className="p-5 space-y-5 bg-muted/15">
            <section>
              <SectionTitle>Estudante</SectionTitle>
              <Link
                to={`/gap/estudantes/${atendimento.matricula}`}
                className="flex items-start gap-3 w-full text-left hover:bg-muted/40 -mx-2 px-2 py-1.5 rounded-md transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{atendimento.estudante}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{atendimento.matricula}</p>
                </div>
              </Link>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <ContactBtn icon={<MessageSquare className="w-3 h-3" />} label="Chat" onClick={() => handleAction("Chat aberto")} />
                <ContactBtn icon={<Mail className="w-3 h-3" />} label="Email" onClick={() => handleAction("Email enviado")} />
                <ContactBtn icon={<Phone className="w-3 h-3" />} label="Ligar" onClick={() => handleAction("Chamada iniciada")} />
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <SectionTitle>Dados académicos</SectionTitle>
              <div className="space-y-2.5">
                <SideRow icon={<Hash className="w-3.5 h-3.5" />} label="Ano" value={`${atendimento.ano}º`} />
                <SideRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Curso" value={atendimento.curso} />
                <SideRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Faculdade" value={atendimento.faculdade} />
              </div>
            </section>
          </aside>

          {/* RIGHT — sessão */}
          <main className="p-6 space-y-6 min-w-0">
            {/* Quick facts grid */}
            <section>
              <SectionTitle>Detalhes da sessão</SectionTitle>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">
                <FactItem icon={<Clock className="w-3.5 h-3.5" />} label="Horário" value={`${startTime} – ${endTime}`} sub={atendimento.duracao} />
                <FactItem icon={<CalendarIcon className="w-3.5 h-3.5" />} label="Data" value={fullDate} />
                <FactItem icon={<ModalityIcon className="w-3.5 h-3.5" />} label="Modalidade" value={atendimento.tipo === "online" ? "Online" : "Presencial"} />
                <FactItem icon={<DoorOpen className="w-3.5 h-3.5" />} label="Local" value={atendimento.tipo === "presencial" && atendimento.sala ? atendimento.sala : "—"} />
              </div>
            </section>

            <section className="pt-5 border-t border-border">
              <SectionTitle>Responsável</SectionTitle>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAction(`Perfil de ${atendimento.responsavel}`)}
                  className="flex items-center gap-2.5 text-left hover:bg-muted/40 -mx-2 px-2 py-1 rounded-md transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                    {atendimento.responsavel.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{atendimento.responsavel}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Profissional GAP</p>
                  </div>
                </button>
                <div className="flex items-center gap-1.5">
                  <ContactBtn icon={<MessageSquare className="w-3 h-3" />} label="Chat" onClick={() => handleAction(`Chat com ${atendimento.responsavel}`)} />
                  <ContactBtn icon={<Mail className="w-3 h-3" />} label="Email" onClick={() => handleAction(`Email para ${atendimento.responsavel}`)} />
                  <ContactBtn icon={<Phone className="w-3 h-3" />} label="Ligar" onClick={() => handleAction(`Chamada para ${atendimento.responsavel}`)} />
                </div>
              </div>
            </section>

            <section className="pt-5 border-t border-border space-y-2">
              <SectionTitle>
                <span className="inline-flex items-center gap-1.5"><FileText className="w-3 h-3" /> Descrição</span>
              </SectionTitle>
              {atendimento.descricao ? (
                <p className="text-sm text-foreground/90 leading-relaxed">{atendimento.descricao}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sem descrição adicional.</p>
              )}

              {/* Document attachment */}
              <Dialog>
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-3">
                  <div className="w-9 h-9 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                      Resumo Da Sessão.pdf
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                      <span>Relatório · PDF</span>
                      <span className="text-muted-foreground/40">·</span>
                      <DialogTrigger asChild>
                        <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
                          <Users className="w-3 h-3" /> 4 partilhas
                        </button>
                      </DialogTrigger>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
                        <Eye className="w-3 h-3" /> Ver
                      </Button>
                    </DialogTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] gap-1"
                      onClick={() => handleAction("Relatório exportado")}
                    >
                      <Download className="w-3 h-3" /> Exportar
                    </Button>
                  </div>
                </div>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" /> Partilhado com 4 pessoas
                    </DialogTitle>
                    <DialogDescription className="text-[12px]">
                      Pessoas com acesso ao documento <span className="font-medium text-foreground">Resumo Da Sessão.pdf</span>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 mt-2">
                    {[
                      { name: "Prof. Dr. António Mendes", role: "Reitor", access: "Visualizar" },
                      { name: atendimento.responsavel, role: "Responsável GAP", access: "Editar" },
                      { name: atendimento.estudante, role: "Estudante", access: "Visualizar" },
                      { name: "Coordenação Académica", role: "Equipa", access: "Visualizar" },
                    ].map((p, i) => {
                      const ini = p.name.split(" ").slice(0, 2).map(n => n[0]).join("");
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-muted/20">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold ring-1 ring-primary/15 shrink-0">
                            {ini}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{p.role}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 shrink-0">{p.access}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </section>

            {atendimento.notas && (
              <section className="pt-5 border-t border-border space-y-2">
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5"><StickyNote className="w-3 h-3" /> Notas do profissional</span>
                </SectionTitle>
                <div className="border-l-2 border-primary/40 pl-4 py-1">
                  <p className="text-sm text-foreground/90 leading-relaxed italic">"{atendimento.notas}"</p>
                  <p className="text-[11px] text-muted-foreground mt-2 not-italic">— {atendimento.responsavel}</p>
                </div>
              </section>
            )}

            {/* Status banner */}
            <section className="pt-5 border-t border-border">
              {atendimento.estado === "agendado" && (
                <div className="flex items-start gap-2.5 text-[12.5px] text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border">
                  <Timer className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>A sessão será marcada como concluída automaticamente após <span className="font-semibold text-foreground tabular-nums">{endTime}</span>.</span>
                </div>
              )}
              {atendimento.estado === "concluido" && (
                <div className="flex items-center gap-2.5 text-[13px] text-foreground bg-emerald-50 rounded-lg px-4 py-3 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sessão concluída em <span className="font-semibold">{fullDate}</span>.</span>
                </div>
              )}
              {atendimento.estado === "cancelado" && (
                <div className="flex items-center gap-2.5 text-[13px] text-destructive bg-destructive/10 rounded-lg px-4 py-3 border border-destructive/20">
                  <X className="w-4 h-4 shrink-0" />
                  <span>Este agendamento foi cancelado e não será realizado.</span>
                </div>
              )}
            </section>
          </main>
        </div>

      </article>
    </div>
  );
}

/* ────────────── Helpers ────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2.5">
      {children}
    </p>
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

function SideRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium shrink-0 w-16">{label}</span>
      <span className="text-[12px] font-medium text-foreground text-right truncate flex-1">{value}</span>
    </div>
  );
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-foreground hover:text-primary hover:border-primary/25 hover:bg-primary/5 transition-colors"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      {label}
    </button>
  );
}
