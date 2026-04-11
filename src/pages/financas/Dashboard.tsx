import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, TrendingDown, CreditCard, Users, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, Check, X, Ban, FileText, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  formatCurrency, monthlyData, salarios, receitas, despesas, orcamentos, payrollBudget,
} from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ── derived data ────────────────────────────────── */
const cur = monthlyData[monthlyData.length - 1];
const prev = monthlyData[monthlyData.length - 2];
const receitaVar = Math.round(((cur.receitas - prev.receitas) / prev.receitas) * 100);
const despesaVar = Math.round(((cur.despesas - prev.despesas) / prev.despesas) * 100);
const saldo = cur.receitas - cur.despesas;
const saldoVar = prev.receitas - prev.despesas;
const saldoChange = saldoVar !== 0 ? Math.round(((saldo - saldoVar) / Math.abs(saldoVar)) * 100) : 0;

/* salários */
const totalBruto = salarios.reduce((s, v) => s + v.grossSalary, 0);
const salariosPagos = salarios.filter(s => s.status === "pago").length;
const salariosPendentes = salarios.filter(s => s.status !== "pago").length;
const budgetPct = Math.round((totalBruto / payrollBudget.totalBudget) * 100);

/* receitas */
const receitaRecebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
const receitaPendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
const receitaAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);

/* despesas */
const despesaPendentes = despesas.filter(d => d.status === "pendente");
const despesaAprovadas = despesas.filter(d => d.status === "aprovada").reduce((s, d) => s + d.amount, 0);

/* pie data */
const catData = useMemo_despesas();
function useMemo_despesas() {
  const map = new Map<string, number>();
  despesas.filter(d => d.status === "aprovada").forEach(d => map.set(d.category, (map.get(d.category) || 0) + d.amount));
  const colors = ["hsl(var(--primary))", "hsl(210, 70%, 55%)", "hsl(25, 90%, 55%)", "hsl(150, 60%, 40%)", "hsl(280, 50%, 55%)", "hsl(var(--muted-foreground))"];
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
}

/* trend sparkline from monthlyData */
const trendData = monthlyData.map(m => ({ name: m.month, saldo: m.receitas - m.despesas }));

