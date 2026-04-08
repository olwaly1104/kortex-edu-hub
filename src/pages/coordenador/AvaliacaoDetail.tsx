import { useParams, Link } from "react-router-dom";
import { coordTurmaTasks, coordTurmas, coordEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Calendar, Clock, CheckCircle, ArrowLeft, Users, AlertCircle, HelpCircle, MapPin, User, BookOpen, FileText, Link2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statusStyle: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho", icon: Clock },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa", icon: Clock },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada", icon: CheckCircle },
  pendente: { bg: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,40%)]", label: "Pendente", icon: AlertCircle },
};

// Generate mock student results for an evaluation
function generateStudentResults(task: typeof coordTurmaTasks[0], turma: typeof coordTurmas[0]) {
  const studentsInYear = coordEstudantes.filter(e => e.year === turma.year);
  return studentsInYear.map((student, i) => {
    const submetido = i < task.submissions;
    const corrigido = submetido && i < task.corrected;
    const nota = corrigido ? Math.round((Math.random() * 8 + 8) * 10) / 10 : null;
    return { ...student, submetido, corrigido, nota };
  });
}

export default function CoordenadorAvaliacaoDetail() {
  const { avaliacaoId } = useParams<{ avaliacaoId: string }>();
  const task = coordTurmaTasks.find(t => t.id === avaliacaoId);
  const turma = task ? coordTurmas.find(t => t.id === task.turmaId) : null;

  if (!task || !turma) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in">
        <Link to="/coordenador/avaliacoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar às Avaliações
        </Link>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Avaliação não encontrada</p>
        </div>
      </div>
    );
  }

  const sStyle = statusStyle[task.status] || statusStyle.rascunho;
  const StatusIcon = sStyle.icon;
  const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
  const notSubmitted = task.totalStudents - task.submissions;
  const notaAtribuidaPct = task.submissions > 0 ? Math.round(task.corrected / task.submissions * 100) : 0;
  const pendingCorrection = task.submissions - task.corrected;

  const studentResults = generateStudentResults(task, turma);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/coordenador/avaliacoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às Avaliações
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
          <Badge className={`${sStyle.bg} gap-1 text-[10px] border-0`}>
            <StatusIcon className="w-3 h-3" />
            {sStyle.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <Badge variant="outline" className="text-xs">{task.discipline}</Badge>
          <Badge variant="outline" className="text-xs">{turma.name} · {turma.year}º Ano</Badge>
          <Badge variant="outline" className="text-xs">{task.type === "quiz" ? "Quiz" : task.type === "exame" ? "Exame" : "Tarefa"}</Badge>
          <Badge variant="outline" className="text-xs">{task.type === "quiz" ? "Quiz" : task.type === "exame" ? "Exame" : "Tarefa"}</Badge>
        </div>
      </div>

      {/* Info card */}
      <Card className="p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Data" value={task.dueDate} icon={Calendar} iconBg="bg-primary/10" iconColor="text-primary" />
          <KpiCard label="Peso" value={`${task.weight}%`} icon={Award} iconBg="bg-accent/10" iconColor="text-accent" />
          <KpiCard label="Duração" value={task.type === "quiz" ? "45 min" : task.type === "exame" ? "2 horas" : "Sem limite"} icon={Clock} iconBg="bg-primary/10" iconColor="text-primary" />
          <KpiCard label="Local" value={task.type === "exame" ? "Sala A2.04" : "Online"} icon={MapPin} iconBg="bg-accent/10" iconColor="text-accent" />
          <KpiCard label="Média" value={task.avgGrade !== null ? `${task.avgGrade}/20` : "—"} icon={Award} iconBg={task.avgGrade !== null && task.avgGrade >= 10 ? "bg-accent/10" : "bg-destructive/10"} iconColor={task.avgGrade !== null && task.avgGrade >= 10 ? "text-accent" : "text-destructive"} />
        </div>

        <div className="border-t border-border" />

        {/* Guia + Critério side by side */}
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Documentação</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">Guia da Avaliação</p>
              <p className="text-[10px] text-muted-foreground">PDF · 3 páginas</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">Abrir</Badge>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">Critério da Avaliação</p>
              <p className="text-[10px] text-muted-foreground">PDF · 2 páginas</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">Abrir</Badge>
          </div>
        </div>

        {/* Conteúdo Relevante */}
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Conteúdo Relevante</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {[
            { name: "Capítulo 4 — Estruturas de Dados", type: "PDF" },
            { name: "Slides Aula 7 — Algoritmos de Ordenação", type: "PPTX" },
            { name: "Exercícios Práticos — Semana 5", type: "PDF" },
            { name: "Vídeo: Revisão para o Teste", type: "Link" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                {item.type === "Link" ? <Link2 className="w-3 h-3 text-primary" /> : <FileText className="w-3 h-3 text-primary" />}
              </div>
              <p className="text-xs text-foreground truncate flex-1">{item.name}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{item.type}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        {task.status !== "rascunho" && (
          <div className="p-5 space-y-4 border-b border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Users className="w-3.5 h-3.5" />Taxa de Submissão</span>
                <span className="font-bold text-foreground">{submissionPct}%</span>
              </div>
              <Progress value={submissionPct} className="h-2" />
              {notSubmitted > 0 && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {notSubmitted} estudantes ainda não submeteram
                </p>
              )}
            </div>
            <div className="border-t border-border" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 font-medium ${pendingCorrection > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />Taxa de Correcção
                </span>
                <span className={`font-bold ${pendingCorrection > 0 ? "text-destructive" : "text-foreground"}`}>{notaAtribuidaPct}%</span>
              </div>
              <Progress value={notaAtribuidaPct} className={`h-2 ${pendingCorrection > 0 ? "[&>div]:bg-destructive" : ""}`} />
              {pendingCorrection > 0 && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {pendingCorrection} submissões pendentes de correcção
                </p>
              )}
            </div>
          </div>
        )}
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Estudantes ({studentResults.length})
          </h3>
          <div className="flex gap-2 text-[10px]">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {studentResults.filter(s => s.corrigido).length} Corrigidos
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {studentResults.filter(s => s.submetido && !s.corrigido).length} Por corrigir
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {studentResults.filter(s => !s.submetido).length} Não submetido
            </Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Estudante</TableHead>
                <TableHead className="text-xs">Turma</TableHead>
                <TableHead className="text-xs text-center">Submetido</TableHead>
                <TableHead className="text-xs text-center">Corrigido</TableHead>
                <TableHead className="text-xs text-center">Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentResults.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link to={`/coordenador/estudantes/${s.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {s.name}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">{s.email}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">T{s.turma}</TableCell>
                  <TableCell className="text-center">
                    {s.submetido ? (
                      <CheckCircle className="w-4 h-4 text-accent mx-auto" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.corrigido ? (
                      <CheckCircle className="w-4 h-4 text-accent mx-auto" />
                    ) : s.submetido ? (
                      <Clock className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.nota !== null ? (
                      <span className={`text-xs font-bold ${s.nota >= 10 ? "text-accent" : "text-destructive"}`}>{s.nota}/20</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: {
  label: string; value: string; icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
