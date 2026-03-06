import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profTodayClasses, profDisciplines } from "@/data/professorData";
import { calendarEvents } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, Play, Users, CalendarDays } from "lucide-react";
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

// Professor's own calendar events (teaching schedule)
const profCalendarEvents = [
  { id: "pe1", title: "Matemática II", type: "aula" as const, date: "2024-02-12", startTime: "08:00", endTime: "09:30", room: "Sala 101", turma: "2º Ano Informática", disciplineId: "pd1", color: "hsl(224, 64%, 33%)" },
  { id: "pe2", title: "Matemática I", type: "aula" as const, date: "2024-02-12", startTime: "10:00", endTime: "11:30", room: "Sala 203", turma: "1º Ano Informática", disciplineId: "pd2", color: "hsl(175, 84%, 32%)" },
  { id: "pe3", title: "Matemática II", type: "aula" as const, date: "2024-02-12", startTime: "14:00", endTime: "15:30", room: "Sala 101", turma: "2º Ano Eng. Civil", disciplineId: "pd1", color: "hsl(224, 64%, 33%)" },
  { id: "pe4", title: "Estatística", type: "aula" as const, date: "2024-02-13", startTime: "14:00", endTime: "15:30", room: "Sala 105", turma: "2º Ano Informática", disciplineId: "pd3", color: "hsl(25, 95%, 53%)" },
  { id: "pe5", title: "Matemática II", type: "aula" as const, date: "2024-02-14", startTime: "08:00", endTime: "09:30", room: "Sala 101", turma: "2º Ano Informática", disciplineId: "pd1", color: "hsl(224, 64%, 33%)" },
  { id: "pe6", title: "Matemática I", type: "aula" as const, date: "2024-02-14", startTime: "10:00", endTime: "11:30", room: "Sala 203", turma: "1º Ano Informática", disciplineId: "pd2", color: "hsl(175, 84%, 32%)" },
  { id: "pe7", title: "Matemática II", type: "aula" as const, date: "2024-02-14", startTime: "14:00", endTime: "15:30", room: "Sala 101", turma: "2º Ano Eng. Civil", disciplineId: "pd1", color: "hsl(224, 64%, 33%)" },
  { id: "pe8", title: "Estatística", type: "aula" as const, date: "2024-02-14", startTime: "16:00", endTime: "17:30", room: "Sala 105", turma: "2º Ano Informática", disciplineId: "pd3", color: "hsl(25, 95%, 53%)" },
  { id: "pe9", title: "Matemática I", type: "aula" as const, date: "2024-02-15", startTime: "10:00", endTime: "11:30", room: "Sala 203", turma: "1º Ano Informática", disciplineId: "pd2", color: "hsl(175, 84%, 32%)" },
  { id: "pe10", title: "Matemática II", type: "aula" as const, date: "2024-02-16", startTime: "08:00", endTime: "09:30", room: "Sala 101", turma: "2º Ano Informática", disciplineId: "pd1", color: "hsl(224, 64%, 33%)" },
  { id: "pe11", title: "Estatística", type: "aula" as const, date: "2024-02-16", startTime: "14:00", endTime: "15:30", room: "Sala 105", turma: "2º Ano Informática", disciplineId: "pd3", color: "hsl(25, 95%, 53%)" },
];

// Upcoming events for professor (tests they created)
const profUpcomingEvents = [
  { id: "pue1", title: "Teste 2 - Matemática II", type: "teste" as const, date: "2024-03-25", startTime: "08:00", endTime: "10:00", room: "Sala 101", turma: "2º Ano Informática", disciplineId: "pd1", color: "hsl(0, 84%, 60%)" },
  { id: "pue2", title: "Teste 1 - Matemática I", type: "teste" as const, date: "2024-02-20", startTime: "10:00", endTime: "11:30", room: "Sala 203", turma: "1º Ano Informática", disciplineId: "pd2", color: "hsl(0, 84%, 60%)" },
];

