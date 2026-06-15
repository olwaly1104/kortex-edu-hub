import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Check, CalendarDays, Plus, Trash2, Wand2, Sparkles, Sun, BookOpen, FileSignature, Coffee, Star } from "lucide-react";
import { toast } from "sonner";

type EventoTipo = "semestre" | "exames" | "ferias" | "feriado" | "especial";
type Evento = {
  id: string;
  tipo: EventoTipo;
  titulo: string;
  inicio: string; // yyyy-mm-dd
  fim: string;
};

const TIPO_META: Record<EventoTipo, { label: string; color: string; icon: typeof BookOpen }> = {
  semestre: { label: "Semestre", color: "bg-primary text-primary-foreground", icon: BookOpen },
  exames:   { label: "Exames",   color: "bg-amber-500 text-white",            icon: FileSignature },
  ferias:   { label: "Férias",   color: "bg-sky-500 text-white",              icon: Sun },
  feriado:  { label: "Feriado",  color: "bg-rose-500 text-white",             icon: Star },
  especial: { label: "Especial", color: "bg-violet-500 text-white",           icon: Sparkles },
};

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const buildAuto = (startISO: string, endISO: string): Evento[] => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const total = end.getTime() - start.getTime();
  const half = new Date(start.getTime() + total / 2);
  const year = start.getFullYear();
  const nextYear = end.getFullYear();
  return [
    { id: "s1",  tipo: "semestre", titulo: "1º Semestre — Aulas",        inicio: fmt(addDays(start, 14)), fim: fmt(addDays(start, 14 + 16 * 7)) },
    { id: "e1",  tipo: "exames",   titulo: "Exames — 1ª Época (1º Sem)", inicio: fmt(addDays(start, 14 + 16 * 7 + 7)), fim: fmt(addDays(start, 14 + 16 * 7 + 21)) },
    { id: "e1b", tipo: "exames",   titulo: "Exames — 2ª Época (1º Sem)", inicio: fmt(addDays(start, 14 + 16 * 7 + 28)), fim: fmt(addDays(start, 14 + 16 * 7 + 42)) },
    { id: "h1",  tipo: "ferias",   titulo: "Férias de Inverno",          inicio: `${year}-12-22`,         fim: `${nextYear}-01-05` },
    { id: "s2",  tipo: "semestre", titulo: "2º Semestre — Aulas",        inicio: fmt(half),               fim: fmt(addDays(half, 16 * 7)) },
    { id: "e2",  tipo: "exames",   titulo: "Exames — 1ª Época (2º Sem)", inicio: fmt(addDays(half, 16 * 7 + 7)),  fim: fmt(addDays(half, 16 * 7 + 21)) },
    { id: "e2b", tipo: "exames",   titulo: "Exames — 2ª Época (2º Sem)", inicio: fmt(addDays(half, 16 * 7 + 28)), fim: fmt(addDays(half, 16 * 7 + 42)) },
    { id: "esp", tipo: "exames",   titulo: "Exames — Época Especial",    inicio: `${nextYear}-09-15`,     fim: `${nextYear}-09-26` },
    { id: "f1",  tipo: "feriado",  titulo: "Dia da Independência",       inicio: `${nextYear}-11-11`,     fim: `${nextYear}-11-11` },
    { id: "f2",  tipo: "feriado",  titulo: "Natal",                      inicio: `${year}-12-25`,         fim: `${year}-12-25` },
    { id: "f3",  tipo: "feriado",  titulo: "Ano Novo",                   inicio: `${nextYear}-01-01`,     fim: `${nextYear}-01-01` },
    { id: "f4",  tipo: "feriado",  titulo: "Sexta-Feira Santa",          inicio: `${nextYear}-04-03`,     fim: `${nextYear}-04-03` },
    { id: "p1",  tipo: "especial", titulo: "Semana Académica",           inicio: `${nextYear}-04-13`,     fim: `${nextYear}-04-17` },
    { id: "p2",  tipo: "especial", titulo: "Cerimónia de Abertura",      inicio: fmt(addDays(start, 7)),  fim: fmt(addDays(start, 7)) },
  ];
};

