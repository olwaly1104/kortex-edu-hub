import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import {
  ArrowLeft, Banknote, Building2, GraduationCap, Loader2, Save, AlertCircle,
  Receipt, Wallet, Plus, Trash2, TrendingUp, TrendingDown, CreditCard,
  Users, Briefcase, BookOpenCheck, Settings2,
} from "lucide-react";
import { useFaculdades, useCursos, usePropinas, useUpdatePropina } from "@/lib/useInstitution";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Configurar Finanças — página única ligada ao onboarding.
 *
 * Estrutura espelha o módulo Finanças real (Receitas, Despesas, Salários,
 * Multas) para que a configuração corresponda exatamente ao que é depois
 * apresentado nas tabelas operacionais. Tudo aqui alimenta o backend ou o
 * estado local da instituição — nenhum dado de demonstração.
 */

type Tab = "receitas" | "despesas" | "salarios" | "multas";

type LineItem = { id: string; nome: string; valor: number; unidade?: string; aplicaA?: "estudante" | "docente" | "staff" | "todos" };

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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <OnboardingStepBanner />

      <FinHeader
        title="Configurar Finanças"
        subtitle="Receitas, despesas, salários e multas — base que alimenta todo o módulo financeiro."
        icon={<Settings2 className="w-5 h-5 text-primary" />}
        right={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </Button>
        }
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

function ReceitasSection({ email, onAddCursos }: { email?: string | null; onAddCursos: () => void }) {
  return (
    <div className="space-y-6">
      <PropinasBlock onAddCursos={onAddCursos} />
      <LineItemsBlock
        title="Emolumentos & Taxas académicas"
        subtitle="Inscrições, matrículas, declarações, certificados, 2ª via de cartão, etc."
        icon={Receipt}
        storageKey={KEY("taxas", email)}
        withTarget
        addLabel="Adicionar taxa"
        placeholder="Ex: Certidão de matrícula"
        valueLabel="Valor (Kz)"
      />
    </div>
  );
}

function PropinasBlock({ onAddCursos }: { onAddCursos: () => void }) {
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

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Propinas por curso</h2>
        <span className="text-[11px] text-muted-foreground ml-auto">
          Valor mensal pago pelo estudante · alimenta Finanças → Receitas
        </span>
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
      ) : (
        <div className="divide-y">
          <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div className="col-span-5">Faculdade · Curso</div>
            <div className="col-span-3">Propina mensal (Kz)</div>
            <div className="col-span-2">Imposto (0–1)</div>
            <div className="col-span-2 text-right">Ação</div>
          </div>
          {facWithCursos.flatMap((f) =>
            f.cursos.length === 0
              ? [(
                  <div key={`empty-${f.id}`} className="grid grid-cols-12 px-5 py-2.5 items-center text-xs text-muted-foreground">
                    <div className="col-span-12 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{f.name}</span> · sem cursos
                    </div>
                  </div>
                )]
              : f.cursos.map((c) => {
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
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {f.name} · {c.code} · {c.years} anos
                          </p>
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
                }),
          )}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════════════════════ DESPESAS ═════════════════════════════════ */

function DespesasSection({ email }: { email?: string | null }) {
  return (
    <div className="space-y-6">
      <LineItemsBlock
        title="Categorias de despesa"
        subtitle="Rubricas usadas para classificar todas as despesas registadas em Finanças → Despesas."
        icon={TrendingDown}
        storageKey={KEY("despesas", email)}
        addLabel="Adicionar categoria"
        placeholder="Ex: Infraestrutura, Material didáctico, Serviços e utilities…"
        valueLabel="Orçamento mensal (Kz)"
      />
    </div>
  );
}

/* ═══════════════════════════════ SALÁRIOS ═════════════════════════════════ */

function SalariosSection({ email }: { email?: string | null }) {
  return (
    <div className="space-y-6">
      <LineItemsBlock
        title="Escalões salariais — Docentes"
        subtitle="Categorias e valores base aplicados aos docentes."
        icon={GraduationCap}
        storageKey={KEY("sal.docentes", email)}
        addLabel="Adicionar escalão de docente"
        placeholder="Ex: Assistente, Professor Auxiliar, Professor Catedrático…"
        valueLabel="Salário base (Kz)"
      />
      <LineItemsBlock
        title="Escalões salariais — Staff"
        subtitle="Categorias administrativas e técnicas."
        icon={Briefcase}
        storageKey={KEY("sal.staff", email)}
        addLabel="Adicionar escalão de staff"
        placeholder="Ex: Técnico, Coordenador, Diretor de serviços…"
        valueLabel="Salário base (Kz)"
      />
    </div>
  );
}

/* ═══════════════════════════════ MULTAS ═══════════════════════════════════ */

function MultasSection({ email }: { email?: string | null }) {
  return (
    <div className="space-y-6">
      <LineItemsBlock
        title="Multas a estudantes"
        subtitle="Atrasos de pagamento, faltas a exames, devoluções tardias na biblioteca, etc."
        icon={Users}
        storageKey={KEY("mul.estudante", email)}
        withUnit
        addLabel="Adicionar multa de estudante"
        placeholder="Ex: Atraso no pagamento de propina"
        valueLabel="Valor"
      />
      <LineItemsBlock
        title="Multas a docentes & staff"
        subtitle="Atrasos no lançamento de notas, faltas não justificadas, etc."
        icon={BookOpenCheck}
        storageKey={KEY("mul.docente", email)}
        withUnit
        addLabel="Adicionar multa de docente/staff"
        placeholder="Ex: Atraso no lançamento de notas"
        valueLabel="Valor"
      />
    </div>
  );
}

/* ═══════════════════════════════ Generic block ════════════════════════════ */

function LineItemsBlock({
  title, subtitle, icon: Icon, storageKey, addLabel, placeholder, valueLabel,
  withUnit = false, withTarget = false,
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
}) {
  const [rows, setRows] = useState<LineItem[]>(() => readJSON<LineItem[]>(storageKey, []));
  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const add = () => setRows((r) => [...r, { id: newId(), nome: "", valor: 0, ...(withUnit ? { unidade: "Kz" } : {}), ...(withTarget ? { aplicaA: "estudante" } : {}) }]);
  const update = (id: string, patch: Partial<LineItem>) => setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const total = rows.reduce((s, r) => s + (r.valor || 0), 0);

  const cols = (() => {
    if (withUnit) return "grid-cols-[1fr_140px_120px_40px]";
    if (withTarget) return "grid-cols-[1fr_140px_150px_40px]";
    return "grid-cols-[1fr_180px_40px]";
  })();

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
        <div className={`grid ${cols} gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10`}>
          <div>Designação</div>
          <div>{valueLabel}</div>
          {withUnit && <div>Unidade</div>}
          {withTarget && <div>Aplica-se a</div>}
          <div className="text-right">Ação</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-muted-foreground">
            Sem itens configurados. Clique em <span className="font-medium text-foreground">{addLabel}</span> para começar.
          </div>
        ) : rows.map((r) => (
          <div key={r.id} className={`grid ${cols} gap-3 px-5 py-2.5 items-center text-sm`}>
            <Input className="h-9" placeholder={placeholder} value={r.nome}
              onChange={(e) => update(r.id, { nome: e.target.value })} />
            <Input type="number" min={0} className="h-9 tabular-nums" value={r.valor}
              onChange={(e) => update(r.id, { valor: Number(e.target.value) || 0 })} />
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
