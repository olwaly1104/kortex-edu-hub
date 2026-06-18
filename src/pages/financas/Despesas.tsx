import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowUpDown, X, Check, Wallet, Clock, Ban, TrendingDown, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Upload, Paperclip, Trash2, Calendar as CalendarIcon, Coins, Tag, User2, ShieldCheck, FileSignature } from "lucide-react";
import { formatCurrency, type Transaction } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FinHeader } from "./_FinHeader";

import { PeriodSelector, PERIODO_MULT, type Periodo, periodoDefaultValue } from "./_PeriodSelector";

type SortField = "amount";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  aprovada: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  rejeitada: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = { aprovada: "Aprovada", pendente: "Pendente", rejeitada: "Rejeitada" };
const despesas: Transaction[] = [];


const DESPESA_CATEGORIES = ["Operacional", "Pedagógica", "Manutenção", "Serviços", "Material", "Salários", "Outros"] as const;
const todayISO = () => new Date().toISOString().slice(0, 10);

type NewDespesa = {
  date: string;
  description: string;
  category: string;
  amount: string;
  requestedBy: string;
  responsavel: string;
  status: "pendente" | "aprovada" | "rejeitada";
  justificacao: string;
  docs: { name: string; size: number }[];
};

const emptyDespesa: NewDespesa = {
  date: todayISO(),
  description: "",
  category: "",
  amount: "",
  requestedBy: "",
  responsavel: "",
  status: "pendente",
  justificacao: "",
  docs: [],
};

