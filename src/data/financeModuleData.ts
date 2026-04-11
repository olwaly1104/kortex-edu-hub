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
  payer?: string;
}

export const recentTransactions: Transaction[] = [
  { id: "t1", date: "2025-04-10", description: "Propinas — Abril (Eng. Informática)", category: "Propinas", amount: 12500000, type: "receita", status: "pago", source: "Propinas" },
  { id: "t2", date: "2025-04-09", description: "Salários — Docentes Faculdade de Engenharia", category: "Pessoal", amount: 8200000, type: "despesa", status: "aprovada", department: "Fac. Engenharia" },
  { id: "t3", date: "2025-04-08", description: "Manutenção Laboratórios", category: "Infraestrutura", amount: 1500000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Eng. Pedro Neto" },
  { id: "t4", date: "2025-04-07", description: "Subsídio Governamental — Q1", category: "Subsídios", amount: 25000000, type: "receita", status: "pago", source: "Subsídios" },
  { id: "t5", date: "2025-04-06", description: "Material de Escritório", category: "Operacional", amount: 350000, type: "despesa", status: "aprovada", department: "Administração" },
  { id: "t6", date: "2025-04-05", description: "Propinas — Abril (Direito)", category: "Propinas", amount: 9800000, type: "receita", status: "pendente", source: "Propinas" },
  { id: "t7", date: "2025-04-04", description: "Seguro Institucional — Mensal", category: "Operacional", amount: 2100000, type: "despesa", status: "aprovada", department: "Administração" },
  { id: "t8", date: "2025-04-03", description: "Inscrições Exames — Extraordinários", category: "Taxas", amount: 3200000, type: "receita", status: "pago", source: "Outros" },
  { id: "t9", date: "2025-04-02", description: "Compra de Projetores — 5 unidades", category: "Infraestrutura", amount: 4500000, type: "despesa", status: "rejeitada", department: "TI", requestedBy: "Dr. Luís Campos" },
  { id: "t10", date: "2025-04-01", description: "Aluguer Espaço Conferência", category: "Outros", amount: 800000, type: "receita", status: "pago", source: "Outros" },
];

export const monthlyData = [
  { month: "Nov", receitas: 42000000, despesas: 35000000 },
  { month: "Dez", receitas: 38000000, despesas: 32000000 },
  { month: "Jan", receitas: 48000000, despesas: 37000000 },
  { month: "Fev", receitas: 45000000, despesas: 36000000 },
  { month: "Mar", receitas: 50000000, despesas: 39000000 },
  { month: "Abr", receitas: 47000000, despesas: 38000000 },
];

export const expenseCategories = [
  { name: "Pessoal", value: 58, color: "hsl(var(--primary))" },
  { name: "Operacional", value: 22, color: "hsl(var(--secondary))" },
  { name: "Infraestrutura", value: 12, color: "hsl(25, 95%, 53%)" },
  { name: "Outros", value: 8, color: "hsl(var(--muted-foreground))" },
];

export const alerts = [
  { id: "a1", type: "warning" as const, message: "3 pagamentos de propinas em atraso — Fac. Direito" },
  { id: "a2", type: "info" as const, message: "2 despesas pendentes de aprovação" },
  { id: "a3", type: "error" as const, message: "Orçamento de Infraestrutura atingiu 92% do limite" },
];

export const receitas: Transaction[] = [
  { id: "r1", date: "2025-04-10", description: "Propinas — Abril (Eng. Informática)", category: "Propinas", amount: 12500000, type: "receita", status: "pago", source: "Propinas", payer: "Fac. Engenharia — 245 estudantes" },
  { id: "r2", date: "2025-04-09", description: "Propinas — Abril (Direito)", category: "Propinas", amount: 9800000, type: "receita", status: "pendente", source: "Propinas", payer: "Fac. Direito — 189 estudantes" },
  { id: "r3", date: "2025-04-07", description: "Subsídio Governamental — Q1", category: "Subsídios", amount: 25000000, type: "receita", status: "pago", source: "Subsídios", payer: "Ministério do Ensino Superior" },
  { id: "r4", date: "2025-04-03", description: "Inscrições Exames — Extraordinários", category: "Taxas", amount: 3200000, type: "receita", status: "pago", source: "Outros", payer: "Secretaria Académica" },
  { id: "r5", date: "2025-04-01", description: "Aluguer Espaço Conferência", category: "Outros", amount: 800000, type: "receita", status: "pago", source: "Outros", payer: "Empresa ABC, Lda." },
  { id: "r6", date: "2025-03-28", description: "Propinas — Março (Medicina)", category: "Propinas", amount: 18500000, type: "receita", status: "pago", source: "Propinas", payer: "Fac. Medicina — 312 estudantes" },
  { id: "r7", date: "2025-03-25", description: "Propinas — Março (Eng. Civil)", category: "Propinas", amount: 7200000, type: "receita", status: "em_atraso", source: "Propinas", payer: "Fac. Engenharia — 98 estudantes" },
  { id: "r8", date: "2025-03-20", description: "Doação — Fundação XYZ", category: "Outros", amount: 5000000, type: "receita", status: "pago", source: "Outros", payer: "Fundação XYZ" },
  { id: "r9", date: "2025-03-15", description: "Taxas de Matrícula — 2º Semestre", category: "Taxas", amount: 14200000, type: "receita", status: "pago", source: "Propinas", payer: "Todas as Faculdades — 1.240 estudantes" },
  { id: "r10", date: "2025-03-10", description: "Propinas — Março (Arquitectura)", category: "Propinas", amount: 6300000, type: "receita", status: "pendente", source: "Propinas", payer: "Fac. Arquitectura — 76 estudantes" },
  { id: "r11", date: "2025-03-05", description: "Aluguer Cantina — Mensal", category: "Outros", amount: 1200000, type: "receita", status: "pago", source: "Outros", payer: "Restaurante Bom Sabor, Lda." },
  { id: "r12", date: "2025-02-28", description: "Propinas — Fevereiro (Eng. Informática)", category: "Propinas", amount: 12500000, type: "receita", status: "pago", source: "Propinas", payer: "Fac. Engenharia — 245 estudantes" },
];

export const despesas: Transaction[] = [
  { id: "d1", date: "2025-04-09", description: "Salários — Docentes Fac. Engenharia", category: "Pessoal", amount: 8200000, type: "despesa", status: "aprovada", department: "Fac. Engenharia", requestedBy: "RH" },
  { id: "d2", date: "2025-04-08", description: "Manutenção Laboratórios", category: "Infraestrutura", amount: 1500000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Eng. Pedro Neto" },
  { id: "d3", date: "2025-04-05", description: "Material de Escritório", category: "Operacional", amount: 350000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "Secretaria" },
  { id: "d4", date: "2025-04-04", description: "Seguro Institucional — Mensal", category: "Operacional", amount: 2100000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "Direcção" },
  { id: "d5", date: "2025-04-02", description: "Compra de Projetores — 5 unidades", category: "Infraestrutura", amount: 4500000, type: "despesa", status: "rejeitada", department: "TI", requestedBy: "Dr. Luís Campos" },
  { id: "d6", date: "2025-03-30", description: "Limpeza e Higienização", category: "Operacional", amount: 900000, type: "despesa", status: "aprovada", department: "Serviços Gerais", requestedBy: "Coord. Serviços" },
  { id: "d7", date: "2025-03-28", description: "Salários — Staff Administrativo", category: "Pessoal", amount: 5400000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "RH" },
  { id: "d8", date: "2025-03-25", description: "Renovação Mobiliário — Sala 305", category: "Infraestrutura", amount: 3200000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Decano Eng." },
  { id: "d9", date: "2025-03-20", description: "Licenças Software Académico", category: "Operacional", amount: 6800000, type: "despesa", status: "aprovada", department: "TI", requestedBy: "Dir. TI" },
  { id: "d10", date: "2025-03-15", description: "Energia Eléctrica — Março", category: "Operacional", amount: 4100000, type: "despesa", status: "aprovada", department: "Infraestrutura", requestedBy: "Administração" },
];

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
  bonus: number;
  status: 'pago' | 'pendente' | 'processando';
  payDate: string;
  hireDate: string;
  bankAccount: string;
}

export const salarios: Salary[] = [
  { id: "s1", employeeId: "FUN-001", name: "Prof. Dr. Ricardo Almeida", role: "Decano", department: "Fac. Engenharia", contractType: "efectivo", grossSalary: 950000, netSalary: 817000, deductions: 133000, bonus: 0, status: "pendente", payDate: "2025-04-30", hireDate: "2010-03-15", bankAccount: "****4521" },
  { id: "s2", employeeId: "FUN-002", name: "Prof. António Silva", role: "Professor Titular", department: "Fac. Engenharia", contractType: "efectivo", grossSalary: 850000, netSalary: 731000, deductions: 119000, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2012-09-01", bankAccount: "****7834" },
  { id: "s3", employeeId: "FUN-003", name: "Prof. Maria Santos", role: "Professora Associada", department: "Fac. Engenharia", contractType: "efectivo", grossSalary: 720000, netSalary: 619200, deductions: 100800, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2014-02-10", bankAccount: "****2198" },
  { id: "s4", employeeId: "FUN-004", name: "Dr. Fábio Costa", role: "Coordenador de Curso", department: "Fac. Engenharia", contractType: "efectivo", grossSalary: 680000, netSalary: 584800, deductions: 95200, bonus: 0, status: "pendente", payDate: "2025-04-30", hireDate: "2016-08-20", bankAccount: "****6543" },
  { id: "s5", employeeId: "FUN-005", name: "Prof. Pedro Ferreira", role: "Professor Auxiliar", department: "Fac. Engenharia", contractType: "contratado", grossSalary: 620000, netSalary: 533200, deductions: 86800, bonus: 0, status: "pendente", payDate: "2025-04-30", hireDate: "2019-01-15", bankAccount: "****9012" },
  { id: "s6", employeeId: "FUN-006", name: "Prof. Ana Costa", role: "Professora Associada", department: "Fac. Ciências", contractType: "efectivo", grossSalary: 720000, netSalary: 619200, deductions: 100800, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2013-04-01", bankAccount: "****3456" },
  { id: "s7", employeeId: "FUN-007", name: "Prof. David Lopes", role: "Professor Auxiliar", department: "Fac. Letras", contractType: "contratado", grossSalary: 580000, netSalary: 498800, deductions: 81200, bonus: 0, status: "processando", payDate: "2025-04-30", hireDate: "2020-09-01", bankAccount: "****7890" },
  { id: "s8", employeeId: "FUN-008", name: "Dra. Teresa Nascimento", role: "Secretária Académica", department: "Administração", contractType: "efectivo", grossSalary: 550000, netSalary: 473000, deductions: 77000, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2011-06-15", bankAccount: "****1234" },
  { id: "s9", employeeId: "FUN-009", name: "Eng. João Martins", role: "Técnico de TI", department: "TI", contractType: "contratado", grossSalary: 420000, netSalary: 361200, deductions: 58800, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2021-03-01", bankAccount: "****5678" },
  { id: "s10", employeeId: "FUN-010", name: "Ana Beatriz Soares", role: "Assistente Administrativa", department: "Administração", contractType: "colaborador", grossSalary: 350000, netSalary: 301000, deductions: 49000, bonus: 0, status: "processando", payDate: "2025-04-30", hireDate: "2022-01-10", bankAccount: "****4567" },
  { id: "s11", employeeId: "FUN-011", name: "Prof. Carlos Mendes", role: "Professor Titular", department: "Fac. Medicina", contractType: "efectivo", grossSalary: 920000, netSalary: 791200, deductions: 128800, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2009-09-01", bankAccount: "****8901" },
  { id: "s12", employeeId: "FUN-012", name: "Profª. Margarida Lopes", role: "Decana", department: "Fac. Medicina", contractType: "efectivo", grossSalary: 980000, netSalary: 842800, deductions: 137200, bonus: 0, status: "pendente", payDate: "2025-04-30", hireDate: "2008-03-01", bankAccount: "****2345" },
  { id: "s13", employeeId: "FUN-013", name: "Dr. Manuel Rodrigues", role: "Professor Auxiliar", department: "Fac. Direito", contractType: "efectivo", grossSalary: 650000, netSalary: 559000, deductions: 91000, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2017-02-15", bankAccount: "****6789" },
  { id: "s14", employeeId: "FUN-014", name: "Eng. Sofia Ribeiro", role: "Técnica de Laboratório", department: "Fac. Engenharia", contractType: "contratado", grossSalary: 480000, netSalary: 412800, deductions: 67200, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2020-06-01", bankAccount: "****0123" },
  { id: "s15", employeeId: "FUN-015", name: "José Alberto Campos", role: "Segurança", department: "Serviços Gerais", contractType: "contratado", grossSalary: 280000, netSalary: 240800, deductions: 39200, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2019-11-01", bankAccount: "****3457" },
  { id: "s16", employeeId: "FUN-016", name: "Maria do Céu Ferreira", role: "Bibliotecária", department: "Administração", contractType: "efectivo", grossSalary: 420000, netSalary: 361200, deductions: 58800, bonus: 0, status: "pago", payDate: "2025-03-31", hireDate: "2015-01-10", bankAccount: "****7891" },
  { id: "s17", employeeId: "FUN-017", name: "Prof. Nelson Baptista", role: "Professor Associado", department: "Fac. Arquitectura", contractType: "efectivo", grossSalary: 700000, netSalary: 602000, deductions: 98000, bonus: 0, status: "pendente", payDate: "2025-04-30", hireDate: "2014-09-01", bankAccount: "****2346" },
  { id: "s18", employeeId: "FUN-018", name: "Luís Nascimento", role: "Motorista", department: "Serviços Gerais", contractType: "colaborador", grossSalary: 250000, netSalary: 215000, deductions: 35000, bonus: 0, status: "processando", payDate: "2025-04-30", hireDate: "2021-07-01", bankAccount: "****5679" },
];

// Payroll budget data
export const payrollBudget = {
  totalBudget: 15000000, // monthly payroll budget
  currentMonth: "Abril 2025",
  previousMonth: "Março 2025",
};

// Department salary summary
export const departmentSalarySummary = [
  { department: "Fac. Engenharia", employees: 6, totalGross: 4300000, totalNet: 3698200, budgetAlloc: 5000000 },
  { department: "Fac. Medicina", employees: 2, totalGross: 1900000, totalNet: 1634000, budgetAlloc: 2200000 },
  { department: "Fac. Ciências", employees: 1, totalGross: 720000, totalNet: 619200, budgetAlloc: 900000 },
  { department: "Fac. Letras", employees: 1, totalGross: 580000, totalNet: 498800, budgetAlloc: 750000 },
  { department: "Fac. Direito", employees: 1, totalGross: 650000, totalNet: 559000, budgetAlloc: 800000 },
  { department: "Fac. Arquitectura", employees: 1, totalGross: 700000, totalNet: 602000, budgetAlloc: 850000 },
  { department: "Administração", employees: 3, totalGross: 1320000, totalNet: 1135200, budgetAlloc: 1600000 },
  { department: "TI", employees: 1, totalGross: 420000, totalNet: 361200, budgetAlloc: 500000 },
  { department: "Serviços Gerais", employees: 2, totalGross: 530000, totalNet: 455800, budgetAlloc: 650000 },
];

export interface Budget {
  id: string;
  name: string;
  department: string;
  totalBudget: number;
  spent: number;
  period: string;
  status: 'activo' | 'esgotado' | 'em_revisao';
}

export const orcamentos: Budget[] = [
  { id: "o1", name: "Orçamento Geral — Fac. Engenharia", department: "Fac. Engenharia", totalBudget: 120000000, spent: 78000000, period: "2025", status: "activo" },
  { id: "o2", name: "Orçamento Geral — Fac. Direito", department: "Fac. Direito", totalBudget: 85000000, spent: 52000000, period: "2025", status: "activo" },
  { id: "o3", name: "Orçamento Geral — Fac. Medicina", department: "Fac. Medicina", totalBudget: 200000000, spent: 185000000, period: "2025", status: "em_revisao" },
  { id: "o4", name: "Infraestrutura e Manutenção", department: "Administração", totalBudget: 50000000, spent: 46000000, period: "2025", status: "em_revisao" },
  { id: "o5", name: "Tecnologias de Informação", department: "TI", totalBudget: 30000000, spent: 18500000, period: "2025", status: "activo" },
  { id: "o6", name: "Investigação e Desenvolvimento", department: "Reitoria", totalBudget: 40000000, spent: 12000000, period: "2025", status: "activo" },
  { id: "o7", name: "Bolsas de Estudo", department: "Reitoria", totalBudget: 25000000, spent: 25000000, period: "2025", status: "esgotado" },
  { id: "o8", name: "Eventos e Conferências", department: "Administração", totalBudget: 15000000, spent: 8200000, period: "2025", status: "activo" },
];
