import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
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
  CalendarDays, Clock, Briefcase, UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

interface PropinaPlan { months: number; valor: number; imposto?: number; }

interface ReceitaRow {
  id: string;
  nome: string;
  tipo: TipoReceita;
  escopo: string;
  valor: number;          // valor bruto
  imposto?: number;       // taxa de imposto (0-1), default 0.14
  plans?: PropinaPlan[];
}

const DEFAULT_IMPOSTO = 0.14;
const liquidoOf = (bruto: number, imposto?: number) =>
  Math.round(bruto * (1 - (imposto ?? DEFAULT_IMPOSTO)));

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

const MULTA_SUBTYPES: {
  key: TipoReceita; label: string; icon: LucideIcon;
  ring: string; iconBg: string; iconColor: string; chip: string; bar: string;
}[] = [
  { key: "Multa Estudante",       label: "Estudantes",      icon: GraduationCap,
    ring: "ring-red-500 border-red-200 bg-red-50/40",       iconBg: "bg-red-100",     iconColor: "text-red-700",     chip: "bg-red-100 text-red-700",     bar: "bg-red-500" },
  { key: "Multa Administrativo",  label: "Administrativos", icon: Briefcase,
    ring: "ring-orange-500 border-orange-200 bg-orange-50/40", iconBg: "bg-orange-100", iconColor: "text-orange-700", chip: "bg-orange-100 text-orange-700", bar: "bg-orange-500" },
  { key: "Multa Docente",         label: "Docentes",        icon: UserCog,
    ring: "ring-amber-500 border-amber-200 bg-amber-50/40", iconBg: "bg-amber-100",   iconColor: "text-amber-700",   chip: "bg-amber-100 text-amber-700",   bar: "bg-amber-500" },
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

interface ResponsavelItem { id: string; nome: string; cargo: string; }
interface DestinatarioMap { categoria: string; destinatario: string; }
interface ApprovalRule { id: string; min: number; max: number; responsavelId: string; }
interface CategoriaItem { id: string; label: string; color: string; }
interface EstadoItem { id: string; label: string; color: string; }

const CAT_PALETTE: { name: string; cls: string; dot: string }[] = [
  { name: "Azul",     cls: "bg-blue-50 text-blue-700 border-blue-200",         dot: "bg-blue-500" },
  { name: "Verde",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { name: "Violeta",  cls: "bg-violet-50 text-violet-700 border-violet-200",   dot: "bg-violet-500" },
  { name: "Âmbar",    cls: "bg-amber-50 text-amber-700 border-amber-200",      dot: "bg-amber-500" },
  { name: "Rosa",     cls: "bg-pink-50 text-pink-700 border-pink-200",         dot: "bg-pink-500" },
  { name: "Turquesa", cls: "bg-teal-50 text-teal-700 border-teal-200",         dot: "bg-teal-500" },
  { name: "Índigo",   cls: "bg-indigo-50 text-indigo-700 border-indigo-200",   dot: "bg-indigo-500" },
  { name: "Laranja",  cls: "bg-orange-50 text-orange-700 border-orange-200",   dot: "bg-orange-500" },
  { name: "Vermelho", cls: "bg-red-50 text-red-700 border-red-200",            dot: "bg-red-500" },
  { name: "Cinzento", cls: "bg-slate-50 text-slate-700 border-slate-200",      dot: "bg-slate-500" },
];

const INITIAL_CATEGORIAS: CategoriaItem[] = [
  { id: "cat-sal",  label: "Salários",                color: CAT_PALETTE[0].cls },
  { id: "cat-aca",  label: "Académico",               color: CAT_PALETTE[1].cls },
  { id: "cat-man",  label: "Manutenção & Logística",  color: CAT_PALETTE[7].cls },
  { id: "cat-eve",  label: "Eventos",                 color: CAT_PALETTE[2].cls },
  { id: "cat-ser",  label: "Serviços",                color: CAT_PALETTE[6].cls },
  { id: "cat-bol",  label: "Bolsas & Apoios",         color: CAT_PALETTE[4].cls },
];

const DEPARTAMENTOS = [
  "Geral", "Reitoria", "Administração", "Docentes", "TI", "Serviços Gerais",
  "Fac. Engenharia", "Fac. Medicina", "Fac. Direito", "Fac. Arquitectura",
  "Fac. Ciências", "Fac. Letras", "Fac. Economia",
];

const INITIAL_RESPONSAVEIS: ResponsavelItem[] = [
  { id: "resp-1", nome: "Dra. Catarina Lopes", cargo: "Diretora Financeira" },
  { id: "resp-2", nome: "Dra. Lúcia Mateus", cargo: "Tesoureira" },
  { id: "resp-3", nome: "Sr. Adriano Paka", cargo: "Cobranças" },
  { id: "resp-4", nome: "Reitor — Pe. José Manuel", cargo: "Aprovação Institucional" },
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
  irtRate: number;
  ssRate: number;
  multas: SalaryMulta[];
}
const seedSalaryConfig = (s: Salary): SalaryConfig => {
  // Decompose existing deductions into IRT + SS aproximação (default 8% + 3%)
  const total = s.deductions / s.grossSalary;
  const ssRate = Math.min(0.03, total);
  const irtRate = Math.max(0, total - ssRate);
  return { baseSalary: s.grossSalary, irtRate, ssRate, multas: [] };
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */

type Mode = "receitas" | "despesas" | "salarios";

export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("receitas");

  /* ── Header live clock ── */
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const liveTime = `${String(now.getHours()).padStart(2, "0")}h:${String(now.getMinutes()).padStart(2, "0")}min:${String(now.getSeconds()).padStart(2, "0")}s`;
  const todayLabel = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const ANO_LETIVO = "2024 / 2025";


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
  const [planEdit, setPlanEdit] = useState<{ rowId: string; months: number; valor: string; imposto: string } | null>(null);

  /* ── DESPESAS ── */
  const [despesas, setDespesas] = useState<DespesaRow[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>(INITIAL_CATEGORIAS);
  const [estados, setEstados] = useState<EstadoItem[]>([
    { id: "est-1", label: "Pendente",  color: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "est-2", label: "Aprovada",  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "est-3", label: "Executada", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "est-4", label: "Rejeitada", color: "bg-red-50 text-red-700 border-red-200" },
  ]);
  const [despesaCatFilter, setDespesaCatFilter] = useState<string>("todos");
  const [despesaEstadoFilter, setDespesaEstadoFilter] = useState<string>("todos");
  const [despesaSearch, setDespesaSearch] = useState("");

  const [editingDespesa, setEditingDespesa] = useState<DespesaRow | null>(null);
  const [openDespesaDialog, setOpenDespesaDialog] = useState(false);
  const [despesaForm, setDespesaForm] = useState<DespesaRow>({
    id: "", nome: "", categoria: "", estado: "", departamento: "Geral", periodicidade: "mensal", valorEstimado: 0,
  });
  const [confirmDelDespesa, setConfirmDelDespesa] = useState<DespesaRow | null>(null);

  // Categoria add / edit dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState<string>(CAT_PALETTE[0].cls);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaItem | null>(null);

  // Estado add / edit dialogs
  const [estadoDialogOpen, setEstadoDialogOpen] = useState(false);
  const [newEstadoLabel, setNewEstadoLabel] = useState("");
  const [newEstadoColor, setNewEstadoColor] = useState<string>(CAT_PALETTE[0].cls);
  const [editingEstado, setEditingEstado] = useState<EstadoItem | null>(null);

  // Responsáveis
  const [responsaveis, setResponsaveis] = useState<ResponsavelItem[]>(INITIAL_RESPONSAVEIS);
  const [newRespNome, setNewRespNome] = useState("");
  const [newRespCargo, setNewRespCargo] = useState("");

  // Destinatário por categoria
  const [destinatariosMap, setDestinatariosMap] = useState<DestinatarioMap[]>([]);

  // Regras de aprovação por faixa de valor
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [ruleForm, setRuleForm] = useState<{ id?: string; min: string; max: string; responsavelId: string }>({ min: "", max: "", responsavelId: "" });
  const [openRuleDialog, setOpenRuleDialog] = useState(false);

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
  const [salaryForm, setSalaryForm] = useState<SalaryConfig>({ baseSalary: 0, irtRate: 0.08, ssRate: 0.03, multas: [] });
  const [newMulta, setNewMulta] = useState<{ nome: string; valor: string }>({ nome: "", valor: "" });
  const [confirmDelSalary, setConfirmDelSalary] = useState<Salary | null>(null);
  const [openNewSalary, setOpenNewSalary] = useState(false);
  const [newSalaryForm, setNewSalaryForm] = useState({
    name: "", employeeId: "", role: "", department: "Docentes", grossSalary: 0,
    contractType: "permanente" as "permanente" | "prestador",
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
  const commitPlanEdit = () => {
    if (!planEdit) return;
    const v = Number(planEdit.valor) || 0;
    const imp = Math.max(0, Math.min(100, Number(planEdit.imposto) || 0)) / 100;
    setReceitas(rs => rs.map(r => {
      if (r.id !== planEdit.rowId || !r.plans) return r;
      const plans = r.plans.map(p => p.months === planEdit.months ? { ...p, valor: v, imposto: imp } : p);
      return { ...r, plans, valor: plans[0].valor };
    }));
    setPlanEdit(null);
    toast({ title: "Plano actualizado", description: `${planEdit.months} meses · ${formatCurrency(v)}` });
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
      categoria: categorias[0].label,
      estado: estados[0]?.label ?? "",
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
    const v = newCatLabel.trim();
    if (!v) return;
    if (categorias.some(c => c.label.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Categoria já existe", variant: "destructive" }); return;
    }
    setCategorias(cs => [...cs, { id: `cat-${Date.now()}`, label: v, color: newCatColor }]);
    setNewCatLabel("");
    setNewCatColor(CAT_PALETTE[0].cls);
    setCatDialogOpen(false);
    toast({ title: "Categoria criada", description: v });
  };
  const saveEditCategoria = () => {
    if (!editingCategoria || !editingCategoria.label.trim()) return;
    const v = editingCategoria.label.trim();
    if (categorias.some(c => c.id !== editingCategoria.id && c.label.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Categoria já existe", variant: "destructive" }); return;
    }
    setCategorias(cs => cs.map(c => c.id === editingCategoria.id ? { ...editingCategoria, label: v } : c));
    setEditingCategoria(null);
    toast({ title: "Categoria actualizada" });
  };
  const removeCategoria = (cat: CategoriaItem) => {
    if (despesas.some(d => d.categoria === cat.label)) {
      toast({ title: "Categoria em uso", description: "Remova primeiro as despesas que a usam.", variant: "destructive" });
      return;
    }
    setCategorias(cs => cs.filter(x => x.id !== cat.id));
    if (despesaCatFilter === cat.label) setDespesaCatFilter("todos");
  };
  const addEstado = () => {
    const v = newEstadoLabel.trim();
    if (!v) return;
    if (estados.some(e => e.label.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Estado já existe", variant: "destructive" });
      return;
    }
    setEstados(es => [...es, { id: `est-${Date.now()}`, label: v, color: newEstadoColor }]);
    setNewEstadoLabel("");
    setNewEstadoColor(CAT_PALETTE[0].cls);
    setEstadoDialogOpen(false);
    toast({ title: "Estado criado", description: v });
  };
  const saveEditEstado = () => {
    if (!editingEstado || !editingEstado.label.trim()) return;
    const v = editingEstado.label.trim();
    if (estados.some(e => e.id !== editingEstado.id && e.label.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Estado já existe", variant: "destructive" });
      return;
    }
    setEstados(es => es.map(e => e.id === editingEstado.id ? { ...editingEstado, label: v } : e));
    setEditingEstado(null);
    toast({ title: "Estado actualizado" });
  };
  const removeEstado = (e: EstadoItem) => {
    if (despesas.some(d => d.estado === e.label)) {
      toast({ title: "Estado em uso", description: "Remova primeiro as despesas que o usam.", variant: "destructive" });
      return;
    }
    setEstados(es => es.filter(x => x.id !== e.id));
    if (despesaEstadoFilter === e.label) setDespesaEstadoFilter("todos");
  };

  /* ── Responsáveis / Destinatários / Regras de aprovação ops ── */
  const addResponsavel = () => {
    if (!newRespNome.trim() || !newRespCargo.trim()) return;
    setResponsaveis(rs => [...rs, { id: `resp-${Date.now()}`, nome: newRespNome.trim(), cargo: newRespCargo.trim() }]);
    setNewRespNome(""); setNewRespCargo("");
  };
  const removeResponsavel = (id: string) => {
    if (approvalRules.some(r => r.responsavelId === id)) {
      toast({ title: "Responsável em uso", description: "Remova primeiro as regras associadas.", variant: "destructive" });
      return;
    }
    setResponsaveis(rs => rs.filter(r => r.id !== id));
  };
  const setDestinatarioFor = (categoria: string, destinatario: string) => {
    setDestinatariosMap(prev => {
      const filtered = prev.filter(d => d.categoria !== categoria);
      return destinatario ? [...filtered, { categoria, destinatario }] : filtered;
    });
  };
  const getDestinatarioFor = (categoria: string) =>
    destinatariosMap.find(d => d.categoria === categoria)?.destinatario ?? "";

  const openNewRule = () => {
    if (responsaveis.length === 0) {
      toast({ title: "Crie primeiro um responsável", variant: "destructive" });
      return;
    }
    setRuleForm({ min: "0", max: "", responsavelId: responsaveis[0].id });
    setOpenRuleDialog(true);
  };
  const openEditRule = (r: ApprovalRule) => {
    setRuleForm({ id: r.id, min: String(r.min), max: String(r.max), responsavelId: r.responsavelId });
    setOpenRuleDialog(true);
  };
  const saveRule = () => {
    const min = Number(ruleForm.min) || 0;
    const max = Number(ruleForm.max) || 0;
    if (max < min || !ruleForm.responsavelId) {
      toast({ title: "Dados inválidos", description: "Verifique a faixa de valores e o responsável.", variant: "destructive" });
      return;
    }
    if (ruleForm.id) {
      setApprovalRules(rs => rs.map(r => r.id === ruleForm.id ? { ...r, min, max, responsavelId: ruleForm.responsavelId } : r));
    } else {
      setApprovalRules(rs => [...rs, { id: `rule-${Date.now()}`, min, max, responsavelId: ruleForm.responsavelId }].sort((a, b) => a.min - b.min));
    }
    setOpenRuleDialog(false);
  };
  const removeRule = (id: string) => setApprovalRules(rs => rs.filter(r => r.id !== id));
  const responsavelForValue = (v: number) => {
    const rule = approvalRules.find(r => v >= r.min && v <= r.max);
    if (!rule) return null;
    return responsaveis.find(r => r.id === rule.responsavelId) ?? null;
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
    const irt = Math.round(c.baseSalary * c.irtRate);
    const ss = Math.round(c.baseSalary * c.ssRate);
    return c.baseSalary - irt - ss;
  };

  const saveNewSalary = () => {
    if (!newSalaryForm.name.trim() || !newSalaryForm.role.trim() || newSalaryForm.grossSalary <= 0) {
      toast({ title: "Dados incompletos", description: "Preencha nome, posição e salário bruto.", variant: "destructive" });
      return;
    }
    const id = `sal-${Date.now()}`;
    const empId = newSalaryForm.employeeId.trim() || `EMP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const irtRate = 0.08, ssRate = 0.03;
    const deductions = Math.round(newSalaryForm.grossSalary * (irtRate + ssRate));
    // Teachers always belong to "Docentes" department
    const role = newSalaryForm.role.trim();
    const isTeacher = /professor|docente|leitor|assistente|catedrático/i.test(role);
    const dept = isTeacher ? "Docentes" : newSalaryForm.department;
    const newSal: Salary = {
      id,
      employeeId: empId,
      name: newSalaryForm.name.trim(),
      role,
      department: dept,
      contractType: newSalaryForm.contractType === "permanente" ? "efectivo" : "contratado",
      grossSalary: newSalaryForm.grossSalary,
      netSalary: newSalaryForm.grossSalary - deductions,
      deductions,
      status: "pendente",
      payDate: new Date().toISOString().slice(0, 10),
    };
    setSalaries(ss => [newSal, ...ss]);
    setSalaryConfigs(c => ({ ...c, [id]: { baseSalary: newSalaryForm.grossSalary, irtRate, ssRate, multas: [] } }));
    toast({ title: "Colaborador adicionado", description: newSal.name });
    setOpenNewSalary(false);
    setNewSalaryForm({ name: "", employeeId: "", role: "", department: "Docentes", grossSalary: 0, contractType: "permanente" });
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
      {/* Header — institucional (Ano Letivo + Dia de Hoje) */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="rounded-lg -ml-2 mt-0.5" onClick={() => navigate("/financas/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 space-y-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold text-primary">
                <GraduationCap className="w-3.5 h-3.5" />
                Ano Letivo <span className="font-bold tabular-nums">{ANO_LETIVO}</span>
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2 leading-tight">
                  <Settings2 className="w-5 h-5 text-primary" /> Configurador Financeiro
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Gere receitas, despesas e salários da instituição num único painel.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="inline-flex items-stretch rounded-md border border-border bg-card overflow-hidden text-[11px] uppercase tracking-wider font-medium shadow-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground capitalize">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />{todayLabel}
              </span>
              <span className="w-px bg-border" />
              <span className="flex items-center gap-1.5 px-2.5 py-1 font-mono tabular-nums text-primary bg-muted/30">
                <Clock className="w-3.5 h-3.5" />{liveTime}
              </span>
            </div>
          </div>
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
                    <div className="space-y-4">
                      {/* Faculty header with toggle to switch faculties */}
                      <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-blue-50/40 to-transparent p-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Faculdade · Propinas</p>
                              <p className="text-base font-bold text-foreground truncate">{selected.name}</p>
                              <p className="text-[11px] text-muted-foreground tabular-nums">
                                {selected.courses.length} cursos ·{" "}
                                {(() => {
                                  const stat = facultyStats.find(f => f.id === selected.id);
                                  return stat ? `${formatCurrency(stat.min)} – ${formatCurrency(stat.max)} · média ${formatCurrency(stat.avg)}` : "";
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trocar</span>
                            <Select value={selected.id} onValueChange={v => setSelectedFaculty(v)}>
                              <SelectTrigger className="h-8 w-[200px] text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {reitorFaculties.map(f => (
                                  <SelectItem key={f.id} value={f.id} className="text-xs">{f.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                      {selected.courses.map((c, idx) => {
                        const r = receitas.find(x => x.tipo === "Propina mensal" && x.escopo === c.id);
                        if (!r) return null;
                        const plans = r.plans ?? [{ months: 10, valor: r.valor }];
                        const existingMonths = new Set(plans.map(p => p.months));
                        const availableToAdd = [10, 11, 12].filter(m => !existingMonths.has(m));
                        const palette = [
                          { badge: "bg-blue-100 text-blue-700", header: "from-blue-50/70", border: "hover:border-blue-300", row: "hover:bg-blue-50/40" },
                          { badge: "bg-emerald-100 text-emerald-700", header: "from-emerald-50/70", border: "hover:border-emerald-300", row: "hover:bg-emerald-50/40" },
                          { badge: "bg-amber-100 text-amber-700", header: "from-amber-50/70", border: "hover:border-amber-300", row: "hover:bg-amber-50/40" },
                          { badge: "bg-violet-100 text-violet-700", header: "from-violet-50/70", border: "hover:border-violet-300", row: "hover:bg-violet-50/40" },
                          { badge: "bg-rose-100 text-rose-700", header: "from-rose-50/70", border: "hover:border-rose-300", row: "hover:bg-rose-50/40" },
                          { badge: "bg-cyan-100 text-cyan-700", header: "from-cyan-50/70", border: "hover:border-cyan-300", row: "hover:bg-cyan-50/40" },
                          { badge: "bg-indigo-100 text-indigo-700", header: "from-indigo-50/70", border: "hover:border-indigo-300", row: "hover:bg-indigo-50/40" },
                          { badge: "bg-teal-100 text-teal-700", header: "from-teal-50/70", border: "hover:border-teal-300", row: "hover:bg-teal-50/40" },
                        ];
                        const col = palette[idx % palette.length];
                        return (
                          <div key={c.id} className={cn("rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition", col.border)}>
                            <div className={cn("flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r to-transparent border-b border-border", col.header)}>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-md text-[11px] font-bold tracking-wide flex-shrink-0", col.badge)}>
                                  {c.code}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{plans.length} {plans.length === 1 ? "plano" : "planos"} de propina mensal</p>
                                </div>
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
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                                  <th className="text-left font-semibold px-4 py-2">Plano</th>
                                  <th className="text-right font-semibold px-3 py-2">Bruto / mês</th>
                                  <th className="text-right font-semibold px-3 py-2">Líquido / mês</th>
                                  <th className="text-right font-semibold px-3 py-2 hidden sm:table-cell">Imposto</th>
                                  <th className="text-right font-semibold px-3 py-2 hidden md:table-cell">Total anual bruto</th>
                                  <th className="text-right font-semibold px-3 py-2 hidden md:table-cell">Total anual líquido</th>
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {plans.map(p => {
                                  const liq = liquidoOf(p.valor, p.imposto);
                                  const impPct = ((p.imposto ?? DEFAULT_IMPOSTO) * 100);
                                  return (
                                    <tr key={p.months}
                                      role="button" tabIndex={0}
                                      onClick={() => setPlanEdit({ rowId: r.id, months: p.months, valor: String(p.valor), imposto: String(impPct.toFixed(1)) })}
                                      className={cn("border-b border-border/50 last:border-0 cursor-pointer group/row", col.row)}>
                                      <td className="px-4 py-2.5">
                                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums", col.badge)}>{p.months} meses</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">{formatCurrency(p.valor)}</td>
                                      <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-emerald-700">{formatCurrency(liq)}</td>
                                      <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground hidden sm:table-cell">{impPct.toFixed(1)}%</td>
                                      <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground hidden md:table-cell">{formatCurrency(p.valor * p.months)}</td>
                                      <td className="px-3 py-2.5 text-right text-xs tabular-nums font-semibold text-emerald-700 hidden md:table-cell">{formatCurrency(liq * p.months)}</td>
                                      <td className="px-2 py-2.5 text-right">
                                        {plans.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removePlanFromRow(r.id, p.months); }}
                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-destructive opacity-0 group-hover/row:opacity-100 hover:bg-destructive/10 transition"
                                            title="Remover prazo">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            }

            // Multas section — premium category cards + themed table
            if (section.key === "multas") {
              const activeSub = MULTA_SUBTYPES.find(s => s.key === multaSubtype)!;
              const ActiveIcon = activeSub.icon;
              const filtered = items.filter(r => r.tipo === multaSubtype);
              const totalBruto = filtered.reduce((sum, r) => sum + r.valor, 0);
              const totalLiquido = filtered.reduce((sum, r) => sum + liquidoOf(r.valor, r.imposto), 0);
              return (
                <Card key={section.key} className="p-5">
                  <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={cn("w-4 h-4", section.accent)} />
                      <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                      <span className="text-[11px] text-muted-foreground tabular-nums">· {items.length} no total</span>
                      <span className="text-xs text-muted-foreground truncate hidden md:inline">— {section.description}</span>
                    </div>
                  </div>

                  {/* Category selector cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {MULTA_SUBTYPES.map(sub => {
                      const SubIcon = sub.icon;
                      const subItems = items.filter(r => r.tipo === sub.key);
                      const subSum = subItems.reduce((s, r) => s + r.valor, 0);
                      const active = multaSubtype === sub.key;
                      return (
                        <button key={sub.key} type="button" onClick={() => setMultaSubtype(sub.key)}
                          className={cn(
                            "relative text-left rounded-xl border p-3.5 transition-all overflow-hidden",
                            active
                              ? cn("ring-2 ring-offset-1 shadow-sm", sub.ring)
                              : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
                          )}>
                          <span className={cn("absolute left-0 top-0 bottom-0 w-1", sub.bar, active ? "opacity-100" : "opacity-40")} />
                          <div className="flex items-start gap-3 pl-1.5">
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", sub.iconBg)}>
                              <SubIcon className={cn("w-4.5 h-4.5", sub.iconColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-semibold", active ? sub.iconColor : "text-foreground")}>{sub.label}</span>
                                <span className={cn("inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold tabular-nums", sub.chip)}>
                                  {subItems.length}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Total bruto</p>
                              <p className="text-sm font-semibold tabular-nums text-foreground mt-0.5">{formatCurrency(subSum)}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active category header bar */}
                  <div className={cn("flex items-center justify-between gap-3 rounded-lg border px-3 py-2 mb-3", activeSub.ring)}>
                    <div className="flex items-center gap-2 min-w-0">
                      <ActiveIcon className={cn("w-4 h-4", activeSub.iconColor)} />
                      <span className={cn("text-sm font-semibold", activeSub.iconColor)}>Multas · {activeSub.label}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">· {filtered.length} {filtered.length === 1 ? "item" : "itens"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Bruto <span className="font-semibold text-foreground tabular-nums ml-0.5">{formatCurrency(totalBruto)}</span></span>
                        <span>Líquido <span className="font-semibold text-emerald-700 tabular-nums ml-0.5">{formatCurrency(totalLiquido)}</span></span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => openNewReceita(section)}>
                        <Plus className="w-3.5 h-3.5" /> Nova multa
                      </Button>
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="text-center py-8 rounded-lg border border-dashed border-border bg-muted/20">
                      <ActiveIcon className={cn("w-6 h-6 mx-auto mb-2 opacity-60", activeSub.iconColor)} />
                      <p className="text-xs text-muted-foreground">Sem multas configuradas para {activeSub.label.toLowerCase()}.</p>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs mt-3" onClick={() => openNewReceita(section)}>
                        <Plus className="w-3.5 h-3.5" /> Adicionar primeira multa
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                            <th className="text-left font-semibold px-4 py-2">Multa</th>
                            <th className="text-right font-semibold px-3 py-2">Bruto</th>
                            <th className="text-right font-semibold px-3 py-2">Líquido</th>
                            <th className="text-right font-semibold px-3 py-2 hidden sm:table-cell">Imposto</th>
                            <th className="w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(r => {
                            const impPct = ((r.imposto ?? DEFAULT_IMPOSTO) * 100);
                            return (
                              <tr key={r.id} role="button" tabIndex={0}
                                onClick={() => openEditReceita(section, r)}
                                onKeyDown={(e) => { if (e.key === "Enter") openEditReceita(section, r); }}
                                className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition group">
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className={cn("w-1 h-6 rounded-full shrink-0", activeSub.bar)} />
                                    <span className="text-sm font-medium text-foreground">{r.nome}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">{formatCurrency(r.valor)}</td>
                                <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-emerald-700">{formatCurrency(liquidoOf(r.valor, r.imposto))}</td>
                                <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground hidden sm:table-cell">{impPct.toFixed(1)}%</td>
                                <td className="px-2 py-2.5 text-right">
                                  <div className="inline-flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={(e) => { e.stopPropagation(); openEditReceita(section, r); }} title="Editar">
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-destructive hover:text-destructive"
                                      onClick={(e) => { e.stopPropagation(); setConfirmDelReceita(r); }} title="Remover">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-border bg-muted/20">
                            <td className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</td>
                            <td className="px-3 py-2 text-right text-sm font-bold tabular-nums text-foreground">{formatCurrency(totalBruto)}</td>
                            <td className="px-3 py-2 text-right text-sm font-bold tabular-nums text-emerald-700">{formatCurrency(totalLiquido)}</td>
                            <td className="hidden sm:table-cell" />
                            <td />
                          </tr>
                        </tfoot>
                      </table>
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
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
                          <th className="text-left font-semibold px-4 py-2">Nome</th>
                          <th className="text-left font-semibold px-3 py-2 hidden sm:table-cell">Tipo</th>
                          <th className="text-left font-semibold px-3 py-2 hidden md:table-cell">Âmbito</th>
                          <th className="text-right font-semibold px-3 py-2">Bruto</th>
                          <th className="text-right font-semibold px-3 py-2">Líquido</th>
                          <th className="text-right font-semibold px-3 py-2 hidden sm:table-cell">Imposto</th>
                          <th className="w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(r => {
                          const impPct = ((r.imposto ?? DEFAULT_IMPOSTO) * 100);
                          return (
                            <tr key={r.id} role="button" tabIndex={0}
                              onClick={() => openEditReceita(section, r)}
                              onKeyDown={(e) => { if (e.key === "Enter") openEditReceita(section, r); }}
                              className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition group">
                              <td className="px-4 py-2.5 text-sm font-medium text-foreground">{r.nome}</td>
                              <td className="px-3 py-2.5 hidden sm:table-cell">
                                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tipoChipReceita[r.tipo])}>{r.tipo}</span>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell">{courseLabel(r.escopo)}</td>
                              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">{formatCurrency(r.valor)}</td>
                              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-emerald-700">{formatCurrency(liquidoOf(r.valor, r.imposto))}</td>
                              <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground hidden sm:table-cell">{impPct.toFixed(1)}%</td>
                              <td className="px-2 py-2.5 text-right">
                                <div className="inline-flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={(e) => { e.stopPropagation(); openEditReceita(section, r); }} title="Editar">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-destructive hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelReceita(r); }} title="Remover">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* ════════════════ DESPESAS ════════════════ */}
      {mode === "despesas" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {categorias.length}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">— Classificação principal das despesas</span>
              </div>
              <Dialog open={catDialogOpen} onOpenChange={(o) => { setCatDialogOpen(o); if (!o) { setNewCatLabel(""); setNewCatColor(CAT_PALETTE[0].cls); } }}>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setCatDialogOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Nova categoria
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Nova categoria</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                      <Input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addCategoria(); }}
                        placeholder="Ex: Eventos" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor</label>
                      <div className="flex flex-wrap gap-2">
                        {CAT_PALETTE.map(p => (
                          <button key={p.cls} type="button" onClick={() => setNewCatColor(p.cls)}
                            className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center transition",
                              newCatColor === p.cls ? "border-foreground" : "border-transparent hover:border-muted-foreground/40")}
                            title={p.name}>
                            <span className={cn("h-5 w-5 rounded-full", p.dot)} />
                          </button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", newCatColor)}>
                          <span className="font-medium">{newCatLabel.trim() || "Pré-visualização"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-2">
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={addCategoria} disabled={!newCatLabel.trim()}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {categorias.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Crie categorias para classificar as despesas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categorias.map(c => {
                  const count = despesas.filter(d => d.categoria === c.label).length;
                  return (
                    <div key={c.id} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", c.color)}>
                      <span className="font-medium">{c.label}</span>
                      <span className="opacity-60 tabular-nums">· {count}</span>
                      <button onClick={() => setEditingCategoria({ ...c })} className="opacity-60 hover:opacity-100" title="Editar">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeCategoria(c)} className="opacity-60 hover:opacity-100" title="Remover">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Edit categoria dialog */}
          <Dialog open={!!editingCategoria} onOpenChange={(o) => !o && setEditingCategoria(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Editar categoria</DialogTitle></DialogHeader>
              {editingCategoria && (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                    <Input value={editingCategoria.label}
                      onChange={e => setEditingCategoria({ ...editingCategoria, label: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor</label>
                    <div className="flex flex-wrap gap-2">
                      {CAT_PALETTE.map(p => (
                        <button key={p.cls} type="button"
                          onClick={() => setEditingCategoria({ ...editingCategoria, color: p.cls })}
                          className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center transition",
                            editingCategoria.color === p.cls ? "border-foreground" : "border-transparent hover:border-muted-foreground/40")}
                          title={p.name}>
                          <span className={cn("h-5 w-5 rounded-full", p.dot)} />
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", editingCategoria.color)}>
                        <span className="font-medium">{editingCategoria.label.trim() || "Pré-visualização"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setEditingCategoria(null)}>Cancelar</Button>
                <Button onClick={saveEditCategoria} disabled={!editingCategoria?.label.trim()}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          {/* 2. Estados */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Estados</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {estados.length}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">— Ciclo de vida das despesas</span>
              </div>
              <Dialog open={estadoDialogOpen} onOpenChange={setEstadoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Novo estado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Novo estado</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                      <Input value={newEstadoLabel} onChange={e => setNewEstadoLabel(e.target.value)}
                        placeholder="Ex.: Em revisão" className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor</label>
                      <div className="flex flex-wrap gap-2">
                        {CAT_PALETTE.map(p => (
                          <button key={p.cls} type="button"
                            onClick={() => setNewEstadoColor(p.cls)}
                            className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center transition",
                              newEstadoColor === p.cls ? "border-foreground" : "border-transparent hover:border-muted-foreground/40")}
                            title={p.name}>
                            <span className={cn("h-5 w-5 rounded-full", p.dot)} />
                          </button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", newEstadoColor)}>
                          <span className="font-medium">{newEstadoLabel.trim() || "Pré-visualização"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-2">
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={addEstado} disabled={!newEstadoLabel.trim()}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {estados.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Crie estados (ex.: Activo, Em revisão, Suspensa).</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {estados.map(e => {
                  const count = despesas.filter(d => d.estado === e.label).length;
                  return (
                    <div key={e.id} className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", e.color)}>
                      <span className="font-medium">{e.label}</span>
                      <span className="opacity-60 tabular-nums">· {count}</span>
                      <button onClick={() => setEditingEstado({ ...e })} className="opacity-60 hover:opacity-100" title="Editar">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeEstado(e)} className="opacity-60 hover:opacity-100" title="Remover">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Edit estado dialog */}
          <Dialog open={!!editingEstado} onOpenChange={(o) => !o && setEditingEstado(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Editar estado</DialogTitle></DialogHeader>
              {editingEstado && (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designação</label>
                    <Input value={editingEstado.label}
                      onChange={e => setEditingEstado({ ...editingEstado, label: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor</label>
                    <div className="flex flex-wrap gap-2">
                      {CAT_PALETTE.map(p => (
                        <button key={p.cls} type="button"
                          onClick={() => setEditingEstado({ ...editingEstado, color: p.cls })}
                          className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center transition",
                            editingEstado.color === p.cls ? "border-foreground" : "border-transparent hover:border-muted-foreground/40")}
                          title={p.name}>
                          <span className={cn("h-5 w-5 rounded-full", p.dot)} />
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs", editingEstado.color)}>
                        <span className="font-medium">{editingEstado.label.trim() || "Pré-visualização"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setEditingEstado(null)}>Cancelar</Button>
                <Button onClick={saveEditEstado} disabled={!editingEstado?.label.trim()}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 3. Responsáveis */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Responsáveis</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">· {responsaveis.length}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">— Pessoas que podem aprovar despesas</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Input value={newRespNome} onChange={e => setNewRespNome(e.target.value)}
                  placeholder="Nome" className="h-8 w-44 text-xs" />
                <Input value={newRespCargo} onChange={e => setNewRespCargo(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addResponsavel(); }}
                  placeholder="Cargo" className="h-8 w-44 text-xs" />
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={addResponsavel}>
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </div>
            {responsaveis.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Adicione responsáveis para configurar regras de aprovação.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Nome</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Cargo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Aprova até</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {responsaveis.map(r => {
                      const isReitor = /reitor/i.test(r.nome) || /reitor/i.test(r.cargo);
                      const respRules = approvalRules.filter(x => x.responsavelId === r.id);
                      const maxLimit = respRules.length ? Math.max(...respRules.map(x => x.max)) : null;
                      return (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-3 text-xs font-medium text-foreground">{r.nome}</td>
                          <td className="p-3 text-xs text-muted-foreground">{r.cargo}</td>
                          <td className="p-3 text-xs">
                            {isReitor ? (
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">Sem limite</span>
                            ) : maxLimit !== null ? (
                              <span className="tabular-nums text-foreground font-medium">{formatCurrency(maxLimit)}</span>
                            ) : (
                              <span className="text-muted-foreground italic">— sem limite definido</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => removeResponsavel(r.id)} className="text-muted-foreground hover:text-destructive" title="Remover">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>


        </div>
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
                  <th className="text-left font-semibold px-2 py-2">Contrato</th>
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
                  const net = computeNet(cfg);
                  const contractLabel = s.contractType === "efectivo" ? "Permanente" : "Prestador";
                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/40 group">
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/financas/pessoal/financas?id=${s.id}`)}
                          className="text-left">
                          <p className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline underline-offset-2">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{s.employeeId}</p>
                        </button>
                      </td>
                      <td className="px-2 py-2.5">
                        <p className="text-xs text-foreground truncate">{s.role}</p>
                      </td>
                      <td className="px-2 py-2.5">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                          s.contractType === "efectivo" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        )}>{contractLabel}</span>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valor Bruto (Kz)</label>
                <Input type="number" min={0} value={receitaForm.valor}
                  onChange={e => setReceitaForm({ ...receitaForm, valor: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Imposto (%)</label>
                <Input type="number" min={0} max={100} step={0.5}
                  value={((receitaForm.imposto ?? DEFAULT_IMPOSTO) * 100).toFixed(1)}
                  onChange={e => setReceitaForm({ ...receitaForm, imposto: (Number(e.target.value) || 0) / 100 })} />
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Valor Bruto</span>
                <span className="font-medium tabular-nums">{formatCurrency(receitaForm.valor)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Imposto ({((receitaForm.imposto ?? DEFAULT_IMPOSTO) * 100).toFixed(1)}%)</span>
                <span className="font-medium tabular-nums text-red-600">−{formatCurrency(receitaForm.valor - liquidoOf(receitaForm.valor, receitaForm.imposto))}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border">
                <span className="text-sm font-semibold">Valor Líquido</span>
                <span className="text-sm font-bold tabular-nums text-emerald-700">{formatCurrency(liquidoOf(receitaForm.valor, receitaForm.imposto))}</span>
              </div>
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
                    {categorias.map(c => <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>)}
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
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Salário Bruto (Kz)</label>
                  <Input type="number" min={0} value={salaryForm.baseSalary}
                    onChange={e => setSalaryForm({ ...salaryForm, baseSalary: Number(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Desconto IRT (%)</label>
                  <Input type="number" min={0} max={100} step={0.5}
                    value={(salaryForm.irtRate * 100).toFixed(1)}
                    onChange={e => setSalaryForm({ ...salaryForm, irtRate: (Number(e.target.value) || 0) / 100 })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Segurança Social (%)</label>
                  <Input type="number" min={0} max={100} step={0.5}
                    value={(salaryForm.ssRate * 100).toFixed(1)}
                    onChange={e => setSalaryForm({ ...salaryForm, ssRate: (Number(e.target.value) || 0) / 100 })} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Salário Bruto</span>
                  <span className="font-medium tabular-nums">{formatCurrency(salaryForm.baseSalary)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Desconto IRT ({(salaryForm.irtRate * 100).toFixed(1)}%)</span>
                  <span className="font-medium tabular-nums text-red-600">−{formatCurrency(Math.round(salaryForm.baseSalary * salaryForm.irtRate))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Segurança Social ({(salaryForm.ssRate * 100).toFixed(1)}%)</span>
                  <span className="font-medium tabular-nums text-red-600">−{formatCurrency(Math.round(salaryForm.baseSalary * salaryForm.ssRate))}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold">Salário Líquido</span>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Salário Bruto (Kz)</label>
                <Input type="number" min={0} value={newSalaryForm.grossSalary}
                  onChange={e => setNewSalaryForm({ ...newSalaryForm, grossSalary: Number(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo de Contrato</label>
                <Select value={newSalaryForm.contractType}
                  onValueChange={(v: "permanente" | "prestador") => setNewSalaryForm({ ...newSalaryForm, contractType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanente">Permanente</SelectItem>
                    <SelectItem value="prestador">Prestador de Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              Posições de docência são automaticamente atribuídas ao departamento <strong>Docentes</strong>.
            </p>
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

      {/* ═══════ Plano (propina) edit dialog ═══════ */}
      <Dialog open={!!planEdit} onOpenChange={(o) => !o && setPlanEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" /> Plano de Propina — {planEdit?.months} meses
            </DialogTitle>
          </DialogHeader>
          {planEdit && (() => {
            const v = Number(planEdit.valor) || 0;
            const imp = (Number(planEdit.imposto) || 0) / 100;
            const liq = Math.round(v * (1 - imp));
            return (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Valor Bruto (Kz / mês)</label>
                    <Input type="number" min={0} autoFocus value={planEdit.valor}
                      onChange={e => setPlanEdit({ ...planEdit, valor: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Imposto (%)</label>
                    <Input type="number" min={0} max={100} step={0.5} value={planEdit.imposto}
                      onChange={e => setPlanEdit({ ...planEdit, imposto: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Valor Bruto</span>
                    <span className="font-medium tabular-nums">{formatCurrency(v)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Imposto ({imp ? (imp * 100).toFixed(1) : "0.0"}%)</span>
                    <span className="font-medium tabular-nums text-red-600">−{formatCurrency(v - liq)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border">
                    <span className="text-sm font-semibold">Valor Líquido</span>
                    <span className="text-sm font-bold tabular-nums text-emerald-700">{formatCurrency(liq)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1">Total anual ({planEdit.months} meses): <span className="font-semibold text-foreground tabular-nums">{formatCurrency(v * planEdit.months)}</span> bruto · <span className="font-semibold text-foreground tabular-nums">{formatCurrency(liq * planEdit.months)}</span> líquido</p>
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={commitPlanEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Regra de aprovação dialog ═══════ */}
      <Dialog open={openRuleDialog} onOpenChange={setOpenRuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              {ruleForm.id ? "Editar regra" : "Nova regra de aprovação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">De (Kz)</label>
                <Input type="number" min={0} value={ruleForm.min}
                  onChange={e => setRuleForm({ ...ruleForm, min: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Até (Kz)</label>
                <Input type="number" min={0} value={ruleForm.max}
                  onChange={e => setRuleForm({ ...ruleForm, max: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Responsável</label>
              <Select value={ruleForm.responsavelId} onValueChange={v => setRuleForm({ ...ruleForm, responsavelId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {responsaveis.map(r => <SelectItem key={r.id} value={r.id}>{r.nome} · {r.cargo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Despesas com valor entre <strong className="text-foreground tabular-nums">{formatCurrency(Number(ruleForm.min) || 0)}</strong> e <strong className="text-foreground tabular-nums">{formatCurrency(Number(ruleForm.max) || 0)}</strong> serão encaminhadas a este responsável.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveRule}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* unused-import guard */}
      <span className="hidden"><Popover><PopoverTrigger /><PopoverContent /></Popover></span>
    </div>
  );
}
