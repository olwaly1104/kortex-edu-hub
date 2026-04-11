import { Wallet, TrendingUp, TrendingDown, CreditCard, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency, recentTransactions, monthlyData, expenseCategories, alerts } from "@/data/financeModuleData";

const statusColors: Record<string, string> = {
  pago: "bg-emerald-100 text-emerald-700",
  aprovada: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  em_atraso: "bg-red-100 text-red-700",
  rejeitada: "bg-red-100 text-red-700",
  cancelado: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  pago: "Pago",
  aprovada: "Aprovada",
  pendente: "Pendente",
  em_atraso: "Em Atraso",
  rejeitada: "Rejeitada",
  cancelado: "Cancelado",
};

const alertIcons = { warning: AlertTriangle, info: Info, error: AlertCircle };

export default function FinancasDashboard() {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const saldo = currentMonth.receitas - currentMonth.despesas;
  const salariosPagar = 12400000;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-sm text-muted-foreground">Visão geral das finanças institucionais</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Receitas", value: formatCurrency(currentMonth.receitas), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Despesas", value: formatCurrency(currentMonth.despesas), icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Saldo Líquido", value: formatCurrency(saldo), icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { label: "Salários a Pagar", value: formatCurrency(salariosPagar), icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((a) => {
            const Icon = alertIcons[a.type];
            const color = a.type === "error" ? "text-red-600 bg-red-50 border-red-200" : a.type === "warning" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-blue-600 bg-blue-50 border-blue-200";
            return (
              <div key={a.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${color}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{a.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Receitas vs Despesas — Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} className="text-muted-foreground" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="receitas" name="Receitas" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                {expenseCategories.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-foreground">Transações Recentes</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Data</TableHead>
              <TableHead className="text-[11px]">Descrição</TableHead>
              <TableHead className="text-[11px]">Categoria</TableHead>
              <TableHead className="text-[11px]">Valor</TableHead>
              <TableHead className="text-[11px]">Tipo</TableHead>
              <TableHead className="text-[11px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</TableCell>
                <TableCell className="text-xs font-medium">{t.description}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{t.category}</Badge></TableCell>
                <TableCell className={`text-xs font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                  {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${t.type === "receita" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {t.type === "receita" ? "Receita" : "Despesa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] border-0 ${statusColors[t.status]}`}>{statusLabels[t.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
