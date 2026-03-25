import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import { FileText, CalendarDays, Award, Users, ChevronRight, Clock, CheckCircle, TrendingUp } from "lucide-react";

const states: EstadoCandidatura[] = ["pendente", "docs_aprovados", "convocado", "aguarda_resultados", "aprovado", "reprovado", "desistiu"];

export default function AdmissoesDashboard() {
  const navigate = useNavigate();
  const total = candidaturas.length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const avaliados = candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : 0;
  const now = new Date();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Admissões
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do processo de admissão</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Candidaturas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-secondary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{candidaturas.filter(c => c.estado === "pendente").length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aprovados</span>
          </div>
          <p className="text-2xl font-bold text-accent">{aprovados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Aprovação</span>
          </div>
          <p className={`text-2xl font-bold ${taxaAprovacao >= 50 ? "text-accent" : "text-destructive"}`}>{taxaAprovacao}%</p>
        </Card>
      </div>

      {/* Pipeline */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Pipeline de Estados
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {states.map(s => (
            <div key={s} className="text-center p-4 rounded-xl border border-border bg-card">
              <p className="text-2xl font-bold text-foreground">{candidaturas.filter(c => c.estado === s).length}</p>
              <Badge className={`mt-1.5 text-[10px] border-0 ${estadoColors[s]}`}>{estadoLabels[s]}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group" onClick={() => navigate("/secretaria/admissoes/candidaturas")}>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Candidaturas</p>
              <p className="text-sm text-muted-foreground">{total} total</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
        <Card className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group" onClick={() => navigate("/secretaria/admissoes/convocacoes")}>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-secondary" /></div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Convocações</p>
              <p className="text-sm text-muted-foreground">{sessoesProva.length} sessões</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
        <Card className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group" onClick={() => navigate("/secretaria/admissoes/resultados")}>
          <div className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center"><Award className="w-5 h-5 text-accent" /></div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Resultados</p>
              <p className="text-sm text-muted-foreground">{avaliados} avaliados</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
      </div>
    </div>
  );
}
