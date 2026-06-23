import { useState, useMemo, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { FinHeader } from "./_FinHeader";

import { PeriodSelector, PERIODO_MULT, type Periodo, periodoDefaultValue } from "./_PeriodSelector";

type SortField = "amount";
type SortDir = "asc" | "desc";

// ─── Config (mirrors ConfigurarReceitas → Despesas section) ────────────────
type CfgCategoria = { id: string; nome: string; cor: string; documentos: string[] };
type CfgEstado = { id: string; nome: string; cor: string; descricao?: string };
type CfgResp = { id: string; pessoa: string; categoria: string; limite: number };

const CFG_KEY = (kind: string, email?: string | null) =>
  `upra.fin.cfg.${kind}::${email || "anon"}`;
const readJSON = <T,>(k: string, fb: T): T => {
  try {
    const r = localStorage.getItem(k);
    return r ? (JSON.parse(r) as T) : fb;
  } catch {
    return fb;
  }
};

const DEFAULT_ESTADOS: CfgEstado[] = [
  { id: "e1", nome: "Pendente", cor: "bg-amber-100 text-amber-700 border-amber-200", descricao: "Aguarda revisão e aprovação." },
  { id: "e2", nome: "Aprovada", cor: "bg-emerald-100 text-emerald-700 border-emerald-200", descricao: "Validada, pronta para pagamento." },
  { id: "e3", nome: "Rejeitada", cor: "bg-red-100 text-red-700 border-red-200", descricao: "Recusada pelo responsável." },
  { id: "e4", nome: "Paga", cor: "bg-blue-100 text-blue-700 border-blue-200", descricao: "Pagamento efetuado e contabilizado." },
];

const despesas: Transaction[] = [];

const todayISO = () => new Date().toISOString().slice(0, 10);

type NewDespesa = {
  date: string;
  description: string;
  category: string;
  amount: string;
  requestedBy: string;
  responsavel: string;
  status: string;
  justificacao: string;
  docs: { name: string; size: number }[];
};

const emptyDespesa = (defaultStatus: string): NewDespesa => ({
  date: todayISO(),
  description: "",
  category: "",
  amount: "",
  requestedBy: "",
  responsavel: "",
  status: defaultStatus,
  justificacao: "",
  docs: [],
});


export default function Despesas() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email;

  // Read configured categorias / estados / responsaveis (mirrors ConfigurarReceitas → Despesas)
  const [cfgCategorias, setCfgCategorias] = useState<CfgCategoria[]>(() =>
    readJSON<CfgCategoria[]>(CFG_KEY("des.categorias", email), []));
  const [cfgEstados, setCfgEstados] = useState<CfgEstado[]>(() => {
    const r = readJSON<CfgEstado[]>(CFG_KEY("des.estados", email), []);
    return r.length ? r : DEFAULT_ESTADOS;
  });
  const [cfgResponsaveis, setCfgResponsaveis] = useState<CfgResp[]>(() =>
    readJSON<CfgResp[]>(CFG_KEY("des.responsaveis", email), []));

  // Re-hydrate when window regains focus, so config edits made elsewhere appear
  useEffect(() => {
    const hydrate = () => {
      setCfgCategorias(readJSON<CfgCategoria[]>(CFG_KEY("des.categorias", email), []));
      const r = readJSON<CfgEstado[]>(CFG_KEY("des.estados", email), []);
      setCfgEstados(r.length ? r : DEFAULT_ESTADOS);
      setCfgResponsaveis(readJSON<CfgResp[]>(CFG_KEY("des.responsaveis", email), []));
    };
    window.addEventListener("focus", hydrate);
    return () => window.removeEventListener("focus", hydrate);
  }, [email]);

  const categoryNames = useMemo(() => cfgCategorias.map(c => c.nome).filter(Boolean), [cfgCategorias]);
  const estadoNames = useMemo(() => cfgEstados.map(e => e.nome).filter(Boolean), [cfgEstados]);
  const estadoLabels = useMemo(() => {
    const m: Record<string, string> = {};
    cfgEstados.forEach(e => { m[e.nome.toLowerCase()] = e.nome; });
    return m;
  }, [cfgEstados]);
  const estadoColor = useMemo(() => {
    const m: Record<string, string> = {};
    cfgEstados.forEach(e => { m[e.nome.toLowerCase()] = e.cor; });
    return m;
  }, [cfgEstados]);
  const estadoDescricao = useMemo(() => {
    const m: Record<string, string> = {};
    cfgEstados.forEach(e => { m[e.nome.toLowerCase()] = e.descricao || ""; });
    return m;
  }, [cfgEstados]);
  const defaultEstado = estadoNames[0] || "Pendente";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [periodoValue, setPeriodoValue] = useState<string>(periodoDefaultValue("mes"));
  const [form, setForm] = useState<NewDespesa>(() => emptyDespesa(defaultEstado));
  const mult = PERIODO_MULT[periodo];

  // Keep default status in sync if config changes before first edit
  useEffect(() => {
    setForm(f => (f.status ? f : { ...f, status: defaultEstado }));
  }, [defaultEstado]);

  const setField = <K extends keyof NewDespesa>(k: K, v: NewDespesa[K]) => setForm(f => ({ ...f, [k]: v }));
  const amountNum = Number(form.amount.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
  const isValid = form.description.trim().length >= 3 && !!form.category && amountNum > 0 && !!form.date;

  const requiredDocs = useMemo(
    () => cfgCategorias.find(c => c.nome === form.category)?.documentos || [],
    [cfgCategorias, form.category],
  );

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
    setForm(emptyDespesa(defaultEstado));
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
          <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Adicionar Despesa</Button>
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
            {categoryNames.map(c => (
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
            <Button size="sm" variant={filterStatus === "todos" ? "default" : "outline"} onClick={() => setFilterStatus("todos")} className="text-xs">Todos</Button>
            {estadoNames.map(name => (
              <Button key={name} size="sm" variant={filterStatus === name.toLowerCase() ? "default" : "outline"} onClick={() => setFilterStatus(name.toLowerCase())} className="text-xs">{name}</Button>
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
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {estadoLabels[filterStatus] || filterStatus} <X className="w-2.5 h-2.5" /></Badge>}
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
              <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", estadoColor[(d.status || "").toLowerCase()] || "bg-muted text-muted-foreground border-border")}>{estadoLabels[(d.status || "").toLowerCase()] || d.status}</Badge></td>
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

      {/* Sheet — Adicionar Despesa */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-gradient-to-br from-primary/10 via-card to-card border-b border-border px-6 py-5">
            <SheetHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <SheetTitle className="text-lg font-bold">Adicionar Despesa</SheetTitle>
              </div>
              <SheetDescription className="text-xs">
                Preencha os campos abaixo. Os dados alinham-se com as colunas da tabela de despesas.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Section: Identificação */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileSignature className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Identificação</h3>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Descrição <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ex: Aquisição de projector para sala 12"
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  maxLength={140}
                  className="h-9"
                />
                <p className="text-[10px] text-muted-foreground text-right">{form.description.length}/140</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1"><Tag className="w-3 h-3" /> Categoria <span className="text-destructive">*</span></Label>
                  <Select value={form.category} onValueChange={v => setField("category", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder={categoryNames.length ? "Selecione" : "Configure categorias em Configurador"} /></SelectTrigger>
                    <SelectContent>
                      {categoryNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {requiredDocs.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">Documentos exigidos: {requiredDocs.join(", ")}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Data <span className="text-destructive">*</span></Label>
                  <Input type="date" value={form.date} max={todayISO()} onChange={e => setField("date", e.target.value)} className="h-9" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Valor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valor</h3>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Montante (Kz) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={e => setField("amount", e.target.value)}
                    className="h-10 pr-16 text-right text-base font-semibold tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Kz</span>
                </div>
                {amountNum > 0 && (
                  <p className="text-[11px] text-destructive font-medium">Previsão: -{formatCurrency(amountNum)}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Section: Pessoas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User2 className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pessoas</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Solicitado por</Label>
                  <Input placeholder="Nome do solicitante" value={form.requestedBy} onChange={e => setField("requestedBy", e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Responsável (aprovador)</Label>
                  {cfgResponsaveis.length > 0 ? (
                    <Select value={form.responsavel} onValueChange={v => setField("responsavel", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar aprovador" /></SelectTrigger>
                      <SelectContent>
                        {cfgResponsaveis
                          .filter(r => !r.categoria || !form.category || r.categoria === form.category)
                          .map(r => (
                            <SelectItem key={r.id} value={r.pessoa}>
                              {r.pessoa} {r.limite ? `· até ${formatCurrency(r.limite)}` : ""}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Aprovador / gestor" value={form.responsavel} onChange={e => setField("responsavel", e.target.value)} className="h-9" />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Estado & Justificação */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado & Justificação</h3>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Estado inicial</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cfgEstados.map(es => {
                    const active = form.status === es.nome;
                    return (
                      <button
                        key={es.id}
                        type="button"
                        onClick={() => setField("status", es.nome)}
                        title={es.descricao || es.nome}
                        className={cn(
                          "h-9 rounded-md border text-xs font-medium transition-colors px-2",
                          active
                            ? es.cor
                            : "bg-background border-input text-muted-foreground hover:border-primary hover:text-primary",
                        )}
                      >
                        {es.nome}
                      </button>
                    );
                  })}
                </div>
                {form.status && estadoDescricao[form.status.toLowerCase()] && (
                  <p className="text-[10px] text-muted-foreground">{estadoDescricao[form.status.toLowerCase()]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Justificação</Label>
                <Textarea
                  placeholder="Motivo, contexto e impacto da despesa..."
                  value={form.justificacao}
                  onChange={e => setField("justificacao", e.target.value)}
                  maxLength={500}
                  className="min-h-[88px] text-xs"
                />
                <p className="text-[10px] text-muted-foreground text-right">{form.justificacao.length}/500</p>
              </div>
            </div>

            <Separator />

            {/* Section: Documentos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Documentos de suporte</h3>
              </div>

              <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-input rounded-lg p-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Carregar comprovativos</span>
                <span className="text-[10px] text-muted-foreground">PDF, JPG, PNG · até 5 ficheiros</span>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>

              {form.docs.length > 0 && (
                <ul className="space-y-1.5">
                  {form.docs.map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium text-foreground">{d.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{(d.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button onClick={() => setForm(f => ({ ...f, docs: f.docs.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-3 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setForm(emptyDespesa(defaultEstado)); setSheetOpen(false); }}>Cancelar</Button>
            <Button size="sm" disabled={!isValid} onClick={submit} className="gap-1.5">
              <Check className="w-4 h-4" /> Guardar Despesa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
