import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, MapPin,
  GraduationCap, Palmtree, Users, FileText, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── constants ─────────────────────────────────────── */
const TODAY = "2024-02-14";
const ANO_LETIVO = "2024 / 2025";

const DAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type EventType = "ferias" | "reuniao" | "feriado" | "pessoal" | "prazo";

interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;          // YYYY-MM-DD (start)
  endDate?: string;      // for multi-day (férias)
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  obligatory?: boolean;
}

const TYPE_META: Record<EventType, { label: string; color: string; bg: string; ring: string; icon: typeof Palmtree }> = {
  ferias:   { label: "Férias",       color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",   ring: "bg-emerald-500", icon: Palmtree },
  reuniao:  { label: "Reunião",      color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",         ring: "bg-blue-500",    icon: Users },
  feriado:  { label: "Feriado",      color: "text-rose-700",    bg: "bg-rose-50 border-rose-200",         ring: "bg-rose-500",    icon: CalendarDays },
  pessoal:  { label: "Pessoal",      color: "text-violet-700",  bg: "bg-violet-50 border-violet-200",     ring: "bg-violet-500",  icon: CalendarDays },
  prazo:    { label: "Prazo",        color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",       ring: "bg-amber-500",   icon: FileText },
};

/* ── pre-set institutional events ──────────────────── */
const PRESET_EVENTS: AgendaEvent[] = [
  { id: "p1", title: "Reunião do Departamento Financeiro", type: "reuniao", date: "2024-02-14", startTime: "15:00", endTime: "16:30", location: "Sala de Reuniões — Reitoria", obligatory: true, description: "Revisão do fecho mensal e ponto de situação dos orçamentos departamentais." },
  { id: "p2", title: "Reunião com Reitoria — Orçamento", type: "reuniao", date: "2024-02-20", startTime: "10:00", endTime: "11:30", location: "Gabinete do Reitor", obligatory: true },
  { id: "p3", title: "Encerramento Mensal — Janeiro", type: "prazo", date: "2024-02-05", startTime: "23:59", endTime: "23:59", description: "Prazo para encerramento contabilístico." },
  { id: "p4", title: "Pagamento de Salários", type: "prazo", date: "2024-02-28", startTime: "23:59", endTime: "23:59", obligatory: true },
  { id: "p5", title: "Feriado Nacional — Dia do Início da Luta Armada", type: "feriado", date: "2024-02-04" },
  { id: "p6", title: "Férias Académicas de Inverno", type: "ferias", date: "2024-02-26", endDate: "2024-03-01" },
  { id: "p7", title: "Reunião Geral — Conselho Administrativo", type: "reuniao", date: "2024-02-22", startTime: "09:00", endTime: "12:00", location: "Auditório Principal", obligatory: true },
];

/* ── helpers ───────────────────────────────────────── */
function toISO(d: Date) { return d.toISOString().split("T")[0]; }
function parseISO(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(s: string, n: number) { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); }
function startOfWeek(s: string) {
  const d = parseISO(s);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // Monday start
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

/* ─────────────────────────────────────────────────── */
export default function FinancasCalendario() {
  const [view, setView] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState<string>(TODAY);    // any date in the visible week/month
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [openCreate, setOpenCreate] = useState(false);
  const [userEvents, setUserEvents] = useState<AgendaEvent[]>([]);

  const allEvents = useMemo(() => [...PRESET_EVENTS, ...userEvents], [userEvents]);

  /* form state */
  const [form, setForm] = useState<Omit<AgendaEvent, "id">>({
    title: "", type: "pessoal", date: TODAY, startTime: "09:00", endTime: "10:00", location: "", description: "",
  });

  const handleCreate = () => {
    if (!form.title.trim()) return;
    setUserEvents(prev => [...prev, { ...form, id: `u-${Date.now()}` }]);
    setOpenCreate(false);
    setForm({ title: "", type: "pessoal", date: selectedDate, startTime: "09:00", endTime: "10:00", location: "", description: "" });
  };

  const handleDelete = (id: string) => setUserEvents(prev => prev.filter(e => e.id !== id));

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
  const monthStartOffset = (firstOfMonth.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(cursorD.getFullYear(), cursorD.getMonth() + 1, 0).getDate();

  const eventsOnDate = (d: string) => allEvents.filter(e => isInRange(d, e.date, e.endDate));

  const selectedEvents = eventsOnDate(selectedDate).sort((a, b) =>
    (a.startTime ?? "00:00").localeCompare(b.startTime ?? "00:00")
  );

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
                  <Plus className="w-4 h-4" /> Criar Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Novo evento na agenda</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label className="text-xs">Título</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Encontro com auditor externo" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Tipo</Label>
                      <Select value={form.type} onValueChange={(v: EventType) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pessoal">Pessoal</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="prazo">Prazo</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                          <SelectItem value="ferias">Férias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Data</Label>
                      <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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
                  <div><Label className="text-xs">Descrição (opcional)</Label>
                    <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                  <Button onClick={handleCreate}>Adicionar à agenda</Button>
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
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(d => {
                const dD = parseISO(d);
                const dayEvents = eventsOnDate(d);
                const isToday = d === TODAY;
                const isSel = d === selectedDate;
                const isWknd = dD.getDay() === 0 || dD.getDay() === 6;
                return (
                  <Card
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      "p-3 cursor-pointer transition-all min-h-[200px] flex flex-col gap-2 border",
                      isSel ? "ring-2 ring-primary border-primary/40 shadow-md" : "hover:border-primary/40 hover:shadow-sm",
                      isWknd && !isSel && "bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                        {DAYS_SHORT[(dD.getDay() + 6) % 7]}
                      </span>
                      <span className={cn(
                        "text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center",
                        isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}>
                        {dD.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1 flex-1">
                      {dayEvents.slice(0, 4).map(ev => {
                        const m = TYPE_META[ev.type];
                        return (
                          <div key={ev.id} className={cn("text-[10px] rounded-md px-1.5 py-1 border leading-tight", m.bg, m.color)}>
                            <div className="flex items-center gap-1">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.ring)} />
                              <span className="font-semibold truncate">{ev.startTime && ev.startTime !== "23:59" ? `${ev.startTime} · ` : ""}{ev.title}</span>
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length > 4 && (
                        <p className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 4} mais</p>
                      )}
                      {dayEvents.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/60 italic pl-1">Sem eventos</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
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
                            <div key={ev.id} className={cn("text-[9px] px-1.5 py-0.5 rounded truncate border font-medium", m.bg, m.color)}>
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

        {/* ── Side panel ───────────────────────────── */}
        <div className="w-[320px] shrink-0 hidden lg:block space-y-3">
          <div className="px-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Eventos do dia</p>
            <h3 className="text-sm font-bold text-foreground capitalize">{fmtLong(selectedDate)}</h3>
          </div>
          {selectedEvents.length === 0 ? (
            <Card className="p-6 text-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Sem eventos neste dia</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs" onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setOpenCreate(true); }}>
                <Plus className="w-3.5 h-3.5" /> Adicionar evento
              </Button>
            </Card>
          ) : selectedEvents.map(ev => {
            const m = TYPE_META[ev.type];
            const Icon = m.icon;
            const isUser = ev.id.startsWith("u-");
            return (
              <Card key={ev.id} className="overflow-hidden">
                <div className={cn("h-1", m.ring)} />
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", m.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", m.color)} />
                      </div>
                      <div className="min-w-0">
                        <Badge variant="outline" className={cn("text-[9px] mb-0.5", m.bg, m.color, "border-0")}>{m.label}</Badge>
                        <p className="text-sm font-semibold text-foreground leading-tight">{ev.title}</p>
                      </div>
                    </div>
                    {ev.obligatory && <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 shrink-0">Obrigatório</Badge>}
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground pl-1">
                    {ev.startTime && ev.startTime !== "23:59" && (
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{ev.startTime} – {ev.endTime}</div>
                    )}
                    {ev.endDate && (
                      <div className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" />{ev.date} → {ev.endDate}</div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{ev.location}</div>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground border-t pt-2 leading-relaxed">{ev.description}</p>
                  )}
                  {isUser && (
                    <div className="pt-1 border-t">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ev.id)}>
                        <Trash2 className="w-3 h-3" /> Remover
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
