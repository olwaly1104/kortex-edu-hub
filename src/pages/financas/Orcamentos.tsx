import { useState, useMemo } from "react";
import { Search, Plus, Wallet, TrendingDown, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { formatCurrency, orcamentos } from "@/data/financeModuleData";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  activo: { label: "Activo", className: "bg-accent/10 text-accent border-accent/20", dot: "bg-accent" },
  esgotado: { label: "Esgotado", className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  em_revisao: { label: "Em Revisão", className: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
};

const usageColor = (pct: number) => {
  if (pct >= 90) return "text-destructive";
  if (pct >= 75) return "text-amber-600";
  return "text-accent";
};
const usageBar = (pct: number) => {
  if (pct >= 90) return "[&>div]:bg-destructive";
  if (pct >= 75) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-accent";
};

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filtered = useMemo(() => {
    return orcamentos
      .filter(o => filterStatus === "todos" || o.status === filterStatus)
      .filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase()));
  }, [search, filterStatus]);

  const totalBudget = orcamentos.reduce((s, o) => s + o.totalBudget, 0);
  const totalSpent = orcamentos.reduce((s, o) => s + o.spent, 0);
  const available = totalBudget - totalSpent;
  const pctUsed = Math.round((totalSpent / totalBudget) * 100);
  const numActivos = orcamentos.filter(o => o.status === "activo").length;
  const numAlerta = orcamentos.filter(o => Math.round((o.spent / o.totalBudget) * 100) >= 90).length;

  const counts = {
    todos: orcamentos.length,
    activo: orcamentos.filter(o => o.status === "activo").length,
    em_revisao: orcamentos.filter(o => o.status === "em_revisao").length,
    esgotado: orcamentos.filter(o => o.status === "esgotado").length,
  };

  // Categorias derivadas (mapeamento por id)
  const categoryMap: Record<string, string> = {
    o1: "Académico", o2: "Académico", o3: "Académico",
    o4: "Infraestrutura", o5: "Infraestrutura",
    o6: "Investigação", o7: "Bolsas e Apoio", o8: "Operacional",
  };
  const categorySwatch: Record<string, string> = {
    "Académico": "bg-primary",
    "Infraestrutura": "bg-amber-500",
    "Investigação": "bg-sky-500",
    "Bolsas e Apoio": "bg-violet-500",
    "Operacional": "bg-accent",
  };
  const categoryBreakdown = Object.entries(
    orcamentos.reduce<Record<string, { budget: number; spent: number }>>((acc, o) => {
      const k = categoryMap[o.id] ?? "Outros";
      acc[k] = acc[k] ?? { budget: 0, spent: 0 };
      acc[k].budget += o.totalBudget;
      acc[k].spent += o.spent;
      return acc;
    }, {})
  )
    .map(([label, v]) => ({ label, ...v, swatch: categorySwatch[label] ?? "bg-muted-foreground" }))
    .sort((a, b) => b.budget - a.budget);

  const faculdadeBreakdown = orcamentos
    .filter(o => o.department.startsWith("Fac."))
    .map(o => ({ label: o.department.replace("Fac. ", "Faculdade de "), budget: o.totalBudget, spent: o.spent }))
    .sort((a, b) => b.budget - a.budget);
  const maxFacBudget = Math.max(...faculdadeBreakdown.map(f => f.budget), 1);

  const alertaList = orcamentos
    .map(o => ({ ...o, pct: Math.round((o.spent / o.totalBudget) * 100) }))
    .filter(o => o.pct >= 75 || o.status === "esgotado")
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Orçamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Acompanhamento de orçamentos por departamento.</p>
        </div>
        <Button size="sm" className="gap-1.5 h-9"><Plus className="w-4 h-4" /> Novo Orçamento</Button>
      </div>

      {/* Ano Letivo banner */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Ano Letivo</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{orcamentos[0]?.period ?? "2025"}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Todos os dados abaixo referem-se a este ano letivo</p>
      </div>

      {/* Dados + Utilização global — unified card */}
      <Card className="p-5 border-border/70">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Resumo do Orçamento</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{orcamentos.length} orçamentos · {numAlerta} em alerta</p>
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <p className={cn("text-4xl font-bold tabular-nums leading-none", usageColor(pctUsed))}>{pctUsed}</p>
            <span className={cn("text-lg font-semibold", usageColor(pctUsed))}>%</span>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Total Orçamentado</p>
            <p className="text-lg font-bold text-foreground tabular-nums leading-none">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Total Gasto</p>
            <p className={cn("text-lg font-bold tabular-nums leading-none", usageColor(pctUsed))}>{formatCurrency(totalSpent)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Disponível</p>
            <p className="text-lg font-bold text-foreground tabular-nums leading-none">{formatCurrency(available)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Em Alerta</p>
            <p className={cn("text-lg font-bold tabular-nums leading-none", numAlerta > 0 ? "text-amber-600" : "text-foreground")}>{numAlerta}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Estado</p>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-bold",
                pctUsed >= 90
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : pctUsed >= 75
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-accent/10 text-accent border-accent/20"
              )}
            >
              {pctUsed >= 90 ? "Crítico" : pctUsed >= 75 ? "Atenção" : "Saudável"}
            </Badge>
          </div>
        </div>

        {/* Progress bar — structured & professional */}
        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Utilização Global</p>


          <div className="relative pb-6">
            {/* Track with zone backgrounds */}
            <div className="relative h-3 w-full rounded-md bg-background border border-border overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-accent/5" style={{ width: "75%" }} />
              <div className="absolute inset-y-0 bg-amber-500/10" style={{ left: "75%", width: "15%" }} />
              <div className="absolute inset-y-0 bg-destructive/10" style={{ left: "90%", width: "10%" }} />
              <div
                className={cn(
                  "relative h-full transition-all",
                  pctUsed >= 90 ? "bg-destructive" : pctUsed >= 75 ? "bg-amber-500" : "bg-accent"
                )}
                style={{ width: `${Math.min(pctUsed, 100)}%` }}
              />
            </div>

            {/* Threshold ticks with inline labels */}
            <div className="absolute -top-2 left-0 right-0 h-5 flex items-end justify-between text-[10px] tabular-nums">
              <span className="text-muted-foreground">0%</span>
              <span className="font-semibold text-amber-600">75%</span>
              <span className="font-semibold text-destructive">90%</span>
              <span className="text-muted-foreground">100%</span>
            </div>

            <div className="absolute top-0 h-3 border-l border-dashed border-amber-500/70" style={{ left: "75%" }} />
            <div className="absolute top-0 h-3 border-l border-dashed border-destructive/70" style={{ left: "90%" }} />
          </div>
        </div>
      </Card>


      {/* Infographics: por categoria + por faculdade + por responsável */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4 border-border/70">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">Por categoria</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-2.5">
            {categoryBreakdown.map(c => {
              const pct = Math.round((c.spent / c.budget) * 100);
              const share = Math.round((c.budget / totalBudget) * 100);
              return (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn("w-2 h-2 rounded-sm shrink-0", c.swatch)} />
                      <p className="text-[11px] font-medium text-foreground truncate">{c.label}</p>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{share}%</span>
                    </div>
                    <span className={cn("text-[10px] font-semibold tabular-nums shrink-0", usageColor(pct))}>{pct}%</span>
                  </div>
                  <div className="relative h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", pct >= 90 ? "bg-destructive" : pct >= 75 ? "bg-amber-500" : "bg-accent")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 border-border/70">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">Por faculdade</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-2.5">
            {faculdadeBreakdown.map(f => {
              const pct = Math.round((f.spent / f.budget) * 100);
              const widthBudget = (f.budget / maxFacBudget) * 100;
              const widthSpent = (f.spent / maxFacBudget) * 100;
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-medium text-foreground truncate">{f.label}</p>
                    <span className={cn("text-[10px] font-semibold tabular-nums", usageColor(pct))}>{pct}%</span>
                  </div>
                  <div className="relative h-4 w-full rounded bg-muted/60 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${widthBudget}%` }} />
                    <div className={cn("absolute inset-y-0 left-0", pct >= 90 ? "bg-destructive" : pct >= 75 ? "bg-amber-500" : "bg-primary")} style={{ width: `${widthSpent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /><span className="text-[9px] text-muted-foreground uppercase tracking-wider">Gasto</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/15" /><span className="text-[9px] text-muted-foreground uppercase tracking-wider">Orçamento</span></div>
          </div>
        </Card>

        <Card className="p-4 border-border/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs font-semibold text-foreground">Em alerta</p>
              <span className="text-[10px] text-muted-foreground tabular-nums">({alertaList.length})</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          {alertaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <p className="text-[11px] text-muted-foreground">Sem orçamentos em alerta</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertaList.map(o => {
                const remaining = Math.max(0, o.totalBudget - o.spent);
                const sev = o.pct >= 90 ? "destructive" : "amber";
                return (
                  <div key={o.id} className={cn("rounded-md border p-2 flex items-center gap-2", sev === "destructive" ? "border-destructive/30 bg-destructive/5" : "border-amber-200 bg-amber-50/60")}>
                    <span className={cn("w-1 self-stretch rounded-full", sev === "destructive" ? "bg-destructive" : "bg-amber-500")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-foreground truncate">{o.name.replace("Orçamento Geral — ", "")}</p>
                        <span className={cn("text-[11px] font-bold tabular-nums shrink-0", usageColor(o.pct))}>{o.pct}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground tabular-nums truncate">
                        {formatCurrency(remaining)} disponível · {o.responsavel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-3 flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Pesquisar orçamento ou departamento…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: "todos", label: "Todos" },
            { key: "activo", label: "Activos" },
            { key: "em_revisao", label: "Em Revisão" },
            { key: "esgotado", label: "Esgotados" },
          ].map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={filterStatus === f.key ? "default" : "outline"}
              onClick={() => setFilterStatus(f.key)}
              className="text-[11px] h-8 gap-1.5"
            >
              {f.label}
              <span className="tabular-nums opacity-70">{counts[f.key as keyof typeof counts]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Budget cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(o => {
          const pct = Math.round((o.spent / o.totalBudget) * 100);
          const remaining = Math.max(0, o.totalBudget - o.spent);
          const st = statusConfig[o.status];
          return (
            <Card key={o.id} className="p-4 border-border/70 hover:border-border transition-colors group">
              {/* Top: title + status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{o.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{o.department} · {o.period}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", st.className)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                  {st.label}
                </Badge>
              </div>

              {/* Big number */}
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gasto</p>
                  <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{formatCurrency(o.spent)}</p>
                </div>
                <p className={cn("text-2xl font-bold tabular-nums leading-none", usageColor(pct))}>{pct}%</p>
              </div>

              {/* Progress */}
              <Progress value={pct} className={cn("h-1.5 mb-3", usageBar(pct))} />

              {/* Footer breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orçamento</p>
                  <p className="text-xs font-semibold text-foreground tabular-nums mt-0.5">{formatCurrency(o.totalBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Disponível</p>
                  <p className={cn("text-xs font-semibold tabular-nums mt-0.5", remaining > 0 ? "text-accent" : "text-destructive")}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>

              {/* Responsável */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-primary">
                    {o.responsavel.split(" ").slice(-2).map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</p>
                  <p className="text-xs font-medium text-foreground truncate">{o.responsavel}</p>
                </div>
                <p className="text-[10px] text-muted-foreground truncate max-w-[45%] text-right">{o.responsavelRole}</p>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 p-10 text-center text-sm text-muted-foreground">Nenhum orçamento encontrado.</Card>
        )}
      </div>
    </div>
  );
}
