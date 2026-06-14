import { useState, useMemo } from "react";
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, FileText, ChevronRight, Receipt, Search, X, GraduationCap, Calendar as CalendarIcon,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  formatCurrency, monthlyData, salarios, receitas, despesas,
} from "@/data/financeModuleData";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/* ── month mapping ───────────────────────────────── */
const MONTH_FULL: Record<string, string> = {
  Jan: "Janeiro", Fev: "Fevereiro", Mar: "Março", Abr: "Abril",
  Mai: "Maio", Jun: "Junho", Jul: "Julho", Ago: "Agosto",
  Set: "Setembro", Out: "Outubro", Nov: "Novembro", Dez: "Dezembro",
};

const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
const salariosPagos = salarios.filter(s => s.status === "pago").length;
const salariosPendentes = salarios.filter(s => s.status !== "pago").length;

/* pie data */
const catMap = new Map<string, number>();
despesas.filter(d => d.status === "aprovada").forEach(d => catMap.set(d.category, (catMap.get(d.category) || 0) + d.amount));
const PIE_COLORS = ["hsl(var(--primary))", "hsl(210, 70%, 55%)", "hsl(25, 90%, 55%)", "hsl(150, 60%, 40%)", "hsl(280, 50%, 55%)", "hsl(var(--muted-foreground))"];
const catData = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
const despesaAprovadas = catData.reduce((s, c) => s + c.value, 0);

/* receitas por categoria */
const recMap = new Map<string, number>();
receitas.forEach(r => recMap.set(r.category, (recMap.get(r.category) || 0) + r.amount));
const REC_COLORS = ["hsl(var(--accent))", "hsl(150, 60%, 40%)", "hsl(200, 70%, 50%)", "hsl(45, 85%, 50%)", "hsl(280, 50%, 55%)", "hsl(var(--muted-foreground))"];
const recCatData = Array.from(recMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: REC_COLORS[i % REC_COLORS.length] }));
const receitaTotal = recCatData.reduce((s, c) => s + c.value, 0);
const receitaEsperadaMes = receitas.reduce((s, r) => s + r.amount, 0);

