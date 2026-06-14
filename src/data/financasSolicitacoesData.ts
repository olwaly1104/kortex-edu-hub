import {
  Receipt, TrendingUp, FileText, Wallet, Coins, Sparkles,
  Clock, CheckCircle2, XCircle, AlertTriangle, BadgeCheck, type LucideIcon,
} from "lucide-react";

export type FinDirection = "recebida" | "enviada";
export type FinStatus = "pendente" | "atrasado" | "em_execucao" | "executada" | "rejeitado";
export type FinType =
  | "reembolso" | "orcamento" | "fornecedor"
  | "antecipacao" | "verba" | "outro";

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

export const finSolicitacoes: FinSolicitacao[] = [
  {
    id: "fs1", ref: "REQ-2025-0412", direction: "recebida", type: "reembolso",
    title: "Reembolso — Conferência Internacional Lisboa",
    description: "Reembolso de viagem, alojamento e inscrição da conferência IEEE 2025 realizada entre 12 e 16 de Março em Lisboa. Inclui bilhetes de avião, três noites de hotel e taxa de inscrição.",
    requester: "Prof. António Silva", requesterRole: "Docente — Fac. Engenharia", requesterMatricula: "DOC-1042",
    date: "2026-06-08", dueDate: "2026-06-22", status: "pendente",
    anexos: [
      { nome: "Fatura-hotel-Lisboa.pdf", tamanho: "184 KB", tipo: "pdf" },
      { nome: "Bilhete-aviao.pdf", tamanho: "92 KB", tipo: "pdf" },
      { nome: "Recibo-inscricao-IEEE.pdf", tamanho: "76 KB", tipo: "pdf" },
    ],
    historico: [
      { data: "2025-04-08 09:14", actor: "Prof. António Silva", accao: "Solicitação submetida" },
      { data: "2025-04-08 09:15", actor: "Sistema", accao: "Encaminhada para Direcção Financeira" },
    ],
  },
  {
    id: "fs2", ref: "REQ-2025-0411", direction: "recebida", type: "orcamento",
    title: "Reforço Orçamental — Laboratório de Redes",
    description: "Solicitação de reforço orçamental para aquisição de switches geridos Cisco e equipamento de teste de rede destinado ao laboratório de redes do 3.º ano.",
    requester: "Decano Fac. Engenharia", requesterRole: "Decano", requesterMatricula: "DEC-0007",
    date: "2025-04-05", dueDate: "2025-04-15", status: "atrasado",
    anexos: [
      { nome: "Proforma-fornecedor.pdf", tamanho: "212 KB", tipo: "pdf" },
      { nome: "Justificacao-tecnica.docx", tamanho: "48 KB", tipo: "doc" },
    ],
    historico: [
      { data: "2025-04-05 11:02", actor: "Decano Fac. Engenharia", accao: "Solicitação submetida" },
    ],
  },
  {
    id: "fs3", ref: "REQ-2025-0408", direction: "recebida", type: "fornecedor",
    title: "Pagamento Fornecedor — Reagentes Químicos",
    description: "Liquidação da factura FT-2025/0412 ao fornecedor LabSupplies Angola, vencida a 30/04.",
    requester: "Coord. Fac. Ciências", requesterRole: "Coordenador", requesterMatricula: "COR-0021",
    date: "2025-04-02", status: "em_execucao",
    anexos: [{ nome: "Factura-LabSupplies.pdf", tamanho: "156 KB", tipo: "pdf" }],
    historico: [
      { data: "2025-04-02 10:00", actor: "Coord. Fac. Ciências", accao: "Solicitação submetida" },
      { data: "2025-04-03 14:20", actor: "Direcção Financeira", accao: "Solicitação aprovada", nota: "Pagamento agendado para o dia seguinte.", anexos: [{ nome: "Despacho-aprovacao.pdf", tamanho: "62 KB", tipo: "pdf" }] },
    ],
  },
  {
    id: "fs4", ref: "REQ-2025-0402", direction: "recebida", type: "antecipacao",
    title: "Antecipação Salarial — Motivos pessoais",
    description: "Pedido de adiantamento de 50% do salário do mês corrente por motivos pessoais devidamente justificados.",
    requester: "Eng. João Martins", requesterRole: "Técnico de Manutenção", requesterMatricula: "FUN-0188",
    date: "2025-03-28", status: "rejeitado",
    historico: [
      { data: "2025-03-28 08:30", actor: "Eng. João Martins", accao: "Solicitação submetida" },
      { data: "2025-03-29 16:00", actor: "Direcção Financeira", accao: "Solicitação rejeitada", nota: "Já existe antecipação concedida no trimestre corrente.", anexos: [{ nome: "Parecer-RH.pdf", tamanho: "48 KB", tipo: "pdf" }] },
    ],
  },
  {
    id: "fs5", ref: "REQ-2025-0399", direction: "recebida", type: "verba",
    title: "Verba Extra — Evento de Boas-Vindas",
    description: "Apoio financeiro à organização do evento de recepção dos novos estudantes do ano lectivo 2025/26.",
    requester: "Assoc. Estudantes", requesterRole: "AEUPRA", requesterMatricula: "AEU-0001",
    date: "2025-03-25", dueDate: "2025-04-20", status: "atrasado",
    anexos: [
      { nome: "Plano-evento.pdf", tamanho: "320 KB", tipo: "pdf" },
      { nome: "Orcamento-detalhado.xlsx", tamanho: "44 KB", tipo: "sheet" },
    ],
    historico: [
      { data: "2025-03-25 14:00", actor: "AEUPRA", accao: "Solicitação submetida" },
    ],
  },
  {
    id: "fs6", ref: "REQ-2025-0390", direction: "recebida", type: "fornecedor",
    title: "Pagamento Fornecedor — Material Gráfico",
    description: "Pagamento da factura FT-2025/0388 à gráfica institucional pelos materiais do evento de Março.",
    requester: "Secretaria Geral", requesterRole: "Sec. Académica", requesterMatricula: "SEC-0011",
    date: "2025-03-22", status: "executada",
    historico: [
      { data: "2025-03-22 09:00", actor: "Secretaria Geral", accao: "Solicitação submetida" },
      { data: "2025-03-23 11:30", actor: "Direcção Financeira", accao: "Solicitação aprovada", anexos: [{ nome: "Autorizacao-pagamento.pdf", tamanho: "54 KB", tipo: "pdf" }] },
      { data: "2025-03-24 10:15", actor: "Direcção Financeira", accao: "Solicitação executada", nota: "Pagamento processado por transferência bancária.", anexos: [{ nome: "Comprovativo-TRF-BAI.pdf", tamanho: "112 KB", tipo: "pdf" }] },
    ],
  },
  {
    id: "fs7", ref: "REQ-2025-0381", direction: "recebida", type: "reembolso",
    title: "Reembolso — Deslocação Inspecção",
    description: "Reembolso de combustível e portagens das visitas aos campi externos.",
    requester: "Dr. Carlos Bento", requesterRole: "Inspector Académico", requesterMatricula: "INS-0003",
    date: "2025-03-18", status: "executada",
    historico: [
      { data: "2025-03-18 17:00", actor: "Dr. Carlos Bento", accao: "Solicitação submetida" },
      { data: "2025-03-19 10:00", actor: "Direcção Financeira", accao: "Solicitação aprovada" },
      { data: "2025-03-20 09:30", actor: "Direcção Financeira", accao: "Solicitação executada", nota: "Reembolso liquidado." },
    ],
  },
  {
    id: "fs8", ref: "REQ-2025-0405", direction: "enviada", type: "orcamento",
    title: "Pedido de Aprovação — Orçamento Q2",
    description: "Submissão do orçamento consolidado do 2º trimestre ao Magnífico Reitor para aprovação.",
    requester: "Direcção Financeira", destinatario: "Magnífico Reitor",
    responsavel: "Prof. Dr. António Mendes · Reitor",
    date: "2026-06-01", dueDate: "2026-06-25", status: "pendente",
    anexos: [
      { nome: "Orcamento-Q2-2025.pdf", tamanho: "612 KB", tipo: "pdf" },
      { nome: "Mapa-execucao-Q1.xlsx", tamanho: "88 KB", tipo: "sheet" },
    ],
    historico: [
      { data: "2025-04-01 08:00", actor: "Direcção Financeira", accao: "Solicitação submetida" },
    ],
  },
  {
    id: "fs9", ref: "REQ-2025-0386", direction: "enviada", type: "outro",
    title: "Auditoria Externa — Aprovação KPMG",
    description: "Pedido de contratação da firma KPMG para auditoria anual de contas.",
    requester: "Direcção Financeira", destinatario: "Magnífico Reitor",
    responsavel: "Prof. Dr. António Mendes · Reitor",
    date: "2025-03-26", status: "executada",
    historico: [
      { data: "2025-03-26 09:00", actor: "Direcção Financeira", accao: "Solicitação submetida" },
      { data: "2025-03-28 15:00", actor: "Magnífico Reitor", accao: "Solicitação aprovada" },
      { data: "2025-03-30 11:00", actor: "Direcção Financeira", accao: "Solicitação executada", nota: "Contrato KPMG formalizado." },
    ],
  },
  {
    id: "fs10", ref: "REQ-2025-0378", direction: "enviada", type: "verba",
    title: "Reforço de Tesouraria — Bolsas de Mérito",
    description: "Solicitação de transferência adicional para o fundo de bolsas de mérito do 2º semestre.",
    requester: "Direcção Financeira", destinatario: "Conselho de Gestão",
    responsavel: "Conselho de Gestão · Órgão Colegial",
    date: "2025-03-20", dueDate: "2025-04-12", status: "atrasado",
    historico: [
      { data: "2025-03-20 12:00", actor: "Direcção Financeira", accao: "Solicitação submetida" },
    ],
  },
];

export const finTypeMeta: Record<FinType, { label: string; icon: LucideIcon; cls: string; dot: string }> = {
  reembolso:   { label: "Reembolso",   icon: Receipt,    cls: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500" },
  orcamento:   { label: "Orçamento",   icon: TrendingUp, cls: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  fornecedor:  { label: "Fornecedor",  icon: FileText,   cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-500" },
  antecipacao: { label: "Antecipação", icon: Wallet,     cls: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-500" },
  verba:       { label: "Verba",       icon: Coins,      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
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
