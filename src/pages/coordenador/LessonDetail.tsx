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

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-primary/5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5" style={{ transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Video className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Aula {lesson.number}</span>
              <Badge variant="outline" className="text-xs font-mono">{lesson.disciplineCode}</Badge>
              <Badge variant="outline" className="text-[10px]">{turmaId?.toUpperCase()}</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{lesson.title}</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">{lesson.summary}</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Duração", value: lesson.duration },
          { icon: Calendar, label: "Data", value: lesson.date },
          { icon: User, label: "Professor", value: cadeira.professor },
          { icon: Users, label: "Participantes", value: `${lesson.attendance}/${lesson.totalStudents}` },
        ].map(item => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="font-semibold text-foreground text-sm">{item.value}</p>
          </Card>
        ))}
      </div>

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
