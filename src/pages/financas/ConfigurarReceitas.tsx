import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2, Plus, Pencil, Trash2, ArrowLeft, ChevronRight, Search,
  GraduationCap, BookOpen, FileText, ClipboardCheck, AlertTriangle, Building2,
  Users, Banknote, TrendingDown, TrendingUp, Tag, CircleDot, X,
} from "lucide-react";
import { formatCurrency, salarios as initialSalarios, type Salary } from "@/data/financeModuleData";
import { reitorFaculties } from "@/data/institutionData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════════
   RECEITAS
   ════════════════════════════════════════════════════════════════════════ */

type TipoReceita =
  | "Propina mensal"
  | "Matrícula"
  | "Emolumento"
  | "Serviço Académico"
  | "Candidatura"
  | "Multa Estudante"
  | "Multa Administrativo"
  | "Multa Docente";

const TIPOS_RECEITA: TipoReceita[] = [
  "Propina mensal", "Matrícula", "Emolumento", "Serviço Académico", "Candidatura",
  "Multa Estudante", "Multa Administrativo", "Multa Docente",
];

interface PropinaPlan { months: number; valor: number; }

interface ReceitaRow {
  id: string;
  nome: string;
  tipo: TipoReceita;
  escopo: string;
  valor: number;
  plans?: PropinaPlan[];
}

const ALL_COURSES = reitorFaculties.flatMap(f =>
  f.courses.map(c => ({ id: c.id, code: c.code, name: c.name, facultyId: f.id, facultyName: f.name }))
);

const courseLabel = (id: string) => {
  if (id === "geral") return "Geral — todos os cursos";
  const c = ALL_COURSES.find(x => x.id === id);
  return c ? `${c.code} — ${c.name}` : id;
};

const seedPropina = (f: string) =>
  f.includes("Medicina") ? 65000 : f.includes("Arquitectura") ? 52000 : f.includes("Direito") ? 48000 : f.includes("Economia") ? 45000 : 38000;

const initialReceitas = (): ReceitaRow[] => {
  const perCurso: ReceitaRow[] = ALL_COURSES.map(c => {
    const base = seedPropina(c.facultyName);
    const plans: PropinaPlan[] = [
      { months: 10, valor: base },
      { months: 11, valor: Math.round(base * 0.92) },
      { months: 12, valor: Math.round(base * 0.85) },
    ];
    return {
      id: `prop-${c.id}`,
      nome: `Propina mensal — ${c.name}`,
      tipo: "Propina mensal" as const,
      escopo: c.id,
      valor: plans[0].valor,
      plans,
    };
  });
  const matriculas: ReceitaRow[] = reitorFaculties.map(f => ({
    id: `matr-${f.id}`,
    nome: `Matrícula — ${f.name}`,
    tipo: "Matrícula",
    escopo: "geral",
    valor: f.name.includes("Medicina") ? 35000 : (f.name.includes("Arquitectura") || f.name.includes("Direito")) ? 30000 : 25000,
  }));
  const gerais: ReceitaRow[] = [
    { id: "emo-1", nome: "Emissão de Declaração", tipo: "Emolumento", escopo: "geral", valor: 2500 },
    { id: "emo-2", nome: "Certificado de Habilitações", tipo: "Emolumento", escopo: "geral", valor: 5000 },
    { id: "emo-3", nome: "Histórico Académico", tipo: "Emolumento", escopo: "geral", valor: 3500 },
    { id: "ser-1", nome: "Requerimento de Exame Especial", tipo: "Serviço Académico", escopo: "geral", valor: 7500 },
    { id: "ser-2", nome: "Pedido de Equivalência", tipo: "Serviço Académico", escopo: "geral", valor: 12000 },
    { id: "ser-3", nome: "Reapreciação de Prova", tipo: "Serviço Académico", escopo: "geral", valor: 8000 },
    { id: "tax-1", nome: "Taxa de Inscrição em Exame", tipo: "Emolumento", escopo: "geral", valor: 3000 },
    { id: "tax-2", nome: "Taxa de Emissão de 2ª Via de Cartão", tipo: "Emolumento", escopo: "geral", valor: 2000 },
    { id: "can-1", nome: "Candidatura — Licenciatura", tipo: "Candidatura", escopo: "geral", valor: 15000 },
    { id: "can-2", nome: "Candidatura — Mestrado", tipo: "Candidatura", escopo: "geral", valor: 20000 },
    { id: "can-3", nome: "Exame de Acesso", tipo: "Candidatura", escopo: "geral", valor: 25000 },
    { id: "can-4", nome: "Curso Preparatório", tipo: "Candidatura", escopo: "geral", valor: 85000 },
    { id: "mes-1", nome: "Atraso de propina (por mês)", tipo: "Multa Estudante", escopo: "geral", valor: 5000 },
    { id: "mes-2", nome: "Falta a exame sem justificação", tipo: "Multa Estudante", escopo: "geral", valor: 7500 },
    { id: "mes-3", nome: "Extravio de cartão de estudante", tipo: "Multa Estudante", escopo: "geral", valor: 4000 },
    { id: "mes-4", nome: "Danos em equipamento académico", tipo: "Multa Estudante", escopo: "geral", valor: 15000 },
    { id: "mad-1", nome: "Atraso injustificado (por dia)", tipo: "Multa Administrativo", escopo: "geral", valor: 3500 },
    { id: "mad-2", nome: "Falta não justificada", tipo: "Multa Administrativo", escopo: "geral", valor: 12000 },
    { id: "mad-3", nome: "Quebra de protocolo institucional", tipo: "Multa Administrativo", escopo: "geral", valor: 20000 },
    { id: "mdo-1", nome: "Atraso na entrega de notas", tipo: "Multa Docente", escopo: "geral", valor: 10000 },
    { id: "mdo-2", nome: "Falta a aula sem justificação", tipo: "Multa Docente", escopo: "geral", valor: 15000 },
    { id: "mdo-3", nome: "Atraso na entrega de pauta final", tipo: "Multa Docente", escopo: "geral", valor: 18000 },
  ];
  return [...gerais, ...matriculas, ...perCurso];
};

