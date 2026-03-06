import { useParams, useNavigate, Link } from "react-router-dom";
import { coordDocentes, coordDisciplinas, coordCursoInfo, coordTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp, Building2, AlertCircle,
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
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{docente.name}</h2>
          <Badge variant="outline" className={`text-xs ${statusBg}`}>{statusLabel}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/coordenador/curso">
            <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-muted/50 transition-colors"><GraduationCap className="w-3 h-3" /> {coordCursoInfo.code}</Badge>
          </Link>
          <Link to="/coordenador/faculdade">
            <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-muted/50 transition-colors"><BookOpen className="w-3 h-3" /> {coordCursoInfo.faculty}</Badge>
          </Link>
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
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Ano Lectivo</p>
            </div>
            <p className="text-sm font-semibold text-foreground">2024/2025</p>
          </div>
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

      {/* Turmas */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Turmas Leccionadas
          </h3>
        </div>
        <div className="divide-y divide-border">
          {docenteDisciplinas.length > 0 ? docenteDisciplinas.map(disc => {
            const turma = coordTurmas.find(t => t.year === disc.year);
            return (
              <div key={disc.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{disc.name}</p>
                    <Badge variant="outline" className="text-[10px]">{disc.code}</Badge>
                    <Badge variant="outline" className="text-[10px]">{disc.year}º Ano</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{disc.diasAula} · {disc.location}</p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{disc.estudantes}</p>
                    <p className="text-[10px] text-muted-foreground">Estudantes</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${disc.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{disc.presenca}%</p>
                    <p className="text-[10px] text-muted-foreground">Presença</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${disc.media !== null && disc.media >= 10 ? "text-accent" : "text-destructive"}`}>{disc.media ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${disc.taxaAprovacao >= 70 ? "text-accent" : "text-destructive"}`}>{disc.taxaAprovacao}%</p>
                    <p className="text-[10px] text-muted-foreground">Aprovação</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Nenhuma turma encontrada.</div>
          )}
        </div>
      </Card>
    </div>
  );
}