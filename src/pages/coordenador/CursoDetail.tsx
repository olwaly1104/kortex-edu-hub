import { coordCursoInfo, coordDocentes, coordEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, BookOpen, GraduationCap, ChevronRight,
  Building2, UserCheck, Clock, MapPin, Calendar,
  Award, ArrowLeft,
} from "lucide-react";

export default function CursoDetail() {
  const info = coordCursoInfo;
  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalDisciplinas = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const docentesActivos = coordDocentes.filter(d => d.status === "activo").length;
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Detalhes do Curso
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações gerais do curso</p>
      </div>

      {/* Course Identity */}
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Curso de Arquitectura</h2>
          <Badge variant="outline" className="text-xs">{info.code}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/coordenador/faculdade">
            <Badge variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
              <Building2 className="w-3 h-3" /> Faculdade de Ciências Exatas
            </Badge>
          </Link>
        </div>
      </Card>

      {/* Details */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Decano</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Prof. Dr. Manuel Rodrigues</p>
          </div>

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
              <p className="text-sm text-muted-foreground">Anos Curriculares</p>
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
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Turmas</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{totalTurmas}</p>
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

    </div>
  );
}
