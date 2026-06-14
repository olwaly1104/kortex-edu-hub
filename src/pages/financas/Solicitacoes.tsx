import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckSquare, Clock, CheckCircle2, XCircle, Receipt, TrendingUp,
  Wallet, FileText, Coins, Search, Plus, ArrowDownLeft, ArrowUpRight,
  GraduationCap, CalendarDays, Inbox, Send, AlertTriangle, Hash,
  Building2, Filter, Sparkles, MoreHorizontal, Paperclip, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/financeModuleData";

type FinDirection = "recebida" | "enviada";
type FinStatus = "pendente" | "aprovado" | "rejeitado";
type FinType = "reembolso" | "orcamento" | "fornecedor" | "antecipacao" | "verba" | "outro";

interface FinSolicitacao {
  id: string;
  ref: string;
  direction: FinDirection;
  type: FinType;
  title: string;
  description: string;
  requester: string;
  requesterRole?: string;
  destinatario?: string;
  date: string;
  dueDate?: string;
  amount: number;
  priority: "alta" | "média" | "baixa";
  status: FinStatus;
  attachments?: number;
}

const solicitacoes: FinSolicitacao[] = [
  { id: "fs1", ref: "REQ-2025-0412", direction: "recebida", type: "reembolso", title: "Reembolso — Conferência Internacional Lisboa", description: "Reembolso de viagem, alojamento e inscrição da conferência IEEE 2025 realizada entre 12 e 16 de Março.", requester: "Prof. António Silva", requesterRole: "Docente — Fac. Engenharia", date: "2025-04-08", dueDate: "2025-04-18", amount: 450000, priority: "média", status: "pendente", attachments: 3 },
  { id: "fs2", ref: "REQ-2025-0411", direction: "recebida", type: "orcamento", title: "Reforço Orçamental — Laboratório de Redes", description: "Solicitação de reforço orçamental para aquisição de switches geridos e equipamento de teste de rede.", requester: "Decano Fac. Engenharia", requesterRole: "Decano", date: "2025-04-05", dueDate: "2025-04-15", amount: 8000000, priority: "alta", status: "pendente", attachments: 2 },
  { id: "fs3", ref: "REQ-2025-0408", direction: "recebida", type: "fornecedor", title: "Pagamento Fornecedor — Reagentes Químicos", description: "Liquidação da factura FT-2025/0412 ao fornecedor LabSupplies Angola, vencida a 30/04.", requester: "Coord. Fac. Ciências", requesterRole: "Coordenador", date: "2025-04-02", amount: 2300000, priority: "alta", status: "aprovado", attachments: 1 },
  { id: "fs4", ref: "REQ-2025-0402", direction: "recebida", type: "antecipacao", title: "Antecipação Salarial — Motivos pessoais", description: "Pedido de adiantamento de 50% do salário do mês corrente por motivos pessoais devidamente justificados.", requester: "Eng. João Martins", requesterRole: "Técnico de Manutenção", date: "2025-03-28", amount: 200000, priority: "baixa", status: "rejeitado" },
  { id: "fs5", ref: "REQ-2025-0399", direction: "recebida", type: "verba", title: "Verba Extra — Evento de Boas-Vindas", description: "Apoio financeiro à organização do evento de recepção dos novos estudantes do ano lectivo 2025/26.", requester: "Assoc. Estudantes", requesterRole: "AEUPRA", date: "2025-03-25", dueDate: "2025-04-20", amount: 1500000, priority: "média", status: "pendente", attachments: 4 },
  { id: "fs6", ref: "REQ-2025-0390", direction: "recebida", type: "fornecedor", title: "Pagamento Fornecedor — Material Gráfico", description: "Pagamento da factura FT-2025/0388 à gráfica institucional.", requester: "Secretaria Geral", requesterRole: "Sec. Académica", date: "2025-03-22", amount: 680000, priority: "baixa", status: "aprovado" },
  { id: "fs7", ref: "REQ-2025-0381", direction: "recebida", type: "reembolso", title: "Reembolso — Deslocação Inspecção", description: "Reembolso de combustível e portagens das visitas aos campi externos.", requester: "Dr. Carlos Bento", requesterRole: "Inspector Académico", date: "2025-03-18", amount: 95000, priority: "baixa", status: "aprovado" },
  { id: "fs8", ref: "REQ-2025-0405", direction: "enviada", type: "orcamento", title: "Pedido de Aprovação — Orçamento Q2", description: "Submissão do orçamento consolidado do 2º trimestre ao Magnífico Reitor.", requester: "Direcção Financeira", destinatario: "Magnífico Reitor", date: "2025-04-01", dueDate: "2025-04-20", amount: 145000000, priority: "alta", status: "pendente", attachments: 5 },
  { id: "fs9", ref: "REQ-2025-0386", direction: "enviada", type: "outro", title: "Auditoria Externa — Aprovação KPMG", description: "Pedido de contratação da firma KPMG para auditoria anual de contas.", requester: "Direcção Financeira", destinatario: "Magnífico Reitor", date: "2025-03-26", amount: 4200000, priority: "média", status: "aprovado" },
  { id: "fs10", ref: "REQ-2025-0378", direction: "enviada", type: "verba", title: "Reforço de Tesouraria — Bolsas de Mérito", description: "Solicitação de transferência adicional para o fundo de bolsas de mérito do 2º semestre.", requester: "Direcção Financeira", destinatario: "Conselho de Gestão", date: "2025-03-20", dueDate: "2025-04-12", amount: 6500000, priority: "alta", status: "pendente", attachments: 2 },
];

