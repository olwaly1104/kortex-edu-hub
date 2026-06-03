import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Settings2, Plus, Trash2, Pencil, ArrowLeft, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";

type Periodicidade = "mensal" | "trimestral" | "semestral" | "anual" | "pontual";
type DespesaConfig = {
  key: string;
  label: string;
  categoria: string;
  valor: number;
  periodicidade: Periodicidade;
  descricao: string;
};

const CATEGORIAS = ["Salários", "Infraestrutura", "Material Didáctico", "Serviços e Utilities", "Investigação", "Bolsas e Apoios"];

const periodicidadeLabels: Record<Periodicidade, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  pontual: "Pontual",
};

const INITIAL: DespesaConfig[] = [
  { key: "salarios_docentes", label: "Salários docentes", categoria: "Salários", valor: 18500000, periodicidade: "mensal", descricao: "Folha mensal de remunerações do corpo docente." },
  { key: "salarios_admin", label: "Salários pessoal administrativo", categoria: "Salários", valor: 7200000, periodicidade: "mensal", descricao: "Folha mensal do pessoal não docente." },
  { key: "energia_agua", label: "Energia e água", categoria: "Serviços e Utilities", valor: 1450000, periodicidade: "mensal", descricao: "Consumos das instalações centrais e faculdades." },
  { key: "internet_telecom", label: "Internet e telecomunicações", categoria: "Serviços e Utilities", valor: 680000, periodicidade: "mensal", descricao: "Ligações dedicadas, telefonia e cloud." },
  { key: "manutencao", label: "Manutenção de instalações", categoria: "Infraestrutura", valor: 950000, periodicidade: "trimestral", descricao: "Manutenção preventiva e correctiva de edifícios." },
  { key: "material_lab", label: "Material de laboratório", categoria: "Material Didáctico", valor: 1200000, periodicidade: "semestral", descricao: "Reposição de consumíveis e equipamento didáctico." },
  { key: "bolsas_merito", label: "Bolsas de mérito", categoria: "Bolsas e Apoios", valor: 4500000, periodicidade: "semestral", descricao: "Apoios a estudantes com desempenho excepcional." },
  { key: "projetos_invest", label: "Projectos de investigação", categoria: "Investigação", valor: 3200000, periodicidade: "anual", descricao: "Financiamento de linhas de investigação aprovadas." },
];

export default function ConfigurarDespesas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<DespesaConfig[]>(INITIAL);

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [nLabel, setNLabel] = useState("");
  const [nCat, setNCat] = useState<string>(CATEGORIAS[0]);
  const [nValor, setNValor] = useState<number>(0);
  const [nPer, setNPer] = useState<Periodicidade>("mensal");
  const [nDesc, setNDesc] = useState("");

  // Edit
  const [edit, setEdit] = useState<DespesaConfig | null>(null);

  const resetCreate = () => { setNLabel(""); setNCat(CATEGORIAS[0]); setNValor(0); setNPer("mensal"); setNDesc(""); };

  const addItem = () => {
    if (!nLabel.trim()) return;
    const key = nLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40) + "_" + Date.now().toString(36).slice(-4);
    setItems(prev => [...prev, { key, label: nLabel.trim(), categoria: nCat, valor: nValor, periodicidade: nPer, descricao: nDesc.trim() }]);
    toast({ title: "Despesa configurada" });
    resetCreate();
    setCreateOpen(false);
  };

  const saveEdit = () => {
    if (!edit || !edit.label.trim()) return;
    setItems(prev => prev.map(i => i.key === edit.key ? edit : i));
    toast({ title: "Despesa atualizada" });
    setEdit(null);
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
    toast({ title: "Despesa removida" });
  };

  const totalMensalEquiv = items.reduce((s, i) => {
    const m = i.periodicidade === "mensal" ? 1 : i.periodicidade === "trimestral" ? 1/3 : i.periodicidade === "semestral" ? 1/6 : i.periodicidade === "anual" ? 1/12 : 0;
    return s + i.valor * m;
  }, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2 text-muted-foreground" onClick={() => navigate("/financas/receitas")}>
            <ArrowLeft className="w-4 h-4" /> Receitas
          </Button>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" /> Configurar Despesas
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Defina as categorias de despesa recorrentes da instituição, com o respectivo valor e periodicidade.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equivalente mensal</p>
            <p className="text-lg font-bold text-destructive flex items-center gap-1 justify-end">
              <TrendingDown className="w-4 h-4" /> -{formatCurrency(totalMensalEquiv)}
            </p>
          </div>
        </div>
      </div>

      {/* Despesas */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Despesas configuradas</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length}</span>
          </div>
          <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Nova despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nova despesa</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                  <Input value={nLabel} onChange={e => setNLabel(e.target.value)} placeholder="Ex: Limpeza de instalações" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                    <Select value={nCat} onValueChange={setNCat}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Periodicidade</label>
                    <Select value={nPer} onValueChange={(v) => setNPer(v as Periodicidade)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(periodicidadeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor (Kz)</label>
                  <Input type="number" min={0} value={nValor} onChange={e => setNValor(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</label>
                  <Textarea value={nDesc} onChange={e => setNDesc(e.target.value)} placeholder="Notas sobre a despesa…" className="min-h-[70px]" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={addItem} disabled={!nLabel.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Designação</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Periodicidade</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Valor</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Descrição</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.key} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3 text-xs font-medium text-foreground">{i.label}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">{i.categoria}</Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{periodicidadeLabels[i.periodicidade]}</td>
                  <td className="p-3 text-right text-xs font-semibold text-destructive tabular-nums whitespace-nowrap">-{formatCurrency(i.valor)}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-md truncate" title={i.descricao}>{i.descricao || "—"}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => setEdit(i)} className="text-muted-foreground hover:text-foreground" aria-label={`Editar ${i.label}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeItem(i.key)} className="text-muted-foreground hover:text-destructive" aria-label={`Remover ${i.label}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-xs text-muted-foreground">Nenhuma despesa configurada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar despesa</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                <Input value={edit.label} onChange={e => setEdit({ ...edit, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                  <Select value={edit.categoria} onValueChange={(v) => setEdit({ ...edit, categoria: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      {edit.categoria && !CATEGORIAS.includes(edit.categoria) && (
                        <SelectItem value={edit.categoria}>{edit.categoria}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Periodicidade</label>
                  <Select value={edit.periodicidade} onValueChange={(v) => setEdit({ ...edit, periodicidade: v as Periodicidade })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(periodicidadeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor (Kz)</label>
                <Input type="number" min={0} value={edit.valor} onChange={e => setEdit({ ...edit, valor: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</label>
                <Textarea value={edit.descricao} onChange={e => setEdit({ ...edit, descricao: e.target.value })} className="min-h-[70px]" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={!edit?.label.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
