import { useState } from "react";
import { decanoDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Search, Users, BookOpen, CheckCircle } from "lucide-react";

const statusBadge: Record<string, { label: string; cls: string }> = {
  activo: { label: "Activo", cls: "bg-accent/10 text-accent" },
  licença: { label: "Licença", cls: "bg-secondary/10 text-secondary" },
  inactivo: { label: "Inactivo", cls: "bg-muted text-muted-foreground" },
};

export default function DecanoDocentes() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("todos");
  const courses = [...new Set(decanoDocentes.map(d => d.course))];
  const filtered = decanoDocentes.filter(d =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase())) &&
    (filterCourse === "todos" || d.course === filterCourse)
  );

  const activos = decanoDocentes.filter(d => d.status === "activo").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Docentes
        </h1>
        <p className="text-muted-foreground mt-1">{decanoDocentes.length} docentes · {activos} activos</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar docente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant={filterCourse === "todos" ? "default" : "outline"} onClick={() => setFilterCourse("todos")}>Todos</Button>
          {courses.map(c => (
            <Button key={c} size="sm" variant={filterCourse === c ? "default" : "outline"} onClick={() => setFilterCourse(c)} className="text-xs">{c}</Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(d => {
          const sb = statusBadge[d.status];
          return (
            <Card key={d.id} className={`p-4 flex items-center gap-4 border-l-[3px] ${d.status === "activo" ? "border-l-accent" : d.status === "licença" ? "border-l-secondary" : "border-l-border"}`}>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {d.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                  <Badge className={`${sb.cls} text-[10px] border-0`}>{sb.label}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{d.email}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {d.course}</span>
                  <span>{d.department}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 shrink-0 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Cadeiras</p>
                  <p className="text-sm font-bold text-foreground">{d.disciplinas}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Presença</p>
                  <p className={`text-sm font-bold ${d.presenca >= 90 ? "text-accent" : "text-destructive"}`}>{d.presenca}%</p>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum docente encontrado.</p>}
      </div>
    </div>
  );
}
