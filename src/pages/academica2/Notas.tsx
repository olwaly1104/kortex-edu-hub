import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { notasResumo } from "@/data/academica2Data";
import { Award, TrendingUp } from "lucide-react";

export default function Notas() {
  const mediaGlobal = (notasResumo.reduce((a, n) => a + n.mediaGeral, 0) / notasResumo.length).toFixed(1);
  const totalAprov = notasResumo.reduce((a, n) => a + n.aprovados, 0);
  const totalEst = notasResumo.reduce((a, n) => a + n.total, 0);
  const taxa = ((totalAprov / totalEst) * 100).toFixed(0);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas — Consolidação</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão consolidada de desempenho académico por curso e ano.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4"><TrendingUp className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" /><div><p className="text-2xl font-bold">{mediaGlobal}</p><p className="text-xs text-muted-foreground">Média Global</p></div></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{taxa}%</p><p className="text-xs text-muted-foreground">Taxa de Aprovação</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{totalAprov.toLocaleString()}</p><p className="text-xs text-muted-foreground">Aprovados</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{totalEst.toLocaleString()}</p><p className="text-xs text-muted-foreground">Avaliados</p></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Média Geral</TableHead>
              <TableHead>Aprovados</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-64">Taxa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notasResumo.map((n, i) => {
              const pct = (n.aprovados / n.total) * 100;
              const stateBadge = n.mediaGeral >= 13 ? "bg-emerald-100 text-emerald-700" : n.mediaGeral >= 11 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium">{n.curso}</TableCell>
                  <TableCell>{n.ano}º</TableCell>
                  <TableCell><Badge className={stateBadge}>{n.mediaGeral.toFixed(1)}</Badge></TableCell>
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
    </div>
  );
}
