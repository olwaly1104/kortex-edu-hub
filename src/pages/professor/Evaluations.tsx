import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList, Plus, Search, Clock, CheckCircle, Users, Send,
  FolderKanban, Calendar, AlertCircle, BarChart3, Monitor, MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeLabel: Record<string, string> = { quiz: "Quiz", exame: "Exame" };
const typeIcon: Record<string, React.ElementType> = { quiz: FolderKanban, exame: ClipboardList };
const statusStyle: Record<string, { bg: string; label: string }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho" },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa" },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada" },
};

export default function ProfessorEvaluations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filterTurma, setFilterTurma] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formDisc, setFormDisc] = useState(profDisciplines[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<"quiz" | "exame">("exame");
  const [formDue, setFormDue] = useState("");
  const [formWeight, setFormWeight] = useState("25");
  const [formModality, setFormModality] = useState<"online" | "presencial">("presencial");

  const allEvals = profTasks.filter(t => t.type === "quiz" || t.type === "exame");

  const filtered = allEvals
    .filter(t => filterTurma === "all" || t.turmaId === filterTurma)
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const activeCount = allEvals.filter(t => t.status === "publicada").length;
  const closedCount = allEvals.filter(t => t.status === "encerrada").length;
  const pendingCorrection = allEvals.filter(t => t.status !== "rascunho" && t.avgGrade === null && t.submissions > 0).length;
  const totalSub = allEvals.reduce((s, t) => s + t.submissions, 0);
  const totalExp = allEvals.filter(t => t.status !== "rascunho").reduce((s, t) => s + t.totalStudents, 0);
  const deliveryRate = totalExp > 0 ? Math.round(totalSub / totalExp * 100) : 0;
  const graded = allEvals.filter(t => t.avgGrade !== null);
  const avgGrade = graded.length > 0 ? (graded.reduce((s, t) => s + (t.avgGrade || 0), 0) / graded.length).toFixed(1) : null;

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
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-secondary" /> Avaliações
          </h1>
          <p className="text-muted-foreground mt-1">Gerir quizzes e exames das suas disciplinas</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Disciplina *</label>
              <select value={formDisc} onChange={e => setFormDisc(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {profDisciplines.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo *</label>
              <div className="flex gap-2">
                {(["quiz", "exame"] as const).map(t => (
                  <button key={t} onClick={() => setFormType(t)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${formType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {typeLabel[t]}
                  </button>
                ))}
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data *</label>
              <Input type="date" value={formDue} onChange={e => setFormDue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Peso (%)</label>
              <Input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} min="0" max="100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modalidade</label>
              <div className="flex gap-2">
                {(["online", "presencial"] as const).map(m => (
                  <button key={m} onClick={() => setFormModality(m)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${formModality === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {m === "online" ? "Online" : "Presencial"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" /> Publicar</Button>
          </div>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Activas</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10"><Clock className="w-4 h-4 text-primary" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{activeCount}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Por Corrigir</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10"><AlertCircle className="w-4 h-4 text-destructive" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingCorrection}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Encerradas</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10"><CheckCircle className="w-4 h-4 text-accent" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{closedCount}</p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Taxa Entrega</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/10"><BarChart3 className="w-4 h-4 text-secondary" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{deliveryRate}%</p>
        </Card>
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Média Geral</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10"><ClipboardList className="w-4 h-4 text-accent" /></div>
          </div>
          <p className={`text-2xl font-bold ${avgGrade && Number(avgGrade) >= 10 ? "text-accent" : avgGrade ? "text-destructive" : "text-muted-foreground"}`}>
            {avgGrade ?? "—"}
          </p>
        </Card>
      </div>

      {/* Filters: Search + Status inline, then Turma below */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "publicada", "encerrada", "rascunho"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s === "all" ? "Todos" : statusStyle[s]?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground self-center mr-1">Turma:</span>
        <button onClick={() => setFilterTurma("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTurma === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Todas</button>
        {allTurmas.map(t => (
          <button key={t.id} onClick={() => setFilterTurma(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTurma === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.name}</button>
        ))}
      </div>

      {/* Evaluation list */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma avaliação encontrada.</p>}
        {filtered.map(task => {
          const disc = profDisciplines.find(d => d.id === task.disciplineId);
          const turma = allTurmas.find(t => t.id === task.turmaId);
          const TypeIcon = typeIcon[task.type] || ClipboardList;
          const sStyle = statusStyle[task.status];
          const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;

          return (
            <Card
              key={task.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate(`/professor/tasks/${task.id}`)}
            >
              <div className="h-1" style={{ backgroundColor: disc?.color }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                    <span className="text-xs font-semibold" style={{ color: disc?.color }}>{disc?.name}</span>
                    <Badge variant="outline" className="text-[10px]">{disc?.code}</Badge>
                    {turma && <Badge variant="outline" className="text-[10px]">{turma.name}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <TypeIcon className="w-3 h-3" />
                      {typeLabel[task.type]}
                    </Badge>
                    <Badge className={sStyle.bg}>{sStyle.label}</Badge>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{task.title}</h3>

                <div className="flex items-center gap-5 text-xs text-muted-foreground mb-3 flex-wrap">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {task.dueDate}</span>
                  <span className="flex items-center gap-1.5">Peso: <span className="font-medium text-foreground">{task.weight}%</span></span>
                  <span className="flex items-center gap-1.5">
                    {task.modality === "online" ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    {task.modality === "online" ? "Online" : "Presencial"}
                  </span>
                  {task.avgGrade !== null && (
                    <span className="flex items-center gap-1.5">
                      Média: <span className={`font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</span>
                    </span>
                  )}
                  {task.avgGrade === null && task.submissions > 0 && (
                    <span className="flex items-center gap-1.5 text-destructive/70"><AlertCircle className="w-3.5 h-3.5" />Por corrigir</span>
                  )}
                </div>

                {task.status !== "rascunho" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" />Submissões</span>
                      <span className="font-semibold text-foreground">{task.submissions}/{task.totalStudents} ({submissionPct}%)</span>
                    </div>
                    <Progress value={submissionPct} className="h-1.5" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
