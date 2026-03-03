import { useParams, Link } from "react-router-dom";
import { coordTurmas, coordDisciplinas, coordEstudantes, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, Users, Award, TrendingUp, BookOpen, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CoordenadorTurmaDetail() {
  const { year, turmaId } = useParams();
  const yearNum = parseInt(year || "1");
  const turma = coordTurmas.find(t => t.id === turmaId);
  const disciplinas = coordDisciplinas.filter(d => d.year === yearNum);
  const turmaLetter = turma?.name.replace("Turma ", "") || "";
  const estudantes = coordEstudantes.filter(e => e.year === yearNum && e.turma === turmaLetter);
  const [search, setSearch] = useState("");

  if (!turma) return <div className="p-8 text-muted-foreground">Turma não encontrada.</div>;

  const filtered = estudantes.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/coordenador/anos/${yearNum}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao {yearNum}º Ano
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 bg-primary/5">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5" style={{ transform: "translate(30%, -30%)" }} />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">{yearNum}º Ano</Badge>
              <Badge variant="outline" className="text-xs">{coordCursoInfo.name}</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{turma.name}</h1>
            <p className="text-muted-foreground mt-1">Director de turma: {turma.director}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{turma.estudantes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Disciplinas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{turma.disciplinas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média</span>
          </div>
          <p className={`text-2xl font-bold ${turma.media >= 10 ? "text-accent" : "text-destructive"}`}>{turma.media}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença</span>
          </div>
          <p className={`text-2xl font-bold ${turma.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{turma.presenca}%</p>
        </Card>
      </div>

      {/* Estudantes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Estudantes</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            </tr></thead>
            <tbody>{filtered.map(e => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-3 font-medium text-foreground">{e.name}</td>
                <td className="p-3 text-muted-foreground">{e.email}</td>
                <td className="p-3 text-center"><span className={e.media !== null && e.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.media ?? "—"}</span></td>
                <td className="p-3 text-center"><span className={e.presenca >= 75 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.presenca}%</span></td>
                <td className="p-3 text-center">
                  <Badge variant={e.status === "excelente" ? "default" : e.status === "risco" ? "destructive" : "secondary"} className="text-[10px]">
                    {e.status === "excelente" ? "Excelente" : e.status === "risco" ? "Em Risco" : "Normal"}
                  </Badge>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>}
        </Card>
      </div>

      {/* Disciplinas */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Disciplinas
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Disciplina</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Professor</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Sucesso</th>
            </tr></thead>
            <tbody>{disciplinas.map(d => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.code}</p></td>
                <td className="p-3 text-muted-foreground">{d.professor}</td>
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
