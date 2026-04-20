import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, HelpCircle, User, X, Calendar as CalendarIcon, Building2,
  Inbox, Clock, CheckCircle2, AlertCircle, Send, AlertTriangle,
  Bell, FileText, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  solicitacoes, Solicitacao, EstadoSolicitacao, Destino, Categoria,
  estadoSolicitacaoConfig, prioridadeConfig, destinoConfig,
  tipoConfig, categoriaConfig,
} from "@/data/gapData";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function GapTickets() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoSolicitacao | "todos">("todos");
  const [destino, setDestino] = useState<Destino | "todos">("todos");
  const [categoria, setCategoria] = useState<string>("todas");
  const [mes, setMes] = useState<string>("todos");
  const [selected, setSelected] = useState<Solicitacao | null>(null);

  const counts = useMemo(() => ({
    todos: solicitacoes.length,
    recebida: solicitacoes.filter(t => t.estado === "recebida").length,
    encaminhada: solicitacoes.filter(t => t.estado === "encaminhada").length,
    em_execucao: solicitacoes.filter(t => t.estado === "em_execucao").length,
    concluida: solicitacoes.filter(t => t.estado === "concluida").length,
    rejeitada: solicitacoes.filter(t => t.estado === "rejeitada").length,
  }), []);


  const categoriasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    solicitacoes.forEach(s => {
      const cfg = tipoConfig[s.tipo];
      if (cfg) set.add(cfg.categoria);
    });
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return solicitacoes.filter(s => {
      if (estado !== "todos" && s.estado !== estado) return false;
      if (destino !== "todos" && s.destino !== destino) return false;
      if (categoria !== "todas") {
        const cfg = tipoConfig[s.tipo];
        if (!cfg || cfg.categoria !== categoria) return false;
      }
      if (mes !== "todos") {
        const m = new Date(s.dataSubmissao).getMonth();
        if (m !== parseInt(mes)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const tipoLabel = tipoConfig[s.tipo]?.label.toLowerCase() ?? "";
        return (
          s.estudante.toLowerCase().includes(q) ||
          s.assunto.toLowerCase().includes(q) ||
          s.matricula.includes(search) ||
          s.id.toLowerCase().includes(q) ||
          tipoLabel.includes(q)
        );
      }
      return true;
    });
  }, [search, estado, destino, categoria, mes]);

  const isActive = {
    estado: estado !== "todos",
    destino: destino !== "todos",
    categoria: categoria !== "todas",
    mes: mes !== "todos",
    search: search !== "",
  };
  const hasActiveControls = Object.values(isActive).some(Boolean);

  const resetAll = () => {
    setEstado("todos"); setDestino("todos"); setCategoria("todas"); setMes("todos"); setSearch("");
  };

  const estadoTabs: { key: EstadoSolicitacao | "todos"; label: string; icon: React.ElementType }[] = [
    { key: "todos", label: "Todas", icon: Inbox },
    { key: "recebida", label: "Recebidas", icon: AlertCircle },
    { key: "encaminhada", label: "Encaminhadas", icon: Send },
    { key: "em_execucao", label: "Em Execução", icon: Clock },
    { key: "concluida", label: "Concluídas", icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Solicitações</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pedidos submetidos pelos estudantes no Portal e encaminhados automaticamente ao departamento responsável. O GAP acompanha a execução.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span> de {counts.todos} pedidos
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.todos, icon: Inbox, tone: "text-foreground", iconBg: "bg-muted text-muted-foreground" },
          { label: "Recebidas", value: counts.recebida, icon: AlertCircle, tone: "text-foreground", iconBg: "bg-orange-50 text-orange-600" },
          { label: "Em Execução", value: counts.em_execucao, icon: Clock, tone: "text-foreground", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Concluídas", value: counts.concluida, icon: CheckCircle2, tone: "text-foreground", iconBg: "bg-emerald-50 text-emerald-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className={cn("text-2xl font-bold mt-1", k.tone)}>{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Control box */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* State tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border-b border-border">
          {estadoTabs.map(t => {
            const active = estado === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setEstado(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all",
                  active
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={cn(
                  "ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold tabular-nums",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 items-center p-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por estudante, tipo, matrícula, ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex-1" />

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className={cn("w-[160px] h-9 text-xs", isActive.categoria && "border-primary/50 bg-primary/5 text-primary")}>
              <Layers className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categoriasDisponiveis.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={destino} onValueChange={v => setDestino(v as Destino | "todos")}>
            <SelectTrigger className={cn("w-[150px] h-9 text-xs", isActive.destino && "border-primary/50 bg-primary/5 text-primary")}>
              <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os destinos</SelectItem>
              {(Object.keys(destinoConfig) as Destino[]).map(d => (
                <SelectItem key={d} value={d}>{destinoConfig[d].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className={cn("w-[140px] h-9 text-xs", isActive.mes && "border-primary/50 bg-primary/5 text-primary")}>
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {MESES.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-destructive gap-1" onClick={resetAll}>
              <X className="w-3.5 h-3.5" /> Limpar
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-3 -mt-1">
            {isActive.estado && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setEstado("todos")}>
                Estado: {estadoSolicitacaoConfig[estado as EstadoSolicitacao].label} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isActive.categoria && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setCategoria("todas")}>
                Categoria: {categoria} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isActive.destino && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setDestino("todos")}>
                Destino: {destinoConfig[destino as Destino].label} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isActive.mes && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setMes("todos")}>
                Mês: {MESES[parseInt(mes)]} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isActive.search && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-muted text-foreground border-border cursor-pointer hover:bg-muted/70" onClick={() => setSearch("")}>
                Pesquisa: "{search}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">ID Pedido</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tipo de pedido</th>
                <th className="text-center p-3 font-medium text-muted-foreground whitespace-nowrap">Data</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Destino</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const st = estadoSolicitacaoConfig[s.estado];
                const dest = destinoConfig[s.destino];
                const tipoLabel = tipoConfig[s.tipo]?.label ?? s.tipo;
                const tipoCat = tipoConfig[s.tipo]?.categoria ?? "—";
                const d = new Date(s.dataSubmissao);
                return (
                  <tr key={s.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelected(s)}>
                    <td className="p-3"><span className="text-[11px] font-mono text-muted-foreground">{s.id}</span></td>
                    <td className="p-3">
                      <p className="font-medium text-foreground leading-tight">{s.estudante}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.matricula} · {s.curso}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{s.faculdade}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] bg-muted/40 text-foreground border-border font-normal">{tipoCat}</Badge>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-foreground text-xs font-medium leading-tight line-clamp-2">{tipoLabel}</p>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground">{d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </td>
                    <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge></td>
                    <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma solicitação encontrada.</p>}
      </Card>

      {/* Detail dialog — tracking, no chat */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          {selected && (() => {
            const st = estadoSolicitacaoConfig[selected.estado];
            const pr = prioridadeConfig[selected.prioridade];
            const dest = destinoConfig[selected.destino];
            const tipoCfg = tipoConfig[selected.tipo];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{selected.id}</span>
                    <Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge>
                    <Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge>
                    <Badge variant="outline" className={cn("text-[10px]", pr.color)}>Prioridade: {pr.label}</Badge>
                  </div>
                  <DialogTitle className="text-lg leading-tight">{selected.assunto}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">{tipoCfg?.label ?? selected.tipo}{tipoCfg && <> · <span className="text-muted-foreground/80">{tipoCfg.categoria}</span></>}</p>
                </DialogHeader>

                {/* Estudante */}
                <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{selected.estudante}</span>
                    <span className="text-xs text-muted-foreground">· {selected.matricula}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selected.curso} · {selected.ano}º ano</p>
                </div>

                {/* Pedido */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Pedido
                  </Label>
                  <div className="rounded-lg border border-border p-3 text-sm text-foreground">
                    {selected.descricao}
                  </div>
                </div>

                {/* Encaminhamento */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground mb-0.5">Destino</p>
                    <p className="font-medium text-foreground">{dest.label}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground mb-0.5">Responsável</p>
                    <p className="font-medium text-foreground">{selected.responsavelDestino ?? "— a atribuir —"}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground mb-0.5">Data do pedido</p>
                    <p className="font-medium text-foreground">
                      {new Date(selected.dataSubmissao).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Histórico (audit timeline) */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Histórico de execução
                  </Label>
                  <div className="rounded-lg border border-border p-3 space-y-3">
                    {selected.historico.map((h, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          {i < selected.historico.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{h.accao}</p>
                            <span className="text-[10px] text-muted-foreground">{h.data}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{h.actor}</p>
                          {h.nota && <p className="text-xs text-foreground/80 mt-1 italic">"{h.nota}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acções GAP — monitor only */}
                <div className="space-y-2 pt-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Acções do GAP (monitorização)</Label>
                  <Textarea placeholder="Adicionar nota interna (visível apenas ao GAP)..." rows={2} className="resize-none text-sm" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> Guardar nota interna</Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Marcar como urgente</Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Bell className="w-3.5 h-3.5" /> Pedir actualização ao destino</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    O GAP não responde directamente ao estudante. A execução é da responsabilidade do departamento de destino.
                  </p>
                </div>

                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" size="sm">Fechar</Button></DialogClose>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
