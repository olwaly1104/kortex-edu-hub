import { useParams, Link } from "react-router-dom";
import { coordCursoInfo, coordTurmas, coordDisciplinas, coordTurmaLessons, coordTurmaResources } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, Users, Award, ChevronRight, BookOpen, CheckCircle, UserCheck, Video, FileText, Calendar, MapPin, ClipboardList } from "lucide-react";

export default function CoordenadorAnoDetail() {
  const { year } = useParams();
  const yearNum = parseInt(year || "1");
  const info = coordCursoInfo;
  const yearData = info.years.find(y => y.year === yearNum);
  const turmas = coordTurmas.filter(t => t.year === yearNum);
  const disciplinas = coordDisciplinas.filter(d => d.year === yearNum);

  if (!yearData) return <div className="p-8 text-muted-foreground">Ano não encontrado.</div>;

  const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;
  const totalProfessores = new Set(disciplinas.map(d => d.professor)).size;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/coordenador/anos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar aos anos
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> {yearNum}º Ano — {info.name}
        </h1>
        <p className="text-muted-foreground mt-1">{turmas.length} turmas</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{yearData.estudantes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeiras</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{yearData.disciplinas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><UserCheck className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Professores</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalProfessores}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${yearData.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{yearData.mediaGeral}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença</span>
          </div>
          <p className={`text-2xl font-bold ${avgPresenca >= 75 ? "text-accent" : "text-destructive"}`}>{avgPresenca}%</p>
        </Card>
      </div>

      {/* Turmas grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Turmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmas.map(t => {
            const turmaLessons = coordTurmaLessons.filter(l => l.turmaId === t.id);
            const turmaPublished = turmaLessons.filter(l => l.status === "publicada").length;
            const lessonPct = turmaLessons.length > 0 ? Math.round((turmaPublished / turmaLessons.length) * 100) : 0;
            const turmaResources = coordTurmaResources.filter(r => r.turmaId === t.id);

            return (
              <Link key={t.id} to={`/coordenador/anos/${yearNum}/turma/${t.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all h-full group">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">{t.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">{t.id.toUpperCase()}</Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{yearNum}º Ano · {info.name}</p>

                    {/* Key metrics row */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2.5 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold text-foreground">{t.estudantes}</p>
                        <p className="text-[10px] text-muted-foreground">Estudantes</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-muted/50">
                        <p className={`text-lg font-bold ${t.media >= 10 ? "text-accent" : "text-destructive"}`}>{t.media}</p>
                        <p className="text-[10px] text-muted-foreground">Média</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-muted/50">
                        <p className={`text-lg font-bold ${t.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{t.presenca}%</p>
                        <p className="text-[10px] text-muted-foreground">Presença</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-muted/50">
                        <p className={`text-lg font-bold ${t.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{t.taxaEntrega}%</p>
                        <p className="text-[10px] text-muted-foreground">Entrega</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Professor</span>
                        <span className="font-semibold text-foreground">{t.director.replace("Prof. ", "")}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Aulas Gravadas</span>
                          <span className="font-semibold text-foreground">{turmaPublished}/{turmaLessons.length}</span>
                        </div>
                        <Progress value={lessonPct} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Conteúdos</span>
                        <span className="font-semibold text-foreground">{turmaResources.length}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
