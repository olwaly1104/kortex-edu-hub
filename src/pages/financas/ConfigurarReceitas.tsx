import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Settings2, Plus, Pencil, Trash2, ArrowLeft, Search, Download,
} from "lucide-react";
import { formatCurrency } from "@/data/financeModuleData";
import { reitorFaculties } from "@/data/institutionData";
import { useToast } from "@/hooks/use-toast";

type TipoReceita =
  | "Propina mensal"
  | "Matrícula"
  | "Emolumento"
  | "Taxa"
  | "Serviço Académico"
  | "Candidatura"
  | "Multa";

const TIPOS: TipoReceita[] = [
  "Propina mensal",
  "Matrícula",
  "Emolumento",
  "Taxa",
  "Serviço Académico",
  "Candidatura",
  "Multa",
];

interface ReceitaRow {
  id: string;
  nome: string;
  tipo: TipoReceita;
  /** "geral" or course id */
  escopo: string;
  valor: number;
}

const ALL_COURSES = reitorFaculties.flatMap(f =>
  f.courses.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    facultyName: f.name,
  }))
);

const courseLabel = (id: string) => {
  if (id === "geral") return "Geral (todos os cursos)";
  const c = ALL_COURSES.find(x => x.id === id);
  return c ? `${c.code} — ${c.name}` : id;
};

