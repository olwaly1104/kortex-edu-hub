import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { anosLetivos } from "@/data/academica2Data";
import { Calendar, Sparkles, Archive, CheckCircle2, Clock } from "lucide-react";

const statusCfg = {
  ativo: { label: "Activo", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  planeado: { label: "Planeado", icon: Clock, color: "bg-amber-100 text-amber-700" },
  arquivado: { label: "Arquivado", icon: Archive, color: "bg-muted text-muted-foreground" },
};

export default function AnosLetivos() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Anos Letivos</h1>
          <p className="text-sm text-muted-foreground mt-1">Histórico e planeamento dos anos letivos da universidade.</p>
        </div>
        <Link to="/areaacademica/criador"><Button className="gap-2"><Sparkles className="w-4 h-4" /> Criar Próximo</Button></Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {[...anosLetivos].reverse().map(a => {
          const cfg = statusCfg[a.status];
          const Icon = cfg.icon;
          return (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xl font-bold text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.startDate} — {a.endDate}</p>
                </div>
                <Badge className={`${cfg.color} gap-1`}><Icon className="w-3 h-3" /> {cfg.label}</Badge>
              </div>

              {a.status !== "arquivado" && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Planeamento</span><span className="font-mono">{a.progresso}%</span>
                  </div>
                  <Progress value={a.progresso} className="h-1.5" />
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 pt-4 border-t border-border text-center">
                <div><p className="text-lg font-bold">{a.cursos}</p><p className="text-[10px] text-muted-foreground">Cursos</p></div>
                <div><p className="text-lg font-bold">{a.cadeiras}</p><p className="text-[10px] text-muted-foreground">Cadeiras</p></div>
                <div><p className="text-lg font-bold">{a.turmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
                <div><p className="text-lg font-bold">{a.estudantes.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Estudantes</p></div>
                <div><p className="text-lg font-bold">{a.docentes}</p><p className="text-[10px] text-muted-foreground">Docentes</p></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
