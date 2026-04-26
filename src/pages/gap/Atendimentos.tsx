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

// Parses "50 min", "1h", "1h 30min", "90 min" into minutes
function parseDuracaoMin(d: string): number {
  if (!d) return 0;
  const s = d.toLowerCase().replace(/\s+/g, "");
  let total = 0;
  const h = s.match(/(\d+)h/);
  if (h) total += parseInt(h[1], 10) * 60;
  const m = s.match(/(\d+)(?:min|m)(?!s)/);
  if (m) total += parseInt(m[1], 10);
  if (!h && !m) {
    const n = s.match(/(\d+)/);
    if (n) total = parseInt(n[1], 10);
  }
  return total;
}

function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor((total % (24 * 60)) / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function GapAtendimentos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<"todas" | TicketCategoria>("todas");
  const [motivoFilter, setMotivoFilter] = useState<string>("todos");

  const motivosUnicos = useMemo(
    () => Array.from(new Set(gapAtendimentos.map(a => a.motivo))).sort((a, b) => a.localeCompare(b)),
    []
  );
  
  const [periodo, setPeriodo] = useState<"todos" | "hoje" | "agendado" | "concluido">("todos");
  const [view, setView] = useState<"tabela" | "calendario">("tabela");
  

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
      .filter(a => motivoFilter === "todos" || a.motivo === motivoFilter)
      .filter(a => a.estado !== "cancelado")
      .filter(a => {
        if (periodo === "todos") return true;
        if (periodo === "hoje") return a.data === TODAY;
        if (periodo === "agendado") return a.estado === "agendado";
        return a.estado === "concluido";
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
  }, [search, categoria, motivoFilter, periodo]);

  // Calendar helpers — calendar respects search + category + estado filters (NOT periodo)
  const calendarFiltered = useMemo(() => {
    return gapAtendimentos
      .filter(a => categoria === "todas" || a.categoria === categoria)
      .filter(a => motivoFilter === "todos" || a.motivo === motivoFilter)
      .filter(a => a.estado !== "cancelado")
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      });
  }, [search, categoria, motivoFilter]);

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
        <NovoAgendamentoDialog />
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
                { v: "agendado", label: "Próximos", count: counts.agendados },
                { v: "concluido", label: "Anteriores", count: counts.concluidos },
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

          <Select value={motivoFilter} onValueChange={setMotivoFilter}>
            <SelectTrigger className={cn(
              "w-[220px] h-9 text-xs",
              motivoFilter !== "todos" && "border-primary text-primary"
            )}>
              <FileText className="w-3 h-3 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              <SelectItem value="todos">Todos os motivos</SelectItem>
              {motivosUnicos.map(m => (
                <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(categoria !== "todas" || motivoFilter !== "todos" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategoria("todas"); setMotivoFilter("todos"); setSearch(""); }}
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
                      onClick={() => navigate(`/gap/agendamentos/${a.id}`)}
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
                        <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5 whitespace-nowrap">
                          {a.hora} – {addMinutesToHHMM(a.hora, parseDuracaoMin(a.duracao))}
                          <span className="text-muted-foreground/60"> · {a.duracao}</span>
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
                            onClick={() => navigate(`/gap/agendamentos/${a.id}`)}
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

    </div>
  );
}

/* ───────────────── Novo Agendamento Dialog ───────────────── */

const RESPONSAVEIS = [
  { id: "helena", nome: "Dra. Helena Cabral", role: "Psicóloga", initials: "HC" },
  { id: "joao",   nome: "Dr. João Tavares",   role: "Tutor académico", initials: "JT" },
  { id: "marta",  nome: "Dra. Marta Lopes",   role: "Orient. vocacional", initials: "ML" },
];

const DURACOES = [
  { v: "30 min", label: "30m" },
  { v: "50 min", label: "50m" },
  { v: "1h",     label: "1h" },
  { v: "1h 30min", label: "1h30" },
];

