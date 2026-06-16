import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { FolderOpen } from "lucide-react";

export default function FinancasOrcamentos() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Orçamentos" subtitle="Planeamento e ficheiros orçamentais" icon={<FolderOpen className="w-5 h-5" />} />
      <EmptyState description="Ainda não foram criados orçamentos." />
    </div>
  );
}
