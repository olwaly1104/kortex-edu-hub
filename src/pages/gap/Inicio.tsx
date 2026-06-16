import { FinHeader } from "@/pages/financas/_FinHeader";
import EmptyState from "@/components/EmptyState";
import { LayoutDashboard } from "lucide-react";

export default function GapInicio() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Início" subtitle="Cockpit do Gabinete de Apoio ao Discente" icon={<LayoutDashboard className="w-5 h-5" />} />
      <EmptyState description="Sem actividade. Solicitações e agendamentos aparecerão aqui em tempo real." />
    </div>
  );
}
