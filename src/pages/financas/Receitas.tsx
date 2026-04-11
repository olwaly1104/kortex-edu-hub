import { useState, useMemo } from "react";
import { TrendingUp, Search, Plus, ArrowUpDown, X, Target, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

type SortField = "amount";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  pago: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  em_atraso: "bg-destructive/15 text-destructive border-destructive/30",
  cancelado: "bg-muted text-muted-foreground border-border",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", em_atraso: "Em Atraso", cancelado: "Cancelado" };

// Annual estimates
const annualEstimates = [
  { year: "2023", propinas: 420000000, subsidios: 180000000, taxas: 45000000, outros: 28000000, real: 673000000 },
  { year: "2024", propinas: 468000000, subsidios: 195000000, taxas: 52000000, outros: 35000000, real: 720000000 },
  { year: "2025", propinas: 510000000, subsidios: 210000000, taxas: 58000000, outros: 42000000, real: null },
  { year: "2026", propinas: 555000000, subsidios: 225000000, taxas: 65000000, outros: 48000000, real: null },
];

const yearlyChartData = annualEstimates.map(y => ({
  year: y.year,
  Propinas: y.propinas,
  Subsídios: y.subsidios,
  Taxas: y.taxas,
  Outros: y.outros,
}));

const sourceBreakdown = [
  { source: "Propinas", estimate2025: 510000000, collected: 198500000, pct: 38.9, trend: "up" as const },
  { source: "Subsídios", estimate2025: 210000000, collected: 75000000, pct: 35.7, trend: "up" as const },
  { source: "Taxas", estimate2025: 58000000, collected: 28400000, pct: 49.0, trend: "up" as const },
  { source: "Outros", estimate2025: 42000000, collected: 12000000, pct: 28.6, trend: "down" as const },
];

export default function Receitas() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2025");

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive;

  const filtered = useMemo(() => {
    let list = receitas
      .filter(r => !search || r.description.toLowerCase().includes(search.toLowerCase()))
      .filter(r => filterStatus === "todos" || r.status === filterStatus);
    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount);
    }
    return list;
  }, [search, sortField, sortDir, filterStatus]);

  const totalMes = receitas.reduce((s, r) => s + r.amount, 0);
  const recebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const pendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
  const emAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);

  const selectedEstimate = annualEstimates.find(y => y.year === selectedYear);
  const totalEstimate = selectedEstimate ? selectedEstimate.propinas + selectedEstimate.subsidios + selectedEstimate.taxas + selectedEstimate.outros : 0;
  const totalCollected = sourceBreakdown.reduce((s, b) => s + b.collected, 0);
  const overallPct = totalEstimate > 0 ? Math.round((totalCollected / totalEstimate) * 100) : 0;

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary" /> Receitas</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Nova Receita</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total do Mês", value: formatCurrency(totalMes), color: "text-foreground" },
          { label: "Recebido", value: formatCurrency(recebido), color: "text-accent" },
          { label: "Pendente", value: formatCurrency(pendente), color: "text-amber-600" },
          { label: "Em Atraso", value: formatCurrency(emAtraso), color: "text-destructive" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Annual Estimates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Estimativa de Receita por Ano
          </h2>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {annualEstimates.map(y => <SelectItem key={y.year} value={y.year}>{y.year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary" /> Projecção Anual por Fonte
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearlyChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} className="text-muted-foreground" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Propinas" stackId="a" fill="hsl(217, 91%, 40%)" />
                <Bar dataKey="Subsídios" stackId="a" fill="hsl(142, 76%, 36%)" />
                <Bar dataKey="Taxas" stackId="a" fill="hsl(25, 95%, 53%)" />
                <Bar dataKey="Outros" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground mb-3">Resumo {selectedYear}</h3>
            <div className="rounded-lg border bg-muted/30 p-3 mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estimativa Total</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalEstimate)}</p>
              {selectedYear === "2025" && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Cobrado</span>
                    <span className="font-semibold text-primary">{overallPct}%</span>
                  </div>
                  <Progress value={overallPct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{formatCurrency(totalCollected)} cobrado</p>
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: "Propinas", value: selectedEstimate?.propinas || 0, color: "bg-blue-500" },
                { label: "Subsídios", value: selectedEstimate?.subsidios || 0, color: "bg-emerald-500" },
                { label: "Taxas", value: selectedEstimate?.taxas || 0, color: "bg-orange-500" },
                { label: "Outros", value: selectedEstimate?.outros || 0, color: "bg-gray-400" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`} />
                  <span className="text-[11px] text-muted-foreground flex-1">{s.label}</span>
                  <span className="text-[11px] font-semibold text-foreground">{formatCurrency(s.value)}</span>
                </div>
              ))}
            </div>
            {selectedEstimate?.real && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Realizado</span>
                  <span className="text-xs font-bold text-accent">{formatCurrency(selectedEstimate.real)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {selectedYear === "2025" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {sourceBreakdown.map(s => (
              <Card key={s.source} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.source}</p>
                  {s.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-accent" /> : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />}
                </div>
                <p className="text-sm font-bold text-foreground">{formatCurrency(s.collected)}</p>
                <div className="flex justify-between text-[10px] mt-1.5 mb-1">
                  <span className="text-muted-foreground">de {formatCurrency(s.estimate2025)}</span>
                  <span className="font-semibold text-primary">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-1" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar receita..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
            {isSortActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>Valor: {sortDir === "desc" ? "Maior" : "Menor"} <X className="w-2.5 h-2.5" /></Badge>}
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {statusLabels[filterStatus]} <X className="w-2.5 h-2.5" /></Badge>}
            {isSearchActive && <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>Pesquisa: "{search}" <X className="w-2.5 h-2.5" /></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Pagador</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Fonte</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(r => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
              <td className="p-3 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
              <td className="p-3 text-xs font-medium text-foreground">{r.description}</td>
              <td className="p-3 text-xs text-muted-foreground">{r.payer || "—"}</td>
              <td className="p-3"><Badge variant="outline" className="text-[10px]">{r.category}</Badge></td>
              <td className="p-3 text-xs text-muted-foreground">{r.source}</td>
              <td className="p-3 text-right text-xs font-semibold text-accent">+{formatCurrency(r.amount)}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[r.status])}>{statusLabels[r.status]}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</p>}
      </Card>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Nova Receita</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {["Descrição", "Categoria", "Fonte", "Pagador", "Valor (Kz)", "Data de vencimento"].map(f => (
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
