import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, CalendarDays, Plus, Trash2, Wand2, Sparkles, Sun, BookOpen, FileSignature, Coffee, Star, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type EventoTipo = "semestre" | "exames" | "ferias" | "feriado" | "especial";
type Epoca = "1" | "2" | "especial";
type Semestre = "1" | "2";
type Evento = {
  id: string;
  tipo: EventoTipo;
  titulo: string;
  inicio: string; // yyyy-mm-dd
  fim: string;
  epoca?: Epoca;
  semestre?: Semestre | null;
};

const TIPO_META: Record<EventoTipo, { label: string; color: string; dot: string; ring: string; icon: typeof BookOpen }> = {
  semestre: { label: "Semestre", color: "bg-primary text-primary-foreground",  dot: "bg-primary",     ring: "border-l-primary",     icon: BookOpen },
  exames:   { label: "Exames",   color: "bg-amber-500 text-white",             dot: "bg-amber-500",   ring: "border-l-amber-500",   icon: FileSignature },
  ferias:   { label: "Férias",   color: "bg-sky-500 text-white",               dot: "bg-sky-500",     ring: "border-l-sky-500",     icon: Sun },
  feriado:  { label: "Feriado",  color: "bg-rose-500 text-white",              dot: "bg-rose-500",    ring: "border-l-rose-500",    icon: Star },
  especial: { label: "Especial", color: "bg-violet-500 text-white",            dot: "bg-violet-500",  ring: "border-l-violet-500",  icon: Sparkles },
};

const EPOCA_LABEL: Record<Epoca, string> = {
  "1": "1ª Época",
  "2": "2ª Época",
  especial: "Época Especial",
};

const SEMESTRE_LABEL: Record<Semestre, string> = {
  "1": "1º Semestre",
  "2": "2º Semestre",
};

function buildExameTitulo(epoca?: Epoca, semestre?: Semestre | null) {
  if (!epoca) return "Exame";
  const ep = EPOCA_LABEL[epoca];
  if (epoca === "especial" || !semestre) return `Exames — ${ep}`;
  return `Exames — ${ep} (${SEMESTRE_LABEL[semestre]})`;
}

const ANOS_LETIVOS = ["2025/2026", "2026/2027", "2027/2028", "2028/2029"];
const rangeFromAno = (ano: string) => {
  const [y1, y2] = ano.split("/").map(Number);
  return { inicio: `${y1}-09-01`, fim: `${y2}-07-31` };
};

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtPT = (s: string) => new Date(s).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });

const buildAuto = (startISO: string, endISO: string): Evento[] => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const total = end.getTime() - start.getTime();
  const half = new Date(start.getTime() + total / 2);
  const year = start.getFullYear();
  const nextYear = end.getFullYear();
  return [
    { id: "s1",  tipo: "semestre", titulo: "1º Semestre — Aulas",        inicio: fmt(addDays(start, 14)), fim: fmt(addDays(start, 14 + 16 * 7)) },
    { id: "e1",  tipo: "exames",   titulo: "Exames — 1ª Época (1º Semestre)", inicio: fmt(addDays(start, 14 + 16 * 7 + 7)), fim: fmt(addDays(start, 14 + 16 * 7 + 21)), epoca: "1", semestre: "1" },
    { id: "e1b", tipo: "exames",   titulo: "Exames — 2ª Época (1º Semestre)", inicio: fmt(addDays(start, 14 + 16 * 7 + 28)), fim: fmt(addDays(start, 14 + 16 * 7 + 42)), epoca: "2", semestre: "1" },
    { id: "h1",  tipo: "ferias",   titulo: "Férias de Inverno",          inicio: `${year}-12-22`,         fim: `${nextYear}-01-05` },
    { id: "s2",  tipo: "semestre", titulo: "2º Semestre — Aulas",        inicio: fmt(half),               fim: fmt(addDays(half, 16 * 7)) },
    { id: "e2",  tipo: "exames",   titulo: "Exames — 1ª Época (2º Semestre)", inicio: fmt(addDays(half, 16 * 7 + 7)),  fim: fmt(addDays(half, 16 * 7 + 21)), epoca: "1", semestre: "2" },
    { id: "e2b", tipo: "exames",   titulo: "Exames — 2ª Época (2º Semestre)", inicio: fmt(addDays(half, 16 * 7 + 28)), fim: fmt(addDays(half, 16 * 7 + 42)), epoca: "2", semestre: "2" },
    { id: "esp", tipo: "exames",   titulo: "Exames — Época Especial",    inicio: `${nextYear}-09-15`,     fim: `${nextYear}-09-26`, epoca: "especial", semestre: null },
    { id: "f1",  tipo: "feriado",  titulo: "Dia da Independência",       inicio: `${nextYear}-11-11`,     fim: `${nextYear}-11-11` },
    { id: "f2",  tipo: "feriado",  titulo: "Natal",                      inicio: `${year}-12-25`,         fim: `${year}-12-25` },
    { id: "f3",  tipo: "feriado",  titulo: "Ano Novo",                   inicio: `${nextYear}-01-01`,     fim: `${nextYear}-01-01` },
    { id: "f4",  tipo: "feriado",  titulo: "Sexta-Feira Santa",          inicio: `${nextYear}-04-03`,     fim: `${nextYear}-04-03` },
    { id: "p1",  tipo: "especial", titulo: "Semana Académica",           inicio: `${nextYear}-04-13`,     fim: `${nextYear}-04-17` },
    { id: "p2",  tipo: "especial", titulo: "Cerimónia de Abertura",      inicio: fmt(addDays(start, 7)),  fim: fmt(addDays(start, 7)) },
  ];
};

