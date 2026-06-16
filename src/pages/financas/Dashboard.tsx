import { FinHeader } from "./_FinHeader";
import { BarChart3, TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle } from "lucide-react";

const fmt = (n: number) => `${n.toLocaleString("pt-PT")} Kz`;

export default function FinancasDashboard() {
  const kpis = [
    { label: "Receitas (mês)", value: fmt(0), icon: TrendingUp, tone: "text-emerald-600" },
    { label: "Despesas (mês)", value: fmt(0), icon: TrendingDown, tone: "text-red-600" },
    { label: "Saldo", value: fmt(0), icon: Wallet, tone: "text-primary" },
    { label: "Por regularizar", value: fmt(0), icon: AlertCircle, tone: "text-amber-600" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Dashboard" subtitle="Visão geral financeira da instituição" icon={<BarChart3 className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const I = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <I className={`w-4 h-4 ${k.tone}`} />
              </div>
              <p className="text-2xl font-bold tabular-nums">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Últimas Transações</h2>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">0 registos</span>
          </header>
          <div className="rounded-md border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            <Receipt className="w-6 h-6 mx-auto mb-2 opacity-60" />
            Sem transações registadas.
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Solicitações Pendentes</h2>
            <span className="text-xs font-semibold text-primary tabular-nums">0</span>
          </header>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Sem pedidos pendentes.
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-3">Orçamento por Categoria</h2>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Ainda sem orçamentos configurados.
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-3">Salários (este mês)</h2>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Sem folha de salários processada.
          </div>
        </section>
      </div>
    </div>
  );
}
