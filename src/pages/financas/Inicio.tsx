import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, Calendar, Megaphone, Wallet } from "lucide-react";
import { FinHeader } from "./_FinHeader";

export default function FinancasInicio() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
      <FinHeader
        title={`Bom dia, ${user?.name?.split(" ").pop() || "Finanças"}`}
        subtitle="Finanças — UPRA"
        icon={<Wallet className="w-5 h-5 text-primary" />}
      />

      <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
        <ClipboardCheck className="w-3 h-3" />
        <span>Minha Presença</span>
        <span className="font-semibold text-foreground tabular-nums">0%</span>
      </div>

      {/* Agenda de Hoje + Anúncios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Agenda de Hoje</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem eventos hoje</p>
            <p className="text-xs text-muted-foreground mt-1">A sua agenda está livre.</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Anúncios</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Megaphone className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem anúncios</p>
            <p className="text-xs text-muted-foreground mt-1">Não existem comunicados recentes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
