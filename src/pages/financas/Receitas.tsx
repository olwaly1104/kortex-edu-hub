import { useState } from "react";
import { TrendingUp, Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { formatCurrency, receitas } from "@/data/financeModuleData";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  em_atraso: "bg-red-100 text-red-700",
  cancelado: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", em_atraso: "Em Atraso", cancelado: "Cancelado" };

export default function Receitas() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = receitas.filter((r) => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const totalMes = receitas.reduce((s, r) => s + r.amount, 0);
  const recebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const pendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
  const emAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Receitas</h1>
          <p className="text-sm text-muted-foreground">Gestão de receitas institucionais</p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nova Receita
        </Button>
      </div>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total do mês", value: formatCurrency(totalMes), color: "text-foreground" },
          { label: "Recebido", value: formatCurrency(recebido), color: "text-emerald-600" },
          { label: "Pendente", value: formatCurrency(pendente), color: "text-amber-600" },
          { label: "Em atraso", value: formatCurrency(emAtraso), color: "text-red-600" },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
            <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar receitas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] h-9"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_atraso">Em Atraso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Data</TableHead>
              <TableHead className="text-[11px]">Descrição</TableHead>
              <TableHead className="text-[11px]">Categoria</TableHead>
              <TableHead className="text-[11px]">Fonte</TableHead>
              <TableHead className="text-[11px]">Valor</TableHead>
              <TableHead className="text-[11px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                <TableCell className="text-xs font-medium">{r.description}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{r.category}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.source}</TableCell>
                <TableCell className="text-xs font-semibold text-emerald-600">+{formatCurrency(r.amount)}</TableCell>
                <TableCell><Badge className={`text-[10px] border-0 ${statusColors[r.status]}`}>{statusLabels[r.status]}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Nova Receita</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {["Descrição", "Categoria", "Fonte", "Valor (Kz)", "Data de vencimento"].map((f) => (
              <div key={f} className="space-y-1.5">
                <Label className="text-xs">{f}</Label>
                <Input placeholder={f} className="h-9" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">Estado</Label>
              <Select><SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-4">Guardar Receita</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
