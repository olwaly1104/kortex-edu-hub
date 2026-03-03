import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, FileText } from "lucide-react";
const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export default function DecanoFinancas() {
  const salarioBase = 480000;
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Wallet className="w-6 h-6 text-primary" /> Finanças</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 text-center"><p className="text-2xl font-bold text-foreground">{salarioBase.toLocaleString()} Kz</p><p className="text-xs text-muted-foreground">Salário Base</p></Card>
        <Card className="p-5 text-center"><p className="text-2xl font-bold text-accent">{Math.round(salarioBase*0.86).toLocaleString()} Kz</p><p className="text-xs text-muted-foreground">Salário Líquido</p></Card>
        <Card className="p-5 text-center"><p className="text-2xl font-bold text-destructive">{Math.round(salarioBase*0.14).toLocaleString()} Kz</p><p className="text-xs text-muted-foreground">Descontos</p></Card>
      </div>
      <h2 className="text-lg font-semibold text-foreground">Histórico Salarial</h2>
      <Card className="overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Mês</th><th className="text-center p-3 font-medium text-muted-foreground">Bruto</th><th className="text-center p-3 font-medium text-muted-foreground">Líquido</th><th className="text-center p-3 font-medium text-muted-foreground">Estado</th><th className="text-center p-3 font-medium text-muted-foreground">Recibo</th></tr></thead>
      <tbody>{months.map((m,i) => { const paid = i < 2; return (<tr key={m} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium text-foreground">{m} 2024</td><td className="p-3 text-center">{salarioBase.toLocaleString()} Kz</td><td className="p-3 text-center">{Math.round(salarioBase*0.86).toLocaleString()} Kz</td><td className="p-3 text-center"><Badge className={paid ? "bg-accent/10 text-accent text-[10px]" : "bg-secondary/10 text-secondary text-[10px]"}>{paid ? "Pago" : "Pendente"}</Badge></td><td className="p-3 text-center">{paid && <FileText className="w-4 h-4 text-primary mx-auto cursor-pointer" />}</td></tr>); })}</tbody></table></Card>
    </div>
  );
}
