import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { calendarEvents, disciplines, lessons, grades } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, Play, User, CalendarDays, ClipboardCheck, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const HOUR_HEIGHT = 60;
const HOUR_START_MIN = 8 * 60;

const TODAY_DATE = "2024-02-14";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isPastDate(date: string): boolean {
  return date < TODAY_DATE;
}

function isToday(date: string): boolean {
  return date === TODAY_DATE;
}

function formatDateLabel(date: string): string {
  const dayNames: Record<string, string> = {
    "2024-02-12": "Segunda, 12 Fev",
    "2024-02-13": "Terça, 13 Fev",
    "2024-02-14": "Quarta, 14 Fev (Hoje)",
    "2024-02-15": "Quinta, 15 Fev",
    "2024-02-16": "Sexta, 16 Fev",
  };
  return dayNames[date] || date;
}

function findLessonForEvent(event: typeof calendarEvents[0]) {
  const disc = disciplines.find(d => d.name === event.discipline);
  if (!disc) return null;
  const lesson = lessons.find(l => l.disciplineId === disc.id);
  return lesson ? { disciplineId: disc.id, lessonId: lesson.id } : null;
}

export default function StudentCalendar() {
  const [view, setView] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate task due date and evaluation date events
  const derivedEvents = useMemo(() => {
    const events: typeof calendarEvents = [];
    // Task due dates from lessons
    lessons.forEach(lesson => {
      lesson.tasks.forEach(task => {
        const dateParts = task.dueDate.split("/");
        const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        events.push({
          id: `task-${task.id}`,
          title: `Entrega: ${task.title}`,
          type: "entrega" as const,
          date: isoDate,
          startTime: "23:59",
          endTime: "23:59",
          discipline: disciplines.find(d => d.id === lesson.disciplineId)?.name,
          color: "hsl(38, 92%, 50%)",
        });
      });
    });
    // Evaluation dates from grades
    grades.forEach(g => {
      g.evaluations.forEach((ev, i) => {
        const dateParts = ev.date.split("/");
        const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const existing = calendarEvents.find(e => e.date === isoDate && e.discipline === g.disciplineName);
        if (!existing) {
          events.push({
            id: `eval-${g.id}-${i}`,
            title: `${ev.name} — ${g.disciplineName}`,
            type: ev.name.toLowerCase().includes("exame") ? "exame" as const : "teste" as const,
            date: isoDate,
            startTime: ev.room ? "08:00" : "23:59",
            endTime: ev.duration ? "10:00" : "23:59",
            duration: ev.duration,
            room: ev.room,
            discipline: g.disciplineName,
            color: "hsl(0, 84%, 60%)",
          });
        }
      });
    });
    return events;
  }, []);

  const allCalendarEvents = useMemo(() => [...calendarEvents, ...derivedEvents], [derivedEvents]);

  const allAulas = calendarEvents.filter(e => e.type === "aula");
  
  const selectedDayEvents = allAulas.filter(e => e.date === selectedDate);

  // Compute lesson number per discipline (sorted by date+time)
  const totalAulasByDiscipline: Record<string, number> = {};
  const aulasSorted = [...allAulas].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  aulasSorted.forEach(e => {
    if (e.discipline) totalAulasByDiscipline[e.discipline] = (totalAulasByDiscipline[e.discipline] || 0) + 1;
  });
  // Total aulas in academic year (mock: ~60 per discipline)
  const totalAulasAnoLetivo: Record<string, number> = {};
  disciplines.forEach(d => { totalAulasAnoLetivo[d.name] = d.progress.total * 2; });

  const getLessonNumber = (event: typeof calendarEvents[0]) => {
    if (!event.discipline) return null;
    let count = 0;
    for (const e of aulasSorted) {
      if (e.discipline === event.discipline) {
        count++;
        if (e.id === event.id) return count;
      }
    }
    return null;
  };

  const monthDays = Array.from({ length: 29 }, (_, i) => i + 1);
  const monthStartDay = 3;
  const totalHeight = (HOURS.length - 1) * HOUR_HEIGHT;

  const selected = calendarEvents.find(e => e.id === selectedEvent);

  const handleReverAula = (event: typeof calendarEvents[0]) => {
    const lessonInfo = findLessonForEvent(event);
    if (lessonInfo) {
      navigate(`/student/disciplines/${lessonInfo.disciplineId}/lessons/${lessonInfo.lessonId}`);
    }
  };

  const handleEntrarAula = (event: typeof calendarEvents[0]) => {
    navigate(`/student/class-lobby?eventId=${event.id}`);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header - just title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Quarta-feira, 14 de Fevereiro 2024</p>
      </div>

      <div className="flex gap-6">
        {/* Main calendar + upcoming events area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Calendar toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
                {view === "week" ? "12 – 16 Fev 2024" : "Fevereiro 2024"}
              </span>
              <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setView("week")}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                Semana
              </button>
              <button
                onClick={() => setView("month")}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                Mês
              </button>
            </div>
          </div>

          {view === "week" ? (
              <Card className="overflow-hidden border">
              {/* Day headers - clickable */}
              <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b">
                <div className="bg-muted/20" />
                {DAYS.map((day, i) => {
                  const dayNum = 12 + i;
                  const dateStr = `2024-02-${dayNum}`;
                  const isTodayCol = isToday(dateStr);
                  const isSelectedDay = selectedDate === dateStr;
                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(dateStr)}
                      className={cn(
                        "py-3 text-center border-l cursor-pointer transition-colors hover:bg-primary/10",
                        isTodayCol ? "bg-primary/5" : "bg-muted/20",
                        isSelectedDay && !isTodayCol && "bg-primary/10"
                      )}
                    >
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{day}</p>
                      <p className={cn(
                        "text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                        isSelectedDay ? "bg-primary text-primary-foreground" : isTodayCol ? "ring-2 ring-primary text-foreground" : "text-foreground"
                      )}>{dayNum}</p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <ScrollArea className="h-[560px]">
                <div className="grid grid-cols-[56px_repeat(5,1fr)] relative" style={{ height: totalHeight + 20 }}>
                  {/* Time labels */}
                  <div className="relative bg-muted/5">
                    {HOURS.map((label, i) => (
                      <div key={label} className="absolute w-full text-[11px] text-muted-foreground text-right pr-2 leading-none" style={{ top: i * HOUR_HEIGHT + 10 }}>
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {DAYS.map((_, dayIndex) => {
                    const dayDate = `2024-02-${12 + dayIndex}`;
                    const dayEvents = allAulas.filter(e => e.date === dayDate);
                    const dayDeadlines = allCalendarEvents.filter(e => e.date === dayDate && (e.type === "entrega" || e.type === "teste" || e.type === "exame"));
                    const isTodayCol = isToday(dayDate);
                    const isPast = isPastDate(dayDate);
                    const isSelectedDay = selectedDate === dayDate;

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => handleDayClick(dayDate)}
                        className={cn(
                          "border-l relative cursor-pointer",
                          isTodayCol && "bg-primary/[0.02]",
                          isSelectedDay && "bg-primary/[0.04]"
                        )}
                      >
                        {HOURS.map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-border/20" style={{ top: i * HOUR_HEIGHT + 10 }} />
                        ))}

                        {/* Deadline markers at top of column */}
                        {dayDeadlines.length > 0 && (
                          <div className="absolute top-1 left-1 right-1 z-20 space-y-0.5">
                            {dayDeadlines.slice(0, 2).map(dl => (
                              <div
                                key={dl.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(dl.id); setSelectedDate(dayDate); }}
                                className={cn(
                                  "text-[8px] font-semibold px-1.5 py-0.5 rounded truncate cursor-pointer",
                                  dl.type === "entrega" ? "bg-amber-500/15 text-amber-700 border border-amber-500/30" : "bg-red-500/15 text-red-600 border border-red-500/30"
                                )}
                              >
                                {dl.type === "entrega" ? "📋" : "📝"} {dl.title.replace("Entrega: ", "").substring(0, 18)}…
                              </div>
                            ))}
                          </div>
                        )}

                        {dayEvents.map(event => {
                          const startMin = timeToMinutes(event.startTime) - HOUR_START_MIN;
                          const endMin = timeToMinutes(event.endTime) - HOUR_START_MIN;
                          const top = (startMin / 60) * HOUR_HEIGHT + 10;
                          const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                          const past = isPast || (isToday(dayDate) && timeToMinutes(event.endTime) < timeToMinutes("10:45"));
                          const isSelected = selectedEvent === event.id;

                          return (
                            <div
                              key={event.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(isSelected ? null : event.id); setSelectedDate(dayDate); }}
                              className={cn(
                                "absolute left-1 right-1 rounded-lg cursor-pointer transition-all overflow-hidden z-10",
                                past && "opacity-70",
                                isSelected && "ring-2 ring-primary ring-offset-1"
                              )}
                              style={{ top: top + 1, height: Math.max(height - 2, 24), backgroundColor: event.color }}
                            >
                              <div className="h-full flex flex-col justify-between px-2 py-1.5">
                                <div>
                                  <p className="text-[10px] font-bold text-white leading-tight truncate">{event.title}</p>
                                  <p className="text-[9px] text-white/80 truncate">{event.startTime} – {event.endTime}</p>
                                  {height > 50 && (
                                    <>
                                      <p className="text-[9px] text-white/70 truncate">{event.room}</p>
                                      <p className="text-[9px] text-white/70 truncate">{event.professor}</p>
                                    </>
                                  )}
                                </div>
                                {height > 60 && (
                                  past ? (
                                    <div
                                      className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white/90 bg-white/20 rounded-md px-2 py-1 w-full mt-1 hover:bg-white/30 transition-colors"
                                      onClick={(ev) => { ev.stopPropagation(); handleReverAula(event); }}
                                    >
                                      <Play className="w-3 h-3" /> Rever
                                    </div>
                                  ) : (
                                    <div
                                      className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white bg-white/25 rounded-md px-2 py-1 w-full mt-1 hover:bg-white/35 transition-colors"
                                      onClick={(ev) => { ev.stopPropagation(); handleEntrarAula(event); }}
                                    >
                                      <Video className="w-3 h-3" /> Entrar
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          ) : (
            <Card className="overflow-hidden border">
              <div className="grid grid-cols-7 border-b">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest border-l first:border-l-0 bg-muted/20">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: monthStartDay }, (_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-t border-l first:border-l-0 p-2 bg-muted/5" />
                ))}
                {monthDays.map(day => {
                  const dateStr = `2024-02-${String(day).padStart(2, "0")}`;
                  const dayEvents = allCalendarEvents.filter(e => e.date === dateStr);
                  const isWeekend = ((monthStartDay + day - 1) % 7) >= 5;
                  const isTodayDay = dateStr === TODAY_DATE;
                  const isSelectedDay = selectedDate === dateStr;

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(dateStr)}
                      className={cn(
                        "min-h-[90px] border-t border-l p-1.5 cursor-pointer hover:bg-primary/5 transition-colors",
                        isWeekend ? "bg-muted/5" : "",
                        isTodayDay ? "bg-primary/5" : "",
                        isSelectedDay && !isTodayDay && "bg-primary/10"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                        isSelectedDay ? "bg-primary text-primary-foreground" : isTodayDay ? "ring-2 ring-primary text-foreground" : "text-foreground"
                      )}>{day}</p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className="text-[9px] px-1.5 py-0.5 rounded truncate font-medium text-white cursor-pointer hover:brightness-110"
                            style={{ backgroundColor: ev.color }}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev.id); setSelectedDate(dateStr); }}
                          >
                            {ev.startTime} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>

        {/* Right sidebar - selected day schedule */}
        <div className="w-[300px] shrink-0 space-y-5 hidden lg:block">
          {/* Event detail popup */}
          {selected && (
            <Card className="overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: selected.color }} />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="text-[10px] mb-1.5" style={{ backgroundColor: selected.color + "20", color: selected.color, border: "none" }}>
                      {selected.type === "aula" ? "Aula" : selected.type === "teste" ? "Teste" : selected.type === "entrega" ? "Tarefa" : "Exame"}
                    </Badge>
                    <h3 className="font-bold text-foreground text-sm">{selected.title}</h3>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{selected.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selected.startTime} – {selected.endTime}</span>
                    {selected.duration && <span className="text-muted-foreground/60">({selected.duration})</span>}
                  </div>
                  {selected.professor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span>{selected.professor}</span>
                    </div>
                  )}
                  {selected.room && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selected.room}</span>
                    </div>
                  )}
                </div>
                {selected.type === "aula" && (
                  <div className="pt-2">
                    {isPastDate(selected.date) || (isToday(selected.date) && timeToMinutes(selected.endTime) < timeToMinutes("10:45")) ? (
                      <Button size="sm" variant="outline" className="w-full gap-2 text-xs border-muted-foreground/30 text-muted-foreground hover:bg-muted/50" onClick={() => handleReverAula(selected)}>
                        <Play className="w-3.5 h-3.5" /> Rever Aula
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full gap-2 text-xs bg-primary hover:bg-primary/90" onClick={() => handleEntrarAula(selected)}>
                        <Video className="w-3.5 h-3.5" /> Entrar na Aula
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Selected day's schedule */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split("T")[0]);
              setSelectedEvent(null);
            }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {formatDateLabel(selectedDate)}
            </h3>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split("T")[0]);
              setSelectedEvent(null);
            }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {/* Aulas */}
          <div className="space-y-3">
              {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => {
                const past = isPastDate(event.date) || (isToday(event.date) && timeToMinutes(event.endTime) < timeToMinutes("10:45"));
                return (
                  <Card
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={cn(
                      "overflow-hidden cursor-pointer transition-all hover:shadow-md",
                      selectedEvent === event.id && "ring-1 ring-primary/40 shadow-md"
                    )}
                  >
                    <div className="h-1" style={{ backgroundColor: event.color }} />
                    <div className="p-3.5">
                       <div className="flex items-center justify-between gap-2 mb-2.5">
                         <div className="flex items-center gap-2 min-w-0">
                           <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                           <p className="text-sm font-bold text-foreground truncate">{event.title}</p>
                         </div>
                         {event.discipline && getLessonNumber(event) && (
                           <span className="text-[10px] font-semibold shrink-0 rounded-md px-1.5 py-0.5" style={{ border: `1px solid ${event.color}`, color: event.color }}>
                             Aula {getLessonNumber(event)}/{totalAulasAnoLetivo[event.discipline] || "–"}
                           </span>
                         )}
                       </div>
                      <div className="space-y-1.5 mb-3 pl-4">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{event.startTime} – {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{event.professor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{event.room}</span>
                        </div>
                      </div>
                      {past ? (
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-muted-foreground/30 text-muted-foreground hover:bg-muted/50" onClick={e => { e.stopPropagation(); handleReverAula(event); }}>
                          <Play className="w-3.5 h-3.5" /> Rever Aula
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full gap-2 text-xs bg-primary hover:bg-primary/90" onClick={e => { e.stopPropagation(); handleEntrarAula(event); }}>
                          <Video className="w-3.5 h-3.5" /> Entrar na Aula
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              }) : (
                <p className="text-xs text-muted-foreground">Sem aulas neste dia.</p>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
