import { useParams, Link, useNavigate } from "react-router-dom";
import { lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Video, Clock, Calendar, User, FileText, ClipboardList, Users, Play, Download, Eye, CheckCircle, AlertCircle, Monitor, MapPin, Mail, MessageSquare, Upload, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LessonDetail() {
  const { disciplineId, lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessons.find(l => l.id === lessonId);
  const disc = disciplines.find(d => d.id === disciplineId);
  const [videoExpanded, setVideoExpanded] = useState(false);

  if (!lesson || !disc) return (
    <div className="p-8 text-muted-foreground">
      <Link to={`/student/disciplines/${disciplineId}`} className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Aula não encontrada.</p>
    </div>
  );

  const transcriptSegments = parseTranscript(lesson.transcript, lesson.professor);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/student/disciplines/${disciplineId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {disc.name}
      </Link>

      {/* Hero header with discipline color */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${disc.color}12, ${disc.color}06)` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07]" style={{ background: disc.color, transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: disc.color, color: "white" }}>
            <Video className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded" style={{ background: disc.color + "15", color: disc.color }}>Aula {lesson.number}</span>
              <Badge className="text-xs border-none" style={{ background: disc.color + "20", color: disc.color }}>{disc.name}</Badge>
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
          { icon: User, label: "Professor", value: lesson.professor },
          { icon: Users, label: "Participantes", value: String(lesson.participants.length) },
        ].map(item => (
          <Card key={item.label} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: disc.color + "15", color: disc.color }}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="font-semibold text-foreground text-sm">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* Video player */}
      <Card
        className={`relative flex items-center justify-center cursor-pointer hover:shadow-lg transition-all w-full overflow-hidden rounded-2xl ${
          videoExpanded ? "aspect-video" : "aspect-video max-h-[420px]"
        }`}
        style={{ background: `linear-gradient(135deg, ${disc.color}08, ${disc.color}15)` }}
        onClick={() => setVideoExpanded(!videoExpanded)}
      >
        <div className="text-center">
          <div className={`rounded-full flex items-center justify-center mx-auto mb-3 transition-all shadow-lg ${videoExpanded ? "w-20 h-20" : "w-16 h-16"}`} style={{ background: disc.color, color: "white" }}>
            <Play className={`${videoExpanded ? "w-8 h-8" : "w-6 h-6"} ml-1`} />
          </div>
          <p className="text-sm text-foreground font-semibold">Reproduzir gravação</p>
          <p className="text-xs text-muted-foreground mt-0.5">{lesson.duration}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setVideoExpanded(!videoExpanded); }}
          className="absolute top-3 right-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground backdrop-blur-sm"
          title={videoExpanded ? "Reduzir" : "Ecrã completo"}
        >
          {videoExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="transcript" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "transcript", label: "Transcrição" },
              { value: "content", label: `Conteúdos (${lesson.materials.length})` },
              { value: "participants", label: `Participantes (${lesson.participants.length})` },
              { value: "tasks", label: `Tarefas (${lesson.tasks.length})` },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="transcript">
          <Card className="p-6 space-y-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: disc.color }} /> Transcrição da Aula
            </h3>
            {transcriptSegments.map((seg, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{
                  background: seg.speaker === "Professor" ? disc.color + "15" : "hsl(var(--secondary) / 0.1)",
                  color: seg.speaker === "Professor" ? disc.color : "hsl(var(--secondary))",
                }}>
                  {seg.speaker === "Professor" ? "P" : "E"}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {seg.speaker === "Professor" ? lesson.professor : seg.speaker}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{seg.text}</p>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-2">
          {lesson.materials.length > 0 ? lesson.materials.map((mat, i) => (
            <Card key={i} className="p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: disc.color + "12" }}>
                <FileText className="w-5 h-5" style={{ color: disc.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{mat.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{mat.type}</p>
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

        <TabsContent value="participants">
          <Card className="divide-y overflow-hidden">
            {lesson.participants.map((p, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  background: i === 0 ? disc.color + "15" : "hsl(var(--muted))",
                  color: i === 0 ? disc.color : "hsl(var(--muted-foreground))",
                }}>
                  {p.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{p}</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? "Professor" : "Estudante"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/student/email")}>
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/student/chat")}>
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-3">
          {lesson.tasks.length > 0 ? lesson.tasks.map(task => {
            const statusConfig = {
              entregue: { icon: CheckCircle, label: "Entregue", color: "hsl(var(--accent))", bg: "hsl(var(--accent) / 0.1)" },
              atrasada: { icon: AlertCircle, label: "Atrasada", color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.1)" },
              pendente: { icon: ClipboardList, label: "Pendente", color: disc.color, bg: disc.color + "12" },
            };
            const cfg = statusConfig[task.status];
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={task.id}
                className="p-4 cursor-pointer hover:shadow-md transition-all border-l-[3px]"
                style={{ borderLeftColor: cfg.color }}
                onClick={() => navigate(`/student/disciplines/${disciplineId}/tasks?taskId=${task.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                    <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Dado: {task.assignedDate}</span>
                      <span>Prazo: {task.dueDate}</span>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        {task.modality === "online" ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {task.modality === "online" ? "Online" : "Presencial"}
                      </Badge>
                    </div>
                    {task.modality === "online" && (
                      <div className="mt-3">
                        {task.status === "entregue" ? (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: disc.color + "06", borderColor: disc.color + "20" }}>
                            <FileText className="w-4 h-4" style={{ color: disc.color }} />
                            <span className="text-xs font-medium text-foreground flex-1">{task.title.replace(/\s+/g, "_")}.pdf</span>
                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Descarregar"><Download className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Upload className="w-3.5 h-3.5" /> Carregar ficheiro
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" style={{ color: cfg.color }}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                </div>
              </Card>
            );
          }) : (
            <Card className="p-8 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma tarefa atribuída nesta aula.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function parseTranscript(transcript: string, professor: string): { speaker: string; text: string }[] {
  const sentences = transcript.split(/(?<=[.!?])\s+/).filter(Boolean);
  const segments: { speaker: string; text: string }[] = [];
  let currentSpeaker = "Professor";
  let currentText: string[] = [];

  sentences.forEach((sentence, i) => {
    const isStudentQuestion = sentence.includes("?") && i > 2 && i % 5 === 3;
    const speaker = isStudentQuestion ? "Estudante" : "Professor";

    if (speaker !== currentSpeaker && currentText.length > 0) {
      segments.push({ speaker: currentSpeaker, text: currentText.join(" ") });
      currentText = [];
    }
    currentSpeaker = speaker;
    currentText.push(sentence);
  });

  if (currentText.length > 0) {
    segments.push({ speaker: currentSpeaker, text: currentText.join(" ") });
  }

  return segments.length > 0 ? segments : [{ speaker: "Professor", text: transcript }];
}
