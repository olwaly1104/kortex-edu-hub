import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cadeirasAcad, cursoTemplates, anosLetivos } from "@/data/academica2Data";
import { getCadeiraContent } from "@/data/cadeiraContentData";
import {
  BookOpen, Plus, PlayCircle, FileText, CalendarRange, GraduationCap, Users,
  ChevronRight, ArrowLeft, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

const parseDate = (s: string) => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
const weeksBetween = (start: string, end: string) => {
  const ms = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 7)) - 4);
};

export default function Cadeiras() {
  const navigate = useNavigate();
  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2025-2026");
  const [view, setView] = useState<"faculdades" | "cursos" | "curso">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);

  const yl = anosLetivos.find(a => a.id === anoLetivo)!;
  const aulasNoAno = useMemo(() => weeksBetween(yl.startDate, yl.endDate), [yl]);
  const isFuture = yl.status !== "ativo" && yl.status !== "arquivado";

  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);

  const enriched = useMemo(() => cadeirasAcad.map(c => {
    const content = getCadeiraContent(c.id, c.cadeira);
    return {
      ...c,
      faculdade: facultyByCode[c.curso] || "—",
      conteudos: content.conteudos.length,
      exames: content.calendario.filter(e => e.tipo === "avaliacao").length,
      aulasPlaneadas: aulasNoAno,
    };
  }), [aulasNoAno, facultyByCode]);

  const byCurso = useMemo(() => {
    const map: Record<string, typeof enriched> = {};
    enriched.forEach(c => { (map[c.curso] ||= []).push(c); });
    return map;
  }, [enriched]);

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; cadeiras: number; estudantes: number; docentes: Set<string> }> = {};
    cursoTemplates.forEach(c => {
      const f = map[c.faculty] ||= { cursos: new Set(), cadeiras: 0, estudantes: 0, docentes: new Set() };
      f.cursos.add(c.code);
    });
    enriched.forEach(c => {
      const f = map[c.faculdade] ||= { cursos: new Set(), cadeiras: 0, estudantes: 0, docentes: new Set() };
      f.cadeiras += 1;
      f.estudantes += c.estudantes || 0;
      if (c.docente) f.docentes.add(c.docente);
    });
    return Object.entries(map).map(([name, v]) => ({
      name, cursos: v.cursos.size, cadeiras: v.cadeiras, estudantes: v.estudantes, docentes: v.docentes.size,
    }));
  }, [enriched]);

  const cursosOfFac = useMemo(() => {
    if (!selectedFac) return [];
    return cursoTemplates.filter(c => c.faculty === selectedFac).map(c => {
      const list = byCurso[c.code] || [];
      return {
        ...c,
        cadeirasTotal: c.years * c.cadeirasPorAno,
        cadeirasAtivas: list.length,
        estudantes: list.reduce((a, x) => a + (x.estudantes || 0), 0),
      };
    });
  }, [selectedFac, byCurso]);

  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);

  const goFac = (f: string) => { setSelectedFac(f); setView("cursos"); };
  const goCurso = (code: string) => { setSelectedCurso(code); setView("curso"); };
  const back = () => {
    if (view === "curso") { setView("cursos"); setSelectedCurso(null); }
    else if (view === "cursos") { setView("faculdades"); setSelectedFac(null); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> Cadeiras</h1>
          <p className="text-sm text-muted-foreground mt-1">Faculdade → Curso → Ano → Cadeira.</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Cadeira</Button>
      </div>

      <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <CalendarRange className="w-5 h-5 text-primary" />
          <span className="font-semibold">Ano Letivo {yl.label}</span>
          <Badge variant="outline">{yl.startDate} → {yl.endDate}</Badge>
          <Badge className="bg-primary/10 text-primary">{aulasNoAno} aulas × 90 min por cadeira</Badge>
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-44 ml-auto"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-3 flex items-center gap-2 flex-wrap text-sm">
        {view !== "faculdades" && (
          <Button size="sm" variant="ghost" onClick={back} className="h-8 gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        )}
        <button onClick={() => { setView("faculdades"); setSelectedFac(null); setSelectedCurso(null); }} className="font-medium hover:text-primary inline-flex items-center gap-1">
          <Building2 className="w-4 h-4" /> Faculdades
        </button>
        {selectedFac && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => { setView("cursos"); setSelectedCurso(null); }} className="font-medium hover:text-primary">{acronymMap[selectedFac] || selectedFac}</button>
        </>}
        {cursoObj && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{cursoObj.name}</span>
        </>}
      </Card>

      {view === "faculdades" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Sigla</TableHead>
                <TableHead>Faculdade</TableHead>
                <TableHead className="text-right">Cursos</TableHead>
                <TableHead className="text-right">Cadeiras</TableHead>
                <TableHead className="text-right">Docentes</TableHead>
                <TableHead className="text-right">Estudantes</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map(f => (
                <TableRow key={f.name} className="cursor-pointer hover:bg-muted/50" onClick={() => goFac(f.name)}>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{acronymMap[f.name] || "—"}</Badge></TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.cursos}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : f.cadeiras}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : f.docentes}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : f.estudantes}</TableCell>
                  <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {view === "cursos" && selectedFac && (
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">{acronymMap[selectedFac]}</Badge>
              <h2 className="text-sm font-semibold">{selectedFac}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{cursosOfFac.length} cursos</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Coordenador</TableHead>
                <TableHead className="text-right">Anos</TableHead>
                <TableHead className="text-right">Cadeiras</TableHead>
                <TableHead className="text-right">Estudantes</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursosOfFac.map(c => (
                <TableRow key={c.code} className="cursor-pointer hover:bg-muted/50" onClick={() => goCurso(c.code)}>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{c.code}</Badge></TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.coordenador}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.years}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : `${c.cadeirasAtivas}/${c.cadeirasTotal}`}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : c.estudantes}</TableCell>
                  <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {view === "curso" && cursoObj && (
        <div className="space-y-4">
          {Array.from({ length: cursoObj.years }, (_, i) => i + 1).map(ano => {
            const list = (byCurso[cursoObj.code] || []).filter(c => c.ano === ano);
            return (
              <Card key={ano}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge>
                    <h2 className="text-sm font-semibold">{cursoObj.name}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{list.length} cadeiras</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cadeira</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead className="text-center"><span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> Disc.</span></TableHead>
                      <TableHead className="text-center"><span className="inline-flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Aulas</span></TableHead>
                      <TableHead className="text-center"><span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> Conteúdos</span></TableHead>
                      <TableHead className="text-center"><span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Exames</span></TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map(c => (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/areaacademica/cadeiras/${c.id}`)}>
                        <TableCell className="font-medium">{c.cadeira}</TableCell>
                        <TableCell className="text-sm">{isFuture ? <span className="text-muted-foreground/50">—</span> : c.docente}</TableCell>
                        <TableCell className="text-center font-mono text-xs">{isFuture ? "—" : c.estudantes}</TableCell>
                        <TableCell className="text-center font-mono text-xs">{isFuture ? "—" : c.aulasPlaneadas}</TableCell>
                        <TableCell className="text-center font-mono text-xs">{isFuture ? "—" : c.conteudos}</TableCell>
                        <TableCell className="text-center font-mono text-xs">{isFuture ? "—" : c.exames}</TableCell>
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
                    {list.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-6">Sem cadeiras neste ano.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
