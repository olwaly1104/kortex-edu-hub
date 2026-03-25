import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sessoesProva, candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  CalendarDays, Clock, MapPin, Users, CheckCircle, Phone,
  Mail, ChevronRight, Plus, User,
} from "lucide-react";

export default function SecretariaConvocacoes() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const now = new Date();
  const session = selectedSession ? sessoesProva.find(s => s.id === selectedSession) : null;
  const sessionCandidates = session ? candidaturas.filter(c => session.candidatosIds.includes(c.id)) : [];

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" /> Convocações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sessões de provas de admissão e candidatos convocados</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Nova Sessão</Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sessões</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{sessoesProva.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Realizadas</span>
          </div>
          <p className="text-2xl font-bold text-accent">{sessoesProva.filter(s => new Date(s.data) < now).length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-secondary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agendadas</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{sessoesProva.filter(s => new Date(s.data) >= now).length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Convocados</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{sessoesProva.reduce((s, ss) => s + ss.candidatosIds.length, 0)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className={selectedSession ? "lg:col-span-1" : "lg:col-span-3"}>
          <div className="space-y-2">
            {sessoesProva.map(s => {
              const isSelected = selectedSession === s.id;
              const isPast = new Date(s.data) < now;
              const occupancy = Math.round((s.candidatosIds.length / s.capacidadeMax) * 100);
              return (
                <Card
                  key={s.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary border-primary/30" : "hover:border-primary/20"}`}
                  onClick={() => setSelectedSession(isSelected ? null : s.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-sm text-foreground">{s.curso}</p>
                        <Badge variant={isPast ? "outline" : "default"} className="text-[10px]">
                          {isPast ? "Realizada" : "Agendada"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(s.data).toLocaleDateString("pt-AO")}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.hora}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.sala}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Candidatos</p>
                        <p className={`text-sm font-bold ${occupancy >= 90 ? "text-destructive" : "text-foreground"}`}>
                          {s.candidatosIds.length}/{s.capacidadeMax}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selected Session Detail */}
        {session && (
          <div className="lg:col-span-2 space-y-4">
            {/* Session Header */}
            <Card className="p-5 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{session.curso}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {new Date(session.data).toLocaleDateString("pt-AO")}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.hora}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.sala}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {session.candidatosIds.length}/{session.capacidadeMax}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Candidates Table */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" /> Candidatos Convocados
                  <Badge variant="outline" className="text-[10px]">{sessionCandidates.length}</Badge>
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left p-3 font-medium text-muted-foreground">Candidato</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contacto</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionCandidates.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{c.nome}</p>
                            <p className="text-[11px] text-muted-foreground">{c.cursoOpcao1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefone}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={`text-[10px] border-0 ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" defaultChecked={c.estado !== "convocado"} className="rounded border-border w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                  {sessionCandidates.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted-foreground py-8 text-sm">Nenhum candidato convocado.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
