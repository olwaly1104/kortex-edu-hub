import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Calendar as CalendarIcon, Clock, MapPin, Video, Search, FileText,
  CheckCircle2, X, Filter, User, ChevronLeft, ChevronRight, ArrowRight,
  LayoutGrid, List as ListIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig, TicketCategoria, GapAtendimento } from "@/data/gapData";

const estadoConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado:  { label: "Agendado",  color: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
  concluido: { label: "Concluído", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
  remarcar:  { label: "Remarcar",  color: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
};

const TODAY = "2025-12-16";
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function GapAtendimentos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<"todas" | TicketCategoria>("todas");
  const [selected, setSelected] = useState<GapAtendimento | null>(null);
  const [view, setView] = useState<"lista" | "calendario">("lista");
  const [periodo, setPeriodo] = useState<"todos" | "proximos" | "anteriores">("todos");

  // Calendar state
  const today = new Date(TODAY);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calSelectedDay, setCalSelectedDay] = useState<string>(TODAY);

  const filteredAll = useMemo(() => {
    return gapAtendimentos
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      });
  }, [search, categoria]);

  const counts = {
    todos: gapAtendimentos.length,
    hoje: gapAtendimentos.filter(a => a.data === TODAY).length,
    agendados: gapAtendimentos.filter(a => a.estado === "agendado").length,
    concluidos: gapAtendimentos.filter(a => a.estado === "concluido").length,
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: { dateKey: string | null; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ dateKey: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push({ dateKey: `${calYear}-${mm}-${dd}`, day: d });
    }
    while (cells.length % 7 !== 0) cells.push({ dateKey: null, day: null });
    return cells;
  }, [calMonth, calYear]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, GapAtendimento[]>();
    gapAtendimentos
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      })
      .forEach(a => {
        if (!map.has(a.data)) map.set(a.data, []);
        map.get(a.data)!.push(a);
      });
    map.forEach(arr => arr.sort((a, b) => a.hora.localeCompare(b.hora)));
    return map;
  }, [categoria, search]);

  const selectedDayEvents = calSelectedDay ? (eventsByDate.get(calSelectedDay) ?? []) : [];

  const goPrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1);
  };
  const goToday = () => {
    setCalMonth(today.getMonth()); setCalYear(today.getFullYear()); setCalSelectedDay(TODAY);
  };

  const renderSessionRow = (a: GapAtendimento) => {
    const cat = categoriaConfig[a.categoria];
    const est = estadoConfig[a.estado];
    return (
      <div
        key={a.id}
        onClick={() => setSelected(a)}
        className="group flex items-stretch gap-4 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        {/* Time block */}
        <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-border pr-3">
          <p className="text-sm font-bold text-foreground tabular-nums leading-none">{a.hora}</p>
          <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">{a.duracao}</p>
        </div>

        {/* Main: title + student */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className={cn("w-1 self-stretch rounded-full shrink-0", est.dot)} />
          <div className="min-w-0 flex-1">
            {/* Title = motivo */}
            <p className="text-sm font-semibold text-foreground truncate">{a.motivo}</p>
            {/* Student line */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
              <User className="w-3 h-3 shrink-0" />
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                className="font-medium text-foreground/80 hover:text-primary hover:underline truncate"
              >
                {a.estudante}
              </button>
              <span>·</span>
              <span className="tabular-nums">{a.matricula}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline truncate">{a.curso} · {a.ano}º ano</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="hidden md:flex items-center shrink-0">
          <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
        </div>

        {/* Location */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 min-w-[110px] text-[11px] text-muted-foreground">
          {a.tipo === "online"
            ? <Video className="w-3.5 h-3.5 text-blue-600" />
            : <MapPin className="w-3.5 h-3.5 text-foreground/60" />}
          <span className="truncate">{a.tipo === "online" ? "Online" : (a.sala ?? "Presencial")}</span>
        </div>

        {/* Status */}
        <div className="flex items-center shrink-0">
          <Badge variant="outline" className={cn("text-[10px] gap-1", est.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
            {est.label}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sessões de apoio individual marcadas pelo GAP — psicológico, académico, vocacional e social.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2"><Label>Estudante</Label><Input placeholder="Nome ou matrícula" /></div>
              <div className="space-y-2"><Label>Motivo</Label><Textarea placeholder="Descreva o motivo..." className="resize-none" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                        <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Data</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Hora</Label><Input type="time" /></div>
                <div className="space-y-2"><Label>Duração</Label><Input placeholder="50 min" /></div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helena">Dra. Helena Cabral</SelectItem>
                    <SelectItem value="joao">Dr. João Tavares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <DialogClose asChild><Button>Agendar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.todos, icon: CalendarIcon, iconBg: "bg-muted text-muted-foreground" },
          { label: "Hoje", value: counts.hoje, icon: Clock, iconBg: "bg-primary/10 text-primary" },
          { label: "Agendados", value: counts.agendados, icon: CalendarIcon, iconBg: "bg-blue-50 text-blue-600" },
          { label: "Concluídos", value: counts.concluidos, icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center bg-muted/50 border border-border rounded-lg p-0.5">
          <button
            onClick={() => setView("lista")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-colors",
              view === "lista" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListIcon className="w-3.5 h-3.5" /> Lista
          </button>
          <button
            onClick={() => setView("calendario")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-colors",
              view === "calendario" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Calendário
          </button>
        </div>
        {view === "lista" && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period chips */}
            <div className="inline-flex items-center bg-muted/40 border border-border rounded-lg p-0.5">
              {([
                { v: "todos", label: "Todos" },
                { v: "proximos", label: "Próximos" },
                { v: "anteriores", label: "Anteriores" },
              ] as const).map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setPeriodo(opt.v)}
                  className={cn(
                    "px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors",
                    periodo === opt.v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="relative w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
              <SelectTrigger className={cn("w-[160px] h-8 text-xs", categoria !== "todas" && "border-primary/50 bg-primary/5 text-primary")}>
                <Filter className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas categorias</SelectItem>
                {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                  <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {view === "lista" ? (
        (() => {
          // Filter by period
          const periodFiltered = filteredAll.filter(a => {
            if (periodo === "todos") return true;
            if (periodo === "proximos") return a.data >= TODAY;
            return a.data < TODAY;
          });

          // Group by date
          const byDate = new Map<string, GapAtendimento[]>();
          periodFiltered.forEach(a => {
            if (!byDate.has(a.data)) byDate.set(a.data, []);
            byDate.get(a.data)!.push(a);
          });
          byDate.forEach(arr => arr.sort((a, b) => a.hora.localeCompare(b.hora)));

          // Bucket: hoje, proximos (asc), anteriores (desc — most recent past first)
          const todayDates = Array.from(byDate.keys()).filter(k => k === TODAY);
          const futureDates = Array.from(byDate.keys()).filter(k => k > TODAY).sort();
          const pastDates = Array.from(byDate.keys()).filter(k => k < TODAY).sort((a, b) => b.localeCompare(a));

          const sections: { id: string; label: string; sub: string; dates: string[] }[] = [];
          if (todayDates.length) sections.push({ id: "hoje", label: "Hoje", sub: "Sessões de hoje", dates: todayDates });
          if (futureDates.length) sections.push({ id: "prox", label: "Próximos", sub: `${futureDates.reduce((n, k) => n + byDate.get(k)!.length, 0)} sessões agendadas`, dates: futureDates });
          if (pastDates.length) sections.push({ id: "ant", label: "Anteriores", sub: `${pastDates.reduce((n, k) => n + byDate.get(k)!.length, 0)} sessões realizadas`, dates: pastDates });

          if (sections.length === 0) {
            return (
              <Card className="p-12 text-center">
                <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
              </Card>
            );
          }
          return (
            <div className="space-y-6">
              {sections.map(section => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2 px-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">{section.label}</h3>
                      <span className="text-[11px] text-muted-foreground">· {section.sub}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {section.dates.map(dateKey => {
                      const d = new Date(dateKey);
                      const isToday = dateKey === TODAY;
                      const isPast = dateKey < TODAY;
                      const events = byDate.get(dateKey)!;
                      return (
                        <Card key={dateKey} className={cn("overflow-hidden", isPast && "opacity-95")}>
                          <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border",
                                isToday ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                              )}>
                                <span className="text-xs font-bold tabular-nums">{d.getDate()}</span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground capitalize leading-tight">
                                  {isToday ? "Hoje · " : ""}{d.toLocaleDateString("pt-AO", { weekday: "long" })}
                                </p>
                                <p className="text-[10px] text-muted-foreground capitalize">
                                  {d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                              {events.length} {events.length === 1 ? "sessão" : "sessões"}
                            </span>
                          </div>
                          <div className="divide-y divide-border">
                            {events.map(renderSessionRow)}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      ) : (
      /* ── Calendar + Side panel ───────────────────────────────────────────── */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Month grid */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Cal header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/20 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={goPrevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                <p className="text-sm font-semibold text-foreground capitalize min-w-[140px] text-center">
                  {MONTHS[calMonth]} {calYear}
                </p>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={goNextMonth}><ChevronRight className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" className="h-8 text-xs ml-1" onClick={goToday}>Hoje</Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
                <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
                  <SelectTrigger className={cn("w-[140px] h-8 text-xs", categoria !== "todas" && "border-primary/50 bg-primary/5 text-primary")}>
                    <Filter className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas categorias</SelectItem>
                    {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                      <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/10">
              {WEEKDAYS.map(w => (
                <div key={w} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center py-2">{w}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((cell, i) => {
                if (!cell.dateKey) return <div key={i} className="aspect-square border-r border-b border-border bg-muted/5 last:border-r-0" />;
                const events = eventsByDate.get(cell.dateKey) ?? [];
                const isToday = cell.dateKey === TODAY;
                const isSelected = cell.dateKey === calSelectedDay;
                return (
                  <button
                    key={i}
                    onClick={() => setCalSelectedDay(cell.dateKey!)}
                    className={cn(
                      "aspect-square border-r border-b border-border p-1.5 text-left transition-colors hover:bg-muted/30 flex flex-col gap-1 last:border-r-0",
                      isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "inline-flex items-center justify-center text-[11px] font-semibold tabular-nums",
                        isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5" : "text-foreground"
                      )}>{cell.day}</span>
                      {events.length > 0 && (
                        <span className="text-[9px] font-semibold text-muted-foreground tabular-nums">{events.length}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                      {events.slice(0, 2).map(ev => {
                        const cat = categoriaConfig[ev.categoria];
                        return (
                          <div key={ev.id} className={cn("text-[9px] font-medium truncate px-1 py-0.5 rounded border", cat.color)}>
                            {ev.hora} {ev.estudante.split(" ")[0]}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <span className="text-[9px] text-muted-foreground px-1">+{events.length - 2} mais</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side panel — agendamentos do dia */}
        <div className="lg:col-span-1">
          {(() => {
            const d = new Date(calSelectedDay);
            const isToday = calSelectedDay === TODAY;
            const dayLabel = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" });
            const titleSuffix = isToday ? "Hoje" : dayLabel;
            return (
              <div className="space-y-3 sticky top-4">
                {/* Section title above panel */}
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h2 className="text-base font-bold text-foreground tracking-tight">Agendamentos</h2>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className={cn("text-sm font-semibold capitalize truncate", isToday ? "text-primary" : "text-foreground")}>{titleSuffix}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "sessão" : "sessões"}
                  </span>
                </div>

                <Card className="overflow-hidden">
                  {/* Panel sub-header with weekday */}
                  <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 border",
                        isToday ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                      )}>
                        <span className="text-xs font-bold tabular-nums">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground capitalize leading-tight">
                          {d.toLocaleDateString("pt-AO", { weekday: "long" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event list */}
                  <div className="divide-y divide-border max-h-[560px] overflow-y-auto">
                    {selectedDayEvents.length === 0 ? (
                      <div className="p-8 text-center">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Nenhuma sessão neste dia</p>
                      </div>
                    ) : (
                      selectedDayEvents.map(a => {
                        const cat = categoriaConfig[a.categoria];
                        const est = estadoConfig[a.estado];
                        return (
                          <div
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className="group p-3 hover:bg-muted/30 cursor-pointer transition-colors relative"
                          >
                            {/* Top: time + status */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 text-foreground">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-bold tabular-nums">{a.hora}</span>
                                <span className="text-[10px] text-muted-foreground">· {a.duracao}</span>
                              </div>
                              <Badge variant="outline" className={cn("text-[9px] gap-1 px-1.5 py-0", est.color)}>
                                <span className={cn("w-1 h-1 rounded-full", est.dot)} />
                                {est.label}
                              </Badge>
                            </div>

                            {/* Student row */}
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[11px] font-semibold">
                                {a.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                                  className="text-xs font-semibold text-foreground hover:text-primary hover:underline truncate text-left block w-full"
                                >
                                  {a.estudante}
                                </button>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  <span className="tabular-nums">{a.matricula}</span> · {a.curso} · {a.ano}º ano
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">{a.faculdade}</p>
                              </div>
                            </div>

                            {/* Motivo */}
                            <p className="text-[11px] text-foreground/80 line-clamp-2 mt-2 pl-[46px]">{a.motivo}</p>

                            {/* Footer: category + location */}
                            <div className="flex items-center justify-between gap-2 mt-2 pl-[46px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", cat.color)}>{cat.label}</Badge>
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  {a.tipo === "online" ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                  <span className="truncate max-w-[100px]">{a.tipo === "online" ? "Online" : (a.sala ?? "Presencial")}</span>
                                </span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>
            );
          })()}
        </div>
      </div>
      )}

      {/* Detail dialog — redesigned */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const cat = categoriaConfig[selected.categoria];
            const est = estadoConfig[selected.estado];
            const d = new Date(selected.data);
            return (
              <>
                {/* Hero header — color-coordinated by category */}
                <div className={cn("px-6 pt-6 pb-5 border-b border-border relative", cat.color.replace(/text-\S+/g, "").replace(/border-\S+/g, ""))}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold", cat.color)}>{cat.label}</Badge>
                      <Badge variant="outline" className={cn("text-[10px] gap-1", est.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                        {est.label}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">#{selected.id.replace(/^AT-?/i, "")}</span>
                    </div>
                  </div>
                  <DialogTitle className="text-xl font-bold leading-tight tracking-tight pr-8">
                    {selected.motivo}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1.5 capitalize">
                    {d.toLocaleDateString("pt-AO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {selected.hora} · {selected.duracao}
                  </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Student card */}
                  <button
                    onClick={() => { setSelected(null); navigate(`/gap/estudantes/${selected.matricula}`); }}
                    className="w-full text-left rounded-xl border border-border hover:border-primary/40 hover:bg-muted/20 transition-colors p-4 flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                      {selected.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary truncate">{selected.estudante}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        <span className="tabular-nums">{selected.matricula}</span> · {selected.curso} · {selected.ano}º ano
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{selected.faculdade}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Info grid — 4 cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                        <CalendarIcon className="w-3 h-3" /> Data
                      </div>
                      <p className="text-sm font-bold text-foreground tabular-nums">{d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{d.toLocaleDateString("pt-AO", { weekday: "short" })}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                        <Clock className="w-3 h-3" /> Hora
                      </div>
                      <p className="text-sm font-bold text-foreground tabular-nums">{selected.hora}</p>
                      <p className="text-[10px] text-muted-foreground">{selected.duracao}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                        {selected.tipo === "online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        Local
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">{selected.tipo === "online" ? "Online" : (selected.sala ?? "Presencial")}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{selected.tipo}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                        <User className="w-3 h-3" /> Responsável
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">{selected.responsavel.split(" ").slice(-2).join(" ")}</p>
                      <p className="text-[10px] text-muted-foreground">GAP</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selected.notas && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                        <FileText className="w-3 h-3" /> Notas da sessão
                      </div>
                      <div className="rounded-xl border border-border bg-muted/10 p-4 text-sm text-foreground leading-relaxed border-l-2 border-l-primary">
                        {selected.notas}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 gap-2">
                  {selected.estado === "agendado" && (
                    <>
                      <Button variant="outline" size="sm" className="gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Remarcar</Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"><X className="w-3.5 h-3.5" /> Cancelar</Button>
                      <Button size="sm" className="gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Marcar concluído</Button>
                    </>
                  )}
                  <DialogClose asChild><Button variant="outline" size="sm">Fechar</Button></DialogClose>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
