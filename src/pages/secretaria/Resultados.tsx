import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessoesProva, candidaturas, type Candidatura } from "@/data/admissoesData";
import { Award, Send } from "lucide-react";

const MIN_PASSING_GRADE = 10;

export default function SecretariaResultados() {
  const [selectedSession, setSelectedSession] = useState(sessoesProva[0]?.id || "");
  const session = sessoesProva.find(s => s.id === selectedSession);
  const sessionCandidates = session ? candidaturas.filter(c => session.candidatosIds.includes(c.id)) : [];

  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    candidaturas.forEach(c => { if (c.nota !== undefined) init[c.id] = String(c.nota); });
    return init;
  });

  const updateGrade = (id: string, val: string) => {
    setGrades(prev => ({ ...prev, [id]: val }));
  };

  const getResult = (id: string): "aprovado" | "reprovado" | null => {
    const g = grades[id];
    if (!g || isNaN(Number(g))) return null;
    return Number(g) >= MIN_PASSING_GRADE ? "aprovado" : "reprovado";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
        <p className="text-muted-foreground">Registar notas das provas de admissão</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[320px]"><SelectValue placeholder="Seleccionar sessão" /></SelectTrigger>
          <SelectContent>
            {sessoesProva.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.curso} — {new Date(s.data).toLocaleDateString("pt-AO")} ({s.hora})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4" /> Notas da Sessão</CardTitle>
            <Badge variant="outline" className="text-xs">Nota mínima de aprovação: {MIN_PASSING_GRADE}/20</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead className="w-[120px]">Nota (0-20)</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionCandidates.map(c => {
                const result = getResult(c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.cursoOpcao1}</TableCell>
                    <TableCell>
                      <Input
                        type="number" min={0} max={20}
                        value={grades[c.id] || ""}
                        onChange={e => updateGrade(c.id, e.target.value)}
                        className="h-8 w-20 text-center"
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell>
                      {result === "aprovado" && <Badge className="bg-green-100 text-green-800 text-[10px]">Aprovado</Badge>}
                      {result === "reprovado" && <Badge className="bg-red-100 text-red-800 text-[10px]">Reprovado</Badge>}
                      {result === null && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessionCandidates.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum candidato nesta sessão.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {sessionCandidates.length > 0 && (
        <div className="flex justify-end">
          <Button className="gap-2"><Send className="w-4 h-4" /> Submeter Resultados</Button>
        </div>
      )}
    </div>
  );
}