export default function CalendarioAcademico() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();
  const [anoLetivo, setAnoLetivo] = useState("2025/2026");
  const initial = rangeFromAno("2025/2026");
  const [inicio, setInicio] = useState(initial.inicio);
  const [fim, setFim] = useState(initial.fim);
  const [eventos, setEventos] = useState<Evento[]>(() => buildAuto(initial.inicio, initial.fim));
  const [filter, setFilter] = useState<EventoTipo | "all">("all");
  const [planView, setPlanView] = useState<"cards" | "mensal">("cards");
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(initial.inicio); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const changeAno = (v: string) => {
    setAnoLetivo(v);
    const r = rangeFromAno(v);
    setInicio(r.inicio);
    setFim(r.fim);
    setEventos(buildAuto(r.inicio, r.fim));
    const d = new Date(r.inicio);
    setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const regenerate = () => {
    setEventos(buildAuto(inicio, fim));
    toast.success("Calendário regenerado automaticamente");
  };

  const confirmCalendar = () => {
    markOnboardingStepDone(user?.email, "aca.cal");
    toast.success("Calendário académico confirmado");
  };

  const update = (id: string, patch: Partial<Evento>) =>
    setEventos(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const remove = (id: string) => setEventos(prev => prev.filter(e => e.id !== id));
  const add = (tipo: EventoTipo) => {
    setEventos(prev => [...prev, { id: `n-${Date.now()}`, tipo, titulo: `Novo ${TIPO_META[tipo].label}`, inicio, fim: inicio }]);
    toast.success(`${TIPO_META[tipo].label} adicionado`);
  };

  const filtered = useMemo(() =>
    (filter === "all" ? eventos : eventos.filter(e => e.tipo === filter))
      .slice().sort((a, b) => a.inicio.localeCompare(b.inicio)),
    [eventos, filter]
  );

  const counts = useMemo(() => {
    const c: Record<EventoTipo, number> = { semestre: 0, exames: 0, ferias: 0, feriado: 0, especial: 0 };
    eventos.forEach(e => { c[e.tipo]++; });
    return c;
  }, [eventos]);

  // Group events by month for the new timeline
  const months = useMemo(() => {
    const out: { key: string; label: string; year: number; month: number }[] = [];
    const s = new Date(inicio); const e = new Date(fim);
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    while (cur <= e) {
      out.push({
        key: `${cur.getFullYear()}-${cur.getMonth()}`,
        label: cur.toLocaleDateString("pt-PT", { month: "long", year: "numeric" }),
        year: cur.getFullYear(),
        month: cur.getMonth(),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
  }, [inicio, fim]);

  const eventsByMonth = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    eventos.forEach(e => {
      const d = new Date(e.inicio);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      (map[key] ||= []).push(e);
    });
    Object.values(map).forEach(list => list.sort((a, b) => a.inicio.localeCompare(b.inicio)));
    return map;
  }, [eventos]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner actions={
        <>
          <Button onClick={regenerate} size="sm" variant="outline" className="gap-1 h-8"><Wand2 className="w-3.5 h-3.5" /> Regenerar</Button>
          <Button onClick={confirmCalendar} size="sm" variant="outline" className="gap-1 h-8"><Check className="w-3.5 h-3.5" /> Confirmar</Button>
        </>
      } />
      {!isOnboarding && (
        <div>
          <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
          </Link>
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <Badge className="mb-2 gap-1"><CalendarDays className="w-3 h-3" /> Passo 5 de 6</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-primary" /> Calendário Académico
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Gerador automático de semestres, exames, feriados e férias. Tudo editável.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={regenerate} className="gap-2"><Wand2 className="w-4 h-4" /> Regenerar Automático</Button>
              <Button onClick={confirmCalendar} className="gap-2"><Check className="w-4 h-4" /> Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Parameters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Ano Letivo</p>
          <Select value={anoLetivo} onValueChange={changeAno}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ANOS_LETIVOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Início</p>
          <Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="h-9" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Fim</p>
          <Input type="date" value={fim} onChange={e => setFim(e.target.value)} className="h-9" />
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(TIPO_META) as EventoTipo[]).map(t => {
          const M = TIPO_META[t]; const Icon = M.icon;
          return (
            <Card key={t} className="p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Icon className="w-3.5 h-3.5" /><p className="text-xs">{M.label}</p></div>
              <p className="text-2xl font-bold">{counts[t]}</p>
            </Card>
          );
        })}
      </div>

      {/* Plano do Ano */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Plano do Ano — {anoLetivo}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{months.length} meses · {eventos.length} eventos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-muted-foreground">
              {(Object.keys(TIPO_META) as EventoTipo[]).map(t => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${TIPO_META[t].dot}`} />{TIPO_META[t].label}
                </span>
              ))}
            </div>
            <div className="inline-flex rounded-md border bg-muted/30 p-0.5">
              <button onClick={() => setPlanView("cards")} className={`px-2.5 py-1 text-xs rounded inline-flex items-center gap-1.5 transition ${planView === "cards" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-3 h-3" /> Anual
              </button>
              <button onClick={() => setPlanView("mensal")} className={`px-2.5 py-1 text-xs rounded inline-flex items-center gap-1.5 transition ${planView === "mensal" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <CalendarRange className="w-3 h-3" /> Mensal
              </button>
            </div>
          </div>
        </div>

        {planView === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {months.map(m => {
              const list = eventsByMonth[m.key] ?? [];
              return (
                <div key={m.key} className="rounded-lg border bg-card overflow-hidden flex flex-col">
                  <div className="px-3 py-2 border-b bg-muted/40 flex items-center justify-between">
                    <p className="text-xs font-semibold capitalize">{m.label}</p>
                    <Badge variant="outline" className="text-[10px] h-5">{list.length}</Badge>
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[80px]">
                    {list.length === 0 && (
                      <p className="text-[11px] text-muted-foreground/70 italic px-1 py-2">Sem eventos</p>
                    )}
                    {list.map(e => {
                      const M = TIPO_META[e.tipo];
                      const sameDay = e.inicio === e.fim;
                      return (
                        <div key={e.id} className={`group rounded-md border-l-2 ${M.ring} bg-muted/30 hover:bg-muted/60 transition px-2 py-1.5`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium leading-tight truncate">{e.titulo}</p>
                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${M.dot} mt-1`} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                            {sameDay ? fmtPT(e.inicio) : `${fmtPT(e.inicio)} → ${fmtPT(e.fim)}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {planView === "mensal" && (() => {
          const minMonth = new Date(new Date(inicio).getFullYear(), new Date(inicio).getMonth(), 1);
          const maxMonth = new Date(new Date(fim).getFullYear(), new Date(fim).getMonth(), 1);
          const canPrev = monthCursor > minMonth;
          const canNext = monthCursor < maxMonth;
          const y = monthCursor.getFullYear(), mo = monthCursor.getMonth();
          const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7; // Mon=0
          const daysInMonth = new Date(y, mo + 1, 0).getDate();
          const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
          const cells: ({ day: number; iso: string } | null)[] = [];
          for (let i = 0; i < totalCells; i++) {
            const dayNum = i - firstDow + 1;
            if (dayNum < 1 || dayNum > daysInMonth) cells.push(null);
            else {
              const iso = `${y}-${String(mo + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              cells.push({ day: dayNum, iso });
            }
          }
          const eventsOnDay = (iso: string) => eventos.filter(e => iso >= e.inicio && iso <= e.fim);
          const monthLabel = monthCursor.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
          const todayISO = fmt(new Date());
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={!canPrev}
                    onClick={() => setMonthCursor(new Date(y, mo - 1, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <p className="text-sm font-semibold capitalize px-3 min-w-[160px] text-center">{monthLabel}</p>
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={!canNext}
                    onClick={() => setMonthCursor(new Date(y, mo + 1, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Select value={`${y}-${mo}`} onValueChange={v => { const [yy, mm] = v.split("-").map(Number); setMonthCursor(new Date(yy, mm, 1)); }}>
                  <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.key} value={m.key} className="text-xs capitalize">{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border overflow-hidden bg-card">
                <div className="grid grid-cols-7 bg-muted/40 border-b">
                  {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => (
                    <div key={d} className="px-2 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground font-medium text-center">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((c, i) => {
                    if (!c) return <div key={i} className="min-h-[96px] border-r border-b bg-muted/10 last:border-r-0" />;
                    const dayEvents = eventsOnDay(c.iso);
                    const isToday = c.iso === todayISO;
                    const isWeekend = i % 7 >= 5;
                    return (
                      <div key={i} className={`min-h-[96px] border-r border-b p-1.5 flex flex-col gap-1 ${isWeekend ? "bg-muted/15" : ""} ${(i + 1) % 7 === 0 ? "border-r-0" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-semibold tabular-nums inline-flex items-center justify-center ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5" : "text-foreground/80"}`}>{c.day}</span>
                          {dayEvents.length > 2 && <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</span>}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(e => {
                            const M = TIPO_META[e.tipo];
                            return (
                              <div key={e.id} className={`text-[10px] leading-tight px-1.5 py-0.5 rounded ${M.color} truncate`} title={e.titulo}>
                                {e.titulo}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </Card>


      {/* Filters + add */}
      <Card className="p-3 flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="h-8 text-xs">Todos ({eventos.length})</Button>
        {(Object.keys(TIPO_META) as EventoTipo[]).map(t => (
          <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} onClick={() => setFilter(t)} className="h-8 text-xs gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${TIPO_META[t].dot}`} />{TIPO_META[t].label} ({counts[t]})
          </Button>
        ))}
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Adicionar Evento <ChevronDown className="w-3 h-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">Tipo de evento</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(TIPO_META) as EventoTipo[]).map(t => {
              const M = TIPO_META[t]; const Icon = M.icon;
              return (
                <DropdownMenuItem key={t} onClick={() => add(t)} className="gap-2 cursor-pointer">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center ${M.color}`}>
                    <Icon className="w-3 h-3" />
                  </span>
                  <span className="text-xs">{M.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* Event rows */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_140px_140px_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
          <span>Tipo</span><span>Título</span><span>Início</span><span>Fim</span><span></span>
        </div>
        <div className="divide-y">
          {filtered.map(e => {
            const M = TIPO_META[e.tipo]; const Icon = M.icon;
            return (
              <div key={e.id} className="grid grid-cols-[120px_1fr_140px_140px_36px] gap-2 p-2 items-center">
                <Select value={e.tipo} onValueChange={v => update(e.id, { tipo: v as EventoTipo })}>
                  <SelectTrigger className="h-8 text-xs">
                    <span className="inline-flex items-center gap-1.5"><Icon className="w-3 h-3" /> {M.label}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_META) as EventoTipo[]).map(t => <SelectItem key={t} value={t}>{TIPO_META[t].label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={e.titulo} onChange={ev => update(e.id, { titulo: ev.target.value })} className="h-8 text-xs" />
                <Input type="date" value={e.inicio} onChange={ev => update(e.id, { inicio: ev.target.value })} className="h-8 text-xs" />
                <Input type="date" value={e.fim} onChange={ev => update(e.id, { fim: ev.target.value })} className="h-8 text-xs" />
                <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Coffee className="w-5 h-5" />
              Nenhum evento neste filtro
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador/turmas">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador">Concluir e voltar ao Criador <Check className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
