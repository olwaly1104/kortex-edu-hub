import { reitoriaDecanos } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { UserCog } from "lucide-react";
export default function ReitoriaDecanos() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><UserCog className="w-6 h-6 text-primary" /> Decanos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{reitoriaDecanos.map(d => (
        <Card key={d.id} className="p-5"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{d.name.split(" ").map(n=>n[0]).filter(c=>c===c.toUpperCase()).slice(0,2).join("")}</div><div className="flex-1 min-w-0"><p className="font-bold text-foreground">{d.name}</p><p className="text-sm text-muted-foreground">{d.faculty}</p><p className="text-xs text-muted-foreground mt-1">{d.email} · Desde {d.since}</p></div><div className="text-right shrink-0"><p className="text-lg font-bold text-foreground">{d.courses}</p><p className="text-[10px] text-muted-foreground">cursos</p><p className="text-sm font-medium text-muted-foreground">{d.estudantes} est.</p></div></div></Card>
      ))}</div>
    </div>
  );
}