interface SectionDef {
  key: string;
  title: string;
  description: string;
  tipos: TipoReceita[];
  defaultTipo: TipoReceita;
  icon: typeof GraduationCap;
  accent: string;
  chip: string;
}

const RECEITA_SECTIONS: SectionDef[] = [
  { key: "propinas", title: "Propinas", description: "Valor mensal por curso, organizado por faculdade.",
    tipos: ["Propina mensal"], defaultTipo: "Propina mensal",
    icon: GraduationCap, accent: "text-blue-700", chip: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "emolumentos", title: "Emolumentos", description: "Matrícula, documentos e certificados oficiais.",
    tipos: ["Emolumento", "Matrícula"], defaultTipo: "Emolumento",
    icon: FileText, accent: "text-emerald-700", chip: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "servicos", title: "Serviços Académicos", description: "Pedidos académicos pontuais.",
    tipos: ["Serviço Académico"], defaultTipo: "Serviço Académico",
    icon: BookOpen, accent: "text-violet-700", chip: "bg-violet-50 border-violet-200 text-violet-700" },
  { key: "candidatura", title: "Candidaturas", description: "Taxas de candidatura para processos de admissão.",
    tipos: ["Candidatura"], defaultTipo: "Candidatura",
    icon: ClipboardCheck, accent: "text-pink-700", chip: "bg-pink-50 border-pink-200 text-pink-700" },
  { key: "multas", title: "Multas", description: "Penalizações aplicáveis a estudantes, administrativos e docentes.",
    tipos: ["Multa Estudante", "Multa Administrativo", "Multa Docente"], defaultTipo: "Multa Estudante",
    icon: AlertTriangle, accent: "text-red-700", chip: "bg-red-50 border-red-200 text-red-700" },
];

const MULTA_SUBTYPES: { key: TipoReceita; label: string; accent: string }[] = [
  { key: "Multa Estudante", label: "Estudantes", accent: "text-red-700" },
  { key: "Multa Administrativo", label: "Administrativos", accent: "text-orange-700" },
  { key: "Multa Docente", label: "Docentes", accent: "text-amber-700" },
];

const tipoChipReceita: Record<TipoReceita, string> = {
  "Propina mensal": "bg-blue-50 text-blue-700 border-blue-200",
  "Matrícula": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Emolumento": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Serviço Académico": "bg-violet-50 text-violet-700 border-violet-200",
  "Candidatura": "bg-pink-50 text-pink-700 border-pink-200",
  "Multa Estudante": "bg-red-50 text-red-700 border-red-200",
  "Multa Administrativo": "bg-orange-50 text-orange-700 border-orange-200",
  "Multa Docente": "bg-amber-50 text-amber-700 border-amber-200",
};

/* ════════════════════════════════════════════════════════════════════════
   DESPESAS — categorias e estados definidos pelo utilizador
   ════════════════════════════════════════════════════════════════════════ */

interface DespesaRow {
  id: string;
  nome: string;
  categoria: string;
  estado: string;
  departamento: string;
  periodicidade: "mensal" | "trimestral" | "anual" | "pontual";
  valorEstimado: number;
}

const DEPARTAMENTOS = [
  "Geral", "Reitoria", "Administração", "TI", "Serviços Gerais",
  "Fac. Engenharia", "Fac. Medicina", "Fac. Direito", "Fac. Arquitectura",
  "Fac. Ciências", "Fac. Letras", "Fac. Economia",
];

const periodCls: Record<DespesaRow["periodicidade"], string> = {
  mensal: "bg-blue-50 text-blue-700 border-blue-200",
  trimestral: "bg-violet-50 text-violet-700 border-violet-200",
  anual: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pontual: "bg-slate-50 text-slate-700 border-slate-200",
};

// Deterministic colour palette indexed by string hash
const PALETTE = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-red-50 text-red-700 border-red-200",
  "bg-slate-50 text-slate-700 border-slate-200",
];
const chipFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

/* ════════════════════════════════════════════════════════════════════════
   SALÁRIOS
   ════════════════════════════════════════════════════════════════════════ */

interface SalaryMulta { id: string; nome: string; valor: number; }
interface SalaryConfig {
  baseSalary: number;
  deductionRate: number;
  multas: SalaryMulta[];
}
const seedSalaryConfig = (s: Salary): SalaryConfig => ({
  baseSalary: s.grossSalary,
  deductionRate: s.deductions / s.grossSalary,
  multas: [],
});

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */

