import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alocacaoCandidatos, cursoTemplates } from "@/data/academica2Data";
import { Layers, Sparkles, Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const stateCfg = {
  alocado: { label: "Alocado", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
  conflito: { label: "Conflito", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

export default function Turmas() {
  const [running, setRunning] = useState(false);
  const alocados = alocacaoCandidatos.filter(c => c.estado === "alocado").length;
  const pendentes = alocacaoCandidatos.filter(c => c.estado === "pendente").length;
  const conflitos = alocacaoCandidatos.filter(c => c.estado === "conflito").length;

  const runAlloc = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setRunning(false);
    toast.success("Re-alocação automática concluída — 2 candidatos pendentes resolvidos.");
  };

  // Generate mock turmas grid
  const turmasGrid = cursoTemplates.flatMap(c =>
    Array.from({ length: c.years }, (_, ano) =>
      ["A", "B", "C"].map(letra => ({
        id: `${c.code}-${ano + 1}${letra}`,
        curso: c.name,
        codigo: c.code,
        ano: ano + 1,
        turma: letra,
        capacidade: 32,
        ocupacao: Math.floor(20 + Math.random() * 12),
      }))
    ).flat()
  ).slice(0, 18);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
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

      <Card className="p-5">
        <h2 className="text-base font-semibold mb-4">Alocação de Candidatos Aprovados</h2>
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
            {alocacaoCandidatos.map(c => {
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

      <Card className="p-5">
        <h2 className="text-base font-semibold mb-4">Mapa de Turmas (amostra)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {turmasGrid.map(t => {
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
    </div>
  );
}
