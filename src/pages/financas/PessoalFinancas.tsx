import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { Wallet } from "lucide-react";

export default function PessoalFinancas() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <FinHeader title="As Minhas Finanças" subtitle="Resumo das suas finanças pessoais" icon={<Wallet className="w-5 h-5" />} />
      <EmptyState description="Sem registos financeiros pessoais." />
    </div>
  );
}
