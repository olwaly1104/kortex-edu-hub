import { useMemo, useState } from "react";
// no router navigate needed — detail opens in a dialog
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle, Plus, Search, X, Inbox, Clock, CheckCircle2, AlertCircle, Send, ChevronRight, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  solicitacoes as gapSolicitacoes, Solicitacao, EstadoSolicitacao,
  estadoSolicitacaoConfig, destinoConfig, tipoConfig, categoriaConfig, Categoria,
} from "@/data/gapData";
import SolicitacaoDocPreview from "@/pages/gap/SolicitacaoDocPreview";

const STUDENT_MATRICULA = "2024001"; // Ana Luísa Ferreira (logged in)
const TODAY = "2025-12-16";

const estadoDot: Record<EstadoSolicitacao, string> = {
  recebida: "bg-amber-500",
  em_execucao: "bg-sky-500",
  concluida: "bg-emerald-500",
  rejeitada: "bg-destructive",
  em_atraso: "bg-orange-500",
};

type EstadoFilter = "todos" | "pendentes" | "em_execucao" | "concluidas" | "rejeitadas";

export default function StudentSolicitacoes() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const { toast } = useToast();

  // Local state for newly-created (in-session) solicitações.
  const [extras, setExtras] = useState<Solicitacao[]>([]);
  const [estado, setEstado] = useState<EstadoFilter>("todos");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form state
  const [fCategoria, setFCategoria] = useState<Categoria | "">("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fAssunto, setFAssunto] = useState("");
  const [fDescricao, setFDescricao] = useState("");

  const own = useMemo(() => {
    const baseline = gapSolicitacoes.filter(s => s.matricula === STUDENT_MATRICULA);
    return [...extras, ...baseline].sort((a, b) => b.dataSubmissao.localeCompare(a.dataSubmissao));
  }, [extras]);

  const counts = useMemo(() => ({
    todos: own.length,
    pendentes: own.filter(s => s.estado === "recebida").length,
    em_execucao: own.filter(s => s.estado === "em_execucao").length,
    concluidas: own.filter(s => s.estado === "concluida").length,
    rejeitadas: own.filter(s => s.estado === "rejeitada").length,
  }), [own]);

  const filtered = useMemo(() => {
    return own.filter(s => {
      if (estado === "pendentes" && s.estado !== "recebida") return false;
      if (estado === "em_execucao" && s.estado !== "em_execucao") return false;
      if (estado === "concluidas" && s.estado !== "concluida") return false;
      if (estado === "rejeitadas" && s.estado !== "rejeitada") return false;
      if (search) {
        const q = search.toLowerCase();
        const tipoLabel = tipoConfig[s.tipo]?.label.toLowerCase() ?? "";
        if (!s.assunto.toLowerCase().includes(q) && !tipoLabel.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [own, estado, search]);

  const tiposByCategoria = useMemo(() => {
    const map: Record<string, { key: string; label: string }[]> = { Tecnológico: [], Académico: [], Financeiro: [] };
    Object.entries(tipoConfig).forEach(([key, cfg]) => {
      map[cfg.categoria].push({ key, label: cfg.label });
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => a.label.localeCompare(b.label)));
    return map;
  }, []);

  const resetForm = () => {
    setFCategoria(""); setFTipo(""); setFAssunto(""); setFDescricao("");
  };

  const submitNova = () => {
    if (!fCategoria || !fTipo || !fAssunto.trim() || !fDescricao.trim()) {
      toast({ title: "Campos em falta", description: "Preencha categoria, motivo, assunto e descrição." });
      return;
    }
    const cfg = tipoConfig[fTipo];
    const id = `SOL-2025-${String(9000 + extras.length + 1).padStart(4, "0")}`;
    const nova: Solicitacao = {
      id,
      discente: "Ana Luísa Ferreira",
      matricula: STUDENT_MATRICULA,
      curso: "Eng. Informática",
      faculdade: "Faculdade de Ciências Exatas",
      ano: 2,
      tipo: fTipo,
      assunto: fAssunto.trim(),
      descricao: fDescricao.trim(),
      destino: cfg.destino,
      estado: "recebida",
      prioridade: "media",
      slaDias: cfg.slaDias,
      dataSubmissao: TODAY,
      historico: [
        { data: `${TODAY} 08:00`, actor: "Portal do Discente", accao: "Solicitação submetida pelo discente" },
        { data: `${TODAY} 08:01`, actor: "Sistema", accao: `Encaminhada automaticamente para ${destinoConfig[cfg.destino].label}` },
      ],
    };
    setExtras(prev => [nova, ...prev]);
    toast({ title: "Solicitação submetida", description: `${id} encaminhada para ${destinoConfig[cfg.destino].label}.` });
    resetForm();
    setOpen(false);
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const tabs: { key: EstadoFilter; label: string; icon: typeof Inbox; count: number }[] = [
    { key: "todos",       label: "Todas",       icon: Inbox,         count: counts.todos },
    { key: "pendentes",   label: "Pendentes",   icon: Clock,         count: counts.pendentes },
    { key: "em_execucao", label: "Em Execução", icon: Send,          count: counts.em_execucao },
    { key: "concluidas",  label: "Concluídas",  icon: CheckCircle2,  count: counts.concluidas },
    { key: "rejeitadas",  label: "Rejeitadas",  icon: AlertCircle,   count: counts.rejeitadas },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Solicitações
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Submeta pedidos académicos, financeiros e tecnológicos ao Gabinete de Apoio ao Discente.
          </p>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Solicitação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Nova Solicitação</DialogTitle>
              <DialogDescription>
                Será encaminhada automaticamente ao departamento responsável.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Categoria */}
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(categoriaConfig) as Categoria[]).map(c => {
                    const cfg = categoriaConfig[c];
                    const Icon = cfg.icon;
                    const active = fCategoria === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setFCategoria(c); setFTipo(""); }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-md border text-xs font-medium transition-colors",
                          active ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:bg-muted text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-1.5">
                <Label className="text-xs">Motivo</Label>
                <Select value={fTipo} onValueChange={setFTipo} disabled={!fCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder={fCategoria ? "Selecione o motivo" : "Selecione primeiro a categoria"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {fCategoria && tiposByCategoria[fCategoria].map(t => (
                      <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fTipo && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                    <ChevronRight className="w-3 h-3" />
                    Encaminhada para <span className="font-semibold text-foreground">{destinoConfig[tipoConfig[fTipo].destino].label}</span>
                    <span>· prazo SLA: {tipoConfig[fTipo].slaDias} dia{tipoConfig[fTipo].slaDias > 1 ? "s" : ""}</span>
                  </p>
                )}
              </div>

              {/* Assunto */}
              <div className="space-y-1.5">
                <Label className="text-xs">Assunto</Label>
                <Input
                  value={fAssunto}
                  onChange={e => setFAssunto(e.target.value)}
                  placeholder="Resumo curto do pedido"
                  maxLength={120}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={fDescricao}
                  onChange={e => setFDescricao(e.target.value)}
                  placeholder="Descreva o pedido com o máximo de detalhe possível."
                  className="min-h-[110px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setOpen(false); }}>Cancelar</Button>
              <Button onClick={submitNova} className="gap-1.5"><Send className="w-3.5 h-3.5" /> Submeter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = estado === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setEstado(t.key)}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-background transition-colors text-left",
                active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-semibold truncate", active ? "text-primary" : "text-foreground")}>{t.label}</span>
              </div>
              <span className={cn("text-base font-bold tabular-nums", active ? "text-primary" : "text-foreground")}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Procurar por assunto, motivo ou referência…"
            className="pl-9 h-9 text-sm"
          />
        </div>
        {(search || estado !== "todos") && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setEstado("todos"); }} className="gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> Limpar
          </Button>
        )}
      </div>

      {/* Lista */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {own.length === 0
                ? "Ainda não submeteu nenhuma solicitação."
                : "Nenhuma solicitação corresponde aos filtros."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(s => {
              const st = estadoSolicitacaoConfig[s.estado];
              const tipoCfg = tipoConfig[s.tipo];
              const catCfg = tipoCfg ? categoriaConfig[tipoCfg.categoria] : undefined;
              const destCfg = destinoConfig[s.destino];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/student/solicitacoes/${s.id}`)}
                  className="w-full text-left px-5 py-4 hover:bg-muted/40 transition-colors flex items-start gap-4"
                >
                  <span className={cn("w-2 h-2 rounded-full mt-2 shrink-0", estadoDot[s.estado])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{s.id}</span>
                      {catCfg && (
                        <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", catCfg.color)}>
                          {catCfg.label}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", destCfg.color)}>
                        {destCfg.label}
                      </Badge>
                    </div>
                    <p className="text-[14px] font-semibold text-foreground leading-snug truncate">{s.assunto}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                      {tipoCfg?.label ?? s.tipo}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] py-0 h-5 border", st.color)}>
                      {st.label}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{fmt(s.dataSubmissao)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-2 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
