import { useState } from "react";
import { FolderOpen, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, orcamentos } from "@/data/financeModuleData";

const statusColors: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700",
  esgotado: "bg-red-100 text-red-700",
  em_revisao: "bg-amber-100 text-amber-700",
};
const statusLabels: Record<string, string> = { activo: "Activo", esgotado: "Esgotado", em_revisao: "Em Revisão" };

export default function Orcamentos() {
  const [search, setSearch] = useState("");

  const filtered = orcamentos.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudget = orcamentos.reduce((s, o) => s + o.totalBudget, 0);
  const totalSpent = orcamentos.reduce((s, o) => s + o.spent, 0);
  const pctUsed = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de orçamentos por departamento</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Orçamento</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Orçamentado", value: formatCurrency(totalBudget), color: "text-foreground" },
          { label: "Total Gasto", value: formatCurrency(totalSpent), color: "text-red-600" },
          { label: "Disponível", value: formatCurrency(totalBudget - totalSpent), color: "text-emerald-600" },
          { label: "% Utilizado", value: `${pctUsed}%`, color: pctUsed > 80 ? "text-red-600" : "text-primary" },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
            <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar orçamentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((o) => {
          const pct = Math.round((o.spent / o.totalBudget) * 100);
          const remaining = o.totalBudget - o.spent;
          return (
            <div key={o.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{o.name}</h3>
                  <p className="text-xs text-muted-foreground">{o.department} · {o.period}</p>
                </div>
                <Badge className={`text-[10px] border-0 ${statusColors[o.status]}`}>{statusLabels[o.status]}</Badge>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Gasto: {formatCurrency(o.spent)}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Orçamento: {formatCurrency(o.totalBudget)}</span>
                <span className={`font-medium ${remaining <= 0 ? "text-red-600" : "text-emerald-600"}`}>
                  Disponível: {formatCurrency(Math.max(0, remaining))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
