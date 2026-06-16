import { FinHeader } from "@/pages/financas/_FinHeader";
import EmptyState from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

export default function GapDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Dashboard GAP" subtitle="Indicadores de apoio ao discente" icon={<BarChart3 className="w-5 h-5" />} />
      <EmptyState title="Sem dados" description="O dashboard mostrará aqui solicitações, agendamentos e candidaturas assim que existirem registos." />
    </div>
  );
}
