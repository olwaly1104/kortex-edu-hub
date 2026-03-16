import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { coordTurmaTasks, coordTurmas, coordNotas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, Calendar, Clock, MapPin, User, CheckCircle, ArrowLeft, Users, AlertCircle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statusStyle: Record<string, { bg: string; label: string; icon: React.ElementType }> = {
  rascunho: { bg: "bg-muted text-muted-foreground", label: "Rascunho", icon: Clock },
  publicada: { bg: "bg-primary/10 text-primary", label: "Activa", icon: Clock },
  encerrada: { bg: "bg-accent/10 text-accent", label: "Encerrada", icon: CheckCircle },
  pendente: { bg: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,40%)]", label: "Pendente", icon: AlertCircle },
};

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

  // Find the matching notas data for this turma
  const yearData = coordNotas.find(n => n.year === turma.year);
  const turmaNotas = yearData?.turmas.find(t => t.turma === turma.name.replace("Turma ", ""));

  // Filter avaliacoes that match this task's discipline
  const relatedAvaliacoes = turmaNotas?.avaliacoes.filter(a => a.cadeira === task.discipline) || [];

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
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Data" value={task.dueDate} icon={Calendar} iconBg="bg-primary/10" iconColor="text-primary" tooltip="Data de realização da avaliação." />
        <KpiCard label="Peso" value={`${task.weight}%`} icon={Award} iconBg="bg-accent/10" iconColor="text-accent" tooltip="Peso desta avaliação na nota final da cadeira." />
        <KpiCard label="Submissões" value={`${task.submissions}/${task.totalStudents}`} icon={Users} iconBg="bg-primary/10" iconColor="text-primary" tooltip="Número de estudantes que submeteram vs total inscrito." />
        <KpiCard label="Corrigidos" value={`${task.corrected}/${task.submissions}`} icon={CheckCircle} iconBg="bg-accent/10" iconColor="text-accent" tooltip="Número de submissões com nota atribuída pelo docente." />
        <KpiCard label="Média" value={task.avgGrade !== null ? `${task.avgGrade}/20` : "—"} icon={Award} iconBg={task.avgGrade !== null && task.avgGrade >= 10 ? "bg-accent/10" : "bg-destructive/10"} iconColor={task.avgGrade !== null && task.avgGrade >= 10 ? "text-accent" : "text-destructive"} tooltip="Média aritmética das notas atribuídas." />
      </div>

      {/* Progress bars */}
      {task.status !== "rascunho" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
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

      {/* Related grades from Notas */}
      {relatedAvaliacoes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Resultados da Cadeira — {task.discipline}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                Todas as avaliações desta cadeira na turma seleccionada, com médias e taxas de aprovação.
              </TooltipContent>
            </Tooltip>
          </h2>
          {relatedAvaliacoes.map((a, i) => {
            const total = a.aprovados + a.reprovados;
            return (
              <Card key={`${a.code}-${i}`} className="p-4 border-l-[3px]" style={{ borderLeftColor: a.media >= 10 ? "hsl(var(--accent) / 0.6)" : "hsl(var(--destructive) / 0.6)" }}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-foreground">{a.name}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{a.code}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
                      <span className="flex items-center gap-1">{a.period}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.professor}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.local}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                      <p className={`text-xs font-bold ${a.media >= 10 ? "text-accent" : "text-destructive"}`}>{a.media}/20</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Partic.</p>
                      <p className="text-xs font-bold text-foreground">{total}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Aprov.</p>
                      <p className="text-xs font-bold text-accent">{a.aprovados} ({total > 0 ? Math.round((a.aprovados / total) * 100) : 0}%)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Reprov.</p>
                      <p className="text-xs font-bold text-destructive">{a.reprovados} ({total > 0 ? Math.round((a.reprovados / total) * 100) : 0}%)</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* All turma grades if available */}
      {turmaNotas && turmaNotas.avaliacoes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Todas as Avaliações — {turma.name}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                Listagem completa de todas as avaliações realizadas nesta turma, independentemente da cadeira.
              </TooltipContent>
            </Tooltip>
          </h2>
          {turmaNotas.avaliacoes.map((a, i) => {
            const total = a.aprovados + a.reprovados;
            return (
              <Card key={`all-${a.code}-${i}`} className="p-4 border-l-[3px]" style={{ borderLeftColor: a.media >= 10 ? "hsl(var(--accent) / 0.6)" : "hsl(var(--destructive) / 0.6)" }}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-foreground">{a.name}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{a.code}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">{a.cadeira}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.professor}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                      <p className={`text-xs font-bold ${a.media >= 10 ? "text-accent" : "text-destructive"}`}>{a.media}/20</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Aprov.</p>
                      <p className="text-xs font-bold text-accent">{total > 0 ? Math.round((a.aprovados / total) * 100) : 0}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Reprov.</p>
                      <p className={`text-xs font-bold ${(total > 0 && Math.round((a.reprovados / total) * 100) > 30) ? "text-destructive" : "text-foreground"}`}>{total > 0 ? Math.round((a.reprovados / total) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, tooltip }: {
  label: string; value: string; icon: React.ElementType; iconBg: string; iconColor: string; tooltip: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
