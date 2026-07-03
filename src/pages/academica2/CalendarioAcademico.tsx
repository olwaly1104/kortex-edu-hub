import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, CalendarDays, Plus, Trash2, Wand2, Sparkles, Sun, BookOpen, FileSignature, Coffee, Star, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, CalendarRange, Settings2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CandidaturasEtapasConfig from "@/components/academica/CandidaturasEtapasConfig";


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
  return { inicio: `${y1}-09-01`, fim: `${y2}-08-31` };
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

type Turno = { id: string; nome: string; inicio: string; fim: string };

const DEFAULT_TURNOS: Turno[] = [
  { id: "t-m", nome: "Manhã", inicio: "08:00", fim: "12:00" },
  { id: "t-t", nome: "Tarde", inicio: "13:00", fim: "17:00" },
  { id: "t-n", nome: "Noite", inicio: "18:00", fim: "22:00" },
];

const TURNOS_KEY = "upra:turnos-cfg";
const CAND_KEY = "upra:candidaturas-cfg";
const SEMESTRES_KEY = "upra:semestres-cfg";

type SemestreCfg = { id: string; nome: string; inicio: string; fim: string };
const buildDefaultSemestres = (inicioAno: string, fimAno: string): SemestreCfg[] => {
  const s = new Date(inicioAno); const e = new Date(fimAno);
  const half = new Date(s.getTime() + (e.getTime() - s.getTime()) / 2);
  return [
    { id: "sem-1", nome: "1º Semestre", inicio: fmt(s), fim: fmt(addDays(half, -1)) },
    { id: "sem-2", nome: "2º Semestre", inicio: fmt(half), fim: fmt(e) },
  ];
};


function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; } catch { return fallback; }
}