export default function Despesas() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [periodoValue, setPeriodoValue] = useState<string>(periodoDefaultValue("mes"));
  const [form, setForm] = useState<NewDespesa>(emptyDespesa);
  const mult = PERIODO_MULT[periodo];

  const setField = <K extends keyof NewDespesa>(k: K, v: NewDespesa[K]) => setForm(f => ({ ...f, [k]: v }));
  const amountNum = Number(form.amount.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
  const isValid = form.description.trim().length >= 3 && !!form.category && amountNum > 0 && !!form.date;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).slice(0, 5).map(f => ({ name: f.name, size: f.size }));
    setForm(f => ({ ...f, docs: [...f.docs, ...added].slice(0, 5) }));
  };

  const submit = () => {
    if (!isValid) {
      toast({ title: "Campos obrigatórios em falta", description: "Descrição, categoria, valor e data são obrigatórios.", variant: "destructive" });
      return;
    }
    toast({ title: "Despesa registada", description: `${form.description} · ${formatCurrency(amountNum)}` });
    setForm(emptyDespesa);
    setSheetOpen(false);
  };


  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isCatActive = filterCategory !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive || isCatActive;

  const filtered = useMemo(() => {
    let list = despesas
      .filter(d => !search || d.description.toLowerCase().includes(search.toLowerCase()) || (d.responsavel || "").toLowerCase().includes(search.toLowerCase()) || (d.requestedBy || "").toLowerCase().includes(search.toLowerCase()))
      .filter(d => filterStatus === "todos" || d.status === filterStatus)
      .filter(d => filterCategory === "todos" || d.category === filterCategory);
    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount);
    }
    return list;
  }, [search, sortField, sortDir, filterStatus, filterCategory]);

  const totalMes = despesas.reduce((s, d) => s + d.amount, 0);
  const aprovadas = despesas.filter(d => d.status === "aprovada").reduce((s, d) => s + d.amount, 0);
  const pendentes = despesas.filter(d => d.status === "pendente").reduce((s, d) => s + d.amount, 0);
  const rejeitadas = despesas.filter(d => d.status === "rejeitada").reduce((s, d) => s + d.amount, 0);

  const resetAll = () => { setFilterStatus("todos"); setFilterCategory("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Despesas"
        subtitle="Aprovação e acompanhamento de despesas institucionais."
        icon={<TrendingDown className="w-5 h-5 text-primary" />}
        right={
          <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Nova Despesa</Button>
        }
      />





      {/* Período toggle + result + selector */}
      <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} value={periodoValue} setValue={setPeriodoValue} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: periodo === "mes" ? "Despesas Total do Mês" : periodo === "semestre" ? "Despesas Total do Semestre" : "Despesas Total do Ano", value: formatCurrency(totalMes * mult), icon: TrendingDown, color: "text-foreground" },
          { label: "Aprovadas", value: formatCurrency(aprovadas * mult), icon: Wallet, color: "text-accent" },
          { label: "Pendentes", value: formatCurrency(pendentes * mult), icon: Clock, color: "text-amber-600" },
          { label: "Rejeitadas", value: formatCurrency(rejeitadas * mult), icon: Ban, color: "text-destructive" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><kpi.icon className="w-4 h-4 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>


      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2 items-center flex-wrap">
          {/* Categories first */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant={filterCategory === "todos" ? "default" : "outline"} onClick={() => setFilterCategory("todos")} className="text-xs">Todas</Button>
            {DESPESA_CATEGORIES.map(c => (
              <Button key={c} size="sm" variant={filterCategory === c ? "default" : "outline"} onClick={() => setFilterCategory(c)} className="text-xs">{c}</Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar despesa, responsável..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex-1" />
          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
          <div className="flex items-center gap-2">
            {[
              { key: "todos", label: "Todos" },
              { key: "aprovada", label: "Aprovada" },
              { key: "pendente", label: "Pendente" },
              { key: "rejeitada", label: "Rejeitada" },
            ].map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">{s.label}</Button>
            ))}
            <div className="w-px h-6 bg-border" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`gap-1.5 shrink-0 text-xs ${isSortActive ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
                  <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2 space-y-1" align="end" side="top">
                <button onClick={() => setSortField(null)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${!sortField ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Padrão</button>
                <button onClick={() => setSortField("amount")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "amount" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Valor</button>
                <div className="border-t border-border my-1" />
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {statusLabels[filterStatus]} <X className="w-2.5 h-2.5" /></Badge>}
            {isCatActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setFilterCategory("todos")}>Categoria: {filterCategory} <X className="w-2.5 h-2.5" /></Badge>}
            {isSortActive && <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => { setSortField(null); setSortDir("desc"); }}>Valor: {sortDir === "desc" ? "Maior" : "Menor"} <X className="w-2.5 h-2.5" /></Badge>}
            {isSearchActive && <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>Pesquisa: "{search}" <X className="w-2.5 h-2.5" /></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Descrição</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Solicitado por</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Docs</th>
          </tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/financas/despesas/${d.id}`)}>
              <td className="p-3 text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
              <td className="p-3 text-xs font-medium text-foreground">{d.description}</td>
              <td className="p-3"><Badge variant="outline" className="text-[10px]">{d.category}</Badge></td>
              <td className="p-3 text-right text-xs font-semibold text-destructive">-{formatCurrency(d.amount)}</td>
              <td className="p-3 text-xs text-muted-foreground">{d.category === "Salários" ? "—" : (d.requestedBy || "—")}</td>
              <td className="p-3 text-xs text-foreground">{d.responsavel || "—"}</td>
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[d.status])}>{statusLabels[d.status] || d.status}</Badge></td>
              <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                {(() => {
                  const total = (d as any).docsRequired ?? 0;
                  const entregues = (d as any).docsSubmitted ?? 0;
                  if (total === 0) return <span className="text-[10px] text-muted-foreground/60">—</span>;
                  const complete = entregues >= total;
                  return (
                    <Button variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] gap-1", complete ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-primary")} onClick={() => toast({ title: `${entregues}/${total} documentos entregues` })}>
                      <FileText className="w-3 h-3" /> {entregues}/{total}
                    </Button>
                  );
                })()}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filtered.length} de {despesas.length} despesas</div>
      </Card>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Nova Despesa</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-6">
            {["Descrição", "Categoria", "Solicitado por", "Responsável", "Valor (Kz)", "Data"].map(f => (
              <div key={f} className="space-y-1.5">
                <Label className="text-xs">{f}</Label>
                <Input placeholder={f} className="h-9" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">Justificação</Label>
              <Textarea placeholder="Motivo da despesa..." className="min-h-[80px]" />
            </div>
            <Button className="w-full mt-4">Guardar Despesa</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
