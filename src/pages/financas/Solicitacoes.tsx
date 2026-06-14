import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, CheckCircle, XCircle, Receipt, TrendingUp,
  Wallet, FileText, Coins, Search, Eye, Plus,
  ArrowDownLeft, ArrowUpRight, User, MessageSquare,
  GraduationCap, CalendarDays, ArrowRight,
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
  direction: FinDirection;
  type: FinType;
  title: string;
  description: string;
  requester: string;
  requesterRole?: string;
  destinatario?: string;
  date: string;
  amount: number;
  priority: "alta" | "média" | "baixa";
  status: FinStatus;
}

const solicitacoes: FinSolicitacao[] = [
  { id: "fs1", direction: "recebida", type: "reembolso", title: "Reembolso — Conferência Internacional Lisboa", description: "Reembolso de viagem, alojamento e inscrição da conferência IEEE 2025.", requester: "Prof. António Silva", requesterRole: "Docente Fac. Engenharia", date: "2025-04-08", amount: 450000, priority: "média", status: "pendente" },
  { id: "fs2", direction: "recebida", type: "orcamento", title: "Aumento Orçamental — Laboratório de Redes", description: "Solicitação de reforço orçamental para aquisição de switches e equipamento de teste.", requester: "Decano Fac. Engenharia", requesterRole: "Decano", date: "2025-04-05", amount: 8000000, priority: "alta", status: "pendente" },
  { id: "fs3", direction: "recebida", type: "fornecedor", title: "Pagamento Fornecedor — Reagentes Químicos", description: "Liquidação da factura FT-2025/0412 ao fornecedor LabSupplies Angola.", requester: "Coord. Fac. Ciências", requesterRole: "Coordenador", date: "2025-04-02", amount: 2300000, priority: "alta", status: "aprovado" },
  { id: "fs4", direction: "recebida", type: "antecipacao", title: "Antecipação Salarial — Motivos pessoais", description: "Pedido de adiantamento de 50% do salário do mês corrente.", requester: "Eng. João Martins", requesterRole: "Técnico de Manutenção", date: "2025-03-28", amount: 200000, priority: "baixa", status: "rejeitado" },
  { id: "fs5", direction: "recebida", type: "verba", title: "Verba Extra — Evento de Boas-Vindas", description: "Apoio financeiro à organização do evento de recepção dos novos estudantes.", requester: "Assoc. Estudantes", requesterRole: "AEUPRA", date: "2025-03-25", amount: 1500000, priority: "média", status: "pendente" },
  { id: "fs6", direction: "recebida", type: "fornecedor", title: "Pagamento Fornecedor — Material Gráfico", description: "Pagamento da factura FT-2025/0388 à gráfica institucional.", requester: "Secretaria Geral", requesterRole: "Sec. Académica", date: "2025-03-22", amount: 680000, priority: "baixa", status: "aprovado" },
  { id: "fs7", direction: "recebida", type: "reembolso", title: "Reembolso — Deslocação Inspecção", description: "Reembolso de combustível e portagens das visitas aos campi externos.", requester: "Dr. Carlos Bento", requesterRole: "Inspector Académico", date: "2025-03-18", amount: 95000, priority: "baixa", status: "aprovado" },
  { id: "fs8", direction: "enviada", type: "orcamento", title: "Pedido de Aprovação — Orçamento Q2", description: "Submissão do orçamento consolidado do 2º trimestre ao Reitor.", requester: "Direcção Financeira", destinatario: "Magnífico Reitor", date: "2025-04-01", amount: 145000000, priority: "alta", status: "pendente" },
  { id: "fs9", direction: "enviada", type: "outro", title: "Auditoria Externa — Aprovação", description: "Pedido de contratação da firma KPMG para auditoria anual.", requester: "Direcção Financeira", destinatario: "Magnífico Reitor", date: "2025-03-26", amount: 4200000, priority: "média", status: "aprovado" },
  { id: "fs10", direction: "enviada", type: "verba", title: "Reforço de Tesouraria — Bolsas", description: "Solicitação de transferência adicional para o fundo de bolsas de mérito.", requester: "Direcção Financeira", destinatario: "Conselho de Gestão", date: "2025-03-20", amount: 6500000, priority: "alta", status: "pendente" },
];

