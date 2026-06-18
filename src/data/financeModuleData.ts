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

function generateSalarios(): Salary[] {
  const list: Salary[] = [];
  for (let i = 0; i < 100; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const roleInfo = roles[i % roles.length];
    const dept = departments[i % departments.length];
    const contract = contracts[i % contracts.length];
    const status = salaryStatuses[i % salaryStatuses.length];
    const gross = roleInfo.gross[0] + Math.round(((i * 7 + 13) % (roleInfo.gross[1] - roleInfo.gross[0])) / 1000) * 1000;
    const deductionRate = 0.14;
    const deductions = Math.round(gross * deductionRate);
    const net = gross - deductions;
    const prefix = i < 50 ? "Prof. " : (i < 70 ? "Dr(a). " : "");
    list.push({
      id: `s${i + 1}`,
      employeeId: `FUN-${String(i + 1).padStart(3, "0")}`,
      name: `${prefix}${first} ${last}`,
      role: roleInfo.role,
      department: dept,
      contractType: contract,
      grossSalary: gross,
      netSalary: net,
      deductions,
      status,
      payDate: status === "pago" ? "2025-03-31" : "2025-04-30",
    });
  }
  return list;
}

export const salarios: Salary[] = generateSalarios();

export const payrollBudget = {
  totalBudget: 65000000,
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

export const orcamentos: Budget[] = [
  { id: "o1", name: "Orçamento Geral — Fac. Engenharia", department: "Fac. Engenharia", totalBudget: 120000000, spent: 78000000, period: "2025", status: "activo", responsavel: "Dr. Manuel Carvalho", responsavelRole: "Decano Fac. Engenharia" },
  { id: "o2", name: "Orçamento Geral — Fac. Direito", department: "Fac. Direito", totalBudget: 85000000, spent: 52000000, period: "2025", status: "activo", responsavel: "Dra. Teresa Lopes", responsavelRole: "Decana Fac. Direito" },
  { id: "o3", name: "Orçamento Geral — Fac. Medicina", department: "Fac. Medicina", totalBudget: 200000000, spent: 185000000, period: "2025", status: "em_revisao", responsavel: "Dr. Rui Andrade", responsavelRole: "Decano Fac. Medicina" },
  { id: "o4", name: "Infraestrutura e Manutenção", department: "Administração", totalBudget: 50000000, spent: 46000000, period: "2025", status: "em_revisao", responsavel: "Arq. Sofia Mendes", responsavelRole: "Gestora de Infraestruturas" },
  { id: "o5", name: "Tecnologias de Informação", department: "TI", totalBudget: 30000000, spent: 18500000, period: "2025", status: "activo", responsavel: "Dr. Luís Campos", responsavelRole: "Director de TI" },
  { id: "o6", name: "Investigação e Desenvolvimento", department: "Reitoria", totalBudget: 40000000, spent: 12000000, period: "2025", status: "activo", responsavel: "Prof. Joaquim Silva", responsavelRole: "Vice-Reitor para I&D" },
  { id: "o7", name: "Bolsas de Estudo", department: "Reitoria", totalBudget: 25000000, spent: 25000000, period: "2025", status: "esgotado", responsavel: "Dra. Inês Carvalho", responsavelRole: "Secretária Geral" },
  { id: "o8", name: "Eventos e Conferências", department: "Administração", totalBudget: 15000000, spent: 8200000, period: "2025", status: "activo", responsavel: "Dr. António Cunha", responsavelRole: "Director Administrativo" },
];

