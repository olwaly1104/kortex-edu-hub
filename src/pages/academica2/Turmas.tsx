import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alocacaoCandidatos, cursoTemplates } from "@/data/academica2Data";
import { Layers, Sparkles, Users, AlertTriangle, CheckCircle2, Clock, Search } from "lucide-react";
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

export default function Turmas() {
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [faculdadeFilter, setFaculdadeFilter] = useState("all");

  const alocados = alocacaoCandidatos.filter(c => c.estado === "alocado").length;
  const pendentes = alocacaoCandidatos.filter(c => c.estado === "pendente").length;
  const conflitos = alocacaoCandidatos.filter(c => c.estado === "conflito").length;

  const runAlloc = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setRunning(false);
    toast.success("Re-alocação automática concluída — 2 candidatos pendentes resolvidos.");
  };

  const faculties = useMemo(() => Array.from(new Set(cursoTemplates.map(c => c.faculty))), []);
  const facultyByCursoName = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.name, c.faculty])), []);
  const facultyByCode = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.code, c.faculty])), []);

  // Generate mock turmas grid
  const allTurmas = useMemo(() => cursoTemplates.flatMap(c =>
    Array.from({ length: c.years }, (_, ano) =>
      ["A", "B", "C"].map(letra => ({
        id: `${c.code}-${ano + 1}${letra}`,
        curso: c.name,
        codigo: c.code,
        faculdade: c.faculty,
        ano: ano + 1,
        turma: letra,
        capacidade: 32,
        ocupacao: Math.floor(20 + Math.random() * 12),
      }))
    ).flat()
  ), []);

  const filteredTurmas = useMemo(() => allTurmas.filter(t => {
    const matchFac = faculdadeFilter === "all" || t.faculdade === faculdadeFilter;
    const matchSearch = search === "" || t.curso.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  }), [allTurmas, faculdadeFilter, search]);

  const turmasByFaculty = useMemo(() => {
    const g: Record<string, typeof filteredTurmas> = {};
    filteredTurmas.forEach(t => { (g[t.faculdade] ||= []).push(t); });
    return g;
  }, [filteredTurmas]);

  const filteredCandidatos = useMemo(() => alocacaoCandidatos.filter(c => {
    const fac = facultyByCursoName[c.curso] || "—";
    const matchFac = faculdadeFilter === "all" || fac === faculdadeFilter;
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.curso.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  }), [faculdadeFilter, search]);

  const candidatosByFaculty = useMemo(() => {
    const g: Record<string, typeof filteredCandidatos> = {};
    filteredCandidatos.forEach(c => {
      const fac = facultyByCursoName[c.curso] || "—";
      (g[fac] ||= []).push(c);
    });
    return g;
  }, [filteredCandidatos, facultyByCursoName]);

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

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar turma ou candidato…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={faculdadeFilter} onValueChange={setFaculdadeFilter}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Faculdade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faculdades</SelectItem>
              {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {Object.entries(candidatosByFaculty).map(([fac, items]) => (
        <Card key={`alloc-${fac}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-background">{acronymMap[fac] || fac}</span>
              <h2 className="text-sm font-semibold">{fac}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{items.length} candidatos</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Turma Sugerida</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(c => {
                const cfg = stateCfg[c.estado];
                const Icon = cfg.icon;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.curso}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono">{c.turmaSugerida}</Badge></TableCell>
                    <TableCell><Badge className={`${cfg.color} gap-1`}><Icon className="w-3 h-3" />{cfg.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ))}

      {Object.entries(turmasByFaculty).map(([fac, items]) => (
        <Card key={`turmas-${fac}`} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-background">{acronymMap[fac] || fac}</span>
              <h2 className="text-base font-semibold">{fac}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{items.length} turmas</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {items.map(t => {
              const pct = (t.ocupacao / t.capacidade) * 100;
              return (
                <div key={t.id} className="border border-border rounded-lg p-3">
                  <p className="text-xs font-mono font-bold text-primary">{t.id}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.curso}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>{t.ocupacao}/{t.capacidade}</span><span>{Math.round(pct)}%</span></div>
                    <div className="w-full h-1.5 bg-muted rounded mt-1 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
