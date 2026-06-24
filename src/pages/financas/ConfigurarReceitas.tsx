import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import {
  ArrowLeft, Banknote, Building2, GraduationCap, Loader2, Save, AlertCircle,
  Receipt, Wallet, Plus, Trash2, TrendingUp, TrendingDown, CreditCard,
  Users, Briefcase, BookOpenCheck, Settings2, Percent, Check, FileText, FileCheck2,
  ChevronDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFaculdades, useCursos, usePropinas, useUpdatePropina } from "@/lib/useInstitution";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Configurar Finanças — página única ligada ao onboarding.
 *
 * Estrutura espelha o módulo Finanças real (Receitas, Despesas, Salários,
 * Multas) para que a configuração corresponda exatamente ao que é depois
 * apresentado nas tabelas operacionais. Tudo aqui alimenta o backend ou o
 * estado local da instituição — nenhum dado de demonstração.
 */

type Tab = "receitas" | "despesas" | "salarios" | "multas";

type LineItem = { id: string; nome: string; valor: number; unidade?: string; tipo?: string; aplicaA?: "estudante" | "docente" | "staff" | "todos"; impostoId?: string };

const KEY = (kind: string, email?: string | null) => `upra.fin.cfg.${kind}::${email || "anon"}`;
const newId = () => Math.random().toString(36).slice(2, 10);
const fmt = (v: number) => v.toLocaleString("pt-AO", { maximumFractionDigits: 0 });
const readJSON = <T,>(k: string, fb: T): T => { try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : fb; } catch { return fb; } };
const writeJSON = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } };

const TAB_DEFS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "receitas", label: "Receitas", icon: TrendingUp },
  { id: "despesas", label: "Despesas", icon: TrendingDown },
  { id: "salarios", label: "Salários", icon: CreditCard },
  { id: "multas", label: "Multas", icon: Banknote },
];

