import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

type LineItem = { id: string; nome: string; valor: number; unidade?: string; tipo?: string; aplicaA?: "estudante" | "docente" | "staff" | "todos" };

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
        title="Emolumento"
        subtitle="Inscrições, matrículas, declarações, certificados, 2ª via de cartão, etc."
        icon={Receipt}
        storageKey={KEY("taxas", email)}
        withType
        withTarget
        addLabel="Adicionar emolumento"
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

type DesCategoria = { id: string; nome: string; documentos: string[]; orcamento: number };
type DesEstado = { id: string; nome: string; cor: string };
type DesResp = { id: string; pessoa: string; categoria: string; limite: number };

function DespesasSection({ email }: { email?: string | null }) {
  const catKey = KEY("des.categorias", email);
  const estKey = KEY("des.estados", email);
  const respKey = KEY("des.responsaveis", email);

  const [categorias, setCategorias] = useState<DesCategoria[]>(() => readJSON<DesCategoria[]>(catKey, []));
  const [estados, setEstados] = useState<DesEstado[]>(() => readJSON<DesEstado[]>(estKey, [
    { id: "e1", nome: "Pendente", cor: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "e2", nome: "Aprovada", cor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { id: "e3", nome: "Rejeitada", cor: "bg-red-100 text-red-700 border-red-200" },
    { id: "e4", nome: "Paga", cor: "bg-blue-100 text-blue-700 border-blue-200" },
  ]));
  const [responsaveis, setResponsaveis] = useState<DesResp[]>(() => readJSON<DesResp[]>(respKey, []));

  useEffect(() => writeJSON(catKey, categorias), [categorias, catKey]);
  useEffect(() => writeJSON(estKey, estados), [estados, estKey]);
  useEffect(() => writeJSON(respKey, responsaveis), [responsaveis, respKey]);

  const COR_OPCOES = [
    { label: "Âmbar", value: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "Verde", value: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { label: "Vermelho", value: "bg-red-100 text-red-700 border-red-200" },
    { label: "Azul", value: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Cinza", value: "bg-slate-100 text-slate-700 border-slate-200" },
    { label: "Violeta", value: "bg-violet-100 text-violet-700 border-violet-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Categorias */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">Categorias de despesa</h2>
            <p className="text-[11px] text-muted-foreground">Rubricas usadas em Finanças → Despesas, com documento exigido e orçamento mensal.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{categorias.length} categoria{categorias.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_1fr_160px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Documentos exigidos</div>
            <div>Orçamento mensal (Kz)</div>
            <div className="text-right">Ação</div>
          </div>
          {categorias.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">Sem categorias configuradas.</div>
          ) : categorias.map((c) => {
            const toggleDoc = (doc: string) => {
              setCategorias((s) => s.map((x) => {
                if (x.id !== c.id) return x;
                const has = x.documentos.includes(doc);
                return { ...x, documentos: has ? x.documentos.filter((d) => d !== doc) : [...x.documentos, doc] };
              }));
            };
            return (
              <div key={c.id} className="grid grid-cols-[1fr_1fr_160px_40px] gap-3 px-5 py-2.5 items-center text-sm">
                <Input className="h-9" placeholder="Ex: Infraestrutura" value={c.nome}
                  onChange={(e) => setCategorias((s) => s.map((x) => x.id === c.id ? { ...x, nome: e.target.value } : x))} />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Checkbox id={`${c.id}-fatura`} checked={c.documentos.includes("Fatura")} onCheckedChange={() => toggleDoc("Fatura")} />
                    <Label htmlFor={`${c.id}-fatura`} className="text-xs font-normal cursor-pointer">Fatura</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox id={`${c.id}-comprovativo`} checked={c.documentos.includes("Comprovativo")} onCheckedChange={() => toggleDoc("Comprovativo")} />
                    <Label htmlFor={`${c.id}-comprovativo`} className="text-xs font-normal cursor-pointer">Comprovativo</Label>
                  </div>
                </div>
                <Input type="number" min={0} className="h-9 tabular-nums" value={c.orcamento}
                  onChange={(e) => setCategorias((s) => s.map((x) => x.id === c.id ? { ...x, orcamento: Number(e.target.value) || 0 } : x))} />
                <div className="flex justify-end">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setCategorias((s) => s.filter((x) => x.id !== c.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t bg-muted/10">
          <Button size="sm" variant="outline" className="gap-1.5"
            onClick={() => setCategorias((s) => [...s, { id: newId(), nome: "", documentos: [], orcamento: 0 }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar categoria
          </Button>
        </div>
      </Card>

      {/* Estados */}
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
          <div className="grid grid-cols-[1fr_180px_120px_40px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Cor</div>
            <div>Pré-visualização</div>
            <div className="text-right">Ação</div>
          </div>
          {estados.map((es) => (
            <div key={es.id} className="grid grid-cols-[1fr_180px_120px_40px] gap-3 px-5 py-2.5 items-center text-sm">
              <Input className="h-9" placeholder="Ex: Aprovada" value={es.nome}
                onChange={(e) => setEstados((s) => s.map((x) => x.id === es.id ? { ...x, nome: e.target.value } : x))} />
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
            onClick={() => setEstados((s) => [...s, { id: newId(), nome: "", cor: COR_OPCOES[0].value }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar estado
          </Button>
        </div>
      </Card>

      {/* Responsáveis */}
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
    </div>
  );
}

/* ═══════════════════════════════ SALÁRIOS ═════════════════════════════════ */

function SalariosSection({ email }: { email?: string | null }) {
  const storageKey = KEY("salarios", email);
  const [docentes, setDocentes] = useState<{ id: string; nome: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; nome: string }[]>([]);
  const [rows, setRows] = useState<Record<string, { bruto: number; impostos: number }>>(
    () => readJSON(storageKey, {}),
  );

  useEffect(() => {
    import("@/lib/peopleStorage").then(({ loadDocentes, loadStaff, fullName }) => {
      setDocentes(loadDocentes().map((d) => ({ id: d.id, nome: fullName(d) })));
      setStaff(loadStaff().map((s) => ({ id: s.id, nome: fullName(s) })));
    });
  }, []);

  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const update = (id: string, patch: Partial<{ bruto: number; impostos: number }>) =>
    setRows((s) => ({ ...s, [id]: { bruto: 0, impostos: 0, ...s[id], ...patch } }));

  const renderTable = (
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
            const impostos = rows[p.id]?.impostos ?? 0;
            const liquido = Math.max(0, bruto - impostos);
            return (
              <div key={p.id} className="grid grid-cols-[1fr_150px_150px_150px] gap-3 px-5 py-2.5 items-center text-sm">
                <div className="truncate font-medium">{p.nome}</div>
                <Input type="number" min={0} className="h-9 tabular-nums" value={bruto}
                  onChange={(e) => update(p.id, { bruto: Number(e.target.value) || 0 })} />
                <Input type="number" min={0} className="h-9 tabular-nums" value={impostos}
                  onChange={(e) => update(p.id, { impostos: Number(e.target.value) || 0 })} />
                <div className="h-9 flex items-center px-2 rounded-md bg-muted/30 tabular-nums font-medium">{fmt(liquido)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderTable("Salários — Docentes", "Lista alimentada por RH → Docentes. Finanças define apenas bruto e impostos.", GraduationCap, docentes,
        "Sem docentes registados em RH. Adicione em RH → Docentes para configurar salários aqui.")}
      {renderTable("Salários — Staff", "Lista alimentada por RH → Staff. Finanças define apenas bruto e impostos.", Briefcase, staff,
        "Sem staff registado em RH. Adicione em RH → Staff para configurar salários aqui.")}
    </div>
  );
}

/* ═══════════════════════════════ MULTAS ═══════════════════════════════════ */

type RhMulta = { id: string; nome: string; valor: number; descricao: string; aplicaA: "Docente" | "Staff" | "Ambos" };

function MultasSection({ email: _email }: { email?: string | null }) {
  const [multas, setMultas] = useState<RhMulta[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("upra.rh.multas.v1");
      setMultas(raw ? (JSON.parse(raw) as RhMulta[]) : []);
    } catch { setMultas([]); }
  }, []);

  const docentes = multas.filter((m) => m.aplicaA === "Docente" || m.aplicaA === "Ambos");
  const staff = multas.filter((m) => m.aplicaA === "Staff" || m.aplicaA === "Ambos");

  const renderTable = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    list: RhMulta[],
  ) => {
    const Icon = icon;
    return (
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <p className="text-[11px] text-muted-foreground">Tabela de multas configurada em RH. Finanças visualiza em modo só-leitura.</p>
          </div>
          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums shrink-0">{list.length} multa{list.length === 1 ? "" : "s"}</span>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_140px_140px] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
            <div>Designação</div>
            <div>Aplica-se a</div>
            <div className="text-right">Valor (Kz)</div>
          </div>
          {list.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">
              Sem multas configuradas em RH. Configure em <span className="font-medium text-foreground">RH → Regras de Presença → Tabela de multas</span>.
            </div>
          ) : list.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_140px_140px] gap-3 px-5 py-2.5 items-center text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{m.nome}</p>
                {m.descricao && <p className="text-[11px] text-muted-foreground truncate">{m.descricao}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{m.aplicaA}</span>
              <div className="text-right tabular-nums font-medium">{fmt(m.valor)}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Tabelas geridas pelo módulo RH. Finanças tem apenas visualização — para editar, vá a Configurar RH → Regras de Presença.
      </div>
      {renderTable("Multas a docentes", GraduationCap, docentes)}
      {renderTable("Multas a staff", Briefcase, staff)}
    </div>
  );
}


/* ═══════════════════════════════ Generic block ════════════════════════════ */

function LineItemsBlock({
  title, subtitle, icon: Icon, storageKey, addLabel, placeholder, valueLabel,
  withUnit = false, withTarget = false, withType = false,
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
}) {
  const [rows, setRows] = useState<LineItem[]>(() => readJSON<LineItem[]>(storageKey, []));
  useEffect(() => writeJSON(storageKey, rows), [rows, storageKey]);

  const add = () => setRows((r) => [...r, {
    id: newId(), nome: "", valor: 0,
    ...(withUnit ? { unidade: "Kz" } : {}),
    ...(withType ? { tipo: "Único" } : {}),
    ...(withTarget ? { aplicaA: "estudante" } : {}),
  }]);
  const update = (id: string, patch: Partial<LineItem>) => setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const total = rows.reduce((s, r) => s + (r.valor || 0), 0);

  const cols = (() => {
    if (withType && withTarget) return "grid-cols-[1fr_130px_140px_150px_40px]";
    if (withUnit) return "grid-cols-[1fr_140px_120px_40px]";
    if (withTarget) return "grid-cols-[1fr_140px_150px_40px]";
    if (withType) return "grid-cols-[1fr_130px_180px_40px]";
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
          {withType && <div>Tipo</div>}
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
            {withType && (
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={r.tipo || "Único"}
                onChange={(e) => update(r.id, { tipo: e.target.value })}
              >
                <option value="Único">Único</option>
                <option value="Mensal">Mensal</option>
                <option value="Anual">Anual</option>
                <option value="Por pedido">Por pedido</option>
              </select>
            )}
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
