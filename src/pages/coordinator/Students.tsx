import { profStudents, profDisciplines } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { useState } from "react";

export default function CoordinatorStudents() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("todos");

  const filtered = profStudents
    .filter(s => filterStatus === "todos" || s.status === filterStatus)
    .filter(s => filterDiscipline === "todos" || s.disciplineId === filterDiscipline)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const atRisk = profStudents.filter(s => s.status === "risco").length;
  const excellent = profStudents.filter(s => s.status === "excelente").length;

  const statusColors = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadge = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
          <p className="text-muted-foreground mt-1">{profStudents.length} alunos no total — <span className="text-xs">modo supervisão</span></p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" /> Apenas leitura
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary"><Users className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-foreground">{profStudents.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/10 text-accent"><TrendingUp className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-accent">{excellent}</p><p className="text-xs text-muted-foreground">Excelentes</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive"><AlertTriangle className="w-5 h-5" /></div>
          <div><p className="text-2xl font-bold text-destructive">{atRisk}</p><p className="text-xs text-muted-foreground">Em Risco</p></div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar aluno..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {["todos", "excelente", "normal", "risco"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {s === "todos" ? "Todos" : s === "risco" ? "Em Risco" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterDiscipline("todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDiscipline === "todos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >Todas</button>
          {profDisciplines.map(d => (
            <button
              key={d.id}
              onClick={() => setFilterDiscipline(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDiscipline === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >{d.code}</button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {filtered.map(student => {
          const disc = profDisciplines.find(d => d.id === student.disciplineId);
          return (
            <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                  <Badge className={`${statusBadge[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
                  {disc && <Badge variant="outline" className="text-[10px]" style={{ borderColor: disc.color + "40", color: disc.color }}>{disc.code}</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">{student.email} • {student.turma}</p>
              </div>
              <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                  <p className={`text-sm font-bold ${student.attendance >= 75 ? "text-accent" : "text-destructive"}`}>{student.attendance}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                  <p className={`text-sm font-bold ${student.avgGrade && student.avgGrade >= 10 ? "text-accent" : "text-destructive"}`}>{student.avgGrade ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Entregas</p>
                  <p className="text-sm font-bold text-foreground">{student.submittedTasks}/{student.totalTasks}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Última</p>
                  <p className="text-xs text-muted-foreground">{student.lastActive}</p>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum aluno encontrado.</p>
        )}
      </div>
    </div>
  );
}
