import { useParams, useNavigate } from "react-router-dom";
import { decanoEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle,
  Award, Users, Phone, MapPin, UserCheck, Calendar, GraduationCap,
  CheckCircle, ClipboardList,
} from "lucide-react";

const statusConfig = {
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

  const cfg = statusConfig[student.status];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">{student.name}</h1>
                  <Badge variant="outline" className={`text-[10px] ${cfg.bg}`}>{cfg.label}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <GraduationCap className="w-3 h-3" /> {student.course}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <Calendar className="w-3 h-3" /> {student.year}º Ano
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <Users className="w-3 h-3" /> Turma {student.turma}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" /> Mensagem
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { icon: Award, label: "Média Geral", value: student.media !== null ? `${student.media}/20` : "—", color: student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive" },
            { icon: CheckCircle, label: "Presença", value: `${student.presenca}%`, color: student.presenca >= 75 ? "text-accent" : "text-destructive" },
            { icon: ClipboardList, label: "Taxa Entrega", value: `${student.taxaEntrega}%`, color: student.taxaEntrega >= 80 ? "text-accent" : "text-destructive" },
            { icon: ClipboardList, label: "Tarefas", value: `${student.tarefasFeitas}/${student.tarefasTotal}`, color: "" },
            { icon: Award, label: "Avaliações", value: `${student.avaliacoesFeitas}/${student.avaliacoesTotal}`, color: "" },
            { icon: UserCheck, label: "Estado", value: cfg.label, color: student.status === "excelente" ? "text-accent" : student.status === "risco" ? "text-destructive" : "" },
          ].map(kpi => (
            <div key={kpi.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color || "text-foreground"}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Informações Pessoais</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: "Email", value: student.email },
            { icon: GraduationCap, label: "Curso", value: student.course },
            { icon: Calendar, label: "Ano", value: `${student.year}º Ano` },
            { icon: Users, label: "Turma", value: `Turma ${student.turma}` },
          ].map(info => (
            <div key={info.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <info.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{info.label}</p>
                <p className="text-sm font-medium text-foreground">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
