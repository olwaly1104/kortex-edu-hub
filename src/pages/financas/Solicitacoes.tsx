import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, CheckCircle, XCircle, Receipt, TrendingUp,
  Wallet, FileText, Coins, Search, Eye, Plus, X,
  ArrowDownLeft, ArrowUpRight, User, Calendar, MessageSquare,
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

const typeIcons: Record<FinType, any> = {
  reembolso: Receipt,
  orcamento: TrendingUp,
  fornecedor: FileText,
  antecipacao: Wallet,
  verba: Coins,
  outro: CheckSquare,
};

const typeLabels: Record<FinType, string> = {
  reembolso: "Reembolso",
  orcamento: "Orçamento",
  fornecedor: "Fornecedor",
  antecipacao: "Antecipação",
  verba: "Verba",
  outro: "Outro",
};

const statusConfig: Record<FinStatus, { label: string; cls: string; icon: any }> = {
  pendente: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  aprovado: { label: "Aprovada", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  rejeitado: { label: "Rejeitada", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-red-50 text-red-600" },
  média: { label: "Média", cls: "bg-amber-50 text-amber-700" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground" },
};

export default function FinancasSolicitacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [subTab, setSubTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinType | null>(null);
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
    .filter(s => !typeFilter || s.type === typeFilter);

  const pendingRecebidas = allWithStatus.filter(s => s.direction === "recebida" && s.status === "pendente").length;
  const pendingEnviadas = allWithStatus.filter(s => s.direction === "enviada" && s.status === "pendente").length;
  const currentPending = directionFiltered.filter(s => s.status === "pendente").length;
  const currentHistory = directionFiltered.filter(s => s.status !== "pendente").length;

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
    { key: "enviadas" as const, label: "Enviadas", icon: ArrowUpRight, count: pendingEnviadas },
  ];
  const subTabs = [
    { key: "pendentes" as const, label: "Pendentes", count: currentPending },
    { key: "historico" as const, label: "Histórico", count: currentHistory },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" /> Solicitações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerir pedidos financeiros recebidos e enviados</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Solicitação
        </Button>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {mainTabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSubTab("pendentes"); setTypeFilter(null); }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  "ml-0.5 text-[10px] font-semibold rounded-full px-1.5 min-w-[16px] text-center",
                  tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                )}>{t.count}</span>
              )}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center" />
          {subTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                subTab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t.label}
              <span className={cn(
                "text-[10px] font-semibold rounded-full px-1.5 min-w-[16px] text-center",
                subTab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
              )}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-border" />

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex-1" />
          {(search || typeFilter) && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={() => { setSearch(""); setTypeFilter(null); }}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant={typeFilter === null ? "default" : "outline"} onClick={() => setTypeFilter(null)} className="text-xs">Todos</Button>
            {(Object.keys(typeLabels) as FinType[]).map(key => (
              <Button key={key} size="sm" variant={typeFilter === key ? "default" : "outline"} onClick={() => setTypeFilter(typeFilter === key ? null : key)} className="text-xs">{typeLabels[key]}</Button>
            ))}
          </div>
        </div>

        {(search || typeFilter) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {typeFilter && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setTypeFilter(null)}>
                Tipo: {typeLabels[typeFilter]} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {search && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(sol => {
          const Icon = typeIcons[sol.type];
          const sc = statusConfig[sol.status];
          const StatusIcon = sc.icon;
          const pc = priorityConfig[sol.priority];
          const isRecebida = sol.direction === "recebida";
          return (
            <Card key={sol.id} className="p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{sol.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sol.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-lg font-bold text-foreground whitespace-nowrap">{formatCurrency(sol.amount)}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[10px]", pc.cls)}>{pc.label}</Badge>
                        <Badge className={cn("text-[10px] gap-1", sc.cls)}><StatusIcon className="w-3 h-3" /> {sc.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {isRecebida ? (
                        <span className="flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> {sol.requester}</span>
                      ) : (
                        <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Para: {sol.destinatario}</span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sol.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabels[sol.type]}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8" onClick={() => setSelectedId(sol.id)}>
                        <Eye className="w-3.5 h-3.5" /> Detalhes
                      </Button>
                      {isRecebida && sol.status === "pendente" && (
                        <>
                          <Button size="sm" className="text-xs gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(sol.id, "aprovado")}>
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(sol.id, "rejeitado")}>
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {subTab === "pendentes" ? "Nenhuma solicitação pendente" : "Nenhum registo no histórico"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {subTab === "pendentes" ? "Todos os pedidos foram processados 🎉" : "Ajuste os filtros para ver resultados"}
            </p>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                {(() => { const Icon = typeIcons[selected.type]; return (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                ); })()}
                <div>
                  <DialogTitle className="text-lg">{selected.title}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.direction === "recebida" ? `De: ${selected.requester}` : `Para: ${selected.destinatario}`} • {new Date(selected.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
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
                  <p className="text-base font-bold text-foreground">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tipo</p>
                  <Badge variant="outline" className="text-xs">{typeLabels[selected.type]}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Prioridade</p>
                  <Badge className={cn("text-xs", priorityConfig[selected.priority].cls)}>{priorityConfig[selected.priority].label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                  {(() => { const sc = statusConfig[selected.status]; const SI = sc.icon; return (
                    <Badge className={cn("text-xs gap-1", sc.cls)}><SI className="w-3 h-3" /> {sc.label}</Badge>
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
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                    onClick={() => handleAction(selected.id, "rejeitado")}
                  >
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
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={newType} onValueChange={v => setNewType(v as FinType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(typeLabels) as FinType[]).map(k => <SelectItem key={k} value={k}>{typeLabels[k]}</SelectItem>)}
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