// Map onboarding step keys → tab IDs so banner ↔ page stay in sync
const STEP_TO_TAB: Record<string, Tab> = {
  "fin.pro": "receitas",
  "fin.des": "despesas",
  "fin.sal": "salarios",
  "fin.mul": "multas",
};

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const stepKey = params.get("step") || "";
  const initialTab = (params.get("tab") as Tab) || STEP_TO_TAB[stepKey] || "receitas";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const next = (params.get("tab") as Tab) || STEP_TO_TAB[params.get("step") || ""] || "receitas";
    if (next !== tab) setTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const changeTab = (next: Tab) => {
    setTab(next);
    const np = new URLSearchParams(params);
    np.set("tab", next);
    setParams(np, { replace: true });
  };

  const confirmCurrentStep = () => {
    const key = Object.entries(STEP_TO_TAB).find(([, value]) => value === tab)?.[0];
    if (key) markOnboardingStepDone(user?.email, key);
    toast.success("Configuração confirmada");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <OnboardingStepBanner />

      <FinHeader
        title="Configurar Finanças"
        subtitle="Receitas, despesas, salários e multas — base que alimenta todo o módulo financeiro."
        icon={<Settings2 className="w-5 h-5 text-primary" />}
      />

      <Tabs value={tab} onValueChange={(v) => changeTab(v as Tab)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {TAB_DEFS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {tab === "receitas" && <ReceitasSection email={user?.email} onAddCursos={() => navigate("/admin/faculdades-cursos")} />}
      {tab === "despesas" && <DespesasSection email={user?.email} />}
      {tab === "salarios" && <SalariosSection email={user?.email} />}
      {tab === "multas" && <MultasSection email={user?.email} />}
    </div>
  );
}

/* ═══════════════════════════════ RECEITAS ═════════════════════════════════ */

export type Imposto = { id: string; nome: string; taxa: number; regime: string; locked?: boolean };
const IMPOSTOS_KEY = (email?: string | null) => KEY("impostos", email);
const ANOS_KEY = (email?: string | null) => KEY("propinas.anos", email);
// Taxas reais de IVA em Angola (Código do IVA, Lei n.º 14/23)
const REGIMES_IVA: { regime: string; taxa: number; label: string; custom?: boolean }[] = [
  { regime: "Geral", taxa: 0.14, label: "Geral — 14%" },
  { regime: "Intermédio", taxa: 0.07, label: "Intermédio — 7%" },
  { regime: "Reduzido", taxa: 0.05, label: "Reduzido — 5%" },
  { regime: "Personalizado", taxa: 0, label: "Personalizado", custom: true },
];
const REGIMES = REGIMES_IVA.map((r) => r.regime);
const taxaForRegime = (regime: string) => REGIMES_IVA.find((r) => r.regime === regime)?.taxa ?? 0;
const isCustomRegime = (regime: string) => !!REGIMES_IVA.find((r) => r.regime === regime)?.custom;
const nomeForImposto = (regime: string, taxa: number) =>
  isCustomRegime(regime) ? `Personalizado ${(taxa * 100).toFixed(0)}%` : `IVA ${regime} ${(taxa * 100).toFixed(0)}%`;

const LOCKED_IMPOSTOS: Imposto[] = [
  { id: "isento", nome: "Isento — 0%", taxa: 0, regime: "Isento", locked: true },
  { id: "iva-geral", nome: nomeForImposto("Geral", 0.14), taxa: 0.14, regime: "Geral" },
  { id: "iva-intermedio", nome: nomeForImposto("Intermédio", 0.07), taxa: 0.07, regime: "Intermédio" },
  { id: "iva-reduzido", nome: nomeForImposto("Reduzido", 0.05), taxa: 0.05, regime: "Reduzido" },
];

const COR_OPCOES_GLOBAL = [
  { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Verde", value: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
  { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
  { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
  { label: "Primário", value: "bg-primary/10 text-primary border-primary/20" },
];

type CatItem = { nome: string; cor: string };
const migrateCats = (raw: unknown, fallback: string[]): CatItem[] => {
  if (Array.isArray(raw) && raw.length) {
    return raw.map((x) =>
      typeof x === "string"
        ? { nome: x, cor: COR_OPCOES_GLOBAL[6].value }
        : { nome: String((x as CatItem)?.nome ?? ""), cor: String((x as CatItem)?.cor ?? COR_OPCOES_GLOBAL[6].value) }
    );
  }
  return fallback.map((n) => ({ nome: n, cor: COR_OPCOES_GLOBAL[6].value }));
};

type RecSub = "impostos" | "propinas" | "emolumentos" | "servicos";

function ReceitasSection({ email, onAddCursos }: { email?: string | null; onAddCursos: () => void }) {
  const [sub, setSub] = useState<RecSub>("impostos");
  const [impostos, setImpostos] = useState<Imposto[]>(() => {
    const saved = readJSON<Imposto[]>(IMPOSTOS_KEY(email), []);
    const merged = [...LOCKED_IMPOSTOS];
    saved.forEach((s) => { if (!s.locked && !merged.find((m) => m.id === s.id)) merged.push(s); });
    return merged;
  });
  useEffect(() => writeJSON(IMPOSTOS_KEY(email), impostos), [impostos, email]);

  return (
    <div className="space-y-6">
      <Tabs value={sub} onValueChange={(v) => setSub(v as RecSub)}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="impostos" className="gap-1.5"><Percent className="w-3.5 h-3.5" /> Impostos</TabsTrigger>
          <TabsTrigger value="propinas" className="gap-1.5"><Wallet className="w-3.5 h-3.5" /> Propinas</TabsTrigger>
          <TabsTrigger value="emolumentos" className="gap-1.5"><Receipt className="w-3.5 h-3.5" /> Emolumentos</TabsTrigger>
          <TabsTrigger value="servicos" className="gap-1.5"><BookOpenCheck className="w-3.5 h-3.5" /> Serviços Académicos</TabsTrigger>
        </TabsList>
      </Tabs>

      {sub === "impostos" && <ImpostosBlock impostos={impostos} setImpostos={setImpostos} email={email} />}
      {sub === "propinas" && <PropinasBlock email={email} impostos={impostos} onAddCursos={onAddCursos} />}
      {sub === "emolumentos" && <EmolumentosBlock email={email} impostos={impostos} />}
      {sub === "servicos" && <ServicosAcademicosBlock email={email} impostos={impostos} />}
    </div>
  );
}

function ImpostosBlock({ impostos, setImpostos, email }: { impostos: Imposto[]; setImpostos: React.Dispatch<React.SetStateAction<Imposto[]>>; email?: string | null }) {
  const add = () => setImpostos((s) => [...s, { id: newId(), nome: nomeForImposto("Personalizado", 0), taxa: 0, regime: "Personalizado" }]);
  const [nomeLegal, setNomeLegal] = useState<string>("");
  const [nif, setNif] = useState<string>("");
  const [fiscalSaving, setFiscalSaving] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await supabase.rpc("get_institution_fiscal");
        const row = Array.isArray(data) ? data[0] : data;
        if (cancelled) return;
        setNomeLegal(row?.nome_legal ?? "");
        setNif(row?.nif ?? "");
      } catch { /* ignore */ }
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [email]);

  const saveFiscal = async (next: { nomeLegal?: string; nif?: string }) => {
    setFiscalSaving(true);
    try {
      await (supabase.rpc as any)("set_institution_fiscal", {
        _nome_legal: next.nomeLegal ?? nomeLegal ?? "",
        _nif: next.nif ?? nif ?? "",
      });
      toast.success("Identificação institucional atualizada.");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao guardar.");
    } finally {
      setFiscalSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Identificação Institucional</h2>
            <p className="text-[11px] text-muted-foreground">Partilhado com Admin → Meu Perfil. Editável aqui — guarda na base de dados ao sair do campo.</p>
          </div>
          {fiscalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />}
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome Legal</Label>
            <Input
              value={nomeLegal}
              onChange={(e) => setNomeLegal(e.target.value)}
              onBlur={() => saveFiscal({ nomeLegal })}
              placeholder="Ex: Universidade Privada de Angola, SA"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Número de Identificação Fiscal (NIF)</Label>
            <Input
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              onBlur={() => saveFiscal({ nif })}
              placeholder="Ex: 5417000000"
              className="h-9 font-mono tabular-nums"
            />
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Impostos & Regime de IVA</h2>
            <p className="text-[11px] text-muted-foreground">Regimes de IVA de Angola bloqueados. Adicione apenas impostos personalizados.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{impostos.length} imposto{impostos.length === 1 ? "" : "s"}</span>
        </div>
      <div className="divide-y">
        <div className="grid grid-cols-[1fr_160px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
          <div>Regime de IVA (Angola)</div>
          <div className="text-right">Taxa (%)</div>
        </div>
        {impostos.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem impostos configurados.</div>
        ) : impostos.map((i) => {
          const locked = i.locked;
          const regimeInList = REGIMES_IVA.find((r) => r.regime === i.regime);
          return (
          <div key={i.id} className="grid grid-cols-[1fr_160px] gap-3 px-5 py-2.5 items-center text-sm">
            <select className={`h-9 rounded-md border border-input bg-background px-2 text-sm ${locked ? "pointer-events-none opacity-70" : ""}`} value={i.regime}
              disabled={locked}
              onChange={(e) => {
                const regime = e.target.value;
                const nowCustom = isCustomRegime(regime);
                const taxa = nowCustom ? i.taxa : taxaForRegime(regime);
                setImpostos((s) => s.map((x) => x.id === i.id ? { ...x, regime, taxa, nome: nomeForImposto(regime, taxa) } : x));
              }}>
              {REGIMES_IVA.map((r) => <option key={r.regime} value={r.regime}>{r.label}</option>)}
              {!regimeInList && <option value={i.regime}>{i.nome}</option>}
            </select>
            {locked ? (
              <div className="text-right tabular-nums font-medium text-foreground">{(i.taxa * 100).toFixed(0)}%</div>
            ) : (
              <Input type="number" min={0} max={100} step={1} className="h-9 text-right tabular-nums" value={Math.round(i.taxa * 100)}
                onChange={(e) => {
                  const taxa = Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100;
                  setImpostos((s) => s.map((x) => x.id === i.id ? { ...x, taxa, nome: nomeForImposto(x.regime, taxa) } : x));
                }} />
            )}
          </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t bg-muted/10">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={add}><Plus className="w-3.5 h-3.5" /> Adicionar imposto personalizado</Button>
      </div>
      </Card>
    </div>
  );
}

const PRAZO_KEY = (email?: string | null) => KEY("propinas.prazo", email);
const PRAZOS_CFG_KEY = (email?: string | null) => KEY("propinas.prazos.cfg", email);

type PrazoCfg = { id: string; nome: string; meses: number };
const DEFAULT_PRAZOS: PrazoCfg[] = [
  { id: "p10", nome: "10 meses", meses: 10 },
  { id: "p12", nome: "12 meses", meses: 12 },
];

function PropinasBlock({ email, impostos, onAddCursos }: { email?: string | null; impostos: Imposto[]; onAddCursos: () => void }) {
  const { data: faculdades = [], isLoading: lF } = useFaculdades();
  const { data: cursos = [], isLoading: lC } = useCursos();
  const { data: propinas = [], isLoading: lP } = usePropinas();
  const updatePropina = useUpdatePropina();
  const [draft, setDraft] = useState<Record<string, { valor: string; impostoId: string }>>({});
  const [anosByCurso, setAnosByCurso] = useState<Record<string, number[]>>(() => readJSON(ANOS_KEY(email), {}));
  const [prazoByCurso, setPrazoByCurso] = useState<Record<string, number[]>>(() => {
    const raw = readJSON<Record<string, number | string | (number | string)[]>>(PRAZO_KEY(email), {});
    const norm: Record<string, number[]> = {};
    Object.entries(raw).forEach(([k, v]) => {
      const arr = Array.isArray(v) ? v : [v];
      const nums = arr.map((x) => Number(x)).filter((n) => !Number.isNaN(n) && n > 0);
      if (nums.length) norm[k] = Array.from(new Set(nums));
    });
    return norm;
  });
  const [prazosCfg, setPrazosCfg] = useState<PrazoCfg[]>(() => {
    const raw = readJSON<PrazoCfg[]>(PRAZOS_CFG_KEY(email), DEFAULT_PRAZOS);
    return Array.isArray(raw) && raw.length ? raw : DEFAULT_PRAZOS;
  });
  useEffect(() => writeJSON(PRAZOS_CFG_KEY(email), prazosCfg), [prazosCfg, email]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => writeJSON(ANOS_KEY(email), anosByCurso), [anosByCurso, email]);
  useEffect(() => writeJSON(PRAZO_KEY(email), prazoByCurso), [prazoByCurso, email]);

  const propinaByCurso = useMemo(() => {
    const m = new Map<string, { valor_mensal: number; imposto: number }>();
    propinas.forEach((p) => m.set(p.curso_id, { valor_mensal: Number(p.valor_mensal) || 0, imposto: Number(p.imposto) || 0 }));
    return m;
  }, [propinas]);

  const findImpostoIdByTaxa = (taxa: number) => impostos.find((i) => Math.abs(i.taxa - taxa) < 0.0001)?.id || "";

  const facWithCursos = useMemo(
    () => faculdades.map((f) => ({ ...f, cursos: cursos.filter((c) => c.faculdade_id === f.id) })),
    [faculdades, cursos],
  );

  const loading = lF || lC || lP;

  const save = async (cursoId: string) => {
    const d = draft[cursoId];
    const cur = propinaByCurso.get(cursoId) ?? { valor_mensal: 0, imposto: 0 };
    const valor = d?.valor !== undefined ? Number(d.valor) : cur.valor_mensal;
    const impostoObj = d?.impostoId ? impostos.find((i) => i.id === d.impostoId) : impostos.find((i) => Math.abs(i.taxa - cur.imposto) < 0.0001);
    const taxa = impostoObj?.taxa ?? cur.imposto;
    if (Number.isNaN(valor) || valor < 0) { toast.error("Valor inválido"); return; }
    await updatePropina.mutateAsync({ curso_id: cursoId, valor_mensal: valor, imposto: taxa });
    setDraft((s) => { const n = { ...s }; delete n[cursoId]; return n; });
    toast.success("Propina confirmada");
  };

  // Column template — explicit so headers + rows align perfectly
  // Faculdade·Curso | Propina mensal | Regime | Meses | Propina mensal c/ IVA incl. | Propina bruta total | Líquido total | Ação
  const COLS = "minmax(220px,1.4fr) 150px 160px 120px 150px 150px 150px 130px";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">Propinas por curso</h2>
          <p className="text-[11px] text-muted-foreground">Cada curso + nº de pagamentos é um produto. Escolha o intervalo em meses — Líquido total é calculado automaticamente.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar…
        </div>
      ) : facWithCursos.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground text-sm">Sem faculdades nem cursos</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Comece por adicionar faculdades e cursos. Cada curso novo aparece aqui com propina a 0 Kz.
          </p>
          <Button className="mt-4" size="sm" onClick={onAddCursos}>Ir para Faculdades & Cursos</Button>
        </div>
      ) : impostos.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-muted-foreground">
          Configure primeiro os impostos no separador <span className="font-medium text-foreground">Impostos</span>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[1100px] divide-y">
            <div className="grid gap-3 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10" style={{ gridTemplateColumns: COLS }}>
              <div>Faculdade · Curso</div>
              <div>Propina mensal</div>
              <div>Regime</div>
              <div>Prazos</div>
              <div className="text-right">Propina mensal c/ IVA incl.</div>
              <div className="text-right">Propina bruta total</div>
              <div className="text-right">Propina líquida total</div>
              <div className="text-right">Ação</div>
            </div>
            {facWithCursos.flatMap((f) =>
              f.cursos.length === 0
                ? [(
                    <div key={`empty-${f.id}`} className="px-5 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{f.name}</span> · sem cursos
                    </div>
                  )]
                : f.cursos.map((c) => {
                    const p = propinaByCurso.get(c.id) ?? { valor_mensal: 0, imposto: 0 };
                    const d = draft[c.id];
                    const valorVal = d?.valor ?? String(p.valor_mensal);
                    const impostoId = d?.impostoId ?? findImpostoIdByTaxa(p.imposto);
                    const taxa = impostos.find((i) => i.id === impostoId)?.taxa ?? p.imposto;
                    const bruto = Number(valorVal) || 0;
                    const mesesArr = (prazoByCurso[c.id] ?? []).slice().sort((a, b) => a - b);
                    const mesesMax = mesesArr.length ? Math.max(...mesesArr) : 0;
                    const brutaAnual = bruto * (1 + taxa) * mesesMax;
                    const liquidaAnual = bruto * mesesMax;
                    const dirty = d !== undefined;
                    const toggleMes = (m: number) => setPrazoByCurso((s) => {
                      const cur = s[c.id] ?? [];
                      const has = cur.includes(m);
                      const next = has ? cur.filter((x) => x !== m) : [...cur, m].sort((a, b) => a - b);
                      return { ...s, [c.id]: next };
                    });
                    const mesesLabel = mesesArr.length
                      ? mesesArr.map((m) => prazosCfg.find((pc) => pc.meses === m)?.nome ?? `${m} meses`).join(" · ")
                      : "— Selecionar —";
                    return (
                      <div key={c.id}>
                        <div className="grid gap-3 px-5 py-3 items-center text-sm" style={{ gridTemplateColumns: COLS }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">
                                {f.name} · {c.code} · {c.years} anos
                              </p>
                            </div>
                          </div>
                          <Input type="number" min={0} className="h-9 tabular-nums"
                            value={valorVal}
                            onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: e.target.value, impostoId } }))} />
                          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={impostoId}
                            onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: valorVal, impostoId: e.target.value } }))}>
                            <option value="">— Selecionar —</option>
                            {impostos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                          </select>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button type="button"
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm flex items-center justify-between gap-2 hover:bg-muted/40">
                                <span className={mesesArr.length ? "text-foreground truncate" : "text-muted-foreground"}>{mesesLabel}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-44 p-1">
                              {prazosCfg.map((pc) => { const m = pc.meses;
                                const checked = mesesArr.includes(m);
                                return (
                                  <label key={pc.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 cursor-pointer text-sm">
                                    <Checkbox checked={checked} onCheckedChange={() => toggleMes(m)} />
                                    <span>{pc.nome}</span>
                                  </label>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                          <div className="h-9 flex items-center justify-end px-2 rounded-md bg-muted/30 tabular-nums text-sm font-medium text-foreground">{fmt(bruto * (1 + taxa))} Kz</div>
                          <div className="h-9 flex items-center justify-end px-2 rounded-md bg-muted/30 tabular-nums text-sm font-medium text-foreground">{fmt(brutaAnual)} Kz</div>
                          <div className="h-9 flex items-center justify-end px-2 rounded-md bg-muted/30 tabular-nums text-xs font-medium text-muted-foreground">{fmt(liquidaAnual)} Kz</div>
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant={dirty ? "default" : "outline"}
                              disabled={!dirty || updatePropina.isPending}
                              onClick={() => save(c.id)} className="gap-1.5">
                              <Check className="w-3.5 h-3.5" /> Confirmar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }),
            )}
          </div>
        </div>
      )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════ DESPESAS ═════════════════════════════════ */

type DesCategoria = { id: string; nome: string; cor: string; documentos: string[] };
type DesEstado = { id: string; nome: string; cor: string; descricao?: string };
type DesResp = { id: string; pessoa: string; categoria: string; limite: number };

function DespesasSection({ email }: { email?: string | null }) {
  const catKey = KEY("des.categorias", email);
  const estKey = KEY("des.estados", email);
  const respKey = KEY("des.responsaveis", email);

  const [categorias, setCategorias] = useState<DesCategoria[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const reloadCats = async () => {
    const { data, error } = await supabase
      .from("fin_despesa_categorias")
      .select("id, nome, cor, documentos")
      .order("created_at", { ascending: true });
    if (!error && Array.isArray(data)) {
      setCategorias(data.map((r: any) => ({
        id: r.id,
        nome: r.nome || "",
        cor: r.cor || "bg-slate-100 text-slate-700 border-slate-200",
        documentos: Array.isArray(r.documentos) ? r.documentos : [],
      })));
    }
    setCatsLoading(false);
  };
  useEffect(() => { reloadCats(); }, []);
  // Keep localStorage in sync so Despesas.tsx (read path) stays consistent for now.
  useEffect(() => { writeJSON(catKey, categorias); }, [categorias, catKey]);

  const [estados, setEstados] = useState<DesEstado[]>(() => readJSON<DesEstado[]>(estKey, [
    { id: "e1", nome: "Pendente", cor: "bg-amber-100 text-amber-700 border-amber-200", descricao: "Aguarda revisão e aprovação." },
    { id: "e2", nome: "Aprovada", cor: "bg-emerald-100 text-emerald-700 border-emerald-200", descricao: "Validada, pronta para pagamento." },
    { id: "e3", nome: "Rejeitada", cor: "bg-red-100 text-red-700 border-red-200", descricao: "Recusada pelo responsável." },
    { id: "e4", nome: "Paga", cor: "bg-blue-100 text-blue-700 border-blue-200", descricao: "Pagamento efetuado e contabilizado." },
  ]));
  const [responsaveis, setResponsaveis] = useState<DesResp[]>(() => readJSON<DesResp[]>(respKey, []));

  useEffect(() => writeJSON(estKey, estados), [estados, estKey]);
  useEffect(() => writeJSON(respKey, responsaveis), [responsaveis, respKey]);

  // Lock-in dialog for new category
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [draftNome, setDraftNome] = useState("");

  const persistCategoria = async (id: string, patch: Partial<DesCategoria>) => {
    const upd: any = {};
    if (patch.nome !== undefined) upd.nome = patch.nome;
    if (patch.cor !== undefined) upd.cor = patch.cor;
    if (patch.documentos !== undefined) upd.documentos = patch.documentos;
    if (Object.keys(upd).length === 0) return;
    await supabase.from("fin_despesa_categorias").update(upd).eq("id", id);
  };

  const updateCategoriaLocal = (id: string, patch: Partial<DesCategoria>) => {
    setCategorias((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
    persistCategoria(id, patch);
  };

  const removeCategoria = async (id: string) => {
    setCategorias((s) => s.filter((x) => x.id !== id));
    await supabase.from("fin_despesa_categorias").delete().eq("id", id);
  };

  const confirmCreateCategoria = async () => {
    const nome = draftNome.trim();
    if (!nome) { toast.error("Indique a designação."); return; }
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { toast.error("Sessão inválida."); return; }
    const { data, error } = await supabase
      .from("fin_despesa_categorias")
      .insert({ owner_user_id: u.id, nome, cor: COR_OPCOES[0].value, documentos: [] })
      .select("id, nome, cor, documentos")
      .single();
    if (error || !data) { toast.error("Falha ao criar categoria."); return; }
    setCategorias((s) => [...s, {
      id: data.id, nome: data.nome, cor: data.cor,
      documentos: Array.isArray(data.documentos) ? (data.documentos as string[]) : [],
    }]);
    setDraftNome("");
    setConfirmAdd(false);
    toast.success("Categoria bloqueada. Pode agora editar livremente.");
  };


  const COR_OPCOES = [
    { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "Verde", value: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
    { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
    { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
  ];

  const [desTab, setDesTab] = useState<"estados" | "categorias" | "aprovacoes">("estados");
  const desToggles: { key: typeof desTab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { key: "estados",    label: "Estados",    icon: AlertCircle, count: estados.length },
    { key: "categorias", label: "Categorias", icon: TrendingDown, count: categorias.length },
    { key: "aprovacoes", label: "Aprovações", icon: Users,       count: responsaveis.length },
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
        {desToggles.map((t) => {
          const TIcon = t.icon;
          const active = desTab === t.key;
          return (
            <button key={t.key} type="button" onClick={() => setDesTab(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <TIcon className="w-3.5 h-3.5" />
              {t.label}
              <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {desTab === "categorias" && (
      <Card className="overflow-hidden">

        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Categorias de despesa</h2>
            <p className="text-[11px] text-muted-foreground">Rubricas usadas em Finanças → Despesas, com cor de tag e documentos exigidos.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{categorias.length} categoria{categorias.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1.2fr_160px_140px_1.4fr_44px] gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div>Documentos exigidos</div>
            <div className="text-right">Ação</div>
          </div>
          {catsLoading ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">A carregar…</div>
          ) : categorias.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem categorias configuradas.</div>
          ) : categorias.map((c) => {
            const toggleDoc = (doc: string) => {
              const has = c.documentos.includes(doc);
              const next = has ? c.documentos.filter((d) => d !== doc) : [...c.documentos, doc];
              updateCategoriaLocal(c.id, { documentos: next });
            };
            const DocChip = ({ doc, icon: I }: { doc: string; icon: React.ComponentType<{ className?: string }> }) => {
              const active = c.documentos.includes(doc);
              return (
                <button type="button" onClick={() => toggleDoc(doc)}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-background border-input text-muted-foreground hover:bg-muted"
                  }`}>
                  <I className="w-3.5 h-3.5" />
                  {doc}
                  {active && <Check className="w-3 h-3" />}
                </button>
              );
            };
            return (
              <div key={c.id} className="grid grid-cols-[1.2fr_160px_140px_1.4fr_44px] gap-4 px-5 py-3 items-center text-sm">
                <Input className="h-9" placeholder="Ex: Infraestrutura" value={c.nome}
                  onChange={(e) => updateCategoriaLocal(c.id, { nome: e.target.value })} />
                <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.cor}
                  onChange={(e) => updateCategoriaLocal(c.id, { cor: e.target.value })}>
                  {COR_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border text-xs font-medium truncate ${c.cor}`}>{c.nome || "—"}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <DocChip doc="Fatura" icon={FileText} />
                  <DocChip doc="Comprovativo" icon={FileCheck2} />
                </div>
                <div className="flex justify-end">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCategoria(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => { setDraftNome(""); setConfirmAdd(true); }}>
            <Plus className="w-3.5 h-3.5" /> Adicionar categoria
          </Button>
        </div>

        {confirmAdd && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setConfirmAdd(false)}>
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div>
                <h3 className="text-base font-bold">Bloquear nova categoria</h3>
                <p className="text-xs text-muted-foreground mt-1">Indique a designação. Após bloquear, fica registada na base de dados e poderá editar livremente cor e documentos exigidos.</p>
              </div>
              <Input autoFocus value={draftNome} onChange={(e) => setDraftNome(e.target.value)} placeholder="Ex: Infraestrutura" className="h-10" />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setConfirmAdd(false)}>Cancelar</Button>
                <Button size="sm" onClick={confirmCreateCategoria}>Bloquear e adicionar</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
      )}

      {desTab === "estados" && (
      <Card className="overflow-hidden">

        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Estados de despesa</h2>
            <p className="text-[11px] text-muted-foreground">Fases do ciclo de vida de uma despesa (ex: Pendente, Aprovada, Rejeitada, Paga).</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{estados.length} estado{estados.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Descrição</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div className="text-right">Ação</div>
          </div>
          {estados.map((es) => (
            <div key={es.id} className="grid grid-cols-[1fr_1.4fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Aprovada" value={es.nome}
                onChange={(e) => setEstados((s) => s.map((x) => x.id === es.id ? { ...x, nome: e.target.value } : x))} />
              <Input className="h-9" placeholder="Descrição curta do estado" value={es.descricao || ""}
                onChange={(e) => setEstados((s) => s.map((x) => x.id === es.id ? { ...x, descricao: e.target.value } : x))} />
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={es.cor}
                onChange={(e) => setEstados((s) => s.map((x) => x.id === es.id ? { ...x, cor: e.target.value } : x))}>
                {COR_OPCOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium ${es.cor}`}>{es.nome || "—"}</span>
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setEstados((s) => s.filter((x) => x.id !== es.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => setEstados((s) => [...s, { id: newId(), nome: "", cor: COR_OPCOES[0].value, descricao: "" }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar estado
          </Button>
        </div>
      </Card>
      )}

      {desTab === "aprovacoes" && (
      <Card className="overflow-hidden">

        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Responsáveis por aprovação</h2>
            <p className="text-[11px] text-muted-foreground">Quem aprova despesas por categoria e até que limite (Kz). Acima do limite, escala automaticamente.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{responsaveis.length} responsáve{responsaveis.length === 1 ? "l" : "is"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_1fr_160px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Pessoa / Cargo</div>
            <div>Categoria</div>
            <div>Limite aprovação (Kz)</div>
            <div className="text-right">Ação</div>
          </div>
          {responsaveis.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem responsáveis configurados.</div>
          ) : responsaveis.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_1fr_160px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Director Financeiro" value={r.pessoa}
                onChange={(e) => setResponsaveis((s) => s.map((x) => x.id === r.id ? { ...x, pessoa: e.target.value } : x))} />
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={r.categoria}
                onChange={(e) => setResponsaveis((s) => s.map((x) => x.id === r.id ? { ...x, categoria: e.target.value } : x))}>
                <option value="">— Qualquer categoria —</option>
                {categorias.filter((c) => c.nome).map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
              <Input type="number" min={0} className="h-9 tabular-nums" value={r.limite}
                onChange={(e) => setResponsaveis((s) => s.map((x) => x.id === r.id ? { ...x, limite: Number(e.target.value) || 0 } : x))} />
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setResponsaveis((s) => s.filter((x) => x.id !== r.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => setResponsaveis((s) => [...s, { id: newId(), pessoa: "", categoria: "", limite: 0 }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar responsável
          </Button>
        </div>
      </Card>
      )}
    </div>

  );
}

/* ═══════════════════════════════ SALÁRIOS ═════════════════════════════════ */

type SalarioImposto = { id: string; nome: string; percentagem: number };
const DEFAULT_SALARIO_IMPOSTOS: SalarioImposto[] = [
  { id: "irt", nome: "IRT", percentagem: 0 },
  { id: "seg-social", nome: "Segurança Social", percentagem: 0 },
];

function SalariosSection({ email }: { email?: string | null }) {
  const storageKey = KEY("salarios", email);
  const impostosKey = KEY("salarios.impostos", email);
  const [tab, setTab] = useState<"docentes" | "staff" | "impostos">("docentes");
  const [docentes, setDocentes] = useState<{ id: string; nome: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; nome: string }[]>([]);
  const [rows, setRows] = useState<Record<string, { bruto: number; impostos: number }>>(
    () => readJSON(storageKey, {}),
  );
  const [impostos, setImpostos] = useState<SalarioImposto[]>(() => {
    const stored = readJSON<SalarioImposto[] | null>(impostosKey, null);
    return stored && stored.length ? stored : DEFAULT_SALARIO_IMPOSTOS;
  });

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      import("@/lib/peopleStorage").then(({ loadDocentes, loadStaff, fullName }) => {
        if (cancelled) return;
        setDocentes(loadDocentes().map((d) => ({ id: d.id, nome: fullName(d) })));
        setStaff(loadStaff().map((s) => ({ id: s.id, nome: fullName(s) })));
      });
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("upra:people-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("upra:people-changed", refresh);
    };
  }, []);

  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);
  useEffect(() => writeJSON(impostosKey, impostos), [impostos, impostosKey]);

  const update = (id: string, patch: Partial<{ bruto: number; impostos: number }>) =>
    setRows((s) => ({ ...s, [id]: { bruto: 0, impostos: 0, ...s[id], ...patch } }));

  const updateImposto = (id: string, patch: Partial<SalarioImposto>) =>
    setImpostos((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addImposto = () =>
    setImpostos((arr) => [...arr, { id: `imp-${Date.now()}`, nome: "Novo imposto", percentagem: 0 }]);

  const removeImposto = (id: string) =>
    setImpostos((arr) => arr.filter((i) => i.id !== id));

  const toggles: { key: typeof tab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { key: "docentes", label: "Docentes", icon: GraduationCap, count: docentes.length },
    { key: "staff", label: "Staff", icon: Briefcase, count: staff.length },
    { key: "impostos", label: "Impostos", icon: Percent, count: impostos.length },
  ];

  const renderPeopleTable = (
    title: string,
    subtitle: string,
    icon: React.ComponentType<{ className?: string }>,
    people: { id: string; nome: string }[],
    emptyHint: string,
  ) => {
    const Icon = icon;
    return (
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{people.length} pessoa{people.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_150px_150px_150px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Nome</div>
            <div>Salário bruto (Kz)</div>
            <div>Impostos (Kz)</div>
            <div>Salário líquido (Kz)</div>
          </div>
          {people.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">{emptyHint}</div>
          ) : people.map((p) => {
            const bruto = rows[p.id]?.bruto ?? 0;
            const imp = rows[p.id]?.impostos ?? 0;
            const liquido = Math.max(0, bruto - imp);
            return (
              <div key={p.id} className="grid grid-cols-[1fr_150px_150px_150px] gap-3 px-5 py-2.5 items-center text-sm">
                <div className="truncate font-medium">{p.nome}</div>
                <Input type="number" min={0} className="h-9 tabular-nums" value={bruto}
                  onChange={(e) => update(p.id, { bruto: Number(e.target.value) || 0 })} />
                <Input type="number" min={0} className="h-9 tabular-nums" value={imp}
                  onChange={(e) => update(p.id, { impostos: Number(e.target.value) || 0 })} />
                <div className="h-9 flex items-center px-2 rounded-md bg-muted/30 tabular-nums font-medium">{fmt(liquido)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderImpostos = () => (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Percent className="w-4 h-4 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">Impostos sobre salários</h2>
          <p className="text-[11px] text-muted-foreground">Defina os impostos aplicáveis aos salários (ex.: IRT, Segurança Social).</p>
        </div>
        <Button size="sm" variant="outline" className="ml-auto h-8 gap-1.5" onClick={addImposto}>
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </div>
      <div className="divide-y">
        <div className="grid grid-cols-[1fr_180px_60px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
          <div>Designação</div>
          <div>Percentagem (%)</div>
          <div></div>
        </div>
        {impostos.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem impostos configurados.</div>
        ) : impostos.map((i) => (
          <div key={i.id} className="grid grid-cols-[1fr_180px_60px] gap-3 px-5 py-2.5 items-center text-sm">
            <Input value={i.nome} className="h-9" onChange={(e) => updateImposto(i.id, { nome: e.target.value })} />
            <Input type="number" min={0} step={0.01} className="h-9 tabular-nums" value={i.percentagem}
              onChange={(e) => updateImposto(i.id, { percentagem: Number(e.target.value) || 0 })} />
            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeImposto(i.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
        {toggles.map((t) => {
          const TIcon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <TIcon className="w-3.5 h-3.5" />
              {t.label}
              <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {tab === "docentes" && renderPeopleTable(
        "Salários — Docentes",
        "Lista alimentada por RH → Docentes. Finanças define apenas bruto e impostos.",
        GraduationCap, docentes,
        "Sem docentes registados em RH. Adicione em RH → Docentes para configurar salários aqui.",
      )}
      {tab === "staff" && renderPeopleTable(
        "Salários — Staff",
        "Lista alimentada por RH → Staff. Finanças define apenas bruto e impostos.",
        Briefcase, staff,
        "Sem staff registado em RH. Adicione em RH → Staff para configurar salários aqui.",
      )}
      {tab === "impostos" && renderImpostos()}
    </div>
  );
}


/* ═══════════════════════════════ MULTAS ═══════════════════════════════════ */

type RhMulta = { id: string; nome: string; valor: number; descricao: string; aplicaA: "Docente" | "Staff" | "Discente" | "Ambos" };
type FinEstado = { id: string; nome: string; cor: string; descricao?: string; min: number; max: number; locked?: boolean };

const FIN_ESTADOS_DISC_KEY = (email?: string | null) => KEY("discentes.estados.financeiros.v3", email);
const DEFAULT_FIN_ESTADOS_DISC: FinEstado[] = [
  { id: "fe1", nome: "Regularizado", cor: "bg-emerald-100 text-emerald-700 border-emerald-200", descricao: "Sem pendências financeiras", min: 0, max: 0, locked: true },
  { id: "fe2", nome: "Por regularizar", cor: "bg-amber-100 text-amber-700 border-amber-200", descricao: "Mensalidades em atraso recente", min: 1, max: 3 },
  { id: "fe3", nome: "Em risco", cor: "bg-orange-100 text-orange-700 border-orange-200", descricao: "Atraso prolongado, requer acompanhamento", min: 4, max: 5 },
  { id: "fe4", nome: "Incumprimento", cor: "bg-red-100 text-red-700 border-red-200", descricao: "Dívida grave, sujeito a sanções", min: 6, max: 12 },
  { id: "fe5", nome: "Isento", cor: "bg-blue-100 text-blue-700 border-blue-200", descricao: "Sem obrigação de pagamento (bolseiro/regime especial)", min: 0, max: 0, locked: true },
];

const FIN_COR_OPCOES = [
  { label: "Verde", value: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Laranja", value: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
  { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
  { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
];

const MULTAS_KEY = (target: "docentes" | "staff" | "discentes", email?: string | null) =>
  KEY(`multas.${target}.v1`, email);

function MultasSection({ email }: { email?: string | null }) {
  const [target, setTarget] = useState<"docentes" | "staff" | "discentes">("docentes");

  const [docentesMultas, setDocentesMultas] = useState<RhMulta[]>(() =>
    readJSON<RhMulta[]>(MULTAS_KEY("docentes", email), []));
  const [staffMultas, setStaffMultas] = useState<RhMulta[]>(() =>
    readJSON<RhMulta[]>(MULTAS_KEY("staff", email), []));
  const [discentesMultas, setDiscentesMultas] = useState<RhMulta[]>(() =>
    readJSON<RhMulta[]>(MULTAS_KEY("discentes", email), []));

  useEffect(() => writeJSON(MULTAS_KEY("docentes", email), docentesMultas), [docentesMultas, email]);
  useEffect(() => writeJSON(MULTAS_KEY("staff", email), staffMultas), [staffMultas, email]);
  useEffect(() => writeJSON(MULTAS_KEY("discentes", email), discentesMultas), [discentesMultas, email]);

  const [finEstados, setFinEstados] = useState<FinEstado[]>(() => {
    const raw = readJSON<FinEstado[]>(FIN_ESTADOS_DISC_KEY(email), DEFAULT_FIN_ESTADOS_DISC);
    return raw.map((e) => {
      const nameLc = (e.nome || "").trim().toLowerCase();
      const isLocked = nameLc === "regularizado" || nameLc.includes("isento") || nameLc.includes("bolseir") || e.id === "fe1" || e.id === "fe5";
      return isLocked ? { ...e, min: 0, max: 0, locked: true } : { ...e, min: e.min ?? 1, max: e.max ?? 1, locked: false };
    });
  });
  useEffect(() => writeJSON(FIN_ESTADOS_DISC_KEY(email), finEstados), [finEstados, email]);

  const currentList = target === "docentes" ? docentesMultas : target === "staff" ? staffMultas : discentesMultas;
  const setCurrentList = target === "docentes" ? setDocentesMultas : target === "staff" ? setStaffMultas : setDiscentesMultas;
  const aplicaALabel = target === "docentes" ? "Docente" : target === "staff" ? "Staff" : "Discente";

  const meta = {
    docentes:  { title: "Multas a docentes",  icon: GraduationCap },
    staff:     { title: "Multas a staff",     icon: Briefcase },
    discentes: { title: "Multas a discentes", icon: Users },
  }[target];
  const Icon = meta.icon;

  const toggles: { key: typeof target; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { key: "docentes",  label: "Docentes",  icon: GraduationCap, count: docentesMultas.length },
    { key: "staff",     label: "Staff",     icon: Briefcase,     count: staffMultas.length },
    { key: "discentes", label: "Discentes", icon: Users,         count: discentesMultas.length },
  ];

  const addMulta = () => setCurrentList((s) => [...s, {
    id: newId(),
    nome: "",
    valor: 0,
    descricao: "",
    aplicaA: aplicaALabel as RhMulta["aplicaA"],
  }]);
  const updMulta = (id: string, patch: Partial<RhMulta>) =>
    setCurrentList((s) => s.map((m) => m.id === id ? { ...m, ...patch } : m));
  const delMulta = (id: string) => setCurrentList((s) => s.filter((m) => m.id !== id));


  return (
    <div className="space-y-6">



      <div className="inline-flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
        {toggles.map((t) => {
          const TIcon = t.icon;
          const active = target === t.key;
          return (
            <button key={t.key} type="button" onClick={() => setTarget(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <TIcon className="w-3.5 h-3.5" />
              {t.label}
              <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {target === "discentes" && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground">Estados financeiros (discentes)</h2>
              <p className="text-[11px] text-muted-foreground">Atribuição automática com base nos meses em atraso. O sistema atualiza o estado do discente sem intervenção manual.</p>
            </div>
            <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{finEstados.length} estado{finEstados.length === 1 ? "" : "s"}</span>
          </div>
          <div className="px-5 py-2.5 border-b bg-emerald-50/60 text-[11px] text-emerald-800 flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Automatização ativa — o estado é recalculado diariamente conforme os meses em atraso de cada discente.
          </div>
          <div className="divide-y">
            <div className="grid grid-cols-[1.1fr_1.5fr_220px_140px_140px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
              <div>Designação</div>
              <div>Descrição</div>
              <div>Meses em atraso (0–12)</div>
              <div>Cor</div>
              <div>Pré-visualização</div>
              <div className="text-right">Ação</div>
            </div>
            {finEstados.map((es) => {
              const locked = !!es.locked;
              return (
              <div key={es.id} className="grid grid-cols-[1.1fr_1.5fr_220px_140px_140px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                <Input className="h-9" placeholder="Ex: Por regularizar" value={es.nome} disabled={locked}
                  onChange={(e) => setFinEstados((s) => s.map((x) => x.id === es.id ? { ...x, nome: e.target.value } : x))} />
                <Input className="h-9" placeholder="Descrição curta" value={es.descricao || ""}
                  onChange={(e) => setFinEstados((s) => s.map((x) => x.id === es.id ? { ...x, descricao: e.target.value } : x))} />
                {locked ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center justify-center h-9 px-3 rounded-md border bg-muted/40 tabular-nums font-medium text-foreground">0</span>
                    <span className="whitespace-nowrap">meses (fixo)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Input type="number" min={0} max={12} className="h-9 w-16 text-center tabular-nums" value={es.min}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(12, Number(e.target.value) || 0));
                        setFinEstados((s) => s.map((x) => x.id === es.id ? { ...x, min: v, max: Math.max(v, x.max) } : x));
                      }} />
                    <span className="text-xs text-muted-foreground">a</span>
                    <Input type="number" min={0} max={12} className="h-9 w-16 text-center tabular-nums" value={es.max}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(12, Number(e.target.value) || 0));
                        setFinEstados((s) => s.map((x) => x.id === es.id ? { ...x, max: Math.max(v, x.min), min: Math.min(v, x.min) } : x));
                      }} />
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">meses</span>
                  </div>
                )}

                <select className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60" value={es.cor} disabled={locked}
                  onChange={(e) => setFinEstados((s) => s.map((x) => x.id === es.id ? { ...x, cor: e.target.value } : x))}>
                  {FIN_COR_OPCOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border text-xs font-medium ${es.cor}`}>{es.nome || "—"}</span>
                <div className="flex justify-end">
                  {locked ? (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted border" title="Estado fixo do sistema">Fixo</span>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setFinEstados((s) => s.filter((x) => x.id !== es.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t bg-muted/10">
            <Button size="sm" variant="outline" className="gap-1.5"
              onClick={() => setFinEstados((s) => [...s, { id: newId(), nome: "", cor: FIN_COR_OPCOES[0].value, descricao: "", min: 1, max: 1 }])}>
              <Plus className="w-3.5 h-3.5" /> Adicionar estado
            </Button>
          </div>
        </Card>
      )}


      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">{meta.title}</h2>
            <p className="text-[11px] text-muted-foreground">Configure as multas aplicáveis a {aplicaALabel.toLowerCase()}s. Cada separador gere a sua própria lista.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{currentList.length} multa{currentList.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1.1fr_1.4fr_140px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Descrição</div>
            <div className="text-right">Valor (Kz)</div>
            <div className="text-right">Ação</div>
          </div>
          {currentList.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">
              Sem multas configuradas para {aplicaALabel.toLowerCase()}s. Clique em <span className="font-medium text-foreground">Adicionar multa</span>.
            </div>
          ) : currentList.map((m) => (
            <div key={m.id} className="grid grid-cols-[1.1fr_1.4fr_140px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Atraso entrega" value={m.nome}
                onChange={(e) => updMulta(m.id, { nome: e.target.value })} />
              <Input className="h-9" placeholder="Descrição curta" value={m.descricao || ""}
                onChange={(e) => updMulta(m.id, { descricao: e.target.value })} />
              <Input type="number" min={0} className="h-9 tabular-nums text-right" value={m.valor}
                onChange={(e) => updMulta(m.id, { valor: Number(e.target.value) || 0 })} />
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => delMulta(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addMulta}>
            <Plus className="w-3.5 h-3.5" /> Adicionar multa
          </Button>
        </div>
      </Card>
    </div>
  );
}



/* ─────────────────── Emolumentos: Categorias + tabela ─────────────────── */

const EMOL_CATS_KEY = (email?: string | null) => KEY("emolumentos.categorias", email);
const DEFAULT_EMOL_CATS: string[] = ["Inscrição", "Matrícula", "Declaração", "Certificado", "2ª Via"];

function EmolumentosBlock({ email, impostos }: { email?: string | null; impostos: Imposto[] }) {
  const [cats, setCats] = useState<CatItem[]>(() =>
    migrateCats(readJSON<unknown>(EMOL_CATS_KEY(email), null), DEFAULT_EMOL_CATS)
  );
  useEffect(() => writeJSON(EMOL_CATS_KEY(email), cats), [cats, email]);

  const addCat = () => setCats((s) => [...s, { nome: "", cor: COR_OPCOES_GLOBAL[6].value }]);
  const updCat = (idx: number, patch: Partial<CatItem>) => setCats((s) => s.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const delCat = (idx: number) => setCats((s) => s.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Categorias de emolumentos</h2>
            <p className="text-[11px] text-muted-foreground">Defina as categorias. Ficam disponíveis na coluna Categoria da tabela de emolumentos.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{cats.length} categoria{cats.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_160px_140px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div className="text-right">Ação</div>
          </div>
          {cats.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground">Sem categorias configuradas.</div>
          ) : cats.map((c, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_160px_140px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Certificado" value={c.nome} onChange={(e) => updCat(idx, { nome: e.target.value })} />
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.cor}
                onChange={(e) => updCat(idx, { cor: e.target.value })}>
                {COR_OPCOES_GLOBAL.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border text-xs font-medium truncate ${c.cor}`}>{c.nome || "—"}</span>
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => delCat(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addCat}><Plus className="w-3.5 h-3.5" /> Adicionar categoria</Button>
        </div>
      </Card>

      <LineItemsBlock
        title="Emolumento"
        subtitle="Inscrições, matrículas, declarações, certificados, 2ª via de cartão, etc. Aplica-se sempre a discentes."
        icon={Receipt}
        storageKey={KEY("taxas", email)}
        withType
        typeLabel="Categoria"
        typeOptions={cats.map((c) => c.nome).filter((c) => c.trim())}
        withTax
        withTaxValue
        impostos={impostos}
        addLabel="Adicionar emolumento"
        placeholder="Ex: Certidão de matrícula"
        valueLabel="Valor (Kz)"
      />
    </div>
  );
}

/* ─────────────────── Serviços Académicos: Categorias + tabela ─────────────────── */

const SERV_CATS_KEY = (email?: string | null) => KEY("servicos.categorias", email);
const DEFAULT_SERV_CATS: string[] = ["Cursos Livres", "Workshops", "Formação Contínua", "Certificações", "Aluguer de Espaços"];

function ServicosAcademicosBlock({ email, impostos }: { email?: string | null; impostos: Imposto[] }) {
  const [cats, setCats] = useState<CatItem[]>(() =>
    migrateCats(readJSON<unknown>(SERV_CATS_KEY(email), null), DEFAULT_SERV_CATS)
  );
  useEffect(() => writeJSON(SERV_CATS_KEY(email), cats), [cats, email]);

  const addCat = () => setCats((s) => [...s, { nome: "", cor: COR_OPCOES_GLOBAL[6].value }]);
  const updCat = (idx: number, patch: Partial<CatItem>) => setCats((s) => s.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const delCat = (idx: number) => setCats((s) => s.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Categorias de serviços académicos</h2>
            <p className="text-[11px] text-muted-foreground">Defina as categorias. Ficam disponíveis na coluna Categoria da tabela de serviços.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{cats.length} categoria{cats.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_160px_140px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div className="text-right">Ação</div>
          </div>
          {cats.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-muted-foreground">Sem categorias configuradas.</div>
          ) : cats.map((c, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_160px_140px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Workshop" value={c.nome} onChange={(e) => updCat(idx, { nome: e.target.value })} />
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.cor}
                onChange={(e) => updCat(idx, { cor: e.target.value })}>
                {COR_OPCOES_GLOBAL.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-md border text-xs font-medium truncate ${c.cor}`}>{c.nome || "—"}</span>
              <div className="flex justify-end">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => delCat(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addCat}><Plus className="w-3.5 h-3.5" /> Adicionar categoria</Button>
        </div>
      </Card>

      <LineItemsBlock
        title="Serviço académico"
        subtitle="Cursos livres, workshops, formações contínuas, certificações e aluguer de espaços."
        icon={BookOpenCheck}
        storageKey={KEY("servicos", email)}
        withType
        typeLabel="Categoria"
        typeOptions={cats.map((c) => c.nome).filter((c) => c.trim())}
        withTarget
        withTax
        withTaxValue
        impostos={impostos}
        addLabel="Adicionar serviço"
        placeholder="Ex: Workshop AutoCAD"
        valueLabel="Valor (Kz)"
      />
    </div>
  );
}

/* ═══════════════════════════════ Generic block ════════════════════════════ */

function LineItemsBlock({
  title, subtitle, icon: Icon, storageKey, addLabel, placeholder, valueLabel,
  withUnit = false, withTarget = false, withType = false, withTax = false, withTaxValue = false, impostos = [],
  typeLabel = "Tipo", typeOptions,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  storageKey: string;
  addLabel: string;
  placeholder: string;
  valueLabel: string;
  withUnit?: boolean;
  withTarget?: boolean;
  withType?: boolean;
  withTax?: boolean;
  withTaxValue?: boolean;
  impostos?: Imposto[];
  typeLabel?: string;
  typeOptions?: string[];
}) {
  const [rows, setRows] = useState<LineItem[]>(() => readJSON<LineItem[]>(storageKey, []));
  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const add = () => setRows((r) => [...r, {
    id: newId(), nome: "", valor: 0,
    ...(withUnit ? { unidade: "Kz" } : {}),
    ...(withType ? { tipo: "Único" } : {}),
    ...(withTarget ? { aplicaA: "estudante" } : {}),
    ...(withTax ? { impostoId: impostos[0]?.id ?? "" } : {}),
  }]);
  const update = (id: string, patch: Partial<LineItem>) => setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const total = rows.reduce((s, r) => s + (r.valor || 0), 0);

  const colTemplate = [
    "minmax(0,1fr)",             // Designação
    withType && "130px",
    "140px",                     // Valor
    withTax && "150px",
    withTaxValue && "140px",
    withUnit && "120px",
    withTarget && "140px",
    "44px",                      // Ação
  ].filter(Boolean).join(" ");
  const gridStyle = { gridTemplateColumns: colTemplate } as React.CSSProperties;

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">
          {rows.length} item{rows.length === 1 ? "" : "s"} · soma {fmt(total)} Kz
        </span>
      </div>

      <div className="divide-y">
        <div className="grid gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10" style={gridStyle}>
          <div>Designação</div>
          {withType && <div>{typeLabel}</div>}
          <div>{valueLabel}</div>
          {withTax && <div>Regime</div>}
          {withTaxValue && <div>Valor c/ IVA incl.</div>}
          {withUnit && <div>Unidade</div>}
          {withTarget && <div>Aplica-se a</div>}
          <div className="text-right">Ação</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">
            Sem itens configurados. Clique em <span className="font-medium text-foreground">{addLabel}</span> para começar.
          </div>
        ) : rows.map((r) => (
          <div key={r.id} className="grid gap-3 px-5 py-2.5 items-center text-sm" style={gridStyle}>
            <Input className="h-9" placeholder={placeholder} value={r.nome}
              onChange={(e) => update(r.id, { nome: e.target.value })} />
            {withType && (
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={r.tipo || ""}
                onChange={(e) => update(r.id, { tipo: e.target.value })}
              >
                <option value="">— Selecionar —</option>
                {(typeOptions ?? ["Único", "Mensal", "Anual", "Por pedido"]).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            <Input type="number" min={0} className="h-9 tabular-nums" value={r.valor}
              onChange={(e) => update(r.id, { valor: Number(e.target.value) || 0 })} />
            {withTax && (
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={r.impostoId || ""}
                onChange={(e) => update(r.id, { impostoId: e.target.value })}>
                <option value="">— Sem imposto —</option>
                {impostos.map((i) => <option key={i.id} value={i.id}>{i.nome} ({(i.taxa * 100).toFixed(0)}%)</option>)}
              </select>
            )}
            {withTaxValue && (
              <div className="h-9 flex items-center justify-end px-2 rounded-md bg-muted/30 tabular-nums font-medium text-xs text-muted-foreground">
                {fmt((r.valor || 0) * (1 + (impostos.find((i) => i.id === r.impostoId)?.taxa ?? 0)))} Kz
              </div>
            )}
            {withUnit && (
              <Input className="h-9" placeholder="Kz / dia" value={r.unidade || ""}
                onChange={(e) => update(r.id, { unidade: e.target.value })} />
            )}
            {withTarget && (
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={r.aplicaA || "estudante"}
                onChange={(e) => update(r.id, { aplicaA: e.target.value as LineItem["aplicaA"] })}
              >
                <option value="estudante">Estudante</option>
                <option value="docente">Docente</option>
                <option value="staff">Staff</option>
                <option value="todos">Todos</option>
              </select>
            )}
            <div className="flex justify-end">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t bg-muted/10">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={add}>
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </Button>
      </div>
    </Card>
  );
}
