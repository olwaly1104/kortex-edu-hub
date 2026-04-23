import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, X, Calendar as CalendarIcon, Building2,
  Inbox, Clock, CheckCircle2, AlertCircle, Layers,
  Timer, CircleSlash, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  solicitacoes, Solicitacao, EstadoSolicitacao, Destino, Categoria,
  estadoSolicitacaoConfig, destinoConfig,
  tipoConfig, categoriaConfig,
} from "@/data/gapData";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function GapTickets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | "pendentes" | "em_execucao" | "executadas" | "rejeitadas">("todos");
  const [destino, setDestino] = useState<Destino | "todos">("todos");
  const [categoria, setCategoria] = useState<string>("todas");
  const [mes, setMes] = useState<string>("todos");

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

      {/* Table — state-aware data display */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Pedido</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Estudante</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Encaminhamento</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Progresso</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">SLA</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">Estado</th>
                <th className="w-8 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const st = estadoSolicitacaoConfig[s.estado];
                const dest = destinoConfig[s.destino];
                const tipoLabel = tipoConfig[s.tipo]?.label ?? s.tipo;
                const tipoCat = tipoConfig[s.tipo]?.categoria ?? null;
                const initials = s.estudante.split(" ").slice(0, 2).map(n => n[0]).join("");
                const respShort = s.responsavelDestino?.split(" · ")[0];
                const respInitials = respShort?.split(" ").slice(-2).map(n => n[0]).join("") ?? "?";

                // Progress: last meaningful action from history
                const ultimaAccao = s.historico
                  .slice()
                  .reverse()
                  .find(h => !h.accao.toLowerCase().includes("encaminhada"));

                // SLA computation
                const sla = s.slaDias;
                const dataBase = new Date(s.dataEncaminhamento ?? s.dataSubmissao);
                const dataLimite = new Date(dataBase);
                dataLimite.setDate(dataLimite.getDate() + sla);
                const TODAY = new Date("2025-12-16"); TODAY.setHours(0,0,0,0);
                const diasRestantes = Math.ceil((dataLimite.getTime() - TODAY.getTime()) / 86400000);

                // Resolution time for completed
                const dResol = s.dataConclusao ? Math.ceil(
                  (new Date(s.dataConclusao).getTime() - new Date(s.dataSubmissao).getTime()) / 86400000
                ) : null;

                // Time since submission (hours/days)
                const horasDesdeSubmissao = Math.floor(
                  (TODAY.getTime() - new Date(s.dataSubmissao).getTime()) / 3600000
                );
                const tempoSub = horasDesdeSubmissao < 24
                  ? `há ${Math.max(1, horasDesdeSubmissao)}h`
                  : `há ${Math.floor(horasDesdeSubmissao / 24)}d`;

                // Rejection reason
                const rejecao = s.estado === "rejeitada"
                  ? s.historico.slice().reverse().find(h => h.accao.toLowerCase().includes("rejeit"))
                  : null;

                return (
                  <tr key={s.id}
                    onClick={() => navigate(`/gap/solicitacoes/${s.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">

                    {/* PEDIDO — id + categoria + tipo */}
                    <td className="p-3 align-top max-w-[280px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono text-primary tabular-nums font-semibold">
                          {s.id.replace(/^SOL-?/i, "#")}
                        </span>
                        {tipoCat && (
                          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-medium", categoriaConfig[tipoCat as Categoria]?.color)}>
                            {tipoCat}
                          </Badge>
                        )}
                        {s.prioridade === "alta" && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold bg-destructive/10 text-destructive border-destructive/20">
                            ALTA
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{tipoLabel}</p>
                    </td>

                    {/* ESTUDANTE — avatar + name + curso */}
                    <td className="p-3 align-top">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-semibold ring-1 ring-primary/15">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${s.matricula}`); }}
                            className="text-xs font-semibold text-foreground leading-tight hover:text-primary hover:underline text-left block truncate max-w-[180px]"
                          >
                            {s.estudante}
                          </button>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                            {s.matricula} · {s.ano}º · {s.curso}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ENCAMINHAMENTO — destino + responsável */}
                    <td className="p-3 align-top">
                      <Badge variant="outline" className={cn("text-[10px] font-medium", dest.color)}>{dest.label}</Badge>
                      {respShort ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-semibold ring-1 ring-border">
                            {respInitials}
                          </div>
                          <span className="text-[11px] text-foreground/80 truncate max-w-[140px]">{respShort}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic mt-1.5">a atribuir</p>
                      )}
                    </td>

                    {/* PROGRESSO — state-aware */}
                    <td className="p-3 align-top max-w-[260px]">
                      {s.estado === "recebida" && (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                            <Inbox className="w-3 h-3" /> Aguarda aceitação
                          </p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">Submetida {tempoSub}</p>
                        </div>
                      )}
                      {s.estado === "em_execucao" && ultimaAccao && (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-foreground/85 leading-tight line-clamp-1">
                            {ultimaAccao.accao}
                          </p>
                          {ultimaAccao.nota && (
                            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 italic">
                              {ultimaAccao.nota}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground tabular-nums">{ultimaAccao.data}</p>
                        </div>
                      )}
                      {s.estado === "concluida" && (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolvida em {dResol}d
                          </p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">
                            {s.dataConclusao && new Date(s.dataConclusao).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      )}
                      {s.estado === "rejeitada" && (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                            <CircleSlash className="w-3 h-3" /> Rejeitada
                          </p>
                          {rejecao?.nota && (
                            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 italic">
                              {rejecao.nota}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* SLA — smart countdown */}
                    <td className="p-3 text-center align-top">
                      {s.estado === "concluida" ? (
                        <div className="inline-flex flex-col items-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] text-emerald-700 font-medium mt-0.5">cumprido</span>
                        </div>
                      ) : s.estado === "rejeitada" ? (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      ) : (
                        <div className={cn(
                          "inline-flex flex-col items-center px-2 py-1 rounded-md border tabular-nums",
                          diasRestantes < 0 && "bg-destructive/10 border-destructive/30 text-destructive",
                          diasRestantes === 0 && "bg-amber-50 border-amber-300 text-amber-700",
                          diasRestantes > 0 && diasRestantes <= 2 && "bg-amber-50 border-amber-200 text-amber-700",
                          diasRestantes > 2 && "bg-muted/50 border-border text-muted-foreground",
                        )}>
                          <Timer className="w-3 h-3 mb-0.5" />
                          <span className="text-[11px] font-bold leading-none">
                            {diasRestantes < 0 ? `+${Math.abs(diasRestantes)}d` : diasRestantes === 0 ? "hoje" : `${diasRestantes}d`}
                          </span>
                          <span className="text-[9px] mt-0.5 leading-none">
                            {diasRestantes < 0 ? "atraso" : diasRestantes === 0 ? "limite" : "restantes"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* ESTADO */}
                    <td className="p-3 text-center align-top">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold", st.color)}>
                        <span className="relative flex h-1.5 w-1.5">
                          {s.estado === "em_execucao" && <span className="absolute inset-0 rounded-full bg-sky-500 opacity-75 animate-ping" />}
                          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full",
                            s.estado === "em_execucao" && "bg-sky-500",
                            s.estado === "recebida" && "bg-amber-500",
                            s.estado === "concluida" && "bg-emerald-500",
                            s.estado === "rejeitada" && "bg-destructive",
                          )} />
                        </span>
                        {st.label}
                      </span>
                    </td>

                    <td className="p-3 align-top">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma solicitação encontrada.</p>}
      </Card>
    </div>
  );
}

