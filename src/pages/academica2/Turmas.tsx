import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cursoTemplates, anosLetivos } from "@/data/academica2Data";
import {
  Layers, Sparkles, Users, AlertTriangle, CheckCircle2, Clock, Search, ChevronRight,
  ArrowLeft, GraduationCap, Building2, BookOpen, CalendarRange, UserCheck, UserPlus, Download,
} from "lucide-react";
import { toast } from "sonner";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

interface TurmaItem {
  id: string;
  curso: string;
  codigo: string;
  faculdade: string;
  ano: number;
  turma: string;
  capacidade: number;
  ocupacao: number;
}

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  codigo: string;
  curso: string;
  faculdade: string;
  ano: number;
  turma: string;          // only for discentes (alocados)
  media: number;
  estado: string;         // discente: "Novo"/"Ativo"; candidato: "Alocado"/"Pendente"/"Conflito"
  sessao?: "1ª" | "2ª" | "3ª"; // candidatos only
}

const NOMES = [
  "Sofia Andrade","Bernardo Sá","Mariana Reis","Tiago Mendes","Inês Pacheco","Rafael Cunha","Beatriz Lopes","Henrique Rocha",
  "Carolina Vaz","Diogo Pinto","Eva Marques","Francisco Neves","Gabriela Sousa","Hugo Tavares","Isabel Faria","João Cardoso",
  "Leonor Ramos","Manuel Brito","Núria Lima","Octávio Pires","Patrícia Gomes","Quintino Sá","Rita Aguiar","Salvador Dias",
  "Teresa Coelho","Vasco Henriques","Xénia Matos","Yara Borges","Zacarias Fonte","Adriana Melo","Bruno Carvalho","Clara Vieira",
  "Daniel Antunes","Elsa Quintas","Fábio Nunes","Gisela Roque","Heitor Bastos","Iva Correia","José Pacheco","Kátia Lourenço",
];
const SUFIX = ["Jr.","II","de Almeida","Soares","Lopes","Pinto","Tavares",""];

function makeDiscentes(factor: number): Pessoa[] {
  const list: Pessoa[] = []; let i = 0;
  cursoTemplates.forEach(c => {
    const target = Math.round(c.estudantesEsperados * factor);
    const perAno = Math.max(1, Math.floor(target / c.years));
    for (let ano = 1; ano <= c.years; ano++) {
      for (let k = 0; k < perAno; k++) {
        const letra = ["A","B","C","D","E"][k % 5];
        const nome = (NOMES[(i * 7) % NOMES.length] + " " + SUFIX[i % SUFIX.length]).trim();
        const media = Math.round((11 + ((i * 13) % 90) / 10) * 10) / 10;
        list.push({
          id: `D${(i + 1).toString().padStart(4, "0")}`,
          nome,
          email: nome.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "") + "@upra.kor",
          codigo: c.code, curso: c.name, faculdade: c.faculty,
          ano, turma: `${c.code}-${ano}${letra}`,
          media,
          estado: ano === 1 ? "Novo" : "Ativo",
        });
        i++;
      }
    }
  });
  return list;
}

function makeCandidatos(factor: number): Pessoa[] {
  const list: Pessoa[] = []; let i = 100;
  const estados = ["Alocado","Alocado","Alocado","Pendente","Pendente","Conflito"];
  const sessoes: ("1ª"|"2ª"|"3ª")[] = ["1ª","1ª","2ª","2ª","3ª"];
  cursoTemplates.forEach(c => {
    // candidatos = ~25% of cohort, all aim 1º ano
    const target = Math.max(4, Math.round(c.estudantesEsperados * factor * 0.25));
    for (let k = 0; k < target; k++) {
      const letra = ["A","B","C"][k % 3];
      const nome = (NOMES[(i * 11) % NOMES.length] + " " + SUFIX[(i + 3) % SUFIX.length]).trim();
      const media = Math.round((10 + ((i * 17) % 100) / 10) * 10) / 10;
      const estado = estados[i % estados.length];
      list.push({
        id: `C${(i + 1).toString().padStart(4, "0")}`,
        nome,
        email: nome.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "") + "@candidato.kor",
        codigo: c.code, curso: c.name, faculdade: c.faculty,
        ano: 1, turma: estado === "Alocado" ? `${c.code}-1${letra}` : "—",
        media,
        estado,
        sessao: sessoes[i % sessoes.length],
      });
      i++;
    }
  });
  return list;
}

