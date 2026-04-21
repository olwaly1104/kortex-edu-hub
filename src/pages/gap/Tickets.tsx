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
  const [estado, setEstado] = useState<"todos" | "pendentes" | "em_execucao" | "executadas" | "rejeitadas">("todos");
  const [destino, setDestino] = useState<Destino | "todos">("todos");
  const [categoria, setCategoria] = useState<string>("todas");
  const [mes, setMes] = useState<string>("todos");
  const [selected, setSelected] = useState<Solicitacao | null>(null);

  const isPendente = (s: Solicitacao) => s.estado === "recebida";
  const isEmExecucao = (s: Solicitacao) => s.estado === "em_execucao";
  const isExecutada = (s: Solicitacao) => s.estado === "concluida";
  const isRejeitada = (s: Solicitacao) => s.estado === "rejeitada";

  const counts = useMemo(() => ({
    todos: solicitacoes.length,
    pendentes: solicitacoes.filter(isPendente).length,
    em_execucao: solicitacoes.filter(isEmExecucao).length,
    executadas: solicitacoes.filter(isExecutada).length,
    rejeitadas: solicitacoes.filter(isRejeitada).length,
    recebida: solicitacoes.filter(t => t.estado === "recebida").length,
    concluida: solicitacoes.filter(t => t.estado === "concluida").length,
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
      if (estado === "pendentes" && !isPendente(s)) return false;
      if (estado === "em_execucao" && !isEmExecucao(s)) return false;
      if (estado === "executadas" && !isExecutada(s)) return false;
      if (estado === "rejeitadas" && !isRejeitada(s)) return false;
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

  const estadoTabs: { key: "todos" | "pendentes" | "em_execucao" | "executadas" | "rejeitadas"; label: string; icon: React.ElementType }[] = [
    { key: "todos", label: "Todas", icon: Inbox },
    { key: "pendentes", label: "Pendentes", icon: AlertCircle },
    { key: "em_execucao", label: "Em Execução", icon: Clock },
    { key: "executadas", label: "Executadas", icon: CheckCircle2 },
    { key: "rejeitadas", label: "Rejeitadas", icon: X },
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
                      {tipoCat !== "—" ? (
                        <Badge variant="outline" className={cn("text-[10px] font-medium", categoriaConfig[tipoCat as Categoria]?.color)}>{tipoCat}</Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
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

      {/* Detail dialog — unified pedido card + separate histórico */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selected && (() => {
            const st = estadoSolicitacaoConfig[selected.estado];
            const dest = destinoConfig[selected.destino];
            const tipoCfg = tipoConfig[selected.tipo];
            const dSub = new Date(selected.dataSubmissao);
            const dConc = selected.dataConclusao ? new Date(selected.dataConclusao) : null;
            const fmtDate = (d: Date) => d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" });
            const fmtTime = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
            return (
              <>
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{selected.id}</span>
                    {tipoCfg && <Badge variant="outline" className={cn("text-[10px] font-medium", categoriaConfig[tipoCfg.categoria].color)}>{tipoCfg.categoria}</Badge>}
                    <Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge>
                  </div>
                  <DialogTitle className="text-lg leading-tight text-foreground">{tipoCfg?.label ?? selected.tipo}</DialogTitle>
                </div>

                <div className="p-6 space-y-5">
                  {/* Unified pedido box */}
                  <div className="rounded-xl border border-border overflow-hidden bg-card">
                    {/* Row 1: Estudante — primary accent */}
                    <div className="flex items-center gap-3 p-4 bg-primary/[0.04] border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{selected.estudante}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {selected.matricula} · {selected.ano}º ano · {selected.curso} · {selected.faculdade}
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Pedido — indigo accent */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3 h-3" />
                        </div>
                        <Label className="text-[10px] uppercase tracking-wider text-indigo-700 font-semibold">Pedido</Label>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">{selected.assunto}</p>
                      <p className="text-sm text-foreground/75 leading-relaxed mt-2">{selected.descricao}</p>
                    </div>

                    {/* Row 3: Submetido / Concluído — slate accent */}
                    <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-muted/20">
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5" />
                          </div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Submetido</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{fmtDate(dSub)}</p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">{fmtTime(dSub)}</p>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", dConc ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground")}>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </div>
                          <p className={cn("text-[10px] uppercase tracking-wider font-semibold", dConc ? "text-emerald-700" : "text-muted-foreground")}>Concluído</p>
                        </div>
                        {dConc ? (
                          <>
                            <p className="text-sm font-semibold text-foreground">{fmtDate(dConc)}</p>
                            <p className="text-[11px] text-muted-foreground tabular-nums">{fmtTime(dConc)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-muted-foreground">— em curso —</p>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Destino / Responsável */}
                    <div className="grid grid-cols-2 divide-x divide-border">
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Building2 className="w-2.5 h-2.5" />
                          </div>
                          <p className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">Destino</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                            <User className="w-2.5 h-2.5" />
                          </div>
                          <p className="text-[10px] uppercase tracking-wider text-pink-700 font-semibold">Responsável</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">{selected.responsavelDestino ?? "— a atribuir —"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Histórico — separate box */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-3 h-3" />
                      </div>
                      <Label className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Histórico da solicitação</Label>
                    </div>
                    <div className="rounded-xl border border-border p-4 bg-card">
                      {selected.historico.map((h, i) => {
                        const isLast = i === selected.historico.length - 1;
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 ring-2 ring-card", isLast ? "bg-primary" : "bg-muted-foreground/40")} />
                              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
                            </div>
                            <div className={cn("flex-1 min-w-0", !isLast && "pb-3")}>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <p className="text-sm font-medium text-foreground">{h.accao}</p>
                                <span className="text-[10px] text-muted-foreground tabular-nums">{h.data}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{h.actor}</p>
                              {h.nota && (
                                <div className="mt-1.5 text-xs text-foreground/80 bg-muted/30 rounded px-2.5 py-1.5 border-l-2 border-primary/40">
                                  {h.nota}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground italic mr-auto">O GAP monitoriza; a execução é do destino.</p>
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