const seedPropina = (facultyName: string) => {
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

const initialRows = (): ReceitaRow[] => {
  const perCurso: ReceitaRow[] = ALL_COURSES.flatMap(c => [
    {
      id: `prop-${c.id}`,
      nome: `Propina mensal — ${c.name}`,
      tipo: "Propina mensal" as const,
      escopo: c.id,
      valor: seedPropina(c.facultyName),
    },
    {
      id: `matr-${c.id}`,
      nome: `Matrícula — ${c.name}`,
      tipo: "Matrícula" as const,
      escopo: c.id,
      valor: seedMatricula(c.facultyName),
    },
  ]);
  const gerais: ReceitaRow[] = [
    { id: "emo-1", nome: "Emissão de Declaração", tipo: "Emolumento", escopo: "geral", valor: 2500 },
    { id: "emo-2", nome: "Certificado de Habilitações", tipo: "Emolumento", escopo: "geral", valor: 5000 },
    { id: "emo-3", nome: "Histórico Académico", tipo: "Emolumento", escopo: "geral", valor: 3500 },
    { id: "ser-1", nome: "Requerimento de Exame Especial", tipo: "Serviço Académico", escopo: "geral", valor: 7500 },
    { id: "ser-2", nome: "Pedido de Equivalência", tipo: "Serviço Académico", escopo: "geral", valor: 12000 },
    { id: "ser-3", nome: "Reapreciação de Prova", tipo: "Serviço Académico", escopo: "geral", valor: 8000 },
    { id: "tax-1", nome: "Taxa de Inscrição em Exame", tipo: "Taxa", escopo: "geral", valor: 3000 },
    { id: "tax-2", nome: "Taxa de Emissão de 2ª Via de Cartão", tipo: "Taxa", escopo: "geral", valor: 2000 },
    { id: "can-1", nome: "Candidatura — Licenciatura", tipo: "Candidatura", escopo: "geral", valor: 15000 },
    { id: "can-2", nome: "Candidatura — Mestrado", tipo: "Candidatura", escopo: "geral", valor: 20000 },
    { id: "mul-1", nome: "Multa por atraso de propina (por mês)", tipo: "Multa", escopo: "geral", valor: 5000 },
    { id: "mul-2", nome: "Multa por falta a exame sem justificação", tipo: "Multa", escopo: "geral", valor: 7500 },
    { id: "mul-3", nome: "Multa por entrega tardia de documentos", tipo: "Multa", escopo: "geral", valor: 3000 },
    { id: "mul-4", nome: "Multa por extravio de cartão de estudante", tipo: "Multa", escopo: "geral", valor: 4000 },
    { id: "mul-5", nome: "Multa por danos em equipamento", tipo: "Multa", escopo: "geral", valor: 15000 },
  ];
  return [...gerais, ...perCurso];
};

const tipoBadge: Record<TipoReceita, string> = {
  "Propina mensal": "bg-blue-50 text-blue-700 border-blue-200",
  "Matrícula": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Emolumento": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Taxa": "bg-amber-50 text-amber-700 border-amber-200",
  "Serviço Académico": "bg-violet-50 text-violet-700 border-violet-200",
  "Candidatura": "bg-pink-50 text-pink-700 border-pink-200",
  "Multa": "bg-red-50 text-red-700 border-red-200",
};

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ReceitaRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [escopoFilter, setEscopoFilter] = useState<string>("todos");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReceitaRow | null>(null);
  const [form, setForm] = useState<ReceitaRow>({
    id: "", nome: "", tipo: "Taxa", escopo: "geral", valor: 0,
  });

  const [confirmDel, setConfirmDel] = useState<ReceitaRow | null>(null);

  const CATEGORIAS: Record<string, TipoReceita[]> = {
    propina: ["Propina mensal", "Matrícula"],
    emolumentos: ["Emolumento", "Taxa", "Serviço Académico"],
    candidatura: ["Candidatura"],
    multas: ["Multa"],
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (tipoFilter !== "todos") {
        const tipos = CATEGORIAS[tipoFilter];
        if (!tipos || !tipos.includes(r.tipo)) return false;
      }
      if (escopoFilter === "geral" && r.escopo !== "geral") return false;
      if (escopoFilter === "curso" && r.escopo === "geral") return false;
      if (!q) return true;
      return (
        r.nome.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q) ||
        courseLabel(r.escopo).toLowerCase().includes(q)
      );
    });
  }, [rows, search, tipoFilter, escopoFilter]);

  const totals = useMemo(() => {
    const total = rows.length;
    const porCurso = rows.filter(r => r.escopo !== "geral").length;
    const gerais = rows.filter(r => r.escopo === "geral").length;
    const cursosAbrangidos = new Set(rows.filter(r => r.escopo !== "geral").map(r => r.escopo)).size;
    return { total, porCurso, gerais, cursosAbrangidos };
  }, [rows]);

  const openNew = () => {
    setEditing(null);
    setForm({ id: "", nome: "", tipo: "Taxa", escopo: "geral", valor: 0 });
    setOpen(true);
  };

  const openEdit = (r: ReceitaRow) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };

  const save = () => {
    if (!form.nome.trim() || form.valor < 0) {
      toast({ title: "Dados incompletos", description: "Preencha o nome e um valor válido.", variant: "destructive" });
      return;
    }
    if (editing) {
      setRows(rs => rs.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
      toast({ title: "Receita actualizada", description: form.nome });
    } else {
      const id = `r-${Date.now()}`;
      setRows(rs => [{ ...form, id }, ...rs]);
      toast({ title: "Receita criada", description: form.nome });
    }
    setOpen(false);
  };

  const remove = () => {
    if (!confirmDel) return;
    setRows(rs => rs.filter(r => r.id !== confirmDel.id));
    toast({ title: "Receita removida", description: confirmDel.nome });
    setConfirmDel(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => navigate("/financas/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" /> Configurador Financeiro
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Defina propinas, matrículas, emolumentos, taxas, candidaturas e multas. Cada item pode ser geral ou específico de um curso de qualquer faculdade.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-lg"
            onClick={() => toast({ title: "Exportado", description: "Tabela de receitas a descarregar..." })}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button size="sm" className="gap-2 rounded-lg" onClick={openNew}>
            <Plus className="w-4 h-4" /> Nova Receita
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total de receitas", value: totals.total },
          { label: "Receitas gerais", value: totals.gerais },
          { label: "Por curso", value: totals.porCurso },
          { label: "Cursos abrangidos", value: totals.cursosAbrangidos },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, tipo ou curso..."
            className="pl-9 h-9 rounded-lg"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[200px] h-9 rounded-lg"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={escopoFilter} onValueChange={setEscopoFilter}>
          <SelectTrigger className="w-[180px] h-9 rounded-lg"><SelectValue placeholder="Âmbito" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os âmbitos</SelectItem>
            <SelectItem value="geral">Apenas Gerais</SelectItem>
            <SelectItem value="curso">Apenas por Curso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">Nome</TableHead>
              <TableHead className="text-xs font-semibold w-[170px]">Tipo</TableHead>
              <TableHead className="text-xs font-semibold">Aplica-se a</TableHead>
              <TableHead className="text-xs font-semibold text-right w-[160px]">Valor</TableHead>
              <TableHead className="text-xs font-semibold text-right w-[110px]">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  Sem receitas para os filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id} className="hover:bg-muted/30">
                <TableCell className="text-sm font-medium text-foreground">{r.nome}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] border ${tipoBadge[r.tipo]}`}>{r.tipo}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.escopo === "geral" ? (
                    <span className="text-foreground">Geral — todos os cursos</span>
                  ) : courseLabel(r.escopo)}
                </TableCell>
                <TableCell className="text-sm font-semibold text-foreground text-right whitespace-nowrap">
                  {formatCurrency(r.valor)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEdit(r)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => setConfirmDel(r)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Receita" : "Nova Receita"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nome</label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Propina mensal — Engenharia Civil" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={form.tipo} onValueChange={(v: TipoReceita) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor (Kz)</label>
                <Input type="number" min={0} value={form.valor}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Aplica-se a</label>
              <Select value={form.escopo} onValueChange={v => setForm({ ...form, escopo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="geral">Geral — todos os cursos</SelectItem>
                  {reitorFaculties.map(f => (
                    <div key={f.id}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{f.name}</div>
                      {f.courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={save}>{editing ? "Guardar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover receita?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmDel?.nome}. Esta acção não pode ser desfeita.
          </p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={remove}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
