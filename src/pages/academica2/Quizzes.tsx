import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { quizzes, cursoTemplates } from "@/data/academica2Data";
import {
  BrainCircuit, Sparkles, CheckCircle2, Users, FileQuestion,
  ChevronRight, ArrowLeft, Building2,
} from "lucide-react";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

export default function QuizzesAcad() {
  const [view, setView] = useState<"faculdades" | "cursos" | "curso">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);

  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);

  const byCurso = useMemo(() => {
    const map: Record<string, typeof quizzes> = {};
    quizzes.forEach(q => { (map[q.curso] ||= []).push(q); });
    return map;
  }, []);

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; cadeiras: number; quizzes: number; tentativas: number }> = {};
    cursoTemplates.forEach(c => {
      const f = map[c.faculty] ||= { cursos: new Set(), cadeiras: 0, quizzes: 0, tentativas: 0 };
      f.cursos.add(c.code);
      f.cadeiras += c.years * c.cadeirasPorAno;
    });
    quizzes.forEach(q => {
      const fac = facultyByCode[q.curso]; if (!fac) return;
      const f = map[fac] ||= { cursos: new Set(), cadeiras: 0, quizzes: 0, tentativas: 0 };
      f.quizzes += 1; f.tentativas += q.tentativas;
    });
    return Object.entries(map).map(([name, v]) => ({ name, cursos: v.cursos.size, cadeiras: v.cadeiras, quizzes: v.quizzes, tentativas: v.tentativas }));
  }, [facultyByCode]);

  const cursosOfFac = useMemo(() => {
    if (!selectedFac) return [];
    return cursoTemplates.filter(c => c.faculty === selectedFac).map(c => ({
      ...c,
      cadeirasTotal: c.years * c.cadeirasPorAno,
      quizzesCount: (byCurso[c.code] || []).length,
      tentativas: (byCurso[c.code] || []).reduce((a, q) => a + q.tentativas, 0),
    }));
  }, [selectedFac, byCurso]);

  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);

  const goFac = (f: string) => { setSelectedFac(f); setView("cursos"); };
  const goCurso = (code: string) => { setSelectedCurso(code); setView("curso"); };
  const back = () => {
    if (view === "curso") { setView("cursos"); setSelectedCurso(null); }
    else if (view === "cursos") { setView("faculdades"); setSelectedFac(null); }
  };

  const publicados = quizzes.filter(q => q.publicado).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" /> Banco de Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">Faculdade → Curso → Ano → Cadeira.</p>
        </div>
        <Button className="gap-2"><Sparkles className="w-4 h-4" /> Gerar Quizzes</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4"><BrainCircuit className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{quizzes.length}</p><p className="text-xs text-muted-foreground">Quizzes</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><CheckCircle2 className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{publicados}</p><p className="text-xs text-muted-foreground">Publicados</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><FileQuestion className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg" /><div><p className="text-2xl font-bold">{quizzes.reduce((a, q) => a + q.perguntas, 0)}</p><p className="text-xs text-muted-foreground">Perguntas</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><Users className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{quizzes.reduce((a, q) => a + q.tentativas, 0)}</p><p className="text-xs text-muted-foreground">Tentativas</p></div></Card>
      </div>

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
                <TableHead className="text-right">Quizzes</TableHead>
                <TableHead className="text-right">Tentativas</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map(f => (
                <TableRow key={f.name} className="cursor-pointer hover:bg-muted/50" onClick={() => goFac(f.name)}>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{acronymMap[f.name] || "—"}</Badge></TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.cursos}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.cadeiras}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.quizzes}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.tentativas}</TableCell>
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
                <TableHead className="text-right">Quizzes</TableHead>
                <TableHead className="text-right">Tentativas</TableHead>
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
                  <TableCell className="text-right font-mono text-xs">{c.cadeirasTotal}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.quizzesCount}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.tentativas}</TableCell>
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
            const list = (byCurso[cursoObj.code] || []).filter(q => q.ano === ano);
            return (
              <Card key={ano}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge>
                    <h2 className="text-sm font-semibold">{cursoObj.name}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{list.length} quizzes · {list.reduce((a, q) => a + q.tentativas, 0)} tentativas</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cadeira</TableHead>
                      <TableHead className="text-right">Perguntas</TableHead>
                      <TableHead className="text-right">Duração</TableHead>
                      <TableHead className="text-right">Tentativas</TableHead>
                      <TableHead>Dificuldade</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map(q => {
                      const dif = q.perguntas <= 15 ? { label: "Fácil", cls: "bg-emerald-100 text-emerald-700" }
                        : q.perguntas <= 22 ? { label: "Médio", cls: "bg-blue-100 text-blue-700" }
                        : { label: "Difícil", cls: "bg-red-100 text-red-700" };
                      return (
                      <TableRow key={q.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{q.cadeira}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{q.perguntas}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{q.duracao} min</TableCell>
                        <TableCell className="text-right font-mono text-xs">{q.tentativas}</TableCell>
                        <TableCell><Badge className={dif.cls}>{dif.label}</Badge></TableCell>
                        <TableCell>
                          <Badge className={q.publicado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                            {q.publicado ? "Publicado" : "Rascunho"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                    {list.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">Sem quizzes neste ano.</TableCell></TableRow>
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
