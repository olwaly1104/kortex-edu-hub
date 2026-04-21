import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
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
  Bell, FileText, Layers, MessageSquare, Mail,
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
  const { toast } = useToast();
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

      {/* Detail dialog — editorial 2-column layout */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
          {selected && (() => {
            const st = estadoSolicitacaoConfig[selected.estado];
            const dest = destinoConfig[selected.destino];
            const tipoCfg = tipoConfig[selected.tipo];
            const dSub = new Date(selected.dataSubmissao);
            const dConc = selected.dataConclusao ? new Date(selected.dataConclusao) : null;
            const fmt = (d: Date) => d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" });
            const fmtT = (d: Date) => d.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
            const initials = selected.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");
            return (
              <div className="flex flex-col max-h-[90vh]">
                {/* Top bar — ID + categoria */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">{selected.id}</span>
                    {tipoCfg && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-[11px] font-medium text-muted-foreground">{tipoCfg.categoria}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title block */}
                <div className="px-6 pt-5 pb-5 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <DialogTitle className="text-xl font-semibold leading-tight tracking-tight text-foreground min-w-0 flex-1">
                      {tipoCfg?.label ?? selected.tipo}
                    </DialogTitle>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Estado</span>
                      <Badge variant="outline" className={cn("text-[11px] font-medium px-2.5 py-0.5", st.color)}>{st.label}</Badge>
                    </div>
                  </div>
                </div>

                {/* 2-column body */}
                <div className="flex-1 overflow-y-auto grid md:grid-cols-[280px_1fr] divide-x divide-border">
                  {/* LEFT — estudante + meta sidebar */}
                  <aside className="p-5 space-y-5 bg-muted/15">
                    {/* Estudante */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Estudante</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-xs ring-1 ring-primary/15">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground leading-tight">{selected.estudante}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{selected.matricula}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                          <MessageSquare className="w-3 h-3" /> Chat
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 flex-1">
                          <Mail className="w-3 h-3" /> Email
                        </Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ano</span>
                          <span className="text-[11px] font-medium text-foreground">{selected.ano}º</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Curso</span>
                          <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.curso}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculdade</span>
                          <span className="text-[11px] font-medium text-foreground text-right truncate max-w-[150px]">{selected.faculdade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes do Pedido */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-2">Detalhes do Pedido</p>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Submetido</span>
                          <span className="text-[11px] font-medium text-foreground tabular-nums">{fmt(dSub)} · {fmtT(dSub)}</span>
                        </div>
                        {tipoCfg && (
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
                            <Badge variant="outline" className={cn("text-[10px]", categoriaConfig[tipoCfg.categoria as Categoria]?.color)}>
                              {tipoCfg.categoria}
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Destino</span>
                          <Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsável</span>
                          {selected.responsavelDestino ? (
                            <button
                              type="button"
                              className="text-[11px] font-medium text-primary hover:underline text-right truncate max-w-[150px]"
                              onClick={() => toast({ title: "Perfil do responsável", description: "Abertura do perfil institucional em breve." })}
                            >
                              {selected.responsavelDestino.split(" · ")[0]}
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic text-right">a atribuir</span>
                          )}
                        </div>
                        {dConc ? (
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Concluído</span>
                            <span className="text-[11px] font-medium text-foreground tabular-nums">{fmt(dConc)} · {fmtT(dConc)}</span>
                          </div>
                        ) : (() => {
                          const sla = selected.slaDias ?? tipoCfg?.slaDias;
                          if (!sla) return null;
                          const base = new Date(selected.dataEncaminhamento ?? selected.dataSubmissao);
                          base.setDate(base.getDate() + sla);
                          return (
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Concluído</span>
                              <span className="text-[11px] font-medium text-muted-foreground tabular-nums italic">prev. {fmt(base)}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  </aside>

                  {/* RIGHT — descrição + histórico */}
                  <main className="p-6 space-y-6 min-w-0">
                    {/* Descrição */}
                    <section>
                      <div className="flex items-center gap-2 mb-2.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Descrição do pedido</h3>
                      </div>
                      <p className="text-sm text-foreground/85 leading-relaxed">{selected.descricao}</p>
                    </section>

                    <div className="border-t border-border" />

                    {/* Histórico — 2 bullet points: Submetida + (Aceite|Rejeitada|Executada) */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Histórico</h3>
                      </div>
                      {(() => {
                        const submetida = selected.historico.find(h => h.accao.toLowerCase().includes("submetida"));
                        const encaminhada = selected.historico.find(h => h.accao.toLowerCase().includes("encaminhada"));
                        const executada = selected.historico.find(h => {
                          const a = h.accao.toLowerCase();
                          return a.includes("concluída") || a.includes("concluida") || a.includes("executada");
                        });

                        type Step = { label: string; data?: string; actor?: string; nota?: string; aside?: string; tone: "submitted" | "accepted" | "rejected" | "executed" | "pending" };
                        const steps: Step[] = [];

                        // 1. Submetida (sempre existe)
                        steps.push({
                          label: "Solicitação submetida",
                          data: submetida?.data,
                          actor: submetida?.actor ?? "Portal do Estudante",
                          aside: encaminhada ? `${encaminhada.accao} · ${encaminhada.data}` : undefined,
                          tone: "submitted",
                        });

                        // 2. Aceite ou Rejeitada (ou pendente se ainda recebida)
                        if (selected.estado === "rejeitada") {
                          const rej = selected.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"));
                          steps.push({
                            label: "Solicitação rejeitada",
                            data: rej?.data,
                            actor: rej?.actor ?? selected.responsavelDestino,
                            nota: rej?.nota,
                            tone: "rejected",
                          });
                        } else if (selected.estado === "em_execucao" || selected.estado === "concluida") {
                          const aceite = selected.historico.find(h => {
                            const a = h.accao.toLowerCase();
                            return !a.includes("submetida") && !a.includes("encaminhada") && !a.includes("concluí") && !a.includes("conclui") && !a.includes("executada") && !a.includes("rejeit");
                          });
                          steps.push({
                            label: "Solicitação aceite",
                            data: aceite?.data,
                            actor: aceite?.actor ?? selected.responsavelDestino,
                            nota: aceite?.nota,
                            tone: "accepted",
                          });
                        } else {
                          steps.push({
                            label: "Aguarda aceitação",
                            actor: selected.responsavelDestino ?? dest.label,
                            tone: "pending",
                          });
                        }

                        // 3. Executada (sempre — placeholder se ainda não)
                        if (selected.estado === "concluida") {
                          steps.push({
                            label: "Executada",
                            data: executada?.data,
                            actor: executada?.actor ?? selected.responsavelDestino,
                            nota: executada?.nota,
                            tone: "executed",
                          });
                        } else if (selected.estado === "rejeitada") {
                          steps.push({
                            label: "—",
                            tone: "pending",
                          });
                        } else {
                          const estimativa = (() => {
                            const sla = selected.slaDias ?? tipoCfg?.slaDias;
                            if (!sla) return undefined;
                            const base = new Date(selected.dataEncaminhamento ?? selected.dataSubmissao);
                            base.setDate(base.getDate() + sla);
                            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
                            const diff = Math.ceil((base.getTime() - hoje.getTime()) / 86400000);
                            const dateStr = fmt(base);
                            const rel = diff < 0 ? `${Math.abs(diff)}d em atraso` : diff === 0 ? "hoje" : `em ${diff}d`;
                            return { dateStr, rel, overdue: diff < 0, sla };
                          })();
                          steps.push({
                            label: selected.estado === "em_execucao" ? "Em execução pelo destino" : "Aguarda execução",
                            actor: selected.responsavelDestino ?? dest.label,
                            aside: estimativa ? `Estimativa: ${estimativa.dateStr} · ${estimativa.rel}` : undefined,
                            tone: "pending",
                          });
                        }

                        const dotCls: Record<Step["tone"], string> = {
                          submitted: "bg-sky-500 ring-4 ring-sky-500/15",
                          accepted: "bg-amber-500 ring-4 ring-amber-500/15",
                          rejected: "bg-destructive ring-4 ring-destructive/15",
                          executed: "bg-emerald-500 ring-4 ring-emerald-500/15",
                          pending: "bg-background border-2 border-dashed border-border",
                        };

                        return (
                          <ol className="space-y-0">
                            {steps.map((s, i) => {
                              const isLast = i === steps.length - 1;
                              return (
                                <li key={i} className="flex gap-3 relative">
                                  <div className="flex flex-col items-center shrink-0 w-3">
                                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 z-10", dotCls[s.tone])} />
                                    {!isLast && <div className="w-px flex-1 bg-border" />}
                                  </div>
                                  <div className={cn("flex-1 min-w-0", !isLast && "pb-5")}>
                                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                                      {s.data && <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">{s.data}</span>}
                                    </div>
                                    {s.actor && <p className="text-[11px] text-muted-foreground mt-0.5">{s.actor}</p>}
                                    {s.aside && (
                                      <p className="mt-1.5 text-[11px] text-muted-foreground/90 italic">
                                        {s.aside}
                                      </p>
                                    )}
                                    {s.nota && (
                                      <p className="mt-2 text-xs text-foreground/75 leading-relaxed pl-3 border-l-2 border-border">
                                        {s.nota}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        );
                      })()}
                    </section>
                  </main>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground italic">O GAP monitoriza; a execução é do destino.</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => toast({ title: "Relatório do pedido", description: "Abertura do relatório detalhado em breve." })}
                    >
                      <FileText className="w-3.5 h-3.5" /> Ver Relatório
                    </Button>
                    <DialogClose asChild><Button variant="outline" size="sm">Fechar</Button></DialogClose>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
