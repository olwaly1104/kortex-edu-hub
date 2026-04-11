import { useState } from "react";
import { Wallet, TrendingUp, Calendar, FileText, Download, Eye, AlertTriangle, MessageSquare, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const salaryHistory = [
  { month: "Janeiro 2025", gross: 780000, net: 670800, date: "31 Jan 2025", status: "paid" as const },
  { month: "Fevereiro 2025", gross: 780000, net: 670800, date: "28 Fev 2025", status: "paid" as const },
  { month: "Março 2025", gross: 780000, net: 670800, date: "31 Mar 2025", status: "pending" as const },
];

const deductions = [
  { label: "IRT (Imposto)", percentage: "8%", amount: 62400 },
  { label: "Segurança Social", percentage: "3%", amount: 23400 },
  { label: "Seguro de Saúde", percentage: "1%", amount: 7800 },
  { label: "Subsídio de Representação", percentage: "+2%", amount: -15600 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " Kz";
}

export default function PessoalFinancas() {
  const { toast } = useToast();
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">As Minhas Finanças</h1>
        <p className="text-sm text-muted-foreground">Informação salarial pessoal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Salário Bruto", value: formatCurrency(780000), icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { label: "Salário Líquido", value: formatCurrency(670800), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Próximo Pagamento", value: "30 Abr 2025", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className="text-lg font-bold text-foreground">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Descontos Mensais</h3>
        {deductions.map((d) => (
          <div key={d.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">{d.label}</span>
              <Badge variant="outline" className="text-[10px]">{d.percentage}</Badge>
            </div>
            <span className={`text-xs font-semibold ${d.amount > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {d.amount > 0 ? "-" : "+"}{formatCurrency(Math.abs(d.amount))}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Histórico Salarial</h3>
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setHistoricoModalOpen(true)}>
            <Eye className="w-3.5 h-3.5" /> Ver Tudo
          </Button>
        </div>
        {salaryHistory.slice(0, 3).map((s) => (
          <div key={s.month} className="flex items-center justify-between py-1.5 border-b last:border-0">
            <span className="text-xs text-foreground">{s.month}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{formatCurrency(s.net)}</span>
              <Badge className={`text-[10px] border-0 ${s.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {s.status === "paid" ? "Pago" : "Pendente"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={historicoModalOpen} onOpenChange={setHistoricoModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Histórico Salarial Completo</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Mês</TableHead>
                <TableHead className="text-[11px]">Bruto</TableHead>
                <TableHead className="text-[11px]">Líquido</TableHead>
                <TableHead className="text-[11px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.map((s) => (
                <TableRow key={s.month}>
                  <TableCell className="text-xs">{s.month}</TableCell>
                  <TableCell className="text-xs">{formatCurrency(s.gross)}</TableCell>
                  <TableCell className="text-xs font-semibold">{formatCurrency(s.net)}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-0 ${s.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
