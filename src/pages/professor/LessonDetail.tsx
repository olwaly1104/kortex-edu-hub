import { useParams, useNavigate } from "react-router-dom";
import { profLessons, profDisciplines, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, Video, FileText, Users, Eye, Calendar,
  CheckCircle, Edit, Play, Download, FolderOpen,
} from "lucide-react";

const lessonStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  publicada: { label: "Publicada", color: "bg-accent/10 text-accent", icon: CheckCircle },
  agendada: { label: "Agendada", color: "bg-secondary/10 text-secondary", icon: Clock },
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Edit },
};

export default function ProfessorLessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = profLessons.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Aula não encontrada.</p>
      </div>
    );
  }

  const disc = profDisciplines.find(d => d.id === lesson.disciplineId);
  const turma = allTurmas.find(t => t.id === lesson.turmaId);
  const cfg = lessonStatusConfig[lesson.status];
  const StatusIcon = cfg.icon;
  const isPast = lesson.status === "publicada";
  const attendancePct = lesson.totalStudents > 0 ? Math.round((lesson.attendance / lesson.totalStudents) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
          <span className="text-xs font-medium" style={{ color: disc?.color }}>{disc?.name}</span>
          <Badge variant="outline" className="text-[10px]">{disc?.code}</Badge>
          {turma && <Badge variant="outline" className="text-[10px]">{turma.name}</Badge>}
          <Badge className={`${cfg.color} gap-1 text-[10px]`}>
            <StatusIcon className="w-3 h-3" /> {cfg.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2 py-1 rounded" style={{ background: (disc?.color || "hsl(var(--primary))") + "15", color: disc?.color }}>#{lesson.number}</span>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Data</p>
          <p className="text-sm font-semibold text-foreground">{lesson.date}</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Duração</p>
          <p className="text-sm font-semibold text-foreground">{lesson.duration}</p>
        </Card>
        {isPast ? (
          <>
            <Card className="p-4 text-center">
              <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Presença</p>
              <p className={`text-sm font-semibold ${attendancePct >= 75 ? "text-accent" : "text-destructive"}`}>{lesson.attendance}/{lesson.totalStudents} ({attendancePct}%)</p>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Visualizações</p>
              <p className="text-sm font-semibold text-foreground">{lesson.views}</p>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-4 text-center">
              <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Estudantes</p>
              <p className="text-sm font-semibold text-foreground">{lesson.totalStudents}</p>
            </Card>
            <Card className="p-4 text-center">
              <Video className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="text-sm font-semibold text-muted-foreground">{cfg.label}</p>
            </Card>
          </>
        )}
      </div>

      {/* Summary */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Resumo</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.summary}</p>
      </Card>

      {/* Video placeholder for past lessons */}
      {isPast && (
        <Card className="overflow-hidden">
          <div className="aspect-video bg-muted/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
              <p className="text-sm font-semibold text-foreground">Gravação da Aula #{lesson.number}</p>
              <p className="text-xs text-muted-foreground mt-1">{lesson.duration}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Materials */}
      {lesson.materials.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" /> Conteúdos / Ficheiros
          </h3>
          <div className="space-y-2">
            {lesson.materials.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: (disc?.color || "hsl(var(--primary))") + "15" }}>
                  <FileText className="w-4 h-4" style={{ color: disc?.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.type.toUpperCase()} • {m.size}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0"><Download className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
