import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, CalendarClock, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { loadDocentes, syncDocentesFromDb, type DocenteRow } from "@/lib/peopleStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Etapa = {
  id: string;
  nome: string;
  ordem: number;
  agenda: boolean;
  obrigatoria: boolean;
  estados_possiveis: string[];
};

type Sessao = {
  id: string;
  etapa_id: string;
  mode: "" | "dia" | "dias" | "periodo";
  datas: string[];
  data_fim: string | null;
  hora: string | null;
  horas: string[];
  local: string | null;
  responsavel_id: string | null;
  capacidade: number | null;
};

type EstadoDef = { id?: string; key: string; label: string; color: string; descricao?: string | null; is_default?: boolean; ordem?: number };

const COR_OPCOES: { label: string; value: string }[] = [
  { label: "Verde",    value: "bg-green-100 text-green-700 border-green-200" },
  { label: "Âmbar",    value: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
  { label: "Azul",     value: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Cinza",    value: "bg-slate-100 text-slate-700 border-slate-200" },
  { label: "Violeta",  value: "bg-violet-100 text-violet-700 border-violet-200" },
];

const DEFAULT_ESTADOS: Omit<EstadoDef, "id">[] = [
  { key: "agendado",  label: "Agendado",  color: "bg-blue-100 text-blue-700 border-blue-200",       descricao: "Sessão marcada, aguarda realização.", is_default: true, ordem: 0 },
  { key: "completo",  label: "Completo",  color: "bg-green-100 text-green-700 border-green-200",    descricao: "Etapa concluída pelo candidato.",     is_default: true, ordem: 1 },
  { key: "remarcado", label: "Remarcado", color: "bg-amber-100 text-amber-700 border-amber-200",    descricao: "Data alterada para nova sessão.",     is_default: true, ordem: 2 },
  { key: "aprovado",  label: "Aprovado",  color: "bg-green-100 text-green-700 border-green-200",    descricao: "Candidato aprovado nesta etapa.",     is_default: true, ordem: 3 },
  { key: "reprovado", label: "Reprovado", color: "bg-red-100 text-red-700 border-red-200",          descricao: "Candidato reprovado nesta etapa.",    is_default: true, ordem: 4 },
];

const nextColor = (i: number) => COR_OPCOES[i % COR_OPCOES.length].value;

const parseIsoLocal = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? undefined : d;
};
const formatIsoLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};





const DEFAULT_ETAPAS = [
  { nome: "Submissão da candidatura (online)", ordem: 0, agenda: false, obrigatoria: true, estados_possiveis: ["completo"] },
  { nome: "Entrevista",               ordem: 1, agenda: true,  obrigatoria: true, estados_possiveis: ["agendado", "completo", "remarcado"] },
  { nome: "Curso Preparatório",       ordem: 2, agenda: true,  obrigatoria: false, estados_possiveis: ["agendado", "completo", "remarcado"] },
  { nome: "Exame de Acesso",          ordem: 3, agenda: true,  obrigatoria: true, estados_possiveis: ["agendado", "aprovado", "reprovado", "remarcado"] },
];
const PROTECTED_NAMES = new Set(DEFAULT_ETAPAS.map(d => d.nome.toLowerCase()));
const isProtected = (nome: string) => PROTECTED_NAMES.has((nome || "").trim().toLowerCase());


