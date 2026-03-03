import { useState } from "react";
import { decanoEstudantes, decanoFaculty } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, { label: string; cls: string }> = { excelente: { label: "Excelente", cls: "bg-accent/10 text-accent" }, normal: { label: "Normal", cls: "bg-primary/10 text-primary" }, risco: { label: "Em Risco", cls: "bg-destructive/10 text-destructive" } };

export default function DecanoEstudantes() {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("todos");
  const filtered = decanoEstudantes.filter(e => (!search || e.name.toLowerCase().includes(search.toLowerCase())) && (filterCourse === "todos" || e.course === filterCourse));
  const courses = [...new Set(decanoEstudantes.map(e => e.course))];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Estudantes</h1><Badge variant="outline">{decanoFaculty.totalEstudantes} total</Badge></div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filterCourse === "todos" ? "default" : "outline"} onClick={() => setFilterCourse("todos")}>Todos</Button>
        {courses.map(c => <Button key={c} size="sm" variant={filterCourse === c ? "default" : "outline"} onClick={() => setFilterCourse(c)}>{c}</Button>)}
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Nome</th><th className="text-left p-3 font-medium text-muted-foreground">Curso</th><th className="text-center p-3 font-medium text-muted-foreground">Ano</th><th className="text-center p-3 font-medium text-muted-foreground">Média</th><th className="text-center p-3 font-medium text-muted-foreground">Estado</th></tr></thead>
      <tbody>{filtered.map(e => (<tr key={e.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium text-foreground">{e.name}</td><td className="p-3 text-muted-foreground">{e.course}</td><td className="p-3 text-center">{e.year}º</td><td className="p-3 text-center"><span className={e.media !== null && e.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.media ?? "—"}</span></td><td className="p-3 text-center"><Badge className={cn("text-[10px]", statusBadge[e.status].cls)}>{statusBadge[e.status].label}</Badge></td></tr>))}</tbody></table></Card>
    </div>
  );
}
