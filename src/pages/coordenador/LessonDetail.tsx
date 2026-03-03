import { useParams, Link } from "react-router-dom";
import { coordTurmaLessons, coordEstudantes, coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Video, Clock, Calendar, Users, FileText, Play, Eye,
  Download, CheckCircle, Maximize2, Minimize2, User,
} from "lucide-react";
import { useState } from "react";

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

  // Mock participants from students in this year
  const estudantes = coordEstudantes.filter(e => e.year === yearNum);
  const participants = [cadeira.professor, ...estudantes.slice(0, lesson.attendance).map(e => e.name)];

  // Mock transcript
  const transcriptSegments = generateTranscript(lesson.title, lesson.summary, cadeira.professor);

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
      <Tabs defaultValue="transcript" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "transcript", label: "Transcrição" },
              { value: "content", label: `Conteúdos (${lesson.materials.length})` },
              { value: "participants", label: `Participantes (${participants.length})` },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Transcrição */}
        <TabsContent value="transcript">
          <Card className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Transcrição da Aula
            </h3>
            {transcriptSegments.map((seg, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  seg.speaker === "Professor" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                }`}>
                  {seg.speaker === "Professor" ? "P" : "E"}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {seg.speaker === "Professor" ? cadeira.professor : seg.speaker}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{seg.text}</p>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Conteúdos */}
        <TabsContent value="content" className="space-y-2">
          {lesson.materials.length > 0 ? lesson.materials.map((mat, i) => (
            <Card key={i} className="p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{mat.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{mat.type} • {mat.size}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver"><Eye className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Descarregar"><Download className="w-4 h-4" /></button>
              </div>
            </Card>
          )) : (
            <Card className="p-8 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum conteúdo associado a esta aula.</p>
            </Card>
          )}
        </TabsContent>

        {/* Participantes */}
        <TabsContent value="participants">
          <Card className="divide-y overflow-hidden">
            {participants.map((p, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {p.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{p}</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? "Professor" : "Estudante"}</p>
                </div>
                {i === 0 && <Badge variant="outline" className="text-[10px]">Docente</Badge>}
                {i > 0 && <CheckCircle className="w-4 h-4 text-accent" />}
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generateTranscript(title: string, summary: string, professor: string): { speaker: string; text: string }[] {
  return [
    { speaker: "Professor", text: `Bom dia a todos. Hoje vamos abordar o tema "${title}". ${summary}` },
    { speaker: "Professor", text: "Vamos começar por rever os conceitos fundamentais que foram abordados na aula anterior, pois são essenciais para compreender o que vamos trabalhar hoje." },
    { speaker: "Estudante", text: "Professor, pode explicar novamente a relação entre os dois conceitos principais?" },
    { speaker: "Professor", text: "Claro, boa pergunta. Essencialmente, os dois conceitos estão interligados porque um depende directamente do outro. Vou usar um exemplo prático para ilustrar." },
    { speaker: "Professor", text: "Reparem neste diagrama. Podemos observar como a aplicação prática se relaciona com a teoria que acabámos de discutir." },
    { speaker: "Estudante", text: "E como é que isto se aplica nos exercícios que temos de resolver?" },
    { speaker: "Professor", text: "Excelente pergunta. Nos exercícios, vocês vão precisar de aplicar exactamente este princípio. Vou demonstrar com um exemplo resolvido passo a passo." },
    { speaker: "Professor", text: "Para a próxima aula, revisem o capítulo correspondente e tentem resolver os exercícios propostos. Qualquer dúvida, contactem-me por email. Até à próxima!" },
  ];
}
