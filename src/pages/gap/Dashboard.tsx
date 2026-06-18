import { FinHeader } from "@/pages/financas/_FinHeader";
import { BarChart3, Inbox, CalendarDays, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default function GapDashboard() {
  const kpis = [
    { label: "Solicitações Hoje", value: 0, icon: Inbox },
    { label: "Agendamentos Hoje", value: 0, icon: CalendarDays },
    { label: "Solicitações Pendentes", value: 0, icon: Clock },
    { label: "Estado", value: "Normal", icon: ShieldCheck, isStatus: true },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Dashboard GAP" subtitle="Indicadores de apoio ao discente" icon={<BarChart3 className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const I = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <I className="w-4 h-4 text-muted-foreground" />
              </div>
              {k.isStatus ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {k.value}
                </div>
              ) : (
                <p className="text-2xl font-bold tabular-nums">{k.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Agendamentos</h2>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">0 itens</span>
          </header>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Sem agendamentos.
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Em Atraso</h2>
            <span className="text-xs font-semibold text-primary tabular-nums">0</span>
          </header>
          <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Sem solicitações em atraso.
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Candidaturas Recentes</h2>
          <span className="text-xs font-semibold text-primary tabular-nums">0</span>
        </header>
        <div className="rounded-md border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-60" />
          Sem candidaturas submetidas.
        </div>
      </section>
    </div>
  );
}
