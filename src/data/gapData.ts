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
const CTI_PAULO = "Eng. Paulo Neto · CTI";
const CTI_SARA  = "Téc. Sara Domingos · CTI";

export const solicitacoes: Solicitacao[] = [
  {
    id: "SOL-2025-0142",
    discente: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 2,
    tipo: "actualizacao_dados_portal",
    assunto: "Não consigo entrar no Portal — credenciais inválidas",
    descricao: "Após mudança de palavra-passe deixei de aceder. O sistema rejeita as novas credenciais.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "em_execucao", prioridade: "alta", slaDias: 2,
    dataSubmissao: "2025-12-14", dataEncaminhamento: "2025-12-14",
    historico: [
      { data: "2025-12-14 09:12", actor: "Portal do Discente", accao: "Solicitação submetida pelo discente" },
      { data: "2025-12-14 09:13", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-14 14:32", actor: CTI_PAULO, accao: "Atribuída", nota: "A verificar registo no AD." },
    ],
  },
  {
    id: "SOL-2025-0141",
    discente: "Carlos Mendes", matricula: "2024015", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "actualizacao_dados_email",
    assunto: "Email institucional não recebe mensagens externas",
    descricao: "Mensagens enviadas de Gmail não chegam à minha caixa @upra.kor.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "recebida", prioridade: "media", slaDias: 2,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 10:04", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 10:04", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0140",
    discente: "Maria João Santos", matricula: "2023042", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 3,
    tipo: "actualizacao_dados_canal",
    assunto: "Canal de Discente não regista os meus pedidos",
    descricao: "Ao submeter um pedido o sistema mostra erro e não devolve número de protocolo.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "em_execucao", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-12-12", dataEncaminhamento: "2025-12-12",
    historico: [
      { data: "2025-12-12 11:21", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-12 11:22", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-12 15:40", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-12-13 09:10", actor: CTI_PAULO, accao: "Em diagnóstico", nota: "Erro reproduzido em ambiente de teste." },
    ],
  },
  {
    id: "SOL-2025-0139",
    discente: "Pedro Almeida", matricula: "2024033", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 2,
    tipo: "actualizacao_calculo_medias",
    assunto: "Média do 1º semestre incorrecta no portal",
    descricao: "A média apresentada no portal não corresponde ao boletim de notas oficial.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "em_execucao", prioridade: "media", slaDias: 5,
    dataSubmissao: "2025-12-10", dataEncaminhamento: "2025-12-10",
    historico: [
      { data: "2025-12-10 08:45", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-10 08:45", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-11 10:00", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-12-13 16:20", actor: CTI_SARA, accao: "A aguardar dados da Académica", nota: "Pedido de validação enviado à Académica." },
    ],
  },
  {
    id: "SOL-2025-0138",
    discente: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 4,
    tipo: "segunda_via_cartao",
    assunto: "Pedido de 2ª via — cartão extraviado",
    descricao: "Perdi o cartão de discente no transporte público. Necessito de 2ª via.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "concluida", prioridade: "media", slaDias: 7,
    dataSubmissao: "2025-12-02", dataEncaminhamento: "2025-12-02", dataConclusao: "2025-12-08",
    historico: [
      { data: "2025-12-02 14:10", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-02 14:10", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-03 09:30", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-12-05 11:00", actor: CTI_PAULO, accao: "Cartão produzido" },
      { data: "2025-12-08 10:15", actor: CTI_PAULO, accao: "Concluída", nota: "Cartão entregue ao discente." },
    ],
  },
  {
    id: "SOL-2025-0137",
    discente: "João Baptista", matricula: "2024050", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "falha_cartao",
    assunto: "Cartão não funciona nos torniquetes",
    descricao: "Desde sexta-feira o cartão é rejeitado em todas as entradas.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "concluida", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-01", dataEncaminhamento: "2025-12-01", dataConclusao: "2025-12-04",
    historico: [
      { data: "2025-12-01 16:22", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-01 16:22", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-02 08:50", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-12-04 14:00", actor: CTI_SARA, accao: "Concluída", nota: "Reprogramação do chip; testado com sucesso." },
    ],
  },
  {
    id: "SOL-2025-0136",
    discente: "Beatriz Lopes", matricula: "2023089", curso: "Enfermagem", faculdade: "Faculdade de Medicina", ano: 3,
    tipo: "anulacao_cartao",
    assunto: "Anulação de cartão por suspeita de uso indevido",
    descricao: "Suspeito que o meu cartão foi clonado. Solicito anulação imediata.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "concluida", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-11-28", dataEncaminhamento: "2025-11-28", dataConclusao: "2025-11-29",
    historico: [
      { data: "2025-11-28 17:40", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-11-28 17:40", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-11-29 09:00", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-11-29 11:30", actor: CTI_PAULO, accao: "Concluída", nota: "Cartão anulado no sistema. 2ª via deve ser pedida." },
    ],
  },
  {
    id: "SOL-2025-0135",
    discente: "Tiago Mateus", matricula: "2024077", curso: "Arquitectura", faculdade: "Faculdade de Ciências Exatas", ano: 2,
    tipo: "segunda_via_cartao",
    assunto: "Pedido de 2ª via — cartão danificado",
    descricao: "O cartão partiu-se e deixou de ser lido. Solicito substituição.",
    destino: "CTI",
    estado: "recebida", prioridade: "baixa", slaDias: 7,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 11:55", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 11:55", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0134",
    discente: "Helena Costa", matricula: "2024088", curso: "Enfermagem", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "actualizacao_dados_portal",
    assunto: "Actualização de número de telefone no Portal",
    descricao: "Mudei de operador e o portal não me deixa actualizar o contacto.",
    destino: "CTI",
    estado: "recebida", prioridade: "baixa", slaDias: 2,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 13:08", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 13:08", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0133",
    discente: "Rui Vasconcelos", matricula: "2023105", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "actualizacao_dados_email",
    assunto: "Reset de palavra-passe do email institucional",
    descricao: "Esqueci a palavra-passe e a recuperação não envia o código.",
    destino: "CTI",
    estado: "recebida", prioridade: "media", slaDias: 2,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 08:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 08:30", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0132",
    discente: "Lucas Marques", matricula: "2024112", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "actualizacao_dados_canal",
    assunto: "Não consigo aceder ao Canal de Discente",
    descricao: "O Canal mostra ‘perfil não autorizado’ desde a inscrição.",
    destino: "CTI",
    estado: "recebida", prioridade: "media", slaDias: 3,
    dataSubmissao: "2025-12-14", dataEncaminhamento: "2025-12-14",
    historico: [
      { data: "2025-12-14 16:10", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-14 16:10", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0131",
    discente: "Inês Cardoso", matricula: "2023060", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "actualizacao_calculo_medias",
    assunto: "Cadeira em falta no cálculo da média ponderada",
    descricao: "A cadeira de Estatística II não consta no cálculo da minha média do ano.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "em_execucao", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-08", dataEncaminhamento: "2025-12-08",
    historico: [
      { data: "2025-12-08 09:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-08 09:00", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-09 10:00", actor: CTI_SARA, accao: "Atribuída" },
    ],
  },
  {
    id: "SOL-2025-0130",
    discente: "Filipe Soares", matricula: "2024090", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "falha_cartao",
    assunto: "Cartão lê mas não autoriza acesso à biblioteca",
    descricao: "Os torniquetes da biblioteca recusam o cartão; nas entradas principais funciona.",
    destino: "CTI",
    estado: "rejeitada", prioridade: "baixa", slaDias: 5,
    dataSubmissao: "2025-12-05", dataEncaminhamento: "2025-12-05", dataConclusao: "2025-12-06",
    historico: [
      { data: "2025-12-05 10:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-05 10:30", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-06 09:15", actor: CTI_PAULO, accao: "Rejeitada", nota: "Discente sem matrícula activa em Biblioteca; reencaminhado à Académica." },
    ],
  },
  {
    id: "SOL-2025-0129",
    discente: "Marta Pires", matricula: "2023072", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 4,
    tipo: "anulacao_cartao",
    assunto: "Anulação por término de matrícula",
    descricao: "Concluí o curso e quero anular o cartão activo.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "concluida", prioridade: "baixa", slaDias: 3,
    dataSubmissao: "2025-11-25", dataEncaminhamento: "2025-11-25", dataConclusao: "2025-11-27",
    historico: [
      { data: "2025-11-25 14:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-11-25 14:00", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-11-26 09:00", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-11-27 11:00", actor: CTI_SARA, accao: "Concluída" },
    ],
  },

  // ── Área Académica ───────────────────────────────────────────────────────
  {
    id: "SOL-2025-0128",
    discente: "Diana Quintas", matricula: "2024021", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "inscricao_semestre",
    assunto: "Inscrição no IIº Semestre — pendente",
    descricao: "Submeti os documentos mas a inscrição continua por confirmar no portal.",
    destino: "Académica", responsavelDestino: "Dra. Cita · Secretaria Académica",
    estado: "em_execucao", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-13", dataEncaminhamento: "2025-12-13",
    historico: [
      { data: "2025-12-13 09:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-13 09:00", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
      { data: "2025-12-14 10:30", actor: "Dra. Cita · Secretaria Académica", accao: "Em validação documental" },
    ],
  },
  {
    id: "SOL-2025-0127",
    discente: "Hugo Faria", matricula: "2023111", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 4,
    tipo: "declaracao_com_notas",
    assunto: "Declaração com notas para concurso público",
    descricao: "Necessito de declaração com aproveitamento até ao 4º ano.",
    destino: "Académica", responsavelDestino: "Dra. Cita · Secretaria Académica",
    estado: "concluida", prioridade: "media", slaDias: 5,
    dataSubmissao: "2025-12-04", dataEncaminhamento: "2025-12-04", dataConclusao: "2025-12-09",
    historico: [
      { data: "2025-12-04 11:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-04 11:00", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
      { data: "2025-12-09 15:00", actor: "Dra. Cita · Secretaria Académica", accao: "Concluída", nota: "Documento entregue ao discente." },
    ],
  },
  {
    id: "SOL-2025-0126",
    discente: "Patrícia Lima", matricula: "2024055", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "transferencia",
    assunto: "Transferência interna de curso",
    descricao: "Pretendo transferir-me de Gestão para Economia no próximo ano lectivo.",
    destino: "Académica",
    estado: "recebida", prioridade: "media", slaDias: 10,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 10:20", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 10:20", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
    ],
  },
  {
    id: "SOL-2025-0125",
    discente: "Bruno Sapalo", matricula: "2023030", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 4,
    tipo: "certificado_diploma",
    assunto: "Pedido de diploma de licenciatura",
    descricao: "Concluí a licenciatura e solicito a emissão do diploma.",
    destino: "Académica", responsavelDestino: "Dra. Cita · Secretaria Académica",
    estado: "em_execucao", prioridade: "media", slaDias: 15,
    dataSubmissao: "2025-12-01", dataEncaminhamento: "2025-12-01",
    historico: [
      { data: "2025-12-01 14:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-01 14:00", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
      { data: "2025-12-05 09:30", actor: "Dra. Cita · Secretaria Académica", accao: "Em produção" },
    ],
  },
  {
    id: "SOL-2025-0124",
    discente: "Tomás Henriques", matricula: "2024099", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "ausencia_lista_disciplina",
    assunto: "Não consto na lista de Programação I",
    descricao: "Após confirmar matrícula, o meu nome não aparece na lista da disciplina.",
    destino: "Académica",
    estado: "recebida", prioridade: "alta", slaDias: 4,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 16:45", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 16:45", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
    ],
  },

  // ── Área Financeira ──────────────────────────────────────────────────────
  {
    id: "SOL-2025-0123",
    discente: "Vânia Cassule", matricula: "2024066", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 2,
    tipo: "pagamento_nao_reflectido",
    assunto: "Pagamento de propina não reflectido",
    descricao: "Paguei a propina de Novembro mas continua marcada como em dívida.",
    destino: "Financeiro", responsavelDestino: "Dra. Lúcia Mateus · Tesouraria",
    estado: "em_execucao", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-12-12", dataEncaminhamento: "2025-12-12",
    historico: [
      { data: "2025-12-12 08:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-12 08:30", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
      { data: "2025-12-12 14:00", actor: "Dra. Lúcia Mateus · Tesouraria", accao: "A conferir comprovativo" },
    ],
  },
  {
    id: "SOL-2025-0122",
    discente: "Edmilson Bastos", matricula: "2023044", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 3,
    tipo: "calculo_multas",
    assunto: "Cálculo de multas por atraso",
    descricao: "Solicito o cálculo actualizado das multas acumuladas no semestre.",
    destino: "Financeiro", responsavelDestino: "Sr. Adriano Paka · Cobranças",
    estado: "concluida", prioridade: "media", slaDias: 3,
    dataSubmissao: "2025-12-05", dataEncaminhamento: "2025-12-05", dataConclusao: "2025-12-07",
    historico: [
      { data: "2025-12-05 09:15", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-05 09:15", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
      { data: "2025-12-07 11:40", actor: "Sr. Adriano Paka · Cobranças", accao: "Concluída", nota: "Documento de cálculo entregue." },
    ],
  },
  {
    id: "SOL-2025-0121",
    discente: "Iolanda Chivava", matricula: "2024088", curso: "Enfermagem", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "geracao_referencias",
    assunto: "Não consigo gerar referência de pagamento",
    descricao: "O sistema dá erro ao tentar gerar a referência multicaixa.",
    destino: "Financeiro",
    estado: "recebida", prioridade: "alta", slaDias: 2,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 09:50", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 09:50", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
    ],
  },
  {
    id: "SOL-2025-0120",
    discente: "Nelson Mukoki", matricula: "2023077", curso: "Arquitectura", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "alteracao_prazo_pagamento",
    assunto: "Alteração do prazo de pagamento da propina",
    descricao: "Solicito acordo para pagar a propina de Dezembro até 15 de Janeiro.",
    destino: "Financeiro", responsavelDestino: "Dra. Lúcia Mateus · Tesouraria",
    estado: "em_execucao", prioridade: "media", slaDias: 7,
    dataSubmissao: "2025-12-10", dataEncaminhamento: "2025-12-10",
    historico: [
      { data: "2025-12-10 13:20", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-10 13:20", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
      { data: "2025-12-11 10:00", actor: "Dra. Lúcia Mateus · Tesouraria", accao: "Em análise" },
    ],
  },
  {
    id: "SOL-2025-0119",
    discente: "Rita Domingos", matricula: "2024112", curso: "Enfermagem", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "apoio_bolseiros",
    assunto: "Bolseira INAGBE — actualização de estado",
    descricao: "A minha bolsa não está reflectida no sistema este semestre.",
    destino: "Financeiro",
    estado: "recebida", prioridade: "media", slaDias: 5,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 14:10", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 14:10", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
    ],
  },

  // ── Faculdades (Notas e Frequência) ──────────────────────────────────────
  {
    id: "SOL-2025-0118",
    discente: "Fábio Tati", matricula: "2023060", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "falta_lancamento_notas",
    assunto: "Nota de Macroeconomia (P2) não lançada",
    descricao: "A nota da P2 de Macroeconomia ainda não consta no portal.",
    destino: "Faculdade", responsavelDestino: "Coord. Faculdade de Ciências Exatas",
    estado: "recebida", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-14", dataEncaminhamento: "2025-12-14",
    historico: [
      { data: "2025-12-14 11:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-14 11:00", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Ciências Exatas" },
    ],
  },
  {
    id: "SOL-2025-0117",
    discente: "Gilda Ngangula", matricula: "2024014", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "rectificacao_notas",
    assunto: "Rectificação de nota de Introdução ao Direito",
    descricao: "A nota lançada (8) não corresponde à pauta entregue (12).",
    destino: "Faculdade", responsavelDestino: "Coord. Faculdade de Medicina",
    estado: "em_execucao", prioridade: "alta", slaDias: 7,
    dataSubmissao: "2025-12-09", dataEncaminhamento: "2025-12-09",
    historico: [
      { data: "2025-12-09 10:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-09 10:30", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Medicina" },
      { data: "2025-12-11 14:20", actor: "Coord. Faculdade de Medicina", accao: "Em verificação com docente" },
    ],
  },
  {
    id: "SOL-2025-0116",
    discente: "Hélder Massano", matricula: "2023095", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "revisao_notas",
    assunto: "Revisão de nota — Sistemas Distribuídos",
    descricao: "Discordo da avaliação atribuída no exame final e solicito revisão.",
    destino: "Faculdade",
    estado: "recebida", prioridade: "media", slaDias: 10,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 17:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-15 17:00", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Ciências Exatas" },
    ],
  },
  {
    id: "SOL-2025-0115",
    discente: "Joana Mavinga", matricula: "2024023", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "justificacao_faltas",
    assunto: "Justificação de faltas por internamento",
    descricao: "Estive internada de 02 a 09 de Dezembro. Anexo atestado médico.",
    destino: "Faculdade", responsavelDestino: "Coord. Faculdade de Medicina",
    estado: "concluida", prioridade: "media", slaDias: 5,
    dataSubmissao: "2025-12-10", dataEncaminhamento: "2025-12-10", dataConclusao: "2025-12-13",
    historico: [
      { data: "2025-12-10 09:00", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-10 09:00", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Medicina" },
      { data: "2025-12-13 11:00", actor: "Coord. Faculdade de Medicina", accao: "Concluída", nota: "Faltas justificadas." },
    ],
  },
  {
    id: "SOL-2025-0114",
    discente: "Kátia Mbumba", matricula: "2024140", curso: "Arquitectura", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "melhoria_notas",
    assunto: "Pedido de melhoria — Desenho Técnico",
    descricao: "Solicito melhoria de nota da cadeira de Desenho Técnico (10).",
    destino: "Faculdade",
    estado: "recebida", prioridade: "baixa", slaDias: 10,
    dataSubmissao: "2025-12-13", dataEncaminhamento: "2025-12-13",
    historico: [
      { data: "2025-12-13 15:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-13 15:30", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Ciências Exatas" },
    ],
  },
  // ── Solicitações em atraso (SLA ultrapassado) ────────────────────────────
  {
    id: "SOL-2025-0113",
    discente: "Rui Vasconcelos", matricula: "2023105", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "geracao_referencias",
    assunto: "Não consigo gerar referência de pagamento de propinas",
    descricao: "Ao tentar gerar a referência o sistema devolve erro 500 e não regista o pedido.",
    destino: "Financeiro", responsavelDestino: "Dra. Catarina Lopes · Financeiro",
    estado: "em_execucao", prioridade: "alta", slaDias: 2,
    dataSubmissao: "2025-12-05", dataEncaminhamento: "2025-12-05",
    historico: [
      { data: "2025-12-05 08:30", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-05 08:30", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
      { data: "2025-12-06 10:15", actor: "Dra. Catarina Lopes · Financeiro", accao: "Atribuída" },
    ],
  },
  {
    id: "SOL-2025-0112",
    discente: "Inês Cardoso", matricula: "2023060", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 3,
    tipo: "falta_lancamento_notas",
    assunto: "Nota de Recurso de Algoritmos não lançada",
    descricao: "Realizei o exame de recurso há mais de duas semanas e a nota continua em falta no portal.",
    destino: "Faculdade",
    estado: "recebida", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-03", dataEncaminhamento: "2025-12-03",
    historico: [
      { data: "2025-12-03 14:20", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-03 14:20", actor: "Sistema", accao: "Encaminhada automaticamente para Faculdade de Ciências Exatas" },
    ],
  },
  {
    id: "SOL-2025-0111",
    discente: "Hugo Faria", matricula: "2023111", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 4,
    tipo: "declaracao_com_notas",
    assunto: "Declaração com notas para concurso público",
    descricao: "Necessito declaração com notas para concurso público com prazo de entrega esgotado.",
    destino: "Académica", responsavelDestino: "Dra. Ana Belmiro · Académica",
    estado: "em_execucao", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-01", dataEncaminhamento: "2025-12-01",
    historico: [
      { data: "2025-12-01 09:50", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-01 09:50", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
      { data: "2025-12-02 11:00", actor: "Dra. Ana Belmiro · Académica", accao: "Atribuída", nota: "Aguarda emissão pela Secretaria." },
    ],
  },
  {
    id: "SOL-2025-0110",
    discente: "Patrícia Lima", matricula: "2024055", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 1,
    tipo: "pagamento_nao_reflectido",
    assunto: "Pagamento de propina efectuado a 25/11 não reflectido",
    descricao: "Realizei o pagamento via Multicaixa Express. Comprovativo anexo. Continua em dívida no sistema.",
    destino: "Financeiro", responsavelDestino: "Dra. Catarina Lopes · Financeiro",
    estado: "em_execucao", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-11-28", dataEncaminhamento: "2025-11-28",
    historico: [
      { data: "2025-11-28 16:05", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-11-28 16:05", actor: "Sistema", accao: "Encaminhada automaticamente para Financeiro" },
      { data: "2025-11-30 09:40", actor: "Dra. Catarina Lopes · Financeiro", accao: "Atribuída", nota: "A confirmar com o banco." },
    ],
  },
  {
    id: "SOL-2025-0109",
    discente: "Bruno Sapalo", matricula: "2023030", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 4,
    tipo: "ausencia_lista_disciplina",
    assunto: "Nome ausente na pauta de Estruturas II",
    descricao: "Apesar de estar inscrito não consto da pauta da cadeira. Já não tenho acesso aos materiais.",
    destino: "Académica", responsavelDestino: "Dra. Ana Belmiro · Académica",
    estado: "recebida", prioridade: "alta", slaDias: 4,
    dataSubmissao: "2025-12-04", dataEncaminhamento: "2025-12-04",
    historico: [
      { data: "2025-12-04 10:15", actor: "Portal do Discente", accao: "Solicitação submetida" },
      { data: "2025-12-04 10:15", actor: "Sistema", accao: "Encaminhada automaticamente para Académica" },
    ],
  },
];

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

export const gapAtendimentos: GapAtendimento[] = [
  { id: "AT-001", discente: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", faculdade: "Faculdade de Ciências Exatas", ano: 2, motivo: "1ª sessão de acompanhamento psicológico", descricao: "Avaliação inicial do quadro de ansiedade reportado pela discente. Recolha de história académica, identificação de gatilhos relacionados com avaliações e definição conjunta de objectivos terapêuticos para as próximas sessões.", categoria: "psicologico", data: "2025-12-16", hora: "09:00", duracao: "50 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1" },
  { id: "AT-002", discente: "Carlos Mendes", matricula: "2024015", curso: "Direito", faculdade: "Faculdade de Medicina", ano: 1, motivo: "Orientação académica — métodos de estudo", descricao: "Análise do plano de estudos actual e dificuldades de organização. Apresentação de técnicas de gestão de tempo (Pomodoro, blocos de concentração) e elaboração de um plano semanal personalizado.", categoria: "academico", data: "2025-12-16", hora: "10:30", duracao: "40 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2", participantes: [
    { nome: "Sr.ª Isabel Mendes", tipo: "encarregado", relacao: "Mãe", contacto: "+244 923 145 678", confirmado: true },
    { nome: "Prof. Rui Carvalho", tipo: "escola", relacao: "Coordenador de Curso", contacto: "rui.carvalho@upra.kor", confirmado: true },
  ] },
  { id: "AT-003", discente: "Pedro Almeida", matricula: "2024033", curso: "Economia", faculdade: "Faculdade de Ciências Exatas", ano: 2, motivo: "Orientação vocacional", descricao: "Sessão online para exploração de áreas profissionais de interesse. Aplicação de inventário vocacional e discussão das saídas profissionais do curso de Economia, com foco em mercados financeiros e consultoria.", categoria: "carreira", data: "2025-12-16", hora: "14:00", duracao: "60 min", tipo: "online", estado: "agendado", responsavel: "Dr. João Tavares" },
  { id: "AT-004", discente: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", faculdade: "Faculdade de Medicina", ano: 3, motivo: "Acompanhamento de estágio", descricao: "Ponto de situação do estágio curricular em curso. Revisão das competências desenvolvidas, dificuldades enfrentadas no contexto institucional e preparação do relatório intermédio de estágio.", categoria: "carreira", data: "2025-12-17", hora: "11:00", duracao: "30 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1", participantes: [
    { nome: "Prof.ª Marta Sousa", tipo: "escola", relacao: "Orientadora de Estágio", contacto: "marta.sousa@upra.kor", confirmado: true },
  ] },
  { id: "AT-005", discente: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", faculdade: "Faculdade de Ciências Exatas", ano: 3, motivo: "Encaminhamento médico", descricao: "Pedido de referenciação para consulta especializada externa. Validação dos sintomas reportados e emissão de carta de encaminhamento para a unidade de saúde parceira.", categoria: "saude", data: "2025-12-09", hora: "09:30", duracao: "20 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral", notas: "Encaminhamento entregue. Discente satisfeita com a resolução.", participantes: [
    { nome: "Sr. António Bernardo", tipo: "encarregado", relacao: "Pai", contacto: "+244 923 456 789", confirmado: true },
  ] },
  { id: "AT-006", discente: "Maria João Santos", matricula: "2023042", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 3, motivo: "Apoio candidatura bolsa INAGBE", descricao: "Apoio na preparação do dossier de candidatura à bolsa INAGBE: revisão de documentos, redacção da carta de motivação e verificação dos critérios de elegibilidade.", categoria: "financeiro", data: "2025-12-15", hora: "15:00", duracao: "45 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral" },
  { id: "AT-007", discente: "João Baptista", matricula: "2024050", curso: "Gestão", faculdade: "Faculdade de Ciências Exatas", ano: 1, motivo: "Mediação de conflito", descricao: "Sessão de mediação entre discentes do mesmo grupo de trabalho. Identificação das tensões, escuta activa de ambas as partes e definição de regras de funcionamento até à entrega do projecto final.", categoria: "social", data: "2025-12-17", hora: "16:00", duracao: "60 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2", participantes: [
    { nome: "Sr.ª Teresa Baptista", tipo: "encarregado", relacao: "Encarregada de Educação", contacto: "+244 924 887 213", confirmado: false },
    { nome: "Prof. Hugo Lima", tipo: "escola", relacao: "Director de Turma", contacto: "hugo.lima@upra.kor", confirmado: true },
  ] },
];

export const gapEstudantesSeguimento: GapEstudanteSeguimento[] = [
  { id: "S-001", nome: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", ano: 2, risco: "alto", acompanhamentos: 4, ultimoContacto: "2025-12-14", responsavel: "Dra. Helena Cabral", motivo: "Ansiedade académica" },
  { id: "S-002", nome: "Carlos Mendes", matricula: "2024015", curso: "Direito", ano: 1, risco: "medio", acompanhamentos: 2, ultimoContacto: "2025-12-13", responsavel: "Dr. João Tavares", motivo: "Adaptação ao curso" },
  { id: "S-003", nome: "Pedro Almeida", matricula: "2024033", curso: "Economia", ano: 2, risco: "medio", acompanhamentos: 3, ultimoContacto: "2025-12-13", responsavel: "Dr. João Tavares", motivo: "Orientação vocacional" },
  { id: "S-004", nome: "Maria João Santos", matricula: "2023042", curso: "Medicina", ano: 3, risco: "baixo", acompanhamentos: 1, ultimoContacto: "2025-12-13", responsavel: "Dra. Helena Cabral", motivo: "Apoio financeiro" },
  { id: "S-005", nome: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", ano: 3, risco: "baixo", acompanhamentos: 2, ultimoContacto: "2025-12-13", responsavel: "Dra. Helena Cabral", motivo: "Estágio curricular" },
  { id: "S-006", nome: "João Baptista", matricula: "2024050", curso: "Gestão", ano: 1, risco: "medio", acompanhamentos: 1, ultimoContacto: "2025-12-14", responsavel: "Dr. João Tavares", motivo: "Conflito grupo" },
];

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
  satisfacao: 94,
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
