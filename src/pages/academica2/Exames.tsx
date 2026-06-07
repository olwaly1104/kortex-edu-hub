import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exames, cursoTemplates } from "@/data/academica2Data";
import { ClipboardCheck, Sparkles, MapPin, Clock, Users } from "lucide-react";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

export default function Exames() {
  const [epoca, setEpoca] = useState<string>("all");
  const [faculdade, setFaculdade] = useState<string>("all");

  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);
  const faculties = useMemo(() => Array.from(new Set(cursoTemplates.map(c => c.faculty))), []);

  const filtered = useMemo(() => exames.filter(e =>
    (epoca === "all" || e.epoca === epoca) &&
    (faculdade === "all" || facultyByCode[e.curso] === faculdade)
  ), [epoca, faculdade, facultyByCode]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof exames> = {};
    filtered.forEach(e => {
      const f = facultyByCode[e.curso] || "—";
      (g[f] ||= []).push(e);
    });
    return g;
  }, [filtered, facultyByCode]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-primary" /> Mapa de Exames</h1>
          <p className="text-sm text-muted-foreground mt-1">Exames presenciais organizados por faculdade, curso e cadeira.</p>
        </div>
        <Button className="gap-2"><Sparkles className="w-4 h-4" /> Gerar Mapa</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4"><ClipboardCheck className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">Exames</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><Users className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{filtered.reduce((a, e) => a + e.inscritos, 0)}</p><p className="text-xs text-muted-foreground">Inscritos</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><MapPin className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg" /><div><p className="text-2xl font-bold">{new Set(filtered.map(e => e.sala)).size}</p><p className="text-xs text-muted-foreground">Salas</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><Clock className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{filtered.filter(e => e.epoca === "1ª").length}</p><p className="text-xs text-muted-foreground">1ª Época</p></div></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={faculdade} onValueChange={setFaculdade}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Faculdade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faculdades</SelectItem>
              {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={epoca} onValueChange={setEpoca}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Épocas</SelectItem>
              <SelectItem value="1ª">1ª Época</SelectItem>
              <SelectItem value="2ª">2ª Época</SelectItem>
              <SelectItem value="Especial">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {Object.entries(grouped).map(([fac, items]) => (
        <Card key={fac}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-background">{acronymMap[fac] || fac}</span>
              <h2 className="text-sm font-semibold">{fac}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{items.length} exames · {items.reduce((a, e) => a + e.inscritos, 0)} inscritos</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cadeira</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Época</TableHead>
                <TableHead>Inscritos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.date}</TableCell>
                  <TableCell className="font-mono text-xs">{e.time}</TableCell>
                  <TableCell className="font-medium">{e.cadeira}</TableCell>
                  <TableCell><Badge variant="outline">{e.curso}</Badge></TableCell>
                  <TableCell>{e.ano}º {e.turma}</TableCell>
                  <TableCell className="text-sm">{e.sala}</TableCell>
                  <TableCell><Badge>{e.epoca}</Badge></TableCell>
                  <TableCell>{e.inscritos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
