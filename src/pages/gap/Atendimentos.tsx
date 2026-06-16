import { FinHeader } from "@/pages/financas/_FinHeader";
import EmptyState from "@/components/EmptyState";
import { CalendarDays } from "lucide-react";

export default function GapAtendimentos() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Agendamentos" subtitle="Atendimentos marcados com discentes" icon={<CalendarDays className="w-5 h-5" />} />
      <EmptyState description="Sem agendamentos." />
    </div>
  );
}
