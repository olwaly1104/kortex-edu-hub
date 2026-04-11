import { useState } from "react";
import { Users, Search, Filter, Download, CreditCard, TrendingDown, Wallet, Building2, UserCheck, Clock, ChevronRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, salarios, payrollBudget, departmentSalarySummary } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  processando: "bg-blue-100 text-blue-700",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", processando: "Processando" };

const contractColors: Record<string, string> = {
  efectivo: "bg-emerald-100 text-emerald-700",
  contratado: "bg-blue-100 text-blue-700",
  colaborador: "bg-amber-100 text-amber-700",
};
const contractLabels: Record<string, string> = { efectivo: "Efectivo", contratado: "Contratado", colaborador: "Colaborador" };

export default function Salarios() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterContract, setFilterContract] = useState("all");
  const [activeTab, setActiveTab] = useState<"folha" | "funcionarios" | "departamentos">("folha");

  const departments = [...new Set(salarios.map(s => s.department))];

  const filtered = salarios.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.employeeId.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterDept !== "all" && s.department !== filterDept) return false;
    if (filterContract !== "all" && s.contractType !== filterContract) return false;
    return true;
  });

  const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
  const totalLiquido = salarios.reduce((s, v) => s + v.netSalary, 0);
  const totalDeductions = salarios.reduce((s, v) => s + v.deductions, 0);
  const pagos = salarios.filter(s => s.status === "pago").length;
  const pendentes = salarios.filter(s => s.status === "pendente").length;
  const processando = salarios.filter(s => s.status === "processando").length;
  const totalFuncionarios = salarios.length;

  const efectivos = salarios.filter(s => s.contractType === "efectivo").length;
  const contratados = salarios.filter(s => s.contractType === "contratado").length;
  const colaboradores = salarios.filter(s => s.contractType === "colaborador").length;

  const budgetUsed = totalBruto;
  const budgetTotal = payrollBudget.totalBudget;
  const budgetPct = Math.round((budgetUsed / budgetTotal) * 100);
  const budgetAvailable = budgetTotal - budgetUsed;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salários</h1>
          <p className="text-sm text-muted-foreground">Gestão completa da folha salarial — {payrollBudget.currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Relatório exportado" })}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button size="sm" className="gap-1.5">
            <CreditCard className="w-4 h-4" /> Processar Pagamentos
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bruto", value: formatCurrency(totalBruto), icon: Wallet, color: "text-foreground", bg: "bg-muted/50" },
          { label: "Total Líquido", value: formatCurrency(totalLiquido), icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Descontos", value: formatCurrency(totalDeductions), icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Funcionários", value: `${totalFuncionarios}`, icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget + Quick Stats Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Payroll Budget */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-primary" /> Orçamento Salarial Mensal
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Utilizado: {formatCurrency(budgetUsed)}</span>
              <span className={`font-semibold ${budgetPct > 90 ? "text-red-600" : "text-primary"}`}>{budgetPct}%</span>
            </div>
            <Progress value={budgetPct} className="h-2" />
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Orçamento: {formatCurrency(budgetTotal)}</span>
              <span className={`font-medium ${budgetAvailable < 0 ? "text-red-600" : "text-emerald-600"}`}>
                Disponível: {formatCurrency(Math.max(0, budgetAvailable))}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> Estado de Pagamento
          </h3>
          <div className="space-y-2">
            {[
              { label: "Pagos", count: pagos, pct: Math.round((pagos / totalFuncionarios) * 100), color: "bg-emerald-500" },
              { label: "Pendentes", count: pendentes, pct: Math.round((pendentes / totalFuncionarios) * 100), color: "bg-amber-500" },
              { label: "Processando", count: processando, pct: Math.round((processando / totalFuncionarios) * 100), color: "bg-blue-500" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`} />
                <span className="text-[11px] text-muted-foreground flex-1">{s.label}</span>
                <span className="text-[11px] font-semibold text-foreground">{s.count}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{s.pct}%</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 transition-all" style={{ width: `${(pagos / totalFuncionarios) * 100}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${(pendentes / totalFuncionarios) * 100}%` }} />
                <div className="bg-blue-500 transition-all" style={{ width: `${(processando / totalFuncionarios) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Contract Types */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-600" /> Tipo de Contrato
          </h3>
          <div className="space-y-2">
            {[
              { label: "Efectivos", count: efectivos, pct: Math.round((efectivos / totalFuncionarios) * 100), color: "bg-emerald-500" },
              { label: "Contratados", count: contratados, pct: Math.round((contratados / totalFuncionarios) * 100), color: "bg-blue-500" },
              { label: "Colaboradores", count: colaboradores, pct: Math.round((colaboradores / totalFuncionarios) * 100), color: "bg-amber-500" },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                <span className="text-[11px] text-muted-foreground flex-1">{c.label}</span>
                <span className="text-[11px] font-semibold text-foreground">{c.count}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{c.pct}%</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 transition-all" style={{ width: `${(efectivos / totalFuncionarios) * 100}%` }} />
                <div className="bg-blue-500 transition-all" style={{ width: `${(contratados / totalFuncionarios) * 100}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${(colaboradores / totalFuncionarios) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "folha" as const, label: "Folha Salarial", count: totalFuncionarios },
          { id: "funcionarios" as const, label: "Lista de Funcionários", count: totalFuncionarios },
          { id: "departamentos" as const, label: "Por Departamento", count: departments.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0">{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-9"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Estados</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Dept.</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterContract} onValueChange={setFilterContract}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Contrato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Contratos</SelectItem>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="contratado">Contratado</SelectItem>
            <SelectItem value="colaborador">Colaborador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tab: Folha Salarial */}
      {activeTab === "folha" && (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">ID</TableHead>
                <TableHead className="text-[11px]">Nome</TableHead>
                <TableHead className="text-[11px]">Cargo</TableHead>
                <TableHead className="text-[11px]">Departamento</TableHead>
                <TableHead className="text-[11px]">Bruto</TableHead>
                <TableHead className="text-[11px]">Descontos</TableHead>
                <TableHead className="text-[11px]">Líquido</TableHead>
                <TableHead className="text-[11px]">Pagamento</TableHead>
                <TableHead className="text-[11px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell className="text-[10px] text-muted-foreground font-mono">{s.employeeId}</TableCell>
                  <TableCell className="text-xs font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.role}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.department}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">{formatCurrency(s.grossSalary)}</TableCell>
                  <TableCell className="text-xs text-red-600">-{formatCurrency(s.deductions)}</TableCell>
                  <TableCell className="text-xs font-semibold text-primary">{formatCurrency(s.netSalary)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(s.payDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</TableCell>
                  <TableCell><Badge className={`text-[10px] border-0 ${statusColors[s.status]}`}>{statusLabels[s.status]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{filtered.length} funcionários</span>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Total Bruto: <span className="font-semibold text-foreground">{formatCurrency(filtered.reduce((s, v) => s + v.grossSalary, 0))}</span></span>
              <span className="text-muted-foreground">Total Líquido: <span className="font-semibold text-primary">{formatCurrency(filtered.reduce((s, v) => s + v.netSalary, 0))}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Lista de Funcionários */}
      {activeTab === "funcionarios" && (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">ID</TableHead>
                <TableHead className="text-[11px]">Nome</TableHead>
                <TableHead className="text-[11px]">Cargo</TableHead>
                <TableHead className="text-[11px]">Departamento</TableHead>
                <TableHead className="text-[11px]">Contrato</TableHead>
                <TableHead className="text-[11px]">Data Admissão</TableHead>
                <TableHead className="text-[11px]">Conta</TableHead>
                <TableHead className="text-[11px]">Salário Bruto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell className="text-[10px] text-muted-foreground font-mono">{s.employeeId}</TableCell>
                  <TableCell className="text-xs font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.role}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.department}</Badge></TableCell>
                  <TableCell><Badge className={`text-[10px] border-0 ${contractColors[s.contractType]}`}>{contractLabels[s.contractType]}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(s.hireDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground font-mono">{s.bankAccount}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{formatCurrency(s.grossSalary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{filtered.length} funcionários</span>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Efectivos: <span className="font-semibold text-foreground">{filtered.filter(s => s.contractType === "efectivo").length}</span></span>
              <span className="text-muted-foreground">Contratados: <span className="font-semibold text-foreground">{filtered.filter(s => s.contractType === "contratado").length}</span></span>
              <span className="text-muted-foreground">Colaboradores: <span className="font-semibold text-foreground">{filtered.filter(s => s.contractType === "colaborador").length}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Por Departamento */}
      {activeTab === "departamentos" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departmentSalarySummary.map(dept => {
            const pct = Math.round((dept.totalGross / dept.budgetAlloc) * 100);
            const available = dept.budgetAlloc - dept.totalGross;
            return (
              <Card key={dept.department} className="p-4 space-y-3 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">{dept.department}</h3>
                      <p className="text-[10px] text-muted-foreground">{dept.employees} funcionários</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Bruto</p>
                    <p className="text-xs font-bold text-foreground">{formatCurrency(dept.totalGross)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Líquido</p>
                    <p className="text-xs font-bold text-primary">{formatCurrency(dept.totalNet)}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Orçamento: {formatCurrency(dept.budgetAlloc)}</span>
                    <span className={`font-semibold ${pct > 90 ? "text-red-600" : "text-primary"}`}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">% Utilizado</span>
                    <span className={`font-medium ${available < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      Disponível: {formatCurrency(Math.max(0, available))}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
