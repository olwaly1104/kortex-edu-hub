import { useState } from "react";
import { reitoriaCoords, reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, GraduationCap, UserCog } from "lucide-react";

export default function ReitorCoordenadores() {
  const [search, setSearch] = useState("");
  const [facFilter, setFacFilter] = useState<string | null>(null);
  const faculties = [...new Set(reitoriaCoords.map(c => c.faculty))];

  const filtered = reitoriaCoords
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.course.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !facFilter || c.faculty === facFilter);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" /> Coordenadores
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{reitoriaCoords.length} coordenadores activos</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          <Button size="sm" variant={facFilter === null ? "default" : "outline"} onClick={() => setFacFilter(null)} className="text-xs">Todas</Button>
          {faculties.map(f => (
            <Button key={f} size="sm" variant={facFilter === f ? "default" : "outline"} onClick={() => setFacFilter(facFilter === f ? null : f)} className="text-xs">{f}</Button>
          ))}
        </div>
        <div className="border-t border-border" />
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar coordenador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.course} · {c.faculty}</p>
                <p className="text-[11px] text-muted-foreground">{c.email}</p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-[10px] text-muted-foreground uppercase">Estudantes</p>
                <p className="text-sm font-bold text-foreground">{c.estudantes}</p>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum coordenador encontrado.</p>}
      </div>
    </div>
  );
}
