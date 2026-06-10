import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ReportsMenuButton from "@/components/ReportsMenuButton";
import {
  Search, X, Clock, Inbox, AlertCircle, GraduationCap, CalendarClock,
  Wallet, SlidersHorizontal, ChevronRight, ChevronLeft, Check,
  FileBarChart2, BarChart3, TrendingUp, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { candidaturas, estadoLabels, periodos, cursos, type EstadoCandidatura } from "@/data/admissoesData";
import { buildCronologia, etapaEstadoStyle, etapaEstadoLabel } from "./CandidaturaDetail";

const TODAY = "2025-01-15";

type EstadoFilter = "todos" | "hoje" | "pendentes" | "aprovados" | "reprovados";
type CursoFilter = string | "todos";
type PeriodoFilter = string | "todos";

const candidaturaReportCategories = [
  { id: "funil",     label: "Funil de Candidaturas",  description: "Submetidas, em entrevista, em exame e decididas no período.", icon: <BarChart3 className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Funil de Candidaturas" },
  { id: "aprov",     label: "Taxa de Aprovação",      description: "Aprovados vs reprovados por curso e período.",                 icon: <TrendingUp className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Aprovação" },
  { id: "geral",     label: "Relatório de Admissões", description: "Visão consolidada da actividade de admissões no mês.",         icon: <BookOpen className="w-4 h-4" />, type: "estudantes" as const, prefix: "Histórico do GAP — Admissões" },
];

const candidaturaReportData = candidaturas.map(c => ({
  id: c.id,
  name: c.nome,
  code: c.bi,
  turma: `${c.cursoOpcao1} · ${c.periodo}`,
  media: null,
  presenca: 0,
  tarefasFeitas: 0,
  tarefasTotal: 0,
}));

export default function GapCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("hoje");
  const [curso, setCurso] = useState<CursoFilter>("todos");
  const [periodo, setPeriodo] = useState<PeriodoFilter>("todos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterView, setFilterView] = useState<"root" | "estado" | "curso" | "periodo">("root");

  // Normaliza: 'incompleto' tratado como 'pendente'
  const normalized = useMemo(
    () => candidaturas.map(c => (c.estado === "incompleto" ? { ...c, estado: "pendente" as EstadoCandidatura } : c)),
    [],
  );

  const isHoje = (c: typeof normalized[number]) => c.dataSubmissao === TODAY;
  const isPendente = (c: typeof normalized[number]) => c.estado === "pendente";
  const isAprovado = (c: typeof normalized[number]) => c.estado === "aprovado";
  const isReprovado = (c: typeof normalized[number]) => c.estado === "reprovado";
  const isPagPendente = (c: typeof normalized[number]) => c.pagamento?.estado === "pendente";

  const counts = useMemo(() => ({
    todos: normalized.length,
    hoje: normalized.filter(isHoje).length,
    pendentes: normalized.filter(isPendente).length,
    aprovados: normalized.filter(isAprovado).length,
    reprovados: normalized.filter(isReprovado).length,
    pag_pendente: normalized.filter(isPagPendente).length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const filtered = useMemo(() => {
    return normalized.filter(c => {
      if (estado === "hoje" && !isHoje(c)) return false;
      if (estado === "pendentes" && !isPendente(c)) return false;
      if (estado === "aprovados" && !isAprovado(c)) return false;
      if (estado === "reprovados" && !isReprovado(c)) return false;
      if (estado === "pag_pendente" && !isPagPendente(c)) return false;
      if (curso !== "todos" && c.cursoOpcao1 !== curso) return false;
      if (periodo !== "todos" && c.periodo !== periodo) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.nome.toLowerCase().includes(q) ||
          c.bi.includes(search) ||
          c.cursoOpcao1.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.dataSubmissao).getTime() - new Date(a.dataSubmissao).getTime());
  }, [search, estado, curso, periodo, normalized]);

  const isActive = {
    estado: estado !== "todos" && estado !== "hoje",
    curso: curso !== "todos",
    periodo: periodo !== "todos",
    search: search !== "",
  };
  const hasActiveControls = Object.values(isActive).some(Boolean);
  const resetAll = () => { setEstado("todos"); setCurso("todos"); setPeriodo("todos"); setSearch(""); };

  const periodoOpts = [
    { v: "todos" as const, label: "Todas", count: counts.todos },
    { v: "pendentes" as const, label: "Pendentes", count: counts.pendentes },
    { v: "aprovados" as const, label: "Aprovados", count: counts.aprovados },
    { v: "reprovados" as const, label: "Reprovados", count: counts.reprovados },
    { v: "pag_pendente" as const, label: "Pag. por confirmar", count: counts.pag_pendente },
  ];

  const estadoLabel = (v: EstadoFilter) => ({
    todos: "Todos", hoje: "Hoje", pendentes: "Pendentes",
    aprovados: "Aprovados", reprovados: "Reprovados", pag_pendente: "Pag. por confirmar",
  })[v];

  const formatKz = (n: number) => new Intl.NumberFormat("pt-AO").format(n) + " Kz";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidaturas</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Candidaturas submetidas ao processo de admissão. O GAP acompanha entrevista, curso preparatório e exame até à decisão final.
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

        {/* Histórico de Admissões */}
        <Card className="p-4 hover:shadow-sm transition-shadow border-primary/30 bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-primary uppercase tracking-wider">Histórico de Admissões</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Relatórios mensais do funil de candidaturas e taxa de aprovação.
            </p>
            <div className="mt-2">
              <ReportsMenuButton categories={candidaturaReportCategories} data={candidaturaReportData} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
            <FileBarChart2 className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-3 space-y-2.5">
        {/* Line 1: Hoje pinned + period segment */}
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
              placeholder="Pesquisar candidato, BI, curso ou ID…"
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

          <Popover open={filterOpen} onOpenChange={(o) => { setFilterOpen(o); if (!o) setFilterView("root"); }}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 px-3 text-xs gap-1.5",
                  (isActive.estado || isActive.curso || isActive.periodo) && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
                {(isActive.estado || isActive.curso || isActive.periodo) && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded bg-primary/10 text-primary text-[10px] font-bold tabular-nums">
                    {[isActive.estado, isActive.curso, isActive.periodo].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                {filterView === "root" ? (
                  <span className="text-xs font-semibold text-foreground">Filtros</span>
                ) : (
                  <button onClick={() => setFilterView("root")} className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {filterView === "estado" && "Estado"}
                    {filterView === "curso" && "Cursos"}
                    {filterView === "periodo" && "Períodos"}
                  </button>
                )}
                {(isActive.estado || isActive.curso || isActive.periodo) && (
                  <button onClick={() => { setEstado("todos"); setCurso("todos"); setPeriodo("todos"); }} className="text-[10px] text-muted-foreground hover:text-foreground">
                    Limpar
                  </button>
                )}
              </div>

              {filterView === "root" && (
                <div className="p-1">
                  <FilterRootRow icon={<AlertCircle className="w-3.5 h-3.5" />} label="Estado" value={isActive.estado ? estadoLabel(estado) : null} onClick={() => setFilterView("estado")} />
                  <FilterRootRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Curso" value={curso === "todos" ? null : curso} onClick={() => setFilterView("curso")} />
                  <FilterRootRow icon={<CalendarClock className="w-3.5 h-3.5" />} label="Período" value={periodo === "todos" ? null : periodo} onClick={() => setFilterView("periodo")} />
                </div>
              )}

              {filterView === "estado" && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ver todos os estados</div>
                  {(["todos", "hoje", "pendentes", "aprovados", "reprovados", "pag_pendente"] as EstadoFilter[]).map(v => (
                    <FilterOptionRow key={v} label={estadoLabel(v)} selected={estado === v} onClick={() => { setEstado(v); setFilterView("root"); }} />
                  ))}
                </div>
              )}

              {filterView === "curso" && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <FilterOptionRow label="Todos os cursos" selected={curso === "todos"} onClick={() => { setCurso("todos"); setFilterView("root"); }} />
                  {cursos.map(c => (
                    <FilterOptionRow key={c} label={c} selected={curso === c} onClick={() => { setCurso(c); setFilterView("root"); }} />
                  ))}
                </div>
              )}

              {filterView === "periodo" && (
                <div className="p-1 max-h-72 overflow-y-auto">
                  <FilterOptionRow label="Todos os períodos" selected={periodo === "todos"} onClick={() => { setPeriodo("todos"); setFilterView("root"); }} />
                  {periodos.map(p => (
                    <FilterOptionRow key={p} label={p} selected={periodo === p} onClick={() => { setPeriodo(p); setFilterView("root"); }} />
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {hasActiveControls && (
            <Button variant="ghost" size="sm" onClick={resetAll} className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1">
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
                <th className="text-left p-3 font-medium text-muted-foreground">ID Candidato</th>
                <th className="text-center p-3 font-medium text-muted-foreground whitespace-nowrap">Data de Submissão</th>
                <th className="text-left p-3 font-medium text-muted-foreground">1ª Opção</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Etapa</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const d = new Date(c.dataSubmissao);
                const numCand = c.id.replace(/\D/g, "").padStart(4, "0");
                const anoCand = d.getFullYear();
                const displayId = `CAND-${anoCand}-${numCand}`;
                const cron = buildCronologia(c);
                // Current etapa = last entry where done, or first not-done
                const lastDoneIdx = cron.reduce((acc, h, i) => (h.done ? i : acc), -1);
                const currentIdx = lastDoneIdx < cron.length - 1 ? lastDoneIdx + 1 : lastDoneIdx;
                const etapa = cron[Math.max(0, currentIdx)];
                return (
                  <tr key={c.id}
                    onClick={() => navigate(`/gap/candidaturas/${c.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="p-3">
                      <p className="font-medium text-foreground text-sm leading-tight">{c.nome}</p>
                      <p className="text-[10px] font-mono text-primary tabular-nums mt-0.5">{displayId}</p>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground tabular-nums">
                        {d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{c.cursoOpcao1}</p>
                      {c.cursoOpcao2 && <p className="text-[11px] text-muted-foreground mt-0.5">2ª: {c.cursoOpcao2}</p>}
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-foreground">{etapa.accao}</span>
                      <span className={cn(
                        "ml-2 inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wide",
                        etapaEstadoStyle[etapa.estado],
                      )}>
                        {etapaEstadoLabel[etapa.estado]}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        c.estado === "aprovado" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        c.estado === "reprovado" && "bg-red-50 text-red-700 border-red-200",
                        c.estado === "pendente" && "bg-amber-50 text-amber-700 border-amber-200",
                      )}>
                        <span className="relative flex h-1.5 w-1.5">
                          {c.estado === "pendente" && <span className="absolute inset-0 rounded-full bg-amber-500 opacity-75 animate-ping" />}
                          <span className={cn(
                            "relative inline-flex h-1.5 w-1.5 rounded-full",
                            c.estado === "aprovado" && "bg-emerald-500",
                            c.estado === "reprovado" && "bg-destructive",
                            c.estado === "pendente" && "bg-amber-500",
                          )} />
                        </span>
                        {estadoLabels[c.estado]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma candidatura encontrada.</p>}
      </Card>
    </div>
  );
}

function FilterRootRow({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted text-left">
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

function FilterOptionRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted text-left", selected && "bg-primary/5")}>
      {selected ? <Check className="w-3 h-3 text-primary shrink-0" /> : <span className="w-3 shrink-0" />}
      <span className={cn("text-foreground", selected && "font-medium text-primary")}>{label}</span>
    </button>
  );
}