type Mode = "receitas" | "despesas" | "salarios";

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("receitas");

  /* ── RECEITAS ── */
  const [receitas, setReceitas] = useState<ReceitaRow[]>(initialReceitas);
  const [receitaFilter, setReceitaFilter] = useState<string>("todos");
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [multaSubtype, setMultaSubtype] = useState<TipoReceita>("Multa Estudante");

  const [openReceitaSection, setOpenReceitaSection] = useState<SectionDef | null>(null);
  const [editingReceita, setEditingReceita] = useState<ReceitaRow | null>(null);
  const [receitaForm, setReceitaForm] = useState<ReceitaRow>({ id: "", nome: "", tipo: "Emolumento", escopo: "geral", valor: 0 });
  const [confirmDelReceita, setConfirmDelReceita] = useState<ReceitaRow | null>(null);
  const [inlineEditPlan, setInlineEditPlan] = useState<{ rowId: string; months: number; valor: string } | null>(null);

  /* ── DESPESAS ── */
  const [despesas, setDespesas] = useState<DespesaRow[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>(["Activo", "Em revisão", "Suspensa"]);
  const [despesaCatFilter, setDespesaCatFilter] = useState<string>("todos");
  const [despesaEstadoFilter, setDespesaEstadoFilter] = useState<string>("todos");
  const [despesaSearch, setDespesaSearch] = useState("");

  const [editingDespesa, setEditingDespesa] = useState<DespesaRow | null>(null);
  const [openDespesaDialog, setOpenDespesaDialog] = useState(false);
  const [despesaForm, setDespesaForm] = useState<DespesaRow>({
    id: "", nome: "", categoria: "", estado: "", departamento: "Geral", periodicidade: "mensal", valorEstimado: 0,
  });
  const [confirmDelDespesa, setConfirmDelDespesa] = useState<DespesaRow | null>(null);
  const [newCategoria, setNewCategoria] = useState("");
  const [newEstado, setNewEstado] = useState("");

  /* ── SALÁRIOS ── */
  const [salaries, setSalaries] = useState<Salary[]>(initialSalarios);
  const [salaryConfigs, setSalaryConfigs] = useState<Record<string, SalaryConfig>>(() => {
    const map: Record<string, SalaryConfig> = {};
    for (const s of initialSalarios) map[s.id] = seedSalaryConfig(s);
    return map;
  });
  const [salaryDeptFilter, setSalaryDeptFilter] = useState<string>("todos");
  const [salarySearch, setSalarySearch] = useState("");
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [salaryForm, setSalaryForm] = useState<SalaryConfig>({ baseSalary: 0, deductionRate: 0.14, multas: [] });
  const [newMulta, setNewMulta] = useState<{ nome: string; valor: string }>({ nome: "", valor: "" });
  const [confirmDelSalary, setConfirmDelSalary] = useState<Salary | null>(null);
  const [openNewSalary, setOpenNewSalary] = useState(false);
  const [newSalaryForm, setNewSalaryForm] = useState({
    name: "", employeeId: "", role: "", department: "Administração", grossSalary: 0,
  });

  /* ── derived ── */
  const receitasBySection = useMemo(() => {
    const map: Record<string, ReceitaRow[]> = {};
    for (const s of RECEITA_SECTIONS) map[s.key] = receitas.filter(r => s.tipos.includes(r.tipo));
    return map;
  }, [receitas]);

  const facultyStats = useMemo(() => {
    return reitorFaculties.map(f => {
      const courseIds = new Set(f.courses.map(c => c.id));
      const propinas = receitas.filter(r => r.tipo === "Propina mensal" && courseIds.has(r.escopo));
      const avg = propinas.length ? Math.round(propinas.reduce((s, r) => s + r.valor, 0) / propinas.length) : 0;
      const min = propinas.length ? Math.min(...propinas.map(r => r.valor)) : 0;
      const max = propinas.length ? Math.max(...propinas.map(r => r.valor)) : 0;
      return { id: f.id, name: f.name, courseCount: f.courses.length, avg, min, max };
    });
  }, [receitas]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter(d => {
      if (despesaCatFilter !== "todos" && d.categoria !== despesaCatFilter) return false;
      if (despesaEstadoFilter !== "todos" && d.estado !== despesaEstadoFilter) return false;
      if (despesaSearch) {
        const q = despesaSearch.toLowerCase();
        if (!d.nome.toLowerCase().includes(q) && !d.departamento.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [despesas, despesaCatFilter, despesaEstadoFilter, despesaSearch]);

  const salaryList = useMemo(() => {
    return salaries.filter(s => {
      if (salaryDeptFilter !== "todos" && s.department !== salaryDeptFilter) return false;
      if (salarySearch) {
        const q = salarySearch.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.role.toLowerCase().includes(q) && !s.employeeId.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [salaries, salaryDeptFilter, salarySearch]);

  /* ── RECEITAS ops ── */
  const openNewReceita = (s: SectionDef) => {
    setOpenReceitaSection(s);
    setEditingReceita(null);
    const defaultTipo = s.key === "multas" ? multaSubtype : s.defaultTipo;
    setReceitaForm({ id: "", nome: "", tipo: defaultTipo, escopo: "geral", valor: 0 });
  };
  const openEditReceita = (s: SectionDef, r: ReceitaRow) => {
    setOpenReceitaSection(s);
    setEditingReceita(r);
    setReceitaForm({ ...r });
  };
  const closeReceita = () => { setOpenReceitaSection(null); setEditingReceita(null); };
  const saveReceita = () => {
    if (!receitaForm.nome.trim() || receitaForm.valor < 0) {
      toast({ title: "Dados incompletos", variant: "destructive" });
      return;
    }
    if (editingReceita) {
      setReceitas(rs => rs.map(r => r.id === editingReceita.id ? { ...receitaForm, id: editingReceita.id } : r));
      toast({ title: "Receita actualizada", description: receitaForm.nome });
    } else {
      setReceitas(rs => [{ ...receitaForm, id: `r-${Date.now()}` }, ...rs]);
      toast({ title: "Receita criada", description: receitaForm.nome });
    }
    closeReceita();
  };
  const removeReceita = () => {
    if (!confirmDelReceita) return;
    setReceitas(rs => rs.filter(r => r.id !== confirmDelReceita.id));
    toast({ title: "Receita removida", description: confirmDelReceita.nome });
    setConfirmDelReceita(null);
  };
  const commitInlinePlan = () => {
    if (!inlineEditPlan) return;
    const v = Number(inlineEditPlan.valor) || 0;
    setReceitas(rs => rs.map(r => {
      if (r.id !== inlineEditPlan.rowId || !r.plans) return r;
      const plans = r.plans.map(p => p.months === inlineEditPlan.months ? { ...p, valor: v } : p);
      return { ...r, plans, valor: plans[0].valor };
    }));
    setInlineEditPlan(null);
  };
  const addPlanToRow = (rowId: string, months: number) => {
    setReceitas(rs => rs.map(r => {
      if (r.id !== rowId) return r;
      const plans = r.plans ? [...r.plans] : [];
      if (plans.some(p => p.months === months)) return r;
      plans.push({ months, valor: 0 });
      plans.sort((a, b) => a.months - b.months);
      return { ...r, plans, valor: plans[0].valor };
    }));
  };
  const removePlanFromRow = (rowId: string, months: number) => {
    setReceitas(rs => rs.map(r => {
      if (r.id !== rowId || !r.plans || r.plans.length <= 1) return r;
      const plans = r.plans.filter(p => p.months !== months);
      return { ...r, plans, valor: plans[0].valor };
    }));
  };

  /* ── DESPESAS ops ── */
  const openNewDespesa = () => {
    if (categorias.length === 0) {
      toast({ title: "Crie primeiro uma categoria", description: "Defina pelo menos uma categoria antes de adicionar uma despesa.", variant: "destructive" });
      return;
    }
    setEditingDespesa(null);
    setDespesaForm({
      id: "", nome: "",
      categoria: categorias[0],
      estado: estados[0] ?? "",
      departamento: "Geral", periodicidade: "mensal", valorEstimado: 0,
    });
    setOpenDespesaDialog(true);
  };
  const openEditDespesa = (d: DespesaRow) => {
    setEditingDespesa(d);
    setDespesaForm({ ...d });
    setOpenDespesaDialog(true);
  };
  const closeDespesa = () => { setOpenDespesaDialog(false); setEditingDespesa(null); };
  const saveDespesa = () => {
    if (!despesaForm.nome.trim() || !despesaForm.categoria || !despesaForm.estado || despesaForm.valorEstimado < 0) {
      toast({ title: "Dados incompletos", description: "Preencha designação, categoria e estado.", variant: "destructive" });
      return;
    }
    if (editingDespesa) {
      setDespesas(ds => ds.map(d => d.id === editingDespesa.id ? { ...despesaForm, id: editingDespesa.id } : d));
      toast({ title: "Despesa actualizada", description: despesaForm.nome });
    } else {
      setDespesas(ds => [{ ...despesaForm, id: `dx-${Date.now()}` }, ...ds]);
      toast({ title: "Despesa criada", description: despesaForm.nome });
    }
    closeDespesa();
  };
  const removeDespesa = () => {
    if (!confirmDelDespesa) return;
    setDespesas(ds => ds.filter(d => d.id !== confirmDelDespesa.id));
    toast({ title: "Despesa removida", description: confirmDelDespesa.nome });
    setConfirmDelDespesa(null);
  };
  const addCategoria = () => {
    const v = newCategoria.trim();
    if (!v) return;
    if (categorias.includes(v)) { toast({ title: "Categoria já existe", variant: "destructive" }); return; }
    setCategorias(cs => [...cs, v]);
    setNewCategoria("");
  };
  const removeCategoria = (c: string) => {
    if (despesas.some(d => d.categoria === c)) {
      toast({ title: "Categoria em uso", description: "Remova primeiro as despesas que a usam.", variant: "destructive" });
      return;
    }
    setCategorias(cs => cs.filter(x => x !== c));
    if (despesaCatFilter === c) setDespesaCatFilter("todos");
  };
  const addEstado = () => {
    const v = newEstado.trim();
    if (!v) return;
    if (estados.includes(v)) { toast({ title: "Estado já existe", variant: "destructive" }); return; }
    setEstados(es => [...es, v]);
    setNewEstado("");
  };
  const removeEstado = (e: string) => {
    if (despesas.some(d => d.estado === e)) {
      toast({ title: "Estado em uso", description: "Remova primeiro as despesas que o usam.", variant: "destructive" });
      return;
    }
    setEstados(es => es.filter(x => x !== e));
    if (despesaEstadoFilter === e) setDespesaEstadoFilter("todos");
  };

  /* ── SALÁRIOS ops ── */
  const openEditSalary = (s: Salary) => {
    setEditingSalary(s);
    setSalaryForm({ ...salaryConfigs[s.id] });
    setNewMulta({ nome: "", valor: "" });
  };
  const closeSalary = () => setEditingSalary(null);
  const saveSalary = () => {
    if (!editingSalary) return;
    setSalaryConfigs(c => ({ ...c, [editingSalary.id]: { ...salaryForm } }));
    toast({ title: "Salário actualizado", description: editingSalary.name });
    closeSalary();
  };
  const addMulta = () => {
    if (!newMulta.nome.trim()) return;
    const valor = Number(newMulta.valor) || 0;
    setSalaryForm(f => ({ ...f, multas: [...f.multas, { id: `m-${Date.now()}`, nome: newMulta.nome.trim(), valor }] }));
    setNewMulta({ nome: "", valor: "" });
  };
  const removeMulta = (id: string) => setSalaryForm(f => ({ ...f, multas: f.multas.filter(m => m.id !== id) }));

  const computeNet = (c: SalaryConfig) => {
    const deductions = Math.round(c.baseSalary * c.deductionRate);
    const multasTotal = c.multas.reduce((s, m) => s + m.valor, 0);
    return c.baseSalary - deductions - multasTotal;
  };

  const saveNewSalary = () => {
    if (!newSalaryForm.name.trim() || !newSalaryForm.role.trim() || newSalaryForm.grossSalary <= 0) {
      toast({ title: "Dados incompletos", description: "Preencha nome, posição e salário bruto.", variant: "destructive" });
      return;
    }
    const id = `sal-${Date.now()}`;
    const empId = newSalaryForm.employeeId.trim() || `EMP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const deductionRate = 0.14;
    const deductions = Math.round(newSalaryForm.grossSalary * deductionRate);
    const newSal: Salary = {
      id,
      employeeId: empId,
      name: newSalaryForm.name.trim(),
      role: newSalaryForm.role.trim(),
      department: newSalaryForm.department,
      contractType: "efectivo",
      grossSalary: newSalaryForm.grossSalary,
      netSalary: newSalaryForm.grossSalary - deductions,
      deductions,
      status: "pendente",
      payDate: new Date().toISOString().slice(0, 10),
    };
    setSalaries(ss => [newSal, ...ss]);
    setSalaryConfigs(c => ({ ...c, [id]: { baseSalary: newSalaryForm.grossSalary, deductionRate, multas: [] } }));
    toast({ title: "Colaborador adicionado", description: newSal.name });
    setOpenNewSalary(false);
    setNewSalaryForm({ name: "", employeeId: "", role: "", department: "Administração", grossSalary: 0 });
  };
  const confirmRemoveSalary = () => {
    if (!confirmDelSalary) return;
    setSalaries(ss => ss.filter(s => s.id !== confirmDelSalary.id));
    setSalaryConfigs(c => { const n = { ...c }; delete n[confirmDelSalary.id]; return n; });
    toast({ title: "Colaborador removido", description: confirmDelSalary.name });
    setConfirmDelSalary(null);
  };

  const visibleReceitaSections = receitaFilter === "todos" ? RECEITA_SECTIONS : RECEITA_SECTIONS.filter(s => s.key === receitaFilter);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => navigate("/financas/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" /> Configurador Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Gere receitas, despesas e salários da instituição num único painel.
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { key: "receitas" as const, label: "Receitas", sub: "Propinas, emolumentos, multas",   icon: TrendingUp,   accent: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          { key: "despesas" as const, label: "Despesas", sub: "Rubricas e categorias customizadas", icon: TrendingDown, accent: "text-red-700",     bg: "bg-red-50",     border: "border-red-200" },
          { key: "salarios" as const, label: "Salários", sub: "Folha salarial de colaboradores", icon: Banknote,     accent: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
        ]).map(m => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                active
                  ? `${m.bg} ${m.border} ring-2 ring-offset-1 ring-primary/20 shadow-sm`
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", m.bg, m.accent)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", active ? m.accent : "text-foreground")}>{m.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{m.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ════════════════ RECEITAS ════════════════ */}
      {mode === "receitas" && (
        <>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit flex-wrap">
            {([{ key: "todos", label: "Todos" }, ...RECEITA_SECTIONS.map(s => ({ key: s.key, label: s.title }))]).map(b => (
              <Button key={b.key} variant="ghost" size="sm"
                onClick={() => { setReceitaFilter(b.key); setSelectedFaculty(null); }}
                className={cn("text-xs h-7 px-3 rounded-md",
                  receitaFilter === b.key ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                )}>
                {b.label}
              </Button>
            ))}
          </div>

          {visibleReceitaSections.map(section => {
            const items = receitasBySection[section.key];
            const Icon = section.icon;

            if (section.key === "propinas") {
              const selected = selectedFaculty ? reitorFaculties.find(f => f.id === selectedFaculty) : null;
              return (
                <Card key={section.key} className="p-5">
                  <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={cn("w-4 h-4", section.accent)} />
                      <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                      <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length} cursos</span>
                      <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
                    </div>
                    {selected && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setSelectedFaculty(null)}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Faculdades
                      </Button>
                    )}
                  </div>

                  {!selected ? (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {facultyStats.map(f => (
                        <button key={f.id} onClick={() => setSelectedFaculty(f.id)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition text-left group">
                          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                            <p className="text-[11px] text-muted-foreground">{f.courseCount} cursos · {formatCurrency(f.min)} – {formatCurrency(f.max)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média</p>
                            <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(f.avg)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      <div className="pb-3 mb-1">
                        <p className="text-xs text-muted-foreground">Faculdade</p>
                        <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                      </div>
                      {selected.courses.map(c => {
                        const r = receitas.find(x => x.tipo === "Propina mensal" && x.escopo === c.id);
                        if (!r) return null;
                        const plans = r.plans ?? [{ months: 10, valor: r.valor }];
                        const existingMonths = new Set(plans.map(p => p.months));
                        const availableToAdd = [10, 11, 12].filter(m => !existingMonths.has(m));
                        return (
                          <div key={c.id} className="py-3 group">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                <p className="text-[11px] text-muted-foreground">{c.code} · Planos de pagamento da propina mensal</p>
                              </div>
                              {availableToAdd.length > 0 && (
                                <Select onValueChange={(v) => addPlanToRow(r.id, Number(v))}>
                                  <SelectTrigger className="h-7 w-[130px] text-[11px]">
                                    <Plus className="w-3 h-3 mr-1" /> <SelectValue placeholder="Add prazo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableToAdd.map(m => (
                                      <SelectItem key={m} value={String(m)}>{m} meses</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {plans.map(p => {
                                const editingInline = inlineEditPlan?.rowId === r.id && inlineEditPlan?.months === p.months;
                                return (
                                  <div key={p.months}
                                    className="rounded-md border border-border bg-card px-3 py-2 flex items-center justify-between gap-2 hover:border-primary/40 transition">
                                    <div className="min-w-0">
                                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Prazo</p>
                                      <p className="text-xs font-semibold text-foreground">{p.months} meses</p>
                                    </div>
                                    {editingInline ? (
                                      <div className="flex items-center gap-1">
                                        <Input type="number" autoFocus value={inlineEditPlan!.valor}
                                          onChange={e => setInlineEditPlan({ ...inlineEditPlan!, valor: e.target.value })}
                                          onKeyDown={e => { if (e.key === "Enter") commitInlinePlan(); if (e.key === "Escape") setInlineEditPlan(null); }}
                                          className="h-7 w-24 text-xs text-right tabular-nums" />
                                        <Button size="sm" className="h-7 px-2 text-[11px]" onClick={commitInlinePlan}>OK</Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={() => setInlineEditPlan({ rowId: r.id, months: p.months, valor: String(p.valor) })}
                                          className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap px-2 py-1 rounded hover:bg-muted transition"
                                          title="Clique para editar valor mensal">
                                          {formatCurrency(p.valor)}
                                        </button>
                                        {plans.length > 1 && (
                                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-destructive opacity-50 hover:opacity-100"
                                            onClick={() => removePlanFromRow(r.id, p.months)} title="Remover prazo">
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            }

            // Multas section — single card with internal subtype toggle
            if (section.key === "multas") {
              const filtered = items.filter(r => r.tipo === multaSubtype);
              return (
                <Card key={section.key} className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={cn("w-4 h-4", section.accent)} />
                      <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                      <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length} no total</span>
                      <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => openNewReceita(section)}>
                      <Plus className="w-3.5 h-3.5" /> Nova multa
                    </Button>
                  </div>

                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit mb-4">
                    {MULTA_SUBTYPES.map(sub => {
                      const count = items.filter(r => r.tipo === sub.key).length;
                      const active = multaSubtype === sub.key;
                      return (
                        <Button key={sub.key} variant="ghost" size="sm"
                          onClick={() => setMultaSubtype(sub.key)}
                          className={cn("text-xs h-7 px-3 rounded-md gap-1.5",
                            active ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                          )}>
                          {sub.label}
                          <span className={cn("inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] tabular-nums",
                            active ? "bg-muted text-foreground" : "bg-background text-muted-foreground")}>{count}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-3">Sem multas configuradas para esta categoria.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {filtered.map(r => (
                        <div key={r.id} role="button" tabIndex={0}
                          onClick={() => openEditReceita(section, r)}
                          onKeyDown={(e) => { if (e.key === "Enter") openEditReceita(section, r); }}
                          className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md cursor-pointer hover:bg-muted/50 transition group"
                          title="Clique para editar">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.nome}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tipoChipReceita[r.tipo])}>
                                {r.tipo}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">{formatCurrency(r.valor)}</span>
                          <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={(e) => { e.stopPropagation(); openEditReceita(section, r); }} title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); setConfirmDelReceita(r); }} title="Remover">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            }

            return (
              <Card key={section.key} className="p-5">
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={cn("w-4 h-4", section.accent)} />
                    <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                    <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length}</span>
                    <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => openNewReceita(section)}>
                    <Plus className="w-3.5 h-3.5" /> Novo
                  </Button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3">Sem itens configurados.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {items.map(r => (
                      <div key={r.id} role="button" tabIndex={0}
                        onClick={() => openEditReceita(section, r)}
                        onKeyDown={(e) => { if (e.key === "Enter") openEditReceita(section, r); }}
                        className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md cursor-pointer hover:bg-muted/50 transition group"
                        title="Clique para editar">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.nome}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tipoChipReceita[r.tipo])}>
                              {r.tipo}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">{courseLabel(r.escopo)}</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">{formatCurrency(r.valor)}</span>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={(e) => { e.stopPropagation(); openEditReceita(section, r); }} title="Editar">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); setConfirmDelReceita(r); }} title="Remover">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* ════════════════ DESPESAS ════════════════ */}
      {mode === "despesas" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-semibold text-foreground">Despesas</h2>
              <span className="text-[11px] text-muted-foreground tabular-nums">· {filteredDespesas.length} de {despesas.length}</span>
              {despesas.length > 0 && (
                <span className="text-xs text-muted-foreground hidden md:inline">
                  — Total filtrado: <span className="font-semibold text-foreground tabular-nums">{formatCurrency(filteredDespesas.reduce((s, d) => s + d.valorEstimado, 0))}</span>
                </span>
              )}
            </div>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={openNewDespesa}>
              <Plus className="w-3.5 h-3.5" /> Nova despesa
            </Button>
          </div>

          {/* Configurador de categorias e estados */}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {/* Categorias */}
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Categorias
                </p>
                <span className="text-[10px] text-muted-foreground tabular-nums">{categorias.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {categorias.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">Crie categorias para classificar as despesas.</span>
                ) : categorias.map(c => (
                  <span key={c} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", chipFor(c))}>
                    {c}
                    <button onClick={() => removeCategoria(c)} className="hover:bg-black/10 rounded-full" title="Remover categoria">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input value={newCategoria} onChange={e => setNewCategoria(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCategoria(); }}
                  placeholder="Nova categoria" className="h-7 text-xs" />
                <Button size="sm" variant="outline" className="h-7 px-2 gap-1 text-[11px]" onClick={addCategoria}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
            </div>

            {/* Estados */}
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5 text-muted-foreground" /> Estados
                </p>
                <span className="text-[10px] text-muted-foreground tabular-nums">{estados.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {estados.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground italic">Crie estados (ex.: Activo, Suspensa).</span>
                ) : estados.map(e => (
                  <span key={e} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", chipFor(e))}>
                    {e}
                    <button onClick={() => removeEstado(e)} className="hover:bg-black/10 rounded-full" title="Remover estado">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input value={newEstado} onChange={e => setNewEstado(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addEstado(); }}
                  placeholder="Novo estado" className="h-7 text-xs" />
                <Button size="sm" variant="outline" className="h-7 px-2 gap-1 text-[11px]" onClick={addEstado}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={despesaSearch} onChange={e => setDespesaSearch(e.target.value)}
                placeholder="Procurar..." className="h-8 text-xs pl-8 w-[200px]" />
            </div>
            <Select value={despesaCatFilter} onValueChange={setDespesaCatFilter}>
              <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={despesaEstadoFilter} onValueChange={setDespesaEstadoFilter}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                {estados.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {despesas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">Sem despesas configuradas.</p>
              <p className="text-[11px] text-muted-foreground mt-1">Comece por criar categorias e estados, depois adicione despesas.</p>
            </div>
          ) : filteredDespesas.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">Nenhuma despesa corresponde aos filtros.</p>
          ) : (
            <div className="divide-y divide-border">
              {filteredDespesas.map(d => (
                <div key={d.id} role="button" tabIndex={0}
                  onClick={() => openEditDespesa(d)}
                  onKeyDown={(e) => { if (e.key === "Enter") openEditDespesa(d); }}
                  className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md cursor-pointer hover:bg-muted/50 transition group"
                  title="Clique para editar">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", chipFor(d.categoria))}>
                        {d.categoria}
                      </span>
                      <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", chipFor(d.estado))}>
                        {d.estado}
                      </span>
                      <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize", periodCls[d.periodicidade])}>
                        {d.periodicidade}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">{d.departamento}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">{formatCurrency(d.valorEstimado)}</span>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={(e) => { e.stopPropagation(); openEditDespesa(d); }} title="Editar">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelDespesa(d); }} title="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ════════════════ SALÁRIOS ════════════════ */}
      {mode === "salarios" && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Banknote className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-semibold text-foreground">Folha Salarial</h2>
              <span className="text-[11px] text-muted-foreground tabular-nums">· {salaryList.length} de {salaries.length}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={salarySearch} onChange={e => setSalarySearch(e.target.value)}
                  placeholder="Procurar..." className="h-8 text-xs pl-8 w-[200px]" />
              </div>
              <Select value={salaryDeptFilter} onValueChange={setSalaryDeptFilter}>
                <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os departamentos</SelectItem>
                  {Array.from(new Set(salaries.map(s => s.department))).map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpenNewSalary(true)}>
                <Plus className="w-3.5 h-3.5" /> Novo colaborador
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left font-semibold px-2 py-2">Colaborador</th>
                  <th className="text-left font-semibold px-2 py-2">Posição</th>
                  <th className="text-left font-semibold px-2 py-2">Departamento</th>
                  <th className="text-right font-semibold px-2 py-2">Salário Bruto</th>
                  <th className="text-right font-semibold px-2 py-2">Salário Líquido</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {salaryList.map(s => {
                  const cfg = salaryConfigs[s.id];
                  if (!cfg) return null;
                  const deductions = Math.round(cfg.baseSalary * cfg.deductionRate);
                  const multasTotal = cfg.multas.reduce((sum, m) => sum + m.valor, 0);
                  const net = cfg.baseSalary - deductions - multasTotal;
                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer group"
                      onClick={() => openEditSalary(s)}>
                      <td className="px-2 py-2.5">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{s.employeeId}</p>
                      </td>
                      <td className="px-2 py-2.5">
                        <p className="text-xs text-foreground truncate">{s.role}</p>
                      </td>
                      <td className="px-2 py-2.5">
                        <p className="text-xs text-foreground truncate">{s.department}</p>
                      </td>
                      <td className="px-2 py-2.5 text-right text-sm tabular-nums text-foreground">{formatCurrency(cfg.baseSalary)}</td>
                      <td className="px-2 py-2.5 text-right text-sm font-semibold tabular-nums text-blue-700">{formatCurrency(net)}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-0.5 justify-end opacity-60 group-hover:opacity-100 transition">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditSalary(s); }} title="Editar">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setConfirmDelSalary(s); }} title="Remover">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {salaryList.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">Nenhum colaborador encontrado.</p>
            )}
          </div>
        </Card>
      )}

      {/* ═══════ Receita dialog ═══════ */}
      <Dialog open={!!openReceitaSection} onOpenChange={(o) => !o && closeReceita()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReceita ? "Editar item" : `Novo item — ${openReceitaSection?.title ?? ""}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designação</label>
              <Input value={receitaForm.nome} onChange={e => setReceitaForm({ ...receitaForm, nome: e.target.value })} placeholder="Ex.: Certificado de Habilitações" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={receitaForm.tipo} onValueChange={(v: TipoReceita) => setReceitaForm({ ...receitaForm, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(openReceitaSection?.tipos ?? TIPOS_RECEITA).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor (Kz)</label>
                <Input type="number" min={0} value={receitaForm.valor}
                  onChange={e => setReceitaForm({ ...receitaForm, valor: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Aplica-se a</label>
              <Select value={receitaForm.escopo} onValueChange={v => setReceitaForm({ ...receitaForm, escopo: v })}>
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
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveReceita}>{editingReceita ? "Guardar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelReceita} onOpenChange={(o) => !o && setConfirmDelReceita(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remover item?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmDelReceita?.nome}. Esta acção não pode ser desfeita.</p>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={removeReceita}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Despesa dialog ═══════ */}
      <Dialog open={openDespesaDialog} onOpenChange={(o) => !o && closeDespesa()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDespesa ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Designação</label>
              <Input value={despesaForm.nome} onChange={e => setDespesaForm({ ...despesaForm, nome: e.target.value })} placeholder="Ex.: Manutenção de Edifícios" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <Select value={despesaForm.categoria} onValueChange={v => setDespesaForm({ ...despesaForm, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <Select value={despesaForm.estado} onValueChange={v => setDespesaForm({ ...despesaForm, estado: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {estados.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Periodicidade</label>
                <Select value={despesaForm.periodicidade} onValueChange={(v: DespesaRow["periodicidade"]) => setDespesaForm({ ...despesaForm, periodicidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="pontual">Pontual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor estimado (Kz)</label>
                <Input type="number" min={0} value={despesaForm.valorEstimado}
                  onChange={e => setDespesaForm({ ...despesaForm, valorEstimado: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Departamento</label>
              <Select value={despesaForm.departamento} onValueChange={v => setDespesaForm({ ...despesaForm, departamento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {DEPARTAMENTOS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveDespesa}>{editingDespesa ? "Guardar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelDespesa} onOpenChange={(o) => !o && setConfirmDelDespesa(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remover despesa?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmDelDespesa?.nome}. Esta acção não pode ser desfeita.</p>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={removeDespesa}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Salary edit dialog ═══════ */}
      <Dialog open={!!editingSalary} onOpenChange={(o) => !o && closeSalary()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-blue-700" />
              {editingSalary?.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">{editingSalary?.role} · {editingSalary?.department} · {editingSalary?.employeeId}</p>
          </DialogHeader>
          {editingSalary && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Salário Bruto (Kz)</label>
                  <Input type="number" min={0} value={salaryForm.baseSalary}
                    onChange={e => setSalaryForm({ ...salaryForm, baseSalary: Number(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Desconto IRT/SS (%)</label>
                  <Input type="number" min={0} max={100} step={0.5}
                    value={(salaryForm.deductionRate * 100).toFixed(1)}
                    onChange={e => setSalaryForm({ ...salaryForm, deductionRate: (Number(e.target.value) || 0) / 100 })} />
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                    Multas / Descontos adicionais
                  </p>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{salaryForm.multas.length} item(s)</span>
                </div>

                {salaryForm.multas.length > 0 && (
                  <div className="divide-y divide-border">
                    {salaryForm.multas.map(m => (
                      <div key={m.id} className="flex items-center gap-2 py-1.5">
                        <p className="text-xs text-foreground flex-1 truncate">{m.nome}</p>
                        <span className="text-xs font-semibold tabular-nums text-orange-600">−{formatCurrency(m.valor)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeMulta(m.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Input placeholder="Designação da multa" value={newMulta.nome}
                    onChange={e => setNewMulta({ ...newMulta, nome: e.target.value })}
                    className="h-8 text-xs flex-1" />
                  <Input type="number" placeholder="Kz" value={newMulta.valor}
                    onChange={e => setNewMulta({ ...newMulta, valor: e.target.value })}
                    className="h-8 text-xs w-28 text-right tabular-nums" />
                  <Button size="sm" className="h-8 gap-1" onClick={addMulta}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Bruto</span>
                  <span className="font-medium tabular-nums">{formatCurrency(salaryForm.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Descontos ({(salaryForm.deductionRate * 100).toFixed(1)}%)</span>
                  <span className="font-medium tabular-nums text-red-600">−{formatCurrency(Math.round(salaryForm.baseSalary * salaryForm.deductionRate))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Multas</span>
                  <span className="font-medium tabular-nums text-orange-600">−{formatCurrency(salaryForm.multas.reduce((s, m) => s + m.valor, 0))}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold">Líquido a receber</span>
                  <span className="text-sm font-bold tabular-nums text-blue-700">{formatCurrency(computeNet(salaryForm))}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveSalary}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Novo colaborador dialog ═══════ */}
      <Dialog open={openNewSalary} onOpenChange={setOpenNewSalary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-700" /> Novo colaborador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
                <Input value={newSalaryForm.name} onChange={e => setNewSalaryForm({ ...newSalaryForm, name: e.target.value })} placeholder="Ex.: João Silva" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nº de colaborador</label>
                <Input value={newSalaryForm.employeeId} onChange={e => setNewSalaryForm({ ...newSalaryForm, employeeId: e.target.value })} placeholder="auto se vazio" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Posição</label>
                <Input value={newSalaryForm.role} onChange={e => setNewSalaryForm({ ...newSalaryForm, role: e.target.value })} placeholder="Ex.: Professor Auxiliar" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Departamento</label>
                <Select value={newSalaryForm.department} onValueChange={v => setNewSalaryForm({ ...newSalaryForm, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {Array.from(new Set([...DEPARTAMENTOS, ...salaries.map(s => s.department)])).map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Salário Bruto (Kz)</label>
              <Input type="number" min={0} value={newSalaryForm.grossSalary}
                onChange={e => setNewSalaryForm({ ...newSalaryForm, grossSalary: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveNewSalary}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelSalary} onOpenChange={(o) => !o && setConfirmDelSalary(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remover colaborador?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmDelSalary?.name} ({confirmDelSalary?.role}). Esta acção não pode ser desfeita.</p>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={confirmRemoveSalary}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* unused-import guard */}
      <span className="hidden"><Popover><PopoverTrigger /><PopoverContent /></Popover><Users /></span>
    </div>
  );
}
