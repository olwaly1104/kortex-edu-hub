import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sessoesProva, candidaturas } from "@/data/admissoesData";
import { CalendarDays, Clock, MapPin, Users, ChevronRight } from "lucide-react";

export default function SecretariaConvocacoes() {
  const now = new Date();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Provas de Acesso</h1>
        <p className="text-sm text-muted-foreground mt-1">Sessões de prova de acesso geral</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{sessoesProva.length}</p>
              <p className="text-xs text-muted-foreground">Total Sessões</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{sessoesProva.filter(s => new Date(s.data) < now).length}</p>
              <p className="text-xs text-muted-foreground">Realizadas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{sessoesProva.reduce((s, ss) => s + ss.candidatosIds.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Candidatos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessoesProva.map(s => {
          const isPast = new Date(s.data) < now;
          const occupancy = Math.round((s.candidatosIds.length / s.capacidadeMax) * 100);
          return (
            <Link key={s.id} to={`/secretaria/admissoes/provas-de-acesso/${s.id}`}>
              <Card className="p-5 hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{s.nome}</h3>
                      <Badge variant={isPast ? "outline" : "default"} className="text-[10px]">
                        {isPast ? "Realizada" : "Agendada"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(s.data).toLocaleDateString("pt-AO")}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {s.hora}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {s.sala}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {s.candidatosIds.length}/{s.capacidadeMax} candidatos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Ocupação</span>
                        <span className={occupancy >= 90 ? "text-red-600 font-medium" : ""}>{occupancy}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${occupancy >= 90 ? "bg-red-500" : occupancy >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