const typeMeta: Record<FinType, { label: string; icon: any; dot: string; chip: string }> = {
  reembolso:   { label: "Reembolso",   icon: Receipt,     dot: "bg-blue-500",    chip: "bg-blue-50 text-blue-700 border-blue-200" },
  orcamento:   { label: "Orçamento",   icon: TrendingUp,  dot: "bg-violet-500",  chip: "bg-violet-50 text-violet-700 border-violet-200" },
  fornecedor:  { label: "Fornecedor",  icon: FileText,    dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200" },
  antecipacao: { label: "Antecipação", icon: Wallet,      dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200" },
  verba:       { label: "Verba",       icon: Coins,       dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  outro:       { label: "Outro",       icon: CheckSquare, dot: "bg-slate-500",   chip: "bg-slate-50 text-slate-700 border-slate-200" },
};

const statusConfig: Record<FinStatus, { label: string; cls: string; icon: any }> = {
  pendente: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  aprovado: { label: "Aprovada", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  rejeitado: { label: "Rejeitada", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  alta:  { label: "Alta",  cls: "bg-red-50 text-red-600 border-red-200" },
  média: { label: "Média", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border" },
};

const MONTHS_PT_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2,"0")} ${MONTHS_PT_SHORT[m-1]} ${y}`;
}

export default function FinancasSolicitacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [subTab, setSubTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinType | "todos">("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, FinStatus>>({});

  const [newType, setNewType] = useState<FinType>("orcamento");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPriority, setNewPriority] = useState<string>("média");

  const getStatus = (id: string, original: FinStatus) => localStatuses[id] || original;
  const allWithStatus = solicitacoes.map(s => ({ ...s, status: getStatus(s.id, s.status) }));
  const directionFiltered = allWithStatus.filter(s => s.direction === (tab === "recebidas" ? "recebida" : "enviada"));

  const filtered = directionFiltered
    .filter(s => subTab === "pendentes" ? s.status === "pendente" : s.status !== "pendente")
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.requester.toLowerCase().includes(search.toLowerCase()))
    .filter(s => typeFilter === "todos" || s.type === typeFilter);

  const pendingRecebidas = allWithStatus.filter(s => s.direction === "recebida" && s.status === "pendente").length;
  const pendingEnviadas  = allWithStatus.filter(s => s.direction === "enviada"  && s.status === "pendente").length;
  const currentPending   = directionFiltered.filter(s => s.status === "pendente").length;
  const currentHistory   = directionFiltered.filter(s => s.status !== "pendente").length;

  const selected = selectedId ? allWithStatus.find(s => s.id === selectedId) : null;

  const handleAction = (id: string, action: "aprovado" | "rejeitado") => {
    setLocalStatuses(prev => ({ ...prev, [id]: action }));
    setSelectedId(null);
    toast({
      title: action === "aprovado" ? "Solicitação aprovada" : "Solicitação rejeitada",
      description: `A solicitação foi ${action === "aprovado" ? "aprovada" : "rejeitada"} com sucesso.`,
    });
  };

  const handleNewSubmit = () => {
    if (!newTitle.trim()) return;
    toast({ title: "Solicitação enviada", description: "O pedido foi submetido com sucesso." });
    setShowNewDialog(false);
    setNewTitle(""); setNewDesc(""); setNewAmount(""); setNewType("orcamento"); setNewPriority("média");
  };

  const mainTabs = [
    { key: "recebidas" as const, label: "Recebidas", icon: ArrowDownLeft, count: pendingRecebidas },
    { key: "enviadas"  as const, label: "Enviadas",  icon: ArrowUpRight,  count: pendingEnviadas },
  ];
  const subTabs = [
    { key: "pendentes" as const, label: "Pendentes", count: currentPending },
    { key: "historico" as const, label: "Histórico", count: currentHistory },
  ];

  /* live time + ano letivo header (matches Anúncios / Calendário) */
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2,"0")}h:${String(now.getMinutes()).padStart(2,"0")}min:${String(now.getSeconds()).padStart(2,"0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      {/* ── Header (matches Anúncios / Calendário) ── */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                <CheckSquare className="w-5 h-5 text-primary" /> Solicitações
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gerir pedidos financeiros recebidos e enviados.
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

      {/* ── Controls ── */}
      <Card className="p-3 space-y-3">
        {/* Direção (Recebidas / Enviadas) + Estado (Pendentes / Histórico) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted/60 rounded-lg p-0.5">
            {mainTabs.map(t => (
              <button key={t.key}
                onClick={() => { setTab(t.key); setSubTab("pendentes"); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={cn(
                  "text-[10px] px-1.5 rounded-full tabular-nums",
                  tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex bg-muted/60 rounded-lg p-0.5">
            {subTabs.map(t => (
              <button key={t.key}
                onClick={() => setSubTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  subTab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {t.label}
                <span className={cn(
                  "text-[10px] px-1.5 rounded-full tabular-nums",
                  subTab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pesquisa + Categoria */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar solicitação…"
              className="pl-9 h-9 text-sm border-border"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v: FinType | "todos") => setTypeFilter(v)}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {(Object.keys(typeMeta) as FinType[]).map(k => (
                <SelectItem key={k} value={k}>{typeMeta[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ── Lista ── */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {subTab === "pendentes" ? "Nenhuma solicitação pendente" : "Nenhum registo no histórico"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {subTab === "pendentes" ? "Todos os pedidos foram processados 🎉" : "Ajuste os filtros para ver resultados"}
            </p>
          </Card>
        ) : filtered.map(sol => {
          const m = typeMeta[sol.type];
          const sc = statusConfig[sol.status];
          const StatusIcon = sc.icon;
          const pc = priorityConfig[sol.priority];
          const isRecebida = sol.direction === "recebida";
          const counterpart = isRecebida ? sol.requester : (sol.destinatario || "—");
          const counterpartRole = isRecebida ? sol.requesterRole : "Destinatário";
          const initials = counterpart.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
          return (
            <Card key={sol.id} className="group overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex">
                <div className={cn("w-1 shrink-0", m.dot)} />
                <div className="flex-1 p-4">
                  {/* top meta: sender + estado + date */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                        {initials || <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate leading-tight">
                          {isRecebida ? counterpart : `Para: ${counterpart}`}
                        </p>
                        {counterpartRole && (
                          <p className="text-[10px] text-muted-foreground truncate leading-tight">{counterpartRole}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-[10px] gap-1 border", sc.cls)}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </Badge>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                        <CalendarDays className="w-3.5 h-3.5" />{prettyDate(sol.date)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/60 mb-3" />

                  {/* body */}
                  <button type="button" onClick={() => setSelectedId(sol.id)} className="block w-full text-left group/title">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-1 group-hover/title:text-primary transition-colors">
                        {sol.title}
                      </h3>
                      <span className="text-base font-bold text-foreground whitespace-nowrap tabular-nums">
                        {formatCurrency(sol.amount)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {sol.description}
                    </p>
                  </button>

                  {/* footer: categoria + prioridade + actions */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-border/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1 px-1.5", m.chip)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                        {m.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold px-1.5", pc.cls)}>
                        Prioridade {pc.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRecebida && sol.status === "pendente" && (
                        <>
                          <Button size="sm" className="h-7 text-[11px] gap-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(sol.id, "aprovado")}>
                            <CheckCircle className="w-3 h-3" /> Aprovar
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(sol.id, "rejeitado")}>
                            <XCircle className="w-3 h-3" /> Rejeitar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1.5 px-2.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setSelectedId(sol.id)}>
                        <Eye className="w-3 h-3" /> Detalhes <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                {(() => { const Icon = typeMeta[selected.type].icon; return (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                ); })()}
                <div>
                  <DialogTitle className="text-lg">{selected.title}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.direction === "recebida" ? `De: ${selected.requester}` : `Para: ${selected.destinatario}`} • {prettyDate(selected.date)}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="space-y-4 py-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Valor</p>
                  <p className="text-base font-bold text-foreground tabular-nums">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Categoria</p>
                  <Badge variant="outline" className={cn("text-xs", typeMeta[selected.type].chip)}>{typeMeta[selected.type].label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Prioridade</p>
                  <Badge className={cn("text-xs border", priorityConfig[selected.priority].cls)}>{priorityConfig[selected.priority].label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                  {(() => { const sc2 = statusConfig[selected.status]; const SI = sc2.icon; return (
                    <Badge className={cn("text-xs gap-1 border", sc2.cls)}><SI className="w-3 h-3" /> {sc2.label}</Badge>
                  ); })()}
                </div>
              </div>
              {selected.requesterRole && (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="w-3 h-3" /> {selected.requester} · {selected.requesterRole}</p>
                </div>
              )}
            </div>
            {selected.direction === "recebida" && selected.status === "pendente" ? (
              <>
                <Separator />
                <DialogFooter className="gap-2 sm:gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">Fechar</Button>
                  </DialogClose>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5" onClick={() => handleAction(selected.id, "rejeitado")}>
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => handleAction(selected.id, "aprovado")}>
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* New Request */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Categoria</label>
              <Select value={newType} onValueChange={v => setNewType(v as FinType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeMeta) as FinType[]).map(k => <SelectItem key={k} value={k}>{typeMeta[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Título</label>
              <Input placeholder="Ex: Reforço orçamental Q2" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Valor (Kz)</label>
              <Input placeholder="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Textarea rows={3} placeholder="Justificação do pedido..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
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
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleNewSubmit} className="gap-1.5"><MessageSquare className="w-4 h-4" /> Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
