import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

export default function FinancasDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Dashboard" subtitle="Visão geral financeira da instituição" icon={<BarChart3 className="w-5 h-5" />} />
      <EmptyState
        title="Sem dados financeiros"
        description="Ainda não foram registadas receitas, despesas ou transações. O dashboard ficará disponível assim que existirem dados."
      />
    </div>
  );
}
