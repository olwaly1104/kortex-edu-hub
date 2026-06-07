import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cadeirasAcad, cursoTemplates } from "@/data/academica2Data";
import { BookOpen, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cadeiras() {
  const [search, setSearch] = useState("");
  const [cursoFilter, setCursoFilter] = useState("all");

  const filtered = cadeirasAcad.filter(c =>
    (cursoFilter === "all" || c.curso === cursoFilter) &&
    (search === "" || c.cadeira.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Cadeiras</h1>
          <p className="text-sm text-muted-foreground mt-1">Plano curricular consolidado por curso e ano.</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Cadeira</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar cadeira…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {cursoTemplates.map(c => <SelectItem key={c.id} value={c.code}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cadeira</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>ECTS</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead>Turmas</TableHead>
              <TableHead>Estudantes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.cadeira}</TableCell>
                <TableCell><Badge variant="outline">{c.curso}</Badge></TableCell>
                <TableCell>{c.ano}º</TableCell>
                <TableCell className="font-mono text-xs">{c.ects}</TableCell>
                <TableCell className="text-sm">{c.docente}</TableCell>
                <TableCell>{c.turmas}</TableCell>
                <TableCell>{c.estudantes}</TableCell>
                <TableCell>
                  <Badge className={c.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                    {c.publicada ? "Publicada" : "Rascunho"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
