import { announcements as baseAnnouncements } from "@/data/mockData";

export type AnnType = "urgente" | "evento" | "academico" | "geral";

export interface FinAnn {
  id: string;
  title: string;
  content: string;
  type: AnnType;
  date: string;
  author: string;
  department: string;
  cta?: "inscrever" | null;
  ctaDeadline?: string;
  ctaLink?: string;
  isMine?: boolean;
}

export const TYPE_META: Record<AnnType, { label: string; chip: string; dot: string; soft: string; text: string }> = {
  urgente:   { label: "Urgente",   chip: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500",    soft: "bg-red-50",    text: "text-red-700" },
  evento:    { label: "Evento",    chip: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700" },
  academico: { label: "Académico", chip: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500",   soft: "bg-blue-50",   text: "text-blue-700" },
  geral:     { label: "Geral",     chip: "bg-slate-50 text-slate-700 border-slate-200",    dot: "bg-slate-400",  soft: "bg-slate-50",  text: "text-slate-700" },
};

export const FIN_ANUNCIOS: FinAnn[] = [
  ...baseAnnouncements.map((a, i) => ({
    ...a,
    department: i % 2 === 0 ? "Direcção Académica" : "Reitoria",
    cta: i === 2 ? ("inscrever" as const) : null,
    ctaDeadline: i === 2 ? "20/02/2024" : undefined,
  })),
  { id: "f1", title: "Formação: Novas regras IVA 2024", content: "Sessão de formação obrigatória sobre as alterações fiscais em vigor. Aberta a inscrições para toda a equipa do Departamento Financeiro. A formação aborda os novos limiares de isenção, alterações no regime de IVA de caixa, e procedimentos atualizados de declaração trimestral. Inclui sessão prática com exemplos reais do nosso histórico.", type: "evento", date: "14/02/2024", author: "Dr. Manuel Sousa", department: "Departamento Financeiro", cta: "inscrever", ctaDeadline: "18/02/2024" },
  { id: "f2", title: "Fecho contabilístico de Janeiro concluído", content: "O processo de encerramento contabilístico de Janeiro foi finalizado com sucesso. Todos os relatórios mensais — balancete, demonstração de resultados, e mapa de tesouraria — estão disponíveis no EduDrive Financeiro na pasta correspondente. Quaisquer ajustes ou correções devem ser comunicados até dia 20/02.", type: "geral", date: "14/02/2024", author: "Departamento Financeiro", department: "Departamento Financeiro" },
  { id: "f3", title: "Reunião extraordinária — Orçamento 2025", content: "Convocados todos os responsáveis para reunião extraordinária dia 20/02 às 10h00 na Sala do Conselho. Agenda: revisão das propostas departamentais, ajustes ao plano de investimento, e aprovação preliminar do orçamento para o exercício de 2025. Presença obrigatória.", type: "urgente", date: "14/02/2024", author: "Reitoria", department: "Reitoria" },
  { id: "f4", title: "Workshop: Gestão de Tesouraria", content: "Workshop facultativo para a equipa financeira sobre boas práticas de gestão de tesouraria e otimização de fluxos de caixa. Inscrições abertas até 22/02. Limite de 15 participantes por sessão.", type: "evento", date: "13/02/2024", author: "Departamento Financeiro", department: "Departamento Financeiro", cta: "inscrever" },
];
