import { useParams, Link } from "react-router-dom";
import { coordCursoInfo, coordTurmas, coordDisciplinas, coordEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, Users, Award, TrendingUp, ChevronRight, BookOpen, CheckCircle } from "lucide-react";

export default function CoordenadorAnoDetail() {
  const { year } = useParams();
  const yearNum = parseInt(year || "1");
  const info = coordCursoInfo;
  const yearData = info.years.find(y => y.year === yearNum);
  const turmas = coordTurmas.filter(t => t.year === yearNum);
  const disciplinas = coordDisciplinas.filter(d => d.year === yearNum);
  const estudantes = coordEstudantes.filter(e => e.year === yearNum);

  if (!yearData) return <div className="p-8 text-muted-foreground">Ano não encontrado.</div>;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/coordenador/anos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar aos anos
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> {yearNum}º Ano — {info.name}
        </h1>
        <p className="text-muted-foreground mt-1">{turmas.length} turmas · {disciplinas.length} disciplinas · {estudantes.length} estudantes</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Disciplinas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{yearData.disciplinas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média</span>
          </div>
          <p className={`text-2xl font-bold ${yearData.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{yearData.mediaGeral}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Sucesso</span>
          </div>
          <p className={`text-2xl font-bold ${yearData.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{yearData.taxaSucesso}%</p>
        </Card>
      </div>

      {/* Turmas grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Turmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map(t => {
            const turmaEstudantes = coordEstudantes.filter(e => e.year === yearNum && e.turma === t.name.replace("Turma ", ""));
            return (
              <Link key={t.id} to={`/coordenador/anos/${yearNum}/turma/${t.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-1.5 bg-primary" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Director: {t.director}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
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
                    </div>
                    <div className="space-y-2 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Disciplinas</span>
                        <span className="font-semibold text-foreground">{t.disciplinas}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Taxa Sucesso</span>
                        <Badge variant={t.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{t.taxaSucesso}%</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Disciplinas table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Disciplinas
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Disciplina</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Professor</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th>
            </tr></thead>
            <tbody>{disciplinas.map(d => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.code}</p></td>
                <td className="p-3 text-muted-foreground">{d.professor}</td>
                <td className="p-3 text-center">{d.estudantes}</td>
                <td className="p-3 text-center"><span className={d.media !== null && d.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.media ?? "—"}</span></td>
                <td className="p-3 text-center"><Badge variant={d.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{d.taxaSucesso}%</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
