import {
  Receipt, TrendingUp, FileText, Wallet, Coins, Sparkles,
  Clock, CheckCircle2, XCircle, AlertTriangle, BadgeCheck,
  Plane, HeartPulse, Package, GraduationCap, Stamp, Laptop,
  type LucideIcon,
} from "lucide-react";

export type FinDirection = "recebida" | "enviada";
export type FinStatus = "pendente" | "atrasado" | "em_execucao" | "executada" | "rejeitado";
export type FinType =
  | "reembolso" | "orcamento" | "fornecedor"
  | "antecipacao" | "verba"
  | "ferias" | "licenca" | "declaracao" | "material" | "formacao" | "ti"
  | "outro";


export interface FinHistorico {
  data: string;
  actor: string;
  accao: string;
  nota?: string;
  anexos?: FinAnexo[];
}

export interface FinAnexo {
  nome: string;
  tamanho: string;
  tipo: "pdf" | "image" | "doc" | "sheet";
}

export interface FinSolicitacao {
  id: string;
  ref: string;
  direction: FinDirection;
  type: FinType;
  title: string;
  description: string;
  requester: string;
  requesterRole?: string;
  requesterMatricula?: string;
  destinatario?: string;
  responsavel?: string;
  date: string;
  dueDate?: string;
  status: FinStatus;
  anexos?: FinAnexo[];
  historico: FinHistorico[];
}

// Mock data removed. Use the `useFinSolicitacoes` hook to read live data from the backend.


export const finTypeMeta: Record<FinType, { label: string; icon: LucideIcon; cls: string; dot: string }> = {
  reembolso:   { label: "Reembolso",   icon: Receipt,    cls: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  orcamento:   { label: "Orçamento",   icon: TrendingUp, cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  fornecedor:  { label: "Fornecedor",  icon: FileText,   cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-500" },
  antecipacao: { label: "Antecipação", icon: Wallet,     cls: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-500" },
  verba:       { label: "Verba",       icon: Coins,      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  ferias:      { label: "Férias",      icon: Plane,      cls: "bg-sky-50 text-sky-700 border-sky-200",          dot: "bg-sky-500" },
  licenca:     { label: "Pessoal",     icon: HeartPulse, cls: "bg-pink-50 text-pink-700 border-pink-200",       dot: "bg-pink-500" },
  declaracao:  { label: "Declaração",  icon: Stamp,      cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  material:    { label: "Material",    icon: Package,    cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  formacao:    { label: "Formação",    icon: GraduationCap, cls: "bg-teal-50 text-teal-700 border-teal-200",    dot: "bg-teal-500" },
  ti:          { label: "Acesso / TI", icon: Laptop,     cls: "bg-cyan-50 text-cyan-700 border-cyan-200",       dot: "bg-cyan-500" },
  outro:       { label: "Outro",       icon: Sparkles,   cls: "bg-slate-50 text-slate-700 border-slate-200",    dot: "bg-slate-500" },
};


export const finStatusMeta: Record<FinStatus, { label: string; cls: string; dot: string; icon: LucideIcon }> = {
  pendente:  { label: "Pendente",  cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   icon: Clock },
  atrasado:  { label: "Em atraso", cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500",  icon: AlertTriangle },
  em_execucao: { label: "Em execução", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
  executada: { label: "Executada", cls: "bg-teal-50 text-teal-700 border-teal-200",          dot: "bg-teal-500",    icon: BadgeCheck },
  rejeitado: { label: "Rejeitada", cls: "bg-red-50 text-red-600 border-red-200",             dot: "bg-red-500",     icon: XCircle },
};

export const MONTHS_PT_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export function prettyDate(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2,"0")} ${MONTHS_PT_SHORT[m-1]} ${y}`;
}
