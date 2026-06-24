import { useState } from "react";
import { Wallet, TrendingUp, Calendar, FileText, Download, Eye, AlertTriangle, MessageSquare, ChevronRight } from "lucide-react";
import { TabelaInfracoesButton } from "@/components/shared/TabelaInfracoesButton";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const salaryHistory = [
  { month: "Janeiro 2025", gross: 480000, net: 412800, date: "31 Jan 2025", status: "paid" as const },
  { month: "Fevereiro 2025", gross: 480000, net: 412800, date: "28 Fev 2025", status: "paid" as const },
  { month: "Março 2025", gross: 480000, net: 412800, date: "31 Mar 2025", status: "pending" as const },
  { month: "Abril 2025", gross: 480000, net: 412800, date: "30 Abr 2025", status: "pending" as const },
  { month: "Maio 2025", gross: 480000, net: 412800, date: "31 Mai 2025", status: "pending" as const },
  { month: "Junho 2025", gross: 480000, net: 412800, date: "30 Jun 2025", status: "pending" as const },
  { month: "Julho 2025", gross: 480000, net: 412800, date: "31 Jul 2025", status: "pending" as const },
  { month: "Agosto 2025", gross: 480000, net: 412800, date: "31 Ago 2025", status: "pending" as const },
  { month: "Setembro 2025", gross: 480000, net: 412800, date: "30 Set 2025", status: "pending" as const },
  { month: "Outubro 2025", gross: 480000, net: 412800, date: "31 Out 2025", status: "pending" as const },
  { month: "Novembro 2025", gross: 480000, net: 412800, date: "30 Nov 2025", status: "pending" as const },
  { month: "Dezembro 2025", gross: 480000, net: 412800, date: "31 Dez 2025", status: "pending" as const },
];

const deductions = [
  { label: "IRT (Imposto)", percentage: "8%", amount: 38400 },
  { label: "Segurança Social", percentage: "3%", amount: 14400 },
  { label: "Seguro de Saúde", percentage: "1%", amount: 4800 },
];

const multas = [
  { id: "m1", date: "10 Fev 2025", reason: "Atraso na entrega de relatório semestral", amount: 8000, status: "aplicada" as const, details: "Relatório de actividade da faculdade entregue com 5 dias de atraso." },
  { id: "m2", date: "18 Jan 2025", reason: "Falta à reunião do Conselho Científico", amount: 12000, status: "pendente" as const, details: "Ausência na reunião ordinária do Conselho Científico de 18/01/2025." },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " Kz";
}

export default function DecanoFinancas() {
  const { toast } = useToast();
  const [multasModalOpen, setMultasModalOpen] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState<typeof multas[0] | null>(null);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<typeof salaryHistory[0] | null>(null);

  const totalMultasAplicadas = multas.filter(m => m.status === "aplicada").reduce((s, m) => s + m.amount, 0);
  const aplicadaCount = multas.filter(m => m.status === "aplicada").length;
  const pendenteCount = multas.filter(m => m.status === "pendente").length;

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
          <p className="text-xl font-bold text-foreground">{formatCurrency(480000)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Salário Líquido</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(412800)}</p>
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
              <p className={`text-sm font-semibold ${d.amount > 0 ? "text-foreground" : "text-accent"}`}>
                {d.amount > 0 ? "-" : "+"}{formatCurrency(Math.abs(d.amount))}
              </p>
            </div>
          ))}
          <div className="px-5 py-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground font-medium">Multas</p>
                <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">{aplicadaCount} aplicada(s)</Badge>
                {pendenteCount > 0 && <Badge className="bg-secondary/10 text-secondary border-0 text-[10px]">{pendenteCount} pendente(s)</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-destructive">-{formatCurrency(totalMultasAplicadas)}</p>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 rounded-lg" onClick={() => setMultasModalOpen(true)}>
                  <Eye className="w-3.5 h-3.5" /> Ver Multas
                </Button>
              </div>
            </div>
            <TabelaInfracoesButton />

          </div>
        </div>
      </div>

      {/* Histórico Salarial */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Histórico Salarial</h2>
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-lg" onClick={() => setHistoricoModalOpen(true)}>
            <Eye className="w-3.5 h-3.5" /> Ver Todos
          </Button>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{salaryHistory[2].month}</p>
                <p className="text-xs text-muted-foreground">{salaryHistory[2].date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-foreground">{formatCurrency(salaryHistory[2].net)}</p>
              <Badge className="bg-secondary/10 text-secondary border-0 text-[10px]">Pendente</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Multas Modal */}
      <Dialog open={multasModalOpen} onOpenChange={setMultasModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Tabela de Multas
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 rounded-lg">
                  <Eye className="w-3.5 h-3.5" /> Ver
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 rounded-lg"
                  onClick={() => toast({ title: "Link copiado", description: "Link da tabela de multas copiado." })}>
                  <Download className="w-3.5 h-3.5" /> Partilhar
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedMulta ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setSelectedMulta(null)}>← Voltar</Button>
              <div className="rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`text-[10px] border-0 ${selectedMulta.status === "aplicada" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                    {selectedMulta.status === "aplicada" ? "Aplicada" : "Pendente"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{selectedMulta.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedMulta.reason}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selectedMulta.details}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Valor da multa</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(selectedMulta.amount)}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs"
                  onClick={() => { toast({ title: "Disputa submetida", description: "A sua disputa foi registada e será analisada." }); setSelectedMulta(null); }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Disputar
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Motivo</TableHead>
                  <TableHead className="text-xs text-right">Valor</TableHead>
                  <TableHead className="text-xs text-center">Estado</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {multas.map(m => (
                  <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMulta(m)}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{m.date}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{m.reason}</TableCell>
                    <TableCell className="text-xs font-semibold text-foreground text-right whitespace-nowrap">{formatCurrency(m.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`text-[10px] border-0 ${m.status === "aplicada" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                        {m.status === "aplicada" ? "Aplicada" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Histórico Modal */}
      <Dialog open={historicoModalOpen} onOpenChange={setHistoricoModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Histórico Salarial</DialogTitle>
          </DialogHeader>
          {selectedMonth ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setSelectedMonth(null)}>← Voltar</Button>
              <div className="rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-semibold text-foreground">{selectedMonth.month}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Bruto</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedMonth.gross)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Líquido</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedMonth.net)}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] border-0 ${selectedMonth.status === "paid" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                  {selectedMonth.status === "paid" ? "Pago" : "Pendente"}
                </Badge>
                {selectedMonth.status === "paid" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 rounded-lg flex-1"
                      onClick={() => toast({ title: "PDF gerado", description: "Recibo de vencimento a descarregar..." })}>
                      <FileText className="w-3.5 h-3.5" /> Recibo de Vencimento
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 rounded-lg flex-1"
                      onClick={() => toast({ title: "PDF gerado", description: "Comprovativo a descarregar..." })}>
                      <Download className="w-3.5 h-3.5" /> Comprovativo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {salaryHistory.map((s) => (
                <div key={s.month} className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
                  onClick={() => setSelectedMonth(s)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.status === "paid" ? "bg-accent/10" : "bg-muted"}`}>
                      <FileText className={`w-4 h-4 ${s.status === "paid" ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.month}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(s.net)}</p>
                    <Badge className={`text-[10px] border-0 ${s.status === "paid" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                      {s.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
