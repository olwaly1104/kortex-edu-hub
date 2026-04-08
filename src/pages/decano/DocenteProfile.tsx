import { useParams, useNavigate } from "react-router-dom";
import { decanoDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle,
  Award, Users, GraduationCap, Calendar,
  CheckCircle, ClipboardList, Building2,
} from "lucide-react";

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

  const cfg = statusConfig[estado];

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
                {docente.name.replace("Prof. ", "").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">{docente.name}</h1>
                  <Badge variant="outline" className={`text-[10px] ${cfg.bg}`}>{cfg.label}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${docente.status === "activo" ? "bg-accent/10 text-accent border-accent/30" : docente.status === "licença" ? "bg-secondary/10 text-secondary border-secondary/30" : "bg-muted text-muted-foreground"}`}>
                    {docente.status === "activo" ? "Activo" : docente.status === "licença" ? "Em Licença" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <Building2 className="w-3 h-3" /> {docente.department}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <GraduationCap className="w-3 h-3" /> {docente.course}
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
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-7 gap-4">
          {[
            { icon: Award, label: "Média Geral", value: `${docente.mediaGeral}/20`, color: docente.mediaGeral >= 10 ? "text-accent" : "text-destructive" },
            { icon: CheckCircle, label: "Presença", value: `${docente.presenca}%`, color: docente.presenca >= 90 ? "text-accent" : "text-destructive" },
            { icon: ClipboardList, label: "Taxa Entrega", value: `${docente.taxaEntrega}%`, color: docente.taxaEntrega >= 80 ? "text-accent" : "text-destructive" },
            { icon: CheckCircle, label: "Taxa Aprovado", value: `${docente.taxaAprovacao}%`, color: docente.taxaAprovacao >= 70 ? "text-accent" : "text-destructive" },
            { icon: Users, label: "Estudantes", value: docente.estudantesTotal, color: "" },
            { icon: GraduationCap, label: "Cadeiras", value: docente.disciplinas, color: "" },
            { icon: Calendar, label: "Turmas", value: docente.turmas, color: "" },
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

      {/* Contact Info */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Informações</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: "Email", value: docente.email },
            { icon: Building2, label: "Departamento", value: docente.department },
            { icon: GraduationCap, label: "Curso", value: docente.course },
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
