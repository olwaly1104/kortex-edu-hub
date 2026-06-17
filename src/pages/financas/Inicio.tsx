import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, Calendar as CalendarIcon, Megaphone, Wallet } from "lucide-react";
import { FinHeader } from "./_FinHeader";

export default function FinancasInicio() {
  const { user } = useAuth();

  const presencaPill = (
    <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground">
        <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
        Minha Presença
      </span>
      <span className="w-px bg-border" />
      <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
        0%
      </span>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title={`Bom dia, ${user?.name?.split(" ").pop() || "Finanças"}`}
        subtitle="Finanças — UPRA"
        icon={<Wallet className="w-5 h-5 text-primary" />}
        right={presencaPill}
      />

      {/* Agenda + Anúncios */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Agenda de Hoje
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sem eventos hoje</p>
            <p className="text-xs text-muted-foreground mt-1">A sua agenda está livre.</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" /> Anúncios
            </h2>
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