const HORAS_SUGERIDAS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const CATEGORIA_HINT: Record<TicketCategoria, string> = {
  academico:    "Métodos de estudo, desempenho.",
  psicologico:  "Bem-estar, ansiedade, motivação.",
  financeiro:   "Apoio financeiro, propinas.",
  documentacao: "Documentos e certificados.",
  social:       "Apoio social e familiar.",
  carreira:     "Vocação e percurso profissional.",
  saude:        "Saúde e bem-estar físico.",
};

function NovoAgendamentoDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<GapAtendimento | null>(null);
  const [categoria, setCategoria] = useState<TicketCategoria | null>(null);
  const [responsavel, setResponsavel] = useState<string>("helena");
  const [motivo, setMotivo] = useState("");
  const [data, setData] = useState(TODAY);
  const [hora, setHora] = useState("09:00");
  const [duracao, setDuracao] = useState("50 min");
  const [modalidade, setModalidade] = useState<"presencial" | "online">("presencial");
  const [sala, setSala] = useState("Gab. GAP 1");

  // Build a quick student list from existing atendimentos (unique by matrícula)
  const studentOptions = useMemo(() => {
    const map = new Map<string, GapAtendimento>();
    gapAtendimentos.forEach(a => { if (!map.has(a.matricula)) map.set(a.matricula, a); });
    const arr = Array.from(map.values());
    if (!studentQuery.trim()) return arr.slice(0, 6);
    const q = studentQuery.toLowerCase();
    return arr.filter(s =>
      s.estudante.toLowerCase().includes(q) || s.matricula.includes(studentQuery)
    ).slice(0, 8);
  }, [studentQuery]);

  const reset = () => {
    setStep(1);
    setStudentQuery(""); setSelectedStudent(null); setCategoria(null);
    setResponsavel("helena"); setMotivo("");
    setData(TODAY); setHora("09:00"); setDuracao("50 min");
    setModalidade("presencial"); setSala("Gab. GAP 1");
  };

  const onOpenChange = (o: boolean) => { setOpen(o); if (!o) setTimeout(reset, 200); };

  const endTime = useMemo(() => addMinutesToHHMM(hora, parseDuracaoMin(duracao)), [hora, duracao]);
  const dateObj = useMemo(() => new Date(data), [data]);
  const fmtDate = (d: Date) => d.toLocaleDateString("pt-AO", { weekday: "short", day: "2-digit", month: "short" });

  const canConfirm = !!selectedStudent && !!categoria && motivo.trim().length > 2;
  const resp = RESPONSAVEIS.find(r => r.id === responsavel)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Agendamento</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-border">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight">Novo Agendamento</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step === 1 ? "Passo 1 — Estudante e contexto" : "Passo 2 — Quando e onde"}
                </p>
              </div>
            </div>
            {/* Stepper */}
            <div className="flex items-center gap-2 shrink-0">
              <StepDot active={step === 1} done={step > 1} n={1} label="Contexto" />
              <div className="w-8 h-px bg-border" />
              <StepDot active={step === 2} done={false} n={2} label="Sessão" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              {/* Estudante */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Estudante
                </Label>
                {selectedStudent ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm ring-1 ring-primary/15">
                      {selectedStudent.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{selectedStudent.estudante}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedStudent.matricula} · {selectedStudent.curso} · {selectedStudent.ano}º ano
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs"
                      onClick={() => { setSelectedStudent(null); setStudentQuery(""); }}>
                      Alterar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        autoFocus
                        placeholder="Pesquisar por nome ou matrícula…"
                        value={studentQuery}
                        onChange={e => setStudentQuery(e.target.value)}
                        className="pl-9 h-10"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-1 max-h-44 overflow-y-auto rounded-lg border border-border bg-card">
                      {studentOptions.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-3 text-center">Nenhum estudante encontrado.</p>
                      ) : studentOptions.map(s => (
                        <button
                          key={s.matricula}
                          onClick={() => setSelectedStudent(s)}
                          className="flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-semibold">
                            {s.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{s.estudante}</p>
                            <p className="text-[11px] text-muted-foreground truncate tabular-nums">
                              {s.matricula} · {s.curso}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              {/* Categoria */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Categoria de apoio
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => {
                    const cfg = categoriaConfig[c];
                    const active = categoria === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setCategoria(c)}
                        className={cn(
                          "flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left transition-all",
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <Badge variant="outline" className={cn("text-[10px] border-0", cfg.color)}>
                          {cfg.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                          {CATEGORIA_HINT[c]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Motivo */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Motivo da sessão
                </Label>
                <Textarea
                  placeholder="Ex: Sessão inicial de avaliação, acompanhamento de progresso…"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Resumo do passo 1 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                  {selectedStudent?.estudante.split(" ").slice(0, 2).map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedStudent?.estudante}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {categoria && categoriaConfig[categoria].label} · {selectedStudent?.curso}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setStep(1)}>
                  Editar
                </Button>
              </div>

              {/* Data */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Data
                </Label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={data} onChange={e => setData(e.target.value)} className="h-10 w-44" />
                  <span className="text-xs text-muted-foreground capitalize">{fmtDate(dateObj)}</span>
                </div>
              </section>

              {/* Hora + Duração */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Hora de início
                  </Label>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    Termina às <strong className="text-foreground">{endTime}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {HORAS_SUGERIDAS.map(h => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      className={cn(
                        "px-2.5 h-8 rounded-md text-xs font-medium tabular-nums border transition-colors",
                        hora === h
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:border-primary hover:text-primary"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                  <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="h-8 w-28 text-xs" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[11px] text-muted-foreground self-center mr-1">Duração:</span>
                  {DURACOES.map(d => (
                    <button
                      key={d.v}
                      onClick={() => setDuracao(d.v)}
                      className={cn(
                        "px-2.5 h-8 rounded-md text-xs font-medium border transition-colors",
                        duracao === d.v
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:border-primary hover:text-primary"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Modalidade */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Modalidade
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { v: "presencial" as const, label: "Presencial", icon: MapPin, hint: "No gabinete GAP" },
                    { v: "online" as const,     label: "Online",     icon: Video,  hint: "Videochamada" },
                  ]).map(m => {
                    const active = modalidade === m.v;
                    return (
                      <button
                        key={m.v}
                        onClick={() => setModalidade(m.v)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <m.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="text-[11px] text-muted-foreground">{m.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Input
                  placeholder={modalidade === "presencial" ? "Sala (ex: Gab. GAP 1)" : "Link da videochamada"}
                  value={sala}
                  onChange={e => setSala(e.target.value)}
                  className="h-10 mt-2"
                />
              </section>

              {/* Responsável */}
              <section>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Responsável
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {RESPONSAVEIS.map(r => {
                    const active = responsavel === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setResponsavel(r.id)}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all",
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                            : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[11px] ring-1 ring-primary/15">
                          {r.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{r.nome}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{r.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer / Sticky preview */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex-row items-center justify-between gap-3 sm:justify-between">
          <div className="text-[11px] text-muted-foreground tabular-nums hidden sm:flex items-center gap-2 min-w-0 flex-1">
            {selectedStudent && categoria && (
              <>
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  <span className="capitalize">{fmtDate(dateObj)}</span> · {hora}–{endTime} · {modalidade === "online" ? "Online" : sala} · {resp.nome}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {step === 2 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancelar</Button>
            </DialogClose>
            {step === 1 ? (
              <Button
                size="sm"
                disabled={!selectedStudent || !categoria || motivo.trim().length < 3}
                onClick={() => setStep(2)}
                className="gap-1.5"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <DialogClose asChild>
                <Button size="sm" disabled={!canConfirm} className="gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Confirmar
                </Button>
              </DialogClose>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepDot({ active, done, n, label }: { active: boolean; done: boolean; n: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
        done ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
      </div>
      <span className={cn(
        "text-[11px] font-medium hidden sm:block",
        active ? "text-foreground" : "text-muted-foreground"
      )}>{label}</span>
    </div>
  );
}
