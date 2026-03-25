import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessoesProva, candidaturas } from "@/data/admissoesData";
import { CalendarDays, List, Plus, MapPin, Clock, Users, CheckSquare } from "lucide-react";

export default function SecretariaConvocacoes() {
  const [view, setView] = useState<"calendar" | "list">("list");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const session = selectedSession ? sessoesProva.find(s => s.id === selectedSession) : null;
  const sessionCandidates = session ? candidaturas.filter(c => session.candidatosIds.includes(c.id)) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convocações</h1>
          <p className="text-muted-foreground">Sessões de provas de admissão</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-sm ${view === "calendar" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Nova Sessão</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedSession ? "lg:col-span-1" : "lg:col-span-3"}>
          <div className="grid gap-3">
            {sessoesProva.map(s => {
              const isSelected = selectedSession === s.id;
              const isPast = new Date(s.data) < new Date();
              return (
                <Card key={s.id} className={`cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"}`} onClick={() => setSelectedSession(isSelected ? null : s.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{s.curso}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(s.data).toLocaleDateString("pt-AO")}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.hora}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.sala}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isPast ? "secondary" : "default"} className="text-[10px]">{isPast ? "Realizada" : "Agendada"}</Badge>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end"><Users className="w-3 h-3" /> {s.candidatosIds.length}/{s.capacidadeMax}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {session && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Candidatos Convocados — {session.curso}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionCandidates.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.telefone}</TableCell>
                        <TableCell><Badge className={`text-[10px] ${c.estado === "convocado" ? "bg-purple-100 text-purple-800" : c.estado === "aguarda_resultados" ? "bg-orange-100 text-orange-800" : c.estado === "aprovado" ? "bg-green-100 text-green-800" : c.estado === "reprovado" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>{c.estado}</Badge></TableCell>
                        <TableCell>
                          <input type="checkbox" defaultChecked={c.estado !== "convocado"} className="rounded border-border" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessionCandidates.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum candidato convocado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
