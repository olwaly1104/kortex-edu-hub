import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ReportsMenuButton from "@/components/ReportsMenuButton";
import { BarChart3, TrendingUp, BookOpen, FileBarChart2 } from "lucide-react";
import {
  Search, X, Calendar as CalendarIcon, Building2,
  Inbox, Clock, CheckCircle2, AlertCircle, Layers,
  SlidersHorizontal, ChevronRight, ChevronLeft, Check,
} from "lucide-react";

const TODAY = "2025-12-16";
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

// Categorias de relatórios do Histórico do GAP — geridos via ReportsMenuButton
const gapReportCategories = [
  { id: "solicitacoes", label: "Pipeline de Solicitações", description: "Recebidas, encaminhadas, executadas e rejeitadas no mês.", icon: <BarChart3 className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Pipeline de Solicitações" },
  { id: "sla",          label: "Cumprimento de SLA",       description: "Prazos cumpridos, em risco e ultrapassados por departamento.", icon: <TrendingUp className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Cumprimento de SLA" },
  { id: "geral",        label: "Relatório Geral do GAP",   description: "Visão consolidada da actividade do gabinete no mês.", icon: <BookOpen className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Relatório Geral" },
];

// Dataset sintético para alimentar o ReportsDialog (uma linha por discente seguido)
const gapReportData = solicitacoes.reduce<Array<{ id: string; name: string; code: string; turma: string; media: number | null; presenca: number; tarefasFeitas: number; tarefasTotal: number }>>((acc, s) => {
  if (acc.find(r => r.id === s.matricula)) return acc;
  const total = solicitacoes.filter(x => x.matricula === s.matricula).length;
  const concl = solicitacoes.filter(x => x.matricula === s.matricula && x.estado === "concluida").length;
  acc.push({
    id: s.matricula,
    name: s.discente,
    code: s.matricula,
    turma: `${s.curso} · ${s.ano}º`,
    media: null,
    presenca: 0,
    tarefasFeitas: concl,
    tarefasTotal: total,
  });
  return acc;
}, []);

export default function GapTickets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | "hoje" | "pendentes" | "em_execucao" | "executadas" | "rejeitadas" | "em_atraso">("todos");
  const [destino, setDestino] = useState<Destino | "todos">("todos");
  const [categoria, setCategoria] = useState<string>("todas");
  const [mes, setMes] = useState<string>("todos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterView, setFilterView] = useState<"root" | "destino" | "categoria" | "motivo">("root");
  const [drillCategoria, setDrillCategoria] = useState<string | null>(null);

  // Em Atraso — solicitação activa cujo prazo SLA já foi ultrapassado
  const todayDate = useMemo(() => { const d = new Date(TODAY); d.setHours(0, 0, 0, 0); return d; }, []);
  const isEmAtraso = (s: Solicitacao) => {
    if (s.estado === "concluida" || s.estado === "rejeitada") return false;
    const sla = s.slaDias ?? tipoConfig[s.tipo]?.slaDias;
    if (!sla) return false;
    const base = new Date(s.dataEncaminhamento ?? s.dataSubmissao);
    base.setDate(base.getDate() + sla);
    return base.getTime() < todayDate.getTime();
  };
  const isPendente = (s: Solicitacao) => s.estado === "recebida";
  const isEmExecucao = (s: Solicitacao) => s.estado === "em_execucao";
  const isExecutada = (s: Solicitacao) => s.estado === "concluida";
  const isRejeitada = (s: Solicitacao) => s.estado === "rejeitada";
  const isHoje = (s: Solicitacao) => s.dataSubmissao === TODAY;

  const counts = useMemo(() => ({
    todos: solicitacoes.length,
    hoje: solicitacoes.filter(isHoje).length,
    pendentes: solicitacoes.filter(isPendente).length,
    em_execucao: solicitacoes.filter(isEmExecucao).length,
    executadas: solicitacoes.filter(isExecutada).length,
    rejeitadas: solicitacoes.filter(isRejeitada).length,
    em_atraso: solicitacoes.filter(isEmAtraso).length,
    recebida: solicitacoes.filter(t => t.estado === "recebida").length,
    concluida: solicitacoes.filter(t => t.estado === "concluida").length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (estado === "hoje" && !isHoje(s)) return false;
      if (estado === "pendentes" && !isPendente(s)) return false;
      if (estado === "em_execucao" && !isEmExecucao(s)) return false;
      if (estado === "executadas" && !isExecutada(s)) return false;
      if (estado === "rejeitadas" && !isRejeitada(s)) return false;
      if (estado === "em_atraso" && !isEmAtraso(s)) return false;
      if (destino !== "todos" && s.destino !== destino) return false;
      if (categoria !== "todas") {
        const cfg = tipoConfig[s.tipo];
        if (!cfg || cfg.categoria !== categoria) return false;
      }
      if (mes !== "todos" && s.tipo !== mes) return false;
      if (search) {
        const q = search.toLowerCase();
        const tipoLabel = tipoConfig[s.tipo]?.label.toLowerCase() ?? "";
        return (
          s.discente.toLowerCase().includes(q) ||
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

  const periodoOpts = [
    { v: "todos", label: "Todas", count: counts.todos },
    { v: "pendentes", label: "Pendentes", count: counts.pendentes },
    { v: "em_execucao", label: "Em Execução", count: counts.em_execucao },
    { v: "executadas", label: "Executadas", count: counts.executadas },
    { v: "rejeitadas", label: "Rejeitadas", count: counts.rejeitadas },
    { v: "em_atraso", label: "Em Atraso", count: counts.em_atraso },
  ] as const;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Solicitações</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pedidos submetidos pelos discentes no Portal e encaminhados automaticamente ao departamento responsável. O GAP acompanha a execução.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.todos, icon: Inbox, iconBg: "bg-muted text-muted-foreground" },
          { label: "Hoje", value: counts.hoje, icon: Clock, iconBg: "bg-primary/10 text-primary" },
          { label: "Pendentes", value: counts.pendentes, icon: AlertCircle, iconBg: "bg-orange-50 text-orange-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground tabular-nums">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}

        {/* Histórico do GAP */}
        <Card className="p-4 hover:shadow-sm transition-shadow border-primary/30 bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-primary uppercase tracking-wider">Histórico do GAP</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Relatórios mensais de solicitações, encaminhamentos e SLA.
            </p>
            <div className="mt-2">
              <ReportsMenuButton categories={gapReportCategories} data={gapReportData} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
            <FileBarChart2 className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Controls — Agendamentos-style */}
      <Card className="p-3 space-y-2.5">
        {/* Line 1: Hoje (pinned) + period segment */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEstado("hoje")}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md border transition-colors",
                estado === "hoje"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:border-primary hover:text-primary"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Hoje
              <span className={cn(
                "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-bold tabular-nums",
                estado === "hoje" ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
              )}>{counts.hoje}</span>
            </button>

            <div className="h-6 w-px bg-border" />

            <div className="inline-flex items-center rounded-md border border-input bg-background overflow-hidden">
              {periodoOpts.map((opt, i) => (
                <button
                  key={opt.v}
                  onClick={() => setEstado(opt.v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium transition-colors",
                    i > 0 && "border-l border-input",
                    estado === opt.v
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {opt.label}
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 rounded text-[10px] font-semibold tabular-nums",
                    estado === opt.v ? "bg-primary/10 text-primary" : "bg-muted-foreground/15 text-muted-foreground"
                  )}>{opt.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Line 2: Search + filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar discente, tipo, matrícula ou ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <Popover
            open={filterOpen}
            onOpenChange={(o) => {
              setFilterOpen(o);
              if (!o) { setFilterView("root"); setDrillCategoria(null); }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 px-3 text-xs gap-1.5",
                  (isActive.destino || isActive.categoria || isActive.mes) && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
                {(isActive.destino || isActive.categoria || isActive.mes) && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded bg-primary/10 text-primary text-[10px] font-bold tabular-nums">
                    {[isActive.destino, isActive.categoria, isActive.mes].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b">
                {filterView === "root" ? (
                  <span className="text-xs font-semibold text-foreground">Filtros</span>
                ) : (
                  <button
                    onClick={() => {
                      if (filterView === "motivo") { setFilterView("categoria"); setDrillCategoria(null); }
                      else setFilterView("root");
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {filterView === "destino" && "Destinos"}
                    {filterView === "categoria" && "Categorias"}
                    {filterView === "motivo" && (drillCategoria ?? "Motivos")}
                  </button>
                )}
                {(isActive.destino || isActive.categoria || isActive.mes) && (
                  <button
                    onClick={() => { setDestino("todos"); setCategoria("todas"); setMes("todos"); }}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Root */}
              {filterView === "root" && (
                <div className="p-1">
                  <FilterRootRow
                    icon={<AlertCircle className="w-3.5 h-3.5" />}
                    label="Estado"
                    value={estado === "todos" ? null : (
                      estado === "hoje" ? "Hoje" :
                      estado === "pendentes" ? "Pendentes" :
                      estado === "em_execucao" ? "Em Execução" :
                      estado === "executadas" ? "Executadas" :
                      estado === "rejeitadas" ? "Rejeitadas" :
                      estado === "em_atraso" ? "Em Atraso" : null
                    )}
                    onClick={() => setFilterView("estado")}
                  />
                  <FilterRootRow
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    label="Destino"
                    value={destino === "todos" ? null : destinoConfig[destino as Destino]?.label}
                    onClick={() => setFilterView("destino")}
                  />
                  <FilterRootRow
                    icon={<Layers className="w-3.5 h-3.5" />}
                    label="Categoria"
                    value={categoria === "todas" ? null : categoria}
                    onClick={() => setFilterView("categoria")}
                  />
                  <FilterRootRow
                    icon={<Layers className="w-3.5 h-3.5" />}
                    label="Motivo"
                    value={mes === "todos" ? null : tipoConfig[mes as keyof typeof tipoConfig]?.label}
                    onClick={() => setFilterView("categoria")}
                  />
                </div>
              )}

              {/* Destino list */}
              {filterView === "destino" && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <FilterOptionRow
                    label="Todos os destinos"
                    selected={destino === "todos"}
                    onClick={() => { setDestino("todos"); setFilterView("root"); }}
                  />
                  {(Object.keys(destinoConfig) as Destino[]).map(d => (
                    <FilterOptionRow
                      key={d}
                      label={destinoConfig[d].label}
                      selected={destino === d}
                      onClick={() => { setDestino(d); setFilterView("root"); }}
                    />
                  ))}
                </div>
              )}

              {/* Categoria list (drill into motivos) */}
              {filterView === "categoria" && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <FilterOptionRow
                    label="Todas as categorias"
                    selected={categoria === "todas" && mes === "todos"}
                    onClick={() => { setCategoria("todas"); setMes("todos"); setFilterView("root"); }}
                  />
                  {categoriasDisponiveis.map(c => (
                    <button
                      key={c}
                      onClick={() => { setDrillCategoria(c); setFilterView("motivo"); }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted text-left",
                        categoria === c && "bg-primary/5"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {categoria === c ? <Check className="w-3 h-3 text-primary" /> : <span className="w-3" />}
                        <span className="font-medium text-foreground">{c}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Motivos da categoria seleccionada */}
              {filterView === "motivo" && drillCategoria && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <FilterOptionRow
                    label={`Todos de ${drillCategoria}`}
                    selected={categoria === drillCategoria && mes === "todos"}
                    onClick={() => {
                      setCategoria(drillCategoria);
                      setMes("todos");
                      setFilterView("root");
                    }}
                  />
                  {Object.keys(tipoConfig)
                    .filter(t => tipoConfig[t as keyof typeof tipoConfig].categoria === drillCategoria)
                    .map(t => (
                      <FilterOptionRow
                        key={t}
                        label={tipoConfig[t as keyof typeof tipoConfig].label}
                        selected={mes === t}
                        onClick={() => {
                          setCategoria(drillCategoria);
                          setMes(t);
                          setFilterView("root");
                        }}
                      />
                    ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {hasActiveControls && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {filtered.length} de {counts.todos}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">ID Pedido</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Discente</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tipo de pedido</th>
                <th className="text-center p-3 font-medium text-muted-foreground whitespace-nowrap">Data</th>
                <th className="text-center p-3 font-medium text-muted-foreground whitespace-nowrap">Hora</th>
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
                const horaSubmissao = s.historico[0]?.data.split(" ")[1] ?? "—";
                return (
                  <tr key={s.id}
                    onClick={() => navigate(`/gap/solicitacoes/${s.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="p-3">
                      <span className="text-[10px] font-mono text-primary tabular-nums">
                        {s.id.replace(/^SOL-?/i, "#")}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/gap/estudantes/${s.matricula}`); }}
                        className="font-medium text-foreground leading-tight hover:text-primary hover:underline text-left"
                      >
                        {s.discente}
                      </button>
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
                    <td className="p-3 text-center whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground tabular-nums">{horaSubmissao}</p>
                    </td>
                    <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", dest.color)}>{dest.label}</Badge></td>
                    <td className="p-3 text-center">
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

function FilterRootRow({
  icon, label, value, onClick,
}: { icon: React.ReactNode; label: string; value: string | null | undefined; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted text-left"
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <span className="font-medium text-foreground">{label}</span>
      </span>
      <span className="flex items-center gap-1 text-muted-foreground shrink-0">
        {value && <span className="text-[10px] text-primary font-medium truncate max-w-[110px]">{value}</span>}
        <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

function FilterOptionRow({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted text-left",
        selected && "bg-primary/5"
      )}
    >
      {selected ? <Check className="w-3 h-3 text-primary shrink-0" /> : <span className="w-3 shrink-0" />}
      <span className={cn("text-foreground", selected && "font-medium text-primary")}>{label}</span>
    </button>
  );
}

