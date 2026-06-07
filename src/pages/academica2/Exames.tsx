import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exames, cursoTemplates } from "@/data/academica2Data";
import {
  ClipboardCheck, Sparkles, MapPin, Clock, Users, GraduationCap,
  ChevronRight, ArrowLeft, CalendarRange, Building2,
} from "lucide-react";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

export default function Exames() {
  const [epoca, setEpoca] = useState<string>("all");
  const [view, setView] = useState<"faculdades" | "cursos" | "anos" | "exames">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const [selectedAno, setSelectedAno] = useState<number | null>(null);

  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);

  const filtered = useMemo(() => exames.filter(e => epoca === "all" || e.epoca === epoca), [epoca]);

  const byCurso = useMemo(() => {
    const map: Record<string, typeof exames> = {};
    filtered.forEach(e => { (map[e.curso] ||= []).push(e); });
    return map;
  }, [filtered]);

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; exames: number; inscritos: number }> = {};
    cursoTemplates.forEach(c => {
      const f = map[c.faculty] ||= { cursos: new Set(), exames: 0, inscritos: 0 };
      f.cursos.add(c.code);
    });
    filtered.forEach(e => {
      const fac = facultyByCode[e.curso]; if (!fac) return;
      const f = map[fac] ||= { cursos: new Set(), exames: 0, inscritos: 0 };
      f.exames += 1; f.inscritos += e.inscritos;
    });
    return Object.entries(map).map(([name, v]) => ({ name, cursos: v.cursos.size, exames: v.exames, inscritos: v.inscritos }));
  }, [filtered, facultyByCode]);

  const cursosOfFac = useMemo(() => {
    if (!selectedFac) return [];
    return cursoTemplates.filter(c => c.faculty === selectedFac).map(c => ({
      ...c,
      examesCount: (byCurso[c.code] || []).length,
      inscritos: (byCurso[c.code] || []).reduce((a, e) => a + e.inscritos, 0),
    }));
  }, [selectedFac, byCurso]);

  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);

  const examesOfAno = useMemo(() => {
    if (!selectedCurso || selectedAno == null) return [];
    return (byCurso[selectedCurso] || []).filter(e => e.ano === selectedAno);
  }, [byCurso, selectedCurso, selectedAno]);

  const goFac = (f: string) => { setSelectedFac(f); setView("cursos"); };
  const goCurso = (code: string) => { setSelectedCurso(code); setView("anos"); };
  const goAno = (a: number) => { setSelectedAno(a); setView("exames"); };
  const back = () => {
    if (view === "exames") { setView("anos"); setSelectedAno(null); }
    else if (view === "anos") { setView("cursos"); setSelectedCurso(null); }
    else if (view === "cursos") { setView("faculdades"); setSelectedFac(null); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-primary" /> Mapa de Exames</h1>
          <p className="text-sm text-muted-foreground mt-1">Faculdade → Curso → Ano → Exame.</p>
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

      <Card className="p-3 flex items-center gap-2 flex-wrap text-sm">
        {view !== "faculdades" && (
          <Button size="sm" variant="ghost" onClick={back} className="h-8 gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        )}
        <button onClick={() => { setView("faculdades"); setSelectedFac(null); setSelectedCurso(null); setSelectedAno(null); }} className="font-medium hover:text-primary inline-flex items-center gap-1">
          <Building2 className="w-4 h-4" /> Faculdades
        </button>
        {selectedFac && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => { setView("cursos"); setSelectedCurso(null); setSelectedAno(null); }} className="font-medium hover:text-primary">{acronymMap[selectedFac] || selectedFac}</button>
        </>}
        {cursoObj && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => { setView("anos"); setSelectedAno(null); }} className="font-medium hover:text-primary">{cursoObj.name}</button>
        </>}
        {selectedAno != null && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{selectedAno}º Ano</span>
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
                <TableHead className="text-right">Exames</TableHead>
                <TableHead className="text-right">Inscritos</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map(f => (
                <TableRow key={f.name} className="cursor-pointer hover:bg-muted/50" onClick={() => goFac(f.name)}>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{acronymMap[f.name] || "—"}</Badge></TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.cursos}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.exames}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.inscritos}</TableCell>
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
                <TableHead className="text-right">Exames</TableHead>
                <TableHead className="text-right">Inscritos</TableHead>
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
                  <TableCell className="text-right font-mono text-xs">{c.examesCount}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.inscritos}</TableCell>
                  <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {view === "anos" && cursoObj && (
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">{cursoObj.code}</Badge>
              <h2 className="text-sm font-semibold">{cursoObj.name}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{cursoObj.years} anos</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ano</TableHead>
                <TableHead className="text-right">Exames agendados</TableHead>
                <TableHead className="text-right">Inscritos</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: cursoObj.years }, (_, i) => i + 1).map(ano => {
                const list = (byCurso[cursoObj.code] || []).filter(e => e.ano === ano);
                const has = list.length > 0;
                return (
                  <TableRow key={ano} className={has ? "cursor-pointer hover:bg-muted/50" : "opacity-60"} onClick={() => has && goAno(ano)}>
                    <TableCell><Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">{list.length}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{list.reduce((a, e) => a + e.inscritos, 0)}</TableCell>
                    <TableCell>{has && <ChevronRight className="w-4 h-4 text-muted-foreground" />}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {view === "exames" && cursoObj && selectedAno != null && (
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 font-mono">{cursoObj.code} · {selectedAno}º Ano</Badge>
              <h2 className="text-sm font-semibold">{cursoObj.name}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{examesOfAno.length} exames · {examesOfAno.reduce((a, e) => a + e.inscritos, 0)} inscritos</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cadeira</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Época</TableHead>
                <TableHead className="text-right">Inscritos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examesOfAno.map(e => (
                <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{e.date}</TableCell>
                  <TableCell className="font-mono text-xs">{e.time}</TableCell>
                  <TableCell className="font-medium">{e.cadeira}</TableCell>
                  <TableCell>{e.ano}º {e.turma}</TableCell>
                  <TableCell className="text-sm">{e.sala}</TableCell>
                  <TableCell><Badge>{e.epoca}</Badge></TableCell>
                  <TableCell className="text-right">{e.inscritos}</TableCell>
                </TableRow>
              ))}
              {examesOfAno.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-6">Sem exames agendados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
