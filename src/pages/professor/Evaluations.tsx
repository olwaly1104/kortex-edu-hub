import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  GraduationCap, Plus, Search, Clock, CheckCircle, Users, Send,
  FolderKanban, Calendar, AlertCircle, BarChart3, MapPin, ArrowRight, ClipboardList,
  ArrowUpDown, SlidersHorizontal, X, FileCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeLabel: Record<string, string> = { quiz: "Quiz", exame: "Exame" };
const typeIcon: Record<string, React.ElementType> = { quiz: FolderKanban, exame: GraduationCap };
const statusStyle: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho", icon: Clock },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa", icon: Clock },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada", icon: CheckCircle },
};

function SummaryCard({ label, value, icon: Icon, iconBg, iconColor, valueClass }: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; iconColor: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  );
}

type SortKey = "dueDate" | "weight" | "submissions" | "avgGrade";
type SortDir = "asc" | "desc";
type FilterStatus = "publicada" | "encerrada" | "rascunho";

export default function ProfessorEvaluations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatuses, setFilterStatuses] = useState<FilterStatus[]>([]);

  const [formDisc, setFormDisc] = useState(profDisciplines[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<"quiz" | "exame">("exame");
  const [formDue, setFormDue] = useState("");
  const [formWeight, setFormWeight] = useState("25");

  const allEvals = profTasks.filter(t => t.type === "exame");

  const scopedEvals = useMemo(() => {
    return filterTurma === "all" ? allEvals : allEvals.filter(t => t.turmaId === filterTurma);
  }, [filterTurma, allEvals]);

  const activeCount = scopedEvals.filter(t => t.status === "publicada").length;
  const closedCount = scopedEvals.filter(t => t.status === "encerrada").length;
  const porAtribuir = activeCount;
  const totalSub = scopedEvals.reduce((s, t) => s + t.submissions, 0);
  const totalExp = scopedEvals.filter(t => t.status !== "rascunho").reduce((s, t) => s + t.totalStudents, 0);
  const deliveryRate = totalExp > 0 ? Math.round(totalSub / totalExp * 100) : 0;
  const graded = scopedEvals.filter(t => t.avgGrade !== null);
  const avgGrade = graded.length > 0 ? (graded.reduce((s, t) => s + (t.avgGrade || 0), 0) / graded.length).toFixed(1) : null;
  const approvedEvals = graded.filter(t => (t.avgGrade || 0) >= 10).length;
  const taxaAprovacao = graded.length > 0 ? Math.round(approvedEvals / graded.length * 100) : 0;

  const filtered = useMemo(() => {
    let result = scopedEvals
      .filter(t => filterStatuses.length === 0 || filterStatuses.includes(t.status as FilterStatus))
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va: number, vb: number;
        if (sortKey === "weight") { va = a.weight; vb = b.weight; }
        else if (sortKey === "submissions") { va = a.totalStudents > 0 ? a.submissions / a.totalStudents : 0; vb = b.totalStudents > 0 ? b.submissions / b.totalStudents : 0; }
        else if (sortKey === "avgGrade") { va = a.avgGrade ?? -1; vb = b.avgGrade ?? -1; }
        else { va = 0; vb = 0; }
        return sortDir === "desc" ? vb - va : va - vb;
      });
    }
    return result;
  }, [scopedEvals, filterStatuses, searchTerm, sortKey, sortDir]);

  const toggleFilterStatus = (s: FilterStatus) => {
    setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const hasActiveFilters = filterStatuses.length > 0 || sortKey !== null || searchTerm !== "";
  const clearFilters = () => { setFilterStatuses([]); setSortKey(null); setSearchTerm(""); };

  const handleSubmit = () => {
    if (!formTitle || !formDesc || !formDue) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, descrição e data limite.", variant: "destructive" });
      return;
    }
    toast({ title: "Avaliação criada!", description: `"${formTitle}" foi publicada.` });
    setShowForm(false);
    setFormTitle(""); setFormDesc(""); setFormDue("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-secondary" /> Avaliações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir quizzes e exames das suas cadeiras</p>
        </div>
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> {showForm ? "Cancelar" : "Nova Avaliação"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-primary/20 space-y-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Nova Avaliação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeira *</label>
              <select value={formDisc} onChange={e => setFormDisc(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {profDisciplines.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título *</label>
            <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Teste 1 - Limites e Derivadas" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição *</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descreva a avaliação..." className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data *</label>
              <Input type="date" value={formDue} onChange={e => setFormDue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Peso (%)</label>
              <Input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} min="0" max="100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" /> Publicar</Button>
          </div>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Activas" value={activeCount} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Por Atribuir" value={porAtribuir} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={porAtribuir > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Encerradas" value={closedCount} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Nota Geral" value={avgGrade ?? "—"} icon={GraduationCap} iconBg="bg-accent/10" iconColor="text-accent" valueClass={avgGrade && Number(avgGrade) >= 10 ? "text-accent" : avgGrade ? "text-destructive" : "text-muted-foreground"} />
        <SummaryCard label="Taxa Aprovação" value={`${taxaAprovacao}%`} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" valueClass={taxaAprovacao >= 50 ? "text-accent" : "text-destructive"} />
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Turma toggle */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterTurma === "all" ? "default" : "outline"} onClick={() => setFilterTurma("all")} className="text-xs">
            Todas as Turmas
          </Button>
          {allTurmas.map(t => (
            <Button key={t.id} size="sm" variant={filterTurma === t.id ? "default" : "outline"} onClick={() => setFilterTurma(t.id)} className="text-xs">
              {t.name}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + Sort + Filter row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9" />
          </div>

          <div className="flex-1" />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={clearFilters}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${sortKey ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1">Campo</p>
              {[
                { key: null, label: "Todos" },
                { key: "weight" as SortKey, label: "Peso" },
                { key: "submissions" as SortKey, label: "Taxa Entrega" },
                { key: "avgGrade" as SortKey, label: "Média" },
              ].map(opt => (
                <button key={String(opt.key)} onClick={() => setSortKey(opt.key)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortKey === opt.key ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{opt.label}</button>
              ))}
              <div className="border-t border-border my-1" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Direção</p>
              <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
              <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && sortKey ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${filterStatuses.length > 0 ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 space-y-0.5" align="end" side="top">
              {([
                { key: "publicada" as FilterStatus, label: "Activa" },
                { key: "encerrada" as FilterStatus, label: "Encerrada" },
                { key: "rascunho" as FilterStatus, label: "Rascunho" },
              ]).map(s => (
                <button key={s.key} onClick={() => toggleFilterStatus(s.key)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${filterStatuses.includes(s.key) ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>{s.label}</button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Active tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sortKey && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortKey(null); setSortDir("desc"); }}>
                {sortKey === "weight" ? "Peso" : sortKey === "submissions" ? "Entrega" : "Média"}: {sortDir === "desc" ? "Maior" : "Menor"}
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {filterStatuses.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => toggleFilterStatus(s)}>
                Estado: {s === "publicada" ? "Activa" : s === "encerrada" ? "Encerrada" : "Rascunho"}
                <X className="w-2.5 h-2.5" />
              </Badge>
            ))}
            {searchTerm && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearchTerm("")}>
                Pesquisa: "{searchTerm}"
                <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
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
          const disc = profDisciplines.find(d => d.id === task.disciplineId);
          const turma = allTurmas.find(t => t.id === task.turmaId);
          const sStyle = statusStyle[task.status];
          const StatusIcon = sStyle.icon;
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
          const isActive = task.status === "publicada";
          const correctedPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
          const pendingCorrection = task.submissions - task.corrected;

          return (
            <div
              key={task.id}
              className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              onClick={() => navigate(`/professor/tasks/${task.id}`)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                    <span className="text-xs font-semibold" style={{ color: disc?.color }}>{disc?.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{disc?.code}</span>
                    {turma && <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-md">{turma.name}</Badge>}
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
                        <span className="flex items-center gap-1.5 text-secondary"><FileCheck className="w-3.5 h-3.5" />Corrigido</span>
                        <span className={`font-semibold ${pendingCorrection > 0 ? "text-secondary" : "text-accent"}`}>{task.corrected}/{task.submissions}{pendingCorrection > 0 ? ` · ${pendingCorrection} por corrigir` : ""}</span>
                      </div>
                      <Progress value={correctedPct} className={`h-1.5 ${pendingCorrection > 0 ? "[&>div]:bg-secondary" : "[&>div]:bg-accent"}`} />
                      {isActive && task.correctionDeadline && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Prazo de correcção: <span className="font-medium text-foreground">{task.correctionDeadline}</span>
                        </p>
                      )}
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
