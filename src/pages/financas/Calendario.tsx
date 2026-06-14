import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, MapPin,
  GraduationCap, Palmtree, Users, FileText, Trash2, Check, X, Bell, UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── constants ─────────────────────────────────────── */
const TODAY = "2024-02-14";
const ANO_LETIVO = "2024 / 2025";

const DAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 08..20
const HOUR_HEIGHT = 56;

type EventType = "ferias" | "reuniao" | "feriado" | "pessoal" | "prazo";
type ItemKind = "evento" | "reuniao";

interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  obligatory?: boolean;
  participants?: string[];
  organizer?: string;
}

interface MeetingRequest {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  description?: string;
  status: "pending" | "accepted" | "declined";
}

const TYPE_META: Record<EventType, { label: string; text: string; soft: string; bar: string; icon: typeof Palmtree }> = {
  ferias:  { label: "Férias",   text: "text-emerald-700", soft: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", icon: Palmtree },
  reuniao: { label: "Reunião",  text: "text-blue-700",    soft: "bg-blue-50 border-blue-200",       bar: "bg-blue-500",    icon: Users },
  feriado: { label: "Feriado",  text: "text-rose-700",    soft: "bg-rose-50 border-rose-200",       bar: "bg-rose-500",    icon: CalendarDays },
  pessoal: { label: "Pessoal",  text: "text-violet-700",  soft: "bg-violet-50 border-violet-200",   bar: "bg-violet-500",  icon: CalendarDays },
  prazo:   { label: "Prazo",    text: "text-amber-700",   soft: "bg-amber-50 border-amber-200",     bar: "bg-amber-500",   icon: FileText },
};

/* ── people in the department ───────────────────────── */
const DEPT_PEOPLE = [
  "Maria Tavares — Contabilidade",
  "João Mendes — Tesouraria",
  "Ana Lopes — Orçamento",
  "Pedro Silva — Auditoria Interna",
  "Carla Neto — Folha Salarial",
  "Reitor — Prof. Manuel Costa",
  "Decano FCE",
];

/* ── pre-set institutional events ──────────────────── */
const PRESET_EVENTS: AgendaEvent[] = [
  { id: "p1", title: "Reunião do Departamento Financeiro", type: "reuniao", date: "2024-02-14", startTime: "15:00", endTime: "16:30", location: "Sala de Reuniões — Reitoria", obligatory: true, description: "Revisão do fecho mensal e ponto de situação dos orçamentos." },
  { id: "p2", title: "Reunião com Reitoria — Orçamento", type: "reuniao", date: "2024-02-15", startTime: "10:00", endTime: "11:30", location: "Gabinete do Reitor", obligatory: true },
  { id: "p3", title: "Encerramento Mensal — Janeiro", type: "prazo", date: "2024-02-13", startTime: "17:00", endTime: "18:00", description: "Prazo para encerramento contabilístico." },
  { id: "p4", title: "Pagamento de Salários", type: "prazo", date: "2024-02-28", startTime: "23:59", endTime: "23:59", obligatory: true },
  { id: "p5", title: "Feriado Nacional", type: "feriado", date: "2024-02-04" },
  { id: "p6", title: "Férias Académicas de Inverno", type: "ferias", date: "2024-02-26", endDate: "2024-03-01" },
  { id: "p7", title: "Conselho Administrativo", type: "reuniao", date: "2024-02-16", startTime: "09:00", endTime: "12:00", location: "Auditório Principal", obligatory: true },
  { id: "p8", title: "Almoço com equipa", type: "pessoal", date: "2024-02-14", startTime: "12:30", endTime: "13:30", location: "Cantina" },
];

/* ── meeting requests received ─────────────────────── */
const INITIAL_REQUESTS: MeetingRequest[] = [
  { id: "r1", title: "Revisão de Orçamento — Curso de Arquitectura", date: "2024-02-15", startTime: "14:00", endTime: "15:00", location: "Sala 204", organizer: "Coordenação ARQ", description: "Análise de despesas extra-orçamentais do semestre.", status: "pending" },
  { id: "r2", title: "Reunião de planeamento — GAP", date: "2024-02-19", startTime: "11:00", endTime: "12:00", location: "Sala GAP", organizer: "Gestão Académica de Pessoal", status: "pending" },
  { id: "r3", title: "Auditoria de processos", date: "2024-02-21", startTime: "09:30", endTime: "11:00", location: "Reitoria", organizer: "Pedro Silva", status: "pending" },
];

/* ── helpers ───────────────────────────────────────── */
function toISO(d: Date) { return d.toISOString().split("T")[0]; }
function parseISO(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(s: string, n: number) { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); }
function startOfWeek(s: string) {
  const d = parseISO(s);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}
function isInRange(date: string, start: string, end?: string) {
  if (!end) return date === start;
  return date >= start && date <= end;
}
function fmtLong(s: string) {
  const d = parseISO(s);
  return d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function timeToMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

/* ─────────────────────────────────────────────────── */
export default function FinancasCalendario() {
  const [view, setView] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState<string>(TODAY);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [openCreate, setOpenCreate] = useState(false);
  const [userEvents, setUserEvents] = useState<AgendaEvent[]>([]);
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);

  const allEvents = useMemo(() => {
    const accepted: AgendaEvent[] = requests
      .filter(r => r.status === "accepted")
      .map(r => ({
        id: r.id, title: r.title, type: "reuniao" as EventType, date: r.date,
        startTime: r.startTime, endTime: r.endTime, location: r.location,
        description: r.description, organizer: r.organizer,
      }));
    return [...PRESET_EVENTS, ...userEvents, ...accepted];
  }, [userEvents, requests]);

  /* form */
  const [kind, setKind] = useState<ItemKind>("evento");
  const [form, setForm] = useState<Omit<AgendaEvent, "id">>({
    title: "", type: "pessoal", date: TODAY, startTime: "09:00", endTime: "10:00",
    location: "", description: "", participants: [],
  });

  const toggleParticipant = (p: string) => {
    setForm(f => {
      const cur = f.participants ?? [];
      return { ...f, participants: cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p] };
    });
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    const finalType: EventType = kind === "reuniao" ? "reuniao" : form.type;
    setUserEvents(prev => [...prev, { ...form, type: finalType, id: `u-${Date.now()}` }]);
    setOpenCreate(false);
    setForm({ title: "", type: "pessoal", date: selectedDate, startTime: "09:00", endTime: "10:00", location: "", description: "", participants: [] });
    setKind("evento");
  };

  const handleDelete = (id: string) => setUserEvents(prev => prev.filter(e => e.id !== id));
  const respondRequest = (id: string, status: "accepted" | "declined") =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  /* week navigation */
  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = (() => {
    const a = parseISO(weekStart), b = parseISO(weekDays[6]);
    return `${a.getDate()} ${MONTH_NAMES[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTH_NAMES[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
  })();

  /* month navigation */
  const cursorD = parseISO(cursor);
  const monthLabel = `${MONTH_NAMES[cursorD.getMonth()]} ${cursorD.getFullYear()}`;
  const firstOfMonth = new Date(cursorD.getFullYear(), cursorD.getMonth(), 1);
  const monthStartOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(cursorD.getFullYear(), cursorD.getMonth() + 1, 0).getDate();

  const eventsOnDate = (d: string) => allEvents.filter(e => isInRange(d, e.date, e.endDate));
  const selectedEvents = eventsOnDate(selectedDate).sort((a, b) =>
    (a.startTime ?? "00:00").localeCompare(b.startTime ?? "00:00")
  );

  const pendingRequests = requests.filter(r => r.status === "pending");

  const navigateBy = (delta: number) => {
    const next = view === "week" ? addDays(cursor, delta * 7) : (() => {
      const d = parseISO(cursor); d.setMonth(d.getMonth() + delta); return toISO(d);
    })();
    setCursor(next);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      {/* ── Header card ───────────────────────────── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              <span className="capitalize flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />{fmtLong(TODAY)}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />Ano Letivo {ANO_LETIVO}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
            <p className="text-sm text-muted-foreground mt-1">Agenda institucional do Departamento Financeiro</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => { setCursor(TODAY); setSelectedDate(TODAY); }}>
              Hoje
            </Button>
            <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
              <button onClick={() => navigateBy(-1)} className="p-1.5 rounded-md hover:bg-card transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-medium text-foreground min-w-[150px] text-center">
                {view === "week" ? weekLabel : monthLabel}
              </span>
              <button onClick={() => navigateBy(1)} className="p-1.5 rounded-md hover:bg-card transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex bg-muted/60 rounded-lg p-0.5">
              {(["week", "month"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {v === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setForm(f => ({ ...f, date: selectedDate }))}>
                  <Plus className="w-4 h-4" /> Adicionar à Agenda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Adicionar à agenda</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  {/* kind selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { v: "evento" as const, label: "Evento / Prazo", desc: "Apenas para si" },
                      { v: "reuniao" as const, label: "Reunião", desc: "Convidar participantes" },
                    ]).map(opt => (
                      <button key={opt.v} type="button" onClick={() => setKind(opt.v)}
                        className={cn("text-left p-3 rounded-lg border transition-colors",
                          kind === opt.v ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                        )}>
                        <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label className="text-xs">Título</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={kind === "reuniao" ? "Ex: Reunião sobre orçamento Q1" : "Ex: Encontro com auditor"} />
                  </div>

                  {kind === "evento" && (
                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <Select value={form.type} onValueChange={(v: EventType) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pessoal">Pessoal</SelectItem>
                          <SelectItem value="prazo">Prazo</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                          <SelectItem value="ferias">Férias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3 sm:col-span-1"><Label className="text-xs">Data</Label>
                      <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div><Label className="text-xs">Início</Label>
                      <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                    </div>
                    <div><Label className="text-xs">Fim</Label>
                      <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                    </div>
                  </div>

                  <div><Label className="text-xs">Local (opcional)</Label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Sala / Gabinete" />
                  </div>

                  {kind === "reuniao" && (
                    <div>
                      <Label className="text-xs flex items-center gap-1.5"><Users className="w-3 h-3" /> Participantes</Label>
                      <p className="text-[10px] text-muted-foreground mb-1.5">Todos receberão um pedido de reunião no calendário.</p>
                      <ScrollArea className="h-32 rounded-md border p-2">
                        <div className="space-y-1.5">
                          {DEPT_PEOPLE.map(p => {
                            const checked = (form.participants ?? []).includes(p);
                            return (
                              <label key={p} className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-muted/50">
                                <Checkbox checked={checked} onCheckedChange={() => toggleParticipant(p)} />
                                <span className="text-foreground">{p}</span>
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      {(form.participants?.length ?? 0) > 0 && (
                        <p className="text-[10px] text-primary mt-1.5 font-medium">{form.participants?.length} convidado(s) selecionado(s)</p>
                      )}
                    </div>
                  )}

                  <div><Label className="text-xs">Descrição (opcional)</Label>
                    <Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>{kind === "reuniao" ? "Enviar pedido" : "Adicionar"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────── */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {view === "week" ? (
            <Card className="overflow-hidden">
              {/* Week day pills */}
              <div className="grid grid-cols-7 border-b bg-muted/10">
                {weekDays.map(d => {
                  const dD = parseISO(d);
                  const isToday = d === TODAY;
                  const isSel = d === selectedDate;
                  const count = eventsOnDate(d).length;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        "relative py-2.5 text-center border-l first:border-l-0 transition-colors group",
                        isSel ? "bg-primary/10" : "hover:bg-primary/5"
                      )}
                    >
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                        {DAYS_SHORT[(dD.getDay() + 6) % 7]}
                      </p>
                      <p className={cn(
                        "text-sm font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-colors",
                        isToday ? "bg-primary text-primary-foreground" :
                        isSel ? "ring-2 ring-primary text-foreground" : "text-foreground"
                      )}>{dD.getDate()}</p>
                      {count > 0 && (
                        <div className="flex items-center justify-center gap-0.5 mt-1 h-1">
                          {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                            <span key={i} className="w-1 h-1 rounded-full bg-primary/60" />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected day agenda */}
              <div className="px-4 py-2.5 border-b bg-muted/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Agenda do dia</p>
                  <h3 className="text-sm font-bold text-foreground capitalize">{fmtLong(selectedDate)}</h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {selectedEvents.length} evento{selectedEvents.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarDays className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sem eventos neste dia</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs"
                    onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setOpenCreate(true); }}>
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
                  {selectedEvents.map(ev => {
                    const m = TYPE_META[ev.type];
                    const Icon = m.icon;
                    const hasTime = ev.startTime && ev.startTime !== "23:59";
                    const isUser = ev.id.startsWith("u-");
                    return (
                      <div key={ev.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group">
                        <div className="text-center shrink-0 w-14">
                          {hasTime ? (
                            <>
                              <p className="text-sm font-bold text-foreground">{ev.startTime}</p>
                              <p className="text-[10px] text-muted-foreground">{ev.endTime}</p>
                            </>
                          ) : (
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Dia<br/>todo</p>
                          )}
                        </div>
                        <div className={cn("w-0.5 h-10 rounded-full shrink-0", m.bar)} />
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", m.soft)}>
                          <Icon className={cn("w-3.5 h-3.5", m.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight text-foreground line-clamp-1">{ev.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            {ev.location && (
                              <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{ev.location}</span>
                            )}
                            {ev.organizer && (
                              <span className="flex items-center gap-1 truncate"><UserCircle2 className="w-3 h-3" />{ev.organizer}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", m.soft, m.text, "border-0")}>
                          {m.label}
                        </Badge>
                        {ev.obligatory && (
                          <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 shrink-0">Obrigatório</Badge>
                        )}
                        {isUser && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleDelete(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="grid grid-cols-7 border-b">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest bg-muted/20 border-l first:border-l-0">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: monthStartOffset }).map((_, i) => (
                  <div key={`e${i}`} className="min-h-[100px] border-t border-l first:border-l-0 bg-muted/5" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = toISO(new Date(cursorD.getFullYear(), cursorD.getMonth(), day));
                  const dayEvents = eventsOnDate(dateStr);
                  const isToday = dateStr === TODAY;
                  const isSel = dateStr === selectedDate;
                  return (
                    <div key={day} onClick={() => setSelectedDate(dateStr)}
                      className={cn("min-h-[100px] border-t border-l p-1.5 cursor-pointer transition-colors",
                        isSel ? "bg-primary/10" : "hover:bg-primary/5"
                      )}>
                      <p className={cn("text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                        isToday ? "bg-primary text-primary-foreground" : "text-foreground")}>{day}</p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => {
                          const m = TYPE_META[ev.type];
                          return (
                            <div key={ev.id} className={cn("text-[9px] px-1.5 py-0.5 rounded truncate border font-medium", m.soft, m.text)}>
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && <p className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── Side panel: Pedidos de Reunião ─────── */}
        <div className="w-[300px] shrink-0 hidden lg:block">
          <Card className="overflow-hidden sticky top-6">
            <div className="px-3.5 py-2.5 border-b bg-blue-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-foreground">Pedidos de Reunião</p>
              </div>
              {pendingRequests.length > 0 && (
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] h-5">{pendingRequests.length}</Badge>
              )}
            </div>
            <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">Sem pedidos pendentes</p>
                </div>
              ) : pendingRequests.map(r => (
                <div key={r.id} className="rounded-md border p-2.5 space-y-2 bg-card hover:border-blue-300 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <UserCircle2 className="w-3 h-3" />{r.organizer}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{r.date} · {r.startTime}–{r.endTime}</div>
                    <div className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{r.location}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" className="h-7 flex-1 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => respondRequest(r.id, "accepted")}>
                      <Check className="w-3 h-3" /> Aceitar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 flex-1 text-[10px] gap-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => respondRequest(r.id, "declined")}>
                      <X className="w-3 h-3" /> Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
