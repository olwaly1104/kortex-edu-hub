import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { TrendingUp } from "lucide-react";

export default function FinancasReceitas() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Receitas" subtitle="Propinas, taxas e emolumentos cobrados" icon={<TrendingUp className="w-5 h-5" />} />
      <EmptyState description="Ainda não foram registadas receitas." />
    </div>
  );
}
