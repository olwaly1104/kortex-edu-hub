// GAP — Gabinete de Apoio ao Discente
// Modelo: pedidos (Solicitações) submetidos pelo discente no Portal e
// encaminhados automaticamente ao departamento responsável (CTI, Académica,
// Financeiro, GAP, Secretaria). O GAP monitoriza a execução — não responde.

export type Destino = "CTI" | "Académica" | "Financeiro" | "Faculdade" | "GAP" | "Secretaria";

export type EstadoSolicitacao =
  | "recebida"        // pendente — submetida pelo discente, aguarda início
  | "em_execucao"     // destino a tratar
  | "concluida"
  | "rejeitada"
  | "em_atraso";      // SLA ultrapassado (estado virtual derivado)

export type Prioridade = "alta" | "media" | "baixa";

// ─── Tipos de pedido (catálogo oficial por departamento) ─────────────────────
// Catálogos extraídos dos relatórios oficiais do GAP (19 Dez 2025):
// CTI · Área Académica · Área Financeira · Faculdades.
export type TipoSolicitacao = string;

// Categorias macro: alinhadas com a área funcional do pedido (não com o departamento).
export type Categoria = "Tecnológico" | "Académico" | "Financeiro";

export const tipoConfig: Record<string, { label: string; categoria: Categoria; destino: Destino; slaDias: number }> = {
  // ── CTI (Tecnológico) ────────────────────────────────────────────────────
  actualizacao_dados_portal:   { label: "Actualização de dados — Portal do Discente", categoria: "Tecnológico", destino: "CTI", slaDias: 2 },
  actualizacao_dados_email:    { label: "Actualização de dados — Email institucional", categoria: "Tecnológico", destino: "CTI", slaDias: 2 },
  actualizacao_dados_canal:    { label: "Actualização de dados — Canal de Discente", categoria: "Tecnológico", destino: "CTI", slaDias: 3 },
  actualizacao_calculo_medias: { label: "Actualização do cálculo de médias no sistema", categoria: "Tecnológico", destino: "CTI", slaDias: 5 },
  segunda_via_cartao:          { label: "Pedido de 2ª via do cartão de discente", categoria: "Tecnológico", destino: "CTI", slaDias: 7 },
  falha_cartao:                { label: "Falha de funcionamento do cartão de discente", categoria: "Tecnológico", destino: "CTI", slaDias: 5 },
  anulacao_cartao:             { label: "Pedido de anulação do cartão de discente", categoria: "Tecnológico", destino: "CTI", slaDias: 3 },

  // ── Área Académica (Académico) ───────────────────────────────────────────
  inscricao_semestre:          { label: "Inscrição para o Iº/IIº Semestre", categoria: "Académico", destino: "Académica", slaDias: 5 },
  inscricao_prescritos:        { label: "Inscrição de discente prescrito", categoria: "Académico", destino: "Académica", slaDias: 5 },
  inscricao_recurso:           { label: "Inscrição para exame de recurso", categoria: "Académico", destino: "Académica", slaDias: 3 },
  inscricao_fora_epoca:        { label: "Inscrição para exame fora de época", categoria: "Académico", destino: "Académica", slaDias: 3 },
  ausencia_lista_disciplina:   { label: "Nome ausente em lista de disciplina", categoria: "Académico", destino: "Académica", slaDias: 4 },
  ausencia_listas:             { label: "Ausência de nome nas listas", categoria: "Académico", destino: "Académica", slaDias: 4 },
  estatuto_discente:           { label: "Correcção de estatuto do discente", categoria: "Académico", destino: "Académica", slaDias: 5 },
  cancelamento_matricula:      { label: "Pedido de cancelamento de matrícula", categoria: "Académico", destino: "Académica", slaDias: 7 },
  transferencia:               { label: "Pedido de transferência", categoria: "Académico", destino: "Académica", slaDias: 10 },
  declaracao_com_notas:        { label: "Declaração com notas", categoria: "Académico", destino: "Académica", slaDias: 5 },
  declaracao_sem_notas:        { label: "Declaração sem notas", categoria: "Académico", destino: "Académica", slaDias: 3 },
  certificado_diploma:         { label: "Certificado / Diploma", categoria: "Académico", destino: "Académica", slaDias: 15 },
  conteudo_programatico:       { label: "Conteúdo programático", categoria: "Académico", destino: "Académica", slaDias: 5 },
  homologacao_inaares:         { label: "Homologação de documentos (INAARES)", categoria: "Académico", destino: "Académica", slaDias: 10 },
  levantamento_cartas:         { label: "Levantamento de cartas / despachos", categoria: "Académico", destino: "Académica", slaDias: 3 },
  historico_academico:         { label: "Histórico académico / situação académica", categoria: "Académico", destino: "Académica", slaDias: 5 },

  // ── Área Financeira (Financeiro) ─────────────────────────────────────────
  confirmacao_pagamento:       { label: "Verificação / confirmação de pagamento", categoria: "Financeiro", destino: "Financeiro", slaDias: 3 },
  divida_aberta:               { label: "Esclarecimento de dívida em aberto", categoria: "Financeiro", destino: "Financeiro", slaDias: 5 },
  pagamento_nao_reflectido:    { label: "Pagamento efectuado não reflectido no sistema", categoria: "Financeiro", destino: "Financeiro", slaDias: 3 },
  emolumentos_duplicados:      { label: "Remoção de emolumentos duplicados / mal gerados", categoria: "Financeiro", destino: "Financeiro", slaDias: 5 },
  calculo_multas:              { label: "Solicitação de cálculo de multas", categoria: "Financeiro", destino: "Financeiro", slaDias: 3 },
  ausencia_propinas:           { label: "Ausência de propinas geradas no sistema", categoria: "Financeiro", destino: "Financeiro", slaDias: 4 },
  rectificacao_propinas:       { label: "Rectificação do valor das propinas", categoria: "Financeiro", destino: "Financeiro", slaDias: 5 },
  geracao_referencias:         { label: "Dificuldade na geração de referências de pagamento", categoria: "Financeiro", destino: "Financeiro", slaDias: 2 },
  alteracao_prazo_pagamento:   { label: "Alteração do prazo de pagamento", categoria: "Financeiro", destino: "Financeiro", slaDias: 7 },
  apoio_bolseiros:             { label: "Apoio a discente bolseiro (interno/externo)", categoria: "Financeiro", destino: "Financeiro", slaDias: 5 },
  pendencias_financeiras:      { label: "Levantamento de pendências financeiras", categoria: "Financeiro", destino: "Financeiro", slaDias: 5 },
  acordo_financeiro:           { label: "Mediação de acordo financeiro / termo de responsabilidade", categoria: "Financeiro", destino: "Financeiro", slaDias: 7 },

  // ── Faculdades (Académico) ───────────────────────────────────────────────
  falta_lancamento_notas:      { label: "Falta de lançamento de notas (P1/P2/Final/Recurso)", categoria: "Académico", destino: "Faculdade", slaDias: 5 },
  falta_lancamento_prescrito:  { label: "Falta de lançamento de notas — prescritos", categoria: "Académico", destino: "Faculdade", slaDias: 5 },
  rectificacao_notas:          { label: "Rectificação de notas lançadas com valor errado", categoria: "Académico", destino: "Faculdade", slaDias: 7 },
  melhoria_notas:              { label: "Pedido de melhoria de notas", categoria: "Académico", destino: "Faculdade", slaDias: 10 },
  revisao_notas:               { label: "Pedido de revisão de notas", categoria: "Académico", destino: "Faculdade", slaDias: 10 },
  justificacao_faltas:         { label: "Pedido de justificação de faltas", categoria: "Académico", destino: "Faculdade", slaDias: 5 },
};