const typeMeta: Record<FinType, { label: string; icon: any; cls: string; bar: string }> = {
  reembolso:   { label: "Reembolso",   icon: Receipt,    cls: "bg-blue-50 text-blue-700 border-blue-200",       bar: "bg-blue-500" },
  orcamento:   { label: "Orçamento",   icon: TrendingUp, cls: "bg-violet-50 text-violet-700 border-violet-200", bar: "bg-violet-500" },
  fornecedor:  { label: "Fornecedor",  icon: FileText,   cls: "bg-amber-50 text-amber-700 border-amber-200",    bar: "bg-amber-500" },
  antecipacao: { label: "Antecipação", icon: Wallet,     cls: "bg-rose-50 text-rose-700 border-rose-200",       bar: "bg-rose-500" },
  verba:       { label: "Verba",       icon: Coins,      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  outro:       { label: "Outro",       icon: Sparkles,   cls: "bg-slate-50 text-slate-700 border-slate-200",    bar: "bg-slate-500" },
};

const statusMeta: Record<FinStatus, { label: string; cls: string; dot: string; icon: any }> = {
  pendente:  { label: "Pendente",  cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   icon: Clock },
  aprovado:  { label: "Aprovada",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  rejeitado: { label: "Rejeitada", cls: "bg-red-50 text-red-600 border-red-200",             dot: "bg-red-500",     icon: XCircle },
};

const priorityMeta: Record<string, { label: string; cls: string }> = {
  alta:  { label: "Alta",  cls: "bg-red-50 text-red-700 border-red-200" },
  média: { label: "Média", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border" },
};

const MONTHS_PT_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function prettyDate(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2,"0")} ${MONTHS_PT_SHORT[m-1]} ${y}`;
}
function daysFromToday(iso?: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(y, m-1, d).getTime();
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((t - today.getTime()) / 86400000);
}

export default function FinancasSolicitacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [subTab, setSubTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinType | "todos">("todos");
  const [priorityFilter, setPriorityFilter] = useState<"todos" | "alta" | "média" | "baixa">("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, FinStatus>>({});

  const [newType, setNewType] = useState<FinType>("orcamento");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newPriority, setNewPriority] = useState<string>("média");

  const getStatus = (id: string, original: FinStatus) => localStatuses[id] || original;
  const all = solicitacoes.map(s => ({ ...s, status: getStatus(s.id, s.status) }));
  const directionFiltered = all.filter(s => s.direction === (tab === "recebidas" ? "recebida" : "enviada"));

  const filtered = useMemo(() => directionFiltered
    .filter(s => subTab === "pendentes" ? s.status === "pendente" : s.status !== "pendente")
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.requester.toLowerCase().includes(search.toLowerCase()) || s.ref.toLowerCase().includes(search.toLowerCase()))
    .filter(s => typeFilter === "todos" || s.type === typeFilter)
    .filter(s => priorityFilter === "todos" || s.priority === priorityFilter)
    .sort((a, b) => b.date.localeCompare(a.date)),
    [directionFiltered, subTab, search, typeFilter, priorityFilter]);

  // KPIs
  const pendentes = all.filter(s => s.status === "pendente");
  const valorPendente = pendentes.reduce((acc, s) => acc + s.amount, 0);
  const aprovadasMes = all.filter(s => s.status === "aprovado" && s.date.startsWith("2025-04")).length;
  const rejeitadasMes = all.filter(s => s.status === "rejeitado").length;
  const urgentes = pendentes.filter(s => s.priority === "alta").length;

  const pendingRecebidas = all.filter(s => s.direction === "recebida" && s.status === "pendente").length;
  const pendingEnviadas  = all.filter(s => s.direction === "enviada"  && s.status === "pendente").length;
  const currentPending   = directionFiltered.filter(s => s.status === "pendente").length;
  const currentHistory   = directionFiltered.filter(s => s.status !== "pendente").length;

  const selected = selectedId ? all.find(s => s.id === selectedId) : (filtered[0] ?? null);

  const handleAction = (id: string, action: "aprovado" | "rejeitado") => {
    setLocalStatuses(prev => ({ ...prev, [id]: action }));
    toast({
      title: action === "aprovado" ? "Solicitação aprovada" : "Solicitação rejeitada",
      description: `O pedido foi ${action === "aprovado" ? "aprovado" : "rejeitado"} com sucesso.`,
    });
  };

  const handleNewSubmit = () => {
    if (!newTitle.trim()) return;
    toast({ title: "Solicitação submetida", description: "O pedido foi enviado para aprovação." });
    setShowNewDialog(false);
    setNewTitle(""); setNewDesc(""); setNewAmount(""); setNewDest(""); setNewType("orcamento"); setNewPriority("média");
  };

  /* live clock */
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2,"0")}h:${String(now.getMinutes()).padStart(2,"0")}min:${String(now.getSeconds()).padStart(2,"0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-5">
      {/* ── Header ── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                <CheckSquare className="w-5 h-5 text-primary" /> Solicitações Financeiras
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Caixa de entrada de pedidos financeiros — analisar, aprovar e acompanhar.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
              </span>
              <span className="w-px bg-border" />
              <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
                <Clock className="w-3.5 h-3.5" />{liveTime}
              </span>
            </div>
            <Button size="sm" onClick={() => setShowNewDialog(true)} className="h-9 gap-1.5 text-xs shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Pendentes</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{pendentes.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{urgentes} de prioridade alta</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Valor Pendente</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(valorPendente)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Aguardam decisão</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Aprovadas (mês)</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{aprovadasMes}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Abril 2025</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Rejeitadas</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{rejeitadasMes}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Últimos 30 dias</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
          </div>
        </Card>
      </div>

      {/* ── Workspace: Inbox + Preview ── */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border bg-muted/30 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Direção */}
            <div className="flex bg-card rounded-lg p-0.5 border border-border shadow-sm">
              {([
                { key: "recebidas" as const, label: "Recebidas", icon: Inbox, count: pendingRecebidas },
                { key: "enviadas"  as const, label: "Enviadas",  icon: Send,  count: pendingEnviadas },
              ]).map(t => (
                <button key={t.key}
                  onClick={() => { setTab(t.key); setSubTab("pendentes"); setSelectedId(null); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}>
                  <t.icon className="w-3.5 h-3.5" />{t.label}
                  <span className={cn(
                    "text-[10px] px-1.5 rounded-full tabular-nums font-semibold",
                    tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 text-xs">
              {([
                { key: "pendentes" as const, label: "A decidir", count: currentPending },
                { key: "historico" as const, label: "Histórico", count: currentHistory },
              ]).map(t => (
                <button key={t.key}
                  onClick={() => { setSubTab(t.key); setSelectedId(null); }}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap",
                    subTab === t.key ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {t.label}
                  <span className="ml-1.5 text-[10px] text-muted-foreground tabular-nums">({t.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por título, referência ou requerente…"
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </div>
            <Select value={typeFilter} onValueChange={(v: FinType | "todos") => setTypeFilter(v)}>
              <SelectTrigger className="w-[170px] h-9 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                {(Object.keys(typeMeta) as FinType[]).map(k => (
                  <SelectItem key={k} value={k}>{typeMeta[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="média">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] min-h-[560px]">
          {/* LEFT: list */}
          <div className="border-r border-border">
            {/* List header */}
            <div className="px-4 py-2 border-b border-border bg-card flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>{filtered.length} {filtered.length === 1 ? "solicitação" : "solicitações"}</span>
              <span>Mais recentes primeiro</span>
            </div>
            <ScrollArea className="h-[560px]">
              {filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {subTab === "pendentes" ? "Caixa de entrada vazia" : "Sem registos no histórico"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subTab === "pendentes" ? "Todos os pedidos foram processados." : "Ajuste os filtros para ver resultados."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map(sol => {
                    const m = typeMeta[sol.type];
                    const st = statusMeta[sol.status];
                    const pc = priorityMeta[sol.priority];
                    const isActive = selected?.id === sol.id;
                    const dueIn = daysFromToday(sol.dueDate);
                    const Icon = m.icon;
                    return (
                      <li key={sol.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(sol.id)}
                          className={cn(
                            "w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-muted/40 relative",
                            isActive && "bg-primary/5"
                          )}
                        >
                          {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border", m.cls)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{sol.ref}</span>
                              <span className="text-xs font-bold text-foreground tabular-nums">{formatCurrency(sol.amount)}</span>
                            </div>
                            <p className={cn("text-sm leading-snug truncate mt-0.5", isActive ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                              {sol.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {sol.direction === "recebida" ? sol.requester : `Para: ${sol.destinatario}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold gap-1 border", st.cls)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} /> {st.label}
                              </Badge>
                              {sol.priority === "alta" && (
                                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold border", pc.cls)}>
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Urgente
                                </Badge>
                              )}
                              {dueIn !== null && sol.status === "pendente" && (
                                <span className={cn(
                                  "text-[10px] font-medium tabular-nums",
                                  dueIn < 0 ? "text-red-600" : dueIn <= 3 ? "text-amber-600" : "text-muted-foreground"
                                )}>
                                  {dueIn < 0 ? `Atraso ${Math.abs(dueIn)}d` : dueIn === 0 ? "Hoje" : `${dueIn}d restantes`}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground tabular-nums ml-auto">{prettyDate(sol.date)}</span>
                            </div>
                          </div>
                          <ChevronRight className={cn("w-4 h-4 text-muted-foreground/40 self-center shrink-0 transition-transform", isActive && "text-primary translate-x-0.5")} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* RIGHT: detail */}
          <div className="bg-muted/10">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">Selecione uma solicitação</p>
                <p className="text-xs text-muted-foreground mt-1">Os detalhes aparecem aqui</p>
              </div>
            ) : (() => {
              const m = typeMeta[selected.type];
              const st = statusMeta[selected.status];
              const pc = priorityMeta[selected.priority];
              const Icon = m.icon;
              const StatusIcon = st.icon;
              const isRecebida = selected.direction === "recebida";
              const dueIn = daysFromToday(selected.dueDate);
              return (
                <div className="flex flex-col h-full">
                  {/* detail header */}
                  <div className="px-5 py-4 border-b border-border bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border", m.cls)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono tabular-nums">
                            <Hash className="w-3 h-3" />{selected.ref}
                          </div>
                          <h2 className="text-base font-semibold text-foreground leading-snug mt-0.5">{selected.title}</h2>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className={cn("text-[10px] gap-1 border font-semibold", st.cls)}>
                              <StatusIcon className="w-3 h-3" /> {st.label}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px] border font-semibold", m.cls)}>{m.label}</Badge>
                            <Badge variant="outline" className={cn("text-[10px] border font-semibold", pc.cls)}>Prioridade {pc.label}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  {/* body */}
                  <ScrollArea className="flex-1">
                    <div className="p-5 space-y-5">
                      {/* Big amount */}
                      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Valor solicitado</p>
                        <p className="text-3xl font-bold text-foreground tabular-nums mt-1">{formatCurrency(selected.amount)}</p>
                        {selected.dueDate && selected.status === "pendente" && (
                          <p className={cn(
                            "text-xs font-medium mt-2 flex items-center gap-1.5",
                            dueIn !== null && dueIn < 0 ? "text-red-600" : dueIn !== null && dueIn <= 3 ? "text-amber-600" : "text-muted-foreground"
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            Prazo de decisão: {prettyDate(selected.dueDate)}
                            {dueIn !== null && <span>· {dueIn < 0 ? `${Math.abs(dueIn)} dias em atraso` : dueIn === 0 ? "hoje" : `${dueIn} dias`}</span>}
                          </p>
                        )}
                      </div>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                            {isRecebida ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {isRecebida ? "Requerente" : "Destinatário"}
                          </p>
                          <p className="font-semibold text-foreground text-sm leading-tight">
                            {isRecebida ? selected.requester : selected.destinatario}
                          </p>
                          {isRecebida && selected.requesterRole && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Building2 className="w-3 h-3" />{selected.requesterRole}</p>
                          )}
                        </div>
                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Submetido em
                          </p>
                          <p className="font-semibold text-foreground text-sm tabular-nums">{prettyDate(selected.date)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Há {Math.max(0, -(daysFromToday(selected.date) ?? 0))} dias
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Justificação</p>
                        <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                      </div>

                      {/* Attachments */}
                      {selected.attachments && selected.attachments > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Anexos</p>
                          <div className="space-y-1.5">
                            {Array.from({ length: selected.attachments }).map((_, i) => (
                              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/30 transition-colors cursor-pointer">
                                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-foreground flex-1 truncate">{selected.ref}-anexo-{i + 1}.pdf</span>
                                <span className="text-[10px] text-muted-foreground">{(120 + i * 47).toFixed(0)} KB</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Action bar */}
                  {isRecebida && selected.status === "pendente" ? (
                    <div className="border-t border-border bg-card px-5 py-3 flex items-center gap-2">
                      <Button
                        className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAction(selected.id, "aprovado")}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleAction(selected.id, "rejeitado")}
                      >
                        <XCircle className="w-4 h-4" /> Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <div className="border-t border-border bg-card px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <StatusIcon className="w-3.5 h-3.5" /> Pedido {st.label.toLowerCase()}
                      </span>
                      {!isRecebida && <span>Aguarda decisão do destinatário</span>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Nova Solicitação</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</label>
              <Select value={newType} onValueChange={v => setNewType(v as FinType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeMeta) as FinType[]).map(k => <SelectItem key={k} value={k}>{typeMeta[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título</label>
              <Input placeholder="Ex: Reforço orçamental Q2" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor (Kz)</label>
                <Input placeholder="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destinatário</label>
              <Input placeholder="Ex: Magnífico Reitor" value={newDest} onChange={e => setNewDest(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Justificação</label>
              <Textarea rows={3} placeholder="Descreva o motivo do pedido..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          <Separator />
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleNewSubmit} disabled={!newTitle.trim()} className="gap-1.5"><Send className="w-4 h-4" /> Submeter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
