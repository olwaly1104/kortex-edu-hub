import { useParams, useNavigate } from "react-router-dom";
import { profLessons, profDisciplines, allTurmas, profStudents } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Clock, Video, Users, Eye, Calendar,
  CheckCircle, Edit, Play, BookOpen, User,
} from "lucide-react";
import LessonTabs, { generateAttendance } from "@/components/LessonTabs";

const lessonStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  publicada: { label: "Publicada", color: "bg-accent/10 text-accent", icon: CheckCircle },
  agendada: { label: "Agendada", color: "bg-secondary/10 text-secondary", icon: Clock },
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Edit },
};

function generateTranscript(title: string, summary: string): { speaker: string; text: string }[] {
  return [
    { speaker: "Professor", text: `Bom dia a todos. Hoje vamos abordar o tema "${title}". ${summary}` },
    { speaker: "Professor", text: "Vamos começar por rever os conceitos fundamentais que foram abordados na aula anterior." },
    { speaker: "Estudante", text: "Professor, pode explicar novamente a relação entre os dois conceitos principais?" },
    { speaker: "Professor", text: "Claro, boa pergunta. Os dois conceitos estão interligados porque um depende directamente do outro." },
    { speaker: "Estudante", text: "E como é que isto se aplica nos exercícios?" },
    { speaker: "Professor", text: "Nos exercícios, vocês vão precisar de aplicar exactamente este princípio. Vou demonstrar com um exemplo." },
    { speaker: "Professor", text: "Para a próxima aula, revisem o capítulo correspondente. Até à próxima!" },
  ];
}

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

  // Build data for tabs
  const lessonStudents = profStudents.filter(s => s.turmaId === lesson.turmaId && s.disciplineId === lesson.disciplineId);
  const studentNames = lessonStudents.map(s => s.name);
  const professorName = disc?.name ? `Prof. ${disc.code}` : "Professor";
  const attendance = generateAttendance(professorName, studentNames.length > 0 ? studentNames : Array.from({ length: lesson.totalStudents }, (_, i) => `Estudante ${i + 1}`));
  const transcript = generateTranscript(lesson.title, lesson.summary);

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

      {/* Tabs */}
      <LessonTabs
        attendance={attendance}
        materials={lesson.materials}
        transcript={transcript}
        summary={lesson.summary}
        professorName={professorName}
        discColor={disc?.color}
        lessonStartTime="08:00"
      />
    </div>
  );
}
