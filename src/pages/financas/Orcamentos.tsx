import { useState, useMemo } from "react";
import {
  Search, Plus, Wallet, TrendingUp, AlertTriangle,
  ArrowUpRight, Sparkles, Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, orcamentos } from "@/data/financeModuleData";
import { cn } from "@/lib/utils";

type StatusKey = "activo" | "esgotado" | "em_revisao";

const statusConfig: Record<StatusKey, { label: string; className: string }> = {
  activo:     { label: "Activo",     className: "bg-accent/10 text-accent border-accent/20" },
  em_revisao: { label: "Em Revisão", className: "bg-amber-50 text-amber-700 border-amber-200" },
  esgotado:   { label: "Esgotado",   className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const tone = (pct: number) => {
  if (pct >= 90) return { text: "text-destructive", bg: "bg-destructive", soft: "bg-destructive/10", ring: "ring-destructive/20" };
  if (pct >= 75) return { text: "text-amber-600",   bg: "bg-amber-500",   soft: "bg-amber-100",      ring: "ring-amber-200" };
  return            { text: "text-accent",        bg: "bg-accent",      soft: "bg-accent/10",      ring: "ring-accent/20" };
};

// distinct hues for the allocation strip (semantic-friendly)
const stripPalette = [
  "bg-primary",
  "bg-accent",
  "bg-secondary",
  "bg-amber-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-teal-500",
];

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | StatusKey>("todos");

  const filtered = useMemo(() => {
    return orcamentos
      .filter(o => filterStatus === "todos" || o.status === filterStatus)
      .filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.spent / b.totalBudget) - (a.spent / a.totalBudget));
  }, [search, filterStatus]);

  const totalBudget = orcamentos.reduce((s, o) => s + o.totalBudget, 0);
  const totalSpent  = orcamentos.reduce((s, o) => s + o.spent, 0);
  const available   = totalBudget - totalSpent;
  const pctUsed     = Math.round((totalSpent / totalBudget) * 100);
  const numAlerta   = orcamentos.filter(o => (o.spent / o.totalBudget) * 100 >= 90).length;
  const globalTone  = tone(pctUsed);

  const counts = {
    todos: orcamentos.length,
    activo: orcamentos.filter(o => o.status === "activo").length,
    em_revisao: orcamentos.filter(o => o.status === "em_revisao").length,
    esgotado: orcamentos.filter(o => o.status === "esgotado").length,
  };

  // Allocation strip: weight by totalBudget
  const allocStrip = [...orcamentos]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .map((o, i) => ({ o, pct: (o.totalBudget / totalBudget) * 100, color: stripPalette[i % stripPalette.length] }));

  return (
    <div className="min-h-full bg-muted/20">
      <div className="p-6 lg:p-10 space-y-8 animate-fade-in max-w-[1400px] mx-auto">
        {/* Editorial header */}
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-[0.18em] mb-2">
              <Calendar className="w-3 h-3" /> Exercício 2025
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight leading-none">Orçamentos</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Visão consolidada da execução orçamental por departamento, com alertas automáticos sobre limites críticos.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 h-9 shadow-sm">
            <Plus className="w-4 h-4" /> Novo Orçamento
          </Button>
        </div>

        {/* Editorial summary: huge number + segmented allocation strip */}
        <div className="bg-card rounded-2xl border border-border/70 p-6 lg:p-8 shadow-sm">
          <div className="grid lg:grid-cols-[1.2fr_auto_1.4fr] gap-8 items-center">
            {/* Massive % */}
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                <Sparkles className="w-3 h-3" /> Execução global
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-7xl font-bold tabular-nums tracking-tight leading-none", globalTone.text)}>
                  {pctUsed}
                </span>
                <span className={cn("text-2xl font-semibold", globalTone.text)}>%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 tabular-nums">
                {formatCurrency(totalSpent)} <span className="opacity-50">de</span> {formatCurrency(totalBudget)}
              </p>
            </div>

            <div className="hidden lg:block w-px h-24 bg-border" />

            {/* Right metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Metric label="Disponível"    value={formatCurrency(available)} tone="text-accent"   icon={<TrendingUp className="w-3.5 h-3.5" />} />
              <Metric label="Em Alerta"     value={String(numAlerta).padStart(2, "0")} tone={numAlerta ? "text-destructive" : "text-foreground"} icon={<AlertTriangle className="w-3.5 h-3.5" />} suffix={numAlerta === 1 ? "orçamento" : "orçamentos"} />
              <Metric label="Total"         value={String(orcamentos.length).padStart(2, "0")} tone="text-foreground" icon={<Wallet className="w-3.5 h-3.5" />} suffix="rubricas" />
            </div>
          </div>

          {/* Allocation strip */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Distribuição do orçamento
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">100%</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              {allocStrip.map(({ o, pct, color }) => (
                <div
                  key={o.id}
                  className={cn(color, "h-full hover:opacity-80 transition-opacity")}
                  style={{ width: `${pct}%` }}
                  title={`${o.name} · ${pct.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
              {allocStrip.slice(0, 6).map(({ o, pct, color }) => (
                <div key={o.id} className="flex items-center gap-2 text-[11px]">
                  <span className={cn("w-2 h-2 rounded-sm", color)} />
                  <span className="text-foreground font-medium truncate max-w-[180px]">{o.department}</span>
                  <span className="text-muted-foreground tabular-nums">{pct.toFixed(0)}%</span>
                </div>
              ))}
              {allocStrip.length > 6 && (
                <span className="text-[11px] text-muted-foreground">+{allocStrip.length - 6} outros</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls — minimal floating */}
        <div className="flex flex-wrap items-center gap-3 sticky top-0 z-10 bg-muted/20 backdrop-blur-sm py-2 -my-2">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-card"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto bg-card rounded-lg p-0.5 border border-border">
            {[
              { key: "todos", label: "Todos" },
              { key: "activo", label: "Activos" },
              { key: "em_revisao", label: "Revisão" },
              { key: "esgotado", label: "Esgotados" },
            ].map(f => (
              <Button
                key={f.key}
                size="sm"
                variant={filterStatus === f.key ? "default" : "ghost"}
                onClick={() => setFilterStatus(f.key as typeof filterStatus)}
                className="text-[11px] h-7 gap-1.5 px-2.5"
              >
                {f.label}
                <span className="tabular-nums opacity-60">{counts[f.key as keyof typeof counts]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* List view — editorial rows */}
        <div className="bg-card rounded-2xl border border-border/70 overflow-hidden shadow-sm">
          {/* Column header */}
          <div className="grid grid-cols-[1fr_auto_180px_120px_40px] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            <span>Orçamento</span>
            <span className="text-right">Estado</span>
            <span>Execução</span>
            <span className="text-right">Disponível</span>
            <span />
          </div>

          {filtered.map((o, idx) => {
            const pct = Math.round((o.spent / o.totalBudget) * 100);
            const remaining = Math.max(0, o.totalBudget - o.spent);
            const st = statusConfig[o.status as StatusKey];
            const t = tone(pct);
            return (
              <div
                key={o.id}
                className={cn(
                  "group grid grid-cols-[1fr_auto_180px_120px_40px] gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30 cursor-pointer",
                  idx !== filtered.length - 1 && "border-b border-border/50",
                )}
              >
                {/* Name + dept */}
                <div className="min-w-0 flex items-center gap-3">
                  <span className={cn("w-1 h-10 rounded-full shrink-0", t.bg)} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{o.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {o.department} · {o.period} · <span className="tabular-nums">{formatCurrency(o.totalBudget)}</span>
                    </p>
                  </div>
                </div>

                {/* Status */}
                <Badge variant="outline" className={cn("text-[10px] shrink-0", st.className)}>
                  {st.label}
                </Badge>

                {/* Execution bar + % */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", t.bg)} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className={cn("text-xs font-bold tabular-nums w-10 text-right", t.text)}>{pct}%</span>
                </div>

                {/* Available */}
                <div className="text-right">
                  <p className={cn("text-xs font-semibold tabular-nums", remaining > 0 ? "text-foreground" : "text-destructive")}>
                    {formatCurrency(remaining)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                    de {formatCurrency(o.totalBudget)}
                  </p>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Nenhum orçamento encontrado.
            </div>
          )}

          <div className="px-6 py-3 bg-muted/20 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>{filtered.length} de {orcamentos.length} orçamentos</span>
            <span className="tabular-nums">Total exercício · {formatCurrency(totalBudget)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone, icon, suffix }: { label: string; value: string; tone: string; icon: React.ReactNode; suffix?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        <span className={tone}>{icon}</span>
        {label}
      </div>
      <p className={cn("text-lg font-bold tabular-nums leading-tight", tone)}>{value}</p>
      {suffix && <p className="text-[10px] text-muted-foreground mt-0.5">{suffix}</p>}
    </div>
  );
}
