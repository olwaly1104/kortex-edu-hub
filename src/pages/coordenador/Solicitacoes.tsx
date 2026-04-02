import { useState } from "react";
import { coordSolicitacoes, type Solicitacao } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Clock, CheckCircle, XCircle, Award,
  FileText, Calendar, Users, AlertTriangle, Search,
  Eye, Plus, Send, ArrowDownLeft, ArrowUpRight,
  Briefcase, MessageSquare,
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
  nota: Award,
  plano: FileText,
  horário: Calendar,
  transferência: Users,
  recurso: AlertTriangle,
  material: Briefcase,
  reunião: MessageSquare,
};

const typeLabels: Record<string, string> = {
  nota: "Nota",
  plano: "Plano",
  horário: "Horário",
  transferência: "Transferência",
  recurso: "Recurso",
  material: "Material",
  reunião: "Reunião",
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  aprovado: { label: "Aprovado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-red-50 text-red-600" },
  média: { label: "Média", cls: "bg-amber-50 text-amber-700" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground" },
};

type SolicitacaoStatus = "pendente" | "aprovado" | "rejeitado";

export default function CoordenadorSolicitacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");
  const [subTab, setSubTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, SolicitacaoStatus>>({});

  // New request form
  const [newType, setNewType] = useState<string>("material");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<string>("média");

  const getStatus = (id: string, original: SolicitacaoStatus) => localStatuses[id] || original;

  const allWithStatus = coordSolicitacoes.map(s => ({
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
    toast({ title: "Solicitação enviada", description: "O pedido foi enviado ao Decano." });
    setShowNewDialog(false);
    setNewTitle("");
    setNewDesc("");
    setNewType("material");
    setNewPriority("média");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" /> Solicitações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerir pedidos recebidos e enviar solicitações</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Solicitação
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: allWithStatus.length, icon: FileText, color: "text-primary bg-primary/10" },
          { label: "Pendentes", value: pendingRecebidas + pendingEnviadas, icon: Clock, color: "text-secondary bg-secondary/10" },
          { label: "Aprovadas", value: allWithStatus.filter(s => s.status === "aprovado").length, icon: CheckCircle, color: "text-accent bg-accent/10" },
          { label: "Rejeitadas", value: allWithStatus.filter(s => s.status === "rejeitado").length, icon: XCircle, color: "text-destructive bg-destructive/10" },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main tabs: Recebidas / Enviadas */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-2">
            {mainTabs.map(t => (
              <Button
                key={t.key}
                size="sm"
                variant={tab === t.key ? "default" : "outline"}
                onClick={() => { setTab(t.key); setSubTab("pendentes"); setTypeFilter(null); }}
                className="gap-1.5"
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] h-5 min-w-5 justify-center">
                    {t.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex gap-1">
            {subTabs.map(t => (
              <Button
                key={t.key}
                size="sm"
                variant={subTab === t.key ? "secondary" : "ghost"}
                onClick={() => setSubTab(t.key)}
                className="text-xs gap-1 h-8"
              >
                {t.label}
                <Badge variant="outline" className="text-[10px] h-4 min-w-4 justify-center ml-0.5">
                  {t.count}
                </Badge>
              </Button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 w-48"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <Button
                size="sm"
                variant={typeFilter === null ? "default" : "outline"}
                onClick={() => setTypeFilter(null)}
                className="h-8 text-xs shrink-0"
              >
                Todos
              </Button>
              {Object.entries(typeLabels).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={typeFilter === key ? "default" : "outline"}
                  onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                  className="h-8 text-xs hidden lg:inline-flex shrink-0"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(sol => {
          const Icon = typeIcons[sol.type] || FileText;
          const sc = statusConfig[sol.status];
          const StatusIcon = sc.icon;
          const pc = priorityConfig[sol.priority];
          const isRecebida = sol.direction === "recebida";
          return (
            <Card key={sol.id} className="p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{sol.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sol.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-[10px]", pc.cls)}>{pc.label}</Badge>
                      <Badge className={cn("text-[10px] gap-1", sc.cls)}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {isRecebida ? (
                        <span className="flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> {sol.requester}</span>
                      ) : (
                        <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Para: {sol.destinatario}</span>
                      )}
                      <span>•</span>
                      <span>{sol.date}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabels[sol.type]}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8" onClick={() => setSelectedId(sol.id)}>
                        <Eye className="w-3.5 h-3.5" /> Detalhes
                      </Button>
                      {isRecebida && sol.status === "pendente" && (
                        <>
                          <Button
                            size="sm"
                            className="text-xs gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAction(sol.id, "aprovado")}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1.5 h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleAction(sol.id, "rejeitado")}
                          >
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
          <Card className="p-12">
            <div className="text-center">
              <CheckSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                {subTab === "pendentes" ? "Nenhuma solicitação pendente" : "Nenhum registo no histórico"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {subTab === "pendentes" ? "Todos os pedidos foram processados 🎉" : "Ajuste os filtros para ver resultados"}
              </p>
            </div>
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
                  <Badge className={cn("text-xs", priorityConfig[selected.priority].cls)}>{priorityConfig[selected.priority].label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                  {(() => { const sc = statusConfig[selected.status]; const SI = sc.icon; return (
                    <Badge className={cn("text-xs gap-1", sc.cls)}><SI className="w-3 h-3" /> {sc.label}</Badge>
                  ); })()}
                </div>
              </div>
            </div>
            {selected.direction === "recebida" && selected.status === "pendente" && (
              <>
                <Separator />
                <DialogFooter className="gap-2 sm:gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">Fechar</Button>
                  </DialogClose>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => handleAction(selected.id, "rejeitado")}
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
                    onClick={() => handleAction(selected.id, "aprovado")}
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* New Solicitação Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Nova Solicitação ao Decano
            </DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Título</label>
              <Input
                placeholder="Ex: Requisição de equipamento laboratorial"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Descrição</label>
              <Textarea
                placeholder="Descreva o pedido em detalhe..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Tipo</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Prioridade</label>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Esta solicitação será enviada ao <strong>Decano da Faculdade</strong> para apreciação.</span>
            </div>
          </div>
          <Separator />
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleNewSubmit} disabled={!newTitle.trim()} className="gap-1.5">
              <Send className="w-4 h-4" /> Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
