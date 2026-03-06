import { useParams, useNavigate } from "react-router-dom";
import { coordEstudantes, coordDisciplinas, coordCursoInfo, coordTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, BookOpen,
  Award, Users, Phone, MapPin, UserCheck, Calendar, GraduationCap,
  CheckCircle, ClipboardList, TrendingUp,
} from "lucide-react";

const statusConfig = {
  excelente: { label: "Excelente", bg: "bg-accent/10 text-accent border-accent/30" },
  normal: { label: "Normal", bg: "bg-muted text-muted-foreground border-border" },
  risco: { label: "Em Risco", bg: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function CoordenadorEstudanteProfile() {
  const { estudanteId } = useParams();
  const navigate = useNavigate();
  const student = coordEstudantes.find(s => s.id === estudanteId);

  if (!student) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Estudante não encontrado.</p>
      </div>
    );
  }

  const sc = statusConfig[student.status];
  const yearDiscs = coordDisciplinas.filter(d => d.year === student.year);
  const studentTurmas = coordTurmas.filter(t => t.year === student.year);

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
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
          <Badge variant="outline" className={`text-xs ${sc.bg}`}>{sc.label}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {coordCursoInfo.code}</Badge>
          <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> {coordCursoInfo.faculty}</Badge>
          <Badge variant="outline" className="text-[10px]">{student.year}º Ano · Turma {student.turma}</Badge>
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
            <p className="text-sm font-semibold text-foreground">{student.email}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Telefone</p>
            </div>
            <p className="text-sm font-semibold text-foreground">+244 923 456 789</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Morada</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Rua da Samba, Nº 45, Luanda</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            </div>
            <p className="text-sm font-semibold text-foreground">15/03/2001</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Encarregado de Educação</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Maria Santos</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Nº Encarregado</p>
            </div>
            <p className="text-sm font-semibold text-foreground">+244 912 345 678</p>
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
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Curso</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{coordCursoInfo.name}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Ano Curricular</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{student.year}º Ano</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Turma</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Turma {student.turma}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Cadeiras</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{yearDiscs.length}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Presença</p>
            </div>
            <p className={`text-sm font-semibold ${student.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{student.presenca}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
            <p className={`text-sm font-semibold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}/20</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
            </div>
            <p className={`text-sm font-semibold ${student.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{student.taxaEntrega}%</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Avaliações</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{student.avaliacoesFeitas}/{student.avaliacoesTotal}</p>
          </div>
        </div>
      </Card>

      {/* Cadeiras */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Cadeiras do {student.year}º Ano
          </h3>
        </div>
        <div className="divide-y divide-border">
          {yearDiscs.length > 0 ? yearDiscs.map(disc => (
            <div key={disc.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{disc.name}</p>
                  <Badge variant="outline" className="text-[10px]">{disc.code}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{disc.professor} · {disc.diasAula} · {disc.location}</p>
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0">
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
          )) : (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Nenhuma cadeira encontrada.</div>
          )}
        </div>
      </Card>

    </div>
  );
}