/* ── component ───────────────────────────────────── */
export default function FinancasDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-sm text-muted-foreground">Abril 2025 — Visão geral das finanças institucionais</p>
      </div>

      {/* ── ROW 1: Primary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Receitas do Mês" value={formatCurrency(cur.receitas)} change={receitaVar} icon={TrendingUp} positive />
        <KPICard label="Despesas do Mês" value={formatCurrency(cur.despesas)} change={despesaVar} icon={TrendingDown} positive={false} />
        <KPICard label="Saldo Líquido" value={formatCurrency(saldo)} change={saldoChange} icon={Wallet} positive={saldo > 0} accent />
        <KPICard label="Salários a Processar" value={formatCurrency(totalBruto)} subtitle={`${salariosPagos} pagos · ${salariosPendentes} pendentes`} icon={CreditCard} />
      </div>

      {/* ── ROW 2: Charts ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Bar chart — 3 cols */}
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

        {/* Right column — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Saldo trend */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Evolução do Saldo</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Tendência mensal</p>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" fill="url(#saldoGrad)" strokeWidth={2} dot={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Despesas by category pie */}
          <Card className="p-5">
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
                  const pct = Math.round((c.value / despesaAprovadas) * 100);
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
      </div>

      {/* ── ROW 3: Operational panels ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Cobranças */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Cobranças</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => navigate("/financas/receitas")}>
              Ver todas <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-3">
            <MiniStat label="Recebido" value={formatCurrency(receitaRecebido)} color="text-accent" icon={Check} />
            <MiniStat label="Pendente" value={formatCurrency(receitaPendente)} color="text-amber-600" icon={Clock} />
            <MiniStat label="Em Atraso" value={formatCurrency(receitaAtraso)} color="text-destructive" icon={AlertTriangle} />
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Taxa de cobrança</span>
                <span className="font-medium text-foreground">{Math.round((receitaRecebido / (receitaRecebido + receitaPendente + receitaAtraso)) * 100)}%</span>
              </div>
              <Progress value={Math.round((receitaRecebido / (receitaRecebido + receitaPendente + receitaAtraso)) * 100)} className="h-1.5" />
            </div>
          </div>
        </Card>

        {/* Despesas pendentes de aprovação */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Aprovações Pendentes</h3>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">{despesaPendentes.length}</Badge>
          </div>
          <div className="space-y-2.5">
            {despesaPendentes.slice(0, 4).map(d => (
              <div key={d.id} className="flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{d.description}</p>
                  <p className="text-[10px] text-muted-foreground">{d.department} · {d.requestedBy}</p>
                </div>
                <span className="text-xs font-semibold text-foreground shrink-0">{formatCurrency(d.amount)}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-accent hover:bg-accent/10" onClick={() => toast({ title: "Aprovada" })}><Check className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => toast({ title: "Rejeitada" })}><X className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            {despesaPendentes.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sem aprovações pendentes</p>}
          </div>
          {despesaPendentes.length > 4 && (
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground" onClick={() => navigate("/financas/despesas")}>
              Ver mais {despesaPendentes.length - 4} pendentes
            </Button>
          )}
        </Card>

        {/* Orçamentos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Orçamentos</h3>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => navigate("/financas/orcamentos")}>
              Ver todos <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {orcamentos.slice(0, 4).map(o => {
              const pct = Math.round((o.spent / o.totalBudget) * 100);
              const isHigh = pct >= 90;
              return (
                <div key={o.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-medium text-foreground truncate flex-1 mr-2">{o.name.replace("Orçamento Geral — ", "")}</span>
                    <span className={cn("text-[11px] font-semibold", isHigh ? "text-destructive" : "text-foreground")}>{pct}%</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} className={cn("h-1.5", isHigh && "[&>div]:bg-destructive")} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── ROW 4: Payroll summary + Recent transactions ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Payroll */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Folha Salarial</h3>
              <p className="text-[11px] text-muted-foreground">{payrollBudget.currentMonth} · {salarios.length} funcionários</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" onClick={() => navigate("/financas/salarios")}>
              Gerir <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bruto Total</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(totalBruto)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Líquido Total</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(salarios.reduce((s, v) => s + v.netSalary, 0))}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Descontos</p>
              <p className="text-sm font-bold text-destructive">{formatCurrency(salarios.reduce((s, v) => s + v.deductions, 0))}</p>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Orçamento salarial</span>
            <span className="font-medium text-foreground">{budgetPct}% utilizado</span>
          </div>
          <Progress value={Math.min(budgetPct, 100)} className="h-1.5" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Utilizado: {formatCurrency(totalBruto)}</span>
            <span>Disponível: {formatCurrency(Math.max(0, payrollBudget.totalBudget - totalBruto))}</span>
          </div>
        </Card>

        {/* Recent transactions */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Últimas Transações</h3>
          </div>
          <div className="space-y-2">
            {[...receitas.slice(0, 3).map(r => ({ ...r, _type: "receita" as const })), ...despesas.slice(0, 3).map(d => ({ ...d, _type: "despesa" as const }))]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 6)
              .map(t => (
                <div key={t.id} className="flex items-center gap-3 py-1.5">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", t._type === "receita" ? "bg-accent/10" : "bg-destructive/10")}>
                    {t._type === "receita" ? <ArrowDownRight className="w-3.5 h-3.5 text-accent" /> : <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })} · {t.category}</p>
                  </div>
                  <span className={cn("text-xs font-semibold shrink-0", t._type === "receita" ? "text-accent" : "text-destructive")}>
                    {t._type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 5: Alerts ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { type: "error", msg: "Orçamento de Infraestrutura atingiu 92% do limite", icon: AlertTriangle },
          { type: "warning", msg: `${receitas.filter(r => r.status === "em_atraso").length} pagamentos de propinas em atraso`, icon: Clock },
          { type: "warning", msg: `${despesaPendentes.length} despesas pendentes de aprovação`, icon: FileText },
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

function MiniStat({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-sm font-semibold", color)}>{value}</p>
    </div>
  );
}
