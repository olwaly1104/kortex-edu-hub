import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { coordTurmaTasks, coordTurmas } from "@/data/institutionData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, Search, Clock, CheckCircle, Users,
  Calendar, AlertCircle, ClipboardList, ArrowRight, ArrowUpDown, X,
  MapPin, HelpCircle,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

const statusStyle: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho", icon: Clock },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa", icon: Clock },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada", icon: CheckCircle },
};

const summaryTooltips: Record<string, string> = {
  "Activas": "Avaliações actualmente em curso e a receber submissões dos estudantes.",
  "Encerradas": "Avaliações já finalizadas com todas as notas atribuídas.",
  "Pendente": "Avaliações activas onde nem todos os estudantes submeteram.",
  "Taxa de Conclusão": "Percentagem de avaliações já encerradas sobre o total.",
};

function SummaryCard({ label, value, icon: Icon, iconBg, iconColor, valueClass }: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; iconColor: string; valueClass?: string;
}) {
  const tip = summaryTooltips[label];
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          {tip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                {tip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  );
}

type StatusFilter = "todas" | "publicada" | "encerrada";
type SortOption = "recente" | "antiga" | "nome-az" | "nome-za" | "nota-desc" | "nota-asc";

export default function CoordenadorAvaliacoes() {
  const navigate = useNavigate();
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recente");

  const years = [...new Set(coordTurmas.map(t => t.year))].sort();
  const turmasForYear = filterYear ? coordTurmas.filter(t => t.year === filterYear).sort((a, b) => a.name.localeCompare(b.name)) : [];

  const allEvals = coordTurmaTasks.filter(t => t.type === "exame");

  const scopedEvals = useMemo(() => {
    let evals = allEvals;
    if (filterTurma !== "all") {
      evals = evals.filter(t => t.turmaId === filterTurma);
    } else if (filterYear) {
      const yearTurmaIds = coordTurmas.filter(t => t.year === filterYear).map(t => t.id);
      evals = evals.filter(t => yearTurmaIds.includes(t.turmaId));
    }
    return evals;
  }, [filterYear, filterTurma, allEvals]);

  const activeCount = scopedEvals.filter(t => t.status === "publicada").length;
  const closedCount = scopedEvals.filter(t => t.status === "encerrada").length;
  const pendentes = scopedEvals.filter(t => t.status === "publicada" && t.submissions < t.totalStudents).length;

  const filtered = useMemo(() => {
    let result = scopedEvals
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.discipline.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => filterStatus === "todas" || t.status === filterStatus);

    result.sort((a, b) => {
      switch (sortBy) {
        case "recente": return b.dueDate.localeCompare(a.dueDate);
        case "antiga": return a.dueDate.localeCompare(b.dueDate);
        case "nome-az": return a.title.localeCompare(b.title);
        case "nome-za": return b.title.localeCompare(a.title);
        case "nota-asc": return (a.avgGrade ?? -1) - (b.avgGrade ?? -1);
        case "nota-desc": return (b.avgGrade ?? -1) - (a.avgGrade ?? -1);
        default: return 0;
      }
    });

    return result;
  }, [scopedEvals, filterStatus, searchTerm, sortBy]);

  const handleYearClick = (year: number) => {
    if (filterYear === year) {
      setFilterYear(null);
      setFilterTurma("all");
    } else {
      setFilterYear(year);
      setFilterTurma("all");
    }
  };

  const statusToggles: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "publicada", label: "Activa" },
    { key: "encerrada", label: "Encerrada" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-secondary" /> Avaliações do Curso
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral dos exames e testes do curso</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Activas" value={activeCount} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Encerradas" value={closedCount} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Pendente" value={pendentes} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={pendentes > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Taxa de Conclusão" value={scopedEvals.length > 0 ? `${Math.round(closedCount / scopedEvals.length * 100)}%` : "—"} icon={ClipboardList} iconBg="bg-accent/10" iconColor="text-accent" valueClass={scopedEvals.length > 0 && Math.round(closedCount / scopedEvals.length * 100) >= 50 ? "text-accent" : "text-muted-foreground"} />
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={!filterYear ? "default" : "outline"} onClick={() => { setFilterYear(null); setFilterTurma("all"); }} className="text-xs">
            Todos os Anos
          </Button>
          {years.map(y => (
            <Button key={y} size="sm" variant={filterYear === y ? "default" : "outline"} onClick={() => handleYearClick(y)} className="text-xs">
              {y}º Ano
            </Button>
          ))}
        </div>

        {filterYear && turmasForYear.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-primary/20">
            <Button size="sm" variant={filterTurma === "all" ? "secondary" : "ghost"} onClick={() => setFilterTurma("all")} className="text-xs">
              Ver Todas
            </Button>
            {turmasForYear.map(t => (
              <Button key={t.id} size="sm" variant={filterTurma === t.id ? "secondary" : "ghost"} onClick={() => setFilterTurma(t.id)} className="text-xs">
                {t.name}
              </Button>
            ))}
          </div>
        )}

        <div className="border-t border-border" />

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={() => setSearchTerm("")}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {statusToggles.map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">
                {s.label}
              </Button>
            ))}

            <div className="w-px h-6 bg-border" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {([
                  { key: "recente", label: "Mais recente" },
                  { key: "antiga", label: "Mais antiga" },
                  { key: "nome-az", label: "Nome A–Z" },
                  { key: "nome-za", label: "Nome Z–A" },
                  { key: "nota-desc", label: "Nota ↓" },
                  { key: "nota-asc", label: "Nota ↑" },
                ] as { key: SortOption; label: string }[]).map(o => (
                  <DropdownMenuItem key={o.key} onClick={() => setSortBy(o.key)} className={sortBy === o.key ? "bg-accent font-medium" : ""}>
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Evaluation list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma avaliação encontrada</p>
          </div>
        )}
        {filtered.map(task => {
          const turma = coordTurmas.find(t => t.id === task.turmaId);
          const sStyle = statusStyle[task.status] || statusStyle.rascunho;
          const StatusIcon = sStyle.icon;
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
          const notSubmitted = task.totalStudents - task.submissions;
          const notaAtribuidaPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
          const pendingCorrection = task.submissions - task.corrected;

          return (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              onClick={() => navigate(`/coordenador/avaliacoes/${task.id}`)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{task.discipline}</span>
                    {turma && <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{turma.name}</Badge>}
                    {turma && <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{turma.year}º Ano · Fac. de Arquitectura</Badge>}
                  </div>
                  <Badge className={`${sStyle.bg} gap-1 text-[10px] border-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {sStyle.label}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{task.title}</h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <span className="font-medium text-foreground">{task.dueDate}</span></span>
                  <span className="flex items-center gap-1.5">Peso: <span className="font-medium text-foreground">{task.weight}%</span></span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Presencial</span>
                  {task.status === "publicada" && notSubmitted > 0 && (
                    <span className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {notSubmitted} por submeter
                    </span>
                  )}
                  {task.avgGrade !== null && (
                    <span className="flex items-center gap-1.5">
                      Média: <span className={`font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</span>
                    </span>
                  )}
                </div>

                {task.status !== "rascunho" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" />Submetido</span>
                        <span className="font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
                      </div>
                      <Progress value={submissionPct} className="h-1.5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`flex items-center gap-1.5 ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}><CheckCircle className="w-3.5 h-3.5" />Nota Atribuída</span>
                        <span className={`font-semibold ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}>{task.corrected}/{task.submissions}{pendingCorrection > 0 ? ` · ${pendingCorrection} pendente` : ""}</span>
                      </div>
                      <Progress value={notaAtribuidaPct} className={`h-1.5 ${pendingCorrection > 0 ? "[&>div]:bg-destructive" : ""}`} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 group-hover:text-primary/60 transition-colors">
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
