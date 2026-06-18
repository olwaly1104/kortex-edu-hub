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


