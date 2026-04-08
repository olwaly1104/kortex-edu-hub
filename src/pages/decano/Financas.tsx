import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, FileText, TrendingUp } from "lucide-react";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function DecanoFinancas() {
  const salarioBase = 480000;
  const liquido = Math.round(salarioBase * 0.86);
  const descontos = Math.round(salarioBase * 0.14);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" /> Finanças
        </h1>
        <p className="text-muted-foreground mt-1">Resumo salarial</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Wallet, label: "Salário Base", value: `${salarioBase.toLocaleString()} Kz`, color: "text-foreground" },
          { icon: TrendingUp, label: "Salário Líquido", value: `${liquido.toLocaleString()} Kz`, color: "text-accent" },
          { icon: FileText, label: "Descontos", value: `${descontos.toLocaleString()} Kz`, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Salary History */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico Salarial</h2>
        <div className="space-y-2">
          {months.map((m, i) => {
            const paid = i < 2;
            return (
              <Card key={m} className={`p-4 flex items-center gap-4 border-l-[3px] ${paid ? "border-l-accent" : "border-l-secondary"}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{m} 2024</p>
                  <p className="text-[11px] text-muted-foreground">
                    Bruto: {salarioBase.toLocaleString()} Kz · Líquido: {liquido.toLocaleString()} Kz
                  </p>
                </div>
                <Badge className={`text-[10px] border-0 ${paid ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                  {paid ? "Pago" : "Pendente"}
                </Badge>
                {paid && <FileText className="w-4 h-4 text-primary cursor-pointer shrink-0" />}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
