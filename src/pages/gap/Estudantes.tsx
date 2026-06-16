import { FinHeader } from "@/pages/financas/_FinHeader";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

export default function GapEstudantes() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Discentes" subtitle="Estudantes acompanhados pelo GAP" icon={<Users className="w-5 h-5" />} />
      <EmptyState description="Sem discentes registados." />
    </div>
  );
}
