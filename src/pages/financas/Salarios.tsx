import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Users, Wallet, Clock, Loader2, FileText, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, salarios, type Salary } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { loadDocentes } from "@/lib/peopleStorage";
import { FinHeader } from "./_FinHeader";
import { PeriodSelector, PERIODO_MULT, type Periodo, periodoDefaultValue } from "./_PeriodSelector";

type SortField = "gross" | "net";
type SortDir = "asc" | "desc";

const statusColors: Record<Salary["status"], string> = {
  pago: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  processando: "bg-blue-100 text-blue-700 border-blue-200",
};
const statusLabels: Record<Salary["status"], string> = { pago: "Pago", pendente: "Pendente", processando: "A processar" };

const contractLabels: Record<Salary["contractType"], string> = { efectivo: "Efectivo", contratado: "Contratado", colaborador: "Colaborador" };

export default function Salarios() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const docenteByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of loadDocentes()) {
      const full = `${d.primeiroNome} ${d.ultimoNome}`.trim().toLowerCase();
      if (full) map.set(full, d.id);
    }
    return map;
  }, []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterContract, setFilterContract] = useState<string>("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [periodoValue, setPeriodoValue] = useState<string>(periodoDefaultValue("mes"));
  const mult = PERIODO_MULT[periodo];

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isContractActive = filterContract !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive || isContractActive;

  const filtered = useMemo(() => {
    let list = salarios
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.employeeId.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()))
      .filter(s => filterStatus === "todos" || s.status === filterStatus)
      .filter(s => filterContract === "todos" || s.contractType === filterContract);
    if (sortField) {
      list = [...list].sort((a, b) => {
        const av = sortField === "gross" ? a.grossSalary : a.netSalary;
        const bv = sortField === "gross" ? b.grossSalary : b.netSalary;
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }
    return list;
  }, [search, sortField, sortDir, filterStatus, filterContract]);

  const totalBruto = salarios.reduce((s, x) => s + x.grossSalary, 0);
  const pagos = salarios.filter(s => s.status === "pago").reduce((sum, x) => sum + x.netSalary, 0);
  const pendentes = salarios.filter(s => s.status === "pendente").reduce((sum, x) => sum + x.netSalary, 0);
  const processando = salarios.filter(s => s.status === "processando").length;

  const resetAll = () => { setFilterStatus("todos"); setFilterContract("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Salários"
        subtitle="Folha de pagamento institucional — docentes e staff."
        icon={<Users className="w-5 h-5 text-primary" />}
      />

      <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} value={periodoValue} setValue={setPeriodoValue} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: periodo === "mes" ? "Folha Bruta do Mês" : periodo === "semestre" ? "Folha Bruta do Semestre" : "Folha Bruta do Ano", value: formatCurrency(totalBruto * mult), icon: Wallet, color: "text-foreground" },
          { label: "Pagos (Líquido)", value: formatCurrency(pagos * mult), icon: Wallet, color: "text-accent" },
          { label: "Pendentes (Líquido)", value: formatCurrency(pendentes * mult), icon: Clock, color: "text-amber-600" },
          { label: "Em Atraso", value: String(processando), icon: Loader2, color: "text-blue-600" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><kpi.icon className="w-4 h-4 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <Button size="sm" variant={filterContract === "todos" ? "default" : "outline"} onClick={() => setFilterContract("todos")} className="text-xs">Todos</Button>
          {(["efectivo", "contratado", "colaborador"] as const).map(c => (
            <Button key={c} size="sm" variant={filterContract === c ? "default" : "outline"} onClick={() => setFilterContract(c)} className="text-xs">{contractLabels[c]}</Button>
          ))}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar nome, ID, cargo, departamento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
              { key: "processando", label: "A processar" },
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
              <PopoverContent className="w-40 p-2 space-y-1" align="end" side="top">
                <button onClick={() => setSortField(null)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${!sortField ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Padrão</button>
                <button onClick={() => setSortField("gross")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "gross" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Bruto</button>
                <button onClick={() => setSortField("net")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "net" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Líquido</button>
                <div className="border-t border-border my-1" />
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {statusLabels[filterStatus as Salary["status"]]} <X className="w-2.5 h-2.5" /></Badge>}
            {isContractActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterContract("todos")}>Contrato: {contractLabels[filterContract as Salary["contractType"]]} <X className="w-2.5 h-2.5" /></Badge>}
            {isSortActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>{sortField === "gross" ? "Bruto" : "Líquido"}: {sortDir === "desc" ? "Maior" : "Menor"} <X className="w-2.5 h-2.5" /></Badge>}
            {isSearchActive && <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>Pesquisa: "{search}" <X className="w-2.5 h-2.5" /></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Cargo</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Contrato</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Bruto</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Descontos</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Líquido</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Recibo</th>
          </tr></thead>
          <tbody>{filtered.map(s => {
            const docId = docenteByName.get(s.name.trim().toLowerCase());
            const isDocente = !!docId;
            return (
            <tr
              key={s.id}
              className={cn("border-b last:border-0 hover:bg-muted/20 transition-colors", isDocente && "cursor-pointer")}
              onClick={() => { if (isDocente) navigate(`/financas/docentes/${docId}`); }}
            >
              <td className="p-3 text-xs text-muted-foreground font-mono">{s.employeeId}</td>
              <td className={cn("p-3 text-xs font-medium text-foreground", isDocente && "text-primary hover:underline")}>{s.name}</td>
              <td className="p-3 text-xs text-foreground">{s.role}</td>
              <td className="p-3 text-xs text-muted-foreground">{s.department}</td>
              <td className="p-3"><Badge variant="outline" className="text-[10px]">{contractLabels[s.contractType]}</Badge></td>
              <td className="p-3 text-right text-xs text-foreground">{formatCurrency(s.grossSalary)}</td>
              <td className="p-3 text-right text-xs text-destructive">-{formatCurrency(s.deductions)}</td>
              <td className="p-3 text-right text-xs font-semibold text-foreground">{formatCurrency(s.netSalary)}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[s.status])}>{statusLabels[s.status]}</Badge></td>
              <td className="p-3 text-center">
                {s.status === "pago" ? (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); toast({ title: "Recibo de vencimento", description: `${s.name} — ${s.payDate}` }); }}>
                    <FileText className="w-3 h-3" /> Recibo
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/60">—</span>
                )}
              </td>
            </tr>
            );
          })}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum salário encontrado.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filtered.length} de {salarios.length} funcionários</div>
      </Card>
    </div>
  );
}
