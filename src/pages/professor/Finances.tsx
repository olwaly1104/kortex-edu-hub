import { Wallet, TrendingUp, Calendar, FileText, Download } from "lucide-react";

const salaryHistory = [
  { month: "Janeiro 2025", gross: 450000, net: 382500, date: "31 Jan 2025", status: "paid" as const },
  { month: "Fevereiro 2025", gross: 450000, net: 382500, date: "28 Fev 2025", status: "paid" as const },
  { month: "Março 2025", gross: 450000, net: 382500, date: "31 Mar 2025", status: "pending" as const },
];

const deductions = [
  { label: "IRT (Imposto)", percentage: "10%", amount: 45000 },
  { label: "Segurança Social", percentage: "3%", amount: 13500 },
  { label: "Seguro de Saúde", percentage: "2%", amount: 9000 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " Kz";
}

export default function ProfessorFinances() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão salarial e recibos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Salário Bruto</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(450000)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Salário Líquido</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(382500)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-orange-600" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Próximo Pagamento</p>
          </div>
          <p className="text-xl font-bold text-foreground">31 Mar</p>
        </div>
      </div>

      {/* Deductions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Descontos Mensais</h2>
        <div className="space-y-3">
          {deductions.map((d) => (
            <div key={d.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.percentage}</p>
              </div>
              <p className="text-sm font-medium text-foreground">-{formatCurrency(d.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Salary History */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Histórico Salarial</h2>
        <div className="space-y-3">
          {salaryHistory.map((s) => (
            <div key={s.month} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.month}</p>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(s.net)}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    s.status === "paid" ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                  }`}>
                    {s.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Descarregar recibo">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
