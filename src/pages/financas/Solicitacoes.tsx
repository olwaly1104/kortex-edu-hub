import { FinHeader } from "./_FinHeader";
import { CheckSquare, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FinancasSolicitacoes() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Solicitações" subtitle="Pedidos dirigidos à Finanças" icon={<CheckSquare className="w-5 h-5" />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: 0 },
          { label: "Pendentes", value: 0 },
          { label: "Em curso", value: 0 },
          { label: "Concluídas", value: 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar solicitação…" className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="w-3.5 h-3.5" /> Filtros</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
          <div className="col-span-3">Solicitante</div>
          <div className="col-span-3">Assunto</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Data</div>
          <div className="col-span-2">Estado</div>
        </div>
        <div className="p-10 text-center text-sm text-muted-foreground">
          Sem solicitações registadas.
        </div>
      </div>
    </div>
  );
}
