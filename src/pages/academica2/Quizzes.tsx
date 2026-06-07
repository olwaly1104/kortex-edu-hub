import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { quizzes, cursoTemplates } from "@/data/academica2Data";
import { BrainCircuit, Sparkles, CheckCircle2 } from "lucide-react";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

export default function QuizzesAcad() {
  const [faculdade, setFaculdade] = useState<string>("all");
  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);
  const faculties = useMemo(() => Array.from(new Set(cursoTemplates.map(c => c.faculty))), []);

  const filtered = useMemo(() => quizzes.filter(q => faculdade === "all" || facultyByCode[q.curso] === faculdade), [faculdade, facultyByCode]);
  const publicados = filtered.filter(q => q.publicado).length;

  const grouped = useMemo(() => {
    const g: Record<string, typeof quizzes> = {};
    filtered.forEach(q => {
      const f = facultyByCode[q.curso] || "—";
      (g[f] ||= []).push(q);
    });
    return g;
  }, [filtered, facultyByCode]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" /> Banco de Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">Quizzes organizados por faculdade, curso e cadeira.</p>
        </div>
        <Button className="gap-2"><Sparkles className="w-4 h-4" /> Gerar Quizzes</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4"><BrainCircuit className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">Quizzes</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><CheckCircle2 className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{publicados}</p><p className="text-xs text-muted-foreground">Publicados</p></div></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{filtered.reduce((a, q) => a + q.perguntas, 0)}</p><p className="text-xs text-muted-foreground">Perguntas</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{filtered.reduce((a, q) => a + q.tentativas, 0)}</p><p className="text-xs text-muted-foreground">Tentativas</p></Card>
      </div>

      <Card className="p-4">
        <Select value={faculdade} onValueChange={setFaculdade}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Faculdade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Faculdades</SelectItem>
            {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {Object.entries(grouped).map(([fac, items]) => (
        <Card key={fac}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-background">{acronymMap[fac] || fac}</span>
              <h2 className="text-sm font-semibold">{fac}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{items.length} quizzes</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cadeira</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Perguntas</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.cadeira}</TableCell>
                  <TableCell><Badge variant="outline">{q.curso}</Badge></TableCell>
                  <TableCell>{q.ano}º</TableCell>
                  <TableCell>{q.perguntas}</TableCell>
                  <TableCell>{q.duracao} min</TableCell>
                  <TableCell>{q.tentativas}</TableCell>
                  <TableCell>
                    <Badge className={q.publicado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                      {q.publicado ? "Publicado" : "Rascunho"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
