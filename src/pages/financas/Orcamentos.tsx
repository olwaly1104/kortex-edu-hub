import { useState } from "react";
import { FolderOpen, Search, Plus, FileText, Download, Eye, Clock, ChevronRight, Folder, FileSpreadsheet, File, Upload, MoreHorizontal, Calendar, Shield, Receipt, CreditCard, BarChart3, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { formatCurrency, orcamentos } from "@/data/financeModuleData";

const statusColors: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700",
  esgotado: "bg-red-100 text-red-700",
  em_revisao: "bg-amber-100 text-amber-700",
};
const statusLabels: Record<string, string> = { activo: "Activo", esgotado: "Esgotado", em_revisao: "Em Revisão" };

interface FinFile {
  id: string;
  name: string;
  type: "pdf" | "xlsx" | "csv" | "doc" | "folder";
  size?: string;
  modified: string;
  category: string;
  status?: "final" | "rascunho" | "pendente";
  items?: number;
}

const financialFiles: FinFile[] = [
  { id: "ff1", name: "Relatórios Anuais", type: "folder", modified: "2025-04-10", category: "Relatórios", items: 4 },
  { id: "ff2", name: "Comprovativos de Pagamento", type: "folder", modified: "2025-04-09", category: "Comprovativos", items: 28 },
  { id: "ff3", name: "Contratos e Acordos", type: "folder", modified: "2025-03-15", category: "Contratos", items: 12 },
  { id: "ff4", name: "Auditorias", type: "folder", modified: "2025-02-20", category: "Auditoria", items: 6 },
  { id: "ff5", name: "Orçamento Geral 2025 — Aprovado", type: "xlsx", size: "2.4 MB", modified: "2025-01-15", category: "Orçamentos", status: "final" },
  { id: "ff6", name: "Balanço Financeiro — Q1 2025", type: "pdf", size: "1.8 MB", modified: "2025-04-05", category: "Relatórios", status: "final" },
  { id: "ff7", name: "Mapa de Salários — Abril 2025", type: "xlsx", size: "890 KB", modified: "2025-04-01", category: "Salários", status: "pendente" },
  { id: "ff8", name: "Relatório de Receitas — Março 2025", type: "pdf", size: "1.2 MB", modified: "2025-04-02", category: "Relatórios", status: "final" },
  { id: "ff9", name: "Proposta Orçamental 2026", type: "doc", size: "3.1 MB", modified: "2025-03-28", category: "Orçamentos", status: "rascunho" },
  { id: "ff10", name: "Extracto Bancário — Março 2025", type: "pdf", size: "456 KB", modified: "2025-04-03", category: "Bancário", status: "final" },
  { id: "ff11", name: "Facturas Fornecedores — Q1", type: "csv", size: "2.1 MB", modified: "2025-04-08", category: "Comprovativos", status: "final" },
  { id: "ff12", name: "Plano Financeiro Plurianual 2025–2028", type: "pdf", size: "4.5 MB", modified: "2025-02-10", category: "Planeamento", status: "final" },
];

