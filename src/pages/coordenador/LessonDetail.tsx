import { useParams, Link } from "react-router-dom";
import { coordTurmaLessons, coordEstudantes, coordDisciplinas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Video, Clock, Calendar, Users, Play, User,
  Maximize2, Minimize2,
} from "lucide-react";
import { useState } from "react";
import LessonTabs, { generateAttendance } from "@/components/LessonTabs";

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

export default function CoordenadorLessonDetail() {
  const { year, turmaId, cadeiraId, lessonId } = useParams();
  const yearNum = parseInt(year || "1");
  const lesson = coordTurmaLessons.find(l => l.id === lessonId);
  const cadeira = coordDisciplinas.find(d => d.id === cadeiraId);
  const [videoExpanded, setVideoExpanded] = useState(false);

  if (!lesson || !cadeira) return (
    <div className="p-8 text-muted-foreground">
      <Link to={`/coordenador/anos/${yearNum}/turma/${turmaId}/cadeira/${cadeiraId}`} className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Aula não encontrada.</p>
    </div>
  );

  const estudantes = coordEstudantes.filter(e => e.year === yearNum);
  const studentNames = estudantes.slice(0, lesson.totalStudents).map(e => e.name);
  const attendance = generateAttendance(cadeira.professor, studentNames);
  const transcript = generateTranscript(lesson.title, lesson.summary);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/coordenador/anos/${yearNum}/turma/${turmaId}/cadeira/${cadeiraId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {cadeira.name}
      </Link>

      {/* Unified Card Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Aula {lesson.number}</span>
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{lesson.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-2.5 leading-relaxed">{lesson.summary}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {cadeira.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <User className="w-3 h-3" /> {cadeira.professor}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {turmaId?.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Calendar className="w-3 h-3" /> {lesson.date}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Clock className="w-3 h-3" /> {lesson.duration}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> {lesson.attendance}/{lesson.totalStudents}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Video player */}
      {lesson.status === "publicada" && (
        <Card
          className={`relative flex items-center justify-center cursor-pointer hover:shadow-lg transition-all w-full overflow-hidden rounded-2xl bg-primary/5 ${
            videoExpanded ? "aspect-video" : "aspect-video max-h-[420px]"
          }`}
          onClick={() => setVideoExpanded(!videoExpanded)}
        >
          <div className="text-center">
            <div className={`rounded-full bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg ${videoExpanded ? "w-20 h-20" : "w-16 h-16"}`}>
              <Play className={`${videoExpanded ? "w-8 h-8" : "w-6 h-6"} ml-1 text-primary-foreground`} />
            </div>
            <p className="text-sm text-foreground font-semibold">Reproduzir gravação</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lesson.duration}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setVideoExpanded(!videoExpanded); }}
            className="absolute top-3 right-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground backdrop-blur-sm"
          >
            {videoExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </Card>
      )}

      {/* Tabs */}
      <LessonTabs
        attendance={attendance}
        materials={lesson.materials}
        transcript={transcript}
        summary={lesson.summary}
        professorName={cadeira.professor}
        lessonStartTime="08:00"
      />
    </div>
  );
}