import { Laptop, GraduationCap as GradCap, Wallet as WalletIcon, type LucideIcon as LIcon } from "lucide-react";

export const categoriaConfig: Record<Categoria, { label: string; color: string; icon: LIcon }> = {
  Tecnológico: { label: "Tecnológico", color: "bg-blue-50 text-blue-700 border-blue-200",       icon: Laptop },
  Académico:   { label: "Académico",   color: "bg-violet-50 text-violet-700 border-violet-200", icon: GradCap },
  Financeiro:  { label: "Financeiro",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: WalletIcon },
};

export const destinoConfig: Record<Destino, { label: string; color: string }> = {
  CTI:         { label: "CTI",               color: "bg-blue-100 text-blue-700 border-blue-200" },
  Académica:   { label: "Área Académica",    color: "bg-purple-100 text-purple-700 border-purple-200" },
  Financeiro:  { label: "Área Financeira",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Faculdade:   { label: "Faculdade",         color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  GAP:         { label: "GAP",               color: "bg-pink-100 text-pink-700 border-pink-200" },
  Secretaria:  { label: "Secretaria",        color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export const estadoSolicitacaoConfig: Record<EstadoSolicitacao, { label: string; color: string }> = {
  recebida:    { label: "Pendente",    color: "bg-amber-50 text-amber-700 border-amber-200" },
  em_execucao: { label: "Em Execução", color: "bg-blue-50 text-blue-700 border-blue-200" },
  concluida:   { label: "Concluída",   color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejeitada:   { label: "Rejeitada",   color: "bg-destructive/10 text-destructive border-destructive/20" },
  em_atraso:   { label: "Em Atraso",   color: "bg-orange-50 text-orange-700 border-orange-200" },
};

export const prioridadeConfig: Record<Prioridade, { label: string; color: string }> = {
  alta:  { label: "Alta",  color: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground border-border" },
};

export interface HistoricoEntry {
  data: string;
  actor: string;
  accao: string;
  nota?: string;
}

export interface Solicitacao {
  id: string;
  // Discente
  discente: string;
  matricula: string;
  curso: string;
  faculdade: string;
  ano: number;
  // Pedido
  tipo: string;          // chave em tipoConfig
  assunto: string;
  descricao: string;
  // Roteamento
  destino: Destino;
  responsavelDestino?: string;
  // Estado & SLA
  estado: EstadoSolicitacao;
  prioridade: Prioridade;
  slaDias: number;
  // Datas
  dataSubmissao: string;
  dataEncaminhamento?: string;
  dataConclusao?: string;
  // Auditoria
  historico: HistoricoEntry[];
  anexos?: { nome: string; url?: string }[];
  notaInterna?: string;
}

// ─── Solicitações CTI (seed a partir do documento oficial) ───────────────────

export const solicitacoes: Solicitacao[] = [];

// ─── Helpers ────────────────────────────────────────────────────────────────
export const getSlaStatus = (s: Solicitacao): "no_prazo" | "em_risco" | "atrasado" | "concluido" => {
  if (s.estado === "concluida" || s.estado === "rejeitada") return "concluido";
  const ref = s.dataEncaminhamento ?? s.dataSubmissao;
  const diasDecorridos = Math.floor((Date.now() - new Date(ref).getTime()) / 86400000);
  const restantes = s.slaDias - diasDecorridos;
  if (restantes < 0) return "atrasado";
  if (restantes <= 1) return "em_risco";
  return "no_prazo";
};

export const slaStatusConfig = {
  no_prazo:  { label: "No prazo",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  em_risco:  { label: "Em risco",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  atrasado:  { label: "Atrasado",  color: "bg-destructive/10 text-destructive border-destructive/20" },
  concluido: { label: "Concluída", color: "bg-muted text-muted-foreground border-border" },
} as const;

// ─── Atendimentos & Discentes em seguimento (mantidos do módulo anterior) ──
export type TicketCategoria = "academico" | "psicologico" | "financeiro" | "documentacao" | "social" | "carreira" | "saude";

export interface GapAtendimento {
  id: string;
  discente: string; matricula: string; curso: string;
  faculdade: string; ano: number;
  motivo: string; categoria: TicketCategoria;
  data: string; hora: string; duracao: string;
  tipo: "presencial" | "online";
  estado: "agendado" | "concluido" | "cancelado" | "remarcar";
  responsavel: string;
  sala?: string; notas?: string; descricao?: string;
  participantes?: GapParticipante[];
}

export interface GapParticipante {
  nome: string;
  tipo: "encarregado" | "escola";
  relacao: string; // ex: "Mãe", "Pai", "Encarregado", "Coordenador de Curso", "Professor"
  contacto?: string; // email ou telefone
  confirmado?: boolean;
}

export interface GapEstudanteSeguimento {
  id: string; nome: string; matricula: string; curso: string; ano: number;
  risco: "baixo" | "medio" | "alto";
  acompanhamentos: number; ultimoContacto: string; responsavel: string; motivo: string;
}

import { GraduationCap, Brain, Wallet, FileText as FileTextIcon, Users as UsersIcon, Briefcase, HeartPulse, type LucideIcon } from "lucide-react";

export const ticketCategoriaConfig: Record<TicketCategoria, { label: string; color: string; icon: LucideIcon }> = {
  academico:    { label: "Académico",    color: "bg-primary/10 text-primary border-primary/20",            icon: GraduationCap },
  psicologico:  { label: "Psicológico",  color: "bg-purple-100 text-purple-700 border-purple-200",         icon: Brain },
  financeiro:   { label: "Financeiro",   color: "bg-emerald-100 text-emerald-700 border-emerald-200",      icon: Wallet },
  documentacao: { label: "Documentação", color: "bg-blue-100 text-blue-700 border-blue-200",               icon: FileTextIcon },
  social:       { label: "Social",       color: "bg-pink-100 text-pink-700 border-pink-200",               icon: UsersIcon },
  carreira:     { label: "Carreira",     color: "bg-amber-100 text-amber-700 border-amber-200",            icon: Briefcase },
  saude:        { label: "Saúde",        color: "bg-red-100 text-red-700 border-red-200",                  icon: HeartPulse },
};

export const gapAtendimentos: GapAtendimento[] = [];

export const gapEstudantesSeguimento: GapEstudanteSeguimento[] = [];

// ─── KPIs ───────────────────────────────────────────────────────────────────
const slaEmRisco = solicitacoes.filter(s => {
  const st = getSlaStatus(s);
  return st === "em_risco" || st === "atrasado";
}).length;

export const gapKpis = {
  recebidas:   solicitacoes.filter(s => s.estado === "recebida").length,
  emExecucao:  solicitacoes.filter(s => s.estado === "em_execucao").length,
  concluidas:  solicitacoes.filter(s => s.estado === "concluida").length,
  total:       solicitacoes.length,
  slaEmRisco,
  atendimentosHoje: gapAtendimentos.filter(a => a.data === "2025-12-16" && a.estado === "agendado").length,
  estudantesAtivos: gapEstudantesSeguimento.length,
  estudantesRiscoAlto: gapEstudantesSeguimento.filter(e => e.risco === "alto").length,
  satisfacao: 0,
};

export const solicitacoesPorDestino = (Object.keys(destinoConfig) as Destino[]).map(d => ({
  destino: d,
  label: destinoConfig[d].label,
  count: solicitacoes.filter(s => s.destino === d).length,
}));

// ─── Compatibilidade com módulos antigos (Inicio/EstudanteProfile) ──────────
// Mapeia Solicitacao -> formato "ticket-like" para reutilização visual existente.
export type GapTicket = {
  id: string; discente: string; matricula: string; curso: string; ano: number;
  assunto: string; descricao: string;
  categoria: TicketCategoria;        // derivada do destino
  estado: "aberto" | "em_andamento" | "resolvido" | "aguarda_estudante";
  prioridade: Prioridade;
  data: string;
  responsavel?: string;
};

const destinoToCategoria: Record<Destino, TicketCategoria> = {
  CTI: "documentacao", Académica: "academico", Financeiro: "financeiro",
  Faculdade: "academico", GAP: "psicologico", Secretaria: "documentacao",
};
const estadoToTicket: Record<EstadoSolicitacao, GapTicket["estado"]> = {
  recebida: "aberto", em_execucao: "em_andamento",
  concluida: "resolvido", rejeitada: "resolvido", em_atraso: "em_andamento",
};
export const gapTickets: GapTicket[] = solicitacoes.map(s => ({
  id: s.id, discente: s.discente, matricula: s.matricula, curso: s.curso, ano: s.ano,
  assunto: s.assunto, descricao: s.descricao,
  categoria: destinoToCategoria[s.destino],
  estado: estadoToTicket[s.estado],
  prioridade: s.prioridade,
  data: s.dataSubmissao,
  responsavel: s.responsavelDestino,
}));

export const ticketStatusConfig: Record<GapTicket["estado"], { label: string; color: string }> = {
  aberto:            { label: "Aberta",      color: "bg-orange-100 text-orange-700 border-orange-200" },
  em_andamento:      { label: "Em Atraso", color: "bg-amber-100 text-amber-700 border-amber-200" },
  aguarda_estudante: { label: "Aguarda",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolvido:         { label: "Concluída",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export type TicketStatus = GapTicket["estado"];

// ─── Notas & Comentários (mock determinístico) ─────────────────────────────
export interface ComentarioAnexo {
  nome: string;
  tamanho: string;
  tipo: "pdf" | "doc" | "image" | "sheet";
}
export interface ComentarioSolicitacao {
  data: string;
  actor: string;
  texto: string;
  anexo?: ComentarioAnexo;
}

const COMENTARIOS_POOL: string[] = [
  "Solicitação revista em detalhe. A documentação enviada pelo discente está conforme as exigências regulamentares e os dados batem com o registo histórico no sistema. Procedo com a validação interna e o despacho será emitido até ao final do dia útil de amanhã, conforme o SLA institucional. Caso surja qualquer incidente durante o processamento, o discente será contactado de imediato pelos canais oficiais.",
  "Confirmado o historial académico do discente junto da Secretaria. Não foram detectadas pendências curriculares ou disciplinares que impeçam o seguimento do pedido. O caso está em condições de avançar para a fase de execução, ficando à responsabilidade do departamento competente concluir a operação técnica no sistema. Aguardamos confirmação para encerrar o processo formalmente.",
  "Pedido em análise técnica. Foi necessária verificação adicional junto da Tesouraria para validar a regularidade financeira do discente no semestre corrente. A informação foi cruzada com o módulo de propinas e identificou-se uma divergência menor que está a ser corrigida pela equipa financeira. O processo retoma assim que a rectificação for concluída.",
  "Discente contactado por email institucional e por chamada para clarificar pontos da descrição apresentada. Foram solicitadas duas evidências complementares para sustentar o pedido: comprovativo actualizado e declaração assinada. Aguardo resposta nas próximas 48 horas. Em caso de ausência de resposta, o pedido será reavaliado e poderá ser arquivado por falta de elementos.",
  "Documento processado e validado pelos serviços competentes. A resposta formal foi preparada em coordenação com a chefia de departamento e contempla todos os requisitos solicitados pelo discente. O documento final será disponibilizado no Portal do Discente para descarga assim que a assinatura electrónica for aplicada pelo responsável da área. Notificação automática activa.",
  "Caso atribuído à equipa de execução. O prazo interno foi definido para os próximos dois dias úteis, dentro do SLA contratualizado. A complexidade do pedido foi avaliada como moderada e não exige escalonamento adicional. Será produzida documentação de suporte para arquivo institucional e cópia entregue ao discente conforme o procedimento padrão da unidade.",
  "Verificação concluída. Sem inconformidades detectadas no registo do discente nem no histórico de pedidos anteriores. O processo está limpo do ponto de vista administrativo e cumpre todos os critérios formais para aprovação. Recomendo a passagem imediata à fase de execução técnica para evitar o consumo desnecessário do tempo restante de SLA.",
  "Encaminhado para confirmação do supervisor antes da execução final. Trata-se de um pedido com impacto cruzado em duas áreas (Académica e Financeira), pelo que a validação dupla é exigida pelo regulamento interno. Aguardo despacho do responsável de turno. Toda a documentação de suporte foi anexada ao processo para facilitar a tomada de decisão.",
  "Realizei uma reunião informal com o coordenador da cadeira para alinhar o entendimento sobre o caso. Ficou acordado que o pedido segue por via excepcional, dado o histórico irrepreensível do discente e a justificação documentada apresentada. A decisão será formalizada em despacho na próxima reunião de coordenação. Discente avisado da previsão.",
];

const ANEXO_POOL: ComentarioAnexo[] = [
  { nome: "Despacho-interno-validacao.pdf", tamanho: "184 KB", tipo: "pdf" },
  { nome: "Verificacao-tesouraria.pdf", tamanho: "98 KB", tipo: "pdf" },
  { nome: "Email-contacto-discente.pdf", tamanho: "62 KB", tipo: "pdf" },
  { nome: "Mapa-cruzamento-dados.xlsx", tamanho: "212 KB", tipo: "sheet" },
  { nome: "Acta-coordenacao.docx", tamanho: "144 KB", tipo: "doc" },
  { nome: "Comprovativo-anexo.jpg", tamanho: "356 KB", tipo: "image" },
];

function buildComentarios(seedId: string, responsavel: string, baseDateISO: string): ComentarioSolicitacao[] {
  let h = 0;
  for (let i = 0; i < seedId.length; i++) h = (h * 31 + seedId.charCodeAt(i)) >>> 0;
  const count = 3 + (h % 2); // 3-4 comments
  const baseDate = new Date(baseDateISO);
  const out: ComentarioSolicitacao[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (h + i * 17) % COMENTARIOS_POOL.length;
    const d = new Date(baseDate.getTime() + i * 26 * 3600 * 1000 + ((h >> (i + 1)) % 7) * 3600 * 1000);
    const dStr = d.toISOString().slice(0, 16).replace("T", " ");
    // ~40% of comments have an attachment
    const hasAnexo = ((h >> (i * 3 + 2)) & 0b11) >= 2;
    const anexo = hasAnexo ? ANEXO_POOL[(h + i * 11) % ANEXO_POOL.length] : undefined;
    out.push({
      data: dStr,
      actor: i % 2 === 0 ? responsavel : "Coord. GAP · Dra. Helena Cabral",
      texto: COMENTARIOS_POOL[idx],
      anexo,
    });
  }
  return out;
}

export function getComentariosSolicitacao(id: string, responsavel: string): ComentarioSolicitacao[] {
  return buildComentarios(id, responsavel, "2025-12-13T08:30:00");
}

export function getComentariosAtendimento(id: string, responsavel: string): ComentarioSolicitacao[] {
  return buildComentarios(id + "-AT", responsavel, "2025-12-12T09:15:00");
}
