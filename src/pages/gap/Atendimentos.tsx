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

  // Calendar state
  const today = new Date(TODAY);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calSelectedDay, setCalSelectedDay] = useState<string>(TODAY);

  const filtered = useMemo(() => {
    return gapAtendimentos
      .filter(a => {
        if (view === "calendario") return true; // calendar shows all (filtered by month grid)
        if (filter === "hoje") return a.data === TODAY;
        if (filter === "agendados") return a.estado === "agendado";
        if (filter === "concluidos") return a.estado === "concluido";
        return true;
      })
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      })
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  }, [filter, search, categoria, view]);

  const counts = {
    todos: gapAtendimentos.length,
    hoje: gapAtendimentos.filter(a => a.data === TODAY).length,
    agendados: gapAtendimentos.filter(a => a.estado === "agendado").length,
    concluidos: gapAtendimentos.filter(a => a.estado === "concluido").length,
  };

  const tabs: { key: typeof filter; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: counts.todos },
    { key: "hoje", label: "Hoje", count: counts.hoje },
    { key: "agendados", label: "Agendados", count: counts.agendados },
    { key: "concluidos", label: "Concluídos", count: counts.concluidos },
  ];

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
        <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-border pr-4">
          <p className="text-base font-bold text-foreground tabular-nums leading-none">{a.hora}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{a.duracao}</p>
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-semibold">
            {a.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate text-left"
              >
                {a.estudante}
              </button>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                {a.curso} · {a.ano}º ano
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              <span className="tabular-nums">{a.matricula}</span> · {a.faculdade}
            </p>
            <p className="text-xs text-foreground/80 truncate mt-1">{a.motivo}</p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end justify-center gap-1 shrink-0 min-w-[140px]">
          <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {a.tipo === "online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            <span className="truncate max-w-[120px]">{a.tipo === "online" ? "Online" : (a.sala ?? "Presencial")}</span>
          </div>
        </div>
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
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setView("lista")}
              className={cn("inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-medium transition-all",
                view === "lista" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setView("calendario")}
              className={cn("inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-medium transition-all",
                view === "calendario" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Calendário
            </button>
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

      {/* Control box (only in lista view) */}
      {view === "lista" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border-b border-border">
            {tabs.map(t => {
              const active = filter === t.key;
              return (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all",
                    active ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}>
                  {t.label}
                  <span className={cn(
                    "ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold tabular-nums",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>{t.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 items-center p-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar estudante, motivo, matrícula..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="flex-1" />
            <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
              <SelectTrigger className={cn("w-[180px] h-9 text-xs", categoria !== "todas" && "border-primary/50 bg-primary/5 text-primary")}>
                <Filter className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                  <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || categoria !== "todas") && (
              <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-destructive gap-1" onClick={() => { setSearch(""); setCategoria("todas"); }}>
                <X className="w-3.5 h-3.5" /> Limpar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── LISTA VIEW ─────────────────────────────────────────────────────── */}
      {view === "lista" && (
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <Card className="p-10 text-center"><p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p></Card>
          ) : (
            Object.entries(
              filtered.reduce<Record<string, GapAtendimento[]>>((acc, a) => {
                (acc[a.data] = acc[a.data] || []).push(a);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([dateKey, items]) => {
                const d = new Date(dateKey);
                const isToday = dateKey === TODAY;
                const weekday = d.toLocaleDateString("pt-AO", { weekday: "long" });
                const dayLabel = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" });
                return (
                  <div key={dateKey} className="space-y-2">
                    <div className="flex items-center gap-3 px-1">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 border",
                        isToday ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-foreground border-border"
                      )}>
                        <span className="text-sm font-bold tabular-nums">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground capitalize leading-tight">
                          {isToday ? "Hoje" : weekday}
                        </p>
                        <p className="text-[11px] text-muted-foreground capitalize">{dayLabel}</p>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[11px] text-muted-foreground tabular-nums">{items.length} {items.length === 1 ? "sessão" : "sessões"}</span>
                    </div>
                    <Card className="divide-y divide-border overflow-hidden">
                      {items.sort((a, b) => a.hora.localeCompare(b.hora)).map(renderSessionRow)}
                    </Card>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ── CALENDÁRIO VIEW ────────────────────────────────────────────────── */}
      {view === "calendario" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Month grid */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Cal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={goPrevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                  <p className="text-sm font-semibold text-foreground capitalize min-w-[140px] text-center">
                    {MONTHS[calMonth]} {calYear}
                  </p>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={goNextMonth}><ChevronRight className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>Hoje</Button>
                  <div className="relative w-[200px]">
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
                      onClick={() => setCalSelectedDay(cell.dateKey)}
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

          {/* Day detail panel */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                {calSelectedDay ? (() => {
                  const d = new Date(calSelectedDay);
                  const isToday = calSelectedDay === TODAY;
                  return (
                    <>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {isToday ? "Hoje" : d.toLocaleDateString("pt-AO", { weekday: "long" })}
                      </p>
                      <p className="text-sm font-semibold text-foreground capitalize mt-0.5">
                        {d.toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                        {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "sessão agendada" : "sessões agendadas"}
                      </p>
                    </>
                  );
                })() : <p className="text-xs text-muted-foreground">Seleccione um dia</p>}
              </div>
              <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
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
                        className="p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col items-center justify-center min-w-[44px] py-1 px-1.5 rounded bg-muted/50">
                            <p className="text-xs font-bold text-foreground tabular-nums leading-none">{a.hora}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{a.duracao}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                              className="text-xs font-semibold text-foreground hover:text-primary hover:underline truncate text-left block w-full"
                            >
                              {a.estudante}
                            </button>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{a.curso} · {a.ano}º ano</p>
                            <p className="text-[11px] text-foreground/80 line-clamp-2 mt-1">{a.motivo}</p>
                            <div className="flex items-center gap-1 flex-wrap mt-1.5">
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", cat.color)}>{cat.label}</Badge>
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 gap-1", est.color)}>
                                <span className={cn("w-1 h-1 rounded-full", est.dot)} />
                                {est.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const cat = categoriaConfig[selected.categoria];
            const est = estadoConfig[selected.estado];
            const d = new Date(selected.data);
            return (
              <>
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{selected.id}</span>
                    <Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge>
                    <Badge variant="outline" className={cn("text-[10px] gap-1", est.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} /> {est.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {selected.tipo === "online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {selected.tipo === "online" ? "Online" : "Presencial"}
                    </Badge>
                  </div>
                  <DialogTitle className="text-lg leading-tight">{selected.motivo}</DialogTitle>
                </div>

                <div className="p-6 space-y-5">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-muted/20 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => { setSelected(null); navigate(`/gap/estudantes/${selected.matricula}`); }}
                          className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate text-left block"
                        >
                          {selected.estudante}
                        </button>
                        <p className="text-[11px] text-muted-foreground truncate">{selected.matricula} · {selected.curso} · {selected.faculdade}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3" /> Data
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">{d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{d.toLocaleDateString("pt-AO", { weekday: "long" })}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Hora
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">{selected.hora}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Duração</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{selected.duracao}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-border">
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> Local
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">{selected.sala ?? "—"}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Responsável</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {selected.responsavel.split(" ").slice(-2).map(n => n[0]).join("")}
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{selected.responsavel}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selected.notas && (
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                        <FileText className="w-3 h-3" /> Notas da sessão
                      </Label>
                      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-foreground leading-relaxed border-l-2 border-l-primary/40">
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
