import { useState, useMemo } from "react";
import {
  Wallet, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, FileText, ChevronRight, Receipt, Search, X,
} from "lucide-react";
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

/* ── derived data ────────────────────────────────── */
const cur = monthlyData[monthlyData.length - 1];
const prev = monthlyData[monthlyData.length - 2];
const receitaVar = Math.round(((cur.receitas - prev.receitas) / prev.receitas) * 100);
const despesaVar = Math.round(((cur.despesas - prev.despesas) / prev.despesas) * 100);
const saldo = cur.receitas - cur.despesas;
const saldoVar = prev.receitas - prev.despesas;
const saldoChange = saldoVar !== 0 ? Math.round(((saldo - saldoVar) / Math.abs(saldoVar)) * 100) : 0;

const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
const salariosPagos = salarios.filter(s => s.status === "pago").length;
const salariosPendentes = salarios.filter(s => s.status !== "pago").length;

/* pie data */
const catMap = new Map<string, number>();
despesas.filter(d => d.status === "aprovada").forEach(d => catMap.set(d.category, (catMap.get(d.category) || 0) + d.amount));
const PIE_COLORS = ["hsl(var(--primary))", "hsl(210, 70%, 55%)", "hsl(25, 90%, 55%)", "hsl(150, 60%, 40%)", "hsl(280, 50%, 55%)", "hsl(var(--muted-foreground))"];
const catData = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
const despesaAprovadas = catData.reduce((s, c) => s + c.value, 0);

/* recent transactions merged */
const recentTx = [
  ...receitas.slice(0, 5).map(r => ({ id: r.id, desc: r.description, date: r.date, amount: r.amount, type: "receita" as const, category: r.category })),
  ...despesas.slice(0, 5).map(d => ({ id: d.id, desc: d.description, date: d.date, amount: d.amount, type: "despesa" as const, category: d.category })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

/* ── component ───────────────────────────────────── */
export default function FinancasDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-sm text-muted-foreground">Abril 2025 — Visão geral das finanças institucionais</p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Receitas do Mês" value={formatCurrency(cur.receitas)} change={receitaVar} icon={TrendingUp} positive />
        <KPICard label="Despesas do Mês" value={formatCurrency(cur.despesas)} change={despesaVar} icon={TrendingDown} positive={false} />
        <KPICard label="Saldo Líquido" value={formatCurrency(saldo)} change={saldoChange} icon={Wallet} positive={saldo > 0} accent />
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
        </Card>
      </div>

      {/* ── Últimas Transações ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Últimas Transações
          </h3>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
                <th className="text-left px-4 py-2.5 font-medium">Categoria</th>
                <th className="text-left px-4 py-2.5 font-medium">Data</th>
                <th className="text-right px-4 py-2.5 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTx.map(t => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", t.type === "receita" ? "bg-accent/10" : "bg-destructive/10")}>
                      {t.type === "receita" ? <TrendingUp className="w-3.5 h-3.5 text-accent" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground">{t.desc}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className={cn("px-4 py-2.5 text-xs font-bold text-right", t.type === "receita" ? "text-accent" : "text-destructive")}>
                    {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Alerts ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { type: "error", msg: "Orçamento de Infraestrutura atingiu 92% do limite", icon: AlertTriangle },
          { type: "warning", msg: `${receitas.filter(r => r.status === "em_atraso").length} pagamentos de propinas em atraso`, icon: Clock },
          { type: "warning", msg: `${despesas.filter(d => d.status === "pendente").length} despesas pendentes de aprovação`, icon: FileText },
        ].map((a, i) => (
          <div key={i} className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs",
            a.type === "error" ? "text-destructive bg-destructive/5 border-destructive/20" : "text-amber-700 bg-amber-50 border-amber-200"
          )}>
            <a.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{a.msg}</span>
          </div>
        ))}
      </div>
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
