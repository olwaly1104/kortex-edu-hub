import { useEffect, useMemo, useState } from "react";
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
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, MapPin,
  GraduationCap, Palmtree, Users, FileText, Trash2, Check, X, Bell, UserCircle2,
  Eye, AlignLeft, Tag, CalendarRange, Info, Briefcase, Sparkles, Video, Building2, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isInstitutionLive } from "@/pages/financas/_FinHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const DB_TYPES = new Set(["reuniao", "prazo", "pessoal", "outro"]);
const toDbType = (t: EventType): "reuniao" | "prazo" | "pessoal" | "outro" =>
  DB_TYPES.has(t) ? (t as "reuniao" | "prazo" | "pessoal" | "outro") : "outro";
const fromDb = (r: {
  id: string; type: string; title: string; event_date: string;
  start_time: string | null; end_time: string | null; location: string | null;
  participants: unknown; categoria: string | null;
}): AgendaEvent => {
  const rawType = (r.categoria && (["ferias","feriado","pessoal","prazo","reuniao"] as const).includes(r.categoria as never))
    ? (r.categoria as EventType)
    : (r.type as EventType);
  return {
    id: r.id,
    type: rawType,
    title: r.title,
    date: r.event_date,
    startTime: r.start_time ? r.start_time.slice(0, 5) : undefined,
    endTime: r.end_time ? r.end_time.slice(0, 5) : undefined,
    location: r.location ?? undefined,
    participants: Array.isArray(r.participants) ? (r.participants as string[]) : [],
  };
};


/* ── constants ─────────────────────────────────────── */
const TODAY = "2024-02-14";
const ANO_LETIVO = "2024 / 2025";

const DAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type EventType = "ferias" | "reuniao" | "feriado" | "pessoal" | "prazo";
type ItemKind = "evento" | "prazo" | "reuniao";

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
  modality?: "presencial" | "virtual";
  meetingLink?: string;
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
  participants?: string[];
  agenda?: string[];
  status: "pending" | "accepted" | "declined";
  requestedAt: string;
  modality: "presencial" | "virtual";
  meetingLink?: string;
}

const MODALITY_META: Record<"presencial" | "virtual", { label: string; cls: string; icon: typeof Video }> = {
  presencial: { label: "Presencial", cls: "bg-slate-50 text-slate-700 border-slate-200", icon: Building2 },
  virtual:    { label: "Virtual",    cls: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Video },
};

