import { useState } from "react";
import { reitoriaDocentes, reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReitorDocentes() {
  const [search, setSearch] = useState("");
  const [facFilter, setFacFilter] = useState<string | null>(null);
  const faculties = [...new Set(reitoriaDocentes.map(d => d.faculty))];

  const filtered = reitoriaDocentes
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase()))
    .filter(d => !facFilter || d.faculty === facFilter);

  const statusStyle: Record<string, string> = {
    activo: "bg-accent/10 text-accent",
    licença: "bg-amber-50 text-amber-700",
    inactivo: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Docentes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{reitoriaDocentes.length} docentes na universidade</p>
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
          <Input placeholder="Pesquisar docente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(d => (
          <Card key={d.id} className="p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {d.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                  <Badge className={cn("text-[10px]", statusStyle[d.status])}>{d.status === "activo" ? "Activo" : d.status === "licença" ? "Licença" : "Inactivo"}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{d.email} · {d.faculty} · {d.course}</p>
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
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum docente encontrado.</p>}
      </div>
    </div>
  );
}
