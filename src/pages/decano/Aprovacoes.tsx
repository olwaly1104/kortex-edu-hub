import { useState } from "react";
import { decanoSolicitacoes } from "@/data/institutionData";
import type { Solicitacao } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, CheckCircle, XCircle, Award,
  FileText, Calendar, Users, AlertTriangle, Search,
  Eye, Plus, Send, ArrowDownLeft, ArrowUpRight,
  Briefcase, MessageSquare, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, React.ElementType> = {
  nota: Award, plano: FileText, horário: Calendar, transferência: Users,
  recurso: AlertTriangle, material: Briefcase, reunião: MessageSquare,
};

const typeLabels: Record<string, string> = {
  nota: "Nota", plano: "Plano", horário: "Horário", transferência: "Transferência",
  recurso: "Recurso", material: "Material", reunião: "Reunião",
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  aprovado: { label: "Aprovado", cls: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  média: { label: "Média", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border" },
};

type SolicitacaoStatus = "pendente" | "aprovado" | "rejeitado";

export default function DecanoAprovacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [subTab, setSubTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, SolicitacaoStatus>>({});

  const [newType, setNewType] = useState<string>("material");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<string>("média");

  const getStatus = (id: string, original: SolicitacaoStatus) => localStatuses[id] || original;

  const allWithStatus = decanoSolicitacoes.map(s => ({
    ...s,
    status: getStatus(s.id, s.status),
  }));

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
    toast({ title: "Solicitação enviada", description: "O pedido foi enviado à Reitoria." });
    setShowNewDialog(false);
    setNewTitle(""); setNewDesc(""); setNewType("material"); setNewPriority("média");
  };

  const mainTabs = [
    { key: "recebidas" as const, label: "Recebidas", icon: ArrowDownLeft, count: pendingRecebidas },
    { key: "enviadas" as const, label: "Enviadas", icon: ArrowUpRight, count: pendingEnviadas },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground tracking-tight">Solicitações</h1>
              </div>
              <p className="text-sm text-muted-foreground">Gerir pedidos recebidos e enviar solicitações</p>
            </div>
            <Button onClick={() => setShowNewDialog(true)} size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Nova Solicitação
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-3 grid grid-cols-4 gap-4">
          {[
            { label: "Total Pendentes", value: pendingRecebidas + pendingEnviadas, color: "text-amber-600" },
            { label: "Recebidas Pendentes", value: pendingRecebidas, color: "text-primary" },
            { label: "Enviadas Pendentes", value: pendingEnviadas, color: "text-secondary" },
            { label: "Processadas", value: allWithStatus.filter(s => s.status !== "pendente").length, color: "text-accent" },
          ].map(k => (
            <div key={k.label} className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{k.label}</p>
              <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs & Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSubTab("pendentes"); setTypeFilter(null); }}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/50")}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={cn("text-[10px] font-semibold rounded-full px-1.5 min-w-[16px] text-center",
                tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <div className="w-px h-5 bg-border" />
        <button onClick={() => setSubTab("pendentes")}
          className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            subTab === "pendentes" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/50")}>
          Pendentes <span className="ml-1 text-[10px]">{currentPending}</span>
        </button>
        <button onClick={() => setSubTab("historico")}
          className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            subTab === "historico" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/50")}>
          Histórico <span className="ml-1 text-[10px]">{currentHistory}</span>
        </button>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-xs" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(sol => {
          const Icon = typeIcons[sol.type] || FileText;
          const sc = statusConfig[sol.status];
          const StatusIcon = sc.icon;
          const pc = priorityConfig[sol.priority];
          const isRecebida = sol.direction === "recebida";
          return (
            <Card key={sol.id} className="p-4 hover:shadow-sm transition-shadow border-l-[3px]"
              style={{ borderLeftColor: sol.status === "pendente" ? "hsl(var(--primary))" : sol.status === "aprovado" ? "hsl(var(--accent))" : "hsl(var(--destructive))" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{sol.title}</p>
                    <Badge variant="outline" className={cn("text-[9px] shrink-0", pc.cls)}>{pc.label}</Badge>
                    <Badge variant="outline" className={cn("text-[9px] gap-0.5 shrink-0", sc.cls)}>
                      <StatusIcon className="w-2.5 h-2.5" /> {sc.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    {isRecebida ? (
                      <span className="flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> {sol.requester}</span>
                    ) : (
                      <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {sol.destinatario}</span>
                    )}
                    <span>•</span>
                    <span>{sol.date}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[9px]">{typeLabels[sol.type]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="ghost" size="sm" className="text-[11px] gap-1 h-7 px-2" onClick={() => setSelectedId(sol.id)}>
                    <Eye className="w-3 h-3" /> Ver
                  </Button>
                  {isRecebida && sol.status === "pendente" && (
                    <>
                      <Button size="sm" className="text-[11px] gap-1 h-7 px-2 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleAction(sol.id, "aprovado")}>
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-[11px] gap-1 h-7 px-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleAction(sol.id, "rejeitado")}>
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-10 text-center">
            <CheckSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">{subTab === "pendentes" ? "Nenhuma solicitação pendente" : "Nenhum registo no histórico"}</p>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                {(() => { const Icon = typeIcons[selected.type] || FileText; return (
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                ); })()}
                <div>
                  <DialogTitle className="text-lg">{selected.title}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.direction === "recebida" ? `De: ${selected.requester}` : `Para: ${selected.destinatario}`} • {selected.date}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tipo</p>
                  <Badge variant="outline" className="text-xs">{typeLabels[selected.type]}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Prioridade</p>
                  <Badge variant="outline" className={cn("text-xs", priorityConfig[selected.priority].cls)}>{priorityConfig[selected.priority].label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                  {(() => { const sc = statusConfig[selected.status]; const SI = sc.icon; return (
                    <Badge variant="outline" className={cn("text-xs gap-1", sc.cls)}><SI className="w-3 h-3" /> {sc.label}</Badge>
                  ); })()}
                </div>
              </div>
            </div>
            {selected.direction === "recebida" && selected.status === "pendente" && (
              <>
                <Separator />
                <DialogFooter className="gap-2 sm:gap-2">
                  <DialogClose asChild><Button variant="outline" className="flex-1">Fechar</Button></DialogClose>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5" onClick={() => handleAction(selected.id, "rejeitado")}>
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </Button>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5" onClick={() => handleAction(selected.id, "aprovado")}>
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* New Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Nova Solicitação</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título</label>
              <Input className="mt-1" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Assunto da solicitação" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Textarea className="mt-1" rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detalhes do pedido..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
            <Button onClick={handleNewSubmit} className="gap-1.5"><Send className="w-4 h-4" /> Enviar à Reitoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
