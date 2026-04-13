import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function StudentAnnouncements() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-secondary" /> Anúncios
        </h1>
        <p className="text-muted-foreground mt-1">4 anúncios novos hoje</p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => {
          const style = typeStyles[ann.type];
          return (
            <Card key={ann.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <Badge className={style.bg}>{style.label}</Badge>
                <span className="text-xs text-muted-foreground shrink-0">{ann.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{ann.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
              <p className="text-xs text-muted-foreground mt-3">— {ann.author}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
