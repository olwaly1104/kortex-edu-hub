import { useParams, useNavigate } from "react-router-dom";
import { coordEstudantes, coordDisciplinas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Mail, MessageCircle, Users, BookOpen,
  CheckCircle, Clock, BarChart3, Award, ClipboardList, TrendingUp,
} from "lucide-react";

const statusConfig = {
  excelente: { label: "Excelente", bg: "bg-accent/10 text-accent" },
  normal: { label: "Normal", bg: "bg-muted text-muted-foreground" },
  risco: { label: "Em Risco", bg: "bg-destructive/10 text-destructive" },
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
            <Badge className={`${sc.bg} border-0 text-[11px]`}>{sc.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{student.email}</p>
          <p className="text-sm text-muted-foreground">{student.year}º Ano · Turma {student.turma} · {coordCursoInfo.name}</p>
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
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${student.presenca >= 75 ? "text-foreground" : "text-destructive"}`}>{student.presenca}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Média</p>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center"><Award className="w-3.5 h-3.5 text-accent" /></div>
          </div>
          <p className={`text-2xl font-bold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Taxa Entrega</p>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-3.5 h-3.5 text-primary" /></div>
          </div>
          <p className={`text-2xl font-bold ${student.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{student.taxaEntrega}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estado</p>
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" /></div>
          </div>
          <Badge className={`${sc.bg} border-0 text-xs`}>{sc.label}</Badge>
        </Card>
      </div>

      {/* Cadeiras do Ano */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b bg-muted/30">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Cadeiras do {student.year}º Ano</h3>
        </div>
        <div className="divide-y">
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
                  <p className="text-[10px] text-muted-foreground">Aprovado</p>
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
