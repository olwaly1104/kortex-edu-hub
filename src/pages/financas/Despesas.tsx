import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";

export default function FinancasDespesas() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Despesas" subtitle="Despesas operacionais e académicas" icon={<FileText className="w-5 h-5" />} />
      <EmptyState description="Ainda não foram registadas despesas." />
    </div>
  );
}
