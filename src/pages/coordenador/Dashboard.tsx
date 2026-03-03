import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { coordCursoInfo, coordAprovacoes, coordTurmas, coordAnuncios } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, Clock, Award, ChevronRight,
  AlertTriangle, FileText, Calendar as CalendarIcon,
  Megaphone, ArrowLeft, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  média: "bg-secondary/10 text-secondary border-secondary/20",
  baixa: "bg-muted text-muted-foreground border-border",
};

const typeIcons: Record<string, React.ElementType> = {
  nota: Award,
  plano: FileText,
  horário: CalendarIcon,
  transferência: Users,
  recurso: AlertTriangle,
};

const anuncioTypeStyles: Record<string, string> = {
  urgente: "bg-destructive/10 text-destructive",
  academico: "bg-primary/10 text-primary",
  geral: "bg-muted text-muted-foreground",
};

export default function CoordenadorCursoDashboard() {
  const { user } = useAuth();
  const info = coordCursoInfo;
  const pendentes = coordAprovacoes.filter(a => a.status === "pendente");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAllRisk, setShowAllRisk] = useState(false);

  // Turmas em risco: presença < 80% OR média < 12 OR taxaEntrega < 85%
  const turmasEmRisco = coordTurmas.filter(
    t => t.presenca < 80 || t.media < 12 || t.taxaEntrega < 85
  );

  const stats = [
    { icon: Users, label: "Total Estudantes", value: info.totalEstudantes, color: "text-accent bg-accent/10" },
    { icon: BookOpen, label: "Cadeiras Activas", value: info.disciplinasActivas, color: "text-primary bg-primary/10" },
    { icon: Clock, label: "Aprovações Pendentes", value: info.aprovacoesPendentes, color: "text-secondary bg-secondary/10" },
    { icon: Award, label: "Média Geral", value: info.mediaGeral, color: "text-accent bg-accent/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bom dia, {user?.name?.split(" ").pop()} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Coordenador de Curso — {info.name} • {info.faculty}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{info.code}</Badge>
            <Badge className="bg-accent text-accent-foreground text-xs">{info.years.length} Anos</Badge>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" /> Calendário
            </h2>
            <Card className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="pointer-events-auto"
              />
            </Card>
          </div>

          {/* Aprovações Pendentes (moved from right column) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" /> Aprovações Pendentes
              </h2>
              <Link to="/coordenador/aprovacoes" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Pedido</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Requerente</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Data</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendentes.slice(0, 5).map(ap => {
                      const Icon = typeIcons[ap.type] || FileText;
                      return (
                        <tr key={ap.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${priorityStyles[ap.priority]}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium text-foreground line-clamp-1">{ap.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{ap.requester}</td>
                          <td className="p-3 text-center text-muted-foreground text-xs">{ap.date}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`text-[10px] ${priorityStyles[ap.priority]}`}>
                              {ap.priority}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Anúncios */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-primary" /> Anúncios
            </h2>
            <div className="space-y-3">
              {coordAnuncios.slice(0, 4).map(an => (
                <Card key={an.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${anuncioTypeStyles[an.type]}`}>
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{an.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{an.author} • {an.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Turmas em Risco */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Turmas em Risco
              </h2>
              {!showAllRisk && turmasEmRisco.length > 3 && (
                <button
                  onClick={() => setShowAllRisk(true)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todos <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {showAllRisk && (
                <button
                  onClick={() => setShowAllRisk(false)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Fechar
                </button>
              )}
            </div>

            {turmasEmRisco.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground text-center">Nenhuma turma em risco 🎉</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {(showAllRisk ? turmasEmRisco : turmasEmRisco.slice(0, 3)).map(t => {
                  const reasons: string[] = [];
                  if (t.presenca < 80) reasons.push(`Pres. ${t.presenca}%`);
                  if (t.media < 12) reasons.push(`Média ${t.media}`);
                  if (t.taxaEntrega < 85) reasons.push(`Entrega ${t.taxaEntrega}%`);

                  return (
                    <Link key={t.id} to={`/coordenador/anos/${t.year}/turma/${t.id}`}>
                      <Card className="p-3 border-l-[3px] border-l-destructive hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {t.name} — {t.year}º Ano
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {reasons.map((r, i) => (
                                <span key={i} className="text-[10px] text-destructive font-medium">{r}</span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
