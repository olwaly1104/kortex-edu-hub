import { useParams, Link } from "react-router-dom";
import { coordDisciplinas, coordCursoInfo, coordEstudantes, coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Users, Clock, MapPin, ArrowLeft, Award, ClipboardCheck, User, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function CadeiraProfile() {
  const { cadeiraId } = useParams();
  const cadeira = coordDisciplinas.find(d => d.id === cadeiraId);

  if (!cadeira) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Link to="/coordenador/cadeiras" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar às Cadeiras
        </Link>
        <p className="text-muted-foreground">Cadeira não encontrada.</p>
      </div>
    );
  }

  // Find the professor in docentes
  const docente = coordDocentes.find(d => d.name === cadeira.professor);

  // Find students in this discipline's year
  const studentsInYear = coordEstudantes.filter(e => e.year === cadeira.year);

  // Compute stats
  const aprovados = Math.round(cadeira.estudantes * cadeira.taxaAprovacao / 100);
  const reprovados = cadeira.estudantes - aprovados;

  const statusColor = cadeira.status === "excelente"
    ? "bg-accent/15 text-accent border-accent/30"
    : cadeira.status === "risco"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : "bg-muted text-muted-foreground border-border";

  const statusLabel = cadeira.status === "excelente" ? "Excelente" : cadeira.status === "risco" ? "Em Risco" : "Normal";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/coordenador/cadeiras" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às Cadeiras
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{cadeira.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{cadeira.code} · {cadeira.year}º Ano · {coordCursoInfo.name}</p>
          </div>
        </div>
        <Badge variant="outline" className={`text-xs ${statusColor}`}>{statusLabel}</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: "Estudantes", value: cadeira.estudantes, color: false },
          { icon: Clock, label: "Presença", value: `${cadeira.presenca}%`, color: cadeira.presenca >= 75 },
          { icon: ClipboardCheck, label: "Taxa Entrega", value: `${cadeira.taxaEntrega}%`, color: cadeira.taxaEntrega >= 75 },
          { icon: CheckCircle, label: "Aprovação", value: `${cadeira.taxaAprovacao}%`, color: cadeira.taxaAprovacao >= 70 },
          { icon: Award, label: "Média", value: `${cadeira.media ?? "–"}/20`, color: (cadeira.media ?? 0) >= 10 },
        ].map((kpi, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${typeof kpi.color === "boolean" ? (kpi.color ? "text-accent" : (i === 0 ? "text-foreground" : "text-destructive")) : "text-foreground"}`}>
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Info & Professor */}
        <div className="space-y-5">
          {/* Informações da Cadeira */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Informações</h2>
            <div className="space-y-3">
              {[
                { icon: BookOpen, label: "Código", value: cadeira.code },
                { icon: Calendar, label: "Ano", value: `${cadeira.year}º Ano` },
                { icon: Clock, label: "Horário", value: cadeira.diasAula },
                { icon: MapPin, label: "Localização", value: cadeira.location },
                { icon: Users, label: "Estudantes", value: `${cadeira.estudantes} inscritos` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-24 shrink-0">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Professor */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Professor Responsável</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{cadeira.professor}</p>
                <p className="text-xs text-muted-foreground">{docente?.email || "professor@universidade.ao"}</p>
              </div>
            </div>
            {docente && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cadeiras leccionadas</span>
                  <span className="font-semibold text-foreground">{docente.disciplinas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de turmas</span>
                  <span className="font-semibold text-foreground">{docente.turmas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de estudantes</span>
                  <span className="font-semibold text-foreground">{docente.estudantesTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Média geral</span>
                  <span className={`font-semibold ${docente.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{docente.mediaGeral}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant="outline" className="text-[10px]">
                    {docente.status === "activo" ? "Activo" : docente.status === "licença" ? "Em Licença" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Performance Charts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Performance Bars */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Desempenho Académico</h2>
            <div className="space-y-5">
              {[
                { label: "Presença", value: cadeira.presenca, good: cadeira.presenca >= 75 },
                { label: "Taxa de Entrega", value: cadeira.taxaEntrega, good: cadeira.taxaEntrega >= 75 },
                { label: "Taxa de Aprovação", value: cadeira.taxaAprovacao, good: cadeira.taxaAprovacao >= 70 },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className={`font-bold ${bar.good ? "text-accent" : "text-destructive"}`}>{bar.value}%</span>
                  </div>
                  <Progress value={bar.value} className="h-2" />
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-5 pt-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Aprovados</p>
                  <p className="text-lg font-bold text-accent">{aprovados}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reprovados</p>
                  <p className="text-lg font-bold text-destructive">{reprovados}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Média</p>
                  <p className={`text-lg font-bold ${(cadeira.media ?? 0) >= 10 ? "text-accent" : "text-destructive"}`}>{cadeira.media ?? "–"}/20</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Estudantes desta cadeira */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Estudantes ({studentsInYear.length})</h2>
              <div className="flex gap-2 text-[10px]">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  {studentsInYear.filter(s => s.status === "excelente").length} Excelente
                </Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  {studentsInYear.filter(s => s.status === "normal").length} Normal
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {studentsInYear.filter(s => s.status === "risco").length} Em Risco
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Turma</TableHead>
                    <TableHead className="text-xs text-center">Média</TableHead>
                    <TableHead className="text-xs text-center">Presença</TableHead>
                    <TableHead className="text-xs text-center">Entrega</TableHead>
                    <TableHead className="text-xs text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsInYear.slice(0, 10).map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Link to={`/coordenador/estudantes/${s.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {s.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.turma}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold ${(s.media ?? 0) >= 10 ? "text-accent" : "text-destructive"}`}>{s.media ?? "–"}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold ${s.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{s.presenca}%</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold ${s.taxaEntrega >= 75 ? "text-accent" : "text-destructive"}`}>{s.taxaEntrega}%</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] ${s.status === "excelente" ? "bg-accent/15 text-accent border-accent/30" : s.status === "risco" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border"}`} variant="outline">
                          {s.status === "excelente" ? "Excelente" : s.status === "risco" ? "Em Risco" : "Normal"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {studentsInYear.length > 10 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  A mostrar 10 de {studentsInYear.length} estudantes
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
