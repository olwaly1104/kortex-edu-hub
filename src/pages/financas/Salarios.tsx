import { useState } from "react";
import { Users, Search, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, salarios } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  processando: "bg-blue-100 text-blue-700",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", processando: "Processando" };

export default function Salarios() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  const departments = [...new Set(salarios.map(s => s.department))];

  const filtered = salarios.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterDept !== "all" && s.department !== filterDept) return false;
    return true;
  });

  const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
  const totalLiquido = salarios.reduce((s, v) => s + v.netSalary, 0);
  const pagos = salarios.filter(s => s.status === "pago").length;
  const pendentes = salarios.filter(s => s.status !== "pago").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Salários</h1>
          <p className="text-sm text-muted-foreground">Gestão da folha salarial</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Relatório exportado" })}>
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Bruto", value: formatCurrency(totalBruto), color: "text-foreground" },
          { label: "Total Líquido", value: formatCurrency(totalLiquido), color: "text-primary" },
          { label: "Pagos", value: `${pagos}`, color: "text-emerald-600" },
          { label: "Pendentes", value: `${pendentes}`, color: "text-amber-600" },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
            <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar colaborador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] h-9"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Nome</TableHead>
              <TableHead className="text-[11px]">Cargo</TableHead>
              <TableHead className="text-[11px]">Departamento</TableHead>
              <TableHead className="text-[11px]">Salário Bruto</TableHead>
              <TableHead className="text-[11px]">Salário Líquido</TableHead>
              <TableHead className="text-[11px]">Data Pagamento</TableHead>
              <TableHead className="text-[11px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-xs font-medium">{s.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.role}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{s.department}</Badge></TableCell>
                <TableCell className="text-xs font-medium">{formatCurrency(s.grossSalary)}</TableCell>
                <TableCell className="text-xs font-semibold text-primary">{formatCurrency(s.netSalary)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(s.payDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                <TableCell><Badge className={`text-[10px] border-0 ${statusColors[s.status]}`}>{statusLabels[s.status]}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