export default function CalendarioAcademico() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();
  const [anoLetivo, setAnoLetivo] = useState("2025/2026");
  const initial = rangeFromAno("2025/2026");
  const [inicio, setInicio] = useState(initial.inicio);
  const [fim, setFim] = useState(initial.fim);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filter, setFilter] = useState<EventoTipo | "all">("all");
  const [planView, setPlanView] = useState<"cards" | "mensal">("cards");
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(initial.inicio); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // Load eventos from backend for the current ano letivo
  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data, error } = await supabase
        .from("ano_letivo_eventos")
        .select("id, tipo, titulo, inicio, fim, epoca, semestre")
        .eq("ano_letivo", anoLetivo)
        .order("inicio", { ascending: true });
      if (cancel) return;
      if (error) { console.error(error); return; }
      setEventos((data ?? []).map(r => ({
        id: r.id,
        tipo: r.tipo as EventoTipo,
        titulo: r.titulo,
        inicio: r.inicio,
        fim: r.fim,
        epoca: (r.epoca ?? undefined) as Epoca | undefined,
        semestre: (r.semestre ?? null) as Semestre | null,
      })));
    })();
    return () => { cancel = true; };
  }, [anoLetivo]);

  // Candidaturas window (backend-backed, per ano_letivo)
  type CandCfg = { inicio: string; fim: string };
  const [candidaturas, setCandidaturas] = useState<CandCfg>(() => {
    const y = initial.inicio.slice(0, 4);
    return { inicio: `${y}-05-01`, fim: `${y}-08-15` };
  });
  const [candJanelaId, setCandJanelaId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null)); }, []);

  // Load janela for current ano letivo
  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await (supabase.from as any)("candidaturas_janela")
        .select("id, inicio, fim").eq("ano_letivo", anoLetivo).maybeSingle();
      if (cancel) return;
      if (data) {
        setCandJanelaId(data.id);
        setCandidaturas({ inicio: data.inicio, fim: data.fim });
      } else {
        setCandJanelaId(null);
        const y = rangeFromAno(anoLetivo).inicio.slice(0, 4);
        setCandidaturas({ inicio: `${y}-05-01`, fim: `${y}-08-15` });
      }
    })();
    return () => { cancel = true; };
  }, [anoLetivo]);

  const saveJanela = async (patch: Partial<CandCfg>) => {
    const next = { ...candidaturas, ...patch };
    setCandidaturas(next);
    if (!authUserId) return;
    if (candJanelaId) {
      await (supabase.from as any)("candidaturas_janela").update({ inicio: next.inicio, fim: next.fim }).eq("id", candJanelaId);
    } else {
      const { data } = await (supabase.from as any)("candidaturas_janela")
        .insert({ owner_user_id: authUserId, ano_letivo: anoLetivo, inicio: next.inicio, fim: next.fim })
        .select("id").single();
      if (data?.id) setCandJanelaId(data.id);
    }
  };

  // Load all scheduled sessões (with etapa name) for preview + read-only list
  type SessaoRow = { id: string; etapa_id: string; mode: string | null; datas: string[]; data_fim: string | null; hora: string | null; horas: string[]; local: string | null };
  type EtapaRow = { id: string; nome: string; ordem: number };
  const [sessoesAgendadas, setSessoesAgendadas] = useState<SessaoRow[]>([]);
  const [etapasMap, setEtapasMap] = useState<Record<string, { nome: string; ordem: number }>>({});
  useEffect(() => {
    let cancel = false;
    (async () => {
      const [{ data: se }, { data: et }] = await Promise.all([
        supabase.from("candidaturas_sessoes").select("id,etapa_id,mode,datas,data_fim,hora,horas,local"),
        supabase.from("candidaturas_etapas").select("id,nome,ordem").order("ordem"),
      ]);
      if (cancel) return;
      setSessoesAgendadas(((se ?? []) as any[]).map(r => ({ ...r, datas: r.datas ?? [], horas: r.horas ?? [] })) as SessaoRow[]);
      const map: Record<string, { nome: string; ordem: number }> = {};
      ((et ?? []) as EtapaRow[]).forEach(e => { map[e.id] = { nome: e.nome, ordem: e.ordem }; });
      setEtapasMap(map);
    })();
    return () => { cancel = true; };
  }, [anoLetivo]);


  // Turnos configuration
  const [turnos, setTurnos] = useState<Turno[]>(() => loadJSON(TURNOS_KEY, DEFAULT_TURNOS));
  useEffect(() => { try { localStorage.setItem(TURNOS_KEY, JSON.stringify(turnos)); } catch {} }, [turnos]);
  const addTurno = () => setTurnos(p => [...p, { id: `t-${Date.now()}`, nome: `Turno ${p.length + 1}`, inicio: "08:00", fim: "12:00" }]);
  const updTurno = (id: string, patch: Partial<Turno>) => setTurnos(p => p.map(t => t.id === id ? { ...t, ...patch } : t));
  const rmTurno = (id: string) => setTurnos(p => p.filter(t => t.id !== id));

  // Semestres configuration
  const [semestres, setSemestres] = useState<SemestreCfg[]>(
    () => loadJSON(SEMESTRES_KEY, buildDefaultSemestres(initial.inicio, initial.fim))
  );
  useEffect(() => { try { localStorage.setItem(SEMESTRES_KEY, JSON.stringify(semestres)); } catch {} }, [semestres]);
  const addSemestre = () => setSemestres(p => [...p, { id: `sem-${Date.now()}`, nome: `${p.length + 1}º Semestre`, inicio, fim }]);
  const updSemestre = (id: string, patch: Partial<SemestreCfg>) => setSemestres(p => p.map(s => s.id === id ? { ...s, ...patch } : s));
  const rmSemestre = (id: string) => setSemestres(p => p.filter(s => s.id !== id));


  const changeAno = (v: string) => {
    setAnoLetivo(v);
    const r = rangeFromAno(v);
    setInicio(r.inicio);
    setFim(r.fim);
    const d = new Date(r.inicio);
    setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };


  const regenerate = async () => {
    if (!confirm("Remover todos os eventos deste ano letivo?")) return;
    const { error } = await supabase.from("ano_letivo_eventos").delete().eq("ano_letivo", anoLetivo);
    if (error) { toast.error("Erro ao limpar"); return; }
    setEventos([]);
    toast.success("Calendário limpo");
  };

  const confirmCalendar = () => {
    markOnboardingStepDone(user?.email, "aca.cal");
    toast.success("Calendário académico confirmado");
  };

  const update = async (id: string, patch: Partial<Evento>) => {
    const current = eventos.find(e => e.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    if ("tipo" in patch && next.tipo === "exames") {
      next.epoca ??= "1";
      next.semestre ??= "1";
      next.titulo = buildExameTitulo(next.epoca, next.semestre);
    }
    if (next.tipo === "exames" && ("epoca" in patch || "semestre" in patch)) {
      next.titulo = buildExameTitulo(next.epoca, next.semestre);
    }
    setEventos(prev => prev.map(e => e.id === id ? next : e));
    const { error } = await supabase.from("ano_letivo_eventos").update({
      tipo: next.tipo, titulo: next.titulo, inicio: next.inicio, fim: next.fim,
      epoca: next.epoca ?? null, semestre: next.semestre ?? null,
    }).eq("id", id);
    if (error) toast.error("Erro a guardar");
  };
  const remove = async (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from("ano_letivo_eventos").delete().eq("id", id);
    if (error) toast.error("Erro ao remover");
  };
  const add = async (tipo: EventoTipo) => {
    if (!user?.id) { toast.error("Sessão inválida"); return; }
    const base = { tipo, titulo: `Novo ${TIPO_META[tipo].label}`, inicio, fim: inicio } as Evento;
    if (tipo === "exames") {
      base.epoca = "1"; base.semestre = "1";
      base.titulo = buildExameTitulo(base.epoca, base.semestre);
    }
    const { data, error } = await supabase.from("ano_letivo_eventos").insert({
      owner_user_id: user.id,
      ano_letivo: anoLetivo,
      tipo: base.tipo, titulo: base.titulo, inicio: base.inicio, fim: base.fim,
      epoca: base.epoca ?? null, semestre: base.semestre ?? null,
    }).select("id").single();
    if (error || !data) { toast.error("Erro ao adicionar"); return; }
    setEventos(prev => [...prev, { ...base, id: data.id }]);
    toast.success(`${TIPO_META[tipo].label} adicionado`);
  };





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

  type SessaoEvent = Evento & { ordem: number };
  const sessaoEvents = useMemo<SessaoEvent[]>(() => {
    const out: SessaoEvent[] = [];
    const ordered = sessoesAgendadas
      .slice()
      .sort((a, b) => (etapasMap[a.etapa_id]?.ordem ?? 999) - (etapasMap[b.etapa_id]?.ordem ?? 999));
    ordered.forEach(s => {
      const meta = etapasMap[s.etapa_id];
      const nome = meta?.nome || "Sessão";
      const ordem = meta?.ordem ?? 999;
      if (s.mode === "periodo" && s.datas[0] && s.data_fim) {
        out.push({ id: `__ses_${s.id}`, tipo: "especial", titulo: `Candidaturas — ${nome}`, inicio: s.datas[0], fim: s.data_fim, ordem });
      } else if (s.mode === "dia" && s.datas[0]) {
        out.push({ id: `__ses_${s.id}`, tipo: "especial", titulo: `Candidaturas — ${nome}`, inicio: s.datas[0], fim: s.datas[0], ordem });
      } else if (s.mode === "dias" && s.datas.length > 0) {
        s.datas.forEach((d, i) => out.push({ id: `__ses_${s.id}_${i}`, tipo: "especial", titulo: `Candidaturas — ${nome}`, inicio: d, fim: d, ordem }));
      }
    });
    return out;
  }, [sessoesAgendadas, etapasMap]);

  const displayEventos = useMemo<Evento[]>(() => [
    { id: "__inicio_ano", tipo: "especial", titulo: "Início do Ano Letivo", inicio, fim: inicio },
    { id: "__fim_ano",    tipo: "especial", titulo: "Fim do Ano Letivo",    inicio: fim, fim },
    ...semestres.flatMap(s => [
      { id: `__sem_${s.id}_ini`, tipo: "semestre" as EventoTipo, titulo: `Início do ${s.nome}`, inicio: s.inicio, fim: s.inicio },
      { id: `__sem_${s.id}_fim`, tipo: "semestre" as EventoTipo, titulo: `Fim do ${s.nome}`, inicio: s.fim, fim: s.fim },
    ]),
    { id: "__cand_ini", tipo: "especial", titulo: "Início das Candidaturas", inicio: candidaturas.inicio, fim: candidaturas.inicio },
    { id: "__cand_fim", tipo: "especial", titulo: "Fim das Candidaturas",    inicio: candidaturas.fim,    fim: candidaturas.fim },
    ...sessaoEvents,
    ...eventos,
  ], [eventos, inicio, fim, semestres, candidaturas, sessaoEvents]);

  const eventsByMonth = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    displayEventos.forEach(e => {
      const d = new Date(e.inicio);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      (map[key] ||= []).push(e);
    });
    Object.values(map).forEach(list => list.sort((a, b) => a.inicio.localeCompare(b.inicio)));
    return map;
  }, [displayEventos]);

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

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="inline-flex h-auto flex-wrap w-full lg:w-auto gap-1 p-1">
          <TabsTrigger value="config" className="gap-1.5 whitespace-nowrap"><Settings2 className="w-3.5 h-3.5" /> Configuração do Ano Letivo</TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5 whitespace-nowrap"><CalendarDays className="w-3.5 h-3.5" /> Calendário do Ano Letivo</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6 mt-4">
      {/* Ano Letivo + Turnos + Semestres */}

      <Card className="overflow-hidden">


        <div className="px-5 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Configuração do Ano Letivo</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Período académico, turnos diários e janela de candidaturas</p>
        </div>

        <div className="divide-y">
          {/* Período académico */}
          <section className="px-5 py-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
            <div>
              <p className="text-xs font-medium">Período académico</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ano e datas de início/fim</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Ano Letivo</p>
                <Select value={anoLetivo} onValueChange={changeAno}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANOS_LETIVOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Início</p>
                <Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="h-9" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Fim</p>
                <Input type="date" value={fim} onChange={e => setFim(e.target.value)} className="h-9" />
              </div>
            </div>
          </section>

          {/* Turnos */}
          <section className="px-5 py-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
            <div>
              <p className="text-xs font-medium flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-primary" /> Turnos</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{turnos.length} configurado{turnos.length === 1 ? "" : "s"}</p>
            </div>
            <div className="space-y-2">
              {turnos.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sem turnos configurados.</p>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_110px_110px_36px] gap-2 items-center text-[10px] uppercase tracking-wide text-muted-foreground px-1">
                    <span>Nome</span><span>Início</span><span>Fim</span><span />
                  </div>
                  {turnos.map(t => (
                    <div key={t.id} className="grid grid-cols-[1fr_110px_110px_36px] gap-2 items-center">
                      <Input value={t.nome} onChange={e => updTurno(t.id, { nome: e.target.value })} placeholder="Nome do turno" className="h-8 text-xs" />
                      <Input type="time" value={t.inicio} onChange={e => updTurno(t.id, { inicio: e.target.value })} className="h-8 text-xs" />
                      <Input type="time" value={t.fim} onChange={e => updTurno(t.id, { fim: e.target.value })} className="h-8 text-xs" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => { if (confirm(`Remover turno "${t.nome}"?`)) rmTurno(t.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
              <Button size="sm" variant="outline" className="h-8 gap-1 mt-1" onClick={addTurno}>
                <Plus className="w-3.5 h-3.5" /> Adicionar Turno
              </Button>
            </div>
          </section>

          {/* Semestres */}
          <section className="px-5 py-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
            <div>
              <p className="text-xs font-medium flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> Semestres</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{semestres.length} configurado{semestres.length === 1 ? "" : "s"}</p>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_140px_140px_36px] gap-2 items-center text-[10px] uppercase tracking-wide text-muted-foreground px-1">
                <span>Nome</span><span>Início</span><span>Fim</span><span />
              </div>
              {semestres.map(s => (
                <div key={s.id} className="grid grid-cols-[1fr_140px_140px_36px] gap-2 items-center">
                  <Input value={s.nome} onChange={e => updSemestre(s.id, { nome: e.target.value })} placeholder="Nome do semestre" className="h-8 text-xs" />
                  <Input type="date" value={s.inicio} onChange={e => updSemestre(s.id, { inicio: e.target.value })} className="h-8 text-xs" />
                  <Input type="date" value={s.fim} onChange={e => updSemestre(s.id, { fim: e.target.value })} className="h-8 text-xs" />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => { if (confirm(`Remover "${s.nome}"?`)) rmSemestre(s.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-8 gap-1 mt-1" onClick={addSemestre}>
                <Plus className="w-3.5 h-3.5" /> Adicionar Semestre
              </Button>
            </div>
          </section>

          {/* Candidaturas */}
          <section className="px-5 py-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-start">
            <div>
              <p className="text-xs font-medium flex items-center gap-1.5"><FileSignature className="w-3.5 h-3.5 text-primary" /> Candidaturas</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Janela de candidaturas e sessões agendadas</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Início das candidaturas</p>
                  <Input type="date" value={candidaturas.inicio} onChange={e => saveJanela({ inicio: e.target.value })} className="h-9" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Fim das candidaturas</p>
                  <Input type="date" value={candidaturas.fim} onChange={e => saveJanela({ fim: e.target.value })} className="h-9" />
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sessões agendadas</p>
                  <Badge variant="outline" className="text-[10px] h-5">{sessaoEvents.length}</Badge>
                </div>
                {sessaoEvents.length === 0 ? (
                  <p className="px-3 py-3 text-[11px] text-muted-foreground italic">Sem sessões agendadas. Configure em <Link to="/admin/faculdades-cursos?tab=candidaturas" className="text-primary hover:underline">Candidaturas</Link>.</p>
                ) : (
                  <div className="divide-y">
                    {sessaoEvents
                      .slice()
                      .sort((a, b) => (a.ordem - b.ordem) || a.inicio.localeCompare(b.inicio))
                      .map(ev => (
                        <div key={ev.id} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                          <span className="font-medium truncate">{ev.titulo.replace(/^Candidaturas — /, "")}</span>
                          <span className="text-muted-foreground tabular-nums shrink-0">
                            {ev.inicio === ev.fim ? fmtPT(ev.inicio) : `${fmtPT(ev.inicio)} → ${fmtPT(ev.fim)}`}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </Card>




        </TabsContent>

        <TabsContent value="calendario" className="space-y-6 mt-4">
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
            <p className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Pré-visualização do Ano — {anoLetivo}</p>
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
          const eventsOnDay = (iso: string) => displayEventos.filter(e => iso >= e.inicio && iso <= e.fim);
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
                {e.tipo === "exames" ? (
                  <div className="flex gap-2">
                    <Select value={e.epoca ?? "1"} onValueChange={v => update(e.id, { epoca: v as Epoca })}>
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Época" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ª Época</SelectItem>
                        <SelectItem value="2">2ª Época</SelectItem>
                        <SelectItem value="especial">Época Especial</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={e.semestre ?? ""} onValueChange={v => update(e.id, { semestre: v === "" ? null : (v as Semestre) })}>
                      <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Semestre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1º Semestre</SelectItem>
                        <SelectItem value="2">2º Semestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Input value={e.titulo} onChange={ev => update(e.id, { titulo: ev.target.value })} className="h-8 text-xs" />
                )}
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
        </TabsContent>
      </Tabs>



    </div>
  );
}
