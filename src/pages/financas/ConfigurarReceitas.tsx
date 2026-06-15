import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import {
  ArrowLeft, Banknote, Building2, GraduationCap, Loader2, Save,
  AlertCircle, Receipt, Wallet, Plus, Trash2,
} from "lucide-react";
import { useFaculdades, useCursos, usePropinas, useUpdatePropina } from "@/lib/useInstitution";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Configurar Receitas — espelha o passo "Configurar Finanças" do onboarding.
 * Tabs: Propinas (DB), Emolumentos & Taxas (local), Multas (local).
 */

type Tab = "propinas" | "taxas" | "multas";

type TaxaRow = { id: string; nome: string; valor: number };
type MultaRow = { id: string; nome: string; valor: number; unidade: string };

const taxasKey = (email?: string | null) => `upra.admin.fin.taxas::${email || "anon"}`;
const multasKey = (email?: string | null) => `upra.admin.fin.multas::${email || "anon"}`;

const readJSON = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; } catch { return fallback; }
};
const writeJSON = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };

const newId = () => Math.random().toString(36).slice(2, 10);
const fmt = (v: number) => v.toLocaleString("pt-AO", { maximumFractionDigits: 0 });

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tabParam = (params.get("tab") as Tab) || "propinas";
  const [tab, setTab] = useState<Tab>(tabParam);

  useEffect(() => { if (tabParam !== tab) setTab(tabParam); }, [tabParam]); // eslint-disable-line

  const changeTab = (next: Tab) => {
    setTab(next);
    const np = new URLSearchParams(params);
    np.set("tab", next);
    setParams(np, { replace: true });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <OnboardingStepBanner />

      <FinHeader
        title="Configurar Receitas"
        subtitle="Propinas, emolumentos e multas — base que alimenta todos os módulos financeiros"
        icon={<Banknote className="w-5 h-5 text-primary" />}
        right={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => changeTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="propinas" className="gap-1.5"><Wallet className="w-3.5 h-3.5" /> Propinas</TabsTrigger>
          <TabsTrigger value="taxas" className="gap-1.5"><Receipt className="w-3.5 h-3.5" /> Emolumentos & Taxas</TabsTrigger>
          <TabsTrigger value="multas" className="gap-1.5"><Banknote className="w-3.5 h-3.5" /> Multas</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "propinas" && <PropinasTab onAddCursos={() => navigate("/admin/faculdades-cursos")} />}
      {tab === "taxas" && <TaxasTab storageKey={taxasKey(user?.email)} />}
      {tab === "multas" && <MultasTab storageKey={multasKey(user?.email)} />}
    </div>
  );
}

/* ───────────────────────────── Propinas (backend) ─────────────────────────── */

