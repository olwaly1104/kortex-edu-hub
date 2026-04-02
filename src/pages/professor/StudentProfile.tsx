import { useParams, useNavigate } from "react-router-dom";
import { profStudents, profDisciplines, profTasks } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Mail, MessageCircle, Users, BookOpen,
  CheckCircle, Clock, BarChart3, Calendar, AlertCircle,
} from "lucide-react";
import placeholderStudent from "@/assets/placeholder-student.jpg";

export default function ProfessorStudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = profStudents.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Estudante não encontrado.</p>
      </div>
    );
  }

  const disc = profDisciplines.find(d => d.id === student.disciplineId);
  const studentTasks = profTasks.filter(t => t.disciplineId === student.disciplineId);
  const statusColor = student.status === "excelente" ? "text-accent" : student.status === "risco" ? "text-destructive" : "text-foreground";
  const statusLabel = student.status === "excelente" ? "Excelente" : student.status === "risco" ? "Em Risco" : "Normal";
  const statusBg = student.status === "excelente" ? "bg-accent/10 text-accent" : student.status === "risco" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Profile header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
            <Badge className={`${statusBg} border-0 text-[11px]`}>{statusLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{student.email}</p>
          <p className="text-sm text-muted-foreground">{student.turma}</p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5" /> Enviar Mensagem
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Mail className="w-3.5 h-3.5" /> Enviar Email
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Presença</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${student.attendance >= 75 ? "text-foreground" : "text-destructive"}`}>{student.attendance}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Média Geral</p>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 text-accent" /></div>
          </div>
          <p className={`text-2xl font-bold ${student.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{student.avgGrade}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Entregas</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{student.submittedTasks}/{student.totalTasks}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Última Actividade</p>
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-muted-foreground" /></div>
          </div>
          <p className="text-lg font-bold text-foreground">{student.lastActive}</p>
        </Card>
      </div>

      {/* Discipline info */}
      {disc && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: disc.color }} />
            <span className="text-sm font-semibold" style={{ color: disc.color }}>{disc.name}</span>
            <Badge variant="outline" className="text-[10px]">{disc.code}</Badge>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Presença</span>
                <span className="font-semibold">{student.attendance}%</span>
              </div>
              <Progress value={student.attendance} className="h-1.5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tarefas Submetidas</span>
                <span className="font-semibold">{student.submittedTasks}/{student.totalTasks}</span>
              </div>
              <Progress value={student.totalTasks > 0 ? (student.submittedTasks / student.totalTasks) * 100 : 0} className="h-1.5" />
            </div>
          </div>
        </Card>
      )}

      {/* Task history */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Histórico de Tarefas</h3>
        </div>
        <div className="divide-y">
          {studentTasks.map(task => {
            const taskDisc = profDisciplines.find(d => d.id === task.disciplineId);
            return (
              <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/professor/tasks/${task.id}`)}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: taskDisc?.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-[11px] text-muted-foreground">{task.dueDate} · Peso {task.weight}%</p>
                </div>
                <Badge className={task.status === "encerrada" ? "bg-accent/10 text-accent border-0 text-[10px]" : task.status === "publicada" ? "bg-primary/10 text-primary border-0 text-[10px]" : "bg-muted text-muted-foreground border-0 text-[10px]"}>
                  {task.status === "encerrada" ? "Encerrada" : task.status === "publicada" ? "Activa" : "Rascunho"}
                </Badge>
                {task.avgGrade !== null && (
                  <span className={`text-sm font-bold ${task.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{task.avgGrade}/20</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
