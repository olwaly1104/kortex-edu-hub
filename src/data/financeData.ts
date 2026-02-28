export interface Payment {
  id: string;
  description: string;
  category: 'tuition' | 'fee' | 'insurance' | 'materials';
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'upcoming';
  month?: string; // short label for progress bar
}

export const payments: Payment[] = [
  { id: '1', description: 'Taxa de matrícula', category: 'fee', dueDate: new Date(2025, 0, 15), amount: 35000, status: 'paid' },
  { id: '2', description: 'Seguro escolar', category: 'insurance', dueDate: new Date(2025, 0, 20), amount: 12000, status: 'paid' },
  { id: '3', description: 'Material didático', category: 'materials', dueDate: new Date(2025, 0, 25), amount: 28000, status: 'paid' },
  { id: '14', description: 'Emolumento — Certificado de notas', category: 'fee', dueDate: new Date(2025, 4, 15), amount: 15000, status: 'pending' },
  { id: '4', description: 'Propina — Janeiro', category: 'tuition', dueDate: new Date(2025, 0, 31), amount: 250000, status: 'paid', month: 'Jan' },
  { id: '5', description: 'Propina — Fevereiro', category: 'tuition', dueDate: new Date(2025, 1, 28), amount: 250000, status: 'paid', month: 'Fev' },
  { id: '6', description: 'Propina — Março', category: 'tuition', dueDate: new Date(2025, 2, 31), amount: 250000, status: 'overdue', month: 'Mar' },
  { id: '7', description: 'Propina — Abril', category: 'tuition', dueDate: new Date(2025, 3, 30), amount: 250000, status: 'pending', month: 'Abr' },
  { id: '8', description: 'Propina — Maio', category: 'tuition', dueDate: new Date(2025, 4, 31), amount: 250000, status: 'upcoming', month: 'Mai' },
  { id: '9', description: 'Propina — Junho', category: 'tuition', dueDate: new Date(2025, 5, 30), amount: 250000, status: 'upcoming', month: 'Jun' },
  { id: '10', description: 'Propina — Julho', category: 'tuition', dueDate: new Date(2025, 6, 31), amount: 250000, status: 'upcoming', month: 'Jul' },
  { id: '11', description: 'Propina — Agosto', category: 'tuition', dueDate: new Date(2025, 7, 31), amount: 250000, status: 'upcoming', month: 'Ago' },
  { id: '12', description: 'Propina — Setembro', category: 'tuition', dueDate: new Date(2025, 8, 30), amount: 250000, status: 'upcoming', month: 'Set' },
  { id: '13', description: 'Propina — Outubro', category: 'tuition', dueDate: new Date(2025, 9, 31), amount: 250000, status: 'upcoming', month: 'Out' },
];

export const tuitionPayments = payments.filter(p => p.category === 'tuition');

export const annualBreakdown = [
  { label: 'Propinas (10 mensalidades)', amount: 2500000 },
  { label: 'Taxa de matrícula', amount: 35000 },
  { label: 'Seguro escolar', amount: 12000 },
  { label: 'Material didático', amount: 28000 },
];

export const totalAnnual = 2500000;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' Kz';
}

export function formatDatePT(date: Date): string {
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}
