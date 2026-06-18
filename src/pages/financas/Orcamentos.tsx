import { useState, useMemo } from "react";
import { Search, X, FolderOpen, Wallet, AlertTriangle, CheckCircle2, ArrowUpDown, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/data/financeModuleData";
import { cn } from "@/lib/utils";
import { FinHeader } from "./_FinHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

type Budget = {
  id: string;
  name: string;
  department: string;
  total_budget: number;
  spent: number;
  period: string;
  status: "activo" | "em_revisao" | "esgotado";
  responsavel: string;
  responsavel_role: string;
};

type SortField = "total" | "spent" | "remaining" | "usage";
type SortDir = "asc" | "desc";

const statusColors: Record<Budget["status"], string> = {
  activo: "bg-accent/15 text-accent border-accent/30",
  em_revisao: "bg-amber-100 text-amber-700 border-amber-200",
  esgotado: "bg-destructive/15 text-destructive border-destructive/30",
};
const statusLabels: Record<Budget["status"], string> = { activo: "Activo", em_revisao: "Em revisão", esgotado: "Esgotado" };

const QK = ["institution", "orcamentos"] as const;

export default function Orcamentos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "",
    total_budget: "",
    spent: "",
    period: "",
    status: "activo" as Budget["status"],
    responsavel: "",
    responsavel_role: "",
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Budget[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Não autenticado");
      const { error } = await supabase.from("orcamentos").insert({
        owner_user_id: uid,
        name: form.name,
        department: form.department,
        total_budget: Number(form.total_budget) || 0,
        spent: Number(form.spent) || 0,
        period: form.period,
        status: form.status,
        responsavel: form.responsavel,
        responsavel_role: form.responsavel_role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast({ title: "Orçamento criado" });
      setOpen(false);
      setForm({ name: "", department: "", total_budget: "", spent: "", period: "", status: "activo", responsavel: "", responsavel_role: "" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const isSortActive = sortField !== null;
  const isStatusActive = filterStatus !== "todos";
  const isSearchActive = search !== "";
  const hasActiveControls = isSortActive || isStatusActive || isSearchActive;

  const filtered = useMemo(() => {
    let list = orcamentos
      .filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase()) || o.responsavel.toLowerCase().includes(search.toLowerCase()))
      .filter(o => filterStatus === "todos" || o.status === filterStatus);
    if (sortField) {
      list = [...list].sort((a, b) => {
        const get = (o: Budget) => sortField === "total" ? o.total_budget : sortField === "spent" ? o.spent : sortField === "remaining" ? (o.total_budget - o.spent) : (o.total_budget > 0 ? o.spent / o.total_budget : 0);
        return sortDir === "asc" ? get(a) - get(b) : get(b) - get(a);
      });
    }
    return list;
  }, [orcamentos, search, sortField, sortDir, filterStatus]);

  const totalBudget = orcamentos.reduce((s, o) => s + Number(o.total_budget), 0);
  const totalSpent = orcamentos.reduce((s, o) => s + Number(o.spent), 0);
  const totalRemaining = totalBudget - totalSpent;
  const emRisco = orcamentos.filter(o => o.total_budget > 0 && o.spent / o.total_budget >= 0.9 && o.status !== "esgotado").length;

  const resetAll = () => { setFilterStatus("todos"); setSortField(null); setSortDir("desc"); setSearch(""); };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Orçamentos"
        subtitle="Gestão e acompanhamento dos orçamentos por departamento."
        icon={<FolderOpen className="w-5 h-5 text-primary" />}
        right={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-2"><Plus className="w-4 h-4" /> Novo Orçamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Departamento</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
                <div className="space-y-1"><Label>Período</Label><Input placeholder="2026" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
                <div className="space-y-1"><Label>Total (AOA)</Label><Input type="number" value={form.total_budget} onChange={e => setForm({ ...form, total_budget: e.target.value })} /></div>
                <div className="space-y-1"><Label>Executado (AOA)</Label><Input type="number" value={form.spent} onChange={e => setForm({ ...form, spent: e.target.value })} /></div>
                <div className="space-y-1"><Label>Responsável</Label><Input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} /></div>
                <div className="space-y-1"><Label>Cargo</Label><Input value={form.responsavel_role} onChange={e => setForm({ ...form, responsavel_role: e.target.value })} /></div>
                <div className="col-span-2 space-y-1">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Budget["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="em_revisao">Em revisão</SelectItem>
                      <SelectItem value="esgotado">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Orçamento Total", value: formatCurrency(totalBudget), icon: Wallet, color: "text-foreground" },
          { label: "Executado", value: formatCurrency(totalSpent), icon: CheckCircle2, color: "text-accent" },
          { label: "Disponível", value: formatCurrency(totalRemaining), icon: Wallet, color: "text-primary" },
          { label: "Em Risco (≥90%)", value: String(emRisco), icon: AlertTriangle, color: emRisco > 0 ? "text-amber-600" : "text-foreground" },
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
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar orçamento, departamento, responsável..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
              { key: "activo", label: "Activo" },
              { key: "em_revisao", label: "Em revisão" },
              { key: "esgotado", label: "Esgotado" },
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
              <PopoverContent className="w-44 p-2 space-y-1" align="end" side="top">
                <button onClick={() => setSortField(null)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${!sortField ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Padrão</button>
                <button onClick={() => setSortField("total")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "total" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Total</button>
                <button onClick={() => setSortField("spent")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "spent" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Executado</button>
                <button onClick={() => setSortField("remaining")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "remaining" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por Disponível</button>
                <button onClick={() => setSortField("usage")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortField === "usage" ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Por % Utilização</button>
                <div className="border-t border-border my-1" />
                <button onClick={() => setSortDir("desc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "desc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Maior → Menor</button>
                <button onClick={() => setSortDir("asc")} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${sortDir === "asc" && isSortActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>Menor → Maior</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isStatusActive && <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/15" onClick={() => setFilterStatus("todos")}>Estado: {statusLabels[filterStatus as Budget["status"]]} <X className="w-2.5 h-2.5" /></Badge>}
            {isSearchActive && <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>Pesquisa: "{search}" <X className="w-2.5 h-2.5" /></Badge>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Orçamento</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Período</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Executado</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Disponível</th>
            <th className="text-left p-3 font-medium text-muted-foreground w-48">Utilização</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
          </tr></thead>
          <tbody>{filtered.map(o => {
            const usage = o.total_budget > 0 ? (Number(o.spent) / Number(o.total_budget)) * 100 : 0;
            const remaining = Number(o.total_budget) - Number(o.spent);
            const usageColor = usage >= 100 ? "text-destructive" : usage >= 90 ? "text-amber-600" : "text-foreground";
            return (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-3 text-xs">
                  <div className="font-medium text-foreground">{o.name}</div>
                  <div className="text-muted-foreground text-[10px]">{o.department}</div>
                </td>
                <td className="p-3 text-xs">
                  <div className="text-foreground">{o.responsavel}</div>
                  <div className="text-muted-foreground text-[10px]">{o.responsavel_role}</div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{o.period}</td>
                <td className="p-3 text-right text-xs text-foreground">{formatCurrency(Number(o.total_budget))}</td>
                <td className="p-3 text-right text-xs text-foreground">{formatCurrency(Number(o.spent))}</td>
                <td className={cn("p-3 text-right text-xs font-semibold", remaining <= 0 ? "text-destructive" : "text-accent")}>{formatCurrency(remaining)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(usage, 100)} className="h-1.5 flex-1" />
                    <span className={cn("text-[10px] font-medium tabular-nums w-10 text-right", usageColor)}>{usage.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", statusColors[o.status])}>{statusLabels[o.status]}</Badge></td>
              </tr>
            );
          })}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum orçamento encontrado.</p>}
        <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">{filtered.length} de {orcamentos.length} orçamentos</div>
      </Card>
    </div>
  );
}
