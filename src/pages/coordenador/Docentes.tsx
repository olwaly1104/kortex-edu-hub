import { useState } from "react";
import { coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search } from "lucide-react";

const statusBadge: Record<string, { label: string; cls: string }> = {
  activo: { label: "Activo", cls: "bg-accent/10 text-accent" },
  licença: { label: "Licença", cls: "bg-secondary/10 text-secondary" },
  inactivo: { label: "Inactivo", cls: "bg-muted text-muted-foreground" },
};

export default function CoordenadorDocentes() {
  const [search, setSearch] = useState("");
  const filtered = coordDocentes.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Docentes do Curso</h1>
        <Badge variant="outline">{coordDocentes.length} docentes</Badge>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar docente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-md" /></div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Departamento</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Disciplinas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turmas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.email}</p></td>
              <td className="p-3 text-muted-foreground">{d.department}</td>
              <td className="p-3 text-center">{d.disciplinas}</td>
              <td className="p-3 text-center">{d.turmas}</td>
              <td className="p-3 text-center"><span className={d.presenca >= 90 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.presenca}%</span></td>
              <td className="p-3 text-center"><Badge className={statusBadge[d.status].cls + " text-[10px]"}>{statusBadge[d.status].label}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}
