import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { profTasks, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Award, Calendar, Clock, CheckCircle, Users,
  ChevronRight, MapPin, ArrowRight,
} from "lucide-react";

export default function ProfessorEvaluations() {
  const navigate = useNavigate();
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  const sortedTurmas = [...allTurmas].sort((a, b) => a.year - b.year);

  // Build year groups
  const yearGroups = useMemo(() => {
    const years = [...new Set(sortedTurmas.map(t => t.year))].sort((a, b) => a - b);
    return years.map(year => ({
      year,
      turmas: sortedTurmas.filter(t => t.year === year),
    }));
  }, []);

  // Get evals (exame type only) for a turma
  const getTurmaEvals = (turmaId: string) => profTasks.filter(t => t.turmaId === turmaId && t.type === "exame");
  const getAllEvals = () => profTasks.filter(t => t.type === "exame");

  // Global KPIs
  const allEvals = getAllEvals();
  const totalEvals = allEvals.length;
  const closedEvals = allEvals.filter(t => t.status === "encerrada").length;
  const graded = allEvals.filter(t => t.avgGrade !== null);
  const avgGrade = graded.length > 0
    ? Math.round(graded.reduce((s, t) => s + (t.avgGrade || 0), 0) / graded.length * 10) / 10
    : null;
  const approvedEvals = graded.filter(t => (t.avgGrade || 0) >= 10).length;
  const taxaAprovacao = graded.length > 0 ? Math.round(approvedEvals / graded.length * 100) : 0;
  const taxaReprovacao = graded.length > 0 ? Math.round((graded.length - approvedEvals) / graded.length * 100) : 0;
  const taxaConclusao = totalEvals > 0 ? Math.round(closedEvals / totalEvals * 100) : 0;

  // Per-turma stats
  const getTurmaStats = (turmaId: string) => {
    const evals = getTurmaEvals(turmaId);
    const tGraded = evals.filter(t => t.avgGrade !== null);
    const tAvg = tGraded.length > 0
      ? Math.round(tGraded.reduce((s, t) => s + (t.avgGrade || 0), 0) / tGraded.length * 10) / 10
      : null;
    const tApproved = tGraded.filter(t => (t.avgGrade || 0) >= 10).length;
    const tAprovPct = tGraded.length > 0 ? Math.round(tApproved / tGraded.length * 100) : 0;
    const tReprovPct = tGraded.length > 0 ? Math.round((tGraded.length - tApproved) / tGraded.length * 100) : 0;
    const tClosed = evals.filter(e => e.status === "encerrada").length;
    return { evals, avg: tAvg, aprovPct: tAprovPct, reprovPct: tReprovPct, closed: tClosed, total: evals.length };
  };

  // Selected turma detail
  const selectedData = selectedTurma
    ? (() => {
        const turma = sortedTurmas.find(t => t.id === selectedTurma);
        if (!turma) return null;
        const stats = getTurmaStats(turma.id);
        return { turma, ...stats };
      })()
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Avaliações
        </h1>
        <p className="text-muted-foreground mt-1">Exames e testes das suas turmas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${avgGrade !== null && avgGrade >= 10 ? "text-accent" : avgGrade !== null ? "text-destructive" : "text-muted-foreground"}`}>{avgGrade ?? "—"}{avgGrade !== null ? "/20" : ""}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avaliações</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{closedEvals}<span className="text-sm text-muted-foreground font-medium">/{totalEvals}</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Aprovado</span>
          </div>
          <p className={`text-2xl font-bold ${taxaAprovacao >= 70 ? "text-accent" : taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaAprovacao}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Award className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Reprovado</span>
          </div>
          <p className={`text-2xl font-bold ${taxaReprovacao > 30 ? "text-destructive" : "text-foreground"}`}>{taxaReprovacao}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Conclusão</span>
          </div>
          <p className={`text-2xl font-bold ${taxaConclusao >= 80 ? "text-accent" : taxaConclusao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaConclusao}%</p>
        </Card>
      </div>

      {/* Back button */}
      {selectedTurma && (
        <Button variant="outline" size="sm" onClick={() => setSelectedTurma(null)} className="text-xs gap-1">
          ← Voltar às Turmas
        </Button>
      )}

      {/* Year grid */}
      {!selectedTurma && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {yearGroups.map(({ year, turmas }) => (
            <div key={year} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{year}º Ano</h2>
              <div className="space-y-1.5">
                {turmas.map(t => {
                  const stats = getTurmaStats(t.id);
                  if (stats.total === 0) return null;
                  const statusLabel = stats.avg !== null && stats.avg >= 14 ? "Excelente" : stats.avg !== null && stats.avg >= 10 ? "Normal" : "Em Risco";
                  const statusClass = stats.avg !== null && stats.avg >= 14
                    ? "bg-accent/15 text-accent border-accent/30"
                    : stats.avg !== null && stats.avg >= 10
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-destructive/15 text-destructive border-destructive/30";

                  return (
                    <Card
                      key={t.id}
                      className="p-3 transition-all cursor-pointer hover:shadow-md border-l-[3px] group"
                      style={{ borderLeftColor: stats.avg !== null && stats.avg >= 10 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }}
                      onClick={() => setSelectedTurma(t.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{t.name}</p>
                          <Badge variant="outline" className={`text-[9px] ${statusClass}`}>{statusLabel}</Badge>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média</p>
                            <p className={`text-xs font-bold ${stats.avg !== null && stats.avg >= 10 ? "text-accent" : "text-destructive"}`}>{stats.avg ?? "—"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Aprov.</p>
                            <p className={`text-xs font-bold ${stats.aprovPct >= 70 ? "text-accent" : stats.aprovPct >= 50 ? "text-foreground" : "text-destructive"}`}>{stats.aprovPct}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Reprov.</p>
                            <p className={`text-xs font-bold ${stats.reprovPct > 30 ? "text-destructive" : "text-foreground"}`}>{stats.reprovPct}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Aval.</p>
                            <p className="text-xs font-bold text-foreground">{stats.closed}/{stats.total}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded turma detail */}
      {selectedData && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{selectedData.turma.name}</h2>
            <Badge variant="outline" className="text-[10px]">{selectedData.turma.year}º Ano</Badge>
            {selectedData.avg !== null && (
              <Badge variant={selectedData.avg >= 10 ? "default" : "destructive"} className="text-[10px]">
                Média {selectedData.avg}/20
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {selectedData.evals.map(task => {
              const disc = profDisciplines.find(d => d.id === task.disciplineId);
              const submissionPct = task.totalStudents > 0 ? Math.round(task.submissions / task.totalStudents * 100) : 0;
              const isGraded = task.avgGrade !== null;

              return (
                <Card
                  key={task.id}
                  className="p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-all group"
                  style={{ borderLeftColor: isGraded ? (task.avgGrade! >= 10 ? "hsl(var(--accent) / 0.6)" : "hsl(var(--destructive) / 0.6)") : "hsl(var(--muted-foreground) / 0.3)" }}
                  onClick={() => navigate(`/professor/tasks/${task.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</p>
                        {disc && <Badge variant="outline" className="text-[10px] font-mono">{disc.code}</Badge>}
                        <Badge className={`text-[10px] border-0 ${task.status === "encerrada" ? "bg-accent/10 text-accent" : task.status === "publicada" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {task.status === "encerrada" ? "Encerrada" : task.status === "publicada" ? "Activa" : "Rascunho"}
                        </Badge>
                      </div>
                      {disc && <p className="text-[10px] text-muted-foreground font-medium mb-1.5">{disc.name}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                        <span className="flex items-center gap-1">Peso: {task.weight}%</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Presencial</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{task.submissions}/{task.totalStudents}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 shrink-0 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                        <p className={`text-xs font-bold ${isGraded ? (task.avgGrade! >= 10 ? "text-accent" : "text-destructive") : "text-muted-foreground"}`}>{isGraded ? `${task.avgGrade}/20` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Entrega</p>
                        <p className="text-xs font-bold text-foreground">{submissionPct}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Corrig.</p>
                        <p className="text-xs font-bold text-foreground">{task.corrected}/{task.submissions}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
                  </div>
                </Card>
              );
            })}
            {selectedData.evals.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma avaliação para esta turma</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