/* all transactions merged */
const allTx = [
  ...receitas.map(r => ({ id: r.id, desc: r.description, date: r.date, amount: r.amount, type: "receita" as const, category: r.category, status: r.status, entity: r.payer || "—" })),
  ...despesas.map(d => ({ id: d.id, desc: d.description, date: d.date, amount: d.amount, type: "despesa" as const, category: d.category, status: d.status, entity: d.requestedBy || "—" })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const txCategories = Array.from(new Set(allTx.map(t => t.category)));

const statusColors: Record<string, string> = {
  aprovada: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  rejeitada: "bg-destructive/15 text-destructive border-destructive/30",
  recebido: "bg-accent/15 text-accent border-accent/30",
  em_atraso: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = {
  aprovada: "Aprovada", pendente: "Pendente", rejeitada: "Rejeitada",
  recebido: "Recebido", em_atraso: "Em Atraso",
};

/* ── component ───────────────────────────────────── */
export default function FinancasDashboard() {
  const [txSearch, setTxSearch] = useState("");
  const [txCategory, setTxCategory] = useState("todos");
  const [txType, setTxType] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyData[monthlyData.length - 1].month);

  const monthIdx = monthlyData.findIndex(m => m.month === selectedMonth);
  const cur = monthlyData[monthIdx] ?? monthlyData[monthlyData.length - 1];
  const prev = monthlyData[Math.max(0, monthIdx - 1)] ?? cur;
  const receitaVar = prev.receitas ? Math.round(((cur.receitas - prev.receitas) / prev.receitas) * 100) : 0;
  const despesaVar = prev.despesas ? Math.round(((cur.despesas - prev.despesas) / prev.despesas) * 100) : 0;
  const saldo = cur.receitas - cur.despesas;
  const saldoVar = prev.receitas - prev.despesas;
  const saldoChange = saldoVar !== 0 ? Math.round(((saldo - saldoVar) / Math.abs(saldoVar)) * 100) : 0;

  const filteredTx = useMemo(() => {
    return allTx
      .filter(t => txCategory === "todos" || t.category === txCategory)
      .filter(t => txType === "todos" || t.type === txType)
      .filter(t => !txSearch || t.desc.toLowerCase().includes(txSearch.toLowerCase()) || t.category.toLowerCase().includes(txSearch.toLowerCase()))
      .slice(0, 15);
  }, [txSearch, txCategory, txType]);

  const hasFilters = txSearch !== "" || txCategory !== "todos" || txType !== "todos";
  const navigate = useNavigate();

  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
  const anoLetivo = "2024 / 2025";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              <span className="flex items-center gap-1 capitalize">
                <CalendarIcon className="w-3.5 h-3.5" />
                {todayLabel}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Ano Letivo {anoLetivo}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mês de referência</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthlyData.map(m => (
                  <SelectItem key={m.month} value={m.month}>{MONTH_FULL[m.month] ?? m.month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Receita Esperada" value={formatCurrency(receitaEsperadaMes)} subtitle="Este Mês" icon={Receipt} accent />
        <KPICard label="Receitas do Mês" value={formatCurrency(cur.receitas)} change={receitaVar} icon={TrendingUp} positive />
        <KPICard label="Despesas do Mês" value={formatCurrency(cur.despesas)} change={despesaVar} icon={TrendingDown} positive={false} />
        <KPICard label="Salários a Processar" value={formatCurrency(totalBruto)} subtitle={`${salariosPagos} pagos · ${salariosPendentes} pendentes`} icon={CreditCard} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Receitas vs Despesas</h3>
              <p className="text-[11px] text-muted-foreground">Últimos 6 meses</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => navigate("/financas/receitas")}>
              Ver detalhes <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} axisLine={false} tickLine={false} className="text-muted-foreground" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="receitas" name="Receitas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Despesas por Categoria</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={28} paddingAngle={2} strokeWidth={0}>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {catData.slice(0, 5).map(c => {
                const pct = despesaAprovadas > 0 ? Math.round((c.value / despesaAprovadas) * 100) : 0;
                return (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[11px] text-muted-foreground flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] font-medium text-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          <h3 className="text-sm font-semibold text-foreground mb-3">Receitas por Categoria</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={recCatData} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={28} paddingAngle={2} strokeWidth={0}>
                  {recCatData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {recCatData.slice(0, 5).map(c => {
                const pct = receitaTotal > 0 ? Math.round((c.value / receitaTotal) * 100) : 0;
                return (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-[11px] text-muted-foreground flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] font-medium text-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Transações ── */}
      <Card className="overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Transações
            </h3>
          </div>
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant={txCategory === "todos" ? "default" : "outline"} onClick={() => setTxCategory("todos")} className="text-xs">Todas</Button>
            {txCategories.map(c => (
              <Button key={c} size="sm" variant={txCategory === c ? "default" : "outline"} onClick={() => setTxCategory(c)} className="text-xs">{c}</Button>
            ))}
          </div>
          {/* Search + type filter */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar transação..." value={txSearch} onChange={e => setTxSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex-1" />
            {hasFilters && (
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1" onClick={() => { setTxSearch(""); setTxCategory("todos"); setTxType("todos"); }}>
                <X className="w-3 h-3" /> Limpar
              </Button>
            )}
            <div className="flex items-center gap-2">
              {[
                { key: "todos", label: "Todos" },
                { key: "receita", label: "Receitas" },
                { key: "despesa", label: "Despesas" },
              ].map(s => (
                <Button key={s.key} size="sm" variant={txType === s.key ? "default" : "outline"} onClick={() => setTxType(s.key)} className="text-xs">{s.label}</Button>
              ))}
            </div>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Documentos</th>
          </tr></thead>
          <tbody>{filteredTx.map(t => (
            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
              <td className="p-3 text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
              <td className="p-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", t.type === "receita" ? "bg-accent/10" : "bg-destructive/10")}>
                  {t.type === "receita" ? <TrendingUp className="w-3.5 h-3.5 text-accent" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                </div>
              </td>
              <td className="p-3 text-xs font-medium text-foreground">{t.desc}</td>
              <td className="p-3 text-xs text-muted-foreground">{(t as any).entity || "—"}</td>
              <td className="p-3"><Badge variant="outline" className="text-[10px]">{t.category}</Badge></td>
              <td className={cn("p-3 text-right text-xs font-semibold", t.type === "receita" ? "text-accent" : "text-destructive")}>
                {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
              </td>
              <td className="p-3 text-center">
                <Badge variant="outline" className={cn("text-[10px]", statusColors[t.status] || "")}>{statusLabels[t.status] || t.status}</Badge>
              </td>
              <td className="p-3 text-center">
                <div className="flex gap-1 justify-center">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary">
                    <FileText className="w-3 h-3" /> Comprovativo
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary">
                    <Receipt className="w-3 h-3" /> Factura
                  </Button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filteredTx.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filteredTx.length} transações</div>
      </Card>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */
function KPICard({ label, value, change, subtitle, icon: Icon, positive, accent }: {
  label: string; value: string; change?: number; subtitle?: string;
  icon: React.ElementType; positive?: boolean; accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", accent ? "text-primary" : "text-foreground")}>{value}</p>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 mt-1 text-[11px] font-medium", change >= 0 ? (positive ? "text-accent" : "text-destructive") : (positive ? "text-destructive" : "text-accent"))}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}% vs mês anterior
        </div>
      )}
      {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  );
}