type ParticipantStatus = "accepted" | "declined" | "pending";
function participantStatus(name: string, seed: string): ParticipantStatus {
  let h = 0;
  const s = name + "|" + seed;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const m = Math.abs(h) % 10;
  if (m < 6) return "accepted";
  if (m < 8) return "declined";
  return "pending";
}
const STATUS_META: Record<ParticipantStatus, { label: string; cls: string; dot: string }> = {
  accepted: { label: "Confirmado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  declined: { label: "Recusou",    cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500" },
  pending:  { label: "Pendente",   cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
};

const TYPE_META: Record<EventType, { label: string; text: string; soft: string; bar: string; icon: typeof Palmtree }> = {
  ferias:  { label: "Férias",   text: "text-emerald-700", soft: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", icon: Palmtree },
  reuniao: { label: "Reunião",  text: "text-blue-700",    soft: "bg-blue-50 border-blue-200",       bar: "bg-blue-500",    icon: Users },
  feriado: { label: "Feriado",  text: "text-rose-700",    soft: "bg-rose-50 border-rose-200",       bar: "bg-rose-500",    icon: CalendarDays },
  pessoal: { label: "Pessoal",  text: "text-violet-700",  soft: "bg-violet-50 border-violet-200",   bar: "bg-violet-500",  icon: Sparkles },
  prazo:   { label: "Prazo",    text: "text-amber-700",   soft: "bg-amber-50 border-amber-200",     bar: "bg-amber-500",   icon: FileText },
};

const DEPT_PEOPLE: string[] = [];

const PRESET_EVENTS: AgendaEvent[] = [];

const INITIAL_REQUESTS: MeetingRequest[] = [];


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
function fmtShort(s: string) {
  const d = parseISO(s);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

/* mock current time for entry state computation on TODAY */
const NOW_MIN = 10 * 60 + 45;
type EvState = "agendado" | "decorrer" | "concluido";
const EV_STATE_META: Record<EvState, { label: string; cls: string; dot: string }> = {
  agendado:  { label: "Agendado",   cls: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  decorrer:  { label: "A decorrer", cls: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
  concluido: { label: "Concluído",  cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};
function eventState(ev: AgendaEvent): EvState {
  const end = ev.endDate ?? ev.date;
  if (ev.date > TODAY) return "agendado";
  if (end < TODAY) return "concluido";
  // overlaps today
  if (ev.date < TODAY || end > TODAY) return "decorrer";
  // single-day today
  if (!ev.startTime) return "decorrer";
  const [sh, sm] = ev.startTime.split(":").map(Number);
  const [eh, em] = (ev.endTime ?? ev.startTime).split(":").map(Number);
  const start = sh * 60 + sm, finish = eh * 60 + em;
  if (NOW_MIN < start) return "agendado";
  if (NOW_MIN > finish) return "concluido";
  return "decorrer";
}

/* ─────────────────────────────────────────────────── */
export default function FinancasCalendario() {
  const { user } = useAuth();
  const [view, setView] = useState<"week" | "month">("week");
  const [now, setNow] = useState<Date>(new Date());
  const [live, setLive] = useState<boolean>(() => isInstitutionLive(user?.email));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const recheck = () => setLive(isInstitutionLive(user?.email));
    recheck();
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, [user?.email]);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = now.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const [cursor, setCursor] = useState<string>(TODAY);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [openCreate, setOpenCreate] = useState(false);
  const [userEvents, setUserEvents] = useState<AgendaEvent[]>([]);
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);
  const [detailEvent, setDetailEvent] = useState<AgendaEvent | null>(null);
  const [detailRequest, setDetailRequest] = useState<MeetingRequest | null>(null);
  const [participantsView, setParticipantsView] = useState<{ title: string; participants: string[]; seed: string } | null>(null);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const openParticipants = (title: string, participants: string[] | undefined, seed: string) => {
    if (!participants || participants.length === 0) return;
    setParticipantsView({ title, participants, seed });
  };

  const allEvents = useMemo(() => {
    const accepted: AgendaEvent[] = requests
      .filter(r => r.status === "accepted")
      .map(r => ({
        id: r.id, title: r.title, type: "reuniao" as EventType, date: r.date,
        startTime: r.startTime, endTime: r.endTime, location: r.location,
        description: r.description, organizer: r.organizer, participants: r.participants,
      }));
    return [...PRESET_EVENTS, ...userEvents, ...accepted];
  }, [userEvents, requests]);

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

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("calendario_events")
        .select("id,type,title,event_date,start_time,end_time,location,participants,categoria")
        .order("event_date", { ascending: true });
      if (!mounted) return;
      if (error) { console.warn("calendario load", error.message); return; }
      setUserEvents((data ?? []).map(fromDb));
    })();
    return () => { mounted = false; };
  }, []);

  const openCreateDialog = () => {
    const t = todayStr();
    setForm({ title: "", type: "pessoal", date: t, startTime: "09:00", endTime: "10:00", location: "", description: "", participants: [] });
    setKind("evento");
    setSelectedDate(t);
    setCursor(t);
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Adicione um título."); return; }
    const finalType: EventType =
      kind === "reuniao" ? "reuniao" : kind === "prazo" ? "prazo" : form.type;
    const payload: Omit<AgendaEvent, "id"> = kind === "prazo"
      ? { ...form, type: "prazo", endTime: undefined, participants: [] }
      : { ...form, type: finalType };

    const { data: sessionData } = await supabase.auth.getUser();
    const uid = sessionData.user?.id;
    if (!uid) { toast.error("Sessão expirada. Inicie sessão novamente."); return; }

    setSaving(true);
    const meta = TYPE_META[finalType];
    const dbRow = {
      owner_user_id: uid,
      type: toDbType(finalType),
      title: payload.title.trim(),
      event_date: payload.date,
      start_time: (payload.startTime && payload.startTime.length > 0) ? payload.startTime : "09:00",
      end_time: payload.endTime || null,
      location: payload.location || null,
      participants: payload.participants ?? [],
      color: meta?.bar?.replace("bg-", "") ?? "primary",
      categoria: finalType,
    };
    const { data, error } = await supabase
      .from("calendario_events")
      .insert(dbRow)
      .select("id,type,title,event_date,start_time,end_time,location,participants,categoria")
      .single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message || "Não foi possível guardar."); return; }

    setUserEvents(prev => [...prev, fromDb(data)]);
    toast.success(kind === "reuniao" ? "Reunião adicionada à agenda." : kind === "prazo" ? "Prazo marcado." : "Evento adicionado.");
    setOpenCreate(false);
    setForm({ title: "", type: "pessoal", date: todayStr(), startTime: "09:00", endTime: "10:00", location: "", description: "", participants: [] });
    setKind("evento");
  };

  const handleDelete = async (id: string) => {
    const prev = userEvents;
    setUserEvents(prev.filter(e => e.id !== id));
    setDetailEvent(null);
    const { error } = await supabase.from("calendario_events").delete().eq("id", id);
    if (error) {
      setUserEvents(prev);
      toast.error(error.message || "Não foi possível eliminar.");
    } else {
      toast.success("Removido.");
    }
  };
  const respondRequest = (id: string, status: "accepted" | "declined") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setDetailRequest(null);
  };

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = (() => {
    const a = parseISO(weekStart), b = parseISO(weekDays[6]);
    return `${a.getDate()} ${MONTH_NAMES[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTH_NAMES[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
  })();

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
      {/* ── Header ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-3">
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
                <GraduationCap className="w-3.5 h-3.5" />
                Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                <Rocket className="w-3.5 h-3.5" />
                Onboarding
              </span>
            )}
            <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
              </span>
              <span className="w-px bg-border" />
              <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
                <Clock className="w-3.5 h-3.5" />{liveTime}
              </span>
            </div>
            <Button size="sm" className="h-9 gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow"
              onClick={openCreateDialog}>
              <Plus className="w-4 h-4" /> Adicionar à Agenda
            </Button>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────── */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          {(() => {
            const periodEntriesCount = (view === "week"
              ? weekDays.flatMap(d => eventsOnDate(d))
              : allEvents.filter(e => {
                  const dd = parseISO(e.date);
                  return dd.getMonth() === cursorD.getMonth() && dd.getFullYear() === cursorD.getFullYear();
                })
            ).length;

            const PeriodHeader = (
              <div className="px-3 py-2.5 border-b bg-muted/10 flex items-center justify-between gap-3 flex-wrap">
                {/* view toggle */}
                <div className="flex bg-muted/60 rounded-lg p-0.5 shrink-0">
                  {(["week", "month"] as const).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={cn("px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                        view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {v === "week" ? "Semana" : "Mês"}
                    </button>
                  ))}
                </div>

                {/* arrows + date selector */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
                  <button onClick={() => navigateBy(-1)}
                    className="h-8 w-8 rounded-md border border-border hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0"
                    aria-label={view === "week" ? "Semana anterior" : "Mês anterior"}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {view === "week" ? (
                    <h2 className="px-2 text-sm font-bold text-foreground capitalize truncate">
                      {weekLabel}
                    </h2>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Select value={String(cursorD.getMonth())} onValueChange={(v) => {
                        const d = parseISO(cursor); d.setMonth(parseInt(v, 10)); setCursor(toISO(d));
                      }}>
                        <SelectTrigger className="h-8 w-auto gap-1.5 text-sm font-bold capitalize border-0 shadow-none hover:bg-muted/60 focus:ring-0 px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_NAMES.map((mn, i) => (
                            <SelectItem key={mn} value={String(i)} className="text-sm">{mn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={String(cursorD.getFullYear())} onValueChange={(v) => {
                        const d = parseISO(cursor); d.setFullYear(parseInt(v, 10)); setCursor(toISO(d));
                      }}>
                        <SelectTrigger className="h-8 w-auto gap-1.5 text-sm font-bold border-0 shadow-none hover:bg-muted/60 focus:ring-0 px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025, 2026].map(y => (
                            <SelectItem key={y} value={String(y)} className="text-sm">{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <button onClick={() => navigateBy(1)}
                    className="h-8 w-8 rounded-md border border-border hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0"
                    aria-label={view === "week" ? "Próxima semana" : "Próximo mês"}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* entradas badge */}
                <Badge variant="outline" className="h-7 px-2.5 gap-1.5 text-xs font-semibold shrink-0">
                  <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
                  {periodEntriesCount} {periodEntriesCount === 1 ? "entrada" : "entradas"}
                </Badge>
              </div>
            );

            if (view === "week") {
              return (
                <div className="space-y-3">
                  <Card className="overflow-hidden">
                    {PeriodHeader}
                    <div className="grid grid-cols-7 bg-muted/5">
                      {weekDays.map(d => {
                        const dD = parseISO(d);
                        const isToday = d === TODAY;
                        const isSel = d === selectedDate;
                        const count = eventsOnDate(d).length;
                        return (
                          <button key={d} onClick={() => setSelectedDate(d)}
                            className={cn("relative py-2.5 text-center border-l first:border-l-0 transition-colors",
                              isSel ? "bg-primary/10" : "hover:bg-primary/5")}>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                              {DAYS_SHORT[(dD.getDay() + 6) % 7]}
                            </p>
                            <p className={cn("text-sm font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-colors",
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
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="px-4 py-2.5 border-b bg-muted/5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Agenda do dia</p>
                        <h3 className="text-sm font-bold text-foreground capitalize">{fmtLong(selectedDate)}</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {selectedEvents.length} entrada{selectedEvents.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {selectedEvents.length === 0 ? (
                      <div className="p-8 text-center">
                        <CalendarDays className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Sem eventos neste dia</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs"
                          onClick={openCreateDialog}>
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
                        {selectedEvents.map(ev => (
                          <EventRow key={ev.id} ev={ev} onOpen={() => setDetailEvent(ev)} onParticipants={() => openParticipants(ev.title, ev.participants, ev.id)} />
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              );
            }

            return (
              <Card className="overflow-hidden">
                {PeriodHeader}
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
                              <div key={ev.id} onClick={(e) => { e.stopPropagation(); setDetailEvent(ev); }}
                                className={cn("text-[9px] px-1.5 py-0.5 rounded truncate border font-medium cursor-pointer", m.soft, m.text)}>
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
            );
          })()}
        </div>

        {/* ── Side panel ─────────────────────── */}
        <div className="w-[320px] shrink-0 hidden lg:block">
          {view === "month" ? (
            <Card className="overflow-hidden sticky top-6">
              <div className="px-3.5 py-3 border-b bg-muted/10 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Agenda do dia</p>
                  <h3 className="text-sm font-bold text-foreground capitalize leading-tight mt-0.5 truncate">{fmtLong(selectedDate)}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                  {selectedEvents.length} entrada{selectedEvents.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <CalendarDays className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sem eventos neste dia</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs"
                    onClick={openCreateDialog}>
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </Button>
                </div>
              ) : (
                <div className="p-3 space-y-2.5 max-h-[560px] overflow-y-auto">
                  {selectedEvents.map(ev => {
                    const m = TYPE_META[ev.type];
                    const Icon = m.icon;
                    const hasTime = !!ev.startTime;
                    return (
                      <button key={ev.id} onClick={() => setDetailEvent(ev)}
                        className="w-full text-left rounded-lg border bg-card hover:border-foreground/30 hover:shadow-sm transition-all overflow-hidden group">
                        <div className={cn("h-1 w-full", m.bar)} />
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md", m.soft)}>
                              <Icon className={cn("w-3 h-3", m.text)} />
                              <span className={cn("text-[10px] font-semibold uppercase tracking-wide", m.text)}>{m.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {(() => { const s = EV_STATE_META[eventState(ev)]; return (
                                <Badge variant="outline" className={cn("h-5 px-1.5 gap-1 text-[10px] font-medium", s.cls)}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                                  {s.label}
                                </Badge>
                              ); })()}
                              {ev.obligatory && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-red-50 text-red-700 border-red-200">Obrig.</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{ev.title}</p>
                          <div className="pt-2 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                              <Clock className="w-3 h-3" />
                              {hasTime ? `${ev.startTime} – ${ev.endTime}` : "Dia todo"}
                            </div>
                            {ev.location && (
                              <div className="flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 shrink-0" />{ev.location}</div>
                            )}
                            {ev.participants && ev.participants.length > 0 && (
                              <span role="button" tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); openParticipants(ev.title, ev.participants, ev.id); }}
                                className="inline-flex items-center gap-1.5 hover:text-foreground underline-offset-2 hover:underline cursor-pointer">
                                <Users className="w-3 h-3" />{ev.participants.length} participante{ev.participants.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden sticky top-6">
              <div className="px-3.5 py-2.5 border-b bg-muted/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
<Bell className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-sm font-semibold text-foreground truncate">Pedidos de Reunião</p>
                  {pendingRequests.length > 0 && (
                    <Badge variant="outline" className="text-[10px] h-5">{pendingRequests.length}</Badge>
                  )}
                </div>
                <button onClick={() => setShowAllRequests(true)}
                  className="text-[11px] font-semibold text-primary hover:underline shrink-0">
                  Ver todos
                </button>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">Sem pedidos pendentes</p>
                </div>
              ) : (
                <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 3 * 176 }}>
                  {pendingRequests.map(r => (
                    <RequestCard key={r.id} r={r} onAccept={() => respondRequest(r.id, "accepted")}
                      onDecline={() => respondRequest(r.id, "declined")} onDetail={() => setDetailRequest(r)}
                      onParticipants={() => openParticipants(r.title, r.participants, r.id)} />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ── Horizontal Pedidos (Mês only) ── */}
      {view === "month" && pendingRequests.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground truncate">Pedidos de Reunião</p>
              <Badge variant="outline" className="text-[10px] h-5">{pendingRequests.length}</Badge>
            </div>
            <button onClick={() => setShowAllRequests(true)}
              className="text-[11px] font-semibold text-primary hover:underline shrink-0">
              Ver todos
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-3 p-3" style={{ width: "max-content" }}>
              {pendingRequests.map(r => (
                <div key={r.id} className="w-[280px] shrink-0">
                  <RequestCard r={r} onAccept={() => respondRequest(r.id, "accepted")}
                    onDecline={() => respondRequest(r.id, "declined")} onDetail={() => setDetailRequest(r)}
                    onParticipants={() => openParticipants(r.title, r.participants, r.id)} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Ver todos os Pedidos de Reunião ── */}
      <AllRequestsDialog
        open={showAllRequests}
        onClose={() => setShowAllRequests(false)}
        requests={requests}
        onAccept={(id) => respondRequest(id, "accepted")}
        onDecline={(id) => respondRequest(id, "declined")}
        onDetail={(r) => { setDetailRequest(r); setShowAllRequests(false); }}
        onParticipants={(r) => openParticipants(r.title, r.participants, r.id)}
      />



      {/* ── Adicionar à Agenda (modern full-page modal) ── */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold">Adicionar à Agenda</DialogTitle>
              <DialogDescription className="text-xs">
                Crie um evento pessoal, marque um prazo ou envie um pedido de reunião.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {([
                { v: "evento" as const, label: "Evento", desc: "Pessoal ou institucional", icon: CalendarDays },
                { v: "prazo" as const, label: "Prazo", desc: "Data limite a cumprir", icon: FileText },
                { v: "reuniao" as const, label: "Reunião", desc: "Convidar participantes", icon: Users },
              ]).map(opt => {
                const I = opt.icon;
                const active = kind === opt.v;
                const accent = opt.v === "prazo"
                  ? (active ? "border-amber-500 bg-amber-50 shadow-sm" : "border-border hover:border-amber-300 hover:bg-amber-50/30")
                  : (active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30");
                const iconBg = opt.v === "prazo"
                  ? (active ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")
                  : (active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground");
                return (
                  <button key={opt.v} type="button" onClick={() => setKind(opt.v)}
                    className={cn("text-left p-4 rounded-xl border-2 transition-all", accent)}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
                        <I className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {kind === "prazo" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Um prazo marca uma data limite. Não tem hora de fim nem participantes — apenas o título, a data e (opcionalmente) uma hora-limite.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-foreground"><Tag className="w-3 h-3" /> Título</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder={kind === "reuniao" ? "Ex: Reunião sobre orçamento Q1" : kind === "prazo" ? "Ex: Entrega do relatório anual" : "Ex: Encontro com auditor"} className="h-10" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-foreground"><AlignLeft className="w-3 h-3" /> Descrição <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={kind === "prazo" ? "Notas sobre o prazo, requisitos ou responsáveis…" : "Notas, contexto ou agenda da reunião…"} />
            </div>

            {kind === "evento" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Categoria</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pessoal","feriado","ferias"] as EventType[]).map(t => {
                    const m = TYPE_META[t]; const I = m.icon;
                    return (
                      <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                        className={cn("p-2.5 rounded-lg border-2 text-center transition-all",
                          form.type === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        )}>
                        <I className={cn("w-4 h-4 mx-auto mb-1", m.text)} />
                        <p className="text-[10px] font-medium text-foreground">{m.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {kind === "prazo" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-foreground"><CalendarDays className="w-3 h-3" /> Data limite</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-foreground"><Clock className="w-3 h-3" /> Hora-limite <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="h-10" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-foreground"><CalendarDays className="w-3 h-3" /> Data</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-foreground"><Clock className="w-3 h-3" /> Início</Label>
                  <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5 text-foreground"><Clock className="w-3 h-3" /> Fim</Label>
                  <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="h-10" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5 text-foreground"><MapPin className="w-3 h-3" /> Local <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Sala / Gabinete" className="h-10" />
            </div>

            {kind === "reuniao" && (
              <div className="space-y-1.5 rounded-xl bg-blue-50/40 border border-blue-100 p-4">
                <Label className="text-xs flex items-center gap-1.5 text-blue-900"><Users className="w-3 h-3" /> Participantes</Label>
                <p className="text-[11px] text-blue-700/80 mb-2">Todos os selecionados receberão um pedido de reunião no calendário.</p>
                <ScrollArea className="h-40 rounded-md border bg-card p-2">
                  <div className="space-y-1">
                    {DEPT_PEOPLE.map(p => {
                      const checked = (form.participants ?? []).includes(p);
                      return (
                        <label key={p} className={cn("flex items-center gap-2 text-xs cursor-pointer p-2 rounded transition-colors",
                          checked ? "bg-blue-50" : "hover:bg-muted/50")}>
                          <Checkbox checked={checked} onCheckedChange={() => toggleParticipant(p)} />
                          <span className="text-foreground">{p}</span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
                {(form.participants?.length ?? 0) > 0 && (
                  <p className="text-[11px] text-blue-700 font-medium pt-1">{form.participants?.length} convidado(s) selecionado(s)</p>
                )}
              </div>
            )}

          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button variant="ghost" onClick={() => setOpenCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving} className="gap-1.5">
              <Check className="w-4 h-4" />
              {saving ? "A guardar…" : kind === "reuniao" ? "Enviar pedido" : kind === "prazo" ? "Marcar prazo" : "Adicionar à agenda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── Event detail ── */}
      <EventDetailDialog event={detailEvent} onClose={() => setDetailEvent(null)} onDelete={handleDelete} />

      {/* ── Request detail ── */}
      <RequestDetailDialog request={detailRequest} onClose={() => setDetailRequest(null)} onRespond={respondRequest}
        onParticipants={(r) => openParticipants(r.title, r.participants, r.id)} />

      {/* ── Participants viewer ── */}
      <ParticipantsDialog data={participantsView} onClose={() => setParticipantsView(null)} />
    </div>
  );
}

/* ── Request card ── */
const REQ_STATUS_META: Record<MeetingRequest["status"], { label: string; cls: string; dot: string; bar: string }> = {
  pending:  { label: "Pendente",  cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   bar: "bg-amber-500" },
  accepted: { label: "Aceite",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  declined: { label: "Recusado",  cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500",    bar: "bg-rose-500" },
};

function RequestCard({ r, onAccept, onDecline, onDetail, onParticipants, readOnly = false }: {
  r: MeetingRequest; onAccept: () => void; onDecline: () => void; onDetail: () => void; onParticipants: () => void; readOnly?: boolean;
}) {
  const st = REQ_STATUS_META[r.status];
  return (
    <div className="rounded-lg border bg-card hover:border-foreground/20 transition-colors overflow-hidden h-full flex flex-col">
      <div className="px-2.5 pt-2 pb-1 border-b bg-muted/20 flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Data do Pedido</span>
        <span className="text-[10px] font-semibold text-foreground">{fmtShort(r.requestedAt)}</span>
      </div>
      <div className="p-3 space-y-2.5 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <Badge variant="outline" className={cn("text-[9px] h-4 px-1 gap-0.5", MODALITY_META[r.modality].cls)}>
            {(() => { const I = MODALITY_META[r.modality].icon; return <I className="w-2.5 h-2.5" />; })()}
            {MODALITY_META[r.modality].label}
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 gap-1 font-semibold", st.cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
            {st.label}
          </Badge>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{r.title}</p>
          <div className="mt-1.5">
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-1 bg-primary/5 text-primary border-primary/20 font-medium max-w-full">
              <UserCircle2 className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{r.organizer}</span>
            </Badge>
          </div>
        </div>
        <div className="space-y-1 text-[10px] text-muted-foreground border-t border-border/60 pt-2">
          <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3 shrink-0" />{fmtShort(r.date)} · {r.startTime}–{r.endTime}</div>
          <div className="flex items-center gap-1 truncate">
            {r.modality === "virtual" ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
            <span className="truncate">{r.location}</span>
          </div>
          {r.participants && r.participants.length > 0 && (
            <button type="button" onClick={onParticipants}
              className="flex items-center gap-1 hover:text-foreground hover:underline underline-offset-2">
              <Users className="w-3 h-3" />{r.participants.length} participante{r.participants.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
        {!readOnly && r.status === "pending" && (
          <div className="flex items-center gap-1.5 pt-1">
            <Button size="sm" className="h-7 flex-1 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={onAccept}>
              <Check className="w-3 h-3" /> Aceitar
            </Button>
            <Button size="sm" variant="outline" className="h-7 flex-1 text-[10px] gap-1 border-red-200 text-red-700 hover:bg-red-50" onClick={onDecline}>
              <X className="w-3 h-3" /> Recusar
            </Button>
          </div>
        )}
      </div>
      <button onClick={onDetail}
        className="w-full h-8 text-[10px] font-medium text-foreground/80 hover:text-foreground border-t bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-center gap-1.5">
        <Eye className="w-3 h-3" /> Ver detalhes
      </button>
    </div>
  );
}

function EventRow({ ev, onOpen, compact = false, onParticipants }: { ev: AgendaEvent; onOpen: () => void; compact?: boolean; onParticipants?: () => void }) {
  const m = TYPE_META[ev.type];
  const Icon = m.icon;
  const hasTime = !!ev.startTime;
  return (
    <div onClick={onOpen} role="button" tabIndex={0}
      className={cn("w-full text-left flex items-center hover:bg-muted/30 transition-colors group cursor-pointer",
      compact ? "gap-2.5 px-3 py-2.5" : "gap-4 px-4 py-3")}>
      <div className={cn("text-center shrink-0", compact ? "w-10" : "w-14")}>
        {hasTime ? (
          <>
            <p className={cn("font-bold text-foreground", compact ? "text-xs" : "text-sm")}>{ev.startTime}</p>
            <p className="text-[10px] text-muted-foreground">{ev.endTime}</p>
          </>
        ) : (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Dia<br/>todo</p>
        )}
      </div>
      <div className={cn("w-0.5 rounded-full shrink-0", m.bar, compact ? "h-8" : "h-10")} />
      <div className={cn("rounded-lg flex items-center justify-center shrink-0", m.soft, compact ? "w-6 h-6" : "w-7 h-7")}>
        <Icon className={cn(m.text, compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium leading-tight text-foreground line-clamp-1", compact ? "text-xs" : "text-sm")}>{ev.title}</p>
        <div className={cn("flex items-center mt-0.5 text-[10px] text-muted-foreground", compact ? "gap-2" : "gap-3 mt-1 text-[11px]")}>
          {ev.location && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{ev.location}</span>}
          {ev.participants && ev.participants.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onParticipants?.(); }}
              className="flex items-center gap-1 hover:text-foreground hover:underline underline-offset-2">
              <Users className="w-3 h-3" />{ev.participants.length}{!compact && ` participante${ev.participants.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
      {!compact && (() => { const s = EV_STATE_META[eventState(ev)]; return (
        <Badge variant="outline" className={cn("h-5 px-1.5 gap-1 text-[10px] font-medium shrink-0", s.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
          {s.label}
        </Badge>
      ); })()}
      {!compact && (
        <Badge variant="outline" className={cn("text-[10px] shrink-0 border-0", m.soft, m.text)}>{m.label}</Badge>
      )}
      {ev.obligatory && !compact && (
        <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 shrink-0">Obrigatório</Badge>
      )}
    </div>
  );
}

/* ── Event detail dialog (per category) ── */
function EventDetailDialog({ event, onClose, onDelete }: { event: AgendaEvent | null; onClose: () => void; onDelete: (id: string) => void }) {
  if (!event) return null;
  const m = TYPE_META[event.type];
  const Icon = m.icon;
  const isUser = event.id.startsWith("u-");

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* header band colored by type */}
        <div className={cn("px-6 py-5 border-b", m.soft)}>
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-card shrink-0")}>
              <Icon className={cn("w-6 h-6", m.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className={cn("text-[10px] border-0 bg-card", m.text)}>{m.label}</Badge>
                {event.modality && (() => {
                  const mm = MODALITY_META[event.modality];
                  const I = mm.icon;
                  return (
                    <Badge variant="outline" className={cn("text-[10px] gap-1 h-5 px-1.5", mm.cls)}>
                      <I className="w-3 h-3" />
                      {mm.label}
                    </Badge>
                  );
                })()}
                {event.obligatory && (
                  <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">Obrigatório</Badge>
                )}
              </div>
              <DialogHeader className="space-y-0">
                <DialogTitle className="text-lg font-bold leading-tight">{event.title}</DialogTitle>
              </DialogHeader>
              <p className={cn("text-xs mt-1 capitalize", m.text)}>{fmtLong(event.date)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Common date/time block */}
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={CalendarDays} label="Data">
              {event.endDate ? `${fmtShort(event.date)} → ${fmtShort(event.endDate)}` : fmtShort(event.date)}
            </InfoTile>
            {event.startTime && (
              <InfoTile icon={Clock} label="Horário">
                {event.startTime} – {event.endTime}
              </InfoTile>
            )}
          </div>

          {/* Category-specific blocks */}
          {event.type === "reuniao" && (
            <>
              {event.modality && (
                <ModalityBanner modality={event.modality} location={event.location} link={event.meetingLink} />
              )}
              <div className="grid grid-cols-2 gap-3">
                {event.location && (
                  <InfoTile icon={event.modality === "virtual" ? Video : MapPin} label={event.modality === "virtual" ? "Plataforma" : "Local"}>{event.location}</InfoTile>
                )}
                {event.organizer && (
                  <InfoTile icon={UserCircle2} label="Organizador">{event.organizer}</InfoTile>
                )}
              </div>
              {event.participants && event.participants.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Participantes ({event.participants.length})
                  </p>
                  <div className="rounded-lg border divide-y">
                    {event.participants.map(p => {
                      const st = STATUS_META[participantStatus(p, event.id)];
                      return (
                        <div key={p} className="flex items-center gap-2 px-3 py-2 text-xs text-foreground">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold">
                            {p.split(" ").map(s => s[0]).slice(0, 2).join("")}
                          </div>
                          <span className="flex-1 truncate">{p}</span>
                          <Badge variant="outline" className={cn("text-[9px] gap-1", st.cls)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />{st.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {event.type === "prazo" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Prazo administrativo</p>
                <p className="text-[11px] text-amber-800/80 mt-0.5">Esta data marca um prazo institucional que requer cumprimento por parte do Departamento Financeiro.</p>
              </div>
            </div>
          )}

          {event.type === "ferias" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2.5">
              <Palmtree className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-900">Período de Férias</p>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">Suspensão das atividades letivas/administrativas neste intervalo.</p>
              </div>
            </div>
          )}

          {event.type === "feriado" && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 flex items-start gap-2.5">
              <CalendarRange className="w-4 h-4 text-rose-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-900">Feriado</p>
                <p className="text-[11px] text-rose-800/80 mt-0.5">Dia não útil — Universidade encerrada.</p>
              </div>
            </div>
          )}

          {event.type === "pessoal" && event.location && (
            <InfoTile icon={MapPin} label="Local">{event.location}</InfoTile>
          )}

          {event.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                <AlignLeft className="w-3 h-3" /> Descrição
              </p>
              <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border">{event.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          {isUser && (
            <Button variant="outline" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive mr-auto"
              onClick={() => onDelete(event.id)}>
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({ icon: I, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
        <I className="w-3 h-3" /> {label}
      </p>
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  );
}

/* ── Request detail dialog ── */
function RequestDetailDialog({ request, onClose, onRespond, onParticipants }: {
  request: MeetingRequest | null; onClose: () => void;
  onRespond: (id: string, s: "accepted" | "declined") => void;
  onParticipants: (r: MeetingRequest) => void;
}) {
  if (!request) return null;
  return (
    <Dialog open={!!request} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="px-6 py-5 border-b bg-blue-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-card shrink-0">
              <Users className="w-6 h-6 text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="text-[10px] border-0 bg-card text-blue-700 mb-1">Pedido de Reunião</Badge>
              <DialogHeader className="space-y-0">
                <DialogTitle className="text-lg font-bold leading-tight">{request.title}</DialogTitle>
              </DialogHeader>
              <p className="text-xs mt-1 text-blue-700 capitalize">{fmtLong(request.date)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <ModalityBanner modality={request.modality} location={request.location} link={request.meetingLink} />
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={CalendarDays} label="Data do Pedido">{fmtShort(request.requestedAt)}</InfoTile>
            <InfoTile icon={CalendarRange} label="Data da Reunião">{fmtShort(request.date)}</InfoTile>
            <InfoTile icon={Clock} label="Horário">{request.startTime} – {request.endTime}</InfoTile>
            <InfoTile icon={request.modality === "virtual" ? Video : MapPin} label={request.modality === "virtual" ? "Plataforma" : "Local"}>{request.location}</InfoTile>
            <InfoTile icon={Briefcase} label="Organizador">{request.organizer}</InfoTile>
            {request.participants && (
              <InfoTile icon={Users} label="Participantes">{request.participants.length}</InfoTile>
            )}
          </div>

          {request.participants && request.participants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Convidados
                </p>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => onParticipants(request)}>
                  <Eye className="w-3 h-3" /> Ver todos
                </Button>
              </div>
              <div className="rounded-lg border divide-y">
                {request.participants.map(p => {
                  const st = STATUS_META[participantStatus(p, request.id)];
                  return (
                    <div key={p} className="flex items-center gap-2 px-3 py-2 text-xs text-foreground">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold">
                        {p.split(" ").map(s => s[0]).slice(0, 2).join("")}
                      </div>
                      <span className="flex-1 truncate">{p}</span>
                      <Badge variant="outline" className={cn("text-[9px] gap-1", st.cls)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />{st.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {request.agenda && request.agenda.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                <AlignLeft className="w-3 h-3" /> Agenda
              </p>
              <ul className="rounded-lg border bg-muted/20 p-3 space-y-1 text-sm text-foreground">
                {request.agenda.map((a, i) => (
                  <li key={i} className="flex gap-2"><span className="text-muted-foreground">{i + 1}.</span> {a}</li>
                ))}
              </ul>
            </div>
          )}

          {request.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 flex items-center gap-1.5">
                <AlignLeft className="w-3 h-3" /> Descrição
              </p>
              <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3 border">{request.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 mr-auto"
            onClick={() => onRespond(request.id, "declined")}>
            <X className="w-4 h-4" /> Recusar
          </Button>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onRespond(request.id, "accepted")}>
            <Check className="w-4 h-4" /> Aceitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Participants dialog (clickable list with status) ── */
function ParticipantsDialog({ data, onClose }: {
  data: { title: string; participants: string[]; seed: string } | null;
  onClose: () => void;
}) {
  if (!data) return null;
  const counts = data.participants.reduce(
    (acc, p) => { const s = participantStatus(p, data.seed); acc[s]++; return acc; },
    { accepted: 0, declined: 0, pending: 0 } as Record<ParticipantStatus, number>
  );
  return (
    <Dialog open={!!data} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/20">
          <DialogHeader className="space-y-1">
            <Badge variant="outline" className="text-[10px] w-fit border-0 bg-card text-muted-foreground">Participantes</Badge>
            <DialogTitle className="text-base font-bold leading-tight">{data.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge variant="outline" className={cn("text-[10px] gap-1", STATUS_META.accepted.cls)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META.accepted.dot)} />{counts.accepted} Confirmados
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] gap-1", STATUS_META.declined.cls)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META.declined.dot)} />{counts.declined} Recusaram
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] gap-1", STATUS_META.pending.cls)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META.pending.dot)} />{counts.pending} Pendentes
            </Badge>
          </div>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="rounded-lg border divide-y">
            {data.participants.map(p => {
              const st = STATUS_META[participantStatus(p, data.seed)];
              return (
                <div key={p} className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-foreground">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {p.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                  <span className="flex-1 truncate text-foreground">{p}</span>
                  <Badge variant="outline" className={cn("text-[10px] gap-1", st.cls)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />{st.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter className="px-6 py-3 border-t bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Modality banner (virtual/presencial) ── */
function ModalityBanner({ modality, location, link }: { modality?: "presencial" | "virtual"; location?: string; link?: string }) {
  if (!modality) return null;
  const m = MODALITY_META[modality];
  const Icon = m.icon;
  return (
    <div className={cn("rounded-lg border p-3 flex items-center gap-3", m.cls)}>
      <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Modalidade</p>
        <p className="text-sm font-bold leading-tight">{m.label}</p>
        {location && <p className="text-[11px] opacity-80 truncate mt-0.5">{location}</p>}
      </div>
      {modality === "virtual" && link && (
        <a href={link} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-md bg-card hover:bg-card/80 transition-colors shrink-0">
          <Link2 className="w-3 h-3" /> Entrar
        </a>
      )}
    </div>
  );
}

/* ── All Requests dialog ── */
function AllRequestsDialog({ open, onClose, requests, onAccept, onDecline, onDetail, onParticipants }: {
  open: boolean;
  onClose: () => void;
  requests: MeetingRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onDetail: (r: MeetingRequest) => void;
  onParticipants: (r: MeetingRequest) => void;
}) {
  const [filter, setFilter] = useState<"all" | MeetingRequest["status"]>("all");
  const sorted = [...requests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const filtered = filter === "all" ? sorted : sorted.filter(r => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    accepted: requests.filter(r => r.status === "accepted").length,
    declined: requests.filter(r => r.status === "declined").length,
  };

  const tabs: { v: "all" | MeetingRequest["status"]; label: string; count: number }[] = [
    { v: "all", label: "Todos", count: counts.all },
    { v: "pending", label: "Pendentes", count: counts.pending },
    { v: "accepted", label: "Aceites", count: counts.accepted },
    { v: "declined", label: "Recusados", count: counts.declined },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/10">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Pedidos de Reunião
            </DialogTitle>
            <DialogDescription className="text-xs">
              Histórico completo de pedidos — pendentes, aceites e recusados.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pt-4 pb-2 flex items-center gap-1.5 flex-wrap border-b">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setFilter(t.v)}
              className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border",
                filter === t.v ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted/40")}>
              {t.label}
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                filter === t.v ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sem pedidos para mostrar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(r => (
                <RequestCard key={r.id} r={r}
                  readOnly={r.status !== "pending"}
                  onAccept={() => onAccept(r.id)}
                  onDecline={() => onDecline(r.id)}
                  onDetail={() => onDetail(r)}
                  onParticipants={() => onParticipants(r)} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