function PropinasTab({ onAddCursos }: { onAddCursos: () => void }) {
  const { data: faculdades = [], isLoading: lF } = useFaculdades();
  const { data: cursos = [], isLoading: lC } = useCursos();
  const { data: propinas = [], isLoading: lP } = usePropinas();
  const updatePropina = useUpdatePropina();
  const [draft, setDraft] = useState<Record<string, { valor: string; imposto: string }>>({});

  const propinaByCurso = useMemo(() => {
    const m = new Map<string, { valor_mensal: number; imposto: number }>();
    propinas.forEach((p) => m.set(p.curso_id, { valor_mensal: Number(p.valor_mensal) || 0, imposto: Number(p.imposto) || 0 }));
    return m;
  }, [propinas]);

  const facWithCursos = useMemo(
    () => faculdades.map((f) => ({ ...f, cursos: cursos.filter((c) => c.faculdade_id === f.id) })),
    [faculdades, cursos],
  );

  const loading = lF || lC || lP;

  const save = async (cursoId: string) => {
    const d = draft[cursoId];
    const cur = propinaByCurso.get(cursoId) ?? { valor_mensal: 0, imposto: 0 };
    const valor = d?.valor !== undefined ? Number(d.valor) : cur.valor_mensal;
    const imposto = d?.imposto !== undefined ? Number(d.imposto) : cur.imposto;
    if (Number.isNaN(valor) || valor < 0) { toast.error("Valor inválido"); return; }
    if (Number.isNaN(imposto) || imposto < 0 || imposto > 1) { toast.error("Imposto deve estar entre 0 e 1 (ex: 0.14)"); return; }
    await updatePropina.mutateAsync({ curso_id: cursoId, valor_mensal: valor, imposto });
    setDraft((s) => { const n = { ...s }; delete n[cursoId]; return n; });
    toast.success("Propina atualizada");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> A carregar dados institucionais…</div>;
  }

  if (facWithCursos.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold text-foreground">Sem faculdades nem cursos</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Comece por adicionar faculdades e cursos em <span className="font-medium text-foreground">Admin → Faculdades & Cursos</span>.
          Cada curso novo aparece aqui com propina a 0 Kz.
        </p>
        <Button className="mt-5" onClick={onAddCursos}>Ir para Faculdades & Cursos</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {facWithCursos.map((f) => (
        <Card key={f.id} className="overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">{f.name}</h2>
            <span className="text-[11px] text-muted-foreground ml-auto">
              {f.cursos.length} curso{f.cursos.length === 1 ? "" : "s"}
            </span>
          </div>
          {f.cursos.length === 0 ? (
            <div className="px-5 py-6 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> Sem cursos nesta faculdade.
            </div>
          ) : (
            <div className="divide-y">
              <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
                <div className="col-span-5">Curso</div>
                <div className="col-span-3">Propina mensal (Kz)</div>
                <div className="col-span-2">Imposto (0–1)</div>
                <div className="col-span-2 text-right">Ação</div>
              </div>
              {f.cursos.map((c) => {
                const p = propinaByCurso.get(c.id) ?? { valor_mensal: 0, imposto: 0 };
                const d = draft[c.id];
                const valorVal = d?.valor ?? String(p.valor_mensal);
                const impVal = d?.imposto ?? String(p.imposto);
                const dirty = d !== undefined;
                return (
                  <div key={c.id} className="grid grid-cols-12 px-5 py-3 items-center text-sm">
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{c.code} · {c.years} anos</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Input type="number" min={0} className="h-9 tabular-nums"
                        value={valorVal}
                        onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: e.target.value, imposto: impVal } }))} />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" step="0.01" min={0} max={1} className="h-9 tabular-nums"
                        value={impVal}
                        onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: valorVal, imposto: e.target.value } }))} />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button size="sm" variant={dirty ? "default" : "outline"}
                        disabled={!dirty || updatePropina.isPending}
                        onClick={() => save(c.id)} className="gap-1.5">
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ───────────────────────────── Emolumentos & Taxas ────────────────────────── */

const DEFAULT_TAXAS: TaxaRow[] = [
  { id: newId(), nome: "Inscrição", valor: 0 },
  { id: newId(), nome: "Matrícula", valor: 0 },
  { id: newId(), nome: "Declaração com notas", valor: 0 },
  { id: newId(), nome: "Certificado de habilitações", valor: 0 },
  { id: newId(), nome: "Cartão de estudante (2ª via)", valor: 0 },
];

function TaxasTab({ storageKey }: { storageKey: string }) {
  const [rows, setRows] = useState<TaxaRow[]>(() => readJSON<TaxaRow[]>(storageKey, DEFAULT_TAXAS));
  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const add = () => setRows((r) => [...r, { id: newId(), nome: "", valor: 0 }]);
  const update = (id: string, patch: Partial<TaxaRow>) => setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const total = rows.reduce((s, r) => s + (r.valor || 0), 0);

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Emolumentos & Taxas académicas</h2>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {rows.length} item{rows.length === 1 ? "" : "s"} · soma {fmt(total)} Kz
        </span>
      </div>
      <div className="divide-y">
        <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
          <div className="col-span-8">Designação</div>
          <div className="col-span-3">Valor (Kz)</div>
          <div className="col-span-1 text-right">Ação</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem taxas configuradas.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 px-5 py-2.5 items-center text-sm">
            <div className="col-span-8 pr-3">
              <Input className="h-9" placeholder="Ex: Certidão de matrícula" value={r.nome}
                onChange={(e) => update(r.id, { nome: e.target.value })} />
            </div>
            <div className="col-span-3 pr-3">
              <Input type="number" min={0} className="h-9 tabular-nums" value={r.valor}
                onChange={(e) => update(r.id, { valor: Number(e.target.value) || 0 })} />
            </div>
            <div className="col-span-1 flex justify-end">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t bg-muted/10">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={add}>
          <Plus className="w-3.5 h-3.5" /> Adicionar taxa
        </Button>
      </div>
    </Card>
  );
}

/* ───────────────────────────── Multas ─────────────────────────────────────── */

const DEFAULT_MULTAS: MultaRow[] = [
  { id: newId(), nome: "Atraso no pagamento de propina", valor: 0, unidade: "Kz / dia" },
  { id: newId(), nome: "Falta a exame sem justificação", valor: 0, unidade: "Kz" },
  { id: newId(), nome: "Devolução tardia de livro", valor: 0, unidade: "Kz / dia" },
];

function MultasTab({ storageKey }: { storageKey: string }) {
  const [rows, setRows] = useState<MultaRow[]>(() => readJSON<MultaRow[]>(storageKey, DEFAULT_MULTAS));
  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const add = () => setRows((r) => [...r, { id: newId(), nome: "", valor: 0, unidade: "Kz" }]);
  const update = (id: string, patch: Partial<MultaRow>) => setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Banknote className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Multas e penalizações</h2>
        <span className="text-[11px] text-muted-foreground ml-auto">{rows.length} regra{rows.length === 1 ? "" : "s"}</span>
      </div>
      <div className="divide-y">
        <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
          <div className="col-span-6">Designação</div>
          <div className="col-span-3">Valor</div>
          <div className="col-span-2">Unidade</div>
          <div className="col-span-1 text-right">Ação</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem multas configuradas.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 px-5 py-2.5 items-center text-sm">
            <div className="col-span-6 pr-3">
              <Input className="h-9" placeholder="Ex: Atraso na entrega de trabalho" value={r.nome}
                onChange={(e) => update(r.id, { nome: e.target.value })} />
            </div>
            <div className="col-span-3 pr-3">
              <Input type="number" min={0} className="h-9 tabular-nums" value={r.valor}
                onChange={(e) => update(r.id, { valor: Number(e.target.value) || 0 })} />
            </div>
            <div className="col-span-2 pr-3">
              <Input className="h-9" placeholder="Kz / dia" value={r.unidade}
                onChange={(e) => update(r.id, { unidade: e.target.value })} />
            </div>
            <div className="col-span-1 flex justify-end">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t bg-muted/10">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={add}>
          <Plus className="w-3.5 h-3.5" /> Adicionar multa
        </Button>
      </div>
    </Card>
  );
}
