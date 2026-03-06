import { coordCursoInfo, coordDocentes, coordEstudantes, coordTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Users, BookOpen, GraduationCap, Award, Clock,
  ChevronRight, BarChart3, CheckCircle, XCircle,
  Building2, UserCheck, ClipboardList, TrendingUp,
} from "lucide-react";

export default function CursoDetail() {
  const info = coordCursoInfo;

  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalDisciplinas = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const avgTaxaSucesso = Math.round(info.years.reduce((s, y) => s + y.taxaSucesso, 0) / info.years.length);

  const docentesActivos = coordDocentes.filter(d => d.status === "activo").length;
  const estudantesRisco = coordEstudantes.filter(e => e.status === "risco").length;
  const estudantesExcelente = coordEstudantes.filter(e => e.status === "excelente").length;

  const avgPresenca = Math.round(coordEstudantes.reduce((s, e) => s + e.presenca, 0) / coordEstudantes.length);
  const avgEntrega = Math.round(coordEstudantes.reduce((s, e) => s + e.taxaEntrega, 0) / coordEstudantes.length);

  const graded = coordEstudantes.filter(e => e.media !== null && e.media !== undefined);
  const aprovados = graded.filter(e => (e.media || 0) >= 10).length;
  const reprovados = graded.length - aprovados;
  const taxaAprov = graded.length > 0 ? Math.round((aprovados / graded.length) * 100) : 0;
  const taxaReprov = graded.length > 0 ? Math.round((reprovados / graded.length) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Detalhes do Curso
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral completa do curso</p>
      </div>

      {/* Course Identity Card */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{info.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{info.faculty}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">{info.code}</Badge>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{info.years.length} Anos</Badge>
              <Badge className="bg-accent/10 text-accent border-0 text-xs">{totalTurmas} Turmas</Badge>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Coordenador</p>
            <p className="text-sm font-semibold text-foreground mt-1">{info.coordinator}</p>
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Estudantes", value: info.totalEstudantes, icon: Users, bg: "bg-primary/10", color: "text-primary" },
          { label: "Docentes", value: `${docentesActivos}/${coordDocentes.length}`, icon: UserCheck, bg: "bg-secondary/10", color: "text-secondary" },
          { label: "Cadeiras", value: totalDisciplinas, icon: BookOpen, bg: "bg-accent/10", color: "text-accent" },
          { label: "Média Geral", value: `${info.mediaGeral}/20`, icon: BarChart3, bg: "bg-primary/10", color: "text-primary", valueColor: info.mediaGeral >= 10 ? "text-accent" : "text-destructive" },
          { label: "Taxa de Sucesso", value: `${avgTaxaSucesso}%`, icon: TrendingUp, bg: "bg-accent/10", color: "text-accent", valueColor: avgTaxaSucesso >= 70 ? "text-accent" : "text-destructive" },
        ].map(k => (
          <div key={k.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${k.valueColor || "text-foreground"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Performance Geral
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Presença</span>
                <span className={`font-semibold ${avgPresenca >= 80 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</span>
              </div>
              <Progress value={avgPresenca} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Taxa de Entrega</span>
                <span className={`font-semibold ${avgEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{avgEntrega}%</span>
              </div>
              <Progress value={avgEntrega} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Taxa de Aprovação</span>
                <span className={`font-semibold ${taxaAprov >= 70 ? "text-accent" : "text-destructive"}`}>{taxaAprov}%</span>
              </div>
              <Progress value={taxaAprov} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Taxa de Reprovação</span>
                <span className={`font-semibold ${taxaReprov > 30 ? "text-destructive" : "text-muted-foreground"}`}>{taxaReprov}%</span>
              </div>
              <Progress value={taxaReprov} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" /> Distribuição de Estudantes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-medium text-foreground">Excelente</span>
              </div>
              <span className="text-sm font-bold text-accent">{estudantesExcelente}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-foreground">Normal</span>
              </div>
              <span className="text-sm font-bold text-foreground">{coordEstudantes.filter(e => e.status === "normal").length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-xs font-medium text-foreground">Em Risco</span>
              </div>
              <span className="text-sm font-bold text-destructive">{estudantesRisco}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Years Breakdown */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> Anos Curriculares
          </h3>
          <Link to="/coordenador/anos" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {info.years.map(y => {
            const yearStudents = coordEstudantes.filter(e => e.year === y.year);
            const yearRisco = yearStudents.filter(e => e.status === "risco").length;
            const statusLabel = y.taxaSucesso >= 85 ? "Excelente" : y.taxaSucesso < 70 ? "Em Risco" : "Normal";
            const statusClass = y.taxaSucesso >= 85 ? "bg-accent/10 text-accent border-accent/30" : y.taxaSucesso < 70 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30";

            return (
              <Link key={y.year} to={`/coordenador/anos/${y.year}`} className="block">
                <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{y.year}º Ano</h4>
                    <Badge className={`text-[10px] border ${statusClass}`}>{statusLabel}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-foreground">{y.estudantes}</p>
                      <p className="text-[9px] text-muted-foreground">Estudantes</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-lg font-bold text-foreground">{y.turmas}</p>
                      <p className="text-[9px] text-muted-foreground">Turmas</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Cadeiras</span>
                      <span className="font-semibold text-foreground">{y.disciplinas}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Média</span>
                      <span className={`font-semibold ${y.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{y.mediaGeral}/20</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Sucesso</span>
                      <span className={`font-semibold ${y.taxaSucesso >= 70 ? "text-accent" : "text-destructive"}`}>{y.taxaSucesso}%</span>
                    </div>
                    {yearRisco > 0 && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Em Risco</span>
                        <span className="font-semibold text-destructive">{yearRisco}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center pt-1 text-[10px] text-muted-foreground/60">
                    Ver detalhes <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Estudantes", icon: Users, to: "/coordenador/estudantes", desc: `${info.totalEstudantes} matriculados` },
          { label: "Docentes", icon: UserCheck, to: "/coordenador/docentes", desc: `${coordDocentes.length} no curso` },
          { label: "Cadeiras", icon: BookOpen, to: "/coordenador/cadeiras", desc: `${totalDisciplinas} activas` },
          { label: "Relatórios", icon: Award, to: "/coordenador/relatorios", desc: "Análise detalhada" },
        ].map(link => (
          <Link key={link.label} to={link.to}>
            <Card className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{link.label}</p>
                  <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
