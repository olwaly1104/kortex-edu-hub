import { coordCursoInfo, coordDocentes, coordEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Users, BookOpen, GraduationCap, ChevronRight,
  Building2, UserCheck, Clock, MapPin, Calendar,
  Award,
} from "lucide-react";

export default function CursoDetail() {
  const info = coordCursoInfo;
  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalDisciplinas = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const docentesActivos = coordDocentes.filter(d => d.status === "activo").length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Detalhes do Curso
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações gerais do curso</p>
      </div>

      {/* Course Identity */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{info.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{info.faculty}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">{info.code}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Coordenador</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{info.coordinator}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Faculdade</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{info.faculty}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Duração</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{info.years.length} Anos</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Total de Estudantes</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{info.totalEstudantes}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Docentes</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{docentesActivos} activos / {coordDocentes.length} total</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Cadeiras Activas</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{totalDisciplinas}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Turmas</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{totalTurmas}</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
            <p className={`text-sm font-semibold ${info.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{info.mediaGeral}/20</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Ano Lectivo</p>
            </div>
            <p className="text-sm font-semibold text-foreground">2024/2025</p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Campus</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Campus Principal</p>
          </div>
        </div>
      </Card>

      {/* Years summary */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Anos Curriculares</h3>
          <Link to="/coordenador/anos" className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {info.years.map(y => (
            <Link key={y.year} to={`/coordenador/anos/${y.year}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{y.year}º</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{y.year}º Ano</p>
                  <p className="text-xs text-muted-foreground">{y.turmas} turmas · {y.disciplinas} cadeiras · {y.estudantes} estudantes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-[10px] border ${y.taxaSucesso >= 85 ? "bg-accent/10 text-accent border-accent/30" : y.taxaSucesso < 70 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"}`}>
                  {y.mediaGeral}/20
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
