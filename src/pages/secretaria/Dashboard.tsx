import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { candidaturas, sessoesProva, cursos } from "@/data/admissoesData";
import { reitorSolicitacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Clock, ChevronRight, FileText,
  Calendar as CalendarIcon, CheckCircle, UserCheck,
  ClipboardCheck, BarChart3, AlertCircle, XCircle,
  Eye, Award, GraduationCap, BookOpen, TrendingUp,
  AlertTriangle, ArrowDownLeft, Play, Building2, ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const [expandedFaculdade, setExpandedFaculdade] = useState<string | null>(null);

  // Admissions KPIs
  const total = candidaturas.length;
  const aprovados = candidaturas.filter(c => c.estado === "aprovado").length;
  const pendentes = candidaturas.filter(c => c.estado === "pendente").length;
  const incompletos = candidaturas.filter(c => c.estado === "incompleto").length;
  const reprovados = candidaturas.filter(c => c.estado === "reprovado").length;

  // Faculty → Courses mapping
  const faculdades = [
    { nome: "Faculdade de Ciências Exatas", cursos: ["Engenharia Informática", "Arquitectura"] },
    { nome: "Faculdade de Ciências Sociais", cursos: ["Direito", "Gestão"] },
    { nome: "Faculdade de Ciências da Saúde", cursos: ["Medicina"] },
  ];

  const faculdadeStats = faculdades.map(f => {
    const cands = candidaturas.filter(c => f.cursos.includes(c.cursoOpcao1));
    const cursoStats = f.cursos.map(curso => {
      const cc = candidaturas.filter(c => c.cursoOpcao1 === curso);
      return {
        curso,
        total: cc.length,
        aprovados: cc.filter(c => c.estado === "aprovado").length,
        pendentes: cc.filter(c => c.estado === "pendente").length,
        incompletos: cc.filter(c => c.estado === "incompleto").length,
      };
    }).sort((a, b) => b.total - a.total);
    return {
      nome: f.nome,
      total: cands.length,
      aprovados: cands.filter(c => c.estado === "aprovado").length,
      pendentes: cands.filter(c => c.estado === "pendente").length,
      incompletos: cands.filter(c => c.estado === "incompleto").length,
      cursoStats,
    };
  }).sort((a, b) => b.total - a.total);

  // Upcoming exam sessions
  const proximasSessoes = sessoesProva
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);

  // Recent candidaturas
  const recentCandidaturas = [...candidaturas]
    .sort((a, b) => b.dataSubmissao.localeCompare(a.dataSubmissao))
    .slice(0, 5);

  const estadoBadge: Record<string, { bg: string; label: string }> = {
    incompleto: { bg: "bg-orange-100 text-orange-700", label: "Incompleto" },
    pendente: { bg: "bg-amber-100 text-amber-700", label: "Pendente" },
    aprovado: { bg: "bg-emerald-100 text-emerald-700", label: "Aprovado" },
    reprovado: { bg: "bg-destructive/10 text-destructive", label: "Reprovado" },
  };

  // Solicitations
  const solPendentes = reitorSolicitacoes.filter(s => s.status === "pendente" && s.direction === "recebida");

  // Student support mock
  const pedidosAbertos = 12;
  const pedidosEmCurso = 5;
  const atendimentosHoje = 3;

  // Admissions funnel
  const taxaAprovacao = total > 0 ? Math.round((aprovados / total) * 100) : 0;
  const docCompletos = candidaturas.filter(c => c.documentos.every(d => d.entregue)).length;
  const taxaDocCompletos = total > 0 ? Math.round((docCompletos / total) * 100) : 0;

  const stats = [
    { icon: ClipboardCheck, label: "Total Candidaturas", value: total, color: "text-primary bg-primary/10" },
    { icon: UserCheck, label: "Aprovados", value: aprovados, color: "text-emerald-600 bg-emerald-100" },
    { icon: Clock, label: "Pendentes", value: pendentes, color: "text-amber-600 bg-amber-100" },
    { icon: AlertCircle, label: "Incompletos", value: incompletos, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Welcome */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Área Académica 🎓
            </h1>
            <p className="text-muted-foreground mt-1">
              Painel de gestão académica — UPRA • {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <TrendingUp className="w-3 h-3" /> Taxa de Aprovação: {taxaAprovacao}%
            </Badge>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 1: Candidaturas por Curso + Funil de Admissão */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Candidatos por Faculdade
            </h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {faculdadeStats.map(f => {
              const isExpanded = expandedFaculdade === f.nome;
              return (
                <div key={f.nome} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedFaculdade(isExpanded ? null : f.nome)}
                    className="w-full flex items-center gap-4 px-3.5 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-foreground">{f.nome}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground">{f.total} candidaturas</span>
                        <span className="text-[10px] text-emerald-600">{f.aprovados} aprov.</span>
                        <span className="text-[10px] text-amber-600">{f.pendentes} pend.</span>
                      </div>
                    </div>
                    <div className="w-20 shrink-0">
                      <Progress value={f.total > 0 ? (f.aprovados / f.total) * 100 : 0} className="h-2" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 px-4 py-2.5 space-y-2">
                      {f.cursoStats.map(c => (
                        <div key={c.curso} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card">
                          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{c.curso}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">{c.total} cand.</span>
                              <span className="text-[10px] text-emerald-600">{c.aprovados} aprov.</span>
                              <span className="text-[10px] text-amber-600">{c.pendentes} pend.</span>
                              <span className="text-[10px] text-orange-600">{c.incompletos} incomp.</span>
                            </div>
                          </div>
                          <div className="w-16 shrink-0">
                            <Progress value={c.total > 0 ? (c.aprovados / c.total) * 100 : 0} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-secondary" /> Funil de Admissão
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Candidaturas Submetidas</span>
                <span className="font-bold text-foreground">{total}</span>
              </div>
              <Progress value={100} className="h-2.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Documentos Completos</span>
                <span className="font-bold text-foreground">{docCompletos} ({taxaDocCompletos}%)</span>
              </div>
              <Progress value={taxaDocCompletos} className="h-2.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prova Realizada</span>
                <span className="font-bold text-foreground">{aprovados + reprovados}</span>
              </div>
              <Progress value={total > 0 ? ((aprovados + reprovados) / total) * 100 : 0} className="h-2.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aprovados</span>
                <span className="font-bold text-emerald-600">{aprovados} ({taxaAprovacao}%)</span>
              </div>
              <Progress value={taxaAprovacao} className="h-2.5" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Atenção
            </p>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                {incompletos} candidaturas com documentos em falta
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                {pendentes} candidatos aguardam prova de acesso
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Próximas Sessões de Prova + Apoio ao Estudante */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Próximas Sessões de Prova
              <Badge variant="outline" className="text-[10px] font-mono">{proximasSessoes.length}</Badge>
            </h2>
            <Link to="/secretaria/admissoes/provas-de-acesso" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {proximasSessoes.map(sessao => {
              const candidatosSessao = candidaturas.filter(c => c.sessaoProvaId === sessao.id);
              const ocupacao = Math.round((candidatosSessao.length / sessao.capacidadeMax) * 100);
              return (
                <Link key={sessao.id} to={`/secretaria/admissoes/provas-de-acesso/${sessao.id}`}>
                  <div className="flex items-center gap-4 px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                    <div className="text-center shrink-0 w-14 px-2 py-1.5 rounded-lg bg-primary/10">
                      <p className="text-xs font-bold text-primary">{sessao.data.split("-")[2]}</p>
                      <p className="text-[9px] text-primary/70">
                        {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][parseInt(sessao.data.split("-")[1]) - 1]}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{sessao.nome}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sessao.hora}</span>
                        <span>{sessao.sala}</span>
                        <span>{candidatosSessao.length}/{sessao.capacidadeMax} candidatos</span>
                      </div>
                    </div>
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs font-bold text-foreground">{ocupacao}%</p>
                      <Progress value={ocupacao} className="h-1.5 mt-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" /> Apoio ao Estudante
            </h2>
            <Link to="/secretaria/apoio-estudante" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver mais <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{pedidosAbertos}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Abertos</p>
            </div>
            <div className="text-center p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-primary">{pedidosEmCurso}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Em Curso</p>
            </div>
            <div className="text-center p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{atendimentosHoje}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Atend. Hoje</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { title: "Declaração de matrícula", student: "Ana Sousa", status: "Aberto", color: "bg-orange-100 text-orange-700" },
              { title: "Pedido de equivalência", student: "Carlos Mendes", status: "Em Curso", color: "bg-primary/10 text-primary" },
              { title: "Transferência de curso", student: "Pedro Lopes", status: "Aberto", color: "bg-orange-100 text-orange-700" },
              { title: "Certidão de habilitações", student: "Maria João", status: "Resolvido", color: "bg-emerald-100 text-emerald-700" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.student}</p>
                </div>
                <Badge className={`${p.color} text-[10px] border-0`}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Candidaturas Recentes + Acções Rápidas */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" /> Últimas Candidaturas
              <Badge variant="outline" className="text-[10px] font-mono">{recentCandidaturas.length}</Badge>
            </h2>
            <Link to="/secretaria/admissoes/candidaturas" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCandidaturas.map(c => {
              const badge = estadoBadge[c.estado];
              const docsEntregues = c.documentos.filter(d => d.entregue).length;
              return (
                <Link key={c.id} to={`/secretaria/admissoes/candidaturas/${c.id}`}>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-foreground">{c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{c.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{c.cursoOpcao1}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{docsEntregues}/4 docs</span>
                      </div>
                    </div>
                    <Badge className={`${badge.bg} text-[10px] border-0`}>{badge.label}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" /> Acções Rápidas
          </h2>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Gestão de Candidaturas", icon: ClipboardCheck, path: "/secretaria/admissoes/candidaturas", color: "bg-primary/10 text-primary" },
              { label: "Provas de Acesso", icon: Award, path: "/secretaria/admissoes/provas-de-acesso", color: "bg-secondary/10 text-secondary" },
              { label: "Resultados", icon: BarChart3, path: "/secretaria/admissoes/resultados", color: "bg-emerald-100 text-emerald-600" },
              { label: "Convocações", icon: FileText, path: "/secretaria/admissoes/convocacoes", color: "bg-amber-100 text-amber-600" },
              { label: "Apoio ao Estudante", icon: Users, path: "/secretaria/apoio-estudante", color: "bg-orange-100 text-orange-600" },
              { label: "Solicitações", icon: ArrowDownLeft, path: "/secretaria/solicitacoes", color: "bg-destructive/10 text-destructive" },
            ].map(action => (
              <Link key={action.path} to={action.path}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <action.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