export default function ProfessorCalendar() {
  const [view, setView] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const navigate = useNavigate();

  const allAulas = profCalendarEvents;
  const selectedDayEvents = allAulas.filter(e => e.date === selectedDate);

  const aulasSorted = [...allAulas].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const getLessonNumber = (event: typeof allAulas[0]) => {
    let count = 0;
    for (const e of aulasSorted) {
      if (e.disciplineId === event.disciplineId && e.turma === event.turma) {
        count++;
        if (e.id === event.id) return count;
      }
    }
    return null;
  };

  const totalHeight = (HOURS.length - 1) * HOUR_HEIGHT;
  const selected = [...allAulas, ...profUpcomingEvents].find(e => e.id === selectedEvent);

  const handleReverAula = (event: typeof allAulas[0]) => {
    navigate(`/professor/disciplines/${event.disciplineId}`);
  };

  const handleEntrarAula = (event: typeof allAulas[0]) => {
    navigate(`/professor/class-lobby?eventId=${event.id}`);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const monthDays = Array.from({ length: 29 }, (_, i) => i + 1);
  const monthStartDay = 3;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Quarta-feira, 14 de Fevereiro 2024</p>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
                {view === "week" ? "12 – 16 Fev 2024" : "Fevereiro 2024"}
              </span>
              <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setView("week")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Semana</button>
              <button onClick={() => setView("month")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", view === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Mês</button>
            </div>
          </div>

          {view === "week" ? (
            <Card className="overflow-hidden border">
              <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b">
                <div className="bg-muted/20" />
                {DAYS.map((day, i) => {
                  const dayNum = 12 + i;
                  const dateStr = `2024-02-${dayNum}`;
                  const isTodayCol = isToday(dateStr);
                  const isSelectedDay = selectedDate === dateStr;
                  return (
                    <div key={day} onClick={() => handleDayClick(dateStr)} className={cn("py-3 text-center border-l cursor-pointer transition-colors hover:bg-primary/10", isTodayCol ? "bg-primary/5" : "bg-muted/20", isSelectedDay && !isTodayCol && "bg-primary/10")}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{day}</p>
                      <p className={cn("text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto", isSelectedDay ? "bg-primary text-primary-foreground" : isTodayCol ? "ring-2 ring-primary text-foreground" : "text-foreground")}>{dayNum}</p>
                    </div>
                  );
                })}
              </div>

              <ScrollArea className="h-[560px]">
                <div className="grid grid-cols-[56px_repeat(5,1fr)] relative" style={{ height: totalHeight + 20 }}>
                  <div className="relative bg-muted/5">
                    {HOURS.map((label, i) => (
                      <div key={label} className="absolute w-full text-[11px] text-muted-foreground text-right pr-2 leading-none" style={{ top: i * HOUR_HEIGHT + 10 }}>{label}</div>
                    ))}
                  </div>

                  {DAYS.map((_, dayIndex) => {
                    const dayDate = `2024-02-${12 + dayIndex}`;
                    const dayEvents = allAulas.filter(e => e.date === dayDate);
                    const isTodayCol = isToday(dayDate);
                    const isPast = isPastDate(dayDate);
                    const isSelectedDay = selectedDate === dayDate;

                    return (
                      <div key={dayIndex} onClick={() => handleDayClick(dayDate)} className={cn("border-l relative cursor-pointer", isTodayCol && "bg-primary/[0.02]", isSelectedDay && "bg-primary/[0.04]")}>
                        {HOURS.map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-border/20" style={{ top: i * HOUR_HEIGHT + 10 }} />
                        ))}

                        {dayEvents.map(event => {
                          const startMin = timeToMinutes(event.startTime) - HOUR_START_MIN;
                          const endMin = timeToMinutes(event.endTime) - HOUR_START_MIN;
                          const top = (startMin / 60) * HOUR_HEIGHT + 10;
                          const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                          const past = isPast || (isToday(dayDate) && timeToMinutes(event.endTime) < timeToMinutes("10:45"));
                          const isSelected = selectedEvent === event.id;

                          return (
                            <div key={event.id} onClick={(e) => { e.stopPropagation(); setSelectedEvent(isSelected ? null : event.id); setSelectedDate(dayDate); }}
                              className={cn("absolute left-1 right-1 rounded-lg cursor-pointer transition-all overflow-hidden z-10", past && "opacity-70", isSelected && "ring-2 ring-primary ring-offset-1")}
                              style={{ top: top + 1, height: Math.max(height - 2, 24), backgroundColor: event.color }}
                            >
                              <div className="h-full flex flex-col justify-between px-2 py-1.5">
                                <div>
                                  <p className="text-[10px] font-bold text-white leading-tight truncate">{event.title}</p>
                                  <p className="text-[9px] text-white/80 truncate">{event.startTime} – {event.endTime}</p>
                                  {height > 50 && (
                                    <>
                                      <p className="text-[9px] text-white/70 truncate">{event.room}</p>
                                      <p className="text-[9px] text-white/70 truncate">{event.turma}</p>
                                    </>
                                  )}
                                </div>
                                {height > 60 && (
                                  past ? (
                                    <div className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white bg-white/25 rounded-md px-2 py-1 w-full mt-1" onClick={(e) => { e.stopPropagation(); handleReverAula(event); }}>
                                      <Play className="w-3 h-3" /> Rever
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1 text-[9px] font-semibold text-white bg-white/25 rounded-md px-2 py-1 w-full mt-1" onClick={(e) => { e.stopPropagation(); handleEntrarAula(event); }}>
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
                  <div key={d} className="py-2.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest border-l first:border-l-0 bg-muted/20">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: monthStartDay }, (_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-t border-l first:border-l-0 p-2 bg-muted/5" />
                ))}
                {monthDays.map(day => {
                  const dateStr = `2024-02-${String(day).padStart(2, "0")}`;
                  const dayEvents = allAulas.filter(e => e.date === dateStr);
                  const isWeekend = ((monthStartDay + day - 1) % 7) >= 5;
                  const isTodayDay = dateStr === TODAY_DATE;
                  const isSelectedDay = selectedDate === dateStr;

                  return (
                    <div key={day} onClick={() => handleDayClick(dateStr)} className={cn("min-h-[90px] border-t border-l p-1.5 cursor-pointer hover:bg-primary/5 transition-colors", isWeekend ? "bg-muted/5" : "", isTodayDay ? "bg-primary/5" : "", isSelectedDay && !isTodayDay && "bg-primary/10")}>
                      <p className={cn("text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full", isSelectedDay ? "bg-primary text-primary-foreground" : isTodayDay ? "ring-2 ring-primary text-foreground" : "text-foreground")}>{day}</p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className="text-[9px] px-1.5 py-0.5 rounded truncate font-medium text-white cursor-pointer hover:brightness-110" style={{ backgroundColor: ev.color }} onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev.id); setSelectedDate(dateStr); }}>
                            {ev.startTime} {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <p className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Upcoming events */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Próximos Eventos Importantes</h3>
            <div className="space-y-2">
              {profUpcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border" onClick={() => setSelectedEvent(event.id)}>
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{event.date.split("-").reverse().join("/")} · {event.startTime} – {event.endTime}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 border-destructive/30 text-destructive">Teste</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="w-[300px] shrink-0 space-y-5 hidden lg:block">
          {selected && (
            <Card className="overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: selected.color }} />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="text-[10px] mb-1.5" style={{ backgroundColor: selected.color + "20", color: selected.color, border: "none" }}>
                      {selected.type === "aula" ? "Aula" : "Teste"}
                    </Badge>
                    <h3 className="font-bold text-foreground text-sm">{selected.title}</h3>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="w-3.5 h-3.5" /><span>{selected.date}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>{selected.startTime} – {selected.endTime}</span></div>
                  {selected.room && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /><span>{selected.room}</span></div>}
                  {"turma" in selected && <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3.5 h-3.5" /><span>{selected.turma}</span></div>}
                </div>
                {selected.type === "aula" && "disciplineId" in selected && (
                  <div className="pt-2">
                    {isPastDate(selected.date) || (isToday(selected.date) && timeToMinutes(selected.endTime) < timeToMinutes("10:45")) ? (
                      <Button size="sm" className="w-full gap-2 text-xs" onClick={() => handleReverAula(selected as typeof allAulas[0])}>
                        <Play className="w-3.5 h-3.5" /> Rever Gravação
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full gap-2 text-xs" onClick={() => handleEntrarAula(selected as typeof allAulas[0])}>
                        <Video className="w-3.5 h-3.5" /> Entrar na Aula
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split("T")[0]); setSelectedEvent(null); }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {formatDateLabel(selectedDate)}
            </h3>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split("T")[0]); setSelectedEvent(null); }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => {
              const past = isPastDate(event.date) || (isToday(event.date) && timeToMinutes(event.endTime) < timeToMinutes("10:45"));
              return (
                <Card key={event.id} onClick={() => setSelectedEvent(event.id)} className={cn("overflow-hidden cursor-pointer transition-all hover:shadow-md", selectedEvent === event.id && "ring-1 ring-primary/40 shadow-md")}>
                  <div className="h-1" style={{ backgroundColor: event.color }} />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                        <p className="text-sm font-bold text-foreground truncate">{event.title}</p>
                      </div>
                      {getLessonNumber(event) && (
                        <span className="text-[10px] font-semibold shrink-0 rounded-md px-1.5 py-0.5" style={{ border: `1px solid ${event.color}`, color: event.color }}>
                          Aula {getLessonNumber(event)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 mb-3 pl-4">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Clock className="w-3 h-3 shrink-0" /><span>{event.startTime} – {event.endTime}</span></div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Users className="w-3 h-3 shrink-0" /><span>{event.turma}</span></div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><MapPin className="w-3 h-3 shrink-0" /><span>{event.room}</span></div>
                    </div>
                    {past ? (
                      <Button variant="secondary" size="sm" className="w-full gap-2 text-xs" onClick={e => { e.stopPropagation(); handleReverAula(event); }}>
                        <Play className="w-3.5 h-3.5" /> Rever Gravação
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" className="w-full gap-2 text-xs" onClick={e => { e.stopPropagation(); handleEntrarAula(event); }}>
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
