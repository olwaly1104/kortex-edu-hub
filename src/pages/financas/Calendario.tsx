import { useMemo, useState } from "react";
import { FinHeader } from "./_FinHeader";
import { useInstitutionContacts } from "@/hooks/useInstitutionContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { CalendarDays, ChevronLeft, ChevronRight, Plus, Users, MapPin, Calendar as CalendarIcon, Video, Building2, Clock, X, UserPlus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

type EventType = "reuniao" | "prazo" | "pessoal";
type Modalidade = "kortex" | "presencial";

const EVENT_TYPES: { value: EventType; label: string; icon: typeof Video }[] = [
  { value: "reuniao", label: "Reunião", icon: Users },
  { value: "prazo", label: "Prazo", icon: Clock },
  { value: "pessoal", label: "Pessoal", icon: User },
];

function CriarEventoDialog({ defaultDate, trigger }: { defaultDate: Date; trigger: React.ReactNode }) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventType>("reuniao");
  const [modalidade, setModalidade] = useState<Modalidade>("presencial");
  const [title, setTitle] = useState("");
  const initialDate = defaultDate.toISOString().split("T")[0];
  const [date, setDate] = useState(initialDate < todayISO ? todayISO : initialDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [participants, setParticipants] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [participantFocus, setParticipantFocus] = useState(false);
  const { contacts } = useInstitutionContacts();
  const geopontos = useMemo<{ id: string; nome: string }[]>(() => {
    if (!open) return [];
    try {
      const raw = localStorage.getItem("upra:geopontos");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((g: any) => g?.nome) : [];
    } catch { return []; }
  }, [open]);

  const filteredContacts = useMemo(() => {
    const q = participantInput.trim().toLowerCase();
    const selectedIds = new Set(participants.map((p) => p.id));
    return contacts
      .filter((c) => !selectedIds.has(c.id))
      .filter((c) => !q || c.display_name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [contacts, participantInput, participants]);

  const addContact = (c: { id: string; display_name: string; email: string | null }) => {
    if (participants.some((p) => p.id === c.id)) return;
    setParticipants([...participants, { id: c.id, name: c.display_name, email: c.email }]);
    setParticipantInput("");
  };

  const removeParticipant = (id: string) => setParticipants(participants.filter((p) => p.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Insira um título para o evento.");
      return;
    }
    if (date < todayISO) {
      toast.error("A data não pode ser anterior a hoje.");
      return;
    }
    if (endTime <= startTime) {
      toast.error("O horário de fim deve ser após o início.");
      return;
    }
    const msg = participants.length > 0
      ? `Evento criado. Pedidos enviados a ${participants.length} participante${participants.length > 1 ? "s" : ""}.`
      : "Evento criado com sucesso.";
    toast.success(msg);
    setOpen(false);
    setTitle(""); setLocation(""); setLink(""); setParticipants([]); setParticipantInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto top-4 translate-y-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" /> Criar Evento
          </DialogTitle>
          <DialogDescription>Agende um novo evento no calendário financeiro.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tipo — compact segmented */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/40 rounded-lg">
            {EVENT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-all",
                    active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="ev-title" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Título</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Reunião com Reitoria" className="h-9" />
          </div>

          {/* Data + Horários */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Data</Label>
              <Input id="ev-date" type="date" min={todayISO} value={date} onChange={(e) => setDate(e.target.value)} className="h-9 tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-start" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Início</Label>
              <Input id="ev-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9 tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Fim</Label>
              <Input id="ev-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9 tabular-nums" />
            </div>
          </div>

          {/* Modalidade + Local/Link (reuniao) */}
          {type === "reuniao" && (
            <div className="space-y-2">
              <div className="inline-flex p-0.5 bg-muted/40 rounded-md">
                {([
                  { value: "presencial" as const, label: "Presencial", icon: Building2 },
                  { value: "kortex" as const, label: "Kortex Link", icon: Video },
                ]).map((m) => {
                  const Icon = m.icon;
                  const active = modalidade === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setModalidade(m.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-all",
                        active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {modalidade === "presencial" ? (
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={geopontos.length === 0 ? "Sem geopontos registados" : "Selecionar local"} />
                  </SelectTrigger>
                  <SelectContent>
                    {geopontos.map((g) => (
                      <SelectItem key={g.id} value={g.nome || g.id}>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {g.nome || "Sem nome"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link da chamada Kortex..." className="h-9" />
              )}
            </div>
          )}

          {/* Local (não-reuniao) */}
          {type !== "reuniao" && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Local (opcional)</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={geopontos.length === 0 ? "Sem geopontos registados" : "Selecionar local"} />
                </SelectTrigger>
                <SelectContent>
                  {geopontos.map((g) => (
                    <SelectItem key={g.id} value={g.nome || g.id}>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {g.nome || "Sem nome"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="ev-notes" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Notas (opcional)</Label>
            <Textarea id="ev-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais..." className="resize-none" />
          </div>

          {/* Participantes — no fim */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <Label htmlFor="ev-participants" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 pt-3">
              <UserPlus className="w-3.5 h-3.5" /> Participantes
              {participants.length > 0 && (
                <span className="text-[10px] text-muted-foreground normal-case tracking-normal">· {participants.length} convidado{participants.length > 1 ? "s" : ""}</span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="ev-participants"
                value={participantInput}
                onChange={(e) => { setParticipantInput(e.target.value); setParticipantFocus(true); }}
                onFocus={() => setParticipantFocus(true)}
                onBlur={() => setTimeout(() => setParticipantFocus(false), 150)}
                placeholder="Procurar contacto..."
                className="h-9"
                autoComplete="off"
              />
              {participantFocus && filteredContacts.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-56 overflow-y-auto">
                  {filteredContacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addContact(c); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {initials(c.display_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.display_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.email ?? c.modulo ?? ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {participantFocus && participantInput.trim() && filteredContacts.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg px-3 py-2 text-xs text-muted-foreground">
                  Nenhum contacto encontrado.
                </div>
              )}
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {participants.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold">
                      {initials(p.name)}
                    </span>
                    {p.name}
                    <button type="button" onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" size="sm">Criar evento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDateLabel(date: Date, today: Date) {
  const isToday = toISO(date) === toISO(today);
  const label = date.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "short" });
  return isToday ? `${label} (Hoje)` : label;
}

export default function FinancasCalendario() {
  const [view, setView] = useState<"week" | "month">("week");
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(today));
  const [monthCursor, setMonthCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));


  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }),
    [weekStart]
  );

  const weekLabel = `${weekDays[0].toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })} – ${weekDays[4].toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}`;
  const monthLabel = monthCursor.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  // Empty data placeholders (no mock).
  const events: { id: string; date: string; startTime: string; endTime: string; title: string; room?: string; color: string }[] = [];
  const meetingRequests: { id: string; title: string; from: string; when: string }[] = [];

  const selectedDayEvents = events.filter((e) => e.date === toISO(selectedDate));

  // Month grid
  const monthDays = useMemo(() => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    return { startPad, daysInMonth };
  }, [monthCursor]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Calendário"
        subtitle="Eventos financeiros e reuniões"
        icon={<CalendarIcon className="w-5 h-5 text-primary" />}
        right={
          <CriarEventoDialog
            defaultDate={selectedDate}
            trigger={
              <Button size="sm" className="gap-2 h-8">
                <Plus className="w-3.5 h-3.5" /> Criar Evento
              </Button>
            }
          />
        }
      />

      <div className="flex gap-6">
        {/* LEFT — main calendar */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => {
                if (view === "week") { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }
                else { const d = new Date(monthCursor); d.setMonth(d.getMonth() - 1); setMonthCursor(d); }
              }}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-semibold text-foreground min-w-[180px] text-center capitalize tabular-nums">
                {view === "week" ? weekLabel : monthLabel}
              </span>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => {
                if (view === "week") { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }
                else { const d = new Date(monthCursor); d.setMonth(d.getMonth() + 1); setMonthCursor(d); }
              }}><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setView("week")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Semanal</button>
              <button onClick={() => setView("month")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Mensal</button>
            </div>
          </div>

          {view === "week" ? (
            <Card className="overflow-hidden border">
              {/* Day strip selector */}
              <div className="grid grid-cols-5 border-b">
                {weekDays.map((d, i) => {
                  const iso = toISO(d);
                  const isTodayCol = iso === toISO(today);
                  const isSelected = iso === toISO(selectedDate);
                  return (
                    <div key={iso} onClick={() => setSelectedDate(d)} className={cn("py-3 text-center border-l first:border-l-0 cursor-pointer transition-colors hover:bg-primary/10", isTodayCol ? "bg-primary/5" : "bg-muted/20", isSelected && !isTodayCol && "bg-primary/10")}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{DAYS[i]}</p>
                      <p className={cn("text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto tabular-nums", isSelected ? "bg-primary text-primary-foreground" : isTodayCol ? "ring-2 ring-primary text-foreground" : "text-foreground")}>{d.getDate()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Agenda — vertical list of events of the selected day */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 capitalize">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    {formatDateLabel(selectedDate, today)}
                  </h3>
                  <CriarEventoDialog
                    defaultDate={selectedDate}
                    trigger={
                      <Button size="sm" className="gap-1.5 h-8">
                        <Plus className="w-3.5 h-3.5" /> Criar Evento
                      </Button>
                    }
                  />
                </div>

                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Sem eventos</p>
                    <p className="text-xs text-muted-foreground mt-1">A agenda deste dia está livre.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedDayEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 py-3">
                        <div className="w-1 h-10 rounded-full shrink-0" style={{ background: event.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                          {event.room && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{event.room}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden border">
              <div className="grid grid-cols-7 border-b">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest border-l first:border-l-0 bg-muted/20">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: monthDays.startPad }).map((_, i) => (
                  <div key={`p-${i}`} className="min-h-[90px] border-t border-l first:border-l-0 bg-muted/5" />
                ))}
                {Array.from({ length: monthDays.daysInMonth }, (_, i) => i + 1).map((day) => {
                  const d = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
                  const iso = toISO(d);
                  const isTodayDay = iso === toISO(today);
                  const isSelected = iso === toISO(selectedDate);
                  return (
                    <div key={day} onClick={() => setSelectedDate(d)} className={cn("min-h-[90px] border-t border-l p-1.5 cursor-pointer hover:bg-primary/5 transition-colors", isTodayDay && "bg-primary/5", isSelected && !isTodayDay && "bg-primary/10")}>
                      <p className={cn("text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full tabular-nums", isSelected ? "bg-primary text-primary-foreground" : isTodayDay ? "ring-2 ring-primary text-foreground" : "text-foreground")}>{day}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — Pedidos + dia selecionado */}
        <div className="w-[320px] shrink-0 space-y-5 hidden lg:block">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Pedidos de Reunião
              </h3>
              <span className="text-[11px] text-muted-foreground tabular-nums">{meetingRequests.length}</span>
            </div>
            {meetingRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Sem pedidos pendentes.</p>
            ) : (
              <div className="space-y-2">
                {meetingRequests.map(r => (
                  <div key={r.id} className="px-3 py-2 rounded-lg border border-border">
                    <p className="text-xs font-semibold text-foreground">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.from} · {r.when}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
