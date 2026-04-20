// GAP — Gabinete de Apoio ao Estudante
// Modelo: pedidos (Solicitações) submetidos pelo estudante no Portal e
// encaminhados automaticamente ao departamento responsável (CTI, Académica,
// Financeiro, GAP, Secretaria). O GAP monitoriza a execução — não responde.

export type Destino = "CTI" | "Académica" | "Financeiro" | "Faculdade" | "GAP" | "Secretaria";

export type EstadoSolicitacao =
  | "recebida"        // submetida pelo estudante no Portal
  | "encaminhada"     // auto-roteada ao destino
  | "em_execucao"     // destino a tratar
  | "concluida"
  | "rejeitada";

export type Prioridade = "alta" | "media" | "baixa";

// ─── Tipos de pedido (catálogo oficial por departamento) ─────────────────────
// Catálogos extraídos dos relatórios oficiais do GAP (19 Dez 2025):
// CTI · Área Académica · Área Financeira · Faculdades.
export type TipoSolicitacao = string;

export const tipoConfig: Record<string, { label: string; categoria: string; destino: Destino; slaDias: number }> = {
  // ── CTI ──────────────────────────────────────────────────────────────────
  actualizacao_dados_portal:   { label: "Actualização de dados — Portal do Estudante", categoria: "Acessos & Contas", destino: "CTI", slaDias: 2 },
  actualizacao_dados_email:    { label: "Actualização de dados — Email institucional", categoria: "Acessos & Contas", destino: "CTI", slaDias: 2 },
  actualizacao_dados_canal:    { label: "Actualização de dados — Canal de Estudante", categoria: "Acessos & Contas", destino: "CTI", slaDias: 3 },
  actualizacao_calculo_medias: { label: "Actualização do cálculo de médias no sistema", categoria: "Sistemas Académicos", destino: "CTI", slaDias: 5 },
  segunda_via_cartao:          { label: "Pedido de 2ª via do cartão de estudante", categoria: "Cartão de Estudante", destino: "CTI", slaDias: 7 },
  falha_cartao:                { label: "Falha de funcionamento do cartão de estudante", categoria: "Cartão de Estudante", destino: "CTI", slaDias: 5 },
  anulacao_cartao:             { label: "Pedido de anulação do cartão de estudante", categoria: "Cartão de Estudante", destino: "CTI", slaDias: 3 },

  // ── Área Académica ───────────────────────────────────────────────────────
  inscricao_semestre:          { label: "Inscrição para o Iº/IIº Semestre", categoria: "Inscrições", destino: "Académica", slaDias: 5 },
  inscricao_prescritos:        { label: "Inscrição de estudante prescrito", categoria: "Inscrições", destino: "Académica", slaDias: 5 },
  inscricao_recurso:           { label: "Inscrição para exame de recurso", categoria: "Inscrições", destino: "Académica", slaDias: 3 },
  inscricao_fora_epoca:        { label: "Inscrição para exame fora de época", categoria: "Inscrições", destino: "Académica", slaDias: 3 },
  ausencia_lista_disciplina:   { label: "Nome ausente em lista de disciplina", categoria: "Listas & Matrículas", destino: "Académica", slaDias: 4 },
  ausencia_listas:             { label: "Ausência de nome nas listas", categoria: "Listas & Matrículas", destino: "Académica", slaDias: 4 },
  estatuto_discente:           { label: "Correcção de estatuto do discente", categoria: "Listas & Matrículas", destino: "Académica", slaDias: 5 },
  cancelamento_matricula:      { label: "Pedido de cancelamento de matrícula", categoria: "Listas & Matrículas", destino: "Académica", slaDias: 7 },
  transferencia:               { label: "Pedido de transferência", categoria: "Listas & Matrículas", destino: "Académica", slaDias: 10 },
  declaracao_com_notas:        { label: "Declaração com notas", categoria: "Documentação", destino: "Académica", slaDias: 5 },
  declaracao_sem_notas:        { label: "Declaração sem notas", categoria: "Documentação", destino: "Académica", slaDias: 3 },
  certificado_diploma:         { label: "Certificado / Diploma", categoria: "Documentação", destino: "Académica", slaDias: 15 },
  conteudo_programatico:       { label: "Conteúdo programático", categoria: "Documentação", destino: "Académica", slaDias: 5 },
  homologacao_inaares:         { label: "Homologação de documentos (INAARES)", categoria: "Documentação", destino: "Académica", slaDias: 10 },
  levantamento_cartas:         { label: "Levantamento de cartas / despachos", categoria: "Documentação", destino: "Académica", slaDias: 3 },
  historico_academico:         { label: "Histórico académico / situação académica", categoria: "Documentação", destino: "Académica", slaDias: 5 },

  // ── Área Financeira ──────────────────────────────────────────────────────
  confirmacao_pagamento:       { label: "Verificação / confirmação de pagamento", categoria: "Pagamentos", destino: "Financeiro", slaDias: 3 },
  divida_aberta:               { label: "Esclarecimento de dívida em aberto", categoria: "Dívidas & Multas", destino: "Financeiro", slaDias: 5 },
  pagamento_nao_reflectido:    { label: "Pagamento efectuado não reflectido no sistema", categoria: "Pagamentos", destino: "Financeiro", slaDias: 3 },
  emolumentos_duplicados:      { label: "Remoção de emolumentos duplicados / mal gerados", categoria: "Emolumentos", destino: "Financeiro", slaDias: 5 },
  calculo_multas:              { label: "Solicitação de cálculo de multas", categoria: "Dívidas & Multas", destino: "Financeiro", slaDias: 3 },
  ausencia_propinas:           { label: "Ausência de propinas geradas no sistema", categoria: "Propinas", destino: "Financeiro", slaDias: 4 },
  rectificacao_propinas:       { label: "Rectificação do valor das propinas", categoria: "Propinas", destino: "Financeiro", slaDias: 5 },
  geracao_referencias:         { label: "Dificuldade na geração de referências de pagamento", categoria: "Propinas", destino: "Financeiro", slaDias: 2 },
  alteracao_prazo_pagamento:   { label: "Alteração do prazo de pagamento", categoria: "Acordos & Negociação", destino: "Financeiro", slaDias: 7 },
  apoio_bolseiros:             { label: "Apoio a discente bolseiro (interno/externo)", categoria: "Bolseiros", destino: "Financeiro", slaDias: 5 },
  pendencias_financeiras:      { label: "Levantamento de pendências financeiras", categoria: "Dívidas & Multas", destino: "Financeiro", slaDias: 5 },
  acordo_financeiro:           { label: "Mediação de acordo financeiro / termo de responsabilidade", categoria: "Acordos & Negociação", destino: "Financeiro", slaDias: 7 },

  // ── Faculdades ───────────────────────────────────────────────────────────
  falta_lancamento_notas:      { label: "Falta de lançamento de notas (P1/P2/Final/Recurso)", categoria: "Lançamento de Notas", destino: "Faculdade", slaDias: 5 },
  falta_lancamento_prescrito:  { label: "Falta de lançamento de notas — prescritos", categoria: "Lançamento de Notas", destino: "Faculdade", slaDias: 5 },
  rectificacao_notas:          { label: "Rectificação de notas lançadas com valor errado", categoria: "Correcção de Notas", destino: "Faculdade", slaDias: 7 },
  melhoria_notas:              { label: "Pedido de melhoria de notas", categoria: "Recurso de Notas", destino: "Faculdade", slaDias: 10 },
  revisao_notas:               { label: "Pedido de revisão de notas", categoria: "Recurso de Notas", destino: "Faculdade", slaDias: 10 },
  justificacao_faltas:         { label: "Pedido de justificação de faltas", categoria: "Frequência", destino: "Faculdade", slaDias: 5 },
};

