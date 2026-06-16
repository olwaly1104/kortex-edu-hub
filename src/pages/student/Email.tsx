import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import EmptyState from "@/components/EmptyState";
import { Mail } from "lucide-react";

export default function StudentEmail() {
  const [params] = useSearchParams();
  const to = params.get("to");
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Email</h1>
          <p className="text-sm text-muted-foreground">Caixa de entrada institucional</p>
        </div>
      </div>
      {to && (
        <Card className="p-4 text-sm">
          Novo email para <span className="font-mono">{to}</span> — funcionalidade de envio em preparação.
        </Card>
      )}
      <EmptyState title="Sem emails" description="Não existem mensagens na sua caixa de entrada." />
    </div>
  );
}
