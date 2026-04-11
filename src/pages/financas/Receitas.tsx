import { useState } from "react";
import { TrendingUp, Plus, Search, Filter, BarChart3, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { formatCurrency, receitas } from "@/data/financeModuleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  em_atraso: "bg-red-100 text-red-700",
  cancelado: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = { pago: "Pago", pendente: "Pendente", em_atraso: "Em Atraso", cancelado: "Cancelado" };

// Annual revenue estimates by source
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
  Total: y.propinas + y.subsidios + y.taxas + y.outros,
}));

const sourceBreakdown = [
  { source: "Propinas", estimate2025: 510000000, collected: 198500000, pct: 38.9, trend: "up" as const },
  { source: "Subsídios Governamentais", estimate2025: 210000000, collected: 75000000, pct: 35.7, trend: "up" as const },
  { source: "Taxas e Inscrições", estimate2025: 58000000, collected: 28400000, pct: 49.0, trend: "up" as const },
  { source: "Outros (Alugueres, Doações)", estimate2025: 42000000, collected: 12000000, pct: 28.6, trend: "down" as const },
];

export default function Receitas() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2025");

  const filtered = receitas.filter((r) => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const totalMes = receitas.reduce((s, r) => s + r.amount, 0);
  const recebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const pendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
  const emAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);

  const selectedEstimate = annualEstimates.find(y => y.year === selectedYear);
  const totalEstimate = selectedEstimate ? selectedEstimate.propinas + selectedEstimate.subsidios + selectedEstimate.taxas + selectedEstimate.outros : 0;
  const totalCollected = sourceBreakdown.reduce((s, b) => s + b.collected, 0);
  const overallPct = totalEstimate > 0 ? Math.round((totalCollected / totalEstimate) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Receitas</h1>
          <p className="text-sm text-muted-foreground">Gestão de receitas e estimativas anuais</p>
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

      {/* Annual Revenue Estimates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Estimativa de Receita por Ano
          </h2>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {annualEstimates.map(y => (
                <SelectItem key={y.year} value={y.year}>{y.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart */}
          <Card className="lg:col-span-2 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" /> Projecção Anual por Fonte
              </h3>
              <Badge variant="outline" className="text-[10px]">2023–2026</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearlyChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} className="text-muted-foreground" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Propinas" stackId="a" fill="hsl(217, 91%, 40%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Subsídios" stackId="a" fill="hsl(142, 76%, 36%)" />
                <Bar dataKey="Taxas" stackId="a" fill="hsl(25, 95%, 53%)" />
                <Bar dataKey="Outros" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Year Summary */}
          <Card className="p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-foreground mb-3">Resumo {selectedYear}</h3>
            <div className="rounded-lg border bg-muted/30 p-3 mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estimativa Total</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalEstimate)}</p>
              {selectedYear === "2025" && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Cobrado até agora</span>
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
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(selectedEstimate.real)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">vs Estimativa</span>
                  <Badge variant="outline" className={`text-[9px] ${selectedEstimate.real >= totalEstimate ? "text-emerald-600" : "text-red-600"}`}>
                    {selectedEstimate.real >= totalEstimate ? "+" : ""}{((selectedEstimate.real - totalEstimate) / totalEstimate * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Source breakdown for current year */}
        {selectedYear === "2025" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {sourceBreakdown.map(s => (
              <Card key={s.source} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{s.source}</p>
                  {s.trend === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                  )}
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
              <TableHead className="text-[11px]">Pagador</TableHead>
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
                <TableCell className="text-xs text-muted-foreground">{r.payer || "—"}</TableCell>
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
