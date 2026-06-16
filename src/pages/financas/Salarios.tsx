import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

export default function FinancasSalarios() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Salários" subtitle="Folha de pagamento institucional" icon={<Users className="w-5 h-5" />} />
      <EmptyState description="Ainda não existe folha de pagamento configurada." />
    </div>
  );
}
