import { useState, useMemo } from "react";
import { TrendingUp, Search, ArrowUpDown, X, Wallet, Clock, AlertTriangle, FileText, Receipt, Pencil, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, type Transaction } from "@/data/financeModuleData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FinHeader } from "./_FinHeader";

import { PeriodSelector, PERIODO_MULT, type Periodo, periodoDefaultValue } from "./_PeriodSelector";

type SortField = "amount";
type SortDir = "asc" | "desc";

const statusColors: Record<string, string> = {
  pago: "bg-accent/15 text-accent border-accent/30",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  em_atraso: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<string, string> = { pago: "Recebido", pendente: "Pendente", em_atraso: "Em Atraso" };
const emptyReceitas: Transaction[] = [];

// Receita Esperada = soma de todas as propinas anuais brutas dos estudantes.
// Permanece a 0 até o Reitor activar o ano lectivo (fim do onboarding) e as
// propinas serem definidas em Configurar Receitas.
const estimativaMensal = 0;

export default function Receitas() {
  const { toast } = useToast();
  const receitas = emptyReceitas;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [periodoValue, setPeriodoValue] = useState<string>(periodoDefaultValue("mes"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const mult = PERIODO_MULT[periodo];

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isCatActive = filterCategory !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive || isCatActive;

  const filtered = useMemo(() => {
    let list = receitas
      .filter(r => !search || (r.payer || "").toLowerCase().includes(search.toLowerCase()) || (r.studentId || "").toLowerCase().includes(search.toLowerCase()) || (r.course || "").toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase()))
      .filter(r => filterStatus === "todos" || r.status === filterStatus)
      .filter(r => filterCategory === "todos" || r.category === filterCategory);
    if (sortField) {
      list = [...list].sort((a, b) => sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount);
    }
    return list;
  }, [search, sortField, sortDir, filterStatus, filterCategory]);

  const recebido = receitas.filter(r => r.status === "pago").reduce((s, r) => s + r.amount, 0);
  const pendente = receitas.filter(r => r.status === "pendente").reduce((s, r) => s + r.amount, 0);
  const emAtraso = receitas.filter(r => r.status === "em_atraso").reduce((s, r) => s + r.amount, 0);

  const resetAll = () => { setFilterStatus("todos"); setFilterCategory("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  const startEdit = (id: string, current: number) => { setEditingId(id); setEditValue(String(current)); };
  const commitEdit = (id: string) => {
    const n = Number(editValue);
    if (!isNaN(n) && n >= 0) {
      toast({ title: "Valor actualizado" });
    }
    setEditingId(null);
  };

  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Receitas"
        subtitle="Gestão de propinas, emolumentos e outras receitas institucionais."
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
        right={
          <Button
            size="sm"
            onClick={() => toast({ title: "Nova receita", description: "Formulário em breve." })}
            className="h-9 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </Button>
        }
      />




      {/* Período toggle + result + selector */}
      <PeriodSelector periodo={periodo} setPeriodo={setPeriodo} value={periodoValue} setValue={setPeriodoValue} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita Esperada</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(estimativaMensal * mult)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recebido</span>
          </div>
          <p className="text-2xl font-bold text-accent">{formatCurrency(recebido * mult)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendente * mult)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Atraso</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(emAtraso * mult)}</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Row 1: Category */}
        <div className="flex gap-2 items-center flex-wrap">
          {[
            { key: "todos", label: "Todas" },
            { key: "Propinas", label: "Propina" },
            { key: "Emolumentos", label: "Emolumentos" },
          ].map(s => (
            <Button key={s.key} size="sm" variant={filterCategory === s.key ? "default" : "outline"} onClick={() => setFilterCategory(s.key)} className="text-xs">{s.label}</Button>
          ))}
        </div>


        {/* Row 2: Search + Status + Sort */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar estudante, ID, curso..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex-1" />
          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
          {[
            { key: "todos", label: "Todos" },
            { key: "pendente", label: "Pendente" },
            { key: "pago", label: "Recebido" },
            { key: "em_atraso", label: "Em Atraso" },
          ].map(s => (
            <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">{s.label}</Button>
          ))}
          <div className="w-px h-6 bg-border" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-1.5 shrink-0 text-xs", isSortActive && "border-primary/50 bg-primary/5 text-primary")}>
                <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 space-y-1" align="end" side="top">
              <button onClick={() => setSortField(null)} className={cn("w-full text-left px-2 py-1.5 rounded text-xs transition-colors", !sortField ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>Padrão</button>
              <button onClick={() => setSortField("amount")} className={cn("w-full text-left px-2 py-1.5 rounded text-xs transition-colors", sortField === "amount" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>Por Valor</button>
              <div className="border-t border-border my-1" />
              <button onClick={() => setSortDir("desc")} className={cn("w-full text-left px-2 py-1.5 rounded text-xs transition-colors", sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>Maior → Menor</button>
              <button onClick={() => setSortDir("asc")} className={cn("w-full text-left px-2 py-1.5 rounded text-xs transition-colors", sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted")}>Menor → Maior</button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filters */}
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
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Categoria</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Valor</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Documentos</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
                <td className="p-3">
                  <p className="text-xs font-medium text-foreground">{r.payer || "—"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{r.studentId || "—"}</p>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{r.course || "—"}</td>
                <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{r.category}</Badge></td>
                <td className="p-3 text-right">
                  {editingId === r.id ? (
                    <div className="flex items-center gap-1 justify-end">
                      <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitEdit(r.id); if (e.key === "Escape") setEditingId(null); }} autoFocus className="h-7 w-28 text-xs text-right" />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => commitEdit(r.id)}><Check className="w-3.5 h-3.5 text-accent" /></Button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(r.id, r.amount)} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline group">
                      +{formatCurrency(r.amount)}
                      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  )}
                </td>
                <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[r.status])}>{statusLabels[r.status]}</Badge></td>
                <td className="p-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary" onClick={() => toast({ title: "Comprovativo aberto" })}>
                      <FileText className="w-3 h-3" /> Comprovativo
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary" onClick={() => toast({ title: "Factura aberta" })}>
                      <Receipt className="w-3 h-3" /> Factura
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filtered.length} de {receitas.length} transacções</div>
      </Card>
    </div>
  );
}
