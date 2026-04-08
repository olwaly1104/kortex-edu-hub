import { useParams, useNavigate } from "react-router-dom";
import { decanoDocentes, decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp, Building2,
} from "lucide-react";
import placeholderProfessor from "@/assets/placeholder-professor.jpg";

const statusConfig: Record<string, { label: string; bg: string }> = {
  excelente: { label: "Excelente", bg: "bg-accent/10 text-accent border-accent/30" },
  normal: { label: "Normal", bg: "bg-muted text-muted-foreground border-border" },
  risco: { label: "Em Risco", bg: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function DecanoDocenteProfile() {
  const { docenteId } = useParams();
  const navigate = useNavigate();
  const docente = decanoDocentes.find(d => d.id === docenteId);

  if (!docente) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Docente não encontrado.</p>
      </div>
    );
  }

  const estado = (docente.presenca < 85 || docente.taxaEntrega < 80 || docente.mediaGeral < 11)
    ? "risco"
    : (docente.presenca >= 93 && docente.taxaEntrega >= 90 && docente.mediaGeral >= 14)
      ? "excelente"
      : "normal";
  const sc = statusConfig[estado];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Perfil do Docente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações pessoais e académicas</p>
      </div>

      {/* Identity banner */}
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-primary/20">
            <img src={placeholderProfessor} alt="Foto do docente" className="w-full h-full object-cover" loading="lazy" width={64} height={64} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{docente.name}</h2>
              <Badge variant="outline" className={`text-xs ${sc.bg}`}>{sc.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {docente.course}</Badge>
              <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> {decanoFaculty.name}</Badge>
              <Badge variant="outline" className="text-[10px]">Departamento de {docente.department}</Badge>
              <Badge variant="outline" className="text-[10px]">{docente.status === "activo" ? "Activo" : docente.status === "licença" ? "Em Licença" : "Inactivo"}</Badge>
            </div>
            <div className="flex items-center gap-2 pt-1">
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
            { icon: Mail, label: "Email", value: docente.email, color: "bg-primary/10 text-primary" },
            { icon: Phone, label: "Telefone", value: "+244 934 567 890", color: "bg-secondary/10 text-secondary" },
            { icon: MapPin, label: "Morada", value: "Av. 4 de Fevereiro, Nº 120, Luanda", color: "bg-accent/10 text-accent" },
            { icon: Calendar, label: "Data de Nascimento", value: "22/08/1978", color: "bg-secondary/10 text-secondary" },
            { icon: Building2, label: "Departamento", value: docente.department, color: "bg-primary/10 text-primary" },
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
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Ano Lectivo</p>
            </div>
            <p className="text-sm font-semibold text-foreground">2024/2025</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Total Estudantes</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.estudantesTotal}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Cadeiras</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.disciplinas}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Turmas</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.turmas}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-muted-foreground" /></div>
              <p className="text-sm text-muted-foreground">Presença</p>
            </div>
            <p className={`text-sm font-semibold ${docente.presenca >= 90 ? "text-accent" : "text-destructive"}`}>{docente.presenca}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent" /></div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
            <p className={`text-sm font-semibold ${docente.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{docente.mediaGeral}/20</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
            </div>
            <p className={`text-sm font-semibold ${docente.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{docente.taxaEntrega}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
              <p className="text-sm text-muted-foreground">Taxa Aprovado</p>
            </div>
            <p className="text-sm font-semibold text-accent">{docente.taxaAprovacao}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-destructive" /></div>
              <p className="text-sm text-muted-foreground">Taxa Reprovado</p>
            </div>
            <p className="text-sm font-semibold text-destructive">{100 - docente.taxaAprovacao}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
