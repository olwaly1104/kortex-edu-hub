import { useParams, Link } from "react-router-dom";
import { coordTurmas, coordDisciplinas, coordEstudantes, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, GraduationCap, Users, Award, BookOpen, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CoordenadorTurmaDetail() {
  const { year, turmaId } = useParams();
  const yearNum = parseInt(year || "1");
  const turma = coordTurmas.find(t => t.id === turmaId);
  const disciplinas = coordDisciplinas.filter(d => d.year === yearNum);
  const turmaLetter = turma?.name.replace("Turma ", "") || "";
  const estudantes = coordEstudantes.filter(e => e.year === yearNum && e.turma === turmaLetter);
  const [studentSearch, setStudentSearch] = useState("");

  if (!turma) return <div className="p-8 text-muted-foreground">Turma não encontrada.</div>;

  const filteredStudents = estudantes.filter(e => e.name.toLowerCase().includes(studentSearch.toLowerCase()));

  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadgeStyle: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

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
          <div className="flex-1 min-w-0">
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

      {/* Tabs like professor view */}
      <Tabs defaultValue="students" className="space-y-5">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "students", icon: Users, label: "Estudantes" },
              { value: "disciplines", icon: BookOpen, label: "Disciplinas" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-3 text-sm gap-2"
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Estudantes tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar estudante..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente ({estudantes.filter(s => s.status === "excelente").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Normal ({estudantes.filter(s => s.status === "normal").length})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco ({estudantes.filter(s => s.status === "risco").length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {filteredStudents.map(student => (
              <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                    <Badge className={`${statusBadgeStyle[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{student.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                    <p className={`text-sm font-bold ${student.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{student.presenca}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                    <p className={`text-sm font-bold ${student.media !== null && student.media >= 10 ? "text-accent" : "text-destructive"}`}>{student.media ?? "—"}</p>
                  </div>
                </div>
              </Card>
            ))}
            {filteredStudents.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>}
          </div>
        </TabsContent>

        {/* Disciplinas tab */}
        <TabsContent value="disciplines" className="space-y-4">
          <p className="text-sm text-muted-foreground">{disciplinas.length} disciplinas neste ano</p>
          <div className="space-y-2">
            {disciplinas.map(d => (
              <Card key={d.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${d.media !== null && d.media >= 10 ? "border-l-accent" : "border-l-destructive"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{d.name}</p>
                    <Badge variant="outline" className="text-[10px] font-mono">{d.code}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{d.professor}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Estudantes</p>
                    <p className="text-sm font-bold text-foreground">{d.estudantes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                    <p className={`text-sm font-bold ${d.media !== null && d.media >= 10 ? "text-accent" : "text-destructive"}`}>{d.media ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                    <Badge variant={d.taxaSucesso >= 80 ? "default" : "secondary"} className="text-[10px]">{d.taxaSucesso}%</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
