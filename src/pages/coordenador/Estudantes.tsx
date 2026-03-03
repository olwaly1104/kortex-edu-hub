import { useState } from "react";
import { coordEstudantes, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, { label: string; cls: string }> = {
  excelente: { label: "Excelente", cls: "bg-accent/10 text-accent" },
  normal: { label: "Normal", cls: "bg-primary/10 text-primary" },
  risco: { label: "Em Risco", cls: "bg-destructive/10 text-destructive" },
};

export default function CoordenadorEstudantes() {
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filtered = coordEstudantes.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.includes(search)) &&
    (!filterYear || e.year === filterYear) &&
    (filterStatus === "todos" || e.status === filterStatus)
  );

  const stats = [
    { label: "Total", value: coordCursoInfo.totalEstudantes, color: "text-primary bg-primary/10" },
    { label: "Excelentes", value: coordEstudantes.filter(e => e.status === "excelente").length, color: "text-accent bg-accent/10" },
    { label: "Normal", value: coordEstudantes.filter(e => e.status === "normal").length, color: "text-primary bg-primary/10" },
    { label: "Em Risco", value: coordEstudantes.filter(e => e.status === "risco").length, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Estudantes do Curso</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className={cn("text-2xl font-bold", s.color.split(" ")[0])}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[null, 1, 2, 3, 4, 5].map(y => (
          <Button key={String(y)} size="sm" variant={filterYear === y ? "default" : "outline"} onClick={() => setFilterYear(y)}>
            {y === null ? "Todos os Anos" : `${y}º Ano`}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar estudante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        {["todos", "excelente", "normal", "risco"].map(s => (
          <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s)}>
            {s === "todos" ? "Todos" : statusBadge[s]?.label || s}
          </Button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Ano</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turma</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(e => {
            const sb = statusBadge[e.status];
            return (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="p-3 font-medium text-foreground">{e.name}</td>
                <td className="p-3 text-muted-foreground">{e.email}</td>
                <td className="p-3 text-center">{e.year}º</td>
                <td className="p-3 text-center">{e.turma}</td>
                <td className="p-3 text-center"><span className={e.media !== null && e.media >= 10 ? "text-accent font-medium" : "text-destructive font-medium"}>{e.media ?? "—"}</span></td>
                <td className="p-3 text-center"><span className={e.presenca >= 75 ? "text-accent" : "text-destructive"}>{e.presenca}%</span></td>
                <td className="p-3 text-center"><Badge className={cn("text-[10px]", sb.cls)}>{sb.label}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}
