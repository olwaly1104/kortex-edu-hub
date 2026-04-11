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
  { id: "r1", date: "2025-04-10", description: "Propinas — Abril (Eng. Informática)", category: "Propinas", amount: 12500000, type: "receita", status: "pago", source: "Propinas" },
  { id: "r2", date: "2025-04-09", description: "Propinas — Abril (Direito)", category: "Propinas", amount: 9800000, type: "receita", status: "pendente", source: "Propinas" },
  { id: "r3", date: "2025-04-07", description: "Subsídio Governamental — Q1", category: "Subsídios", amount: 25000000, type: "receita", status: "pago", source: "Subsídios" },
  { id: "r4", date: "2025-04-03", description: "Inscrições Exames — Extraordinários", category: "Taxas", amount: 3200000, type: "receita", status: "pago", source: "Outros" },
  { id: "r5", date: "2025-04-01", description: "Aluguer Espaço Conferência", category: "Outros", amount: 800000, type: "receita", status: "pago", source: "Outros" },
  { id: "r6", date: "2025-03-28", description: "Propinas — Março (Medicina)", category: "Propinas", amount: 18500000, type: "receita", status: "pago", source: "Propinas" },
  { id: "r7", date: "2025-03-25", description: "Propinas — Março (Eng. Civil)", category: "Propinas", amount: 7200000, type: "receita", status: "em_atraso", source: "Propinas" },
  { id: "r8", date: "2025-03-20", description: "Doação — Fundação XYZ", category: "Outros", amount: 5000000, type: "receita", status: "pago", source: "Outros" },
  { id: "r9", date: "2025-03-15", description: "Taxas de Matrícula — 2º Semestre", category: "Taxas", amount: 14200000, type: "receita", status: "pago", source: "Propinas" },
  { id: "r10", date: "2025-03-10", description: "Propinas — Março (Arquitectura)", category: "Propinas", amount: 6300000, type: "receita", status: "pendente", source: "Propinas" },
  { id: "r11", date: "2025-03-05", description: "Aluguer Cantina — Mensal", category: "Outros", amount: 1200000, type: "receita", status: "pago", source: "Outros" },
  { id: "r12", date: "2025-02-28", description: "Propinas — Fevereiro (Eng. Informática)", category: "Propinas", amount: 12500000, type: "receita", status: "pago", source: "Propinas" },
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
  name: string;
  role: string;
  department: string;
  grossSalary: number;
  netSalary: number;
  status: 'pago' | 'pendente' | 'processando';
  payDate: string;
}

export const salarios: Salary[] = [
  { id: "s1", name: "Prof. António Silva", role: "Professor Titular", department: "Fac. Engenharia", grossSalary: 850000, netSalary: 731000, status: "pago", payDate: "2025-03-31" },
  { id: "s2", name: "Prof. Maria Santos", role: "Professora Associada", department: "Fac. Engenharia", grossSalary: 720000, netSalary: 619200, status: "pago", payDate: "2025-03-31" },
  { id: "s3", name: "Dr. Fábio Costa", role: "Coordenador de Curso", department: "Fac. Engenharia", grossSalary: 680000, netSalary: 584800, status: "pendente", payDate: "2025-04-30" },
  { id: "s4", name: "Prof. Pedro Ferreira", role: "Professor Auxiliar", department: "Fac. Engenharia", grossSalary: 620000, netSalary: 533200, status: "pendente", payDate: "2025-04-30" },
  { id: "s5", name: "Prof. Ana Costa", role: "Professora Associada", department: "Fac. Ciências", grossSalary: 720000, netSalary: 619200, status: "pago", payDate: "2025-03-31" },
  { id: "s6", name: "Prof. David Lopes", role: "Professor Auxiliar", department: "Fac. Letras", grossSalary: 580000, netSalary: 498800, status: "processando", payDate: "2025-04-30" },
  { id: "s7", name: "Dra. Teresa Nascimento", role: "Secretária Académica", department: "Administração", grossSalary: 550000, netSalary: 473000, status: "pago", payDate: "2025-03-31" },
  { id: "s8", name: "Prof. Dr. Ricardo Almeida", role: "Decano", department: "Fac. Engenharia", grossSalary: 950000, netSalary: 817000, status: "pendente", payDate: "2025-04-30" },
  { id: "s9", name: "Eng. João Martins", role: "Técnico de TI", department: "TI", grossSalary: 420000, netSalary: 361200, status: "pago", payDate: "2025-03-31" },
  { id: "s10", name: "Ana Beatriz Soares", role: "Assistente Administrativa", department: "Administração", grossSalary: 350000, netSalary: 301000, status: "processando", payDate: "2025-04-30" },
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
