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
import { Award, TrendingUp, Settings2, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Multipliers to simulate slight variation per ano letivo
const yearFactor: Record<string, number> = {
  "2022-2023": 0.94, "2023-2024": 0.97, "2024-2025": 1.0, "2025-2026": 1.02,
};

export default function Notas() {
  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2024-2025");
  const [cursoFilter, setCursoFilter] = useState("all");
  const [faculdadeFilter, setFaculdadeFilter] = useState("all");
  const [criterios, setCriterios] = useState({
    aprovacao: 10,    // nota mínima aprovação (escala 0–20)
    excelencia: 16,   // limiar excelente
    risco: 11,        // abaixo disto = em risco
    minPresenca: 80,  // % presença mínima
  });

  const yl = anosLetivos.find(a => a.id === anoLetivo)!;
  const factor = yearFactor[anoLetivo] ?? 1;

  const facultyByName = useMemo(() => Object.fromEntries(cursoTemplates.map(c => [c.name, c.faculty])), []);
  const faculties = useMemo(() => Array.from(new Set(cursoTemplates.map(c => c.faculty))), []);

  const rows = useMemo(() => notasResumo
    .filter(n => (cursoFilter === "all" || n.curso === cursoFilter)
      && (faculdadeFilter === "all" || facultyByName[n.curso] === faculdadeFilter))
    .map(n => {
      const media = +(n.mediaGeral * factor).toFixed(1);
      const aprovados = Math.round(n.aprovados * factor);
      return { ...n, faculdade: facultyByName[n.curso] || "—", mediaGeral: media, aprovados };
    }), [cursoFilter, faculdadeFilter, factor, facultyByName]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof rows> = {};
    rows.forEach(r => { (g[r.faculdade] ||= []).push(r); });
    return g;
  }, [rows]);

  const totalAprov = rows.reduce((a, n) => a + n.aprovados, 0);
  const totalEst = rows.reduce((a, n) => a + n.total, 0);
  const mediaGlobal = rows.length ? (rows.reduce((a, n) => a + n.mediaGeral, 0) / rows.length).toFixed(1) : "0";
  const taxa = totalEst ? ((totalAprov / totalEst) * 100).toFixed(0) : "0";
  const emRisco = rows.filter(r => r.mediaGeral < criterios.risco).length;

  const acronymMap: Record<string, string> = {
    "Faculdade de Ciências Exatas": "FCE",
    "Faculdade de Ciências da Saúde": "FCS",
    "Faculdade de Ciências Sociais": "FCSO",
  };

  const stateOf = (m: number) =>
    m >= criterios.excelencia ? { label: "Excelente", cls: "bg-emerald-100 text-emerald-700" } :
    m >= criterios.risco ? { label: "Normal", cls: "bg-blue-100 text-blue-700" } :
    m >= criterios.aprovacao ? { label: "Atenção", cls: "bg-amber-100 text-amber-700" } :
    { label: "Em Risco", cls: "bg-red-100 text-red-700" };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas — Consolidação</h1>
          <p className="text-sm text-muted-foreground mt-1">Desempenho académico por ano letivo, segundo critérios institucionais.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
          <Badge variant="outline">{yl.startDate} → {yl.endDate}</Badge>
        </div>
      </div>

      {/* Critérios admin */}
      <Card className="p-4 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Critérios de Avaliação (Admin)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label className="text-xs">Aprovação ≥</Label>
            <Input type="number" min={0} max={20} value={criterios.aprovacao} onChange={e => setCriterios(c => ({ ...c, aprovacao: +e.target.value }))} className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Em Risco &lt;</Label>
            <Input type="number" min={0} max={20} value={criterios.risco} onChange={e => setCriterios(c => ({ ...c, risco: +e.target.value }))} className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Excelente ≥</Label>
            <Input type="number" min={0} max={20} value={criterios.excelencia} onChange={e => setCriterios(c => ({ ...c, excelencia: +e.target.value }))} className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Presença mín. (%)</Label>
            <Input type="number" min={0} max={100} value={criterios.minPresenca} onChange={e => setCriterios(c => ({ ...c, minPresenca: +e.target.value }))} className="h-9 mt-1" />
          </div>
          <Button onClick={() => toast.success("Critérios aplicados")} className="gap-2 h-9"><Save className="w-4 h-4" /> Aplicar</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <TrendingUp className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
          <div><p className="text-2xl font-bold">{mediaGlobal}</p><p className="text-xs text-muted-foreground">Média Global</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <CheckCircle2 className="w-10 h-10 p-2 bg-emerald-100 text-emerald-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{taxa}%</p><p className="text-xs text-muted-foreground">Taxa de Aprovação</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <Award className="w-10 h-10 p-2 bg-blue-100 text-blue-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{totalAprov.toLocaleString()}</p><p className="text-xs text-muted-foreground">Aprovados / {totalEst.toLocaleString()}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 p-2 bg-red-100 text-red-700 rounded-lg" />
          <div><p className="text-2xl font-bold">{emRisco}</p><p className="text-xs text-muted-foreground">Cursos/Anos Em Risco</p></div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={faculdadeFilter} onValueChange={setFaculdadeFilter}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Faculdade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faculdades</SelectItem>
              {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {cursoTemplates.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {Object.entries(grouped).map(([fac, items]) => {
        const facMedia = items.length ? (items.reduce((a, n) => a + n.mediaGeral, 0) / items.length).toFixed(1) : "0";
        const facAprov = items.reduce((a, n) => a + n.aprovados, 0);
        const facTotal = items.reduce((a, n) => a + n.total, 0);
        return (
          <Card key={fac}>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground ring-1 ring-inset ring-border bg-background">{acronymMap[fac] || fac}</span>
                <h2 className="text-sm font-semibold">{fac}</h2>
              </div>
              <span className="text-xs text-muted-foreground">Média {facMedia} · {facAprov}/{facTotal} aprovados</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Média Geral</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Aprovados</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-64">Taxa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((n, i) => {
                  const pct = (n.aprovados / n.total) * 100;
                  const st = stateOf(n.mediaGeral);
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{n.curso}</TableCell>
                      <TableCell>{n.ano}º</TableCell>
                      <TableCell><span className="font-mono font-semibold">{n.mediaGeral.toFixed(1)}</span></TableCell>
                      <TableCell><Badge className={st.cls}>{st.label}</Badge></TableCell>
                      <TableCell>{n.aprovados}</TableCell>
                      <TableCell>{n.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs font-mono w-10">{pct.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        );
      })}
    </div>
  );
}
