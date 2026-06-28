export type AnexoTipo = "pdf" | "doc" | "image" | "sheet";

export interface DespesaAnexo {
  nome: string;
  tipo: AnexoTipo;
  size?: string;
}

export interface DespesaHistorico {
  data: string; // "12/06/2025 09:14"
  accao: string;
  actor?: string;
  nota?: string;
}

export type DespesaStatus = "pendente" | "aprovada" | "rejeitada" | "paga";

export interface FinDespesa {
  id: string;
  ref: string;
  date: string; // ISO
  dueDate?: string;
  description: string;
  category: string;
  amount: number;
  status: DespesaStatus;
  requestedBy: string;
  requesterRole?: string;
  requesterMatricula?: string;
  responsavel: string;
  responsavelRole?: string;
  justificacao: string;
  fornecedor?: string;
  nif?: string;
  metodoPagamento?: string;
  iban?: string;
  rubricaOrcamental?: string;
  facturaNum?: string;
  facturaData?: string;
  comprovativoNum?: string;
  comprovativoData?: string;
  anexos: DespesaAnexo[];
  historico: DespesaHistorico[];
}

export const finStatusMetaDespesa: Record<DespesaStatus, { label: string; cls: string; dot: string }> = {
  pendente:  { label: "Pendente",  cls: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  aprovada:  { label: "Aprovada",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rejeitada: { label: "Rejeitada", cls: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500" },
  paga:      { label: "Paga",      cls: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
};

export const prettyDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export const finDespesas: FinDespesa[] = [
  {
    id: "DESP-2025-0612",
    ref: "DESP-2025-0612",
    date: "2025-06-12T09:14:00",
    dueDate: "2025-06-20",
    description: "Aquisição de material didáctico — Laboratório de Arquitectura",
    category: "Material Didáctico",
    amount: 487500,
    status: "aprovada",
    requestedBy: "Eng. João Baptista",
    requesterRole: "Coordenador do Curso de Arquitectura",
    requesterMatricula: "DOC-0042",
    responsavel: "Sra. Catarina Lopes",
    responsavelRole: "Tesouraria — Direcção Financeira",
    fornecedor: "Papelaria Académica Lda.",
    nif: "5417889003",
    metodoPagamento: "Transferência bancária",
    iban: "AO06 0040 0000 5417 8890 0399 5",
    rubricaOrcamental: "02.01 — Material Pedagógico",
    facturaNum: "FT 2025/00184",
    facturaData: "2025-06-17",
    comprovativoNum: "TRX-44821",
    comprovativoData: "2025-06-19",
    justificacao:
      "Reposição de material para as aulas práticas do 2.º semestre — papel cavalinho A2, escalímetros, esquadros e tinta acrílica para maquetes. Pedido validado pelo Coordenador de Curso conforme orçamento aprovado para o ano lectivo 2024/2025.",
    anexos: [
      { nome: "Cotacao_PapelariaAcademica.pdf", tipo: "pdf", size: "184 KB" },
      { nome: "Factura_Pro-Forma_2025-0612.pdf", tipo: "pdf", size: "212 KB" },
      { nome: "Lista_Material_Laboratorio.xlsx", tipo: "sheet", size: "44 KB" },
      { nome: "Autorizacao_Coordenacao.pdf", tipo: "doc", size: "96 KB" },
    ],
    historico: [
      { data: "12/06/2025 09:14", accao: "Despesa submetida",          actor: "Eng. João Baptista",  nota: "Pedido de compra criado a partir do orçamento de Junho." },
      { data: "12/06/2025 11:42", accao: "Protocolo de entrada",       actor: "Secretaria Financeira", nota: "Documentação recebida e registada sob a ref. DESP-2025-0612." },
      { data: "13/06/2025 10:05", accao: "Análise documental",         actor: "Sra. Catarina Lopes",  nota: "Cotação e pro-forma validadas. Fornecedor activo no cadastro." },
      { data: "16/06/2025 14:20", accao: "Validação orçamental",       actor: "Direcção Financeira",   nota: "Rubrica 02.01 com saldo disponível. Conforme PAA 2024/2025." },
      { data: "18/06/2025 16:30", accao: "Despesa aprovada",           actor: "Dr. Manuel Sousa",      nota: "Aprovação para emissão de ordem de pagamento." },
    ],
  },
];

export const findDespesa = (id?: string) => finDespesas.find(d => d.id === id || d.ref === id);
