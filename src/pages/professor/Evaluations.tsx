import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, Plus, Search, Clock, CheckCircle, Users, Send,
  Calendar, AlertCircle, MapPin, ArrowRight, ClipboardList, X, ArrowUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

type StatusFilter = "todas" | "ativa" | "encerrada" | "pendente";
type SortOption = "recente" | "antiga" | "nome-az" | "nome-za" | "nota-asc" | "nota-desc";

export default function ProfessorEvaluations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [showForm, setShowForm] = useState(false);

  const [formDisc, setFormDisc] = useState(profDisciplines[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDue, setFormDue] = useState("");
  const [formWeight, setFormWeight] = useState("25");

  const sortedTurmas = [...allTurmas].sort((a, b) => a.year - b.year);
  const allEvals = profTasks.filter(t => t.type === "exame");

  // All tasks/quizzes for pendente count
  const allTarefas = profTasks.filter(t => t.type === "tarefa" || t.type === "quiz");
  const pendenteTarefas = allTarefas.filter(t => t.status === "publicada" && t.corrected < t.submissions).length;
  const pendenteAvaliacoes = allEvals.filter(t => t.status === "publicada" && t.corrected < t.submissions).length;

  const scopedEvals = useMemo(() => {
    return filterTurma === "all" ? allEvals : allEvals.filter(t => t.turmaId === filterTurma);
  }, [filterTurma, allEvals]);

  const activeCount = scopedEvals.filter(t => t.status === "publicada").length;
  const closedCount = scopedEvals.filter(t => t.status === "encerrada").length;
  const graded = scopedEvals.filter(t => t.avgGrade !== null);
  const avgGrade = graded.length > 0 ? (graded.reduce((s, t) => s + (t.avgGrade || 0), 0) / graded.length).toFixed(1) : null;
  const approvedEvals = graded.filter(t => (t.avgGrade || 0) >= 10).length;
  const taxaAprovacao = graded.length > 0 ? Math.round(approvedEvals / graded.length * 100) : 0;

  const filtered = useMemo(() => {
    let result = scopedEvals.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "ativa") result = result.filter(t => t.status === "publicada");
    else if (filterStatus === "encerrada") result = result.filter(t => t.status === "encerrada");
    else if (filterStatus === "pendente") result = result.filter(t => t.status === "publicada" && t.corrected < t.submissions);

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

  const handleSubmit = () => {
    if (!formTitle || !formDesc || !formDue) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, descrição e data limite.", variant: "destructive" });
      return;
    }
    toast({ title: "Avaliação criada!", description: `"${formTitle}" foi publicada.` });
    setShowForm(false);
    setFormTitle(""); setFormDesc(""); setFormDue("");
  };

  const statusToggles: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "ativa", label: "Ativa" },
    { key: "encerrada", label: "Encerrada" },
    { key: "pendente", label: "Pendente" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-secondary" /> Avaliações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir exames e testes das suas turmas</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Activas" value={activeCount} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Encerradas" value={closedCount} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" />
        <SummaryCard label="Pendente" value={pendenteAvaliacoes} icon={AlertCircle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={pendenteAvaliacoes > 0 ? "text-destructive" : undefined} />
        <SummaryCard label="Taxa de Conclusão" value={scopedEvals.length > 0 ? `${Math.round(closedCount / scopedEvals.length * 100)}%` : "—"} icon={ClipboardList} iconBg="bg-accent/10" iconColor="text-accent" valueClass={scopedEvals.length > 0 && Math.round(closedCount / scopedEvals.length * 100) >= 50 ? "text-accent" : "text-muted-foreground"} />
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Row 1: Turma toggles */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterTurma === "all" ? "default" : "outline"} onClick={() => setFilterTurma("all")} className="text-xs">
            Todas as Turmas
          </Button>
          {sortedTurmas.map(t => (
            <Button key={t.id} size="sm" variant={filterTurma === t.id ? "default" : "outline"} onClick={() => setFilterTurma(t.id)} className="text-xs">
              {t.name}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Row 2: Search + Status toggles + Ordenar */}
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
          const disc = profDisciplines.find(d => d.id === task.disciplineId);
          const turma = allTurmas.find(t => t.id === task.turmaId);
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
          const isActive = task.status === "publicada";
          const notaAtribuidaPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
          const pendingCorrection = task.submissions - task.corrected;

          const statusBg = task.status === "encerrada" ? "bg-accent/10 text-accent" : task.status === "publicada" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
          const statusLabel = task.status === "encerrada" ? "Encerrada" : task.status === "publicada" ? "Activa" : "Rascunho";
          const StatusIcon = task.status === "encerrada" ? CheckCircle : Clock;

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
                  <Badge className={`${statusBg} gap-1 text-[10px] border-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusLabel}
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
                        <span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle className="w-3.5 h-3.5" />Nota Atribuída</span>
                        <span className="font-semibold text-foreground">{task.corrected}/{task.submissions}{pendingCorrection > 0 ? ` · ${pendingCorrection} pendente` : ""}</span>
                      </div>
                      <Progress value={notaAtribuidaPct} className="h-1.5" />
                    </div>
                    {isActive && task.correctionDeadline && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Corrigir até: <span className="font-medium text-foreground">{task.correctionDeadline}</span>
                      </p>
                    )}
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
