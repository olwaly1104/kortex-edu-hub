import { useState, useMemo } from "react";
import {
  CreditCard, Search, Users, Wallet, TrendingDown, ArrowUpDown, X, Download,
  FileText, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, salarios, payrollBudget } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortField = "grossSalary" | "netSalary" | "deductions";
type SortDir = "asc" | "desc";
type Periodo = "mensal" | "semestral" | "anual";

const statusConfig: Record<string, { label: string; className: string; icon: any; dot: string }> = {
  pago:         { label: "Pago",        className: "bg-accent/10 text-accent border-accent/30",       icon: CheckCircle2, dot: "bg-accent" },
  pendente:     { label: "Pendente",    className: "bg-amber-50 text-amber-700 border-amber-200",     icon: Clock,        dot: "bg-amber-500" },
  processando:  { label: "Processando", className: "bg-blue-50 text-blue-700 border-blue-200",        icon: Loader2,      dot: "bg-blue-500" },
};

const contractColors: Record<string, string> = {
  efectivo:    "bg-accent/10 text-accent border-accent/30",
  contratado:  "bg-blue-50 text-blue-700 border-blue-200",
  colaborador: "bg-amber-50 text-amber-700 border-amber-200",
};
const contractLabels: Record<string, string> = { efectivo: "Efectivo", contratado: "Contratado", colaborador: "Colaborador" };

const periodoMultiplier: Record<Periodo, number> = { mensal: 1, semestral: 6, anual: 12 };
const periodoLabels: Record<Periodo, string> = { mensal: "Mensal", semestral: "Semestral", anual: "Anual" };

