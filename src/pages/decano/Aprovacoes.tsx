import { useState } from "react";
import { decanoAprovacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, CheckCircle, XCircle, Award, FileText, Calendar, Users, AlertTriangle } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = { nota: Award, plano: FileText, horário: Calendar, transferência: Users, recurso: AlertTriangle };
const priorityColor: Record<string, string> = { alta: "border-l-destructive", média: "border-l-secondary", baixa: "border-l-border" };
const statusBadge: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-secondary/10 text-secondary" },
  aprovado: { label: "Aprovado", cls: "bg-accent/10 text-accent" },
  rejeitado: { label: "Rejeitado", cls: "bg-destructive/10 text-destructive" },
};

export default function DecanoAprovacoes() {
  const [tab, setTab] = useState<"pendentes" | "historico">("pendentes");
  const pendentes = decanoAprovacoes.filter(a => a.status === "pendente");
  const historico = decanoAprovacoes.filter(a => a.status !== "pendente");
  const filtered = tab === "pendentes" ? pendentes : historico;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary" /> Aprovações
        </h1>
        <p className="text-muted-foreground mt-1">{pendentes.length} pendentes · {historico.length} no histórico</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={tab === "pendentes" ? "default" : "outline"} onClick={() => setTab("pendentes")} className="gap-1.5">
          <Clock className="w-4 h-4" /> Pendentes ({pendentes.length})
        </Button>
        <Button size="sm" variant={tab === "historico" ? "default" : "outline"} onClick={() => setTab("historico")} className="gap-1.5">
          <CheckCircle className="w-4 h-4" /> Histórico ({historico.length})
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map(ap => {
          const Icon = typeIcons[ap.type] || FileText;
          const sb = statusBadge[ap.status];
          return (
            <Card key={ap.id} className={`p-4 border-l-[3px] ${priorityColor[ap.priority]}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{ap.title}</p>
                    <Badge className={`${sb.cls} text-[10px] border-0`}>{sb.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{ap.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{ap.requester} · {ap.date}</p>
                </div>
                {ap.status === "pendente" && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-8 text-xs gap-1"><CheckCircle className="w-3.5 h-3.5" /> Aprovar</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive"><XCircle className="w-3.5 h-3.5" /> Rejeitar</Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhuma aprovação.</p>}
      </div>
    </div>
  );
}
