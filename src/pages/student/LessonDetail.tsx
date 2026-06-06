import { useParams, Link, useNavigate } from "react-router-dom";
import { lessons, disciplines } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Video, Clock, Calendar, User, FileText, ClipboardList, Users, Play, Download, Eye, CheckCircle, AlertCircle, Monitor, MapPin, Mail, MessageSquare, Upload, Maximize2, Minimize2, BookOpen, Loader2, Brain, HelpCircle, Trophy, ChevronRight, Timer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

export default function LessonDetail() {
  const { disciplineId, lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessons.find(l => l.id === lessonId);
  const disc = disciplines.find(d => d.id === disciplineId);
  const [videoExpanded, setVideoExpanded] = useState(false);

  // Determine lesson status based on progress/date
  const lessonStatus = useMemo(() => {
    if (!lesson) return "agendada";
    // progress 100 = concluída, progress > 0 = a decorrer, 0 = agendada
    if (lesson.progress >= 100) return "concluída";
    if (lesson.progress > 0) return "a_decorrer";
    return "agendada";
  }, [lesson]);

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
                <BookOpen className="w-3 h-3" /> {disc.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <User className="w-3 h-3" /> {lesson.professor}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Calendar className="w-3 h-3" /> {lesson.date}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Clock className="w-3 h-3" /> {lesson.duration}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <Users className="w-3 h-3" /> {lesson.participants.length} participantes
              </Badge>
            </div>
          </div>
        </div>
      </Card>




      {/* Video area — status-aware */}
      {lessonStatus === "concluída" ? (
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
      ) : lessonStatus === "a_decorrer" ? (
        <Card className="relative flex items-center justify-center w-full overflow-hidden rounded-2xl aspect-video max-h-[420px] bg-muted/30 border-dashed">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-amber-100 text-amber-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <p className="text-sm text-foreground font-semibold">Aula a decorrer</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">A gravação será disponibilizada automaticamente após a conclusão da aula.</p>
          </div>
        </Card>
      ) : (
        <Card className="relative flex items-center justify-center w-full overflow-hidden rounded-2xl aspect-video max-h-[420px] bg-muted/20 border-dashed">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-muted text-muted-foreground">
              <Video className="w-7 h-7" />
            </div>
            <p className="text-sm text-foreground font-semibold">Aula agendada</p>
            <p className="text-xs text-muted-foreground mt-1">A gravação ficará disponível após a aula ser leccionada.</p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="transcript" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {(() => {
              const quizzes = generateLessonQuizzes(lesson.id, lesson.title, lessonStatus);
              const tabs = [
                { value: "transcript", label: "Transcrição" },
                { value: "content", label: `Conteúdos (${lesson.materials.length})` },
                { value: "quizzes", label: `Quizzes (${quizzes.length})` },
                { value: "participants", label: `Participantes (${lesson.participants.length})` },
                { value: "tasks", label: `Tarefas (${lesson.tasks.length})` },
              ];
              return tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ));
            })()}
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

        <TabsContent value="participants" className="space-y-4">
          {/* Stats */}
          {(() => {
            const attendanceData = lesson.participants.map((p, i) => {
              if (i === 0) return { name: p, role: "professor" as const, status: "presente" as const, arrivalTime: "08:00" };
              const rand = Math.random();
              if (rand < 0.15) return { name: p, role: "estudante" as const, status: "ausente" as const };
              if (rand < 0.35) {
                const mins = Math.floor(Math.random() * 20) + 5;
                return { name: p, role: "estudante" as const, status: "atrasado" as const, arrivalTime: `08:${String(mins).padStart(2, "0")}` };
              }
              return { name: p, role: "estudante" as const, status: "presente" as const, arrivalTime: "08:00" };
            });
            const students = attendanceData.filter(a => a.role === "estudante");
            const presentCount = students.filter(a => a.status === "presente").length;
            const lateCount = students.filter(a => a.status === "atrasado").length;
            const absentCount = students.filter(a => a.status === "ausente").length;

            return (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">08:00</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Início</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{presentCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Presentes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(38,92%,50%)]/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[hsl(38,92%,50%)]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[hsl(38,92%,50%)]">{lateCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Atrasados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-destructive">{absentCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ausentes</p>
                    </div>
                  </div>
                </div>

                <Card className="divide-y overflow-hidden">
                  {attendanceData.map((a, i) => {
                    const cfg = {
                      presente: { label: "Presente", icon: CheckCircle, className: "text-accent bg-accent/10" },
                      atrasado: { label: "Atrasado", icon: Clock, className: "text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10" },
                      ausente: { label: "Ausente", icon: AlertCircle, className: "text-destructive bg-destructive/10" },
                    }[a.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={i} className={`px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors ${a.status === "ausente" ? "bg-destructive/[0.03]" : ""}`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                          {a.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${a.status === "ausente" ? "line-through text-muted-foreground" : "text-foreground"}`}>{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.role === "professor" ? "Professor" : "Estudante"}</p>
                        </div>
                        {a.arrivalTime && (
                          <span className="text-xs text-muted-foreground font-mono">{a.arrivalTime}</span>
                        )}
                        <Badge className={`${cfg.className} text-[10px] gap-1 border-0`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                      </div>
                    );
                  })}
                </Card>
              </>
            );
          })()}
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
