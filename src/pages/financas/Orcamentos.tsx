import { useState, useMemo } from "react";
import {
  Search, Plus, Wallet, TrendingDown, CheckCircle2, AlertTriangle,
  Building2, ArrowRight, Filter, MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { formatCurrency, orcamentos } from "@/data/financeModuleData";
import { cn } from "@/lib/utils";

type StatusKey = "activo" | "esgotado" | "em_revisao";

const statusConfig: Record<StatusKey, { label: string; className: string; dot: string }> = {
  activo:     { label: "Activo",     className: "bg-accent/10 text-accent border-accent/30",                   dot: "bg-accent" },
  em_revisao: { label: "Em Revisão", className: "bg-amber-50 text-amber-700 border-amber-200",                 dot: "bg-amber-500" },
  esgotado:   { label: "Esgotado",   className: "bg-destructive/10 text-destructive border-destructive/30",    dot: "bg-destructive" },
};

const usageTone = (pct: number) => {
  if (pct >= 90) return { text: "text-destructive", bar: "[&>div]:bg-destructive", soft: "bg-destructive/10", chip: "Crítico" };
  if (pct >= 75) return { text: "text-amber-600",   bar: "[&>div]:bg-amber-500",   soft: "bg-amber-100",      chip: "Atenção" };
  return            { text: "text-accent",        bar: "[&>div]:bg-accent",      soft: "bg-accent/10",      chip: "Saudável" };
};

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | StatusKey>("todos");
  const [sort, setSort] = useState<"utilizacao" | "valor" | "nome">("utilizacao");

  const filtered = useMemo(() => {
    const list = orcamentos
      .filter(o => filterStatus === "todos" || o.status === filterStatus)
      .filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...list];
    if (sort === "utilizacao") sorted.sort((a, b) => (b.spent / b.totalBudget) - (a.spent / a.totalBudget));
    if (sort === "valor")      sorted.sort((a, b) => b.totalBudget - a.totalBudget);
    if (sort === "nome")       sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [search, filterStatus, sort]);

  const totalBudget = orcamentos.reduce((s, o) => s + o.totalBudget, 0);
  const totalSpent  = orcamentos.reduce((s, o) => s + o.spent, 0);
  const available   = totalBudget - totalSpent;
  const pctUsed     = Math.round((totalSpent / totalBudget) * 100);
  const numActivos  = orcamentos.filter(o => o.status === "activo").length;
  const numAlerta   = orcamentos.filter(o => (o.spent / o.totalBudget) * 100 >= 90).length;
  const numRevisao  = orcamentos.filter(o => o.status === "em_revisao").length;
  const globalTone  = usageTone(pctUsed);

  const counts = {
    todos: orcamentos.length,
    activo: orcamentos.filter(o => o.status === "activo").length,
    em_revisao: numRevisao,
    esgotado: orcamentos.filter(o => o.status === "esgotado").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Orçamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhamento de orçamentos por departamento · Exercício 2025
          </p>
        </div>
        <Button size="sm" className="gap-1.5 h-9 shadow-sm">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      {/* Hero summary: global utilization + breakdown */}
      <Card className="overflow-hidden border-border/70">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          {/* Left: global utilization */}
          <div className="p-6 lg:p-7 bg-gradient-to-br from-primary/5 via-card to-card border-b lg:border-b-0 lg:border-r border-border/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Utilização global
              </span>
              <Badge variant="outline" className={cn("text-[10px] gap-1", globalTone.soft, globalTone.text, "border-transparent")}>
                {globalTone.chip}
              </Badge>
            </div>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {formatCurrency(totalSpent)} de {formatCurrency(totalBudget)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {numActivos} orçamentos activos · {numRevisao} em revisão
                </p>
              </div>
              <p className={cn("text-4xl font-bold tabular-nums leading-none", globalTone.text)}>
                {pctUsed}<span className="text-xl">%</span>
              </p>
            </div>
            <Progress value={pctUsed} className={cn("h-2", globalTone.bar)} />

            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/60">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orçamentado</p>
                <p className="text-sm font-semibold tabular-nums text-foreground mt-1">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gasto</p>
                <p className="text-sm font-semibold tabular-nums text-destructive mt-1">{formatCurrency(totalSpent)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Disponível</p>
                <p className="text-sm font-semibold tabular-nums text-accent mt-1">{formatCurrency(available)}</p>
              </div>
            </div>
          </div>

          {/* Right: KPI tiles */}
          <div className="grid grid-cols-2">
            {[
              { label: "Activos",     value: numActivos,  icon: CheckCircle2,   tone: "text-accent",       bg: "bg-accent/10" },
              { label: "Em Revisão",  value: numRevisao,  icon: AlertTriangle,  tone: "text-amber-600",    bg: "bg-amber-100" },
              { label: "Em Alerta",   value: numAlerta,   icon: TrendingDown,   tone: "text-destructive",  bg: "bg-destructive/10" },
              { label: "Total",       value: orcamentos.length, icon: Wallet,   tone: "text-primary",      bg: "bg-primary/10" },
            ].map((k, i) => (
              <div
                key={k.label}
                className={cn(
                  "p-5 flex flex-col gap-3",
                  i % 2 === 0 && "border-r border-border/70",
                  i < 2 && "border-b border-border/70",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", k.bg)}>
                    <k.icon className={cn("w-3.5 h-3.5", k.tone)} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</span>
                </div>
                <p className={cn("text-2xl font-bold tabular-nums leading-none", k.tone)}>{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-border/70">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar orçamento ou departamento…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            <span className="text-[11px] text-muted-foreground mr-2">Ordenar:</span>
            {[
              { key: "utilizacao", label: "Utilização" },
              { key: "valor", label: "Valor" },
              { key: "nome", label: "Nome" },
            ].map(o => (
              <Button
                key={o.key}
                size="sm"
                variant={sort === o.key ? "default" : "ghost"}
                onClick={() => setSort(o.key as typeof sort)}
                className="text-[11px] h-7 px-2.5"
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2 flex flex-wrap items-center gap-1.5">
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
              onClick={() => setFilterStatus(f.key as typeof filterStatus)}
              className="text-[11px] h-7 gap-1.5"
            >
              {f.label}
              <span className="tabular-nums opacity-70">{counts[f.key as keyof typeof counts]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Budget cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(o => {
          const pct = Math.round((o.spent / o.totalBudget) * 100);
          const remaining = Math.max(0, o.totalBudget - o.spent);
          const st = statusConfig[o.status as StatusKey];
          const tone = usageTone(pct);
          return (
            <Card
              key={o.id}
              className="group relative p-5 border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              {/* Left accent rail */}
              <span className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                pct >= 90 ? "bg-destructive" : pct >= 75 ? "bg-amber-500" : "bg-accent",
              )} />

              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-4 pl-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{o.department}</span>
                    <span className="opacity-50">·</span>
                    <span>{o.period}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{o.name}</h3>
                </div>
                <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", st.className)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                  {st.label}
                </Badge>
              </div>

              {/* Big number */}
              <div className="flex items-end justify-between mb-3 pl-1">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Utilizado</p>
                  <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{formatCurrency(o.spent)}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-3xl font-bold tabular-nums leading-none", tone.text)}>
                    {pct}<span className="text-base">%</span>
                  </p>
                </div>
              </div>

              {/* Progress */}
              <Progress value={pct} className={cn("h-1.5 mb-4", tone.bar)} />

              {/* Footer breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 pl-1">
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

              {/* Hover action */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3 p-10 text-center text-sm text-muted-foreground">
            Nenhum orçamento encontrado.
          </Card>
        )}
      </div>
    </div>
  );
}
