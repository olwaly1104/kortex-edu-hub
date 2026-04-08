import { useParams, useNavigate } from "react-router-dom";
import { decanoEstudantes, decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, UserCheck, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp,
} from "lucide-react";
import placeholderStudent from "@/assets/placeholder-student.jpg";

const statusConfig: Record<string, { label: string; bg: string }> = {
  excelente: { label: "Excelente", bg: "bg-accent/10 text-accent border-accent/30" },
  normal: { label: "Normal", bg: "bg-muted text-muted-foreground border-border" },
  risco: { label: "Em Risco", bg: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function DecanoEstudanteProfile() {
  const { estudanteId } = useParams();
  const navigate = useNavigate();
  const student = decanoEstudantes.find(s => s.id === estudanteId);

  if (!student) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Estudante não encontrado.</p>
      </div>
    );
  }

  const sc = statusConfig[student.status];
  const curso = decanoFaculty.courses.find(c => c.name === student.course);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Perfil do Estudante
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações pessoais e académicas</p>
      </div>

      {/* Identity banner */}
      <Card className="px-5 py-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            <img src={placeholderStudent} alt="Foto do estudante" className="w-full h-full object-cover" loading="lazy" width={56} height={56} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
              <Badge variant="outline" className={`text-xs ${sc.bg}`}>{sc.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {student.course}</Badge>
              <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> {decanoFaculty.name}</Badge>
              <Badge variant="outline" className="text-[10px]">{student.year}º Ano · Turma {student.turma}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <Mail className="w-3.5 h-3.5" /> Email
              </Button>
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
          {[
            { icon: Mail, label: "Email", value: student.email, color: "bg-primary/10 text-primary" },
            { icon: Phone, label: "Telefone", value: "+244 923 456 789", color: "bg-secondary/10 text-secondary" },
            { icon: MapPin, label: "Morada", value: "Rua da Samba, Nº 45, Luanda", color: "bg-accent/10 text-accent" },
            { icon: Calendar, label: "Data de Nascimento", value: "15/03/2001", color: "bg-secondary/10 text-secondary" },
            { icon: UserCheck, label: "Encarregado de Educação", value: "Maria Santos", color: "bg-primary/10 text-primary" },
            { icon: Phone, label: "Nº Encarregado", value: "+244 912 345 678", color: "bg-secondary/10 text-secondary" },
          ].map(info => (
            <div key={info.label} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color.split(" ")[0]}`}>
                  <info.icon className={`w-4 h-4 ${info.color.split(" ")[1]}`} />
                </div>
                <p className="text-sm text-muted-foreground">{info.label}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{info.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Academic Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações Académicas</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Curso</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{student.course}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Ano Curricular</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{student.year}º Ano</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Users className="w-4 h-4 text-accent" /></div>
              <p className="text-sm text-muted-foreground">Turma</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Turma {student.turma}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Cadeiras</p>
            </div>
            <p className="text-sm font-semibold text-foreground">6</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-muted-foreground" /></div>
              <p className="text-sm text-muted-foreground">Presença</p>
            </div>
            <p className={`text-sm font-semibold ${student.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{student.presenca}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent" /></div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
            <p className={`text-sm font-semibold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}/20</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
            </div>
            <p className={`text-sm font-semibold ${student.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{student.taxaEntrega}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Avaliações</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{student.avaliacoesFeitas}/{student.avaliacoesTotal}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
