export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' Kz';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'receita' | 'despesa';
  status: 'pago' | 'pendente' | 'em_atraso' | 'cancelado' | 'aprovada' | 'rejeitada';
  source?: string;
  department?: string;
  requestedBy?: string;
  requesterRole?: string;
  responsavel?: string;
  responsavelRole?: string;
  justification?: string;
  approvedBy?: string;
  approvedDate?: string;
  paidDate?: string;
  payer?: string;
  studentId?: string;
  course?: string;
}

export const recentTransactions: Transaction[] = [];

export const monthlyData = [
  { month: "Nov", receitas: 0, despesas: 0 },
  { month: "Dez", receitas: 0, despesas: 0 },
  { month: "Jan", receitas: 0, despesas: 0 },
  { month: "Fev", receitas: 0, despesas: 0 },
  { month: "Mar", receitas: 0, despesas: 0 },
  { month: "Abr", receitas: 0, despesas: 0 },
];

export const expenseCategories: { name: string; value: number; color: string }[] = [];

export const alerts: { id: string; type: "warning" | "info" | "error"; message: string }[] = [];

export const receitas: Transaction[] = [];

export const despesas: Transaction[] = [];


export interface Salary {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  contractType: 'efectivo' | 'contratado' | 'colaborador';
  grossSalary: number;
  netSalary: number;
  deductions: number;
  status: 'pago' | 'pendente' | 'processando';
  payDate: string;
}

const roles = [
  { role: "Professor Titular", gross: [800000, 950000] },
  { role: "Professor Associado", gross: [680000, 780000] },
  { role: "Professor Auxiliar", gross: [550000, 680000] },
  { role: "Assistente", gross: [400000, 550000] },
  { role: "Decano", gross: [900000, 1050000] },
  { role: "Coordenador de Curso", gross: [650000, 750000] },
  { role: "Técnico de Laboratório", gross: [350000, 480000] },
  { role: "Técnico de TI", gross: [380000, 520000] },
  { role: "Secretário(a)", gross: [300000, 420000] },
  { role: "Assistente Administrativo", gross: [280000, 380000] },
  { role: "Bibliotecário(a)", gross: [320000, 420000] },
  { role: "Segurança", gross: [220000, 300000] },
  { role: "Motorista", gross: [200000, 280000] },
  { role: "Auxiliar de Limpeza", gross: [180000, 250000] },
  { role: "Recepcionista", gross: [250000, 340000] },
];

const departments = ["Fac. Engenharia", "Fac. Medicina", "Fac. Direito", "Fac. Ciências", "Fac. Letras", "Fac. Arquitectura", "Fac. Gestão", "Administração", "TI", "Serviços Gerais", "Reitoria", "Biblioteca", "Secretaria"];
const contracts: Array<'efectivo' | 'contratado' | 'colaborador'> = ["efectivo", "efectivo", "efectivo", "contratado", "contratado", "colaborador"];
const salaryStatuses: Array<'pago' | 'pendente' | 'processando'> = ["pago", "pago", "pago", "pendente", "pendente", "processando"];

const firstNames = [
  "Ricardo", "António", "Maria", "Fábio", "Pedro", "Ana", "David", "Teresa", "João", "Beatriz",
  "Carlos", "Margarida", "Manuel", "Sofia", "José", "Céu", "Nelson", "Luís", "Inês", "Hugo",
  "Tiago", "Raquel", "Bruno", "Cláudia", "Daniel", "Filipa", "Miguel", "Sara", "Nuno", "Luísa",
  "Rui", "Diana", "Paulo", "Patrícia", "Simão", "Helena", "Gustavo", "Vera", "Sérgio", "Mónica",
  "André", "Catarina", "Diogo", "Marta", "Vitor", "Joana", "Marco", "Lara", "Gonçalo", "Rita",
  "Alexandre", "Isabel", "Tomás", "Francisca", "Rafael", "Leonor", "Bernardo", "Carolina", "Henrique", "Eva",
  "Martim", "Matilde", "Gabriel", "Mariana", "Afonso", "Bianca", "Vicente", "Alice", "Dinis", "Laura",
  "Artur", "Gabriela", "Francisco", "Mafalda", "Duarte", "Constança", "Salvador", "Carminho", "Lourenço", "Aurora",
  "Valentim", "Amélia", "Edgar", "Ivone", "Frederico", "Olga", "Gaspar", "Natália", "Ivo", "Celeste",
  "Jaime", "Odete", "Kevin", "Perpétua", "Leandro", "Quitéria", "Márcio", "Rosa", "Orlando", "Sílvia",
];
const lastNames = [
  "Almeida", "Silva", "Santos", "Costa", "Ferreira", "Rodrigues", "Lopes", "Nascimento", "Martins", "Soares",
  "Mendes", "Neto", "Campos", "Ribeiro", "Pereira", "Carvalho", "Baptista", "Monteiro", "Oliveira", "Teixeira",
  "Vieira", "Pinto", "Machado", "Figueiredo", "Correia", "Barros", "Reis", "Duarte", "Gomes", "Castro",
  "Araújo", "Henriques", "Marques", "Coelho", "Freitas", "Tavares", "Gonçalves", "Moreira", "Cardoso", "Ramos",
  "Matos", "Rocha", "Antunes", "Brito", "Cruz", "Domingues", "Esteves", "Fonseca", "Guerra", "Leal",
];

function rand(min: number, max: number): number {
  return Math.floor(min + (max - min) * ((Math.sin(min * 9301 + max * 49297) + 1) / 2));
}

export const salarios: Salary[] = [];

export const payrollBudget = {
  totalBudget: 0,
  currentMonth: "Abril 2025",
};

export interface Budget {
  id: string;
  name: string;
  department: string;
  totalBudget: number;
  spent: number;
  period: string;
  status: 'activo' | 'esgotado' | 'em_revisao';
  responsavel: string;
  responsavelRole: string;
}

export const orcamentos: Budget[] = [];


