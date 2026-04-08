import { useState } from "react";
import { decanoEstudantes, decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, BookOpen } from "lucide-react";

const statusBadge: Record<string, { label: string; cls: string }> = {
  excelente: { label: "Excelente", cls: "bg-accent/10 text-accent" },
  normal: { label: "Normal", cls: "bg-muted text-muted-foreground" },
  risco: { label: "Em Risco", cls: "bg-destructive/10 text-destructive" },
};

export default function DecanoEstudantes() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("todos");
  const courses = [...new Set(decanoEstudantes.map(e => e.course))];
  const filtered = decanoEstudantes.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase())) &&
    (filterCourse === "todos" || e.course === filterCourse)
  );

  const excelentes = decanoEstudantes.filter(e => e.status === "excelente").length;
  const risco = decanoEstudantes.filter(e => e.status === "risco").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Estudantes
        </h1>
        <p className="text-muted-foreground mt-1">{decanoFaculty.totalEstudantes} total · {excelentes} excelentes · {risco} em risco</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar estudante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant={filterCourse === "todos" ? "default" : "outline"} onClick={() => setFilterCourse("todos")}>Todos</Button>
          {courses.map(c => (
            <Button key={c} size="sm" variant={filterCourse === c ? "default" : "outline"} onClick={() => setFilterCourse(c)} className="text-xs">{c}</Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Excelente</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Risco</span>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(e => {
          const sb = statusBadge[e.status];
          const statusColors: Record<string, string> = { excelente: "border-l-accent", normal: "border-l-muted-foreground", risco: "border-l-destructive" };
          return (
            <Card key={e.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${statusColors[e.status]}`}>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {e.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{e.name}</p>
                  <Badge className={`${sb.cls} text-[10px] border-0`}>{sb.label}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{e.email}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {e.course}</span>
                  <span>{e.year}º Ano</span>
                </div>
              </div>
              <div className="shrink-0 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                <p className={`text-sm font-bold ${e.media !== null && e.media >= 10 ? "text-accent" : "text-destructive"}`}>{e.media ?? "—"}</p>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>}
      </div>
    </div>
  );
}
