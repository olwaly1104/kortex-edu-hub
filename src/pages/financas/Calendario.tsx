import { useMemo, useState } from "react";
import { FinHeader } from "./_FinHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Users, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const HOUR_HEIGHT = 60;

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

  const totalHeight = (HOURS.length - 1) * HOUR_HEIGHT;

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
          <Button size="sm" className="gap-2 h-8">
            <Plus className="w-3.5 h-3.5" /> Criar Evento
          </Button>
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
                  <Button size="sm" className="gap-1.5 h-8">
                    <Plus className="w-3.5 h-3.5" /> Criar Evento
                  </Button>
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
