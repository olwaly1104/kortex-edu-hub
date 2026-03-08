import { useAuth } from "@/contexts/AuthContext";
import { profDisciplines, profStudents, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen,
  Users, GraduationCap, CheckCircle, TrendingUp,
  ClipboardList, Award, Building2, UserCheck, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const profInfo = {
  email: "antonio.silva@upra.edu.ao",
  phone: "+244 934 567 890",
  address: "Av. 4 de Fevereiro, Nº 120, Luanda",
  birthDate: "22/08/1978",
  department: "Ciências da Computação",
  faculty: "Faculdade de Engenharia e Tecnologias",
  course: "Engenharia Informática",
  yearJoined: 2015,
};

function InfoRow({ icon: Icon, label, value, color = "bg-primary/10 text-primary", valueClass = "text-foreground" }: {
  icon: any; label: string; value: string | number; color?: string; valueClass?: string;
}) {
  const [bg, text] = color.split(" ");
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${text}`} />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function ProfessorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalStudents = allTurmas.reduce((s, t) => s + t.students, 0);

  const allStudentsUnique = profStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
  const overallAttendance = allStudentsUnique.length > 0
    ? Math.round(allStudentsUnique.reduce((s, st) => s + st.attendance, 0) / allStudentsUnique.length)
    : 0;

  const graded = allStudentsUnique.filter(s => s.avgGrade !== null);
  const avgGrade = graded.length > 0
    ? Math.round(graded.reduce((s, st) => s + (st.avgGrade || 0), 0) / graded.length * 10) / 10
    : null;
  const approved = graded.filter(s => (s.avgGrade || 0) >= 10).length;
  const taxaAprovacao = graded.length > 0 ? Math.round((approved / graded.length) * 100) : null;
  const taxaReprovacao = taxaAprovacao !== null ? 100 - taxaAprovacao : null;

  const taxaEntrega = allStudentsUnique.length > 0
    ? Math.round(allStudentsUnique.reduce((s, st) => s + (st.submittedTasks / Math.max(st.totalTasks, 1) * 100), 0) / allStudentsUnique.length)
    : 0;

  const estado = (overallAttendance < 85 || taxaEntrega < 80 || (avgGrade !== null && avgGrade < 11))
    ? "risco"
    : (overallAttendance >= 93 && taxaEntrega >= 90 && avgGrade !== null && avgGrade >= 14)
      ? "excelente"
      : "normal";
  const statusLabel = estado === "excelente" ? "Excelente" : estado === "risco" ? "Em Risco" : "Normal";
  const statusBg = estado === "excelente" ? "bg-accent/10 text-accent border-accent/30" : estado === "risco" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" /> Meu Perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações pessoais e académicas</p>
      </div>

      {/* Identity banner */}
      <Card className="px-5 py-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/placeholder.svg" alt="Foto" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">{user?.name || "Prof. António Silva"}</h2>
              <Badge variant="outline" className={`text-xs ${statusBg}`}>{statusLabel}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {profInfo.course}</Badge>
              <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> {profInfo.faculty}</Badge>
              <Badge variant="outline" className="text-[10px]">Dept. {profInfo.department}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>
        </div>
        <div className="divide-y divide-border">
          <InfoRow icon={Mail} label="Email" value={profInfo.email} color="bg-primary/10 text-primary" />
          <InfoRow icon={Phone} label="Telefone" value={profInfo.phone} color="bg-secondary/10 text-secondary" />
          <InfoRow icon={MapPin} label="Morada" value={profInfo.address} color="bg-accent/10 text-accent" />
          <InfoRow icon={Calendar} label="Data de Nascimento" value={profInfo.birthDate} color="bg-secondary/10 text-secondary" />
          <InfoRow icon={Building2} label="Departamento" value={profInfo.department} color="bg-primary/10 text-primary" />
        </div>
      </Card>

      {/* Academic Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações Académicas</h3>
        </div>
        <div className="divide-y divide-border">
          <InfoRow icon={Calendar} label="Ano Lectivo" value="2024/2025" color="bg-secondary/10 text-secondary" />
          <InfoRow icon={Users} label="Total Estudantes" value={totalStudents} color="bg-primary/10 text-primary" />
          <InfoRow icon={BookOpen} label="Cadeiras" value={profDisciplines.length} color="bg-primary/10 text-primary" />
          <InfoRow icon={GraduationCap} label="Turmas" value={allTurmas.length} color="bg-primary/10 text-primary" />
          <InfoRow icon={CheckCircle} label="Presença" value={`${overallAttendance}%`}
            color={`${overallAttendance >= 90 ? "bg-accent/10" : "bg-destructive/10"} ${overallAttendance >= 90 ? "text-accent" : "text-destructive"}`}
            valueClass={overallAttendance >= 90 ? "text-accent" : "text-destructive"} />
          <InfoRow icon={TrendingUp} label="Média Geral" value={avgGrade !== null ? `${avgGrade}/20` : "—"}
            color={`${avgGrade !== null && avgGrade >= 10 ? "bg-accent/10" : "bg-destructive/10"} ${avgGrade !== null && avgGrade >= 10 ? "text-accent" : "text-destructive"}`}
            valueClass={avgGrade !== null && avgGrade >= 10 ? "text-accent" : "text-destructive"} />
          <InfoRow icon={ClipboardList} label="Taxa de Entrega" value={`${taxaEntrega}%`}
            color={`${taxaEntrega >= 80 ? "bg-accent/10" : "bg-destructive/10"} ${taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}
            valueClass={taxaEntrega >= 80 ? "text-accent" : "text-destructive"} />
          <InfoRow icon={Award} label="Taxa Aprovado" value={taxaAprovacao !== null ? `${taxaAprovacao}%` : "—"} color="bg-accent/10 text-accent" valueClass="text-accent" />
          <InfoRow icon={AlertCircle} label="Taxa Reprovado" value={taxaReprovacao !== null ? `${taxaReprovacao}%` : "—"} color="bg-destructive/10 text-destructive" valueClass="text-destructive" />
        </div>
      </Card>

      {/* Turmas */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> As Minhas Turmas
          </h3>
        </div>
        <div className="divide-y divide-border">
          {allTurmas.map(turma => {
            const turmaStudents = profStudents.filter(s => s.turmaId === turma.id);
            const unique = turmaStudents.filter((s, i, arr) => arr.findIndex(x => x.email === s.email) === i);
            const avg = unique.length > 0 && unique.some(s => s.avgGrade !== null)
              ? Math.round(unique.filter(s => s.avgGrade !== null).reduce((s, st) => s + (st.avgGrade || 0), 0) / unique.filter(s => s.avgGrade !== null).length * 10) / 10
              : null;
            const att = unique.length > 0 ? Math.round(unique.reduce((s, st) => s + st.attendance, 0) / unique.length) : 0;
            const gr = unique.filter(s => s.avgGrade !== null);
            const ap = gr.filter(s => (s.avgGrade || 0) >= 10).length;
            const taxa = gr.length > 0 ? Math.round((ap / gr.length) * 100) : null;

            return (
              <div key={turma.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{turma.name}</p>
                    <Badge variant="outline" className="text-[10px]">{turma.year}º Ano</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{turma.course} · {turma.students} estudantes</p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="text-center">
                    <p className={`font-semibold ${att >= 75 ? "text-accent" : "text-destructive"}`}>{att}%</p>
                    <p className="text-[10px] text-muted-foreground">Presença</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${avg !== null && avg >= 10 ? "text-accent" : "text-destructive"}`}>{avg ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${taxa !== null && taxa >= 70 ? "text-accent" : "text-destructive"}`}>{taxa ?? "—"}%</p>
                    <p className="text-[10px] text-muted-foreground">Aprovação</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
