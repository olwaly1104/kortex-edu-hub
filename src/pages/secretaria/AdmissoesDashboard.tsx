import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { candidaturas, sessoesProva, estadoLabels, estadoColors, type EstadoCandidatura } from "@/data/admissoesData";
import { FileText, CalendarDays, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const states: EstadoCandidatura[] = ["pendente", "docs_aprovados", "convocado", "aguarda_resultados", "aprovado", "reprovado", "desistiu"];

export default function AdmissoesDashboard() {
  const navigate = useNavigate();
  const total = candidaturas.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admissões</h1>
        <p className="text-muted-foreground">Visão geral do processo de admissão</p>
      </div>

      {/* Stats by state */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {states.map(s => (
          <div key={s} className="text-center p-3 rounded-lg border bg-card">
            <p className="text-2xl font-bold">{candidaturas.filter(c => c.estado === s).length}</p>
            <Badge className={`mt-1 text-[10px] ${estadoColors[s]}`}>{estadoLabels[s]}</Badge>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/secretaria/admissoes/candidaturas")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="font-semibold">Candidaturas</p>
              <p className="text-sm text-muted-foreground">{total} total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/secretaria/admissoes/convocacoes")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"><CalendarDays className="w-6 h-6 text-purple-700" /></div>
            <div>
              <p className="font-semibold">Convocações</p>
              <p className="text-sm text-muted-foreground">{sessoesProva.length} sessões</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/secretaria/admissoes/resultados")}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"><Award className="w-6 h-6 text-green-700" /></div>
            <div>
              <p className="font-semibold">Resultados</p>
              <p className="text-sm text-muted-foreground">{candidaturas.filter(c => c.estado === "aprovado" || c.estado === "reprovado").length} avaliados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
