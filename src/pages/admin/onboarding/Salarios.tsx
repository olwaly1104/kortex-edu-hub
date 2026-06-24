import { useMemo, useState } from "react";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Banknote, GraduationCap, Briefcase, CheckCircle2, Percent, Wallet } from "lucide-react";
import { RowLockControls } from "@/components/admin/RowLockControls";
import { toast } from "sonner";

type Categoria = "docente" | "staff";
type Row = {
  id: string;
  nome: string;
  email: string;
  categoria: Categoria;
  cargo: string;
  bruto: number;
  imposto: number; // percentagem (%)
  confirmado: boolean;
};

const seedDocentes: Row[] = [];
const seedStaff: Row[] = [];


const fmt = (v: number) => v.toLocaleString("pt-AO", { maximumFractionDigits: 0 });
const liquido = (r: Row) => Math.round(r.bruto * (1 - r.imposto / 100));

export default function OnboardingSalarios() {
  const [rows, setRows] = useState<Row[]>([...seedDocentes, ...seedStaff]);
  const [tab, setTab] = useState<"todos" | Categoria>("todos");

  const filtered = useMemo(
    () => rows.filter(r => tab === "todos" || r.categoria === tab),
    [rows, tab]
  );

  const totals = useMemo(() => ({
    pessoas: rows.length,
    confirmados: rows.filter(r => r.confirmado).length,
    folhaBruta: rows.reduce((s, r) => s + r.bruto, 0),
    folhaLiquida: rows.reduce((s, r) => s + liquido(r), 0),
  }), [rows]);

  const update = (id: string, patch: Partial<Row>) => setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch, confirmado: false } : r));
  const confirmar = (id: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, confirmado: true } : r));
    toast.success("Salário confirmado");
  };
  const confirmarTodos = () => {
    setRows(prev => prev.map(r => ({ ...r, confirmado: true })));
    toast.success("Todos os salários confirmados");
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <OnboardingStepBanner />

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Wallet className="w-3.5 h-3.5" /><p className="text-xs">Pessoas</p></div><p className="text-2xl font-bold">{totals.pessoas}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><CheckCircle2 className="w-3.5 h-3.5" /><p className="text-xs">Confirmados</p></div><p className="text-2xl font-bold text-emerald-600">{totals.confirmados}/{totals.pessoas}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Banknote className="w-3.5 h-3.5" /><p className="text-xs">Folha bruta</p></div><p className="text-2xl font-bold">{fmt(totals.folhaBruta)} <span className="text-xs text-muted-foreground font-normal">Kz</span></p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Banknote className="w-3.5 h-3.5" /><p className="text-xs">Folha líquida</p></div><p className="text-2xl font-bold">{fmt(totals.folhaLiquida)} <span className="text-xs text-muted-foreground font-normal">Kz</span></p></Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="docente" className="gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Docentes</TabsTrigger>
            <TabsTrigger value="staff" className="gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Staff</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={confirmarTodos} className="gap-1.5"><CheckCircle2 className="w-4 h-4" /> Confirmar todos</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_140px_90px_140px_110px_90px] gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
          <span>Nome</span>
          <span>Cargo</span>
          <span className="text-right">Bruto (Kz)</span>
          <span className="text-right">Imposto</span>
          <span className="text-right">Líquido (Kz)</span>
          <span className="text-center">Estado</span>
          <span></span>
        </div>
        <div className="divide-y">
          {filtered.map(r => (
            <div key={r.id} className="grid grid-cols-[1.4fr_1fr_140px_90px_140px_110px_90px] gap-2 px-4 py-2 items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.nome}</p>
                <p className="text-[11px] text-muted-foreground truncate">{r.email}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Badge variant="outline" className="text-[10px] capitalize">{r.categoria}</Badge>
                <span className="text-muted-foreground truncate">{r.cargo}</span>
              </div>
              <Input type="number" value={r.bruto} onChange={e => update(r.id, { bruto: Number(e.target.value) || 0 })} className="h-8 text-xs text-right" />
              <div className="relative">
                <Input type="number" value={r.imposto} onChange={e => update(r.id, { imposto: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="h-8 text-xs text-right pr-6" />
                <Percent className="w-3 h-3 absolute right-1.5 top-2.5 text-muted-foreground" />
              </div>
              <div className="text-right text-sm font-semibold tabular-nums">{fmt(liquido(r))}</div>
              <div className="text-center">
                {r.confirmado
                  ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmado</Badge>
                  : <Badge variant="outline" className="text-[10px]">Pendente</Badge>}
              </div>
              <Button size="sm" variant={r.confirmado ? "outline" : "default"} onClick={() => confirmar(r.id)} className="h-8 text-xs gap-1">
                <Save className="w-3 h-3" /> {r.confirmado ? "Re-confirmar" : "Confirmar"}
              </Button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-xs text-muted-foreground italic text-center">Sem registos nesta categoria. Registe docentes ou staff nos passos anteriores.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
