import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cadeirasAcad, cursoTemplates, anosLetivos } from "@/data/academica2Data";
import { getCadeiraContent } from "@/data/cadeiraContentData";
import { BookOpen, Search, Plus, PlayCircle, FileText, CalendarRange, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const parseDate = (s: string) => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
const weeksBetween = (start: string, end: string) => {
  const ms = parseDate(end).getTime() - parseDate(start).getTime();
  // Subtract ~4 weeks of breaks (Natal, Páscoa, exames)
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 7)) - 4);
};

export default function Cadeiras() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cursoFilter, setCursoFilter] = useState("all");
  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2025-2026");

  const yl = anosLetivos.find(a => a.id === anoLetivo)!;
  const aulasNoAno = useMemo(() => weeksBetween(yl.startDate, yl.endDate), [yl]);

  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);
  const acronymMap: Record<string, string> = {
    "Faculdade de Ciências Exatas": "FCE",
    "Faculdade de Ciências da Saúde": "FCS",
    "Faculdade de Ciências Sociais": "FCSO",
  };

  const isFuture = yl.status !== "ativo" && yl.status !== "arquivado";

  const rows = useMemo(() => cadeirasAcad
    .filter(c => (cursoFilter === "all" || c.curso === cursoFilter) && (search === "" || c.cadeira.toLowerCase().includes(search.toLowerCase())))
    .map(c => {
      const content = getCadeiraContent(c.id, c.cadeira);
      const exames = content.calendario.filter(e => e.tipo === "avaliacao").length;
      return { ...c, faculdade: facultyByCode[c.curso] || "—", conteudos: content.conteudos.length, exames, aulasPlaneadas: aulasNoAno };
    }), [cursoFilter, search, aulasNoAno, facultyByCode]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Cadeiras</h1>
          <p className="text-sm text-muted-foreground mt-1">Plano curricular consolidado por curso e ano letivo.</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Cadeira</Button>
      </div>

      <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <CalendarRange className="w-5 h-5 text-primary" />
          <span className="font-semibold">Ano Letivo {yl.label}</span>
          <Badge variant="outline">{yl.startDate} → {yl.endDate}</Badge>
          <Badge className="bg-primary/10 text-primary">{aulasNoAno} aulas × 90 min por cadeira</Badge>
          <span className="text-xs text-muted-foreground ml-auto">≈ 1 sessão semanal, descontando pausas e época de exames</span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar cadeira…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
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
              <TableHead>Faculdade</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Docente</TableHead>
              <TableHead className="text-center"><span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> Disc.</span></TableHead>
              <TableHead className="text-center"><span className="inline-flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Aulas</span></TableHead>
              <TableHead className="text-center"><span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> Conteúdos</span></TableHead>
              <TableHead className="text-center"><span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Exames</span></TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/areaacademica/cadeiras/${c.id}`)}>
                <TableCell className="font-medium">{c.cadeira}</TableCell>
                <TableCell><span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-muted/30">{acronymMap[c.faculdade] || c.faculdade}</span></TableCell>
                <TableCell><Badge variant="outline">{c.curso}</Badge></TableCell>
                <TableCell>{c.ano}º</TableCell>
                <TableCell className="text-sm">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.docente}</TableCell>
                <TableCell className="text-center font-mono text-xs">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.estudantes}</TableCell>
                <TableCell className="text-center font-mono text-xs">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.aulasPlaneadas}</TableCell>
                <TableCell className="text-center font-mono text-xs">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.conteudos}</TableCell>
                <TableCell className="text-center font-mono text-xs">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.exames}</TableCell>
                <TableCell>
                  {isFuture ? (
                    <Badge variant="outline" className="text-muted-foreground">Planeado</Badge>
                  ) : (
                    <Badge className={c.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                      {c.publicada ? "Publicada" : "Rascunho"}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
