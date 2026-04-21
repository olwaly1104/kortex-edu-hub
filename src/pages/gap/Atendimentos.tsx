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
  CheckCircle2, X, Filter, User, ArrowRight, ChevronLeft, ChevronRight,
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
  const [estado, setEstado] = useState<"todos" | keyof typeof estadoConfig>("todos");
  const [periodo, setPeriodo] = useState<"todos" | "hoje" | "agendado" | "concluido">("todos");
  const [view, setView] = useState<"tabela" | "calendario">("tabela");
  const [selected, setSelected] = useState<GapAtendimento | null>(null);

  // Calendar state
  const today = new Date(TODAY);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calSelectedDay, setCalSelectedDay] = useState<string>(TODAY);

  const counts = {
    todos: gapAtendimentos.length,
    hoje: gapAtendimentos.filter(a => a.data === TODAY).length,
    agendados: gapAtendimentos.filter(a => a.estado === "agendado").length,
    concluidos: gapAtendimentos.filter(a => a.estado === "concluido").length,
  };

  const rows = useMemo(() => {
    return gapAtendimentos
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => estado === "todos" || a.estado === estado)
      .filter(a => {
        if (periodo === "todos") return true;
        if (periodo === "hoje") return a.data === TODAY;
        if (periodo === "proximos") return a.data > TODAY;
        return a.data < TODAY;
      })
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      })
      .sort((a, b) => {
        // Upcoming asc (future first by date asc), past desc — overall: future asc, then past desc
        const aFuture = a.data >= TODAY;
        const bFuture = b.data >= TODAY;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        if (aFuture) {
          if (a.data !== b.data) return a.data.localeCompare(b.data);
          return a.hora.localeCompare(b.hora);
        }
        if (a.data !== b.data) return b.data.localeCompare(a.data);
        return a.hora.localeCompare(b.hora);
      });
  }, [search, categoria, estado, periodo]);

  // Calendar helpers — calendar respects search + category + estado filters (NOT periodo)
  const calendarFiltered = useMemo(() => {
    return gapAtendimentos
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => estado === "todos" || a.estado === estado)
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      });
  }, [search, categoria, estado]);

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
    calendarFiltered.forEach(a => {
      if (!map.has(a.data)) map.set(a.data, []);
      map.get(a.data)!.push(a);
    });
    map.forEach(arr => arr.sort((a, b) => a.hora.localeCompare(b.hora)));
    return map;
  }, [calendarFiltered]);

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

      {/* Controls — clean solid outline */}
      <Card className="p-3 space-y-2.5">
        {/* Line 1: Hoje (pinned) + period segment + view toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPeriodo("hoje")}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md border transition-colors",
                periodo === "hoje"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:border-primary hover:text-primary"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Hoje
              <span className={cn(
                "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-bold tabular-nums",
                periodo === "hoje" ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
              )}>{counts.hoje}</span>
            </button>

            <div className="h-6 w-px bg-border" />

            <div className="inline-flex items-center rounded-md border border-input bg-background overflow-hidden">
              {([
                { v: "todos", label: "Todos", count: counts.todos },
                { v: "proximos", label: "Próximos", count: gapAtendimentos.filter(a => a.data > TODAY).length },
                { v: "anteriores", label: "Anteriores", count: gapAtendimentos.filter(a => a.data < TODAY).length },
              ] as const).map((opt, i) => (
                <button
                  key={opt.v}
                  onClick={() => setPeriodo(opt.v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium transition-colors",
                    i > 0 && "border-l border-input",
                    periodo === opt.v
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {opt.label}
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-semibold tabular-nums",
                    periodo === opt.v ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
                  )}>{opt.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* View toggle — solid outline */}
          <div className="inline-flex items-center rounded-md border border-input bg-background overflow-hidden">
            <button
              onClick={() => setView("tabela")}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium transition-colors",
                view === "tabela" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <ListIcon className="w-3.5 h-3.5" /> Tabela
            </button>
            <button
              onClick={() => setView("calendario")}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium border-l border-input transition-colors",
                view === "calendario" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Calendário
            </button>
          </div>
        </div>

        {/* Line 2: Search + filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar estudante, matrícula ou motivo…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
            <SelectTrigger className={cn(
              "w-[180px] h-9 text-xs",
              categoria !== "todas" && "border-primary text-primary"
            )}>
              <Filter className="w-3 h-3 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={estado} onValueChange={v => setEstado(v as typeof estado)}>
            <SelectTrigger className={cn(
              "w-[160px] h-9 text-xs",
              estado !== "todos" && "border-primary text-primary"
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {Object.entries(estadoConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(categoria !== "todas" || estado !== "todos" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategoria("todas"); setEstado("todos"); setSearch(""); }}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {rows.length} de {counts.todos}
          </div>
        </div>
      </Card>

      {view === "tabela" ? (
      /* Table view — clean professional */
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-semibold px-4 py-2.5 w-[120px]">Data / Hora</th>
                  <th className="text-left font-semibold px-4 py-2.5 w-[200px]">Estudante</th>
                  <th className="text-left font-semibold px-4 py-2.5">Motivo</th>
                  <th className="text-left font-semibold px-4 py-2.5 w-[140px]">Categoria</th>
                  <th className="text-left font-semibold px-4 py-2.5 w-[140px]">Local</th>
                  <th className="text-left font-semibold px-4 py-2.5 w-[120px]">Estado</th>
                  <th className="w-8 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(a => {
                  const cat = categoriaConfig[a.categoria];
                  const est = estadoConfig[a.estado];
                  const d = new Date(a.data);
                  const isToday = a.data === TODAY;
                  const isPast = a.data < TODAY;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelected(a)}
                      className={cn(
                        "group border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer",
                        isPast && "opacity-75",
                        isToday && "bg-primary/[0.03]"
                      )}
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-sm font-bold tabular-nums",
                            isToday ? "text-primary" : "text-foreground"
                          )}>
                            {d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" }).replace(".", "")}
                          </span>
                          {isToday && (
                            <span className="inline-flex items-center px-1.5 h-4 rounded text-[9px] font-bold bg-primary text-primary-foreground">HOJE</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                          {a.hora} · {a.duracao}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-middle min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                          className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate text-left block max-w-full"
                        >
                          {a.estudante}
                        </button>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          <span className="tabular-nums">{a.matricula}</span> · {a.curso}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <p className="text-sm text-foreground/90 line-clamp-2 leading-snug" title={a.motivo}>
                          {a.motivo}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <Badge variant="outline" className={cn("text-[10px] h-5", cat.color)}>{cat.label}</Badge>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="inline-flex items-center gap-1.5 text-[12px] text-foreground/80 min-w-0 max-w-full">
                          {a.tipo === "online"
                            ? <Video className="w-3.5 h-3.5 text-primary shrink-0" />
                            : <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                          <span className="truncate">{a.tipo === "online" ? "Online" : (a.sala ?? "Presencial")}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", est.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", est.dot)} />
                          {est.label}
                        </Badge>
                      </td>

                      <td className="px-2 py-3 align-middle text-right">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      ) : (
      /* Calendar view */
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
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {calendarFiltered.length} {calendarFiltered.length === 1 ? "agendamento" : "agendamentos"}
              </span>
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
            return (
              <div className="space-y-3 sticky top-4">
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h2 className="text-base font-bold text-foreground tracking-tight">Agendamentos</h2>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className={cn("text-sm font-semibold capitalize truncate", isToday ? "text-primary" : "text-foreground")}>
                      {isToday ? "Hoje" : dayLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "sessão" : "sessões"}
                  </span>
                </div>

                <Card className="overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
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
                            className="group p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-bold tabular-nums text-foreground">{a.hora}</span>
                                <span className="text-[10px] text-muted-foreground">· {a.duracao}</span>
                              </div>
                              <Badge variant="outline" className={cn("text-[9px] gap-1 px-1.5 py-0", est.color)}>
                                <span className={cn("w-1 h-1 rounded-full", est.dot)} />
                                {est.label}
                              </Badge>
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate">{a.motivo}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${a.matricula}`); }}
                              className="text-[11px] text-muted-foreground hover:text-primary hover:underline truncate text-left block w-full mt-0.5"
                            >
                              {a.estudante} · <span className="tabular-nums">{a.matricula}</span>
                            </button>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", cat.color)}>{cat.label}</Badge>
                              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                {a.tipo === "online" ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                <span className="truncate max-w-[120px]">{a.tipo === "online" ? "Online" : (a.sala ?? "Presencial")}</span>
                              </span>
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

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const cat = categoriaConfig[selected.categoria];
            const est = estadoConfig[selected.estado];
            const d = new Date(selected.data);
            return (
              <>
                <div className="px-6 pt-6 pb-5 border-b border-border">
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

                <div className="p-6 space-y-5">
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
