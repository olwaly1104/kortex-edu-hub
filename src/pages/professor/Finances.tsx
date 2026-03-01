import { useState } from "react";
import { Wallet, TrendingUp, Calendar, FileText, Download, ChevronDown, ChevronRight, Eye, AlertTriangle, MessageSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const salaryHistory = [
  { month: "Março 2025", gross: 450000, net: 382500, date: "31 Mar 2025", status: "pending" as const },
  { month: "Fevereiro 2025", gross: 450000, net: 382500, date: "28 Fev 2025", status: "paid" as const },
  { month: "Janeiro 2025", gross: 450000, net: 382500, date: "31 Jan 2025", status: "paid" as const },
  { month: "Dezembro 2024", gross: 450000, net: 382500, date: "31 Dez 2024", status: "paid" as const },
  { month: "Novembro 2024", gross: 450000, net: 382500, date: "30 Nov 2024", status: "paid" as const },
  { month: "Outubro 2024", gross: 450000, net: 382500, date: "31 Out 2024", status: "paid" as const },
];

const deductions = [
  { label: "IRT (Imposto)", percentage: "10%", amount: 45000 },
  { label: "Segurança Social", percentage: "3%", amount: 13500 },
  { label: "Seguro de Saúde", percentage: "2%", amount: 9000 },
];

const multas = [
  { id: "m1", date: "15 Fev 2025", reason: "Atraso na entrega de notas", amount: 5000, status: "active" as const },
  { id: "m2", date: "20 Jan 2025", reason: "Falta injustificada", amount: 8000, status: "disputed" as const },
  { id: "m3", date: "05 Dez 2024", reason: "Atraso na entrega de programa", amount: 3000, status: "paid" as const },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " Kz";
}

export default function ProfessorFinances() {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [showMultas, setShowMultas] = useState(false);

  const totalMultasActive = multas.filter(m => m.status === "active").reduce((s, m) => s + m.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-secondary" /> Finanças
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão salarial, recibos e descontos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Salário Bruto</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(450000)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Salário Líquido</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(382500)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Próximo Pagamento</p>
          </div>
          <p className="text-xl font-bold text-foreground">31 Mar</p>
        </div>
      </div>

      {/* Deductions + Multas */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Descontos Mensais</h2>
        </div>
        <div className="divide-y divide-border">
          {deductions.map((d) => (
            <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-foreground font-medium">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.percentage}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">-{formatCurrency(d.amount)}</p>
            </div>
          ))}
          {/* Multas row */}
          <div className="px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground font-medium">Multas</p>
                {totalMultasActive > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                    {multas.filter(m => m.status === "active").length} activa(s)
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-destructive">-{formatCurrency(totalMultasActive)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1.5 rounded-lg"
                  onClick={() => setShowMultas(!showMultas)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showMultas ? "Fechar" : "Ver multas"}
                </Button>
              </div>
            </div>

            {/* Multas panel */}
            {showMultas && (
              <div className="mt-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">As Suas Multas</p>
                </div>
                <div className="divide-y divide-border">
                  {multas.map(m => (
                    <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          m.status === "active" ? "bg-destructive/10" : m.status === "disputed" ? "bg-secondary/10" : "bg-muted"
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            m.status === "active" ? "text-destructive" : m.status === "disputed" ? "text-secondary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.reason}</p>
                          <p className="text-xs text-muted-foreground">{m.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(m.amount)}</p>
                          <Badge className={`text-[10px] border-0 ${
                            m.status === "active" ? "bg-destructive/10 text-destructive" :
                            m.status === "disputed" ? "bg-secondary/10 text-secondary" :
                            "bg-accent/10 text-accent"
                          }`}>
                            {m.status === "active" ? "Activa" : m.status === "disputed" ? "Em disputa" : "Paga"}
                          </Badge>
                        </div>
                        {m.status === "active" && (
                          <Button variant="outline" size="sm" className="text-xs h-7 gap-1 rounded-lg">
                            <MessageSquare className="w-3 h-3" /> Disputar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salary History */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Histórico Salarial</h2>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 rounded-lg">
            <Download className="w-3.5 h-3.5" /> Exportar Tudo
          </Button>
        </div>
        <div className="divide-y divide-border">
          {salaryHistory.map((s) => {
            const isExpanded = expandedMonth === s.month;
            return (
              <div key={s.month}>
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedMonth(isExpanded ? null : s.month)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.month}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(s.net)}</p>
                      <Badge className={`text-[10px] border-0 ${
                        s.status === "paid" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"
                      }`}>
                        {s.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-0">
                    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Bruto</p>
                          <p className="font-semibold text-foreground">{formatCurrency(s.gross)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Líquido</p>
                          <p className="font-semibold text-foreground">{formatCurrency(s.net)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-lg flex-1">
                          <FileText className="w-3.5 h-3.5" /> Recibo de Vencimento
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-lg flex-1">
                          <Download className="w-3.5 h-3.5" /> Comprovativo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
