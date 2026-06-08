import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { notasResumo, anosLetivos, cursoTemplates } from "@/data/academica2Data";
import {
  Award, TrendingUp, Settings2, AlertTriangle, CheckCircle2,
  ChevronRight, ArrowLeft, Building2, CalendarRange, Users,
} from "lucide-react";

const acronymMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "FCE",
  "Faculdade de Ciências da Saúde": "FCS",
  "Faculdade de Ciências Sociais": "FCSO",
};

const yearFactor: Record<string, number> = {
  "2022-2023": 0.94, "2023-2024": 0.97, "2024-2025": 1.0, "2025-2026": 1.02,
};

type CriterioPreset = "padrao" | "rigoroso" | "flexivel" | "custom";
const presets: Record<Exclude<CriterioPreset, "custom">, { aprovacao: number; risco: number; excelencia: number; minPresenca: number }> = {
  padrao:    { aprovacao: 10, risco: 11, excelencia: 16, minPresenca: 80 },
  rigoroso:  { aprovacao: 12, risco: 13, excelencia: 17, minPresenca: 85 },
  flexivel:  { aprovacao: 9.5, risco: 10, excelencia: 15, minPresenca: 75 },
};

export default function Notas() {
  const activeYearId = anosLetivos.find(a => a.status === "ativo")?.id || "2025-2026";
  const [anoLetivo, setAnoLetivo] = useState(activeYearId);
  const [preset, setPreset] = useState<CriterioPreset>("padrao");
  const [showCriterios, setShowCriterios] = useState(false);
  const [criterios, setCriterios] = useState(presets.padrao);

  const [view, setView] = useState<"faculdades" | "cursos" | "curso">("faculdades");
  const [selectedFac, setSelectedFac] = useState<string | null>(null);
  const [selectedCurso, setSelectedCurso] = useState<string | null>(null);

  const yl = anosLetivos.find(a => a.id === anoLetivo)!;
  const factor = yearFactor[anoLetivo] ?? 1;
  const isFuture = yl.status !== "ativo" && yl.status !== "arquivado";

  const facultyByName = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.name, c.faculty])), []);
  const codeByName = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.name, c.code])), []);

  const rows = useMemo(() => notasResumo.map(n => ({
    ...n,
    faculdade: facultyByName[n.curso] || "—",
    cursoCode: codeByName[n.curso] || n.curso,
    mediaGeral: +(n.mediaGeral * factor).toFixed(1),
    aprovados: Math.round(n.aprovados * factor),
  })), [factor, facultyByName, codeByName]);

  const byCursoCode = useMemo(() => {
    const m: Record<string, typeof rows> = {};
    rows.forEach(r => { (m[r.cursoCode] ||= []).push(r); });
    return m;
  }, [rows]);

  const stateOf = (m: number) =>
    m >= criterios.excelencia ? { label: "Excelente", cls: "bg-emerald-100 text-emerald-700" } :
    m >= criterios.risco ? { label: "Normal", cls: "bg-blue-100 text-blue-700" } :
    m >= criterios.aprovacao ? { label: "Atenção", cls: "bg-amber-100 text-amber-700" } :
    { label: "Em Risco", cls: "bg-red-100 text-red-700" };

  const faculties = useMemo(() => {
    const map: Record<string, { cursos: Set<string>; estudantes: number; aprovados: number; mediaSum: number; mediaCount: number; emRisco: number }> = {};
    cursoTemplates.forEach(c => {
      (map[c.faculty] ||= { cursos: new Set(), estudantes: 0, aprovados: 0, mediaSum: 0, mediaCount: 0, emRisco: 0 }).cursos.add(c.code);
    });
    rows.forEach(r => {
      const f = map[r.faculdade] ||= { cursos: new Set(), estudantes: 0, aprovados: 0, mediaSum: 0, mediaCount: 0, emRisco: 0 };
      f.estudantes += r.total;
      f.aprovados += r.aprovados;
      f.mediaSum += r.mediaGeral;
      f.mediaCount += 1;
      if (r.mediaGeral < criterios.risco) f.emRisco += 1;
    });
    return Object.entries(map).map(([name, v]) => ({
      name, cursos: v.cursos.size, estudantes: v.estudantes, aprovados: v.aprovados,
      media: v.mediaCount ? +(v.mediaSum / v.mediaCount).toFixed(1) : 0,
      taxa: v.estudantes ? Math.round((v.aprovados / v.estudantes) * 100) : 0,
      emRisco: v.emRisco,
    }));
  }, [rows, criterios.risco]);

  const cursosOfFac = useMemo(() => {
    if (!selectedFac) return [];
    return cursoTemplates.filter(c => c.faculty === selectedFac).map(c => {
      const list = byCursoCode[c.code] || [];
      const est = list.reduce((a, r) => a + r.total, 0);
      const ap = list.reduce((a, r) => a + r.aprovados, 0);
      const media = list.length ? +(list.reduce((a, r) => a + r.mediaGeral, 0) / list.length).toFixed(1) : 0;
      return { ...c, estudantes: est, aprovados: ap, media, taxa: est ? Math.round((ap / est) * 100) : 0, anos: list.length };
    });
  }, [selectedFac, byCursoCode]);

  const cursoObj = cursoTemplates.find(c => c.code === selectedCurso);

  const totalEst = rows.reduce((a, r) => a + r.total, 0);
  const totalAprov = rows.reduce((a, r) => a + r.aprovados, 0);
  const mediaGlobal = rows.length ? (rows.reduce((a, r) => a + r.mediaGeral, 0) / rows.length).toFixed(1) : "0";
  const taxa = totalEst ? ((totalAprov / totalEst) * 100).toFixed(0) : "0";
  const emRisco = rows.filter(r => r.mediaGeral < criterios.risco).length;

  const goFac = (f: string) => { setSelectedFac(f); setView("cursos"); };
  const goCurso = (code: string) => { setSelectedCurso(code); setView("curso"); };
  const back = () => {
    if (view === "curso") { setView("cursos"); setSelectedCurso(null); }
    else if (view === "cursos") { setView("faculdades"); setSelectedFac(null); }
  };

  const applyPreset = (p: CriterioPreset) => {
    setPreset(p);
    if (p !== "custom") setCriterios(presets[p]);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas — Consolidação</h1>
          <p className="text-sm text-muted-foreground mt-1">Faculdade → Curso → Ano. Critérios institucionais aplicados.</p>
        </div>
      </div>

      {/* Ano letivo + critério toggle */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <CalendarRange className="w-5 h-5 text-primary" />
          <span className="font-semibold">Ano Letivo {yl.label}</span>
          <Badge variant="outline">{yl.startDate} → {yl.endDate}</Badge>
          {anoLetivo === activeYearId && <Badge className="bg-primary/10 text-primary border-0">Atual</Badge>}
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-44 ml-auto"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
          <div className="h-6 w-px bg-border" />
          <span className="text-xs text-muted-foreground">Critério:</span>
          <div className="inline-flex rounded-md border bg-background p-0.5">
            {(["padrao", "rigoroso", "flexivel"] as const).map(p => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 text-xs rounded capitalize transition ${preset === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {p === "padrao" ? "Padrão" : p === "rigoroso" ? "Rigoroso" : "Flexível"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowCriterios(s => !s)} className="h-8 gap-1">
            <Settings2 className="w-3.5 h-3.5" /> {showCriterios ? "Ocultar" : "Ajustar"}
          </Button>
        </div>
        {showCriterios && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
            <div><Label className="text-xs">Aprovação ≥</Label><Input type="number" min={0} max={20} step={0.5} value={criterios.aprovacao} onChange={e => { setPreset("custom"); setCriterios(c => ({ ...c, aprovacao: +e.target.value })); }} className="h-9 mt-1" /></div>
            <div><Label className="text-xs">Em Risco &lt;</Label><Input type="number" min={0} max={20} step={0.5} value={criterios.risco} onChange={e => { setPreset("custom"); setCriterios(c => ({ ...c, risco: +e.target.value })); }} className="h-9 mt-1" /></div>
            <div><Label className="text-xs">Excelente ≥</Label><Input type="number" min={0} max={20} step={0.5} value={criterios.excelencia} onChange={e => { setPreset("custom"); setCriterios(c => ({ ...c, excelencia: +e.target.value })); }} className="h-9 mt-1" /></div>
            <div><Label className="text-xs">Presença mín. (%)</Label><Input type="number" min={0} max={100} value={criterios.minPresenca} onChange={e => { setPreset("custom"); setCriterios(c => ({ ...c, minPresenca: +e.target.value })); }} className="h-9 mt-1" /></div>
          </div>
        )}
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <TrendingUp className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
          <div><p className="text-2xl font-bold">{isFuture ? "—" : mediaGlobal}</p><p className="text-xs text-muted-foreground">Média Global</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 p-2 bg-emerald-100 text-emerald-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{isFuture ? "—" : `${taxa}%`}</p><p className="text-xs text-muted-foreground">Taxa de Aprovação</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <Award className="w-10 h-10 p-2 bg-blue-100 text-blue-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{isFuture ? "—" : totalAprov.toLocaleString()}</p><p className="text-xs text-muted-foreground">Aprovados / {totalEst.toLocaleString()}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 p-2 bg-red-100 text-red-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{isFuture ? "—" : emRisco}</p><p className="text-xs text-muted-foreground">Cursos/Anos Em Risco</p></div>
        </Card>
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

      {view === "faculdades" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Sigla</TableHead>
                <TableHead>Faculdade</TableHead>
                <TableHead className="text-right">Cursos</TableHead>
                <TableHead className="text-right">Estudantes</TableHead>
                <TableHead className="text-right">Média</TableHead>
                <TableHead className="text-right">Taxa Aprov.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map(f => (
                <TableRow key={f.name} className="cursor-pointer hover:bg-muted/50" onClick={() => goFac(f.name)}>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">{acronymMap[f.name] || "—"}</Badge></TableCell>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{f.cursos}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : f.estudantes}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">{isFuture ? "—" : f.media || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : `${f.taxa}%`}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {isFuture ? "—" : f.emRisco > 0 ? <Badge className="bg-red-100 text-red-700">{f.emRisco}</Badge> : <span className="text-muted-foreground">0</span>}
                  </TableCell>
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
                <TableHead className="text-right">Estudantes</TableHead>
                <TableHead className="text-right">Média</TableHead>
                <TableHead className="text-right">Taxa Aprov.</TableHead>
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
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : c.estudantes || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">{isFuture ? "—" : c.media || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : c.estudantes ? `${c.taxa}%` : "—"}</TableCell>
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
            const list = (byCursoCode[cursoObj.code] || []).filter(r => r.ano === ano);
            return (
              <Card key={ano}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 font-mono">{ano}º Ano</Badge>
                    <h2 className="text-sm font-semibold">{cursoObj.name}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{list.length} registo{list.length !== 1 ? "s" : ""}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead className="text-right">Média Geral</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right"><span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> Aprovados</span></TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-64">Taxa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((n, i) => {
                      const pct = n.total ? (n.aprovados / n.total) * 100 : 0;
                      const st = stateOf(n.mediaGeral);
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{n.curso}</TableCell>
                          <TableCell className="text-right"><span className="font-mono font-semibold">{isFuture ? "—" : n.mediaGeral.toFixed(1)}</span></TableCell>
                          <TableCell>{isFuture ? <Badge variant="outline" className="text-muted-foreground">Planeado</Badge> : <Badge className={st.cls}>{st.label}</Badge>}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{isFuture ? "—" : n.aprovados}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{n.total}</TableCell>
                          <TableCell>
                            {isFuture ? <span className="text-xs text-muted-foreground">—</span> : (
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-2 flex-1" />
                                <span className="text-xs font-mono w-10">{pct.toFixed(0)}%</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {list.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">Sem notas registadas neste ano.</TableCell></TableRow>
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
