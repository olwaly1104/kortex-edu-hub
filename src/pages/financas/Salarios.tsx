import { useState, useMemo } from "react";
import { CreditCard, Search, Users, Wallet, TrendingDown, BadgeCheck, ArrowUpDown, X, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, salarios, payrollBudget } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortField = "grossSalary" | "netSalary" | "deductions";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  pago: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  processando: "bg-blue-100 text-blue-700 border-blue-200",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", processando: "Processando" };

const contractColors: Record<string, string> = {
  efectivo: "bg-accent/15 text-accent border-accent/30",
  contratado: "bg-blue-100 text-blue-700 border-blue-200",
  colaborador: "bg-amber-100 text-amber-700 border-amber-200",
};
const contractLabels: Record<string, string> = { efectivo: "Efectivo", contratado: "Contratado", colaborador: "Colaborador" };

export default function Salarios() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDept, setFilterDept] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const departments = [...new Set(salarios.map(s => s.department))];

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isDeptActive = filterDept !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isDeptActive || isSearchActive;

  const sortLabel = sortField === "grossSalary" ? "Bruto" : sortField === "netSalary" ? "Líquido" : sortField === "deductions" ? "Descontos" : "";
  const dirLabel = sortDir === "desc" ? "Maior" : "Menor";

  const filtered = useMemo(() => {
    let list = salarios
      .filter(s => filterDept === "todos" || s.department === filterDept)
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.employeeId.toLowerCase().includes(search.toLowerCase()))
      .filter(s => filterStatus === "todos" || s.status === filterStatus);

    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? (a[sortField] as number) - (b[sortField] as number) : (b[sortField] as number) - (a[sortField] as number));
    }
    return list;
  }, [filterDept, search, sortField, sortDir, filterStatus]);

  const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
  const totalLiquido = salarios.reduce((s, v) => s + v.netSalary, 0);
  const totalDescontos = salarios.reduce((s, v) => s + v.deductions, 0);
  const totalFuncionarios = salarios.length;

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); setFilterDept("todos"); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary" /> Salários</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Relatório exportado" })}>
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Funcionários</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalFuncionarios}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Bruto</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBruto)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Líquido</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalLiquido)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Descontos</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDescontos)}</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterDept === "todos" ? "default" : "outline"} onClick={() => setFilterDept("todos")} className="text-xs">Todos os Dept.</Button>
          {departments.map(d => (
            <Button key={d} size="sm" variant={filterDept === d ? "default" : "outline"} onClick={() => setFilterDept(d)} className="text-xs">{d}</Button>
          ))}
        </div>

        <div className="border-t border-border" />

        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por nome ou ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex-1" />
          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
          <div className="flex items-center gap-2">
            {[
              { key: "todos", label: "Todos" },
              { key: "pago", label: "Pago" },
              { key: "pendente", label: "Pendente" },
              { key: "processando", label: "Processando" },
            ].map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">{s.label}</Button>
            ))}
            <div className="w-px h-6 bg-border" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${isSortActive ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
                {[
                  { key: "todos", label: "Padrão" },
                  { key: "grossSalary", label: "Bruto" },
                  { key: "netSalary", label: "Líquido" },
                  { key: "deductions", label: "Descontos" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => { if (opt.key === "todos") setSortField(null); else setSortField(opt.key as SortField); }} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${(opt.key === "todos" && !sortField) || sortField === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{opt.label}</button>
                ))}
                <div className="border-t border-border my-1" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isDeptActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterDept("todos")}>
                Dept: {filterDept} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSortActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>
                {sortLabel}: {dirLabel} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isStatusActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>
                Estado: {statusLabels[filterStatus]} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSearchActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Contrato</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Bruto</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Descontos</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Líquido</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Pagamento</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(s => (
            <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
              <td className="p-3 text-[10px] text-muted-foreground font-mono">{s.employeeId}</td>
              <td className="p-3"><p className="font-medium text-foreground text-xs">{s.name}</p><p className="text-[11px] text-muted-foreground">{s.role}</p></td>
              <td className="p-3 text-xs text-muted-foreground">{s.department}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", contractColors[s.contractType])}>{contractLabels[s.contractType]}</Badge></td>
              <td className="p-3 text-right text-xs font-medium text-foreground">{formatCurrency(s.grossSalary)}</td>
              <td className="p-3 text-right text-xs text-destructive">-{formatCurrency(s.deductions)}</td>
              <td className="p-3 text-right text-xs font-semibold text-primary">{formatCurrency(s.netSalary)}</td>
              <td className="p-3 text-center text-xs text-muted-foreground">{new Date(s.payDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[s.status])}>{statusLabels[s.status]}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum funcionário encontrado.</p>}
      </Card>
    </div>
  );
}
