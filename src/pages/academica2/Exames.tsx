import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exames, cursoTemplates } from "@/data/academica2Data";
import {
  ClipboardCheck, Sparkles, MapPin, Clock, Users, GraduationCap,
  ChevronRight, ArrowLeft, CalendarRange,
} from "lucide-react";

export default function Exames() {
  const [epoca, setEpoca] = useState<string>("all");
  const [view, setView] = useState<"cursos" | "anos" | "exames">("cursos");
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const [selectedAno, setSelectedAno] = useState<number | null>(null);

  const filtered = useMemo(() => exames.filter(e => epoca === "all" || e.epoca === epoca), [epoca]);

  const byCurso = useMemo(() => {
    const map: Record<string, typeof exames> = {};
    filtered.forEach(e => { (map[e.curso] ||= []).push(e); });
    return map;
  }, [filtered]);

  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);
  const anosOfCurso = useMemo(() => {
    if (!selectedCurso) return [] as number[];
    return Array.from(new Set((byCurso[selectedCurso] || []).map(e => e.ano))).sort((a, b) => a - b);
  }, [byCurso, selectedCurso]);

  const examesOfAno = useMemo(() => {
    if (!selectedCurso || selectedAno == null) return [];
    return (byCurso[selectedCurso] || []).filter(e => e.ano === selectedAno);
  }, [byCurso, selectedCurso, selectedAno]);

  const goCurso = (code: string) => { setSelectedCurso(code); setView("anos"); };
  const goAno = (a: number) => { setSelectedAno(a); setView("exames"); };
  const back = () => {
    if (view === "exames") { setView("anos"); setSelectedAno(null); }
    else if (view === "anos") { setView("cursos"); setSelectedCurso(null); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="w-6 h-6 text-primary" /> Mapa de Exames</h1>
          <p className="text-sm text-muted-foreground mt-1">Exames presenciais — escolha o curso, o ano e depois o exame.</p>
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
        {view !== "cursos" && (
          <Button size="sm" variant="ghost" onClick={back} className="h-8 gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        )}
        <button onClick={() => { setView("cursos"); setSelectedCurso(null); setSelectedAno(null); }} className="font-medium hover:text-primary inline-flex items-center gap-1">
          <GraduationCap className="w-4 h-4" /> Cursos
        </button>
        {cursoObj && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button onClick={() => { setView("anos"); setSelectedAno(null); }} className="font-medium hover:text-primary">{cursoObj.name}</button>
        </>}
        {selectedAno != null && <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{selectedAno}º Ano</span>
        </>}
      </Card>

      {view === "cursos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursoTemplates.map(c => {
            const items = byCurso[c.code] || [];
            return (
              <Card key={c.code} className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => goCurso(c.code)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary" /></div>
                  <Badge variant="outline" className="font-mono text-[11px]">{c.code}</Badge>
                </div>
                <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{c.faculty}</p>
                <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-3 border-t">
                  <div><p className="text-lg font-bold">{c.years}</p><p className="text-[10px] text-muted-foreground">Anos</p></div>
                  <div><p className="text-lg font-bold">{items.length}</p><p className="text-[10px] text-muted-foreground">Exames</p></div>
                  <div><p className="text-lg font-bold">{items.reduce((a, e) => a + e.inscritos, 0)}</p><p className="text-[10px] text-muted-foreground">Inscritos</p></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {view === "anos" && cursoObj && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: cursoObj.years }, (_, i) => i + 1).map(ano => {
            const count = (byCurso[cursoObj.code] || []).filter(e => e.ano === ano).length;
            const inscritos = (byCurso[cursoObj.code] || []).filter(e => e.ano === ano).reduce((a, e) => a + e.inscritos, 0);
            const hasExams = count > 0;
            return (
              <Card key={ano} className={`p-5 transition-all ${hasExams ? "cursor-pointer hover:border-primary hover:shadow-md" : "opacity-60"}`} onClick={() => hasExams && goAno(ano)}>
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge>
                  <CalendarRange className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{count === 1 ? "exame agendado" : "exames agendados"}</p>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {inscritos} inscritos</div>
              </Card>
            );
          })}
        </div>
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
