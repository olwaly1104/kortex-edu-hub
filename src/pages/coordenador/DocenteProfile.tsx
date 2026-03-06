import { useParams, useNavigate } from "react-router-dom";
import { coordDocentes, coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp, Building2,
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
  const statusBg = estado === "excelente" ? "bg-accent/10 text-accent border-accent/30" : estado === "risco" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border";

  const docenteDisciplinas = coordDisciplinas.filter(d => d.professor === docente.name);

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
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{docente.name}</h2>
          <Badge variant="outline" className={`text-xs ${statusBg}`}>{statusLabel}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Departamento de {docente.department}</p>
          <Badge variant="outline" className="text-xs">{docente.status === "activo" ? "Activo" : docente.status === "licença" ? "Em Licença" : "Inactivo"}</Badge>
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Email</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.email}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Telefone</p>
            </div>
            <p className="text-sm font-semibold text-foreground">+244 934 567 890</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Morada</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Av. 4 de Fevereiro, Nº 120, Luanda</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            </div>
            <p className="text-sm font-semibold text-foreground">22/08/1978</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Departamento</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.department}</p>
          </div>
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
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Total Estudantes</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docente.estudantesTotal}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Cadeiras</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docenteDisciplinas.length}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Turmas</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docenteDisciplinas.length}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Presença</p>
            </div>
            <p className={`text-sm font-semibold ${docente.presenca >= 90 ? "text-accent" : "text-destructive"}`}>{docente.presenca}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
            <p className={`text-sm font-semibold ${docente.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{docente.mediaGeral}/20</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
            </div>
            <p className={`text-sm font-semibold ${docente.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{docente.taxaEntrega}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
            </div>
            <p className="text-sm font-semibold text-accent">88%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Taxa Aprovado</p>
            </div>
            <p className="text-sm font-semibold text-accent">82%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">Taxa Reprovado</p>
            </div>
            <p className="text-sm font-semibold text-destructive">18%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}