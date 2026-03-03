import { useState } from "react";
import { coordAprovacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare, Clock, CheckCircle, XCircle, Award,
  FileText, Calendar, Users, AlertTriangle, Search,
  ChevronDown, Eye, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, React.ElementType> = {
  nota: Award,
  plano: FileText,
  horário: Calendar,
  transferência: Users,
  recurso: AlertTriangle,
};

const typeLabels: Record<string, string> = {
  nota: "Nota",
  plano: "Plano",
  horário: "Horário",
  transferência: "Transferência",
  recurso: "Recurso",
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", cls: "bg-secondary/10 text-secondary border-secondary/20", icon: Clock },
  aprovado: { label: "Aprovado", cls: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

type AprovacaoStatus = "pendente" | "aprovado" | "rejeitado";

export default function CoordenadorAprovacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"pendentes" | "historico">("pendentes");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, AprovacaoStatus>>({});

  const getStatus = (id: string, original: AprovacaoStatus) => localStatuses[id] || original;

  const allWithStatus = coordAprovacoes.map(a => ({
    ...a,
    status: getStatus(a.id, a.status),
  }));

  const filtered = allWithStatus
    .filter(a => tab === "pendentes" ? a.status === "pendente" : a.status !== "pendente")
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.requester.toLowerCase().includes(search.toLowerCase()))
    .filter(a => !typeFilter || a.type === typeFilter);

  const pendingCount = allWithStatus.filter(a => a.status === "pendente").length;
  const selected = selectedId ? allWithStatus.find(a => a.id === selectedId) : null;

  const handleAction = (id: string, action: "aprovado" | "rejeitado") => {
    setLocalStatuses(prev => ({ ...prev, [id]: action }));
    setSelectedId(null);
    toast({
      title: action === "aprovado" ? "Aprovação confirmada" : "Pedido rejeitado",
      description: `O pedido foi ${action === "aprovado" ? "aprovado" : "rejeitado"} com sucesso.`,
    });
  };

  const tabs = [
    { key: "pendentes" as const, label: "Pendentes", icon: Clock, count: pendingCount },
    { key: "historico" as const, label: "Histórico", icon: CheckCircle, count: allWithStatus.filter(a => a.status !== "pendente").length },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" /> Aprovações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerir pedidos de aprovação do curso</p>
        </div>
        <Badge variant="outline" className="text-sm gap-1.5 px-3 py-1.5">
          <Clock className="w-3.5 h-3.5" /> {pendingCount} pendentes
        </Badge>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: allWithStatus.length, icon: FileText, color: "text-primary bg-primary/10" },
          { label: "Pendentes", value: pendingCount, icon: Clock, color: "text-secondary bg-secondary/10" },
          { label: "Aprovados", value: allWithStatus.filter(a => a.status === "aprovado").length, icon: CheckCircle, color: "text-accent bg-accent/10" },
          { label: "Rejeitados", value: allWithStatus.filter(a => a.status === "rejeitado").length, icon: XCircle, color: "text-destructive bg-destructive/10" },
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

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2">
          {tabs.map(t => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? "default" : "outline"}
              onClick={() => setTab(t.key)}
              className="gap-1.5"
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <Badge variant="secondary" className="ml-1 text-[10px] h-5 min-w-5 justify-center">
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
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={typeFilter === null ? "default" : "outline"}
              onClick={() => setTypeFilter(null)}
              className="h-9 text-xs"
            >
              Todos
            </Button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={typeFilter === key ? "default" : "outline"}
                onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                className="h-9 text-xs hidden lg:inline-flex"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(ap => {
          const Icon = typeIcons[ap.type] || FileText;
          const sc = statusConfig[ap.status];
          const StatusIcon = sc.icon;
          return (
            <Card key={ap.id} className="p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{ap.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ap.description}</p>
                    </div>
                    <Badge className={cn("text-[10px] shrink-0 gap-1", sc.cls)}>
                      <StatusIcon className="w-3 h-3" /> {sc.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{ap.requester}</span>
                      <span>•</span>
                      <span>{ap.date}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabels[ap.type]}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                        onClick={() => setSelectedId(ap.id)}
                      >
                        <Eye className="w-3.5 h-3.5" /> Detalhes
                      </Button>
                      {ap.status === "pendente" && (
                        <>
                          <Button
                            size="sm"
                            className="text-xs gap-1.5 h-8 bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleAction(ap.id, "aprovado")}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleAction(ap.id, "rejeitado")}
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
                {tab === "pendentes" ? "Nenhuma aprovação pendente" : "Nenhum registo no histórico"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {tab === "pendentes" ? "Todos os pedidos foram processados 🎉" : "Ajuste os filtros para ver resultados"}
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
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.requester} • {selected.date}</p>
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tipo</p>
                  <Badge variant="outline" className="text-xs">{typeLabels[selected.type]}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                  {(() => { const sc = statusConfig[selected.status]; const SI = sc.icon; return (
                    <Badge className={cn("text-xs gap-1", sc.cls)}><SI className="w-3 h-3" /> {sc.label}</Badge>
                  ); })()}
                </div>
              </div>
            </div>
            {selected.status === "pendente" && (
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
    </div>
  );
}