export default function CandidaturasEtapasConfig({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [geopontos, setGeopontos] = useState<{ id: string; sigla: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("edificios").select("id,sigla,nome").order("sigla").then(({ data }) => setGeopontos(data ?? []));
  }, []);
  const [docentes, setDocentes] = useState<DocenteRow[]>(() => loadDocentes());
  const [estadosAll, setEstadosAll] = useState<EstadoDef[]>([]);
  const [newEstado, setNewEstado] = useState("");

  const estadoMeta = (k: string): EstadoDef =>
    estadosAll.find(e => e.key === k) ?? { key: k, label: k, color: "bg-muted text-foreground border-border" };

  useEffect(() => {
    syncDocentesFromDb().then(setDocentes).catch(() => {});
    const onChange = () => setDocentes(loadDocentes());
    window.addEventListener("upra:people-changed", onChange);
    return () => window.removeEventListener("upra:people-changed", onChange);
  }, []);

  const load = async () => {
    setLoading(true);
    const [e, s, es] = await Promise.all([
      supabase.from("candidaturas_etapas").select("*").order("ordem"),
      supabase.from("candidaturas_sessoes").select("*"),
      (supabase.from as any)("candidaturas_estados").select("*").order("ordem"),
    ]);
    let etapasRows = (e.error ? [] : (e.data ?? [])) as Etapa[];
    if (!e.error && authUserId) {
      const existing = new Set(etapasRows.map(r => (r.nome || "").trim().toLowerCase()));
      const missing = DEFAULT_ETAPAS.filter(d => !existing.has(d.nome.toLowerCase()))
        .map(d => ({ ...d, owner_user_id: authUserId }));
      if (missing.length) {
        const ins = await supabase.from("candidaturas_etapas").insert(missing).select("*");
        if (!ins.error) etapasRows = [...etapasRows, ...((ins.data ?? []) as Etapa[])].sort((a, b) => a.ordem - b.ordem);
      }
    }
    setEtapas(etapasRows);

    if (!s.error) setSessoes(((s.data ?? []) as any[]).map(r => ({ ...r, mode: r.mode ?? "", horas: Array.isArray(r.horas) ? r.horas : [] })) as Sessao[]);

    let estadosRows = (es.error ? [] : (es.data ?? [])) as EstadoDef[];
    if (!es.error && authUserId) {
      const existingKeys = new Set(estadosRows.map(r => r.key));
      const missing = DEFAULT_ESTADOS.filter(d => !existingKeys.has(d.key))
        .map(d => ({ ...d, owner_user_id: authUserId }));
      if (missing.length) {
        const ins = await (supabase.from as any)("candidaturas_estados").insert(missing).select("*");
        if (!ins.error) estadosRows = [...estadosRows, ...((ins.data ?? []) as EstadoDef[])]
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      }
    }
    setEstadosAll(estadosRows);
    setLoading(false);
  };
  useEffect(() => { load(); }, [authUserId]);


  // Auto-create sessão row for every etapa with agenda=true
  useEffect(() => {
    if (loading) return;
    const need = etapas.filter(e => e.agenda && !sessoes.some(s => s.etapa_id === e.id));
    if (!need.length) return;
    (async () => {
      for (const et of need) {
        await supabase.from("candidaturas_sessoes").insert({
          etapa_id: et.id,
          owner_user_id: authUserId,
          mode: "",
          datas: [],
        });
      }
      load();
    })();
  }, [etapas, sessoes, loading, authUserId]);

  const addEtapa = async () => {
    const { data, error } = await supabase.from("candidaturas_etapas").insert({
      nome: "", ordem: etapas.length, owner_user_id: authUserId,
      agenda: false, obrigatoria: false, estados_possiveis: [],
    }).select("*").single();
    if (error) { toast.error(error.message); return; }
    setEtapas(prev => [...prev, data as Etapa]);
    // focus the new row's name input
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-etapa-id="${(data as Etapa).id}"]`);
      el?.focus();
    }, 50);
  };


  const updEtapa = async (id: string, patch: Partial<Etapa>) => {
    const { error } = await supabase.from("candidaturas_etapas").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEtapas(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const rmEtapa = async (id: string, nome: string) => {
    
    if (!confirm(`Remover etapa "${nome}"?`)) return;
    const { error } = await supabase.from("candidaturas_etapas").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };


  const addEstado = async () => {
    const label = newEstado.trim() || `Estado ${estadosAll.length + 1}`;
    const base = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 32) || "estado";
    let key = base;
    let i = 1;
    while (estadosAll.some(e => e.key === key)) { key = `${base}-${i++}`; }
    const row = { key, label, color: nextColor(estadosAll.length), ordem: estadosAll.length, owner_user_id: authUserId, is_default: false };
    const { data, error } = await (supabase.from as any)("candidaturas_estados").insert(row).select("*").single();
    if (error) { toast.error(error.message); return; }
    setEstadosAll(prev => [...prev, data as EstadoDef]);
    setNewEstado("");
  };
  const rmEstado = async (est: EstadoDef) => {
    if (est.is_default) { toast.error("Estado predefinido — não pode ser removido."); return; }
    if (!est.id) return;
    const { error } = await (supabase.from as any)("candidaturas_estados").delete().eq("id", est.id);
    if (error) { toast.error(error.message); return; }
    setEstadosAll(prev => prev.filter(e => e.key !== est.key));
    etapas.forEach(et => {
      if (et.estados_possiveis.includes(est.key)) {
        updEtapa(et.id, { estados_possiveis: et.estados_possiveis.filter(k => k !== est.key) });
      }
    });
  };
  const updEstado = async (est: EstadoDef, patch: Partial<EstadoDef>) => {
    setEstadosAll(prev => prev.map(e => e.key === est.key ? { ...e, ...patch } : e));
    if (!est.id) return;
    const { error } = await (supabase.from as any)("candidaturas_estados").update(patch).eq("id", est.id);
    if (error) toast.error(error.message);
  };

  const toggleEstado = (et: Etapa, key: string) => {
    const has = et.estados_possiveis.includes(key);
    const next = has ? et.estados_possiveis.filter(k => k !== key) : [...et.estados_possiveis, key];
    updEtapa(et.id, { estados_possiveis: next });
  };



  const updSessao = async (id: string, patch: Partial<Sessao>) => {
    const { error } = await supabase.from("candidaturas_sessoes").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSessoes(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const toggleSessaoData = (s: Sessao, data: string) => {
    const has = s.datas.includes(data);
    const next = has ? s.datas.filter(d => d !== data) : [...s.datas, data].sort();
    updSessao(s.id, { datas: next });
  };

  const sessoesAgendadas = useMemo(() => {
    return etapas.filter(e => e.agenda).map(et => ({
      etapa: et,
      sessao: sessoes.find(s => s.etapa_id === et.id),
    }));
  }, [etapas, sessoes]);

  return (
    <fieldset disabled={readOnly} className="space-y-4 disabled:opacity-100">
      <div className="space-y-4">

      {/* ESTADOS POSSÍVEIS (padrão GAP: designação, descrição, cor, pré-visualização) */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Estados de candidatura</h2>
            <p className="text-[11px] text-muted-foreground">Fases do ciclo de vida de uma candidatura (ex: Agendado, Completo, Aprovado).</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">
            {estadosAll.length} estado{estadosAll.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Descrição</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div className="text-right">Ação</div>
          </div>
          {estadosAll.map(es => {
            const isDefault = DEFAULT_ESTADO_KEYS.has(es.key);
            return (
              <div key={es.key} className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                <Input className="h-9" placeholder="Ex: Agendado" value={es.label}
                  disabled={readOnly} readOnly={readOnly}
                  onChange={e => updEstado(es.key, { label: e.target.value })} />
                <Input className="h-9" placeholder="Descrição curta do estado" value={es.descricao ?? ""}
                  disabled={readOnly} readOnly={readOnly}
                  onChange={e => updEstado(es.key, { descricao: e.target.value })} />
                <select className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                  value={es.color} disabled={readOnly}
                  onChange={e => updEstado(es.key, { color: e.target.value })}>
                  {COR_OPCOES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium", es.color)}>
                  {es.label || "—"}
                </span>
                <div className="flex justify-end">
                  {!readOnly && !isDefault && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => rmEstado(es.key)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!readOnly && (
          <div className="px-5 py-3 border-t bg-muted/10">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addEstado}>
              <Plus className="w-3.5 h-3.5" /> Adicionar estado
            </Button>
          </div>
        )}
      </Card>


      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Etapas do Processo</p>
            <p className="text-[11px] text-muted-foreground">{etapas.length} etapa{etapas.length === 1 ? "" : "s"} · dados reais partilhados com GAP</p>
          </div>
          {!readOnly && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addEtapa}>
              <Plus className="w-3 h-3" /> Adicionar Etapa
            </Button>
          )}
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Etapa</th>
                <th className="px-3 py-2 text-center w-24">Obrigatória</th>
                <th className="px-3 py-2 text-center w-20">Agenda</th>
                <th className="px-3 py-2 text-left">Estados possíveis</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">A carregar…</td></tr>
              ) : etapas.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground italic">Sem etapas configuradas.</td></tr>
              ) : etapas.map(et => {
                return (
                <tr key={et.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Input value={et.nome} data-etapa-id={et.id}
                        placeholder="Nome da etapa"
                        onChange={e => setEtapas(p => p.map(x => x.id === et.id ? { ...x, nome: e.target.value } : x))}
                        onBlur={e => updEtapa(et.id, { nome: e.target.value })}
                        disabled={readOnly} readOnly={readOnly}
                        className="h-8 text-xs" />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Checkbox checked={et.obrigatoria} disabled={readOnly} onCheckedChange={v => updEtapa(et.id, { obrigatoria: !!v })} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Checkbox checked={et.agenda} disabled={readOnly} onCheckedChange={v => updEtapa(et.id, { agenda: !!v })} />
                  </td>
                  <td className="px-3 py-2">
                    <Popover>
                      <PopoverTrigger asChild disabled={readOnly}>
                        <button className="flex flex-wrap gap-1 min-h-[28px] w-full hover:bg-muted/30 rounded px-1 py-0.5 disabled:cursor-default disabled:hover:bg-transparent">
                          {et.estados_possiveis.length === 0 ? (
                            <span className="text-muted-foreground italic text-[11px]">Nenhum</span>
                          ) : et.estados_possiveis.map(k => {
                            const m = estadoMeta(k);
                            return <Badge key={k} variant="outline" className={cn("text-[10px]", m.color)}>{m.label}</Badge>;
                          })}
                          {!readOnly && <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground self-center" />}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-56 p-2 space-y-1">
                        {estadosAll.map(e => (
                          <label key={e.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-xs">
                            <Checkbox checked={et.estados_possiveis.includes(e.key)} onCheckedChange={() => toggleEstado(et, e.key)} />
                            <Badge variant="outline" className={cn("text-[10px]", e.color)}>{e.label}</Badge>
                          </label>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </td>
                  <td className="px-2 py-2">
                    {!readOnly && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => rmEtapa(et.id, et.nome)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>

                </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>



      {/* SESSÕES AGENDADAS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" /> Sessões Agendadas
            </p>
            <p className="text-[11px] text-muted-foreground">Uma sessão automática por cada etapa com Agenda ativa.</p>
          </div>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Etapa</th>
                <th className="px-2 py-2 text-left w-24">Opção</th>
                <th className="px-2 py-2 text-left">Datas</th>
                <th className="px-2 py-2 text-left w-24"><Clock className="w-3 h-3 inline mr-1" />Hora</th>
                <th className="px-2 py-2 text-left w-32"><MapPin className="w-3 h-3 inline mr-1" />Local</th>
                <th className="px-2 py-2 text-left w-40">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {sessoesAgendadas.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground italic">
                  Sem etapas agendáveis. Ative "Agenda" numa etapa acima para criar uma sessão.
                </td></tr>
              ) : sessoesAgendadas.map(({ etapa, sessao }) => {
                if (!sessao) return null;
                return (
                  <tr key={etapa.id} className="border-t align-top">
                    <td className="px-3 py-2 font-medium">{etapa.nome}</td>
                    <td className="px-2 py-2">
                      <Select value={sessao.mode || "none"} onValueChange={(v: "none" | "dia" | "dias" | "periodo") => {
                        if (v === "none") return;
                        updSessao(sessao.id, {
                          mode: v,
                          datas: v === "periodo" ? (sessao.datas[0] ? [sessao.datas[0]] : []) : (v === "dia" ? sessao.datas.slice(0, 1) : sessao.datas),
                          data_fim: v === "periodo" ? (sessao.data_fim || null) : null,
                        });
                      }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>—</SelectItem>
                          <SelectItem value="dia">Dia</SelectItem>
                          <SelectItem value="dias">Dias</SelectItem>
                          <SelectItem value="periodo">Período</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-2">
                      {sessao.mode === "periodo" ? (
                        <div className="grid grid-cols-2 gap-1.5 min-w-[260px]">
                          <div className="space-y-1">
                            <span className="text-[10px] font-medium text-muted-foreground">De</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-start font-normal">
                                  {sessao.datas[0] || <span className="text-muted-foreground">Escolher</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={parseIsoLocal(sessao.datas[0])}
                                  defaultMonth={parseIsoLocal(sessao.datas[0]) ?? parseIsoLocal(sessao.data_fim ?? undefined) ?? new Date()}
                                  onSelect={d => updSessao(sessao.id, { datas: d ? [formatIsoLocal(d)] : [] })}
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-medium text-muted-foreground">Até</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-start font-normal">
                                  {sessao.data_fim || <span className="text-muted-foreground">Escolher</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={parseIsoLocal(sessao.data_fim ?? undefined)}
                                  defaultMonth={parseIsoLocal(sessao.data_fim ?? undefined) ?? parseIsoLocal(sessao.datas[0]) ?? new Date()}
                                  onSelect={d => updSessao(sessao.id, { data_fim: d ? formatIsoLocal(d) : null })}
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ) : sessao.mode === "dia" ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-start font-normal">
                              {sessao.datas[0] || <span className="text-muted-foreground">Escolher data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={parseIsoLocal(sessao.datas[0])}
                              onSelect={d => updSessao(sessao.id, { datas: d ? [formatIsoLocal(d)] : [] })} />
                          </PopoverContent>
                        </Popover>
                      ) : sessao.mode === "dias" ? (
                        <div className="space-y-1.5">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-start font-normal">
                                {sessao.datas.length > 0 ? `${sessao.datas.length} data${sessao.datas.length === 1 ? "" : "s"}` : <span className="text-muted-foreground">Escolher datas</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="multiple" selected={sessao.datas.map(parseIsoLocal).filter((d): d is Date => Boolean(d))}
                                onSelect={(ds) => {
                                  const newDatas = (ds || []).map(formatIsoLocal).sort();
                                  const oldMap = new Map(sessao.datas.map((d, i) => [d, sessao.horas[i] || ""]));
                                  const newHoras = newDatas.map(d => oldMap.get(d) || "");
                                  updSessao(sessao.id, { datas: newDatas, horas: newHoras });
                                }} />
                            </PopoverContent>
                          </Popover>
                          {sessao.datas.length > 0 && (
                            <div className="space-y-1">
                              {sessao.datas.map((d, i) => (
                                <div key={d} className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] shrink-0">{d}</Badge>
                                  <Input type="time" className="h-7 text-xs flex-1" value={sessao.horas[i] || ""}
                                    onChange={e => {
                                      const next = [...sessao.horas];
                                      while (next.length < sessao.datas.length) next.push("");
                                      next[i] = e.target.value;
                                      updSessao(sessao.id, { horas: next });
                                    }} />
                                  <button onClick={() => {
                                    const newDatas = sessao.datas.filter(x => x !== d);
                                    const newHoras = sessao.horas.filter((_, j) => j !== i);
                                    updSessao(sessao.id, { datas: newDatas, horas: newHoras });
                                  }} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Escolha uma opção</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {sessao.mode === "dias" ? (
                        <span className="text-[10px] text-muted-foreground italic">por data</span>
                      ) : (
                        <Input type="time" className="h-8 text-xs" value={sessao.hora || ""} onChange={e => updSessao(sessao.id, { hora: e.target.value })} />
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <Select value={sessao.local || "none"} onValueChange={v => {
                        if (v === "none") return;
                        updSessao(sessao.id, { local: v });
                      }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={geopontos.length ? "Geoponto" : "Sem geopontos"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>{geopontos.length ? "Geoponto" : "Sem geopontos"}</SelectItem>
                          {geopontos.length === 0 ? (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">Sem geopontos</div>
                          ) : geopontos.map(g => (
                            <SelectItem key={g.id} value={g.sigla || g.nome}>{g.sigla ? `${g.sigla} — ${g.nome}` : g.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-2">
                      <Select value={sessao.responsavel_id || "none"} onValueChange={v => {
                        if (v === "none") return;
                        updSessao(sessao.id, { responsavel_id: v });
                      }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={docentes.length ? "Docente" : "Sem docentes"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>{docentes.length ? "Docente" : "Sem docentes"}</SelectItem>
                          {docentes.length === 0 ? (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">Sem docentes</div>
                          ) : docentes.map(d => (
                            <SelectItem key={d.id} value={d.id}>{[d.primeiroNome, d.ultimoNome].filter(Boolean).join(" ") || d.email || "Docente"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    </fieldset>

  );
}

