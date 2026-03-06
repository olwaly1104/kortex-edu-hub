import { coordCursoInfo, coordTurmas, coordDisciplinas, coordEstudantes, coordTurmaLessons } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers, Users, BookOpen, Award, ChevronRight, UserCheck, GraduationCap,
  ClipboardList, TrendingUp, XCircle, Clock, CheckCircle, FileText, Video,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CoordenadorAnos() {
  const info = coordCursoInfo;

  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalCadeiras = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const totalProfessores = new Set(coordDisciplinas.map(d => d.professor)).size;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" /> Os Meus Anos
        </h1>
        <p className="text-muted-foreground mt-1">{info.name} · {info.faculty}</p>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{info.totalEstudantes}</p>
              <p className="text-xs text-muted-foreground">Total Estudantes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalTurmas}</p>
              <p className="text-xs text-muted-foreground">Total Turmas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalProfessores}</p>
              <p className="text-xs text-muted-foreground">Total Professores</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCadeiras}</p>
              <p className="text-xs text-muted-foreground">Total Cadeiras</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Year cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {info.years.map(y => {
          const turmas = coordTurmas.filter(t => t.year === y.year);
          const avgPresenca = turmas.length
            ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length)
            : 0;
          const avgTaxaEntrega = turmas.length
            ? Math.round(turmas.reduce((s, t) => s + t.taxaEntrega, 0) / turmas.length)
            : 0;
          const yearProfessores = new Set(coordDisciplinas.filter(d => d.year === y.year).map(d => d.professor)).size;
          const taxaReprovado = 100 - y.taxaSucesso;

          // Avaliações from students
          const yearStudents = coordEstudantes.filter(e => e.year === y.year);
          const totalAvaliacoes = yearStudents.length > 0 ? yearStudents[0].avaliacoesTotal : 0;
          const avgAvalFeitas = yearStudents.length > 0
            ? Math.round(yearStudents.reduce((s, e) => s + e.avaliacoesFeitas, 0) / yearStudents.length)
            : 0;

          // Lessons / content
          const yearTurmaIds = turmas.map(t => t.id);
          const yearLessons = coordTurmaLessons.filter(l => yearTurmaIds.includes(l.turmaId));
          const publishedLessons = yearLessons.filter(l => l.status === "publicada");
          const totalMaterials = yearLessons.reduce((s, l) => s + l.materials.length, 0);
          const recordedLessons = Math.round(publishedLessons.length * 0.6); // simulated

          // Estado
          const estado = avgPresenca < 75 || y.mediaGeral < 11 || y.taxaSucesso < 70
            ? "risco" : avgPresenca >= 85 && y.mediaGeral >= 13 && y.taxaSucesso >= 85
            ? "excelente" : "normal";
          const estadoConfig = {
            excelente: { label: "Excelente", class: "bg-accent/10 text-accent border-accent/30" },
            normal: { label: "Normal", class: "bg-primary/10 text-primary border-primary/30" },
            risco: { label: "Em Risco", class: "bg-destructive/10 text-destructive border-destructive/30" },
          };
          const ec = estadoConfig[estado];

          return (
            <Link key={y.year} to={`/coordenador/anos/${y.year}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all h-full group cursor-pointer">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-bold text-foreground">{y.year}º Ano</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] border ${ec.class}`}>{ec.label}</Badge>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{info.name}</p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.estudantes}</p>
                      <p className="text-[10px] text-muted-foreground">Estud.</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.turmas}</p>
                      <p className="text-[10px] text-muted-foreground">Turmas</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{yearProfessores}</p>
                      <p className="text-[10px] text-muted-foreground">Prof.</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/40">
                      <p className="text-base font-bold text-foreground">{y.disciplinas}</p>
                      <p className="text-[10px] text-muted-foreground">Cadeiras</p>
                    </div>
                  </div>

                  {/* Section 1: Presença */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/40" /> Presença
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-muted-foreground/60">{avgPresenca}%</span>
                    </div>
                  </div>

                  {/* Section 2: Performance */}
                  <div className="space-y-2 pt-3 mt-3 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-muted-foreground/40" /> Média Geral
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-muted-foreground/60">{y.mediaGeral}/20</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-accent" /> Taxa Aprovado
                      </span>
                      <span className={`text-sm font-semibold tabular-nums ${y.taxaSucesso >= 70 ? "text-accent" : "text-destructive"}`}>{y.taxaSucesso}%</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-destructive/70" /> Taxa Reprovado
                      </span>
                      <span className={`text-sm font-semibold tabular-nums ${taxaReprovado > 30 ? "text-destructive" : "text-foreground"}`}>{taxaReprovado}%</span>
                    </div>
                  </div>

                  {/* Section 3: Activity - reordered */}
                  <div className="space-y-2 pt-3 mt-3 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-secondary" /> Tarefas
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{Math.round(avgAvalFeitas * 1.5)}/{Math.round(totalAvaliacoes * 1.5)}</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-secondary" /> Avaliações
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{avgAvalFeitas}/{totalAvaliacoes}</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-secondary" /> Taxa de Entrega
                      </span>
                      <span className={`text-sm font-semibold tabular-nums ${avgTaxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{avgTaxaEntrega}%</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-secondary" /> Taxa de Conclusão
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{Math.round(y.taxaSucesso * 0.95)}%</span>
                    </div>
                  </div>

                  {/* Section 4: Resources */}
                  <div className="space-y-2 pt-3 mt-3 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent" /> Conteúdos
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{totalMaterials}</span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-chart-4" /> Aulas Gravadas
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-chart-4" style={{ width: `${publishedLessons.length > 0 ? Math.round((recordedLessons / publishedLessons.length) * 100) : 0}%` }} />
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-chart-4">{recordedLessons}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
