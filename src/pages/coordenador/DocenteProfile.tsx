import { useParams, useNavigate } from "react-router-dom";
import { coordDocentes, coordDisciplinas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Mail, MessageCircle, Users, BookOpen,
  CheckCircle, Award, TrendingUp, ClipboardList, GraduationCap,
} from "lucide-react";

export default function CoordenadorDocenteProfile() {
  const { docenteId } = useParams();
  const navigate = useNavigate();
  const docente = coordDocentes.find(d => d.id === docenteId);

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
  const statusLabel = estado === "excelente" ? "Excelente" : estado === "risco" ? "Em Risco" : "Normal";
  const statusBg = estado === "excelente" ? "bg-accent/10 text-accent" : estado === "risco" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";

  const docenteDisciplinas = coordDisciplinas.filter(d => d.professor === docente.name);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Profile header */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {docente.name.replace("Prof. ", "").split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{docente.name}</h1>
            <Badge className={`${statusBg} border-0 text-[11px]`}>{statusLabel}</Badge>
            <Badge variant="outline" className="text-[10px]">{docente.status === "activo" ? "Activo" : docente.status === "licença" ? "Em Licença" : "Inactivo"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{docente.email}</p>
          <p className="text-sm text-muted-foreground">Departamento de {docente.department}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estudantes</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className="text-2xl font-bold text-foreground">{docente.estudantesTotal}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Presença</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${docente.presenca >= 90 ? "text-accent" : "text-destructive"}`}>{docente.presenca}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Média</p>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><Award className="w-3.5 h-3.5 text-accent" /></div>
          </div>
          <p className={`text-2xl font-bold ${docente.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{docente.mediaGeral}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Taxa Entrega</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${docente.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{docente.taxaEntrega}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Taxa Aprovado</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${docente.taxaAprovacao >= 70 ? "text-accent" : "text-destructive"}`}>{docente.taxaAprovacao}%</p>
        </Card>
      </div>


      {/* Turmas list */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Turmas</h3>
        </div>
        <div className="divide-y">
          {docenteDisciplinas.length > 0 ? docenteDisciplinas.map(disc => {
            const estadoDisc = disc.taxaAprovacao >= 85 ? "excelente" : disc.taxaAprovacao < 70 ? "risco" : "normal";
            const estadoStyle = estadoDisc === "excelente"
              ? "bg-accent/15 text-accent border-accent/30"
              : estadoDisc === "risco"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-muted text-muted-foreground border-border";
            return (
              <div key={disc.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Turma — {disc.year}º Ano</p>
                    <Badge variant="outline" className="text-[10px]">{disc.name}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{disc.estudantes} estudantes · {disc.diasAula} · {disc.location}</p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="text-center">
                    <p className={`font-semibold ${disc.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{disc.presenca}%</p>
                    <p className="text-[10px] text-muted-foreground">Presença</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${disc.media >= 10 ? "text-accent" : "text-destructive"}`}>{disc.media}</p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${disc.taxaAprovacao >= 70 ? "text-accent" : "text-destructive"}`}>{disc.taxaAprovacao}%</p>
                    <p className="text-[10px] text-muted-foreground">Aprovado</p>
                  </div>
                  <Badge variant="outline" className={`${estadoStyle} text-[10px]`}>
                    {estadoDisc === "excelente" ? "Excelente" : estadoDisc === "risco" ? "Em Risco" : "Normal"}
                  </Badge>
                </div>
              </div>
            );
          }) : (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Nenhuma turma associada.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
