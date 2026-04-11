import { useState, useMemo } from "react";
import { TrendingUp, Search, Plus, ArrowUpDown, X, Wallet, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, receitas } from "@/data/financeModuleData";
import { cn } from "@/lib/utils";

type SortField = "amount";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  pago: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  em_atraso: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", em_atraso: "Em Atraso" };

const estimativaAnual = 52000000;

export default function Receitas() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sheetOpen, setSheetOpen] = useState(false);

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isCatActive = filterCategory !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive || isCatActive;

  const categories = [...new Set(receitas.map(r => r.category))];

  const filtered = useMemo(() => {
    let list = receitas
      .filter(r => !search || r.description.toLowerCase().includes(search.toLowerCase()) || (r.payer || "").toLowerCase().includes(search.toLowerCase()) || (r.studentId || "").toLowerCase().includes(search.toLowerCase()))
      .filter(r => filterStatus === "todos" || r.status === filterStatus)
      .filter(r => filterCategory === "todos" || r.category === filterCategory);
    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount);
    }
    return list;
  }, [search, sortField, sortDir, filterStatus, filterCategory]);

  const totalMes = receitas.reduce((s, r) => s + r.amount, 0);
  const recebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const pendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
  const emAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);
  const cobradoPct = Math.round((recebido / estimativaAnual) * 100);

  const resetAll = () => { setFilterStatus("todos"); setFilterCategory("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary" /> Receitas</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Nova Receita</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total do Mês", value: formatCurrency(totalMes), icon: TrendingUp, color: "text-foreground" },
          { label: "Recebido", value: formatCurrency(recebido), icon: Wallet, color: "text-accent" },
          { label: "Pendente", value: formatCurrency(pendente), icon: Clock, color: "text-amber-600" },
          { label: "Em Atraso", value: formatCurrency(emAtraso), icon: AlertTriangle, color: "text-destructive" },
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

      {/* Estimativa Anual */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimativa Anual 2025</span>
          <span className="text-xs font-semibold text-primary">{cobradoPct}% cobrado</span>
        </div>
        <Progress value={Math.min(cobradoPct, 100)} className="h-2 mb-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Cobrado: {formatCurrency(recebido)}</span>
          <span>Pendente + Atraso: {formatCurrency(pendente + emAtraso)}</span>
          <span>Estimativa: {formatCurrency(estimativaAnual)}</span>
        </div>
      </Card>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por estudante, ID ou descrição..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
              { key: "em_atraso", label: "Em Atraso" },
            ].map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">{s.label}</Button>
            ))}
            <div className="w-px h-6 bg-border" />
            {[{ key: "todos", label: "Categoria" }, ...categories.map(c => ({ key: c, label: c }))].map(s => (
              <Button key={s.key} size="sm" variant={filterCategory === s.key ? "default" : "outline"} onClick={() => setFilterCategory(s.key)} className="text-xs">{s.label}</Button>
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
                <button onClick={() => setSortField("amount")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "amount" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Valor</button>
                <div className="border-t border-border my-1" />
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {statusLabels[filterStatus]} <X className="w-2.5 h-2.5" /></Badge>}
            {isCatActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterCategory("todos")}>Categoria: {filterCategory} <X className="w-2.5 h-2.5" /></Badge>}
            {isSortActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>Valor: {sortDir === "desc" ? "Maior" : "Menor"} <X className="w-2.5 h-2.5" /></Badge>}
            {isSearchActive && <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>Pesquisa: "{search}" <X className="w-2.5 h-2.5" /></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(r => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
              <td className="p-3 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
              <td className="p-3">
                <p className="text-xs font-medium text-foreground">{r.payer || "—"}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{r.studentId || "—"}</p>
              </td>
              <td className="p-3 text-xs text-foreground">{r.description}</td>
              <td className="p-3 text-xs text-muted-foreground">{r.course || "—"}</td>
              <td className="p-3"><Badge variant="outline" className="text-[10px]">{r.category}</Badge></td>
              <td className="p-3 text-right text-xs font-semibold text-accent">+{formatCurrency(r.amount)}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[r.status])}>{statusLabels[r.status] || r.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filtered.length} de {receitas.length} transacções</div>
      </Card>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Nova Receita</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {["Nome do Estudante", "ID do Estudante", "Curso", "Descrição", "Categoria", "Valor (Kz)", "Data"].map(f => (
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
