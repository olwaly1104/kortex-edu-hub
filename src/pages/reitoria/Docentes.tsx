import { useState } from "react";
import { reitoriaDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
const statusBadge: Record<string, { label: string; cls: string }> = { activo: { label: "Activo", cls: "bg-accent/10 text-accent" }, licença: { label: "Licença", cls: "bg-secondary/10 text-secondary" }, inactivo: { label: "Inactivo", cls: "bg-muted text-muted-foreground" } };
export default function ReitoriaDocentes() {
  const [search, setSearch] = useState("");
  const [filterFac, setFilterFac] = useState("todos");
  const facs = [...new Set(reitoriaDocentes.map(d => d.faculty))];
  const filtered = reitoriaDocentes.filter(d => (!search || d.name.toLowerCase().includes(search.toLowerCase())) && (filterFac === "todos" || d.faculty === filterFac));
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Docentes</h1><Badge variant="outline">{reitoriaDocentes.length} docentes</Badge></div>
      <div className="flex gap-2 flex-wrap"><Button size="sm" variant={filterFac === "todos" ? "default" : "outline"} onClick={() => setFilterFac("todos")}>Todos</Button>{facs.map(f => <Button key={f} size="sm" variant={filterFac === f ? "default" : "outline"} onClick={() => setFilterFac(f)}>{f}</Button>)}</div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Nome</th><th className="text-left p-3 font-medium text-muted-foreground">Faculdade</th><th className="text-left p-3 font-medium text-muted-foreground">Curso</th><th className="text-center p-3 font-medium text-muted-foreground">Cadeiras</th><th className="text-center p-3 font-medium text-muted-foreground">Presença</th><th className="text-center p-3 font-medium text-muted-foreground">Estado</th></tr></thead>
      <tbody>{filtered.map(d => (<tr key={d.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium text-foreground">{d.name}</td><td className="p-3 text-muted-foreground">{d.faculty}</td><td className="p-3 text-muted-foreground">{d.course}</td><td className="p-3 text-center">{d.disciplinas}</td><td className="p-3 text-center"><span className={d.presenca >= 90 ? "text-accent" : "text-destructive"}>{d.presenca}%</span></td><td className="p-3 text-center"><Badge className={statusBadge[d.status].cls + " text-[10px]"}>{statusBadge[d.status].label}</Badge></td></tr>))}</tbody></table></Card>
    </div>
  );
}
