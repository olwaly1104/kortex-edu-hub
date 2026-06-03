import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Settings2, Plus, Trash2, ArrowLeft, GraduationCap, Receipt, Search, Save,
  Building2, Users, BookOpen,
} from "lucide-react";
import { formatCurrency } from "@/data/financeModuleData";
import { reitorFaculties } from "@/data/institutionData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PropinaRow = {
  courseId: string;
  facultyId: string;
  facultyName: string;
  courseName: string;
  code: string;
  years: number;
  estudantes: number;
  mensal: number;
  matricula: number;
};

type TaxaCat = "Emolumentos" | "Serviços Académicos" | "Taxas" | "Candidaturas";
type TaxaRow = {
  key: string;
  label: string;
  categoria: TaxaCat;
  valor: number;
};

const CATEGORIAS: TaxaCat[] = ["Emolumentos", "Serviços Académicos", "Taxas", "Candidaturas"];

// Seed propinas: defaults vary by faculty (medicina mais elevada, ciências sociais mais baixa)
const seedPropinaMensal = (facultyName: string, years: number) => {
  if (facultyName.includes("Medicina")) return 65000;
  if (facultyName.includes("Arquitectura")) return 52000;
  if (facultyName.includes("Direito")) return 48000;
  if (facultyName.includes("Economia")) return 45000;
  return 38000;
};
const seedMatricula = (facultyName: string) => {
  if (facultyName.includes("Medicina")) return 35000;
  if (facultyName.includes("Arquitectura") || facultyName.includes("Direito")) return 30000;
  return 25000;
};

const initialPropinas = (): PropinaRow[] =>
  reitorFaculties.flatMap(f =>
    f.courses.map(c => ({
      courseId: c.id,
      facultyId: f.id,
      facultyName: f.name,
      courseName: c.name,
      code: c.code,
      years: c.years,
      estudantes: c.estudantes,
      mensal: seedPropinaMensal(f.name, c.years),
      matricula: seedMatricula(f.name),
    }))
  );

