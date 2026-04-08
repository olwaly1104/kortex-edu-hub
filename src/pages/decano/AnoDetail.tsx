import { useParams, Link } from "react-router-dom";
import { decanoFaculty, decanoTurmas } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Users, Award, TrendingUp, CheckCircle,
  GraduationCap, BookOpen, ClipboardList, Layers,
} from "lucide-react";

export default function DecanoAnoDetail() {
  const { cursoId, year } = useParams();
  const yearNum = parseInt(year || "1");
  const course = decanoFaculty.courses.find(c => c.id === cursoId);
  const turmas = decanoTurmas.filter(t => t.courseId === cursoId && t.year === yearNum);

  if (!course) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/decano/faculdades" className="text-primary hover:underline">← Voltar</Link>
      <p className="mt-4">Curso não encontrado.</p>
    </div>
  );

  const totalEst = turmas.reduce((s, t) => s + t.estudantes, 0);
  const avgMedia = turmas.length ? +(turmas.reduce((s, t) => s + t.media, 0) / turmas.length).toFixed(1) : 0;
  const avgSucesso = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.taxaSucesso, 0) / turmas.length) : 0;
  const avgPresenca = turmas.length ? Math.round(turmas.reduce((s, t) => s + t.presenca, 0) / turmas.length) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/decano/cursos/${cursoId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a {course.name}
      </Link>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{yearNum}º Ano</h1>
              <Badge variant="outline" className="text-[10px] shrink-0">{turmas.length} turmas</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {course.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {course.code}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {decanoFaculty.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: "Estudantes", value: totalEst, color: "" },
            { icon: Layers, label: "Turmas", value: turmas.length, color: "" },
            { icon: Award, label: "Média Geral", value: `${avgMedia}/20`, color: avgMedia >= 10 ? "text-accent" : "text-destructive" },
            { icon: TrendingUp, label: "Taxa Sucesso", value: `${avgSucesso}%`, color: avgSucesso >= 80 ? "text-accent" : "text-secondary" },
            { icon: CheckCircle, label: "Presença", value: `${avgPresenca}%`, color: avgPresenca >= 75 ? "text-accent" : "text-destructive" },
          ].map(kpi => (
            <div key={kpi.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color || "text-foreground"}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Turma Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Turmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {turmas.map(t => {
            const statusLabel = t.media >= 14 ? "Excelente" : t.media >= 10 ? "Normal" : "Em Risco";
            const statusColor = t.media >= 14 ? "bg-accent/10 text-accent" : t.media >= 10 ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive";
            return (
              <Card key={t.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t.name}</h3>
                  <Badge className={`text-[10px] border-0 ${statusColor}`}>{statusLabel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Director: {t.director}</p>

                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Estudantes</span>
                    <span className="font-semibold text-foreground">{t.estudantes}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> Cadeiras</span>
                    <span className="font-semibold text-foreground">{t.disciplinas}</span>
                  </div>
                  <div className="border-t border-border/50" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Presença</span>
                    <span className={`font-semibold ${t.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{t.presenca}%</span>
                  </div>
                  <div className="border-t border-border/50" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Award className="w-3 h-3" /> Média Geral</span>
                    <span className={`font-semibold ${t.media >= 10 ? "text-accent" : "text-destructive"}`}>{t.media}/20</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Taxa Sucesso</span>
                    <span className={`font-semibold ${t.taxaSucesso >= 80 ? "text-accent" : "text-secondary"}`}>{t.taxaSucesso}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><ClipboardList className="w-3 h-3 text-secondary" /> Taxa Entrega</span>
                    <span className={`font-semibold ${t.taxaEntrega >= 80 ? "text-accent" : "text-destructive"}`}>{t.taxaEntrega}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {turmas.length === 0 && <p className="text-center text-muted-foreground col-span-full py-8">Nenhuma turma neste ano.</p>}
        </div>
      </div>
    </div>
  );
}
