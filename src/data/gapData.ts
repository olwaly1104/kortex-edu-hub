// GAP — Gabinete de Apoio ao Estudante mock data
export type TicketStatus = "aberto" | "em_andamento" | "aguarda_estudante" | "resolvido";
export type TicketPriority = "alta" | "media" | "baixa";
export type TicketCategoria =
  | "academico"
  | "psicologico"
  | "financeiro"
  | "documentacao"
  | "social"
  | "carreira"
  | "saude";

export interface GapTicket {
  id: string;
  estudante: string;
  matricula: string;
  curso: string;
  ano: number;
  assunto: string;
  categoria: TicketCategoria;
  descricao: string;
  estado: TicketStatus;
  prioridade: TicketPriority;
  data: string;
  ultimaResposta?: string;
  responsavel?: string;
  tags?: string[];
  mensagens?: { autor: string; isStaff: boolean; data: string; texto: string }[];
}

export interface GapAtendimento {
  id: string;
  estudante: string;
  matricula: string;
  curso: string;
  motivo: string;
  categoria: TicketCategoria;
  data: string;
  hora: string;
  duracao: string;
  tipo: "presencial" | "online";
  estado: "agendado" | "concluido" | "cancelado" | "remarcar";
  responsavel: string;
  sala?: string;
  notas?: string;
}

export interface GapEstudanteSeguimento {
  id: string;
  nome: string;
  matricula: string;
  curso: string;
  ano: number;
  risco: "baixo" | "medio" | "alto";
  acompanhamentos: number;
  ultimoContacto: string;
  responsavel: string;
  motivo: string;
}

export interface GapArtigo {
  id: string;
  titulo: string;
  categoria: TicketCategoria;
  resumo: string;
  visualizacoes: number;
  atualizado: string;
  destaque?: boolean;
}