export const destinoConfig: Record<Destino, { label: string; color: string }> = {
  CTI:         { label: "CTI",         color: "bg-blue-100 text-blue-700 border-blue-200" },
  Académica:   { label: "Académica",   color: "bg-purple-100 text-purple-700 border-purple-200" },
  Financeiro:  { label: "Financeiro",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Faculdade:   { label: "Faculdade",   color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  GAP:         { label: "GAP",         color: "bg-pink-100 text-pink-700 border-pink-200" },
  Secretaria:  { label: "Secretaria",  color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export const estadoSolicitacaoConfig: Record<EstadoSolicitacao, { label: string; color: string }> = {
  recebida:    { label: "Recebida",    color: "bg-orange-100 text-orange-700 border-orange-200" },
  encaminhada: { label: "Encaminhada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  em_execucao: { label: "Em Execução", color: "bg-amber-100 text-amber-700 border-amber-200" },
  concluida:   { label: "Concluída",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejeitada:   { label: "Rejeitada",   color: "bg-destructive/10 text-destructive border-destructive/20" },
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
  // Estudante
  estudante: string;
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
    estudante: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", faculdade: "Faculdade de Engenharia", ano: 2,
    tipo: "actualizacao_dados_portal",
    assunto: "Não consigo entrar no Portal — credenciais inválidas",
    descricao: "Após mudança de palavra-passe deixei de aceder. O sistema rejeita as novas credenciais.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "em_execucao", prioridade: "alta", slaDias: 2,
    dataSubmissao: "2025-12-14", dataEncaminhamento: "2025-12-14",
    historico: [
      { data: "2025-12-14 09:12", actor: "Portal do Estudante", accao: "Solicitação submetida pelo estudante" },
      { data: "2025-12-14 09:13", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-14 14:32", actor: CTI_PAULO, accao: "Atribuída", nota: "A verificar registo no AD." },
    ],
  },
  {
    id: "SOL-2025-0141",
    estudante: "Carlos Mendes", matricula: "2024015", curso: "Direito", faculdade: "Faculdade de Direito", ano: 1,
    tipo: "actualizacao_dados_email",
    assunto: "Email institucional não recebe mensagens externas",
    descricao: "Mensagens enviadas de Gmail não chegam à minha caixa @upra.kor.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "encaminhada", prioridade: "media", slaDias: 2,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 10:04", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-15 10:04", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0140",
    estudante: "Maria João Santos", matricula: "2023042", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 3,
    tipo: "actualizacao_dados_canal",
    assunto: "Canal de Estudante não regista os meus pedidos",
    descricao: "Ao submeter um pedido o sistema mostra erro e não devolve número de protocolo.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "em_execucao", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-12-12", dataEncaminhamento: "2025-12-12",
    historico: [
      { data: "2025-12-12 11:21", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-12 11:22", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-12 15:40", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-12-13 09:10", actor: CTI_PAULO, accao: "Em diagnóstico", nota: "Erro reproduzido em ambiente de teste." },
    ],
  },
  {
    id: "SOL-2025-0139",
    estudante: "Pedro Almeida", matricula: "2024033", curso: "Economia", faculdade: "Faculdade de Economia", ano: 2,
    tipo: "actualizacao_calculo_medias",
    assunto: "Média do 1º semestre incorrecta no portal",
    descricao: "A média apresentada no portal não corresponde ao boletim de notas oficial.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "em_execucao", prioridade: "media", slaDias: 5,
    dataSubmissao: "2025-12-10", dataEncaminhamento: "2025-12-10",
    historico: [
      { data: "2025-12-10 08:45", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-10 08:45", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-11 10:00", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-12-13 16:20", actor: CTI_SARA, accao: "A aguardar dados da Académica", nota: "Pedido de validação enviado à Académica." },
    ],
  },
  {
    id: "SOL-2025-0138",
    estudante: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", faculdade: "Faculdade de Engenharia", ano: 4,
    tipo: "segunda_via_cartao",
    assunto: "Pedido de 2ª via — cartão extraviado",
    descricao: "Perdi o cartão de estudante no transporte público. Necessito de 2ª via.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "concluida", prioridade: "media", slaDias: 7,
    dataSubmissao: "2025-12-02", dataEncaminhamento: "2025-12-02", dataConclusao: "2025-12-08",
    historico: [
      { data: "2025-12-02 14:10", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-02 14:10", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-03 09:30", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-12-05 11:00", actor: CTI_PAULO, accao: "Cartão produzido" },
      { data: "2025-12-08 10:15", actor: CTI_PAULO, accao: "Concluída", nota: "Cartão entregue ao estudante." },
    ],
  },
  {
    id: "SOL-2025-0137",
    estudante: "João Baptista", matricula: "2024050", curso: "Gestão", faculdade: "Faculdade de Economia", ano: 1,
    tipo: "falha_cartao",
    assunto: "Cartão não funciona nos torniquetes",
    descricao: "Desde sexta-feira o cartão é rejeitado em todas as entradas.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "concluida", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-01", dataEncaminhamento: "2025-12-01", dataConclusao: "2025-12-04",
    historico: [
      { data: "2025-12-01 16:22", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-01 16:22", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-02 08:50", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-12-04 14:00", actor: CTI_SARA, accao: "Concluída", nota: "Reprogramação do chip; testado com sucesso." },
    ],
  },
  {
    id: "SOL-2025-0136",
    estudante: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", faculdade: "Faculdade de Ciências Sociais", ano: 3,
    tipo: "anulacao_cartao",
    assunto: "Anulação de cartão por suspeita de uso indevido",
    descricao: "Suspeito que o meu cartão foi clonado. Solicito anulação imediata.",
    destino: "CTI", responsavelDestino: CTI_PAULO,
    estado: "concluida", prioridade: "alta", slaDias: 3,
    dataSubmissao: "2025-11-28", dataEncaminhamento: "2025-11-28", dataConclusao: "2025-11-29",
    historico: [
      { data: "2025-11-28 17:40", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-11-28 17:40", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-11-29 09:00", actor: CTI_PAULO, accao: "Atribuída" },
      { data: "2025-11-29 11:30", actor: CTI_PAULO, accao: "Concluída", nota: "Cartão anulado no sistema. 2ª via deve ser pedida." },
    ],
  },
  {
    id: "SOL-2025-0135",
    estudante: "Tiago Mateus", matricula: "2024077", curso: "Arquitectura", faculdade: "Faculdade de Ciências Exatas", ano: 2,
    tipo: "segunda_via_cartao",
    assunto: "Pedido de 2ª via — cartão danificado",
    descricao: "O cartão partiu-se e deixou de ser lido. Solicito substituição.",
    destino: "CTI",
    estado: "recebida", prioridade: "baixa", slaDias: 7,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 11:55", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-15 11:55", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0134",
    estudante: "Helena Costa", matricula: "2024088", curso: "Enfermagem", faculdade: "Faculdade de Medicina", ano: 1,
    tipo: "actualizacao_dados_portal",
    assunto: "Actualização de número de telefone no Portal",
    descricao: "Mudei de operador e o portal não me deixa actualizar o contacto.",
    destino: "CTI",
    estado: "recebida", prioridade: "baixa", slaDias: 2,
    dataSubmissao: "2025-12-15",
    historico: [
      { data: "2025-12-15 13:08", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-15 13:08", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0133",
    estudante: "Rui Vasconcelos", matricula: "2023105", curso: "Eng. Informática", faculdade: "Faculdade de Engenharia", ano: 3,
    tipo: "actualizacao_dados_email",
    assunto: "Reset de palavra-passe do email institucional",
    descricao: "Esqueci a palavra-passe e a recuperação não envia o código.",
    destino: "CTI",
    estado: "encaminhada", prioridade: "media", slaDias: 2,
    dataSubmissao: "2025-12-15", dataEncaminhamento: "2025-12-15",
    historico: [
      { data: "2025-12-15 08:30", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-15 08:30", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0132",
    estudante: "Lucas Marques", matricula: "2024112", curso: "Direito", faculdade: "Faculdade de Direito", ano: 1,
    tipo: "actualizacao_dados_canal",
    assunto: "Não consigo aceder ao Canal de Estudante",
    descricao: "O Canal mostra ‘perfil não autorizado’ desde a inscrição.",
    destino: "CTI",
    estado: "encaminhada", prioridade: "media", slaDias: 3,
    dataSubmissao: "2025-12-14", dataEncaminhamento: "2025-12-14",
    historico: [
      { data: "2025-12-14 16:10", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-14 16:10", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
    ],
  },
  {
    id: "SOL-2025-0131",
    estudante: "Inês Cardoso", matricula: "2023060", curso: "Economia", faculdade: "Faculdade de Economia", ano: 3,
    tipo: "actualizacao_calculo_medias",
    assunto: "Cadeira em falta no cálculo da média ponderada",
    descricao: "A cadeira de Estatística II não consta no cálculo da minha média do ano.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "em_execucao", prioridade: "alta", slaDias: 5,
    dataSubmissao: "2025-12-08", dataEncaminhamento: "2025-12-08",
    historico: [
      { data: "2025-12-08 09:00", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-08 09:00", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-09 10:00", actor: CTI_SARA, accao: "Atribuída" },
    ],
  },
  {
    id: "SOL-2025-0130",
    estudante: "Filipe Soares", matricula: "2024090", curso: "Gestão", faculdade: "Faculdade de Economia", ano: 1,
    tipo: "falha_cartao",
    assunto: "Cartão lê mas não autoriza acesso à biblioteca",
    descricao: "Os torniquetes da biblioteca recusam o cartão; nas entradas principais funciona.",
    destino: "CTI",
    estado: "rejeitada", prioridade: "baixa", slaDias: 5,
    dataSubmissao: "2025-12-05", dataEncaminhamento: "2025-12-05", dataConclusao: "2025-12-06",
    historico: [
      { data: "2025-12-05 10:30", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-12-05 10:30", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-12-06 09:15", actor: CTI_PAULO, accao: "Rejeitada", nota: "Estudante sem matrícula activa em Biblioteca; reencaminhado à Académica." },
    ],
  },
  {
    id: "SOL-2025-0129",
    estudante: "Marta Pires", matricula: "2023072", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 4,
    tipo: "anulacao_cartao",
    assunto: "Anulação por término de matrícula",
    descricao: "Concluí o curso e quero anular o cartão activo.",
    destino: "CTI", responsavelDestino: CTI_SARA,
    estado: "concluida", prioridade: "baixa", slaDias: 3,
    dataSubmissao: "2025-11-25", dataEncaminhamento: "2025-11-25", dataConclusao: "2025-11-27",
    historico: [
      { data: "2025-11-25 14:00", actor: "Portal do Estudante", accao: "Solicitação submetida" },
      { data: "2025-11-25 14:00", actor: "Sistema", accao: "Encaminhada automaticamente para CTI" },
      { data: "2025-11-26 09:00", actor: CTI_SARA, accao: "Atribuída" },
      { data: "2025-11-27 11:00", actor: CTI_SARA, accao: "Concluída" },
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

// ─── Atendimentos & Estudantes em seguimento (mantidos do módulo anterior) ──
export type TicketCategoria = "academico" | "psicologico" | "financeiro" | "documentacao" | "social" | "carreira" | "saude";

export interface GapAtendimento {
  id: string;
  estudante: string; matricula: string; curso: string;
  motivo: string; categoria: TicketCategoria;
  data: string; hora: string; duracao: string;
  tipo: "presencial" | "online";
  estado: "agendado" | "concluido" | "cancelado" | "remarcar";
  responsavel: string;
  sala?: string; notas?: string;
}

export interface GapEstudanteSeguimento {
  id: string; nome: string; matricula: string; curso: string; ano: number;
  risco: "baixo" | "medio" | "alto";
  acompanhamentos: number; ultimoContacto: string; responsavel: string; motivo: string;
}

export const categoriaConfig: Record<TicketCategoria, { label: string; color: string }> = {
  academico:    { label: "Académico",    color: "bg-primary/10 text-primary border-primary/20" },
  psicologico:  { label: "Psicológico",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  financeiro:   { label: "Financeiro",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  documentacao: { label: "Documentação", color: "bg-blue-100 text-blue-700 border-blue-200" },
  social:       { label: "Social",       color: "bg-pink-100 text-pink-700 border-pink-200" },
  carreira:     { label: "Carreira",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  saude:        { label: "Saúde",        color: "bg-red-100 text-red-700 border-red-200" },
};

export const gapAtendimentos: GapAtendimento[] = [
  { id: "AT-001", estudante: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", motivo: "1ª sessão de acompanhamento psicológico", categoria: "psicologico", data: "2025-12-16", hora: "09:00", duracao: "50 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1" },
  { id: "AT-002", estudante: "Carlos Mendes", matricula: "2024015", curso: "Direito", motivo: "Orientação académica — métodos de estudo", categoria: "academico", data: "2025-12-16", hora: "10:30", duracao: "40 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2" },
  { id: "AT-003", estudante: "Pedro Almeida", matricula: "2024033", curso: "Economia", motivo: "Orientação vocacional", categoria: "carreira", data: "2025-12-16", hora: "14:00", duracao: "60 min", tipo: "online", estado: "agendado", responsavel: "Dr. João Tavares" },
  { id: "AT-004", estudante: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", motivo: "Acompanhamento de estágio", categoria: "carreira", data: "2025-12-17", hora: "11:00", duracao: "30 min", tipo: "presencial", estado: "agendado", responsavel: "Dra. Helena Cabral", sala: "Gab. GAP 1" },
  { id: "AT-005", estudante: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", motivo: "Encaminhamento médico", categoria: "saude", data: "2025-12-09", hora: "09:30", duracao: "20 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral", notas: "Encaminhamento entregue. Estudante satisfeita com a resolução." },
  { id: "AT-006", estudante: "Maria João Santos", matricula: "2023042", curso: "Medicina", motivo: "Apoio candidatura bolsa INAGBE", categoria: "financeiro", data: "2025-12-15", hora: "15:00", duracao: "45 min", tipo: "presencial", estado: "concluido", responsavel: "Dra. Helena Cabral" },
  { id: "AT-007", estudante: "João Baptista", matricula: "2024050", curso: "Gestão", motivo: "Mediação de conflito", categoria: "social", data: "2025-12-17", hora: "16:00", duracao: "60 min", tipo: "presencial", estado: "agendado", responsavel: "Dr. João Tavares", sala: "Gab. GAP 2" },
];

export const gapEstudantesSeguimento: GapEstudanteSeguimento[] = [
  { id: "S-001", nome: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", faculdade: "Faculdade de Engenharia", ano: 2, risco: "alto", acompanhamentos: 4, ultimoContacto: "2025-12-14", responsavel: "Dra. Helena Cabral", motivo: "Ansiedade académica" },
  { id: "S-002", nome: "Carlos Mendes", matricula: "2024015", curso: "Direito", faculdade: "Faculdade de Direito", ano: 1, risco: "medio", acompanhamentos: 2, ultimoContacto: "2025-12-13", responsavel: "Dr. João Tavares", motivo: "Adaptação ao curso" },
  { id: "S-003", nome: "Pedro Almeida", matricula: "2024033", curso: "Economia", faculdade: "Faculdade de Economia", ano: 2, risco: "medio", acompanhamentos: 3, ultimoContacto: "2025-12-13", responsavel: "Dr. João Tavares", motivo: "Orientação vocacional" },
  { id: "S-004", nome: "Maria João Santos", matricula: "2023042", curso: "Medicina", faculdade: "Faculdade de Medicina", ano: 3, risco: "baixo", acompanhamentos: 1, ultimoContacto: "2025-12-13", responsavel: "Dra. Helena Cabral", motivo: "Apoio financeiro" },
  { id: "S-005", nome: "Beatriz Lopes", matricula: "2023089", curso: "Psicologia", faculdade: "Faculdade de Ciências Sociais", ano: 3, risco: "baixo", acompanhamentos: 2, ultimoContacto: "2025-12-13", responsavel: "Dra. Helena Cabral", motivo: "Estágio curricular" },
  { id: "S-006", nome: "João Baptista", matricula: "2024050", curso: "Gestão", faculdade: "Faculdade de Economia", ano: 1, risco: "medio", acompanhamentos: 1, ultimoContacto: "2025-12-14", responsavel: "Dr. João Tavares", motivo: "Conflito grupo" },
];

// ─── KPIs ───────────────────────────────────────────────────────────────────
const slaEmRisco = solicitacoes.filter(s => {
  const st = getSlaStatus(s);
  return st === "em_risco" || st === "atrasado";
}).length;

export const gapKpis = {
  recebidas:   solicitacoes.filter(s => s.estado === "recebida").length,
  encaminhadas: solicitacoes.filter(s => s.estado === "encaminhada").length,
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
  id: string; estudante: string; matricula: string; curso: string; ano: number;
  assunto: string; descricao: string;
  categoria: TicketCategoria;        // derivada do destino
  estado: "aberto" | "em_andamento" | "resolvido" | "aguarda_estudante";
  prioridade: Prioridade;
  data: string;
  responsavel?: string;
};

const destinoToCategoria: Record<Destino, TicketCategoria> = {
  CTI: "documentacao", Académica: "academico", Financeiro: "financeiro",
  GAP: "psicologico", Secretaria: "documentacao",
};
const estadoToTicket: Record<EstadoSolicitacao, GapTicket["estado"]> = {
  recebida: "aberto", encaminhada: "aberto", em_execucao: "em_andamento",
  concluida: "resolvido", rejeitada: "resolvido",
};
export const gapTickets: GapTicket[] = solicitacoes.map(s => ({
  id: s.id, estudante: s.estudante, matricula: s.matricula, curso: s.curso, ano: s.ano,
  assunto: s.assunto, descricao: s.descricao,
  categoria: destinoToCategoria[s.destino],
  estado: estadoToTicket[s.estado],
  prioridade: s.prioridade,
  data: s.dataSubmissao,
  responsavel: s.responsavelDestino,
}));

export const ticketStatusConfig: Record<GapTicket["estado"], { label: string; color: string }> = {
  aberto:            { label: "Aberta",      color: "bg-orange-100 text-orange-700 border-orange-200" },
  em_andamento:      { label: "Em Execução", color: "bg-amber-100 text-amber-700 border-amber-200" },
  aguarda_estudante: { label: "Aguarda",     color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolvido:         { label: "Concluída",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export type TicketStatus = GapTicket["estado"];