const INITIAL_TAXAS: TaxaRow[] = [
  { key: "candidatura", label: "Candidatura ao processo de admissão", categoria: "Candidaturas", valor: 15000 },
  { key: "exame_admissao", label: "Exame de admissão", categoria: "Candidaturas", valor: 12000 },
  { key: "certificado", label: "Emissão de certificado de habilitações", categoria: "Serviços Académicos", valor: 8000 },
  { key: "declaracao_simples", label: "Declaração simples", categoria: "Serviços Académicos", valor: 2500 },
  { key: "declaracao_nota", label: "Declaração com notas", categoria: "Serviços Académicos", valor: 4500 },
  { key: "historico", label: "Histórico académico", categoria: "Serviços Académicos", valor: 6000 },
  { key: "exame_especial", label: "Inscrição em exame de época especial", categoria: "Emolumentos", valor: 12000 },
  { key: "exame_recurso", label: "Inscrição em exame de recurso", categoria: "Emolumentos", valor: 8000 },
  { key: "segunda_via_cartao", label: "2ª via de cartão de estudante", categoria: "Taxas", valor: 3500 },
  { key: "transferencia", label: "Transferência de curso", categoria: "Taxas", valor: 15000 },
];

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [propinas, setPropinas] = useState<PropinaRow[]>(initialPropinas);
  const [taxas, setTaxas] = useState<TaxaRow[]>(INITIAL_TAXAS);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("todas");

  // Bulk edit by faculty
  const [bulkOpen, setBulkOpen] = useState<{ facultyId: string; name: string } | null>(null);
  const [bulkMensal, setBulkMensal] = useState<number>(0);
  const [bulkMatricula, setBulkMatricula] = useState<number>(0);

  // New taxa dialog
  const [taxaOpen, setTaxaOpen] = useState(false);
  const [tLabel, setTLabel] = useState("");
  const [tCat, setTCat] = useState<TaxaCat>("Serviços Académicos");
  const [tValor, setTValor] = useState<number>(0);

  const updatePropina = (courseId: string, field: "mensal" | "matricula", value: number) => {
    setPropinas(prev => prev.map(p => p.courseId === courseId ? { ...p, [field]: value } : p));
  };

  const applyBulk = () => {
    if (!bulkOpen) return;
    setPropinas(prev => prev.map(p => p.facultyId === bulkOpen.facultyId
      ? { ...p, mensal: bulkMensal > 0 ? bulkMensal : p.mensal, matricula: bulkMatricula > 0 ? bulkMatricula : p.matricula }
      : p
    ));
    toast({ title: `Valores aplicados a ${bulkOpen.name}` });
    setBulkOpen(null);
    setBulkMensal(0);
    setBulkMatricula(0);
  };

  const addTaxa = () => {
    if (!tLabel.trim()) return;
    const key = tLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30) + "_" + Date.now().toString(36).slice(-4);
    setTaxas(prev => [...prev, { key, label: tLabel.trim(), categoria: tCat, valor: tValor }]);
    toast({ title: "Taxa adicionada" });
    setTLabel(""); setTValor(0); setTCat("Serviços Académicos");
    setTaxaOpen(false);
  };

  const updateTaxa = (key: string, valor: number) => {
    setTaxas(prev => prev.map(t => t.key === key ? { ...t, valor } : t));
  };
  const removeTaxa = (key: string) => setTaxas(prev => prev.filter(t => t.key !== key));

  // Grouping
  const grouped = useMemo(() => {
    const lower = search.toLowerCase();
    const filtered = propinas.filter(p => {
      if (facultyFilter !== "todas" && p.facultyId !== facultyFilter) return false;
      if (!lower) return true;
      return p.courseName.toLowerCase().includes(lower) || p.code.toLowerCase().includes(lower) || p.facultyName.toLowerCase().includes(lower);
    });
    const map = new Map<string, { facultyId: string; name: string; rows: PropinaRow[] }>();
    filtered.forEach(p => {
      if (!map.has(p.facultyId)) map.set(p.facultyId, { facultyId: p.facultyId, name: p.facultyName, rows: [] });
      map.get(p.facultyId)!.rows.push(p);
    });
    return Array.from(map.values());
  }, [propinas, search, facultyFilter]);

  // Summary
  const totalEstudantes = propinas.reduce((s, p) => s + p.estudantes, 0);
  const receitaMensalEstim = propinas.reduce((s, p) => s + p.estudantes * p.mensal, 0);
  const propinaMedia = propinas.length ? propinas.reduce((s, p) => s + p.mensal, 0) / propinas.length : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2 text-muted-foreground h-7" onClick={() => navigate("/financas/receitas")}>
          <ArrowLeft className="w-4 h-4" /> Receitas
        </Button>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" /> Configurar Receitas
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Defina as propinas por curso e as taxas e serviços académicos da universidade.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cursos", value: propinas.length, icon: BookOpen },
          { label: "Faculdades", value: reitorFaculties.length, icon: Building2 },
          { label: "Estudantes", value: totalEstudantes.toLocaleString("pt-PT"), icon: Users },
          { label: "Receita mensal estimada", value: formatCurrency(receitaMensalEstim), icon: Receipt, accent: true },
        ].map(k => (
          <Card key={k.label} className="p-4 border-border/70">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <k.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</span>
            </div>
            <p className={cn("text-xl font-bold tabular-nums", k.accent ? "text-accent" : "text-foreground")}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="propinas" className="space-y-4">
        <TabsList className="bg-muted/40 p-1 h-auto">
          <TabsTrigger value="propinas" className="gap-1.5 text-xs data-[state=active]:bg-background">
            <GraduationCap className="w-3.5 h-3.5" /> Propinas por Curso
          </TabsTrigger>
          <TabsTrigger value="taxas" className="gap-1.5 text-xs data-[state=active]:bg-background">
            <Receipt className="w-3.5 h-3.5" /> Taxas e Serviços
          </TabsTrigger>
        </TabsList>

        {/* PROPINAS */}
        <TabsContent value="propinas" className="space-y-4 m-0">
          {/* Controls */}
          <div className="rounded-xl border border-border bg-card p-3 flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar curso ou código…" className="pl-8 h-9 text-xs" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button size="sm" variant={facultyFilter === "todas" ? "default" : "outline"} onClick={() => setFacultyFilter("todas")} className="text-[11px] h-8">Todas as faculdades</Button>
              {reitorFaculties.map(f => (
                <Button key={f.id} size="sm" variant={facultyFilter === f.id ? "default" : "outline"} onClick={() => setFacultyFilter(f.id)} className="text-[11px] h-8">
                  {f.name.replace("Faculdade de ", "")}
                </Button>
              ))}
            </div>
            <div className="flex-1" />
            <span className="text-[11px] text-muted-foreground tabular-nums">
              Propina média · <span className="font-semibold text-foreground">{formatCurrency(propinaMedia)}</span>/mês
            </span>
          </div>

          {/* Faculty groups */}
          <div className="space-y-4">
            {grouped.map(group => {
              const facRows = group.rows;
              const facEstud = facRows.reduce((s, r) => s + r.estudantes, 0);
              const facReceita = facRows.reduce((s, r) => s + r.estudantes * r.mensal, 0);
              return (
                <Card key={group.facultyId} className="overflow-hidden border-border/70">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">{group.name}</h3>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {facRows.length} {facRows.length === 1 ? "curso" : "cursos"} · {facEstud.toLocaleString("pt-PT")} estudantes · {formatCurrency(facReceita)}/mês
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm" variant="outline" className="text-[11px] h-7 gap-1 shrink-0"
                      onClick={() => { setBulkOpen({ facultyId: group.facultyId, name: group.name }); setBulkMensal(0); setBulkMatricula(0); }}
                    >
                      <Save className="w-3 h-3" /> Aplicar a todos
                    </Button>
                  </div>

                  {/* Course rows */}
                  <div className="divide-y divide-border">
                    {facRows.map(p => (
                      <div key={p.courseId} className="px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-muted/20 transition-colors">
                        <div className="col-span-12 md:col-span-5 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-5">{p.code}</Badge>
                            <span className="text-sm font-medium text-foreground truncate">{p.courseName}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                            {p.years} anos · {p.estudantes.toLocaleString("pt-PT")} estudantes
                          </p>
                        </div>

                        <div className="col-span-6 md:col-span-3">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Propina mensal</label>
                          <div className="relative">
                            <Input
                              type="number" min={0} value={p.mensal}
                              onChange={e => updatePropina(p.courseId, "mensal", Number(e.target.value) || 0)}
                              className="h-8 text-xs pr-10 tabular-nums"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Kz</span>
                          </div>
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Matrícula</label>
                          <div className="relative">
                            <Input
                              type="number" min={0} value={p.matricula}
                              onChange={e => updatePropina(p.courseId, "matricula", Number(e.target.value) || 0)}
                              className="h-8 text-xs pr-10 tabular-nums"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Kz</span>
                          </div>
                        </div>

                        <div className="col-span-12 md:col-span-2 md:text-right">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Receita / mês</p>
                          <p className="text-sm font-semibold text-accent tabular-nums">+{formatCurrency(p.estudantes * p.mensal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {grouped.length === 0 && (
              <Card className="p-10 text-center text-sm text-muted-foreground">Nenhum curso encontrado.</Card>
            )}
          </div>
        </TabsContent>

        {/* TAXAS */}
        <TabsContent value="taxas" className="space-y-4 m-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Taxas e serviços académicos cobrados pontualmente — emolumentos, serviços e candidaturas.
            </p>
            <Dialog open={taxaOpen} onOpenChange={setTaxaOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Nova taxa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Nova taxa</DialogTitle></DialogHeader>
                <div className="space-y-3 py-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                    <Input value={tLabel} onChange={e => setTLabel(e.target.value)} placeholder="Ex: Reposição de cartão" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                      <Select value={tCat} onValueChange={(v) => setTCat(v as TaxaCat)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor (Kz)</label>
                      <Input type="number" min={0} value={tValor} onChange={e => setTValor(Number(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={addTaxa} disabled={!tLabel.trim()}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {CATEGORIAS.map(cat => {
            const rows = taxas.filter(t => t.categoria === cat);
            if (rows.length === 0) return null;
            return (
              <Card key={cat} className="overflow-hidden border-border/70">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{cat}</h3>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{rows.length}</span>
                </div>
                <div className="divide-y divide-border">
                  {rows.map(t => (
                    <div key={t.key} className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center hover:bg-muted/20">
                      <span className="col-span-12 md:col-span-7 text-xs font-medium text-foreground">{t.label}</span>
                      <div className="col-span-9 md:col-span-4">
                        <div className="relative">
                          <Input
                            type="number" min={0} value={t.valor}
                            onChange={e => updateTaxa(t.key, Number(e.target.value) || 0)}
                            className="h-8 text-xs pr-10 tabular-nums"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Kz</span>
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-1 flex justify-end">
                        <button onClick={() => removeTaxa(t.key)} className="text-muted-foreground hover:text-destructive p-1" aria-label={`Remover ${t.label}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Bulk dialog */}
      <Dialog open={!!bulkOpen} onOpenChange={(o) => !o && setBulkOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aplicar a todos os cursos</DialogTitle>
          </DialogHeader>
          {bulkOpen && (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground">
                Define os mesmos valores para todos os cursos de <span className="font-semibold text-foreground">{bulkOpen.name}</span>. Deixa em 0 para não alterar.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Propina mensal (Kz)</label>
                  <Input type="number" min={0} value={bulkMensal || ""} onChange={e => setBulkMensal(Number(e.target.value) || 0)} placeholder="—" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Matrícula (Kz)</label>
                  <Input type="number" min={0} value={bulkMatricula || ""} onChange={e => setBulkMatricula(Number(e.target.value) || 0)} placeholder="—" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(null)}>Cancelar</Button>
            <Button onClick={applyBulk} disabled={bulkMensal <= 0 && bulkMatricula <= 0}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
