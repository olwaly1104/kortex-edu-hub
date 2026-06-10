import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ClipboardList, Clock, CheckCircle, AlertCircle, X,
  CalendarDays, Wallet, Layers, TrendingUp, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { candidaturas, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";

type StatusFilter = "todas" | EstadoCandidatura | "hoje" | "pag_pendente";

export default function GapCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todas");

  // Sem candidaturas incompletas — qualquer estado "incompleto" é tratado como "pendente"
  const normalized = useMemo(
    () => candidaturas.map(c => (c.estado === "incompleto" ? { ...c, estado: "pendente" as const } : c)),
    [],
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const isToday = (iso: string) => iso.slice(0, 10) === todayKey;

  const filtered = useMemo(() => {
    return normalized
      .filter(c => {
        if (status === "hoje" && !isToday(c.dataSubmissao)) return false;
        if (status === "pag_pendente" && c.pagamento?.estado !== "pendente") return false;
        if (status !== "todas" && status !== "hoje" && status !== "pag_pendente" && c.estado !== status) return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return c.nome.toLowerCase().includes(s) || c.bi.includes(search) || c.cursoOpcao1.toLowerCase().includes(s);
      })
      .sort((a, b) => new Date(b.dataSubmissao).getTime() - new Date(a.dataSubmissao).getTime());
  }, [normalized, search, status]);

  const hojeList = normalized.filter(c => isToday(c.dataSubmissao));
  const pagPendentes = normalized.filter(c => c.pagamento?.estado === "pendente").length;
  const receita = normalized
    .filter(c => c.pagamento?.estado === "confirmado")
    .reduce((s, c) => s + (c.pagamento?.valor || 0), 0);
  const taxaAprov = (() => {
    const decididos = normalized.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length;
    const ap = normalized.filter(c => c.estado === "aprovado").length;
    return decididos > 0 ? Math.round((ap / decididos) * 100) : 0;
  })();

  const kpis = {
    hoje: hojeList.length,
    total: normalized.length,
    pendentes: normalized.filter(c => c.estado === "pendente").length,
    aprovados: normalized.filter(c => c.estado === "aprovado").length,
    reprovados: normalized.filter(c => c.estado === "reprovado").length,
  };

  // Top cursos (1ª opção)
  const cursoCount = new Map<string, number>();
  normalized.forEach(c => {
    cursoCount.set(c.cursoOpcao1, (cursoCount.get(c.cursoOpcao1) || 0) + 1);
  });
  const topCursos = [...cursoCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCurso = topCursos[0]?.[1] || 1;

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "hoje", label: `Hoje (${kpis.hoje})` },
    { key: "pendente", label: "Pendente" },
    { key: "aprovado", label: "Aprovado" },
    { key: "reprovado", label: "Reprovado" },
    { key: "pag_pendente", label: "Pag. por confirmar" },
  ];

  const formatKz = (n: number) =>
    new Intl.NumberFormat("pt-AO").format(n) + " Kz";

  const todayLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidaturas</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{todayLabel}</p>
        </div>
        <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5">
          <Wallet className="w-3 h-3" /> {formatKz(receita)} arrecadados
        </Badge>
      </div>

      {/* KPIs principais — Hoje em destaque */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 border-blue-200 bg-blue-50/40 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Hoje</p>
              <p className="text-2xl font-bold text-blue-800 mt-1 tabular-nums">{kpis.hoje}</p>
              <p className="text-[10px] text-blue-600/80 mt-0.5">submetidas</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-100 text-blue-700">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
        </Card>
        {[
          { label: "Total", value: kpis.total, icon: ClipboardList, iconBg: "bg-primary/10 text-primary" },
          { label: "Pendentes", value: kpis.pendentes, icon: Clock, iconBg: "bg-yellow-50 text-yellow-600" },
          { label: "Aprovados", value: kpis.aprovados, icon: CheckCircle, iconBg: "bg-green-50 text-green-600" },
          { label: "Reprovados", value: kpis.reprovados, icon: AlertCircle, iconBg: "bg-red-50 text-red-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Linha de insight: Hoje + Top cursos + Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Submissões de hoje */}
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Submetidas hoje</h3>
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{hojeList.length}</span>
          </div>
          {hojeList.length === 0 ? (
            <div className="px-4 py-8 text-center text-[11px] text-muted-foreground italic">
              Sem candidaturas submetidas hoje
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-56 overflow-y-auto">
              {hojeList.slice(0, 6).map(c => (
                <li
                  key={c.id}
                  onClick={() => navigate(`/gap/candidaturas/${c.id}`)}
                  className="px-4 py-2 flex items-center gap-2 text-xs hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <span className="font-medium text-foreground truncate flex-1">{c.nome}</span>
                  <Badge variant="outline" className="text-[9px]">{c.cursoOpcao1}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Top cursos */}
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Cursos mais procurados</h3>
          </div>
          <ul className="divide-y divide-border">
            {topCursos.map(([curso, n]) => (
              <li key={curso} className="px-4 py-2 flex items-center gap-3">
                <GraduationCap className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-foreground flex-1 truncate">{curso}</span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(n / maxCurso) * 100}%` }} />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Indicadores financeiros & aprovação */}
        <Card className="overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">Indicadores</h3>
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={() => setStatus("pag_pendente")}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors text-left"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">Pagamentos por confirmar</p>
                <p className="text-lg font-bold text-purple-800 tabular-nums leading-tight">{pagPendentes}</p>
              </div>
              <Wallet className="w-4 h-4 text-purple-600" />
            </button>
            <div className="flex items-center justify-between p-2.5 rounded-md border border-emerald-200 bg-emerald-50/50">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Taxa de aprovação</p>
                <p className="text-lg font-bold text-emerald-800 tabular-nums leading-tight">{taxaAprov}%</p>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50/50">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Receita confirmada</p>
                <p className="text-sm font-bold text-slate-800 tabular-nums leading-tight">{formatKz(receita)}</p>
              </div>
              <Wallet className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controlo */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar nome, BI ou curso…"
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
          <div className="flex items-center gap-1 flex-wrap">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  "px-2.5 h-8 text-[11px] font-medium rounded-md border transition-colors",
                  status === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {filtered.length} de {candidaturas.length}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma candidatura encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Candidato</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">1ª Opção</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Período</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Submissão</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Pagamento</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const hoje = isToday(c.dataSubmissao);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/gap/candidaturas/${c.id}`)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground leading-tight">{c.nome}</p>
                          {hoje && <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200">HOJE</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.bi}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-foreground leading-tight">{c.cursoOpcao1}</p>
                        {c.cursoOpcao2 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">2ª: {c.cursoOpcao2}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-foreground leading-tight">{c.periodo}</p>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <p className="text-xs text-foreground tabular-nums">
                          {new Date(c.dataSubmissao).toLocaleDateString("pt-AO")}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          c.pagamento?.estado === "confirmado"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200",
                        )}>
                          {c.pagamento?.estado === "confirmado" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={cn("border-0 text-[10px]", estadoColors[c.estado])}>
                          {estadoLabels[c.estado]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
