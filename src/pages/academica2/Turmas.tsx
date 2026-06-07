import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alocacaoCandidatos, cursoTemplates } from "@/data/academica2Data";
import { Layers, Sparkles, Users, AlertTriangle, CheckCircle2, Clock, Search, ChevronRight, ArrowLeft, GraduationCap, Building2, BookOpen } from "lucide-react";
import { toast } from "sonner";

const stateCfg = {
  alocado: { label: "Alocado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
  conflito: { label: "Conflito", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

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

export default function Turmas() {
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"faculdades" | "cursos" | "anos">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null); // course code

  const alocados = alocacaoCandidatos.filter(c => c.estado === "alocado").length;
  const pendentes = alocacaoCandidatos.filter(c => c.estado === "pendente").length;
  const conflitos = alocacaoCandidatos.filter(c => c.estado === "conflito").length;

  const runAlloc = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setRunning(false);
    toast.success("Re-alocação automática concluída — 2 candidatos pendentes resolvidos.");
  };

  const allTurmas = useMemo<TurmaItem[]>(() => cursoTemplates.flatMap(c =>
    Array.from({ length: c.years }, (_, ano) =>
      ["A", "B", "C"].map(letra => ({
        id: `${c.code}-${ano + 1}${letra}`,
        curso: c.name,
        codigo: c.code,
        faculdade: c.faculty,
        ano: ano + 1,
        turma: letra,
        capacidade: 32,
        ocupacao: 20 + ((ano + letra.charCodeAt(0)) % 12),
      }))
    ).flat()
  ), []);

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; turmas: number; estudantes: number }> = {};
    allTurmas.forEach(t => {
      const f = map[t.faculdade] ||= { cursos: new Set(), turmas: 0, estudantes: 0 };
      f.cursos.add(t.codigo);
      f.turmas += 1;
      f.estudantes += t.ocupacao;
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

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-primary" /> Turmas & Alocação</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão automática de turmas e distribuição de candidatos aprovados.</p>
        </div>
        <Button className="gap-2" onClick={runAlloc} disabled={running}>
          <Sparkles className="w-4 h-4" /> {running ? "A alocar…" : "Re-alocar Automaticamente"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4"><Users className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{alocacaoCandidatos.length}</p><p className="text-xs text-muted-foreground">Candidatos</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><CheckCircle2 className="w-10 h-10 p-2 bg-emerald-100 text-emerald-600 rounded-lg" /><div><p className="text-2xl font-bold">{alocados}</p><p className="text-xs text-muted-foreground">Alocados</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><Clock className="w-10 h-10 p-2 bg-amber-100 text-amber-600 rounded-lg" /><div><p className="text-2xl font-bold">{pendentes}</p><p className="text-xs text-muted-foreground">Pendentes</p></div></Card>
        <Card className="p-4 flex items-center gap-4"><AlertTriangle className="w-10 h-10 p-2 bg-red-100 text-red-600 rounded-lg" /><div><p className="text-2xl font-bold">{conflitos}</p><p className="text-xs text-muted-foreground">Conflitos</p></div></Card>
      </div>

      {/* Breadcrumb */}
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

      {/* Level 1: Faculdades */}
      {view === "faculdades" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculties.map(f => (
            <Card key={f.name} className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => goFac(f.name)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
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

      {/* Level 2: Cursos */}
      {view === "cursos" && facObj && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursosOfFac.map(c => (
            <Card key={c.code} className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => goCurso(c.code)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
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

      {/* Level 3: Anos + Turmas */}
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
                          <div className="w-full h-1.5 bg-muted rounded mt-1 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="col-span-full text-xs text-center text-muted-foreground py-4">Sem turmas neste ano.</p>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Candidatos do curso */}
          {(() => {
            const cands = alocacaoCandidatos.filter(c => c.curso === cursoObj.name);
            if (cands.length === 0) return null;
            return (
              <Card>
                <div className="px-4 py-3 border-b bg-muted/30">
                  <p className="text-sm font-semibold">Candidatos Alocados — {cursoObj.name}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Turma Sugerida</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cands.map(c => {
                      const cfg = stateCfg[c.estado];
                      const Icon = cfg.icon;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                          <TableCell><Badge variant="outline" className="font-mono">{c.turmaSugerida}</Badge></TableCell>
                          <TableCell><Badge className={`${cfg.color} gap-1`}><Icon className="w-3 h-3" />{cfg.label}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}
