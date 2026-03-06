import { coordCursoInfo, coordDocentes, coordEstudantes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, BookOpen, GraduationCap, Building2,
  UserCheck, Calendar, MapPin, Award, ChevronRight,
} from "lucide-react";

export default function FaculdadeDetail() {
  const navigate = useNavigate();
  const info = coordCursoInfo;
  const totalTurmas = info.years.reduce((s, y) => s + y.turmas, 0);
  const totalDisciplinas = info.years.reduce((s, y) => s + y.disciplinas, 0);
  const docentesActivos = coordDocentes.filter(d => d.status === "activo").length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" /> Detalhes da Faculdade
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações gerais da faculdade</p>
      </div>

      {/* Identity */}
      <Card className="px-5 py-3.5 border-l-4 border-l-secondary space-y-1">
        <h2 className="text-lg font-bold text-foreground">Faculdade de Ciências Exatas</h2>
        <p className="text-sm text-muted-foreground">Universidade Privada de Angola</p>
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

      {/* Cursos da Faculdade */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Cursos da Faculdade
          </h3>
        </div>
        <div className="divide-y divide-border">
          <Link to="/coordenador/curso" className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{info.name}</p>
                <Badge variant="outline" className="text-[10px]">{info.code}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Coordenador: {info.coordinator} · {info.totalEstudantes} estudantes</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