export default function Salarios() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterContract, setFilterContract] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [periodo, setPeriodo] = useState<Periodo>("mensal");

  const mult = periodoMultiplier[periodo];

  const isStatusActive = filterStatus !== "todos";
  const isContractActive = filterContract !== "todos";
  const isSortActive = sortField !== null;
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive || isContractActive;

  const filtered = useMemo(() => {
    let list = salarios
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.employeeId.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()))
      .filter(s => filterStatus === "todos" || s.status === filterStatus)
      .filter(s => filterContract === "todos" || s.contractType === filterContract);

    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? (a[sortField] as number) - (b[sortField] as number) : (b[sortField] as number) - (a[sortField] as number));
    }
    return list;
  }, [search, sortField, sortDir, filterStatus, filterContract]);

  const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
  const totalLiquido = salarios.reduce((s, v) => s + v.netSalary, 0);
  const totalDescontos = salarios.reduce((s, v) => s + v.deductions, 0);
  const totalFuncionarios = salarios.length;
  const budgetPct = Math.round((totalBruto / payrollBudget.totalBudget) * 100);
  const budgetDisponivel = payrollBudget.totalBudget - totalBruto;
  const pagos = salarios.filter(s => s.status === "pago").length;
  const pendentes = salarios.filter(s => s.status === "pendente").length;
  const processando = salarios.filter(s => s.status === "processando").length;

  const resetAll = () => {
    setFilterStatus("todos"); setFilterContract("todos"); setSortField(null); setSortDir("desc"); setSearch("");
  };

  const statusCounts: Record<string, number> = {
    todos: salarios.length, pago: pagos, pendente: pendentes, processando,
  };
  const contractCounts: Record<string, number> = {
    todos: salarios.length,
    efectivo: salarios.filter(s => s.contractType === "efectivo").length,
    contratado: salarios.filter(s => s.contractType === "contratado").length,
    colaborador: salarios.filter(s => s.contractType === "colaborador").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Salários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Folha salarial · {payrollBudget.currentMonth} · {totalFuncionarios} funcionários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            {(["mensal", "semestral", "anual"] as Periodo[]).map(p => (
              <Button
                key={p}
                size="sm"
                variant={periodo === p ? "default" : "ghost"}
                onClick={() => setPeriodo(p)}
                className="text-[11px] h-7 px-3"
              >
                {periodoLabels[p]}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => toast({ title: "Relatório exportado" })}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* Hero summary: payroll utilization + KPIs */}
      <Card className="overflow-hidden border-border/70">
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          {/* Left: payroll budget */}
          <div className="p-6 lg:p-7 bg-gradient-to-br from-primary/5 via-card to-card border-b lg:border-b-0 lg:border-r border-border/70">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Orçamento salarial — {payrollBudget.currentMonth}
              </span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-transparent">
                {budgetPct}% utilizado
              </Badge>
            </div>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {formatCurrency(totalBruto)} de {formatCurrency(payrollBudget.totalBudget)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Disponível: <span className="text-accent font-medium tabular-nums">{formatCurrency(Math.max(0, budgetDisponivel))}</span>
                </p>
              </div>
              <p className="text-4xl font-bold tabular-nums leading-none text-primary">
                {budgetPct}<span className="text-xl">%</span>
              </p>
            </div>
            <Progress value={Math.min(budgetPct, 100)} className="h-2" />

            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/60">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Bruto</p>
                <p className="text-sm font-semibold tabular-nums text-foreground mt-1">{formatCurrency(totalBruto * mult)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Descontos</p>
                <p className="text-sm font-semibold tabular-nums text-destructive mt-1">{formatCurrency(totalDescontos * mult)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Líquido</p>
                <p className="text-sm font-semibold tabular-nums text-accent mt-1">{formatCurrency(totalLiquido * mult)}</p>
              </div>
            </div>
          </div>

          {/* Right: KPI tiles */}
          <div className="grid grid-cols-2">
            {[
              { label: "Funcionários", value: totalFuncionarios, icon: Users,        tone: "text-primary",      bg: "bg-primary/10" },
              { label: "Pagos",        value: pagos,              icon: CheckCircle2, tone: "text-accent",       bg: "bg-accent/10" },
              { label: "Pendentes",    value: pendentes,          icon: Clock,        tone: "text-amber-600",    bg: "bg-amber-100" },
              { label: "Processando",  value: processando,        icon: Loader2,      tone: "text-blue-600",     bg: "bg-blue-100" },
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

      {/* Controls — 2 lines */}
      <div className="rounded-xl border border-border bg-card">
        {/* Line 1: search + sort + reset */}
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-border/70">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, ID, departamento ou função…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-1.5 text-[11px] h-8", isSortActive && "border-primary/50 bg-primary/5 text-primary")}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 space-y-1" align="end">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
                {[
                  { key: "todos",        label: "Padrão" },
                  { key: "grossSalary",  label: "Bruto" },
                  { key: "netSalary",    label: "Líquido" },
                  { key: "deductions",   label: "Descontos" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { if (opt.key === "todos") setSortField(null); else setSortField(opt.key as SortField); }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                      (opt.key === "todos" && !sortField) || sortField === opt.key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
                {[
                  { key: "desc", label: "Maior → Menor" },
                  { key: "asc",  label: "Menor → Maior" },
                ].map(d => (
                  <button
                    key={d.key}
                    onClick={() => setSortDir(d.key as SortDir)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                      sortDir === d.key && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            {hasActiveControls && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                onClick={resetAll}
              >
                <X className="w-3 h-3" /> Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Line 2: filter chips */}
        <div className="px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Estado</span>
            {[
              { key: "todos", label: "Todos" },
              { key: "pago", label: "Pago" },
              { key: "pendente", label: "Pendente" },
              { key: "processando", label: "Processando" },
            ].map(s => (
              <Button
                key={s.key}
                size="sm"
                variant={filterStatus === s.key ? "default" : "outline"}
                onClick={() => setFilterStatus(s.key)}
                className="text-[11px] h-7 gap-1.5"
              >
                {s.label}
                <span className="tabular-nums opacity-70">{statusCounts[s.key]}</span>
              </Button>
            ))}
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Contrato</span>
            {[
              { key: "todos", label: "Todos" },
              { key: "efectivo", label: "Efectivo" },
              { key: "contratado", label: "Contratado" },
              { key: "colaborador", label: "Colaborador" },
            ].map(s => (
              <Button
                key={s.key}
                size="sm"
                variant={filterContract === s.key ? "default" : "outline"}
                onClick={() => setFilterContract(s.key)}
                className="text-[11px] h-7 gap-1.5"
              >
                {s.label}
                <span className="tabular-nums opacity-70">{contractCounts[s.key]}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border/70">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Funcionário</th>
                <th className="text-left px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Departamento</th>
                <th className="text-center px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Contrato</th>
                <th className="text-right px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Bruto</th>
                <th className="text-right px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Descontos</th>
                <th className="text-right px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Líquido</th>
                <th className="text-center px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Pagamento</th>
                <th className="text-center px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="text-right px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const st = statusConfig[s.status];
                return (
                  <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                          {s.name.split(" ").slice(-2).map(n => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-xs leading-tight truncate">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">{s.employeeId} · {s.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.department}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px]", contractColors[s.contractType])}>
                        {contractLabels[s.contractType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-foreground tabular-nums">{formatCurrency(s.grossSalary)}</td>
                    <td className="px-4 py-3 text-right text-xs text-destructive tabular-nums">−{formatCurrency(s.deductions)}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-primary tabular-nums">{formatCurrency(s.netSalary)}</td>
                    <td className="px-4 py-3 text-center text-[11px] text-muted-foreground tabular-nums">
                      {new Date(s.payDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px] gap-1", st.className)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                        {st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => toast({ title: "Recibo aberto" })}
                      >
                        <FileText className="w-3 h-3" /> Recibo
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">Nenhum funcionário encontrado.</p>
        )}
        <div className="border-t border-border/70 bg-muted/20 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{filtered.length} de {salarios.length} funcionários</span>
          {hasActiveControls && <span className="italic">Filtros aplicados</span>}
        </div>
      </Card>
    </div>
  );
}
