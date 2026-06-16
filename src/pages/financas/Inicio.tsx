import { FinHeader } from "./_FinHeader";
import EmptyState from "@/components/EmptyState";
import { LayoutDashboard } from "lucide-react";

export default function FinancasInicio() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Início" subtitle="Cockpit operacional da Finanças" icon={<LayoutDashboard className="w-5 h-5" />} />
      <EmptyState
        title="Sem actividade"
        description="O cockpit financeiro mostrará aqui as próximas obrigações, alertas e solicitações pendentes."
      />
    </div>
  );
}
