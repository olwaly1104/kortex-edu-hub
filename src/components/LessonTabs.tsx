import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, FileText, Eye, Download, CheckCircle, Clock,
  Search, AlertCircle, BookOpen, Timer,
} from "lucide-react";

export type AttendanceStatus = "presente" | "atrasado" | "ausente";

export interface AttendanceRecord {
  name: string;
  role: "professor" | "estudante";
  status: AttendanceStatus;
  arrivalTime?: string;
}

interface LessonTabsProps {
  attendance: AttendanceRecord[];
  materials: { name: string; type: string; size: string }[];
  transcript: { speaker: string; text: string }[];
  summary: string;
  professorName: string;
  discColor?: string;
  lessonStartTime?: string;
}

const statusConfig: Record<AttendanceStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  presente: { label: "Presente", icon: CheckCircle, className: "text-accent bg-accent/10" },
  atrasado: { label: "Atrasado", icon: Clock, className: "text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10" },
  ausente: { label: "Ausente", icon: AlertCircle, className: "text-destructive bg-destructive/10" },
};

export default function LessonTabs({ attendance, materials, transcript, summary, professorName, discColor, lessonStartTime = "08:00" }: LessonTabsProps) {
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const presentCount = attendance.filter(a => a.status === "presente" && a.role === "estudante").length;
  const lateCount = attendance.filter(a => a.status === "atrasado" && a.role === "estudante").length;
  const absentCount = attendance.filter(a => a.status === "ausente" && a.role === "estudante").length;
  const totalStudents = attendance.filter(a => a.role === "estudante").length;

  const filteredAttendance = attendance.filter(a =>
    a.name.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  return (
    <Tabs defaultValue="participantes" className="space-y-5">
      <div className="border-b border-border">
        <TabsList className="bg-transparent h-auto p-0 gap-0">
          {[
            { value: "participantes", label: "Participantes", count: totalStudents },
            { value: "conteudos", label: "Conteúdos", count: materials.length },
            { value: "transcricao", label: "Transcrição" },
            { value: "resumo", label: "Resumo da Aula" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Participantes / Lista de Presença */}
      <TabsContent value="participantes" className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{lessonStartTime}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Início</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{presentCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Presentes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(38,92%,50%)]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[hsl(38,92%,50%)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{lateCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Atrasados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{absentCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ausentes</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar participante..." value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {/* List */}
        <Card className="divide-y divide-border overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px] gap-2 px-4 py-2.5 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Nome</span>
            <span>Hora de Entrada</span>
            <span className="text-right">Estado</span>
          </div>
          {filteredAttendance.map((a, i) => {
            const cfg = statusConfig[a.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`grid grid-cols-[1fr_100px_80px] gap-2 items-center px-4 py-3 transition-colors ${
                a.status === "ausente" ? "bg-destructive/[0.03]" : "hover:bg-muted/20"
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    a.role === "professor" ? "bg-primary/10 text-primary" :
                    a.status === "ausente" ? "bg-destructive/10 text-destructive" :
                    a.status === "atrasado" ? "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {a.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${a.status === "ausente" ? "text-muted-foreground line-through" : "text-foreground"}`}>{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.role === "professor" ? "Docente" : "Estudante"}</p>
                  </div>
                </div>
                <span className={`text-xs ${a.status === "ausente" ? "text-destructive" : "text-muted-foreground"}`}>
                  {a.status === "ausente" ? "—" : a.arrivalTime || "—"}
                </span>
                <div className="flex justify-end">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredAttendance.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum participante encontrado.</div>
          )}
        </Card>
      </TabsContent>

      {/* Conteúdos */}
      <TabsContent value="conteudos" className="space-y-2">
        {materials.length > 0 ? materials.map((mat, i) => (
          <Card key={i} className="p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: (discColor || "hsl(var(--primary))") + "15" }}>
              <FileText className="w-5 h-5" style={{ color: discColor }} />
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

      {/* Transcrição */}
      <TabsContent value="transcricao">
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Transcrição da Aula
          </h3>
          {transcript.map((seg, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                seg.speaker === "Professor" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              }`}>
                {seg.speaker === "Professor" ? "P" : "E"}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground mb-0.5">
                  {seg.speaker === "Professor" ? professorName : seg.speaker}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{seg.text}</p>
              </div>
            </div>
          ))}
        </Card>
      </TabsContent>

      {/* Resumo da Aula */}
      <TabsContent value="resumo">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" /> Resumo da Aula
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Helper to generate mock attendance — ALL students included
export function generateAttendance(professorName: string, studentNames: string[], lessonStartTime = "08:00"): AttendanceRecord[] {
  const records: AttendanceRecord[] = [
    { name: professorName, role: "professor", status: "presente", arrivalTime: lessonStartTime },
  ];

  // Shuffle-like distribution: ~60% present, ~20% late, ~20% absent
  studentNames.forEach((name, i) => {
    const mod = i % 10;
    if (mod < 6) {
      // Present on time
      const minutes = ["00", "01", "02", "03", "04", "05"];
      const h = parseInt(lessonStartTime.split(":")[0]);
      records.push({ name, role: "estudante", status: "presente", arrivalTime: `${String(h).padStart(2, "0")}:${minutes[i % minutes.length]}` });
    } else if (mod < 8) {
      // Late
      const h = parseInt(lessonStartTime.split(":")[0]);
      const lateMins = [12, 18, 22, 25, 30, 35];
      records.push({ name, role: "estudante", status: "atrasado", arrivalTime: `${String(h).padStart(2, "0")}:${lateMins[i % lateMins.length]}` });
    } else {
      // Absent
      records.push({ name, role: "estudante", status: "ausente" });
    }
  });

  return records;
}
