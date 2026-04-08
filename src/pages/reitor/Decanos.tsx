import { useState } from "react";
import { reitoriaDecanos, reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, GraduationCap, Building2 } from "lucide-react";

export default function ReitorDecanos() {
  const [search, setSearch] = useState("");
  const filtered = reitoriaDecanos.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.faculty.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Decanos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{reitoriaDecanos.length} decanos activos</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar decano..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(d => {
          const fac = reitorFaculties.find(f => f.deanId === d.id);
          return (
            <Card key={d.id} className="p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {d.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.faculty}</p>
                  <p className="text-[11px] text-muted-foreground">{d.email} · Desde {d.since}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Cursos</p>
                    <p className="text-sm font-bold text-foreground">{d.courses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Estudantes</p>
                    <p className="text-sm font-bold text-foreground">{d.estudantes.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum decano encontrado.</p>}
      </div>
    </div>
  );
}
