import { useState } from "react";
import { coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, Users, CheckCircle, ClipboardList, Award } from "lucide-react";

export default function CoordenadorDocentes() {
  const [search, setSearch] = useState("");
  const filtered = coordDocentes.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const totalDocentes = coordDocentes.length;
  const presencaGeral = Math.round(coordDocentes.reduce((s, d) => s + d.presenca, 0) / totalDocentes);
  const taxaEntregaGeral = Math.round(coordDocentes.reduce((s, d) => s + d.taxaEntrega, 0) / totalDocentes);
  const mediaGeral = +(coordDocentes.reduce((s, d) => s + d.mediaGeral, 0) / totalDocentes).toFixed(1);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Docentes do Curso</h1>
        <Badge variant="outline">{totalDocentes} docentes</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Docentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalDocentes}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presença Geral</span>
          </div>
          <p className={`text-2xl font-bold ${presencaGeral >= 75 ? "text-accent" : "text-destructive"}`}>{presencaGeral}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Entrega Geral</span>
          </div>
          <p className={`text-2xl font-bold ${taxaEntregaGeral >= 80 ? "text-accent" : "text-destructive"}`}>{taxaEntregaGeral}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}</p>
        </Card>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar docente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-md" /></div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estudantes</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Cadeiras</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Turmas</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Taxa Entrega</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Média Geral</th>
          </tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="p-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-[11px] text-muted-foreground">{d.email}</p></td>
              <td className="p-3 text-center font-medium text-foreground">{d.estudantesTotal}</td>
              <td className="p-3 text-center">{d.disciplinas}</td>
              <td className="p-3 text-center">{d.turmas}</td>
              <td className="p-3 text-center"><span className={d.presenca >= 90 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.presenca}%</span></td>
              <td className="p-3 text-center"><span className={d.taxaEntrega >= 80 ? "text-accent font-medium" : "text-destructive font-medium"}>{d.taxaEntrega}%</span></td>
              <td className="p-3 text-center"><span className={d.mediaGeral >= 10 ? "text-accent font-bold" : "text-destructive font-bold"}>{d.mediaGeral}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}
