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
  studentId?: string;
  course?: string;
}

export const recentTransactions: Transaction[] = [
  { id: "t1", date: "2025-04-10", description: "Propina — Abril", category: "Propinas", amount: 52000, type: "receita", status: "pago", source: "Propinas", payer: "João Mendes", studentId: "EST-1001" },
  { id: "t2", date: "2025-04-09", description: "Salários — Docentes Fac. Engenharia", category: "Pessoal", amount: 8200000, type: "despesa", status: "aprovada", department: "Fac. Engenharia" },
  { id: "t3", date: "2025-04-08", description: "Manutenção Laboratórios", category: "Infraestrutura", amount: 1500000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Eng. Pedro Neto" },
  { id: "t4", date: "2025-04-07", description: "Propina — Abril", category: "Propinas", amount: 65000, type: "receita", status: "pago", source: "Propinas", payer: "Maria Santos", studentId: "EST-1002" },
  { id: "t5", date: "2025-04-06", description: "Material de Escritório", category: "Operacional", amount: 350000, type: "despesa", status: "aprovada", department: "Administração" },
  { id: "t6", date: "2025-04-05", description: "Propina — Abril", category: "Propinas", amount: 52000, type: "receita", status: "pendente", source: "Propinas", payer: "Carlos Ferreira", studentId: "EST-1003" },
  { id: "t7", date: "2025-04-04", description: "Seguro Institucional — Mensal", category: "Operacional", amount: 2100000, type: "despesa", status: "aprovada", department: "Administração" },
  { id: "t8", date: "2025-04-03", description: "Taxa de Exame", category: "Taxas", amount: 15000, type: "receita", status: "pago", source: "Taxas", payer: "Ana Lopes", studentId: "EST-1004" },
  { id: "t9", date: "2025-04-02", description: "Compra de Projetores", category: "Infraestrutura", amount: 4500000, type: "despesa", status: "rejeitada", department: "TI", requestedBy: "Dr. Luís Campos" },
  { id: "t10", date: "2025-04-01", description: "Propina — Março", category: "Propinas", amount: 52000, type: "receita", status: "em_atraso", source: "Propinas", payer: "Pedro Baptista", studentId: "EST-1005" },
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

// Per-student receitas
const studentNames = [
  "João Mendes", "Maria Santos", "Carlos Ferreira", "Ana Lopes", "Pedro Baptista",
  "Sofia Rodrigues", "André Costa", "Beatriz Silva", "Diogo Nascimento", "Catarina Almeida",
  "Ricardo Neto", "Inês Martins", "Hugo Tavares", "Marta Gonçalves", "Tiago Pereira",
  "Raquel Sousa", "Bruno Fernandes", "Cláudia Ramos", "Daniel Moreira", "Filipa Cardoso",
  "Miguel Oliveira", "Sara Teixeira", "Nuno Vieira", "Luísa Carvalho", "Rui Campos",
  "Diana Pinto", "Paulo Machado", "Teresa Figueiredo", "Vitor Correia", "Joana Barros",
  "Marco Reis", "Patrícia Duarte", "Simão Gomes", "Helena Castro", "Fábio Araújo",
  "Lara Henriques", "Gustavo Monteiro", "Vera Marques", "Sérgio Coelho", "Mónica Freitas",
];

const courses = ["Eng. Informática", "Eng. Civil", "Direito", "Medicina", "Arquitectura", "Ciências", "Letras", "Gestão"];
const receitaStatuses: Array<'pago' | 'pendente' | 'em_atraso'> = ["pago", "pago", "pago", "pendente", "em_atraso"];
const propinasAmounts = [52000, 55000, 58000, 62000, 65000, 70000, 48000, 50000];

function generateReceitas(): Transaction[] {
  const items: Transaction[] = [];
  let id = 1;
  for (let i = 0; i < 40; i++) {
    const name = studentNames[i];
    const course = courses[i % courses.length];
    const amount = propinasAmounts[i % propinasAmounts.length];
    const status = receitaStatuses[i % receitaStatuses.length];
    const day = String(Math.max(1, 28 - i)).padStart(2, "0");
    const month = i < 15 ? "04" : i < 30 ? "03" : "02";
    items.push({
      id: `r${id++}`, date: `2025-${month}-${day}`, description: "Propina Mensal", category: "Propinas",
      amount, type: "receita", status, source: "Propinas", payer: name, studentId: `EST-${1000 + i + 1}`, course,
    });
  }
  // Additional non-propina receitas
  items.push(
    { id: `r${id++}`, date: "2025-04-05", description: "Taxa de Exame", category: "Emolumentos", amount: 15000, type: "receita", status: "pago", source: "Emolumentos", payer: "João Mendes", studentId: "EST-1001", course: "Eng. Informática" },
    { id: `r${id++}`, date: "2025-04-03", description: "Taxa de Matrícula", category: "Emolumentos", amount: 25000, type: "receita", status: "pago", source: "Emolumentos", payer: "Sofia Rodrigues", studentId: "EST-1006", course: "Arquitectura" },
    { id: `r${id++}`, date: "2025-04-01", description: "Emolumentos de Inscrição", category: "Emolumentos", amount: 18000, type: "receita", status: "pendente", source: "Emolumentos", payer: "Carlos Ferreira", studentId: "EST-1003", course: "Direito" },
    { id: `r${id++}`, date: "2025-03-28", description: "Taxa de Certificado", category: "Emolumentos", amount: 8000, type: "receita", status: "pago", source: "Emolumentos", payer: "Ana Lopes", studentId: "EST-1004", course: "Medicina" },
    { id: `r${id++}`, date: "2025-03-25", description: "Propina Mensal", category: "Propinas", amount: 52000, type: "receita", status: "em_atraso", source: "Propinas", payer: "Diogo Nascimento", studentId: "EST-1009", course: "Eng. Informática" },
  );
  return items;
}

export const receitas: Transaction[] = generateReceitas();

export const despesas: Transaction[] = [
  { id: "d1", date: "2025-04-09", description: "Salários — Docentes Fac. Engenharia", category: "Salários", amount: 8200000, type: "despesa", status: "aprovada", department: "Fac. Engenharia", requestedBy: "RH" },
  { id: "d2", date: "2025-04-08", description: "Manutenção Laboratórios Bloco A", category: "Infraestrutura", amount: 1500000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Eng. Pedro Neto" },
  { id: "d3", date: "2025-04-07", description: "Resmas, Toners e Material de Escritório", category: "Material Didáctico", amount: 350000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "Secretaria" },
  { id: "d4", date: "2025-04-06", description: "Seguro Institucional — Abril", category: "Serviços e Utilities", amount: 2100000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "Direcção" },
  { id: "d5", date: "2025-04-05", description: "Compra de Projetores — 5 un.", category: "Infraestrutura", amount: 4500000, type: "despesa", status: "rejeitada", department: "TI", requestedBy: "Dr. Luís Campos" },
  { id: "d6", date: "2025-04-04", description: "Serviço de Limpeza — Abril", category: "Serviços e Utilities", amount: 900000, type: "despesa", status: "aprovada", department: "Serviços Gerais", requestedBy: "Coord. Serviços" },
  { id: "d7", date: "2025-04-03", description: "Salários — Staff Administrativo", category: "Salários", amount: 5400000, type: "despesa", status: "aprovada", department: "Administração", requestedBy: "RH" },
  { id: "d8", date: "2025-04-02", description: "Renovação Mobiliário Sala 305", category: "Infraestrutura", amount: 3200000, type: "despesa", status: "pendente", department: "Manutenção", requestedBy: "Decano Eng." },
  { id: "d9", date: "2025-04-01", description: "Licenças Software Académico", category: "Material Didáctico", amount: 6800000, type: "despesa", status: "aprovada", department: "TI", requestedBy: "Dir. TI" },
  { id: "d10", date: "2025-03-30", description: "Energia Eléctrica — Março", category: "Serviços e Utilities", amount: 4100000, type: "despesa", status: "aprovada", department: "Infraestrutura", requestedBy: "Administração" },
  { id: "d11", date: "2025-03-28", description: "Água e Saneamento — Março", category: "Serviços e Utilities", amount: 1800000, type: "despesa", status: "aprovada", department: "Infraestrutura", requestedBy: "Administração" },
  { id: "d12", date: "2025-03-25", description: "Combustível — Frota Institucional", category: "Serviços e Utilities", amount: 750000, type: "despesa", status: "aprovada", department: "Serviços Gerais", requestedBy: "Motorista Chefe" },
  { id: "d13", date: "2025-03-22", description: "Reagentes Laboratório Química", category: "Material Didáctico", amount: 2300000, type: "despesa", status: "pendente", department: "Fac. Ciências", requestedBy: "Prof. Ana Costa" },
  { id: "d14", date: "2025-03-20", description: "Impressão de Diplomas — 2024", category: "Material Didáctico", amount: 980000, type: "despesa", status: "aprovada", department: "Secretaria", requestedBy: "Secretária Académica" },
  { id: "d15", date: "2025-03-18", description: "Catering — Cerimónia Abertura", category: "Serviços e Utilities", amount: 1450000, type: "despesa", status: "aprovada", department: "Reitoria", requestedBy: "Gabinete do Reitor" },
  { id: "d16", date: "2025-03-15", description: "Reparação Ar Condicionado Bloco C", category: "Infraestrutura", amount: 620000, type: "despesa", status: "rejeitada", department: "Manutenção", requestedBy: "Técnico HVAC" },
  { id: "d17", date: "2025-03-12", description: "Bolsas de Mérito — Fevereiro", category: "Bolsas e Apoios", amount: 3500000, type: "despesa", status: "aprovada", department: "Reitoria", requestedBy: "Vice-Reitor" },
  { id: "d18", date: "2025-03-10", description: "Internet e Telecomunicações", category: "Serviços e Utilities", amount: 1200000, type: "despesa", status: "aprovada", department: "TI", requestedBy: "Dir. TI" },
  { id: "d19", date: "2025-03-08", description: "Uniformes — Pessoal de Apoio", category: "Salários", amount: 450000, type: "despesa", status: "pendente", department: "Serviços Gerais", requestedBy: "RH" },
  { id: "d20", date: "2025-03-05", description: "Bolsas de Investigação — Q1", category: "Investigação", amount: 1100000, type: "despesa", status: "aprovada", department: "Investigação", requestedBy: "Dir. Investigação" },
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
