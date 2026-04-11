import { CheckSquare, Clock, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const solicitacoes = [
  { id: "s1", title: "Reembolso de despesas — Conferência Internacional", from: "Prof. António Silva", date: "2025-04-08", amount: 450000, status: "pendente" as const },
  { id: "s2", title: "Aumento orçamental — Laboratório de Redes", from: "Decano Fac. Engenharia", date: "2025-04-05", amount: 8000000, status: "pendente" as const },
  { id: "s3", title: "Pagamento fornecedor — Reagentes químicos", from: "Coord. Fac. Ciências", date: "2025-04-02", amount: 2300000, status: "aprovada" as const },
  { id: "s4", title: "Antecipação salarial — Motivos pessoais", from: "Eng. João Martins", date: "2025-03-28", amount: 200000, status: "rejeitada" as const },
  { id: "s5", title: "Verba extra — Evento de Boas-Vindas", from: "Assoc. Estudantes", date: "2025-03-25", amount: 1500000, status: "pendente" as const },
];

const statusColors: Record<string, string> = { pendente: "bg-amber-100 text-amber-700", aprovada: "bg-emerald-100 text-emerald-700", rejeitada: "bg-red-100 text-red-700" };
const statusLabels: Record<string, string> = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada" };

export default function FinancasSolicitacoes() {
  const { toast } = useToast();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações</h1>
        <p className="text-sm text-muted-foreground">Pedidos financeiros pendentes de análise</p>
      </div>

      <div className="space-y-3">
        {solicitacoes.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.from} · {new Date(s.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 2 }).format(s.amount)} Kz
              </span>
              <Badge className={`text-[10px] border-0 ${statusColors[s.status]}`}>{statusLabels[s.status]}</Badge>
              {s.status === "pendente" && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => toast({ title: "Solicitação aprovada" })}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={() => toast({ title: "Solicitação rejeitada" })}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
