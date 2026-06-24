import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet, CalendarClock, TrendingUp, AlertTriangle, Info, CreditCard,
  Download, FileBarChart, Bell, Headphones, Eye, FileText, Share2,
  ChevronUp, ChevronDown, ArrowUpDown, Filter, GraduationCap, Receipt,
  ShieldCheck, BookOpen, MoreHorizontal, Building2, HandCoins, Scale,
} from "lucide-react";
import { TabelaInfracoesButton } from "@/components/shared/TabelaInfracoesButton";

import { cn } from "@/lib/utils";
import {
  payments as allPayments, tuitionPayments, annualBreakdown, totalAnnual,
  formatCurrency, formatDatePT, type Payment,
} from "@/data/financeData";

const statusConfig: Record<Payment['status'], { label: string; className: string }> = {
  paid:     { label: 'PAGO',      className: 'bg-finance-paid text-white' },
  pending:  { label: 'PENDENTE',  className: 'bg-finance-pending text-white' },
  overdue:  { label: 'EM ATRASO', className: 'bg-finance-overdue text-white' },
  upcoming: { label: 'PRÓXIMO',   className: 'bg-muted text-muted-foreground' },
};

const categoryConfig: Record<string, { label: string; icon: typeof GraduationCap; className: string }> = {
  tuition:    { label: 'Propina',      icon: GraduationCap, className: 'text-finance-info bg-finance-info/10' },
  emoluments: { label: 'Emolumentos',  icon: FileText,      className: 'text-finance-pending bg-finance-pending/10' },
};

const getCategoryKey = (category: Payment['category']) => category === 'tuition' ? 'tuition' : 'emoluments';

type SortKey = 'dueDate' | 'amount' | 'status';