const estadoBadge = (e: string) => {
  switch (e) {
    case "Alocado": return "bg-emerald-100 text-emerald-700";
    case "Pendente": return "bg-amber-100 text-amber-700";
    case "Conflito": return "bg-red-100 text-red-700";
    case "Novo": return "bg-blue-100 text-blue-700";
    default: return "bg-emerald-100 text-emerald-700";
  }
};

export default function Turmas() {
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"faculdades" | "cursos" | "anos">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);
  const [mode, setMode] = useState<"estrutura" | "discentes" | "candidatos">("estrutura");
  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2024-2025");

  // person filters (shared between discentes & candidatos)
  const [pFac, setPFac] = useState("all");
  const [pCurso, setPCurso] = useState("all");
  const [pAno, setPAno] = useState("all");
  const [pSearch, setPSearch] = useState("");

  const yl = anosLetivos.find(a => a.id === anoLetivo)!;
  const factor = yl.status === "planeado" ? 0.4 : yl.status === "arquivado" ? 0.9 : 1;

  const discentes = useMemo(() => makeDiscentes(factor), [factor]);
  const candidatos = useMemo(() => makeCandidatos(factor), [factor]);

  const runAlloc = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setRunning(false);
    toast.success("Re-alocação automática concluída.");
  };

  const allTurmas = useMemo<TurmaItem[]>(() => cursoTemplates.flatMap(c =>
    Array.from({ length: c.years }, (_, ano) =>
      ["A", "B", "C"].map(letra => ({
        id: `${c.code}-${ano + 1}${letra}`,
        curso: c.name, codigo: c.code, faculdade: c.faculty,
        ano: ano + 1, turma: letra,
        capacidade: 32,
        ocupacao: Math.round((20 + ((ano + letra.charCodeAt(0)) % 12)) * factor),
      }))
    ).flat()
  ), [factor]);

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; turmas: number; estudantes: number }> = {};
    allTurmas.forEach(t => {
      const f = map[t.faculdade] ||= { cursos: new Set(), turmas: 0, estudantes: 0 };
      f.cursos.add(t.codigo); f.turmas += 1; f.estudantes += t.ocupacao;
    });
    return Object.entries(map).map(([name, v]) => ({ name, cursos: v.cursos.size, turmas: v.turmas, estudantes: v.estudantes }));
  }, [allTurmas]);

  const cursosOfFac = useMemo(() => {
    if (!selectedFac) return [];
    const codes = Array.from(new Set(allTurmas.filter(t => t.faculdade === selectedFac).map(t => t.codigo)));
    return codes.map(code => {
      const tpl = cursoTemplates.find(c => c.code === code)!;
      const turmas = allTurmas.filter(t => t.codigo === code);
      const estudantes = turmas.reduce((s, t) => s + t.ocupacao, 0);
      return { ...tpl, turmas: turmas.length, estudantes };
    });
  }, [allTurmas, selectedFac]);

  const turmasOfCurso = useMemo(() => {
    if (!selectedCurso) return {} as Record<number, TurmaItem[]>;
    const list = allTurmas.filter(t => t.codigo === selectedCurso && (search === "" || t.id.toLowerCase().includes(search.toLowerCase())));
    return list.reduce<Record<number, TurmaItem[]>>((acc, t) => { (acc[t.ano] ||= []).push(t); return acc; }, {});
  }, [allTurmas, selectedCurso, search]);

  const goFac = (f: string) => { setSelectedFac(f); setView("cursos"); setSearch(""); };
  const goCurso = (code: string) => { setSelectedCurso(code); setView("anos"); setSearch(""); };
  const back = () => {
    if (view === "anos") { setView("cursos"); setSelectedCurso(null); }
    else if (view === "cursos") { setView("faculdades"); setSelectedFac(null); }
  };

  const facObj = faculties.find(f => f.name === selectedFac);
  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);

  // ---- Pessoas filtering (discentes / candidatos) ----
  const source = mode === "discentes" ? discentes : candidatos;
  const filtered = useMemo(() => source.filter(p =>
    (pFac === "all" || p.faculdade === pFac) &&
    (pCurso === "all" || p.codigo === pCurso) &&
    (pAno === "all" || p.ano === Number(pAno)) &&
    (pSearch === "" || p.nome.toLowerCase().includes(pSearch.toLowerCase()) || p.id.toLowerCase().includes(pSearch.toLowerCase()) || p.email.toLowerCase().includes(pSearch.toLowerCase()))
  ), [source, pFac, pCurso, pAno, pSearch]);

  const cursosForFilter = pFac === "all" ? cursoTemplates : cursoTemplates.filter(c => c.faculty === pFac);
  const anosForFilter = pCurso === "all" ? [1,2,3,4,5,6] : Array.from({ length: cursoTemplates.find(c => c.code === pCurso)?.years || 1 }, (_, i) => i + 1);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Turmas & Alocação</h1>
          <p className="text-sm text-muted-foreground mt-1">Estrutura de turmas, discentes ativos e candidatos por alocar.</p>
        </div>
        <Button className="gap-2" onClick={runAlloc} disabled={running}>
          <Sparkles className="w-4 h-4" /> {running ? "A alocar…" : "Re-alocar Automaticamente"}
        </Button>
      </div>

      {/* Ano Letivo bar — always visible */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <CalendarRange className="w-5 h-5 text-primary" />
          <span className="font-semibold">Ano Letivo</span>
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
          <Badge variant="outline">{yl.startDate} → {yl.endDate}</Badge>
          <Badge className="bg-primary/10 text-primary capitalize">{yl.status}</Badge>
          <span className="text-xs text-muted-foreground ml-auto">{discentes.length} discentes · {candidatos.length} candidatos</span>
        </div>
      </Card>

      {/* Mode toggle: 3 tabs */}
      <div className="inline-flex rounded-lg border bg-muted/40 p-1">
        <button
          onClick={() => setMode("estrutura")}
          className={`px-4 py-1.5 text-sm rounded-md inline-flex items-center gap-2 transition ${mode === "estrutura" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          <Building2 className="w-4 h-4" /> Faculdades
        </button>
        <button
          onClick={() => setMode("discentes")}
          className={`px-4 py-1.5 text-sm rounded-md inline-flex items-center gap-2 transition ${mode === "discentes" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          <UserCheck className="w-4 h-4" /> Discentes
        </button>
        <button
          onClick={() => setMode("candidatos")}
          className={`px-4 py-1.5 text-sm rounded-md inline-flex items-center gap-2 transition ${mode === "candidatos" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          <UserPlus className="w-4 h-4" /> Candidatos
        </button>
      </div>

      {mode === "estrutura" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4"><Building2 className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{faculties.length}</p><p className="text-xs text-muted-foreground">Faculdades</p></div></Card>
            <Card className="p-4 flex items-center gap-4"><GraduationCap className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg" /><div><p className="text-2xl font-bold">{cursoTemplates.length}</p><p className="text-xs text-muted-foreground">Cursos</p></div></Card>
            <Card className="p-4 flex items-center gap-4"><Layers className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{allTurmas.length}</p><p className="text-xs text-muted-foreground">Turmas</p></div></Card>
            <Card className="p-4 flex items-center gap-4"><Users className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{allTurmas.reduce((s,t)=>s+t.ocupacao,0)}</p><p className="text-xs text-muted-foreground">Estudantes</p></div></Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faculties.map(f => (
                <Card key={f.name} className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => goFac(f.name)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary" /></div>
                    <Badge variant="outline" className="font-mono text-[11px]">{acronymMap[f.name] || "—"}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-3">{f.name}</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-lg font-bold">{f.cursos}</p><p className="text-[10px] text-muted-foreground">Cursos</p></div>
                    <div><p className="text-lg font-bold">{f.turmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
                    <div><p className="text-lg font-bold">{f.estudantes}</p><p className="text-[10px] text-muted-foreground">Estudantes</p></div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {view === "cursos" && facObj && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cursosOfFac.map(c => (
                <Card key={c.code} className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => goCurso(c.code)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary" /></div>
                    <Badge variant="outline" className="font-mono text-[11px]">{c.code}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">Coord.: {c.coordenador}</p>
                  <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-3 border-t">
                    <div><p className="text-lg font-bold">{c.years}</p><p className="text-[10px] text-muted-foreground">Anos</p></div>
                    <div><p className="text-lg font-bold">{c.turmas}</p><p className="text-[10px] text-muted-foreground">Turmas</p></div>
                    <div><p className="text-lg font-bold">{c.estudantes}</p><p className="text-[10px] text-muted-foreground">Estudantes</p></div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {view === "anos" && cursoObj && (
            <div className="space-y-4">
              <Card className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Pesquisar turma…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </Card>
              {Array.from({ length: cursoObj.years }, (_, i) => i + 1).map(ano => {
                const items = turmasOfCurso[ano] || [];
                return (
                  <Card key={ano}>
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge>
                        <span className="text-sm font-semibold">{cursoObj.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{items.length} turmas</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                      {items.map(t => {
                        const pct = (t.ocupacao / t.capacidade) * 100;
                        return (
                          <div key={t.id} className="border border-border rounded-lg p-3 hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-mono font-bold text-primary">{t.id}</p>
                              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Turma {t.turma}</p>
                            <div className="mt-2">
                              <div className="flex justify-between text-[10px] text-muted-foreground"><span>{t.ocupacao}/{t.capacidade}</span><span>{Math.round(pct)}%</span></div>
                              <div className="w-full h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                            </div>
                          </div>
                        );
                      })}
                      {items.length === 0 && <p className="col-span-full text-xs text-center text-muted-foreground py-4">Sem turmas neste ano.</p>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {(mode === "discentes" || mode === "candidatos") && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4">
              {mode === "discentes"
                ? <UserCheck className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
                : <UserPlus className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />}
              <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">{mode === "discentes" ? "Discentes" : "Candidatos"}</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-4"><Building2 className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg" /><div><p className="text-2xl font-bold">{new Set(filtered.map(p => p.faculdade)).size}</p><p className="text-xs text-muted-foreground">Faculdades</p></div></Card>
            <Card className="p-4 flex items-center gap-4"><GraduationCap className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{new Set(filtered.map(p => p.codigo)).size}</p><p className="text-xs text-muted-foreground">Cursos</p></div></Card>
            <Card className="p-4 flex items-center gap-4">
              {mode === "discentes"
                ? <><Layers className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{new Set(filtered.map(p => p.turma)).size}</p><p className="text-xs text-muted-foreground">Turmas</p></div></>
                : <><Clock className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{filtered.filter(p => p.estado !== "Alocado").length}</p><p className="text-xs text-muted-foreground">Por alocar</p></div></>}
            </Card>
          </div>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Pesquisar por nome, ID ou email…" value={pSearch} onChange={e => setPSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Exportação CSV iniciada.")}>
                <Download className="w-4 h-4" /> Exportar
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select value={pFac} onValueChange={v => { setPFac(v); setPCurso("all"); setPAno("all"); }}>
                <SelectTrigger><SelectValue placeholder="Faculdade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Faculdades</SelectItem>
                  {Object.keys(acronymMap).map(f => <SelectItem key={f} value={f}>{acronymMap[f]} — {f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={pCurso} onValueChange={v => { setPCurso(v); setPAno("all"); }}>
                <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Cursos</SelectItem>
                  {cursosForFilter.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={pAno} onValueChange={setPAno} disabled={mode === "candidatos"}>
                <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {anosForFilter.map(a => <SelectItem key={a} value={String(a)}>{a}º Ano</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <p className="text-sm font-semibold">{mode === "discentes" ? "Discentes (Aprovados)" : "Candidatos"} — {yl.label}</p>
              <span className="text-xs text-muted-foreground">{filtered.length} resultados</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Faculdade</TableHead>
                  <TableHead>Curso</TableHead>
                  {mode === "discentes" ? <TableHead>Ano</TableHead> : <TableHead>Sessão</TableHead>}
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 200).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.email}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-[10px]">{acronymMap[p.faculdade]}</Badge></TableCell>
                    <TableCell className="text-xs">{p.curso}</TableCell>
                    {mode === "discentes"
                      ? <TableCell>{p.ano}º</TableCell>
                      : <TableCell><Badge variant="outline" className="text-[10px]">{p.sessao}</Badge></TableCell>}
                    <TableCell>
                      {p.turma === "—"
                        ? <span className="text-xs text-muted-foreground">—</span>
                        : <Badge variant="outline" className="font-mono text-[10px]">{p.turma}</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-medium">{p.media.toFixed(1)}</TableCell>
                    <TableCell><Badge className={estadoBadge(p.estado)}>{p.estado}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 200 && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/20">A mostrar primeiros 200 de {filtered.length}. Refine os filtros para ver mais.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
