import { useState } from "react";
import { coordAprovacoes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, CheckCircle, XCircle, Award, FileText, Calendar, Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ElementType> = { nota: Award, plano: FileText, horário: Calendar, transferência: Users, recurso: AlertTriangle };
const priorityColor: Record<string, string> = { alta: "border-l-destructive", média: "border-l-secondary", baixa: "border-l-border" };
const statusBadge: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-secondary/10 text-secondary" },
  aprovado: { label: "Aprovado", cls: "bg-accent/10 text-accent" },
  rejeitado: { label: "Rejeitado", cls: "bg-destructive/10 text-destructive" },
};

export default function CoordenadorAprovacoes() {
  const [tab, setTab] = useState<"pendentes" | "historico">("pendentes");
  const filtered = tab === "pendentes" ? coordAprovacoes.filter(a => a.status === "pendente") : coordAprovacoes.filter(a => a.status !== "pendente");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><CheckSquare className="w-6 h-6 text-primary" /> Aprovações</h1>
        <Badge variant="outline">{coordAprovacoes.filter(a => a.status === "pendente").length} pendentes</Badge>
      </div>
      <div className="flex gap-2">
        {(["pendentes", "historico"] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "pendentes" ? <><Clock className="w-4 h-4 mr-1" /> Pendentes</> : <><CheckCircle className="w-4 h-4 mr-1" /> Histórico</>}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(ap => {
          const Icon = typeIcons[ap.type] || FileText;
          const sb = statusBadge[ap.status];
          return (
            <Card key={ap.id} className={cn("p-5 border-l-[3px]", priorityColor[ap.priority])}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{ap.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{ap.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{ap.requester} · {ap.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={cn("text-xs", sb.cls)}>{sb.label}</Badge>
                  {ap.status === "pendente" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="default" className="h-8 text-xs gap-1"><CheckCircle className="w-3.5 h-3.5" /> Aprovar</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive"><XCircle className="w-3.5 h-3.5" /> Rejeitar</Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhuma aprovação {tab === "pendentes" ? "pendente" : "no histórico"}.</p>}
      </div>
    </div>
  );
}
