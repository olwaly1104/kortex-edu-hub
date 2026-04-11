import { useState } from "react";
import { Plus, Search, Filter, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, despesas } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  aprovada: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  rejeitada: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = { aprovada: "Aprovada", pendente: "Pendente", rejeitada: "Rejeitada" };

export default function Despesas() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = despesas.filter((d) => {
    if (search && !d.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  const totalMes = despesas.reduce((s, d) => s + d.amount, 0);
  const aprovadas = despesas.filter(d => d.status === "aprovada").reduce((s, d) => s + d.amount, 0);
  const pendentes = despesas.filter(d => d.status === "pendente").reduce((s, d) => s + d.amount, 0);
  const rejeitadas = despesas.filter(d => d.status === "rejeitada").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
          <p className="text-sm text-muted-foreground">Gestão de despesas institucionais</p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nova Despesa
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total do mês", value: formatCurrency(totalMes), color: "text-foreground" },
          { label: "Aprovadas", value: formatCurrency(aprovadas), color: "text-emerald-600" },
          { label: "Pendentes", value: formatCurrency(pendentes), color: "text-amber-600" },
          { label: "Rejeitadas", value: formatCurrency(rejeitadas), color: "text-red-600" },
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
          <Input placeholder="Pesquisar despesas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] h-9"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Data</TableHead>
              <TableHead className="text-[11px]">Descrição</TableHead>
              <TableHead className="text-[11px]">Categoria</TableHead>
              <TableHead className="text-[11px]">Departamento</TableHead>
              <TableHead className="text-[11px]">Valor</TableHead>
              <TableHead className="text-[11px]">Solicitado por</TableHead>
              <TableHead className="text-[11px]">Estado</TableHead>
              <TableHead className="text-[11px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</TableCell>
                <TableCell className="text-xs font-medium">{d.description}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{d.category}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.department}</TableCell>
                <TableCell className="text-xs font-semibold text-red-600">-{formatCurrency(d.amount)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.requestedBy}</TableCell>
                <TableCell><Badge className={`text-[10px] border-0 ${statusColors[d.status]}`}>{statusLabels[d.status]}</Badge></TableCell>
                <TableCell>
                  {d.status === "pendente" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => toast({ title: "Despesa aprovada" })}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => toast({ title: "Despesa rejeitada" })}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Nova Despesa</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {["Descrição", "Categoria", "Departamento", "Valor (Kz)", "Data"].map((f) => (
              <div key={f} className="space-y-1.5">
                <Label className="text-xs">{f}</Label>
                <Input placeholder={f} className="h-9" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">Justificação</Label>
              <Textarea placeholder="Motivo da despesa..." className="min-h-[80px]" />
            </div>
            <Button className="w-full mt-4">Guardar Despesa</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