export const categoriaConfig: Record<TicketCategoria, { label: string; color: string }> = {
  academico: { label: "Académico", color: "bg-primary/10 text-primary border-primary/20" },
  psicologico: { label: "Psicológico", color: "bg-purple-100 text-purple-700 border-purple-200" },
  financeiro: { label: "Financeiro", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  documentacao: { label: "Documentação", color: "bg-blue-100 text-blue-700 border-blue-200" },
  social: { label: "Social", color: "bg-pink-100 text-pink-700 border-pink-200" },
  carreira: { label: "Carreira", color: "bg-amber-100 text-amber-700 border-amber-200" },
  saude: { label: "Saúde", color: "bg-red-100 text-red-700 border-red-200" },
};

export const ticketStatusConfig: Record<TicketStatus, { label: string; color: string }> = {
  aberto: { label: "Aberto", color: "bg-orange-100 text-orange-700 border-orange-200" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-700 border-blue-200" },
  aguarda_estudante: { label: "Aguarda Estudante", color: "bg-amber-100 text-amber-700 border-amber-200" },
  resolvido: { label: "Resolvido", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export const prioridadeConfig: Record<TicketPriority, { label: string; color: string }> = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground border-border" },
};

export const gapTickets: GapTicket[] = [
  {
    id: "GAP-001", estudante: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", ano: 2,
    assunto: "Sobrecarga académica e ansiedade nas avaliações",
    categoria: "psicologico", prioridade: "alta", estado: "em_andamento",
    descricao: "Tenho dificuldade em gerir o stress antes das épocas de avaliação. Procuro acompanhamento.",
    data: "2025-01-13", ultimaResposta: "2025-01-14", responsavel: "Dra. Helena Cabral",
    tags: ["ansiedade", "stress académico"],
    mensagens: [
      { autor: "Ana Luísa Ferreira", isStaff: false, data: "2025-01-13 09:24", texto: "Tenho dificuldade em gerir o stress antes das épocas de avaliação. Procuro acompanhamento." },
      { autor: "Dra. Helena Cabral", isStaff: true, data: "2025-01-13 11:02", texto: "Olá Ana, obrigada pela tua mensagem. Vamos agendar uma primeira sessão presencial. Qual o teu horário disponível?" },
      { autor: "Ana Luísa Ferreira", isStaff: false, data: "2025-01-14 08:10", texto: "Posso quinta-feira de manhã, das 9h às 11h." },
    ],
  },
  {
    id: "GAP-002", estudante: "Carlos Mendes", matricula: "2024015", curso: "Direito", ano: 1,
    assunto: "Dificuldade de adaptação ao 1º ano",
    categoria: "academico", prioridade: "media", estado: "aberto",
    descricao: "Sinto-me perdido com a metodologia de estudo do curso de Direito. Preciso de orientação.",
    data: "2025-01-14", responsavel: "Dr. João Tavares",
    tags: ["adaptação", "métodos de estudo"],
  },
  {
    id: "GAP-003", estudante: "Maria João Santos", matricula: "2023042", curso: "Medicina", ano: 3,
    assunto: "Apoio para bolsa de estudo",
    categoria: "financeiro", prioridade: "alta", estado: "aguarda_estudante",
    descricao: "Necessito de orientação sobre o processo de candidatura à bolsa social INAGBE.",
    data: "2025-01-12", ultimaResposta: "2025-01-13", responsavel: "Dra. Helena Cabral",
    tags: ["bolsa", "INAGBE"],
  },
  {
    id: "GAP-004", estudante: "Pedro Almeida", matricula: "2024033", curso: "Economia", ano: 2,
    assunto: "Orientação vocacional — mudança de curso",
    categoria: "carreira", prioridade: "media", estado: "em_andamento",
    descricao: "Estou a ponderar mudar para Gestão. Gostaria de uma sessão de orientação vocacional.",
    data: "2025-01-10", ultimaResposta: "2025-01-13", responsavel: "Dr. João Tavares",
    tags: ["vocacional", "mudança curso"],
  },
  {
    id: "GAP-005", estudante: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", ano: 4,
    assunto: "Encaminhamento para serviço médico",
    categoria: "saude", prioridade: "alta", estado: "resolvido",
    descricao: "Necessito de encaminhamento para a clínica parceira da universidade.",
    data: "2025-01-08", ultimaResposta: "2025-01-09", responsavel: "Dra. Helena Cabral",
  },
  {
    id: "GAP-006", estudante: "João Baptista", matricula: "2024050", curso: "Gestão", ano: 1,
    assunto: "Conflito interpessoal em trabalho de grupo",
    categoria: "social", prioridade: "media", estado: "aberto",
    descricao: "Há tensões no meu grupo de trabalho que estão a afectar o desempenho. Procuro mediação.",
    data: "2025-01-14", responsavel: "Dr. João Tavares",
  },
  {
    id: "GAP-007", estudante: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", ano: 3,
    assunto: "Estágio curricular — apoio na procura",
    categoria: "carreira", prioridade: "baixa", estado: "em_andamento",
    descricao: "Procuro orientação para encontrar estágio curricular na área clínica.",
    data: "2025-01-11", ultimaResposta: "2025-01-13", responsavel: "Dra. Helena Cabral",
  },
  {
    id: "GAP-008", estudante: "Tiago Mateus", matricula: "2024077", curso: "Arquitectura", ano: 2,
    assunto: "Solicitação de declaração para visto",
    categoria: "documentacao", prioridade: "alta", estado: "aberto",
    descricao: "Preciso de declaração urgente para renovação de visto de estudante.",
    data: "2025-01-14",
    tags: ["urgente", "visto"],
  },
];

export const gapAtendimentos: GapAtendimento[] = [
  { id: "AT-001", estudante: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", motivo: "1ª sessão de acompanhamento psicológico", categoria: "psicologico", data: "2025-01-16", hora: "09:00", duracao: "50 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1" },
  { id: "AT-002", estudante: "Carlos Mendes", matricula: "2024015", curso: "Direito", motivo: "Orientação académica — métodos de estudo", categoria: "academico", data: "2025-01-16", hora: "10:30", duracao: "40 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2" },
  { id: "AT-003", estudante: "Pedro Almeida", matricula: "2024033", curso: "Economia", motivo: "Orientação vocacional", categoria: "carreira", data: "2025-01-16", hora: "14:00", duracao: "60 min", tipo: "online", estado: "agendado", responsavel: "Dr. João Tavares" },
  { id: "AT-004", estudante: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", motivo: "Acompanhamento de estágio", categoria: "carreira", data: "2025-01-17", hora: "11:00", duracao: "30 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1" },
  { id: "AT-005", estudante: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", motivo: "Encaminhamento médico", categoria: "saude", data: "2025-01-09", hora: "09:30", duracao: "20 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral", notas: "Encaminhamento entregue. Estudante satisfeita com a resolução." },
  { id: "AT-006", estudante: "Maria João Santos", matricula: "2023042", curso: "Medicina", motivo: "Apoio candidatura bolsa INAGBE", categoria: "financeiro", data: "2025-01-15", hora: "15:00", duracao: "45 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral" },
  { id: "AT-007", estudante: "João Baptista", matricula: "2024050", curso: "Gestão", motivo: "Mediação de conflito", categoria: "social", data: "2025-01-17", hora: "16:00", duracao: "60 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2" },
];

export const gapEstudantesSeguimento: GapEstudanteSeguimento[] = [
  { id: "S-001", nome: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", ano: 2, risco: "alto", acompanhamentos: 4, ultimoContacto: "2025-01-14", responsavel: "Dra. Helena Cabral", motivo: "Ansiedade académica" },
  { id: "S-002", nome: "Carlos Mendes", matricula: "2024015", curso: "Direito", ano: 1, risco: "medio", acompanhamentos: 2, ultimoContacto: "2025-01-13", responsavel: "Dr. João Tavares", motivo: "Adaptação ao curso" },
  { id: "S-003", nome: "Pedro Almeida", matricula: "2024033", curso: "Economia", ano: 2, risco: "medio", acompanhamentos: 3, ultimoContacto: "2025-01-13", responsavel: "Dr. João Tavares", motivo: "Orientação vocacional" },
  { id: "S-004", nome: "Maria João Santos", matricula: "2023042", curso: "Medicina", ano: 3, risco: "baixo", acompanhamentos: 1, ultimoContacto: "2025-01-13", responsavel: "Dra. Helena Cabral", motivo: "Apoio financeiro" },
  { id: "S-005", nome: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", ano: 3, risco: "baixo", acompanhamentos: 2, ultimoContacto: "2025-01-13", responsavel: "Dra. Helena Cabral", motivo: "Estágio curricular" },
  { id: "S-006", nome: "João Baptista", matricula: "2024050", curso: "Gestão", ano: 1, risco: "medio", acompanhamentos: 1, ultimoContacto: "2025-01-14", responsavel: "Dr. João Tavares", motivo: "Conflito grupo" },
];

export const gapArtigos: GapArtigo[] = [
  { id: "A1", titulo: "Como gerir o stress antes das avaliações", categoria: "psicologico", resumo: "Técnicas práticas de respiração, organização e gestão do tempo para reduzir a ansiedade.", visualizacoes: 1248, atualizado: "2025-01-05", destaque: true },
  { id: "A2", titulo: "Guia de candidatura à bolsa INAGBE", categoria: "financeiro", resumo: "Passo-a-passo do processo, documentos necessários e prazos da bolsa social.", visualizacoes: 982, atualizado: "2024-12-18", destaque: true },
  { id: "A3", titulo: "Métodos de estudo eficazes para o 1º ano", categoria: "academico", resumo: "Estratégias adaptadas a cada área de conhecimento para facilitar a transição académica.", visualizacoes: 754, atualizado: "2025-01-02" },
  { id: "A4", titulo: "Orientação vocacional — quando mudar de curso?", categoria: "carreira", resumo: "Sinais a considerar e o processo institucional de mudança ou transferência interna.", visualizacoes: 612, atualizado: "2024-12-22" },
  { id: "A5", titulo: "Mediação de conflitos em trabalhos de grupo", categoria: "social", resumo: "Como abordar tensões interpessoais e construir dinâmicas saudáveis de colaboração.", visualizacoes: 421, atualizado: "2024-12-15" },
  { id: "A6", titulo: "Documentos académicos — pedidos urgentes", categoria: "documentacao", resumo: "Lista de documentos disponíveis no GAP e prazos típicos de emissão.", visualizacoes: 537, atualizado: "2025-01-08" },
];

export const gapKpis = {
  ticketsAbertos: gapTickets.filter(t => t.estado === "aberto").length,
  ticketsEmAndamento: gapTickets.filter(t => t.estado === "em_andamento").length,
  ticketsResolvidos30d: 47,
  atendimentosHoje: gapAtendimentos.filter(a => a.data === "2025-01-16" && a.estado === "agendado").length,
  estudantesAtivos: gapEstudantesSeguimento.length,
  estudantesRiscoAlto: gapEstudantesSeguimento.filter(e => e.risco === "alto").length,
  tempoMedioResposta: "4h 12min",
  satisfacao: 94,
};

export const gapCategoriaStats = (Object.keys(categoriaConfig) as TicketCategoria[]).map(cat => ({
  categoria: cat,
  label: categoriaConfig[cat].label,
  count: gapTickets.filter(t => t.categoria === cat).length + gapAtendimentos.filter(a => a.categoria === cat).length,
}));