const fileIcons: Record<string, { icon: React.ElementType; color: string }> = {
  pdf: { icon: FileText, color: "text-red-500 bg-red-50" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  csv: { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  doc: { icon: File, color: "text-blue-600 bg-blue-50" },
  folder: { icon: Folder, color: "text-amber-600 bg-amber-50" },
};

const statusFileColors: Record<string, string> = {
  final: "bg-emerald-100 text-emerald-700",
  rascunho: "bg-amber-100 text-amber-700",
  pendente: "bg-blue-100 text-blue-700",
};
const statusFileLabels: Record<string, string> = { final: "Final", rascunho: "Rascunho", pendente: "Pendente" };

const categoryIcons: Record<string, React.ElementType> = {
  "Relatórios": BarChart3,
  "Comprovativos": Receipt,
  "Contratos": Shield,
  "Auditoria": BookOpen,
  "Orçamentos": CreditCard,
  "Salários": CreditCard,
  "Bancário": CreditCard,
  "Planeamento": Calendar,
};

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [fileCategory, setFileCategory] = useState("all");

  const filtered = orcamentos.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudget = orcamentos.reduce((s, o) => s + o.totalBudget, 0);
  const totalSpent = orcamentos.reduce((s, o) => s + o.spent, 0);
  const pctUsed = Math.round((totalSpent / totalBudget) * 100);

  const categories = [...new Set(financialFiles.map(f => f.category))];
  const filteredFiles = financialFiles.filter(f => {
    if (fileSearch && !f.name.toLowerCase().includes(fileSearch.toLowerCase())) return false;
    if (fileCategory !== "all" && f.category !== fileCategory) return false;
    return true;
  });

  const folders = filteredFiles.filter(f => f.type === "folder");
  const files = filteredFiles.filter(f => f.type !== "folder");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de orçamentos por departamento</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Orçamento</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Orçamentado", value: formatCurrency(totalBudget), color: "text-foreground" },
          { label: "Total Gasto", value: formatCurrency(totalSpent), color: "text-red-600" },
          { label: "Disponível", value: formatCurrency(totalBudget - totalSpent), color: "text-emerald-600" },
          { label: "% Utilizado", value: `${pctUsed}%`, color: pctUsed > 80 ? "text-red-600" : "text-primary" },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</span>
            <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar orçamentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((o) => {
          const pct = Math.round((o.spent / o.totalBudget) * 100);
          const remaining = o.totalBudget - o.spent;
          return (
            <div key={o.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{o.name}</h3>
                  <p className="text-xs text-muted-foreground">{o.department} · {o.period}</p>
                </div>
                <Badge className={`text-[10px] border-0 ${statusColors[o.status]}`}>{statusLabels[o.status]}</Badge>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Gasto: {formatCurrency(o.spent)}</span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Orçamento: {formatCurrency(o.totalBudget)}</span>
                <span className={`font-medium ${remaining <= 0 ? "text-red-600" : "text-emerald-600"}`}>
                  Disponível: {formatCurrency(Math.max(0, remaining))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Documents Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" /> Ficheiros Financeiros
          </h2>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
            <Upload className="w-3.5 h-3.5" /> Carregar Ficheiro
          </Button>
        </div>

        {/* Quick access categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Relatórios", count: 4, icon: BarChart3, color: "bg-primary/10 text-primary" },
            { label: "Comprovativos", count: 28, icon: Receipt, color: "bg-emerald-50 text-emerald-600" },
            { label: "Contratos", count: 12, icon: Shield, color: "bg-amber-50 text-amber-600" },
            { label: "Auditorias", count: 6, icon: BookOpen, color: "bg-red-50 text-red-600" },
          ].map(cat => (
            <Card key={cat.label} className="p-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setFileCategory(cat.label === fileCategory ? "all" : cat.label)}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.count} itens</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* File filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar ficheiros..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={fileCategory === "all" ? "default" : "outline"}
              className="h-9 text-xs"
              onClick={() => setFileCategory("all")}
            >
              Todos
            </Button>
            {categories.slice(0, 4).map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={fileCategory === cat ? "default" : "outline"}
                className="h-9 text-xs"
                onClick={() => setFileCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {folders.map(f => {
              const fi = fileIcons[f.type];
              const Icon = fi.icon;
              return (
                <div key={f.id} className="rounded-xl border bg-card p-3 cursor-pointer hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${fi.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{f.items} itens</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Files list */}
        {files.length > 0 && (
          <div className="rounded-xl border bg-card divide-y divide-border">
            {files.map(f => {
              const fi = fileIcons[f.type];
              const Icon = fi.icon;
              return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${fi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase">{f.type}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{f.size}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{new Date(f.modified).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  {f.status && (
                    <Badge className={`text-[9px] border-0 shrink-0 ${statusFileColors[f.status]}`}>
                      {statusFileLabels[f.status]}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
