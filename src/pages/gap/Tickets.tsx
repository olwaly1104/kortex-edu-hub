import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportsMenuButton from "@/components/ReportsMenuButton";
import { BarChart3, TrendingUp, BookOpen, FileBarChart2 } from "lucide-react";
import {
  Search, X, Calendar as CalendarIcon, Building2,
  Inbox, Clock, CheckCircle2, AlertCircle, Layers,
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

// Dataset sintético para alimentar o ReportsDialog (uma linha por estudante seguido)
const gapReportData = solicitacoes.reduce<Array<{ id: string; name: string; code: string; turma: string; media: number | null; presenca: number; tarefasFeitas: number; tarefasTotal: number }>>((acc, s) => {
  if (acc.find(r => r.id === s.matricula)) return acc;
  const total = solicitacoes.filter(x => x.matricula === s.matricula).length;
  const concl = solicitacoes.filter(x => x.matricula === s.matricula && x.estado === "concluida").length;
  acc.push({
    id: s.matricula,
    name: s.estudante,
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
  const [estado, setEstado] = useState<"todos" | "hoje" | "pendentes" | "em_execucao" | "executadas" | "rejeitadas">("todos");
  const [destino, setDestino] = useState<Destino | "todos">("todos");
  const [categoria, setCategoria] = useState<string>("todas");
  const [mes, setMes] = useState<string>("todos");

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
      if (estado === "hoje" && !isHoje(s)) return false;
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

  const periodoOpts = [
    { v: "todos", label: "Todas", count: counts.todos },
    { v: "pendentes", label: "Pendentes", count: counts.pendentes },
    { v: "em_execucao", label: "Em Execução", count: counts.em_execucao },
    { v: "executadas", label: "Executadas", count: counts.executadas },
    { v: "rejeitadas", label: "Rejeitadas", count: counts.rejeitadas },
  ] as const;

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
              placeholder="Pesquisar estudante, tipo, matrícula ou ID…"
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

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className={cn("w-[170px] h-9 text-xs", isActive.categoria && "border-primary text-primary")}>
              <Layers className="w-3 h-3 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categoriasDisponiveis.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={destino} onValueChange={v => setDestino(v as Destino | "todos")}>
            <SelectTrigger className={cn("w-[160px] h-9 text-xs", isActive.destino && "border-primary text-primary")}>
              <Building2 className="w-3 h-3 mr-1.5 shrink-0" />
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
            <SelectTrigger className={cn("w-[140px] h-9 text-xs", isActive.mes && "border-primary text-primary")}>
              <CalendarIcon className="w-3 h-3 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {MESES.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

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
                <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
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
                        {s.estudante}
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