export default function Finances() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docPayment, setDocPayment] = useState<Payment | null>(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('pay') === 'true') {
      setSelectModalOpen(true);
    }
  }, [searchParams]);
  const [planoPropinasOpen, setPlanoPropinasOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'tuition' | 'emoluments' | 'events' | 'clubs'>('all');

  const paidAmount = useMemo(() => allPayments.filter(p => p.status === 'paid' && p.category === 'tuition').reduce((s, p) => s + p.amount, 0), []);
  const nextPayment = useMemo(() => allPayments.find(p => p.status === 'upcoming' && p.category === 'tuition'), []);
  const overduePayments = useMemo(() => allPayments.filter(p => p.status === 'overdue'), []);
  const pendingPayments = useMemo(() => allPayments.filter(p => p.status === 'pending'), []);
  const incompletePayments = useMemo(() => allPayments.filter(p => p.status === 'overdue' || p.status === 'pending'), []);
  const overdueTuition = useMemo(() => overduePayments.filter(p => p.category === 'tuition'), [overduePayments]);

  // Multa calculation: 100 Kz per day late per overdue payment
  const overdueWithMulta = useMemo(() => overduePayments.map(p => {
    const daysLate = Math.max(0, Math.ceil((Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const multa = daysLate * 100;
    return { ...p, daysLate, multa, totalDue: p.amount + multa };
  }), [overduePayments]);

  // Saldo atual = total a pagar da propina atrasada (principal + multa)
  const overdueTuitionTotal = useMemo(() => overdueWithMulta
    .filter(p => p.category === 'tuition')
    .reduce((s, p) => s + p.totalDue, 0), [overdueWithMulta]);

  // Conta corrente = overdue totals (with multa) + pending amounts
  const contaCorrenteTotal = useMemo(() =>
    overdueWithMulta.reduce((s, p) => s + p.totalDue, 0) +
    pendingPayments.reduce((s, p) => s + p.amount, 0),
  [overdueWithMulta, pendingPayments]);

  const completionPct = Math.round((paidAmount / totalAnnual) * 100);

  const daysUntilNext = useMemo(() => {
    if (!nextPayment) return 0;
    const diff = nextPayment.dueDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [nextPayment]);

  const sortedPayments = useMemo(() => {
    let list = allPayments.filter(p => p.status === 'paid');
    if (categoryFilter === 'tuition') list = list.filter(p => p.category === 'tuition');
    else if (categoryFilter === 'emoluments') list = list.filter(p => p.category !== 'tuition');
    list.sort((a, b) => {
      if (sortKey === 'dueDate') return sortAsc ? a.dueDate.getTime() - b.dueDate.getTime() : b.dueDate.getTime() - a.dueDate.getTime();
      if (sortKey === 'amount') return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    });
    return list;
  }, [sortKey, sortAsc, categoryFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
    return sortAsc ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />;
  };

  const handlePay = (p: Payment) => { setSelectedPayment(p); setPayModalOpen(true); };
  const confirmPay = () => { setPayModalOpen(false); toast({ title: "Pagamento iniciado", description: `Processando ${selectedPayment?.description}...` }); };
  const handleDoc = (p: Payment) => { setDocPayment(p); setDocModalOpen(true); };
  const handleExport = () => toast({ title: "Exportação iniciada", description: "O relatório será descarregado em breve." });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
          <p className="text-sm text-muted-foreground">Ano letivo 2024/2025</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 self-start">
          <Download className="w-4 h-4" /> Exportar Relatório
        </Button>
      </div>

      {/* Alerts */}
      {incompletePayments.length > 0 && (
        <div className="rounded-xl border border-finance-overdue/30 bg-finance-overdue/5 p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-finance-overdue/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-finance-overdue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Conta Corrente</p>
                <p className="text-xs text-muted-foreground">
                  Tem {incompletePayments.length} pagamentos incompletos totalizando{' '}
                  <span className="font-semibold text-finance-overdue">{formatCurrency(contaCorrenteTotal)}</span>
                </p>
              </div>
            </div>
            <Button size="sm" className="gap-1.5 bg-finance-overdue hover:bg-finance-overdue/90 text-white shrink-0" onClick={() => setSelectModalOpen(true)}>
              <CreditCard className="w-3.5 h-3.5" /> Pagar
            </Button>
          </div>
        </div>
      )}

      {nextPayment && nextPayment.status === 'pending' && (
        <div className="flex items-center gap-3 rounded-lg border border-finance-info/30 bg-finance-info/5 p-4">
          <Info className="w-5 h-5 text-finance-info shrink-0" />
          <p className="text-sm text-foreground">
            Próximo pagamento: <span className="font-semibold">{nextPayment.description}</span> —{' '}
            {formatCurrency(nextPayment.amount)} em {daysUntilNext} dias.
          </p>
        </div>
      )}

      {/* Unified Summary Card */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4.5 h-4.5 text-primary" /> Gestão de Propina
            </CardTitle>
            <Badge variant="outline" className="text-xs font-medium">Ano Letivo 2024/2025</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {/* Top row — 3 metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Saldo Atual</p>
              </div>
              <p className={cn("text-xl font-bold", overdueTuition.length > 0 ? "text-finance-overdue" : "text-finance-paid")}>
                {formatCurrency(overdueTuition.length > 0 ? -overdueTuitionTotal : 0)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {overdueTuition.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-finance-overdue border border-finance-overdue/30 bg-finance-overdue/5 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-finance-overdue" />
                    {overdueTuition.length} mês em atraso
                  </span>
                )}
                {pendingPayments.filter(p => p.category === 'tuition').length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-finance-pending border border-finance-pending/30 bg-finance-pending/5 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-finance-pending" />
                    {pendingPayments.filter(p => p.category === 'tuition').length} mês pendente
                  </span>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:pl-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Próxima Mensalidade</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(250000)}</p>
              <div className="flex items-center gap-2 mt-1">
                {nextPayment && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground border border-border bg-muted/50 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    {formatDatePT(nextPayment.dueDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:pl-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Propina Anual Total <span className="normal-case font-normal">(10 Meses)</span></p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(totalAnnual)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-finance-paid border border-finance-paid/30 bg-finance-paid/5 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-finance-paid" />
                  {formatCurrency(paidAmount)} pago
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground border border-border bg-muted/50 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {formatCurrency(totalAnnual - paidAmount)} restante
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Tuition Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                <p className="text-sm font-semibold text-foreground">Progresso de Propina</p>
              </div>
              <p className="text-xs text-muted-foreground">{tuitionPayments.filter(p => p.status === 'paid').length}/{tuitionPayments.length} pagas</p>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {tuitionPayments.map((p) => {
                const bg =
                  p.status === 'paid' ? 'bg-finance-paid' :
                  p.status === 'overdue' ? 'bg-finance-overdue' :
                  p.status === 'pending' ? 'bg-finance-pending' :
                  'bg-muted';
                return (
                  <button key={p.id} className="flex flex-col items-center gap-1 group/month" onClick={() => p.status === 'paid' ? handleDoc(p) : handlePay(p)}>
                    <div className={cn("w-full h-8 rounded-md transition-all cursor-pointer ring-offset-background group-hover/month:ring-2 group-hover/month:ring-ring group-hover/month:ring-offset-1", bg)} title={`${p.month} — ${statusConfig[p.status].label}`} />
                    <span className="text-[10px] text-muted-foreground group-hover/month:text-foreground transition-colors">{p.month}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-paid" /> Pago</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-overdue" /> Em atraso</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-finance-pending" /> Pendente</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-muted" /> Próximo</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 gap-1.5 font-medium" onClick={() => setPlanoPropinasOpen(true)}>
                <CalendarClock className="w-3.5 h-3.5" /> Ver Todas as Mensalidades
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detalhes Financeiros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalhes Financeiros</CardTitle>
            <CardDescription>Ano letivo 2024/2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mensalidade</span>
              <span className="font-medium">{formatCurrency(250000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Propina anual (10 meses)</span>
              <span className="font-medium">{formatCurrency(2500000)}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2 text-xs" onClick={() => toast({ title: "PDF gerado", description: "Tabela de emolumentos a descarregar..." })}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">Tabela de Emolumentos (PDF)</span>
              </Button>
              <TabelaInfracoesButton fullWidth className="h-9 gap-2 text-xs" icon={<FileText className="w-4 h-4 shrink-0" />} />

              <Button variant="outline" size="sm" className="w-full h-9 justify-start gap-2 text-xs" onClick={() => toast({ title: "PDF gerado", description: "Regras & condições a descarregar..." })}>
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">Regras & Condições (PDF)</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={() => toast({ title: "Suporte contactado", description: "A redirecionar para o suporte..." })}>
              <Headphones className="w-4 h-4" /> Contactar Suporte
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={() => toast({ title: "Área Financeira", description: "A contactar a área financeira..." })}>
              <Building2 className="w-4 h-4" /> Área Financeira
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={() => toast({ title: "Declaração solicitada", description: "A sua declaração será processada em breve." })}>
              <Download className="w-4 h-4" /> Pedir Declaração
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={handleExport}>
              <FileBarChart className="w-4 h-4" /> Exportar Relatório
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={() => toast({ title: "Pedido enviado", description: "O seu pedido de apoio financeiro foi submetido." })}>
              <HandCoins className="w-4 h-4" /> Apoio Financeiro
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-auto py-2.5 flex-col" onClick={() => toast({ title: "Contestação enviada", description: "A sua contestação de multa foi registada." })}>
              <Scale className="w-4 h-4" /> Contestar Multa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-finance-paid inline-block" />
              Meus Pagamentos
            </CardTitle>
            <div className="flex items-center gap-1.5 rounded-lg border bg-muted/50 p-1">
                <div className="pl-2 pr-1 flex items-center">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                {([['all', 'Todos'], ['tuition', 'Propinas'], ['emoluments', 'Emolumentos'], ['events', 'Eventos'], ['clubs', 'Clubes']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-md font-medium transition-all",
                      categoryFilter === key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setCategoryFilter(key)}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('dueDate')}>
                    <span className="flex items-center">Data <SortIcon col="dueDate" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('amount')}>
                    <span className="flex items-center justify-end">Valor <SortIcon col="amount" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <span className="flex items-center">Estado <SortIcon col="status" /></span>
                  </TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map(p => {
                  const catKey = getCategoryKey(p.category);
                  const cat = categoryConfig[catKey];
                  const CatIcon = cat.icon;
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell>
                        <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md", cat.className)}>
                          <CatIcon className="w-3.5 h-3.5" />
                          {cat.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDatePT(p.dueDate)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-[11px] font-semibold px-2.5 py-0.5 border-0", statusConfig[p.status].className)}>
                          {statusConfig[p.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider delayDuration={200}>
                          <div className="flex items-center justify-end gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-finance-paid" onClick={() => handleDoc(p)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>Visualizar</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-finance-info" onClick={() => toast({ title: "Partilha", description: "Link copiado para a área de transferência." })}>
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>Partilhar</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => toast({ title: "PDF gerado", description: "A descarregar comprovativo..." })}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>Exportar PDF</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pay Modal */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
          {/* Modal Header */}
          <div className="px-6 pt-6 pb-5 border-b bg-muted/30">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Pagamento por Referência
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedPayment && (() => {
            const month = selectedPayment.month ?? '';
            const monthNames: Record<string, string> = {
              Jan: 'Janeiro', Fev: 'Fevereiro', Mar: 'Março', Abr: 'Abril',
              Mai: 'Maio', Jun: 'Junho', Jul: 'Julho', Ago: 'Agosto',
              Set: 'Setembro', Out: 'Outubro',
            };
            const label = selectedPayment.category === 'tuition' && month
              ? `Propina ${monthNames[month] ?? month} 2024/2025`
              : selectedPayment.description;
            const isOverdue = selectedPayment.status === 'overdue';
            return (
              <div className="px-6 py-5 space-y-5">
                {/* Payment identity block */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    selectedPayment.category === 'tuition' ? 'bg-finance-info/10 text-finance-info' : 'bg-finance-pending/10 text-finance-pending'
                  )}>
                    {selectedPayment.category === 'tuition' ? <GraduationCap className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 border",
                        isOverdue
                          ? "text-finance-overdue border-finance-overdue/30 bg-finance-overdue/5"
                          : selectedPayment.status === 'pending'
                          ? "text-finance-pending border-finance-pending/30 bg-finance-pending/5"
                          : "text-muted-foreground border-border bg-muted/50"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", isOverdue ? "bg-finance-overdue" : selectedPayment.status === 'pending' ? "bg-finance-pending" : "bg-muted-foreground/50")} />
                        Vencimento: {formatDatePT(selectedPayment.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>

                <div className="border-t border-dashed" />

                {/* Payment reference block */}
                <div className="rounded-xl border bg-muted/20 overflow-hidden">
                  <div className="px-4 py-2.5 border-b bg-muted/40">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dados de Pagamento</p>
                  </div>
                  <div className="divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Entidade</span>
                      <span className="font-mono text-sm font-bold text-foreground tracking-wider">21 255</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Referência</span>
                      <span className="font-mono text-sm font-bold text-foreground tracking-wider">192 847 {selectedPayment.id.padStart(3, '0')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                      <span className="text-xs font-semibold text-primary">Montante</span>
                      <span className="font-mono text-sm font-bold text-primary tracking-wide">{formatCurrency(selectedPayment.amount)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Utilize os dados acima para efetuar o pagamento via<br />Multicaixa Express, Internet Banking ou ATM.
                </p>
              </div>
            );
          })()}

          <div className="px-6 pb-6">
            <Button className="w-full bg-finance-paid hover:bg-finance-paid/90 text-white gap-2" onClick={confirmPay}>
              <CreditCard className="w-4 h-4" /> Confirmar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Select Overdue Payment Modal */}
      <Dialog open={selectModalOpen} onOpenChange={setSelectModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-muted/30">
            <DialogTitle className="text-base font-semibold tracking-tight">Conta Corrente</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {incompletePayments.length} pagamentos incompletos · Total:{' '}
              <span className="font-semibold text-finance-overdue">{formatCurrency(contaCorrenteTotal)}</span>
            </p>
          </div>

          {/* Payment list */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {incompletePayments.map(p => {
              const catKey = getCategoryKey(p.category);
              const cat = categoryConfig[catKey];
              const CatIcon = cat.icon;
              const isOverdue = p.status === 'overdue';
              const daysLate = isOverdue ? Math.max(0, Math.ceil((Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
              const multaTotal = daysLate * 100;
              return (
                <div key={p.id} className="rounded-xl border bg-card overflow-hidden shadow-sm">
                  {/* Status stripe */}
                  <div className={cn("h-[3px] w-full", isOverdue ? "bg-finance-overdue" : "bg-finance-pending")} />

                  <div className="p-4 space-y-4">
                    {/* Top row: icon + description + amount */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", cat.className)}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">{p.description}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Vencimento: {formatDatePT(p.dueDate)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(p.amount)}</p>
                        <Badge className={cn("text-[10px] mt-1 border-0", isOverdue ? "bg-finance-overdue text-white" : "bg-finance-pending text-white")}>
                          {isOverdue ? 'EM ATRASO' : 'PENDENTE'}
                        </Badge>
                      </div>
                    </div>

                    {/* Multa block — only for overdue */}
                    {isOverdue && (
                      <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden border border-finance-overdue/20">
                        <div className="bg-finance-overdue/5 px-3 py-2.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Multa aplicada</p>
                          <p className="text-sm font-bold text-finance-overdue tabular-nums">{formatCurrency(multaTotal)}</p>
                        </div>
                        <div className="bg-finance-overdue/5 px-3 py-2.5 border-l border-finance-overdue/20">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Dias em atraso</p>
                          <p className="text-sm font-bold text-finance-overdue">{daysLate} dias</p>
                        </div>
                      </div>
                    )}

                    {/* Total a pagar — only for overdue */}
                    {isOverdue && (
                      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total a pagar</span>
                        <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(p.amount + multaTotal)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs h-8 font-medium" onClick={() => { setSelectModalOpen(false); handleDoc(p); }}>
                        <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                      </Button>
                      <Button size="sm" className="flex-1 gap-1.5 text-xs h-8 font-medium bg-finance-paid hover:bg-finance-paid/90 text-white" onClick={() => { setSelectModalOpen(false); handlePay(p); }}>
                        <CreditCard className="w-3.5 h-3.5" /> Pagar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comprovativo Modal */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {docPayment?.status === 'paid' ? 'Documentos do Pagamento' : 'Detalhes do Pagamento'}
            </DialogTitle>
            {docPayment && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {docPayment.description} · {formatDatePT(docPayment.dueDate)}
              </p>
            )}
          </div>

          {docPayment && (
            docPayment.status === 'paid' ? (
              <Tabs defaultValue="comprovativo" className="flex flex-col flex-1 overflow-hidden">
                <div className="px-6 pt-4 shrink-0">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="comprovativo" className="gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" /> Comprovativo
                    </TabsTrigger>
                    <TabsTrigger value="factura" className="gap-1.5 text-xs">
                      <Receipt className="w-3.5 h-3.5" /> Fatura
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Comprovativo Tab */}
                <TabsContent value="comprovativo" className="flex-1 overflow-y-auto px-6 py-4 space-y-0 mt-0">
                  {/* Green paid banner */}
                  <div className="rounded-xl border border-finance-paid/30 bg-finance-paid/5 px-4 py-3 flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-finance-paid/15 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-finance-paid" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-finance-paid">Pagamento Confirmado</p>
                      <p className="text-[11px] text-muted-foreground">Processado com sucesso</p>
                    </div>
                    <Badge className="ml-auto text-[10px] bg-finance-paid text-white border-0 px-2">PAGO</Badge>
                  </div>

                  <div className="rounded-xl border overflow-hidden divide-y divide-border/60">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Descrição</span>
                      <span className="text-sm font-medium text-foreground text-right max-w-[55%] truncate">{docPayment.description}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Data de Pagamento</span>
                      <span className="text-sm font-medium">{formatDatePT(docPayment.dueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Nº Comprovativo</span>
                      <span className="font-mono text-sm font-bold tracking-wider">COMP-{docPayment.id.padStart(6, '0')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-muted-foreground">Método</span>
                      <span className="text-sm font-medium">Multicaixa / ATM</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                      <span className="text-xs font-semibold text-primary">Valor Pago</span>
                      <span className="font-mono text-sm font-bold text-primary tracking-wide">{formatCurrency(docPayment.amount)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => toast({ title: "PDF aberto", description: "A abrir comprovativo..." })}>
                      <Eye className="w-3.5 h-3.5" /> Ver PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => toast({ title: "Partilhado", description: "Link copiado para a área de transferência." })}>
                      <Share2 className="w-3.5 h-3.5" /> Partilhar
                    </Button>
                  </div>
                </TabsContent>

                {/* Fatura Tab */}
                <TabsContent value="factura" className="flex-1 overflow-y-auto px-6 py-4 space-y-0 mt-0">
                  {/* Fatura header */}
                  <div className="rounded-xl border overflow-hidden mb-4">
                    <div className="bg-foreground px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-background/60 uppercase tracking-widest font-medium">Fatura</p>
                        <p className="font-mono text-lg font-bold text-background">FAT-{docPayment.id.padStart(6, '0')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-background/60">Data</p>
                        <p className="text-sm font-semibold text-background">{formatDatePT(docPayment.dueDate)}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-border/60">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground">Cliente</span>
                        <span className="text-sm font-medium">Estudante</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground">Serviço</span>
                        <span className="text-sm font-medium text-right max-w-[55%] truncate">{docPayment.description}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground">Ano Letivo</span>
                        <span className="text-sm font-medium">2024/2025</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground">Subtotal</span>
                        <span className="text-sm font-medium tabular-nums">{formatCurrency(docPayment.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-muted-foreground">IVA (0%)</span>
                        <span className="text-sm font-medium">0,00 Kz</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Total</span>
                        <span className="font-mono text-sm font-bold text-primary">{formatCurrency(docPayment.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => toast({ title: "PDF aberto", description: "A abrir fatura..." })}>
                      <Eye className="w-3.5 h-3.5" /> Ver PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => toast({ title: "Descarregado", description: "Fatura a descarregar..." })}>
                      <Download className="w-3.5 h-3.5" /> Descarregar
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Non-paid: existing detail view */
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descrição</span>
                  <span className="font-medium">{docPayment.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento</span>
                  <span className="font-medium">{formatDatePT(docPayment.dueDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-bold">{formatCurrency(docPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge className={cn("text-[11px] font-semibold px-2.5 py-0.5 border-0", statusConfig[docPayment.status].className)}>
                    {statusConfig[docPayment.status].label}
                  </Badge>
                </div>
                {docPayment.status === 'upcoming' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Regra de multa</span>
                    <span className="font-medium text-foreground">100,00 Kz / dia de atraso</span>
                  </div>
                )}
                {(docPayment.status === 'overdue' || docPayment.status === 'pending') && (() => {
                  const isOverdue = docPayment.status === 'overdue';
                  const daysLate = isOverdue ? Math.max(0, Math.ceil((Date.now() - docPayment.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                  const multaTotal = daysLate * 100;
                  return (
                    <>
                      <div className="border-t" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Multa aplicada</span>
                          {isOverdue
                            ? <span className="text-sm font-semibold text-finance-overdue">{formatCurrency(multaTotal)}</span>
                            : <span className="text-sm font-medium text-finance-paid">Sem multa</span>}
                        </div>
                        {isOverdue && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Dias em atraso</span>
                            <span className="text-sm font-medium">{daysLate} dias</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Regra de multa</span>
                        <span className="text-xs font-medium text-foreground">100,00 Kz / dia de atraso</span>
                      </div>
                    </>
                  );
                })()}
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setDocModalOpen(false)}>Fechar</Button>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Plano de Propinas Modal */}
      <Dialog open={planoPropinasOpen} onOpenChange={setPlanoPropinasOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
            <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              Plano de Propinas 2024/2025
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {tuitionPayments.filter(p => p.status === 'paid').length} pagas · {tuitionPayments.filter(p => p.status !== 'paid').length} em aberto
            </p>
          </div>

          {/* Payment list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {(() => {
              const monthNames: Record<string, string> = {
                Jan: 'Janeiro', Fev: 'Fevereiro', Mar: 'Março', Abr: 'Abril',
                Mai: 'Maio', Jun: 'Junho', Jul: 'Julho', Ago: 'Agosto',
                Set: 'Setembro', Out: 'Outubro',
              };
              return tuitionPayments.map(p => {
                const isPaid = p.status === 'paid';
                const isOverdue = p.status === 'overdue';
                const isPending = p.status === 'pending';
                const isUpcoming = p.status === 'upcoming';
                const daysLate = isOverdue ? Math.max(0, Math.ceil((Date.now() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
                const multa = daysLate * 100;
                const totalDue = p.amount + multa;
                const fullName = `Propina ${monthNames[p.month ?? ''] ?? p.month} 2024/2025`;

                const topStripeColor = isPaid ? 'bg-finance-paid' : isOverdue ? 'bg-finance-overdue' : null;
                const borderColor = isOverdue ? 'border-finance-overdue/30' : isPaid ? 'border-finance-paid/20' : '';

                return (
                  <div key={p.id} className={cn("rounded-xl border space-y-0 overflow-hidden", borderColor)}>
                    {/* Top stripe */}
                    {topStripeColor && <div className={cn("h-[3px] w-full", topStripeColor)} />}

                    <div className="px-4 py-3 space-y-2.5 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">{fullName}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Vencimento: {formatDatePT(p.dueDate)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(p.amount)}</span>
                          <div className="mt-1">
                            <Badge className={cn("text-[10px] border-0 px-2", statusConfig[p.status].className)}>
                              {statusConfig[p.status].label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Multa block — overdue only */}
                      {isOverdue && (
                        <>
                          <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden border border-finance-overdue/20">
                            <div className="bg-finance-overdue/5 px-3 py-2">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Multa aplicada</p>
                              <p className="text-sm font-bold text-finance-overdue tabular-nums">{formatCurrency(multa)}</p>
                            </div>
                            <div className="bg-finance-overdue/5 px-3 py-2 border-l border-finance-overdue/20">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Dias em atraso</p>
                              <p className="text-sm font-bold text-finance-overdue">{daysLate} dias</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total a pagar</span>
                            <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(totalDue)}</span>
                          </div>
                        </>
                      )}



                      {isPaid ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 font-medium" onClick={() => { setPlanoPropinasOpen(false); handleDoc(p); }}>
                            <Eye className="w-3 h-3" /> Ver Detalhes
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1.5 font-medium" onClick={() => { setPlanoPropinasOpen(false); handleDoc(p); }}>
                            <Eye className="w-3 h-3" /> Ver Detalhes
                          </Button>
                          <Button size="sm" className="flex-1 h-7 text-xs gap-1.5 font-medium bg-finance-paid hover:bg-finance-paid/90 text-white" onClick={() => { setPlanoPropinasOpen(false); handlePay(p); }}>
                            <CreditCard className="w-3 h-3" /> Pagar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
