import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { anosLetivos, cursoTemplates, alocacaoCandidatos, exames, quizzes } from "@/data/academica2Data";
import {
  Sparkles, Calendar, ChevronRight, GraduationCap, Layers, Users,
  ClipboardCheck, BookOpen, FileText, BrainCircuit, Rocket, GaugeCircle, Save,
} from "lucide-react";

export default function Academica2Inicio() {
  const { user } = useAuth();
  const ativo = anosLetivos.find(a => a.status === "ativo")!;
  const planeado = anosLetivos.find(a => a.status === "planeado")!;

  const kpis = [
    { icon: GraduationCap, label: "Cursos Activos", value: ativo.cursos, color: "text-primary bg-primary/10" },
    { icon: BookOpen, label: "Cadeiras", value: ativo.cadeiras, color: "text-blue-600 bg-blue-100" },
    { icon: Layers, label: "Turmas", value: ativo.turmas, color: "text-amber-600 bg-amber-100" },
    { icon: Users, label: "Estudantes", value: ativo.estudantes.toLocaleString(), color: "text-emerald-600 bg-emerald-100" },
  ];

  const quickActions = [
    { icon: Sparkles, title: "Criar Próximo Ano Letivo", desc: `Gerar 2025/2026 automaticamente`, to: "/areaacademica/criador" },
    { icon: Layers, title: "Alocar Candidatos", desc: `${alocacaoCandidatos.length} aprovados`, to: "/areaacademica/turmas" },
    { icon: ClipboardCheck, title: "Mapa de Exames", desc: `${exames.length} exames marcados`, to: "/areaacademica/exames" },
    { icon: BrainCircuit, title: "Banco de Quizzes", desc: `${quizzes.length} quizzes`, to: "/areaacademica/quizzes" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bom dia, {user?.name?.split(" ").pop()} 👋</h1>
            <p className="text-muted-foreground mt-1 text-sm">Área Académica II — Planeamento e Estruturação Curricular</p>
          </div>
          <Link to="/areaacademica/criador">
            <Button className="gap-2"><Sparkles className="w-4 h-4" /> Criador de Curso</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.color}`}><k.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="mb-2 gap-1"><Rocket className="w-3 h-3" /> Próximo Ano</Badge>
              <h2 className="text-lg font-semibold text-foreground">{planeado.label} — Planeamento</h2>
              <p className="text-xs text-muted-foreground mt-1">{planeado.startDate} — {planeado.endDate}</p>
            </div>
            <Link to="/areaacademica/criador">
              <Button size="sm" className="gap-2"><Sparkles className="w-4 h-4" /> Gerar com IA</Button>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso de Planeamento</span><span className="font-mono">{planeado.progresso}%</span>
            </div>
            <Progress value={planeado.progresso} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            <div><p className="text-xs text-muted-foreground">Cursos</p><p className="text-lg font-bold">{planeado.cursos}</p></div>
            <div><p className="text-xs text-muted-foreground">Cadeiras</p><p className="text-lg font-bold">{planeado.cadeiras}</p></div>
            <div><p className="text-xs text-muted-foreground">Turmas</p><p className="text-lg font-bold">{planeado.turmas}</p></div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" /> Ano Letivo Activo
          </h2>
          <div className="space-y-3">
            <div><p className="text-xs text-muted-foreground">Período</p><p className="text-sm font-semibold">{ativo.label}</p></div>
            <div><p className="text-xs text-muted-foreground">Docentes</p><p className="text-sm font-semibold">{ativo.docentes}</p></div>
            <div><p className="text-xs text-muted-foreground">Estudantes</p><p className="text-sm font-semibold">{ativo.estudantes.toLocaleString()}</p></div>
            <Link to="/areaacademica/anos-letivos" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver histórico <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" /> Acções Rápidas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.title} to={a.to}>
              <div className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors h-full">
                <a.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-sm font-semibold leading-tight">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" /> Catálogo de Cursos
          </h2>
          <Link to="/areaacademica/cadeiras" className="text-xs text-primary hover:underline">Ver cadeiras →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cursoTemplates.map(c => (
            <div key={c.id} className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <Badge variant="outline" className="text-[10px]">{c.code}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{c.faculty}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span>{c.years} anos</span>
                <span>·</span>
                <span>{c.cadeirasPorAno}/ano</span>
                <span>·</span>
                <span>{c.estudantesEsperados} est.</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
