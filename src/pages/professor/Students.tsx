import { profStudents, allTurmas } from "@/data/professorData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, AlertTriangle, TrendingUp, UserCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

function SummaryCard({ label, value, icon: Icon, iconBg, iconColor, valueClass }: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; iconColor: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  );
}

export default function ProfessorStudents() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "todos";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [filterTurma, setFilterTurma] = useState<string>("todos");

  const scopedStudents = useMemo(() => {
    return filterTurma === "todos" ? profStudents : profStudents.filter(s => s.turmaId === filterTurma);
  }, [filterTurma]);

  const total = scopedStudents.length;
  const excellent = scopedStudents.filter(s => s.status === "excelente").length;
  const normal = scopedStudents.filter(s => s.status === "normal").length;
  const atRisk = scopedStudents.filter(s => s.status === "risco").length;

  const filtered = scopedStudents
    .filter(s => filterStatus === "todos" || s.status === filterStatus)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-secondary", risco: "border-l-destructive" };
  const statusLabels: Record<string, string> = { excelente: "Excelente", normal: "Normal", risco: "Em Risco" };
  const statusBadge: Record<string, string> = { excelente: "bg-accent/10 text-accent", normal: "bg-secondary/10 text-secondary", risco: "bg-destructive/10 text-destructive" };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Os Meus Estudantes</h1>
        <p className="text-sm text-muted-foreground mt-1">{profStudents.length} estudantes no total</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={total} icon={Users} iconBg="bg-primary/10" iconColor="text-primary" />
        <SummaryCard label="Excelentes" value={excellent} icon={TrendingUp} iconBg="bg-accent/10" iconColor="text-accent" valueClass="text-accent" />
        <SummaryCard label="Normal" value={normal} icon={UserCheck} iconBg="bg-secondary/10" iconColor="text-secondary" valueClass="text-secondary" />
        <SummaryCard label="Em Risco" value={atRisk} icon={AlertTriangle} iconBg="bg-destructive/10" iconColor="text-destructive" valueClass={atRisk > 0 ? "text-destructive" : undefined} />
      </div>

      {/* Turma toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Turma:</span>
        <button
          onClick={() => setFilterTurma("todos")}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === "todos" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
        >Todas</button>
        {allTurmas.map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTurma(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filterTurma === t.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}
          >{t.name}</button>
        ))}
      </div>

      {/* Search + status filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar estudante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 rounded-lg" />
        </div>
        <div className="flex gap-1.5">
          {["todos", "excelente", "normal", "risco"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterStatus === s
                  ? s === "risco"
                    ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                    : "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {s === "todos" ? "Todos" : s === "risco" ? "Em Risco" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {filtered.map(student => (
          <Card key={student.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[student.status]}`}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              {student.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                <Badge className={`${statusBadge[student.status]} text-[10px]`}>{statusLabels[student.status]}</Badge>
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
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum estudante encontrado.</p>
        )}
      </div>
    </div>
  );
}