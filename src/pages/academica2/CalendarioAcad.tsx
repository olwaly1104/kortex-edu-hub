import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calendarioAcademico } from "@/data/academica2Data";
import { Calendar, Plus, Play, Square, PartyPopper, ClipboardCheck, FileText } from "lucide-react";

const tipoCfg = {
  inicio: { icon: Play, color: "bg-emerald-100 text-emerald-700", label: "Início" },
  fim: { icon: Square, color: "bg-muted text-foreground", label: "Fim" },
  feriado: { icon: PartyPopper, color: "bg-amber-100 text-amber-700", label: "Pausa" },
  exames: { icon: ClipboardCheck, color: "bg-blue-100 text-blue-700", label: "Exames" },
  matriculas: { icon: FileText, color: "bg-purple-100 text-purple-700", label: "Matrículas" },
};

export default function CalendarioAcad() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Calendário Académico</h1>
          <p className="text-sm text-muted-foreground mt-1">Marcos do ano letivo — semestres, pausas e épocas de exames.</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Marco</Button>
      </div>

      <Card className="p-5">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {calendarioAcademico.map(e => {
              const cfg = tipoCfg[e.tipo];
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="flex items-start gap-4 pl-2 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-2 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold">{e.titulo}</p>
                      <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