export default function CalendarioAcademico() {
  const [anoLetivo, setAnoLetivo] = useState("2025/2026");
  const [inicio, setInicio] = useState("2025-09-01");
  const [fim, setFim] = useState("2026-07-31");
  const [eventos, setEventos] = useState<Evento[]>(() => buildAuto("2025-09-01", "2026-07-31"));
  const [filter, setFilter] = useState<EventoTipo | "all">("all");

  const regenerate = () => {
    setEventos(buildAuto(inicio, fim));
    toast.success("Calendário regenerado automaticamente");
  };

  const update = (id: string, patch: Partial<Evento>) =>
    setEventos(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const remove = (id: string) => setEventos(prev => prev.filter(e => e.id !== id));
  const add = (tipo: EventoTipo) =>
    setEventos(prev => [...prev, { id: `n-${Date.now()}`, tipo, titulo: `Novo ${TIPO_META[tipo].label}`, inicio, fim: inicio }]);

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

  // Timeline grid: months from inicio to fim
  const months = useMemo(() => {
    const out: { label: string; start: Date; end: Date }[] = [];
    const s = new Date(inicio); const e = new Date(fim);
    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
    while (cur <= e) {
      const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      out.push({ label: cur.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }), start: new Date(cur), end: new Date(next.getTime() - 1) });
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
  }, [inicio, fim]);

  const rangeStart = new Date(inicio).getTime();
  const rangeEnd = new Date(fim).getTime();
  const pos = (d: string) => {
    const t = new Date(d).getTime();
    return Math.max(0, Math.min(100, ((t - rangeStart) / (rangeEnd - rangeStart)) * 100));
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
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
            <Button onClick={() => toast.success("Calendário académico confirmado")} className="gap-2"><Check className="w-4 h-4" /> Confirmar</Button>
          </div>
        </div>
      </div>

      {/* Parameters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Ano Letivo</p>
          <Input value={anoLetivo} onChange={e => setAnoLetivo(e.target.value)} className="h-9" />
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

      {/* Timeline */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Linha do Tempo — {anoLetivo}</p>
          <p className="text-[11px] text-muted-foreground">{months.length} meses</p>
        </div>
        <div className="relative border rounded-lg bg-muted/20 p-3">
          <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}>
            {months.map(m => (
              <div key={m.label} className="text-[10px] uppercase text-muted-foreground text-center py-1 border-r last:border-r-0">{m.label}</div>
            ))}
          </div>
          <div className="relative mt-2 space-y-1.5">
            {(["semestre", "exames", "ferias", "feriado", "especial"] as EventoTipo[]).map(tipo => {
              const items = eventos.filter(e => e.tipo === tipo);
              return (
                <div key={tipo} className="relative h-6">
                  {items.map(e => {
                    const left = pos(e.inicio);
                    const right = pos(e.fim);
                    const width = Math.max(1.5, right - left);
                    return (
                      <div key={e.id}
                        title={`${e.titulo} (${e.inicio} → ${e.fim})`}
                        className={`absolute top-0 h-6 rounded text-[10px] px-1.5 flex items-center truncate ${TIPO_META[tipo].color}`}
                        style={{ left: `${left}%`, width: `${width}%` }}>
                        {e.titulo}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Filters + add */}
      <Card className="p-3 flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="h-7 text-xs">Todos ({eventos.length})</Button>
        {(Object.keys(TIPO_META) as EventoTipo[]).map(t => (
          <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} onClick={() => setFilter(t)} className="h-7 text-xs">{TIPO_META[t].label} ({counts[t]})</Button>
        ))}
        <div className="flex-1" />
        <Select onValueChange={v => add(v as EventoTipo)}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar evento</span></SelectTrigger>
          <SelectContent>
            {(Object.keys(TIPO_META) as EventoTipo[]).map(t => <SelectItem key={t} value={t}>{TIPO_META[t].label}</SelectItem>)}
          </SelectContent>
        </Select>
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
