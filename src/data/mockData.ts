export type UserRole = "professor" | "student" | "coordenador_curso" | "decano" | "reitor" | "secretaria" | "financas" | "gap" | "inscricoes" | "academica2" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  course?: string;
  year?: number;
  presence?: string;
  position?: string;
  department?: string;
}

export interface Discipline {
  id: string;
  name: string;
  code: string;
  professor: string;
  professorEmail: string;
  schedule: string;
  room: string;
  summary: string;
  attendance: { present: number; absent: number; justified: number };
  progress: { watched: number; total: number };
  color: string;
}

export interface LessonTask {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: "pendente" | "entregue" | "atrasada";
  modality: "online" | "presencial";
  weight?: number;
  grade?: number;
}

export interface Lesson {
  id: string;
  disciplineId: string;
  title: string;
  number: number;
  professor: string;
  uploadDate: string;
  duration: string;
  progress: number;
  summary: string;
  materials: { name: string; type: string }[];
  thumbnail?: string;
  transcript: string;
  participants: string[];
  tasks: LessonTask[];
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "geral" | "urgente" | "evento" | "academico";
  date: string;
  author: string;
}

export interface Evaluation {
  name: string;
  grade: number | null;
  maxGrade: number;
  weight: number;
  date: string;
  published: boolean;
  modality: "online" | "presencial";
  description: string;
  room?: string;
  duration?: string;
  topics?: string[];
  allowedMaterials?: string;
}

export interface Grade {
  id: string;
  disciplineId: string;
  disciplineName: string;
  evaluations: Evaluation[];
}

export interface ChatConversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
  isGroup: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  read: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  category: "apoio" | "professor" | "colega";
  office?: string;
  hours?: string;
  discipline?: string;
  chatId?: string;
  classDays?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "aula" | "teste" | "entrega" | "exame" | "pessoal";
  date: string;
  startTime: string;
  endTime: string;
  duration?: string;
  professor?: string;
  room?: string;
  discipline?: string;
  color: string;
}

export interface StorageFile {
  id: string;
  name: string;
  type: "folder" | "document" | "spreadsheet" | "presentation" | "pdf" | "image" | "other";
  size?: string;
  date: string;
  folder?: string;
  shared?: boolean;
  sharedBy?: string;
  deleted?: boolean;
}

export interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "drafts" | "trash";
  attachments?: { name: string; size: string }[];
}

// Current user mock
export const currentStudent: User = {
  id: "1",
  name: "João Miguel Fernandes",
  email: "2934@upra.kor",
  role: "student",
  course: "Engenharia Informática",
  year: 2,
};

export const currentProfessor: User = {
  id: "2",
  name: "Prof. António Silva",
  email: "prof.silva@upra.kor",
  role: "professor",
};

export const currentCoordenadorCurso: User = {
  id: "4",
  name: "Dr. Fábio Costa",
  email: "coordcurso@upra.kor",
  role: "coordenador_curso",
  course: "Arquitectura",
};

export const currentDecano: User = {
  id: "5",
  name: "Prof. Dr. Ricardo Almeida",
  email: "decano@upra.kor",
  role: "decano",
};


export const currentReitor: User = {
  id: "7",
  name: "Dr. José Manuel",
  email: "reitor@upra.kor",
  role: "reitor",
};

export const currentSecretaria: User = {
  id: "7",
  name: "Dra. Teresa Nascimento",
  email: "academica@upra.kor",
  role: "secretaria",
};

export const currentFinancas: User = {
  id: "8",
  name: "",
  email: "financas@upra.kor",
  role: "financas",
};

export const currentGap: User = {
  id: "9",
  name: "Dra. Helena Cabral",
  email: "gap@upra.kor",
  role: "gap",
};

export const currentInscricoes: User = {
  id: "10",
  name: "Portal de Inscrições",
  email: "inscricoes@upra.kor",
  role: "inscricoes",
};

export const currentAcademica2: User = {
  id: "11",
  name: "Dra. Beatriz Carmona",
  email: "areaacademica2@upra.kor",
  role: "academica2",
};

export const currentAdmin: User = {
  id: "12",
  name: "Administrador da Instituição",
  email: "admin@upra.kor",
  role: "admin",
};

// Disciplines
export const disciplines: Discipline[] = [
  {
    id: "1",
    name: "Matemática II",
    code: "MAT201",
    professor: "Prof. António Silva",
    professorEmail: "prof.silva@upra.kor",
    schedule: "Seg/Qua/Sex 08:00-09:30",
    room: "Sala 101",
    summary: "Cadeira focada em cálculo integral, séries numéricas e equações diferenciais ordinárias, com aplicações em engenharia e métodos de Laplace.",
    attendance: { present: 28, absent: 4, justified: 2 },
    progress: { watched: 12, total: 18 },
    color: "hsl(224, 64%, 33%)",
  },
  {
    id: "2",
    name: "Física Aplicada",
    code: "FIS202",
    professor: "Prof. Maria Santos",
    professorEmail: "prof.santos@upra.kor",
    schedule: "Seg/Qua 10:00-11:30",
    room: "Lab. 3",
    summary: "Mecânica dos fluidos, termodinâmica, ondas e óptica. Experiências laboratoriais e resolução de problemas práticos.",
    attendance: { present: 24, absent: 6, justified: 1 },
    progress: { watched: 10, total: 15 },
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "3",
    name: "Programação II",
    code: "INF203",
    professor: "Prof. Pedro Ferreira",
    professorEmail: "prof.ferreira@upra.kor",
    schedule: "Seg/Qua/Sex 14:00-15:30",
    room: "Info. 2",
    summary: "Estruturas de dados avançadas, algoritmos de ordenação e pesquisa, programação orientada a objectos em Java.",
    attendance: { present: 30, absent: 2, justified: 0 },
    progress: { watched: 14, total: 16 },
    color: "hsl(175, 84%, 32%)",
  },
  {
    id: "4",
    name: "Química Geral",
    code: "QUI201",
    professor: "Prof. Ana Costa",
    professorEmail: "prof.costa@upra.kor",
    schedule: "Ter/Qui 10:00-11:30",
    room: "Lab. 5",
    summary: "Estrutura atómica, ligações químicas, reacções químicas, estequiometria, soluções e equilíbrio químico.",
    attendance: { present: 26, absent: 5, justified: 1 },
    progress: { watched: 8, total: 14 },
    color: "hsl(280, 60%, 45%)",
  },
  {
    id: "5",
    name: "Inglês Técnico",
    code: "ING201",
    professor: "Prof. David Lopes",
    professorEmail: "prof.lopes@upra.kor",
    schedule: "Ter/Qui 14:00-15:30",
    room: "Sala 205",
    summary: "Leitura e redacção de textos técnicos em inglês, vocabulário especializado, apresentações orais e comunicação profissional.",
    attendance: { present: 29, absent: 3, justified: 0 },
    progress: { watched: 11, total: 13 },
    color: "hsl(340, 65%, 47%)",
  },
  {
    id: "6",
    name: "Desenho Técnico",
    code: "DES201",
    professor: "Prof. Luísa Tavares",
    professorEmail: "prof.tavares@upra.kor",
    schedule: "Ter/Qui 08:00-09:30",
    room: "Sala 110",
    summary: "Projecções ortogonais, cortes e secções, cotagem, desenho assistido por computador (AutoCAD) e normalização técnica.",
    attendance: { present: 27, absent: 4, justified: 1 },
    progress: { watched: 9, total: 12 },
    color: "hsl(200, 70%, 45%)",
  },
];

// Lessons
export const lessons: Lesson[] = [
  { id: "l1", disciplineId: "1", title: "Introdução ao Cálculo Integral", number: 1, professor: "Prof. António Silva", uploadDate: "05/02/2024", date: "05/02/2024", duration: "1h 20min", progress: 100, summary: "Conceitos fundamentais de integral definido e indefinido. Propriedades e regras básicas de integração.", materials: [{ name: "Slides Aula 1", type: "pdf" }, { name: "Exercícios", type: "pdf" }], transcript: "Bom dia a todos. Hoje vamos iniciar o estudo do cálculo integral. O integral é uma das ferramentas fundamentais da análise matemática...", participants: ["Prof. António Silva", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Carlos Santos", "Rita Oliveira"], tasks: [{ id: "t1", title: "Resolver exercícios 1-10 do capítulo 3", description: "Resolver os exercícios do manual sobre integrais indefinidos. Mostrar todos os passos de resolução.", assignedDate: "05/02/2024", dueDate: "08/02/2024", status: "entregue", modality: "presencial", weight: 15, grade: 16 }] },
  { id: "l2", disciplineId: "1", title: "Técnicas de Integração", number: 2, professor: "Prof. António Silva", uploadDate: "08/02/2024", date: "08/02/2024", duration: "1h 15min", progress: 100, summary: "Integração por partes, substituição trigonométrica e fracções parciais.", materials: [{ name: "Slides Aula 2", type: "pdf" }], transcript: "Na aula de hoje vamos explorar as técnicas mais importantes de integração. Começamos pela integração por partes...", participants: ["Prof. António Silva", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Carlos Santos"], tasks: [{ id: "t2", title: "Trabalho de integração por partes", description: "Resolver 5 integrais usando o método de integração por partes. Entregar em formato PDF.", assignedDate: "08/02/2024", dueDate: "12/02/2024", status: "entregue", modality: "presencial", weight: 15, grade: 14 }] },
  { id: "l3", disciplineId: "1", title: "Integrais Impróprios", number: 3, professor: "Prof. António Silva", uploadDate: "12/02/2024", date: "12/02/2024", duration: "1h 25min", progress: 75, summary: "Integrais com limites infinitos e funções descontínuas. Critérios de convergência.", materials: [{ name: "Slides Aula 3", type: "pdf" }, { name: "Lista de Exercícios 2", type: "pdf" }], transcript: "Hoje vamos tratar de um tema muito importante: os integrais impróprios. Estes são integrais onde os limites de integração são infinitos...", participants: ["Prof. António Silva", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Carlos Santos", "Rita Oliveira", "Bruno Mendes"], tasks: [] },
  { id: "l4", disciplineId: "1", title: "Séries Numéricas I", number: 4, professor: "Prof. António Silva", uploadDate: "15/02/2024", date: "15/02/2024", duration: "1h 30min", progress: 40, summary: "Introdução às séries numéricas, séries geométricas e telescópicas.", materials: [{ name: "Slides Séries I", type: "pdf" }, { name: "Tabela de Séries", type: "pdf" }], transcript: "Iniciamos hoje o estudo das séries numéricas. Uma série é a soma dos termos de uma sucessão. Vamos começar com as séries geométricas...", participants: ["Prof. António Silva", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes"], tasks: [{ id: "t3", title: "Exercícios sobre séries geométricas", description: "Determinar a convergência e calcular a soma de 8 séries geométricas e telescópicas. Justificar cada resposta.", assignedDate: "15/02/2024", dueDate: "19/02/2024", status: "pendente", modality: "presencial", weight: 20 }] },
  { id: "l5", disciplineId: "1", title: "Séries Numéricas II", number: 5, professor: "Prof. António Silva", uploadDate: "19/02/2024", date: "19/02/2024", duration: "1h 20min", progress: 0, summary: "Critérios de convergência: comparação, razão, raiz e integral.", materials: [{ name: "Resumo Séries", type: "pdf" }], transcript: "Continuamos com o estudo das séries numéricas. Hoje vamos aprender critérios para determinar se uma série converge ou diverge...", participants: ["Prof. António Silva", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Carlos Santos", "Rita Oliveira"], tasks: [{ id: "t4", title: "Trabalho sobre critérios de convergência", description: "Aplicar os diferentes critérios de convergência a uma lista de 10 séries. Indicar qual critério é mais adequado para cada caso.", assignedDate: "19/02/2024", dueDate: "23/02/2024", status: "pendente", modality: "presencial", weight: 20 }] },
  { id: "l6", disciplineId: "3", title: "Listas Ligadas", number: 1, professor: "Prof. Pedro Ferreira", uploadDate: "06/02/2024", date: "06/02/2024", duration: "1h 45min", progress: 100, summary: "Implementação de listas ligadas simples e duplamente ligadas em Java.", materials: [{ name: "Código Exemplo", type: "zip" }, { name: "Slides Listas Ligadas", type: "pdf" }], transcript: "Bem-vindos à primeira aula de Programação II. Hoje vamos estudar uma das estruturas de dados mais fundamentais: as listas ligadas...", participants: ["Prof. Pedro Ferreira", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Bruno Mendes", "Catarina Reis"], tasks: [{ id: "t5", title: "Implementar lista ligada simples", description: "Implementar uma lista ligada simples em Java com operações de inserção, remoção e pesquisa. Submeter via plataforma.", assignedDate: "06/02/2024", dueDate: "10/02/2024", status: "entregue", modality: "presencial", weight: 25, grade: 17 }] },
  { id: "l7", disciplineId: "3", title: "Pilhas e Filas", number: 2, professor: "Prof. Pedro Ferreira", uploadDate: "09/02/2024", date: "09/02/2024", duration: "1h 30min", progress: 100, summary: "Estruturas LIFO e FIFO. Implementação com arrays e listas ligadas.", materials: [{ name: "Slides", type: "pdf" }, { name: "Exercícios Práticos", type: "pdf" }], transcript: "Na aula de hoje vamos estudar duas estruturas de dados muito utilizadas: pilhas e filas. Estas baseiam-se nos princípios LIFO e FIFO...", participants: ["Prof. Pedro Ferreira", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Bruno Mendes"], tasks: [{ id: "t6", title: "Projecto pilha de calculadora", description: "Implementar uma calculadora em notação polaca inversa usando uma pilha. Apresentar em aula.", assignedDate: "09/02/2024", dueDate: "16/02/2024", status: "entregue", modality: "presencial", weight: 30, grade: 18 }] },
  { id: "l8", disciplineId: "2", title: "Mecânica dos Fluidos I", number: 1, professor: "Prof. Maria Santos", uploadDate: "07/02/2024", date: "07/02/2024", duration: "1h 35min", progress: 100, summary: "Propriedades dos fluidos, pressão hidrostática e princípio de Pascal.", materials: [{ name: "Slides Aula 1", type: "pdf" }, { name: "Formulário", type: "pdf" }], transcript: "Hoje iniciamos o módulo de mecânica dos fluidos. Vamos começar por definir o que é um fluido e estudar as suas propriedades fundamentais...", participants: ["Prof. Maria Santos", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Carlos Santos", "Rita Oliveira", "Diogo Pereira"], tasks: [{ id: "t7", title: "Relatório de laboratório - pressão", description: "Elaborar relatório sobre a experiência de medição de pressão hidrostática realizada em aula. Incluir gráficos e análise de resultados.", assignedDate: "07/02/2024", dueDate: "14/02/2024", status: "entregue", modality: "presencial", weight: 20, grade: 15 }] },
  { id: "l9", disciplineId: "4", title: "Estrutura Atómica", number: 1, professor: "Prof. Ana Costa", uploadDate: "06/02/2024", date: "06/02/2024", duration: "1h 30min", progress: 80, summary: "Modelos atómicos, números quânticos e configuração electrónica dos elementos.", materials: [{ name: "Slides Estrutura Atómica", type: "pdf" }, { name: "Tabela Periódica Interactiva", type: "pdf" }], transcript: "Vamos iniciar o estudo da estrutura atómica. A compreensão do átomo é fundamental para toda a química...", participants: ["Prof. Ana Costa", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes"], tasks: [] },
  { id: "l10", disciplineId: "4", title: "Ligações Químicas", number: 2, professor: "Prof. Ana Costa", uploadDate: "09/02/2024", date: "09/02/2024", duration: "1h 25min", progress: 60, summary: "Ligações iónicas, covalentes e metálicas. Geometria molecular e teoria VSEPR.", materials: [{ name: "Slides Ligações", type: "pdf" }], transcript: "Hoje vamos estudar os diferentes tipos de ligações químicas e como estas determinam as propriedades das substâncias...", participants: ["Prof. Ana Costa", "João Fernandes", "Maria Silva", "Pedro Nascimento"], tasks: [{ id: "t8", title: "Exercícios sobre ligações químicas", description: "Resolver os exercícios 1-15 do capítulo 4 sobre tipos de ligações e geometria molecular.", assignedDate: "09/02/2024", dueDate: "13/02/2024", status: "entregue", modality: "presencial", weight: 10, grade: 13 }] },
  { id: "l11", disciplineId: "5", title: "Technical Writing Basics", number: 1, professor: "Prof. David Lopes", uploadDate: "06/02/2024", date: "06/02/2024", duration: "1h 15min", progress: 100, summary: "Introduction to technical writing: structure, clarity, and precision in English.", materials: [{ name: "Technical Writing Guide", type: "pdf" }, { name: "Sample Reports", type: "pdf" }], transcript: "Welcome everyone. Today we begin our journey into technical writing. Technical writing differs from creative writing in several key ways...", participants: ["Prof. David Lopes", "João Fernandes", "Maria Silva", "Ana Gomes", "Carlos Santos"], tasks: [] },
  { id: "l12", disciplineId: "5", title: "Oral Presentations", number: 2, professor: "Prof. David Lopes", uploadDate: "09/02/2024", date: "09/02/2024", duration: "1h 20min", progress: 100, summary: "Structuring and delivering effective technical presentations in English.", materials: [{ name: "Presentation Tips", type: "pdf" }], transcript: "In today's class we will focus on how to structure and deliver a compelling technical presentation...", participants: ["Prof. David Lopes", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes"], tasks: [{ id: "t9", title: "Prepare 5-minute presentation", description: "Prepare a 5-minute technical presentation on a topic of your choice. Focus on structure and vocabulary.", assignedDate: "09/02/2024", dueDate: "14/02/2024", status: "entregue", modality: "presencial", weight: 25, grade: 16 }] },
  { id: "l13", disciplineId: "6", title: "Projecções Ortogonais", number: 1, professor: "Prof. Luísa Tavares", uploadDate: "06/02/2024", date: "06/02/2024", duration: "1h 40min", progress: 90, summary: "Fundamentos das projecções ortogonais: vistas principal, lateral e superior.", materials: [{ name: "Slides Projecções", type: "pdf" }, { name: "Exercícios de Desenho", type: "pdf" }, { name: "Normas ISO", type: "pdf" }], transcript: "Bem-vindos à primeira aula de Desenho Técnico. Vamos começar pelos fundamentos das projecções ortogonais...", participants: ["Prof. Luísa Tavares", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Bruno Mendes"], tasks: [{ id: "t10", title: "Desenhar 3 vistas de peça", description: "Desenhar as 3 vistas ortogonais de uma peça mecânica fornecida. Usar folha A3 e esquadros.", assignedDate: "06/02/2024", dueDate: "10/02/2024", status: "entregue", modality: "presencial", weight: 20, grade: 17 }] },
  { id: "l14", disciplineId: "6", title: "Cotagem e Tolerâncias", number: 2, professor: "Prof. Luísa Tavares", uploadDate: "09/02/2024", date: "09/02/2024", duration: "1h 30min", progress: 50, summary: "Regras de cotagem, tolerâncias dimensionais e acabamentos superficiais.", materials: [{ name: "Slides Cotagem", type: "pdf" }, { name: "Tabela de Tolerâncias", type: "pdf" }], transcript: "Hoje vamos aprender as regras fundamentais de cotagem. A cotagem é essencial para a comunicação técnica...", participants: ["Prof. Luísa Tavares", "João Fernandes", "Maria Silva", "Pedro Nascimento", "Ana Gomes", "Bruno Mendes"], tasks: [] },
];

// Announcements — sourced from the `anuncios` table (see useAnuncios). Kept as
// an empty export so legacy imports continue to compile while migrating.
export const announcements: Announcement[] = [];

// Grades
export const grades: Grade[] = [
  { id: "g1", disciplineId: "1", disciplineName: "Matemática II", evaluations: [
    { name: "Teste 1", grade: 14, maxGrade: 20, weight: 25, date: "15/02/2024", published: true, modality: "presencial", description: "Teste sobre cálculo integral: integrais indefinidos, técnicas de integração por partes e substituição.", room: "Sala 101", duration: "2h", topics: ["Integrais indefinidos", "Integração por partes", "Substituição trigonométrica"], allowedMaterials: "Formulário (1 folha A4)" },
    { name: "Trabalho 1", grade: 16, maxGrade: 20, weight: 15, date: "20/02/2024", published: true, modality: "presencial", description: "Trabalho individual sobre aplicações do cálculo integral em problemas de engenharia.", topics: ["Cálculo de áreas", "Volumes de revolução", "Aplicações práticas"], allowedMaterials: "Todos os materiais permitidos" },
    { name: "Teste 2", grade: null, maxGrade: 20, weight: 25, date: "25/03/2024", published: false, modality: "presencial", description: "Teste sobre séries numéricas, critérios de convergência e séries de potências.", room: "Sala 101", duration: "2h", topics: ["Séries numéricas", "Critérios de convergência", "Séries de potências"], allowedMaterials: "Formulário (1 folha A4)" },
    { name: "Exame Final", grade: null, maxGrade: 20, weight: 35, date: "20/05/2024", published: false, modality: "presencial", description: "Exame final abrangendo toda a matéria do semestre.", room: "Auditório", duration: "3h", topics: ["Toda a matéria"], allowedMaterials: "Formulário (2 folhas A4)" },
  ]},
  { id: "g2", disciplineId: "3", disciplineName: "Programação II", evaluations: [
    { name: "Projecto 1", grade: 17, maxGrade: 20, weight: 20, date: "10/02/2024", published: true, modality: "presencial", description: "Projecto de implementação de estruturas de dados básicas em Java: listas ligadas e pilhas.", topics: ["Listas ligadas", "Pilhas", "Testes unitários"], allowedMaterials: "IDE, documentação Java" },
    { name: "Teste 1", grade: 15, maxGrade: 20, weight: 30, date: "22/02/2024", published: true, modality: "presencial", description: "Teste teórico-prático sobre estruturas de dados e complexidade algorítmica.", room: "Info. 2", duration: "1h 30min", topics: ["Complexidade algorítmica", "Listas", "Pilhas e filas"], allowedMaterials: "Nenhum" },
    { name: "Projecto Final", grade: null, maxGrade: 20, weight: 50, date: "15/04/2024", published: false, modality: "presencial", description: "Projecto final em grupo: implementação de um sistema completo usando árvores, grafos e algoritmos de ordenação.", topics: ["Árvores", "Grafos", "Algoritmos de ordenação", "Trabalho em equipa"], allowedMaterials: "Todos os recursos" },
  ]},
  { id: "g3", disciplineId: "2", disciplineName: "Física Aplicada", evaluations: [
    { name: "Relatório Lab 1", grade: 13, maxGrade: 20, weight: 15, date: "12/02/2024", published: true, modality: "presencial", description: "Relatório sobre a experiência de mecânica dos fluidos realizada em laboratório.", topics: ["Pressão hidrostática", "Princípio de Pascal", "Análise experimental"], allowedMaterials: "Template do relatório" },
    { name: "Teste 1", grade: null, maxGrade: 20, weight: 35, date: "01/03/2024", published: false, modality: "presencial", description: "Teste sobre mecânica dos fluidos e termodinâmica.", room: "Lab. 3", duration: "2h", topics: ["Mecânica dos fluidos", "Termodinâmica", "Problemas numéricos"], allowedMaterials: "Formulário e calculadora" },
    { name: "Exame Final", grade: null, maxGrade: 20, weight: 50, date: "20/05/2024", published: false, modality: "presencial", description: "Exame final teórico-prático.", room: "Auditório", duration: "3h", topics: ["Toda a matéria"], allowedMaterials: "Formulário e calculadora" },
  ]},
  { id: "g4", disciplineId: "4", disciplineName: "Química Geral", evaluations: [
    { name: "Teste 1", grade: 12, maxGrade: 20, weight: 40, date: "18/02/2024", published: true, modality: "presencial", description: "Teste sobre estrutura atómica e ligações químicas.", room: "Lab. 5", duration: "1h 30min", topics: ["Estrutura atómica", "Ligações químicas", "Geometria molecular"], allowedMaterials: "Tabela periódica" },
    { name: "Relatório Lab", grade: null, maxGrade: 20, weight: 20, date: "10/03/2024", published: false, modality: "presencial", description: "Relatório da experiência de reacções químicas e estequiometria.", topics: ["Reacções químicas", "Estequiometria", "Análise de dados"], allowedMaterials: "Template do relatório" },
  ]},
  { id: "g5", disciplineId: "5", disciplineName: "Inglês Técnico", evaluations: [
    { name: "Apresentação Oral", grade: 16, maxGrade: 20, weight: 30, date: "14/02/2024", published: true, modality: "presencial", description: "Apresentação oral em inglês sobre um tema técnico à escolha do aluno.", room: "Sala 205", duration: "15min + Q&A", topics: ["Fluência", "Vocabulário técnico", "Estrutura da apresentação"], allowedMaterials: "Slides de apoio" },
    { name: "Teste Escrito", grade: null, maxGrade: 20, weight: 70, date: "05/03/2024", published: false, modality: "presencial", description: "Teste escrito de compreensão e produção de textos técnicos em inglês.", room: "Sala 205", duration: "2h", topics: ["Reading comprehension", "Technical writing", "Grammar"], allowedMaterials: "Dicionário monolingue" },
  ]},
  { id: "g6", disciplineId: "6", disciplineName: "Desenho Técnico", evaluations: [
    { name: "Trabalho 1", grade: 15, maxGrade: 20, weight: 30, date: "12/02/2024", published: true, modality: "presencial", description: "Trabalho prático de projecções ortogonais.", room: "Sala 110", duration: "Entrega em aula", topics: ["Projecções ortogonais", "Vistas"], allowedMaterials: "Esquadros e compasso" },
    { name: "Teste Prático", grade: null, maxGrade: 20, weight: 70, date: "15/03/2024", published: false, modality: "presencial", description: "Teste prático de cotagem e desenho técnico.", room: "Sala 110", duration: "2h", topics: ["Cotagem", "Tolerâncias", "Normas ISO"], allowedMaterials: "Esquadros, compasso e normas" },
  ]},
];

// Chat conversations
export const chatConversations: ChatConversation[] = [
  { id: "c1", name: "Prof. António Silva", lastMessage: "Boa tarde, já viste a aula 15?", time: "14:35", unread: 2, online: true, isGroup: false },
  { id: "c2", name: "Maria Silva", lastMessage: "Vamos estudar juntos amanhã?", time: "12:20", unread: 0, online: false, isGroup: false },
  { id: "c3", name: "Grupo Matemática II", lastMessage: "Pedro: Alguém tem os exercícios?", time: "10:15", unread: 5, online: false, isGroup: true },
  { id: "c4", name: "Prof. Pedro Ferreira", lastMessage: "O prazo do projecto foi estendido.", time: "Ontem", unread: 0, online: true, isGroup: false },
  { id: "c5", name: "Turma 2º Ano Informática", lastMessage: "Ana: Mudaram a sala de Física?", time: "Ontem", unread: 0, online: false, isGroup: true },
  { id: "c6", name: "Grupo Projecto Programação", lastMessage: "Bruno: Já fiz a parte dos grafos", time: "10:00", unread: 3, online: false, isGroup: true },
  { id: "c7", name: "Grupo Física Lab", lastMessage: "Catarina: Relatório está quase pronto", time: "Ontem", unread: 0, online: false, isGroup: true },
];

export const chatMessages: ChatMessage[] = [
  { id: "m1", conversationId: "c1", sender: "Prof. António Silva", content: "Boa tarde João, já viste a aula 15?", time: "14:32", isOwn: false, read: true },
  { id: "m2", conversationId: "c1", sender: "Tu", content: "Sim professor, mas tenho uma dúvida sobre o exercício 3...", time: "14:35", isOwn: true, read: true },
  { id: "m3", conversationId: "c1", sender: "Prof. António Silva", content: "Claro, podemos fazer uma chamada rápida?", time: "14:36", isOwn: false, read: false },
];

// Contacts
export const contacts: Contact[] = [
  { id: "ct1", name: "Apoio ao Estudante", email: "apoio@upra.kor", role: "Apoio", category: "apoio" },
  { id: "ct2", name: "Serviços Académicos", email: "academico@upra.kor", role: "Académico", category: "apoio" },
  { id: "ct3", name: "Biblioteca", email: "biblioteca@upra.kor", role: "Biblioteca", category: "apoio" },
  { id: "ct4", name: "Tesouraria", email: "tesouraria@upra.kor", role: "Tesouraria", category: "apoio" },
  { id: "ct5", name: "Suporte Técnico", email: "suporte@upra.kor", role: "Suporte", category: "apoio" },
  { id: "ct6", name: "Gabinete de Estágios", email: "estagios@upra.kor", role: "Estágios", category: "apoio" },
  { id: "ct7", name: "Prof. António Silva", email: "prof.silva@upra.kor", role: "Matemática II", category: "professor", office: "Gab. 204", hours: "Ter/Qui 16:00-17:30", discipline: "Matemática II", chatId: "c1", classDays: "Seg · Qua · Qui" },
  { id: "ct8", name: "Prof. Maria Santos", email: "prof.santos@upra.kor", role: "Física Aplicada", category: "professor", office: "Lab. 3", hours: "Seg/Qua 16:00-17:00", discipline: "Física Aplicada", classDays: "Seg · Qua" },
  { id: "ct9", name: "Prof. Pedro Ferreira", email: "prof.ferreira@upra.kor", role: "Programação II", category: "professor", office: "Info. 5", hours: "Ter/Qui 15:00-16:30", discipline: "Programação II", chatId: "c4", classDays: "Seg · Qua · Sex" },
  { id: "ct10", name: "Prof. Ana Costa", email: "prof.costa@upra.kor", role: "Química Geral", category: "professor", office: "Lab. 7", hours: "Seg 14:00-16:00", discipline: "Química Geral", classDays: "Ter · Qui" },
  { id: "ct11", name: "Prof. David Lopes", email: "prof.lopes@upra.kor", role: "Inglês Técnico", category: "professor", office: "Sala 301", hours: "Qua 14:00-16:00", discipline: "Inglês Técnico", classDays: "Ter · Qui" },
  { id: "ct15", name: "Prof. Luísa Tavares", email: "prof.tavares@upra.kor", role: "Desenho Técnico", category: "professor", office: "Sala 110", hours: "Ter 15:30-17:00", discipline: "Desenho Técnico", classDays: "Ter" },
  { id: "ct12", name: "Maria Silva", email: "3012@upra.kor", role: "Colega - 2º Ano", category: "colega", chatId: "c2" },
  { id: "ct13", name: "Pedro Nascimento", email: "2987@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct14", name: "Ana Luísa Gomes", email: "3045@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct16", name: "Bruno Costa", email: "3021@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct17", name: "Sofia Martins", email: "3033@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct18", name: "Tiago Almeida", email: "3044@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct19", name: "Inês Pereira", email: "3055@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct20", name: "Diogo Ferreira", email: "3066@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct21", name: "Beatriz Lopes", email: "3077@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct22", name: "Miguel Rodrigues", email: "3088@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct23", name: "Catarina Sousa", email: "3099@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct24", name: "André Mendes", email: "3100@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct25", name: "Mariana Ribeiro", email: "3111@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct26", name: "Rui Carvalho", email: "3122@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct27", name: "Leonor Pinto", email: "3133@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct28", name: "Hugo Araújo", email: "3144@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct29", name: "Clara Monteiro", email: "3155@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct30", name: "Filipe Teixeira", email: "3166@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct31", name: "Marta Correia", email: "3177@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct32", name: "Gonçalo Dias", email: "3188@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct33", name: "Luísa Neves", email: "3199@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct34", name: "Tomás Moreira", email: "3210@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct35", name: "Sara Baptista", email: "3221@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct36", name: "Daniel Vieira", email: "3232@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct37", name: "Eva Cunha", email: "3243@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct38", name: "Francisco Lima", email: "3254@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct39", name: "Joana Cardoso", email: "3265@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct40", name: "Ricardo Fonseca", email: "3276@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct41", name: "Patrícia Rocha", email: "3287@upra.kor", role: "Colega - 2º Ano", category: "colega" },
  { id: "ct42", name: "Nuno Barros", email: "3298@upra.kor", role: "Colega - 2º Ano", category: "colega" },
];

// Coordinator personal agenda events (synced with calendar)
export const coordAgendaEvents: CalendarEvent[] = [
  { id: "ca1", title: "Reunião Conselho Pedagógico", type: "pessoal", date: "2024-02-12", startTime: "09:00", endTime: "10:30", duration: "1h 30min", room: "Sala de Reuniões B", color: "hsl(220, 70%, 50%)" },
  { id: "ca2", title: "Revisão Planos Curriculares", type: "pessoal", date: "2024-02-13", startTime: "10:00", endTime: "12:00", duration: "2h", room: "Gabinete", color: "hsl(160, 60%, 40%)" },
  { id: "ca3", title: "Reunião com Docentes — 1º Ano", type: "pessoal", date: "2024-02-14", startTime: "08:30", endTime: "09:30", duration: "1h", room: "Sala de Reuniões A", color: "hsl(220, 70%, 50%)" },
  { id: "ca4", title: "Análise de Aprovações Pendentes", type: "pessoal", date: "2024-02-14", startTime: "10:00", endTime: "11:00", duration: "1h", room: "Gabinete", color: "hsl(30, 70%, 50%)" },
  { id: "ca5", title: "Almoço com Decano da Faculdade", type: "pessoal", date: "2024-02-14", startTime: "12:30", endTime: "14:00", duration: "1h 30min", room: "Restaurante Universitário", color: "hsl(340, 70%, 50%)" },
  { id: "ca6", title: "Atendimento a Estudantes", type: "pessoal", date: "2024-02-14", startTime: "14:30", endTime: "16:00", duration: "1h 30min", room: "Gabinete 204", color: "hsl(270, 60%, 50%)" },
  { id: "ca7", title: "Preparação Relatório Semestral", type: "pessoal", date: "2024-02-14", startTime: "16:30", endTime: "18:00", duration: "1h 30min", room: "Gabinete", color: "hsl(160, 60%, 40%)" },
  { id: "ca8", title: "Reunião Comissão de Avaliação", type: "pessoal", date: "2024-02-15", startTime: "09:00", endTime: "10:30", duration: "1h 30min", room: "Sala de Reuniões C", color: "hsl(220, 70%, 50%)" },
  { id: "ca9", title: "Visita Laboratórios — 2º Ano", type: "pessoal", date: "2024-02-15", startTime: "14:00", endTime: "15:30", duration: "1h 30min", room: "Lab. Engenharia", color: "hsl(30, 70%, 50%)" },
  { id: "ca10", title: "Entrevista Candidatos Docentes", type: "pessoal", date: "2024-02-16", startTime: "10:00", endTime: "12:00", duration: "2h", room: "Sala de Reuniões A", color: "hsl(340, 70%, 50%)" },
];

// Calendar events
export const calendarEvents: CalendarEvent[] = [
  { id: "e1", title: "Matemática II", type: "aula", date: "2024-02-12", startTime: "08:00", endTime: "09:30", duration: "1h 30min", professor: "Prof. António Silva", room: "Sala 101", discipline: "Matemática II", color: "hsl(224, 64%, 33%)" },
  { id: "e2", title: "Física Aplicada", type: "aula", date: "2024-02-12", startTime: "10:00", endTime: "11:30", duration: "1h 30min", professor: "Prof. Ricardo Santos", room: "Lab. 3", discipline: "Física Aplicada", color: "hsl(25, 95%, 53%)" },
  { id: "e3", title: "Programação II", type: "aula", date: "2024-02-12", startTime: "14:00", endTime: "15:30", duration: "1h 30min", professor: "Prof. Carlos Ferreira", room: "Info. 2", discipline: "Programação II", color: "hsl(175, 84%, 32%)" },
  { id: "e4", title: "Química Geral", type: "aula", date: "2024-02-13", startTime: "10:00", endTime: "11:30", duration: "1h 30min", professor: "Prof. Maria Costa", room: "Lab. 5", discipline: "Química Geral", color: "hsl(280, 60%, 45%)" },
  { id: "e5", title: "Inglês Técnico", type: "aula", date: "2024-02-13", startTime: "14:00", endTime: "15:30", duration: "1h 30min", professor: "Prof. Ana Lopes", room: "Sala 205", discipline: "Inglês Técnico", color: "hsl(340, 65%, 47%)" },
  { id: "e6", title: "Matemática II", type: "aula", date: "2024-02-14", startTime: "08:00", endTime: "09:30", duration: "1h 30min", professor: "Prof. António Silva", room: "Sala 101", discipline: "Matemática II", color: "hsl(224, 64%, 33%)" },
  { id: "e7", title: "Física Aplicada", type: "aula", date: "2024-02-14", startTime: "10:00", endTime: "11:30", duration: "1h 30min", professor: "Prof. Ricardo Santos", room: "Lab. 3", discipline: "Física Aplicada", color: "hsl(25, 95%, 53%)" },
  { id: "e8", title: "Programação II", type: "aula", date: "2024-02-14", startTime: "14:00", endTime: "15:30", duration: "1h 30min", professor: "Prof. Carlos Ferreira", room: "Info. 2", discipline: "Programação II", color: "hsl(175, 84%, 32%)" },
  { id: "e9", title: "Matemática II", type: "aula", date: "2024-02-15", startTime: "08:00", endTime: "09:30", duration: "1h 30min", professor: "Prof. António Silva", room: "Sala 101", discipline: "Matemática II", color: "hsl(224, 64%, 33%)" },
  { id: "e10", title: "Química Geral", type: "aula", date: "2024-02-15", startTime: "10:00", endTime: "11:30", duration: "1h 30min", professor: "Prof. Maria Costa", room: "Lab. 5", discipline: "Química Geral", color: "hsl(280, 60%, 45%)" },
  { id: "e11", title: "Inglês Técnico", type: "aula", date: "2024-02-15", startTime: "14:00", endTime: "15:30", duration: "1h 30min", professor: "Prof. Ana Lopes", room: "Sala 205", discipline: "Inglês Técnico", color: "hsl(340, 65%, 47%)" },
  { id: "e12", title: "Programação II", type: "aula", date: "2024-02-16", startTime: "14:00", endTime: "15:30", duration: "1h 30min", professor: "Prof. Carlos Ferreira", room: "Info. 2", discipline: "Programação II", color: "hsl(175, 84%, 32%)" },
  { id: "e13", title: "Teste 2 Matemática II", type: "teste", date: "2024-03-25", startTime: "08:00", endTime: "10:00", duration: "2h", discipline: "Matemática II", color: "hsl(0, 84%, 60%)" },
  { id: "e14", title: "Entrega Trabalho Programação", type: "entrega", date: "2024-04-15", startTime: "23:59", endTime: "23:59", discipline: "Programação II", color: "hsl(38, 92%, 50%)" },
  { id: "e15", title: "Exame Final Física", type: "exame", date: "2024-05-20", startTime: "09:00", endTime: "12:00", duration: "3h", discipline: "Física Aplicada", color: "hsl(0, 84%, 60%)" },
  // Tasks and evaluations within the current week
  { id: "e16", title: "Entrega: Exercícios Séries Geométricas", type: "entrega", date: "2024-02-14", startTime: "23:59", endTime: "23:59", discipline: "Matemática II", color: "hsl(38, 92%, 50%)" },
  { id: "e17", title: "Entrega: Relatório Laboratório Pressão", type: "entrega", date: "2024-02-14", startTime: "23:59", endTime: "23:59", discipline: "Física Aplicada", color: "hsl(38, 92%, 50%)" },
  { id: "e18", title: "Apresentação Oral — Inglês Técnico", type: "teste", date: "2024-02-14", startTime: "14:00", endTime: "14:15", duration: "15min", room: "Sala 205", discipline: "Inglês Técnico", color: "hsl(0, 84%, 60%)" },
  ...coordAgendaEvents,
];

// Storage files
export const storageFiles: StorageFile[] = [
  { id: "f1", name: "Relatório_Projecto.docx", type: "document", size: "2.4 MB", date: "12/03/2024" },
  { id: "f2", name: "Análise_Dados.xlsx", type: "spreadsheet", size: "1.8 MB", date: "10/03/2024" },
  { id: "f3", name: "Apresentação_Final.pptx", type: "presentation", size: "5.2 MB", date: "08/03/2024" },
  { id: "f4", name: "Trabalhos", type: "folder", date: "05/03/2024" },
  { id: "f5", name: "Notas_Aula_Mat.pdf", type: "pdf", size: "890 KB", date: "01/03/2024" },
  { id: "f6", name: "Screenshot_Lab.png", type: "image", size: "1.2 MB", date: "28/02/2024" },
  { id: "f7", name: "Projecto_Final", type: "folder", date: "25/02/2024" },
  { id: "f8", name: "Notas_Pessoais", type: "folder", date: "20/02/2024" },
  { id: "f9", name: "Slides_Seminario.pptx", type: "presentation", size: "3.1 MB", date: "15/02/2024", shared: true, sharedBy: "Prof. António Silva" },
  { id: "f10", name: "Dados_Grupo.xlsx", type: "spreadsheet", size: "2.0 MB", date: "14/02/2024", shared: true, sharedBy: "Maria Silva" },
  { id: "f11", name: "Template_Relatório.docx", type: "document", size: "450 KB", date: "10/02/2024", shared: true, sharedBy: "Prof. Maria Santos" },
  { id: "f12", name: "Rascunho_Antigo.docx", type: "document", size: "1.1 MB", date: "01/01/2024", deleted: true },
  { id: "f13", name: "Dados_Errados.xlsx", type: "spreadsheet", size: "500 KB", date: "05/01/2024", deleted: true },
];

// Email messages
export const emailMessages: EmailMessage[] = [
  { id: "em1", from: "Prof. António Silva", fromEmail: "prof.silva@upra.kor", to: "2934@upra.kor", subject: "Alteração de horário - Matemática II", preview: "Informo que a aula de sexta-feira será no Auditório devido a obras de manutenção. O horário mantém-se.", body: "Caro João,\n\nInformo que a aula de sexta-feira, dia 23/02, será excepcionalmente no Auditório em vez da Sala 101, devido a obras de manutenção.\n\nO horário mantém-se: 08:00 - 09:30.\n\nCumprimentos,\nProf. António Silva", date: "15/02/2024", time: "09:15", read: false, starred: true, folder: "inbox" },
  { id: "em2", from: "Serviços Académicos", fromEmail: "academico@upra.kor", to: "2934@upra.kor", subject: "Confirmação de inscrição em disciplinas", preview: "A sua inscrição nas disciplinas do 2º semestre foi confirmada com sucesso.", body: "Exmo. Estudante,\n\nA sua inscrição nas disciplinas do 2º semestre de 2023/2024 foi confirmada com sucesso.\n\nDisciplinas inscritas:\n- Matemática II (MAT201)\n- Física Aplicada (FIS202)\n- Programação II (INF203)\n- Química Geral (QUI201)\n- Inglês Técnico (ING201)\n\nCumprimentos,\nServiços Académicos", date: "12/02/2024", time: "14:30", read: true, starred: false, folder: "inbox" },
  { id: "em3", from: "Gabinete de Estágios", fromEmail: "estagios@upra.kor", to: "2934@upra.kor", subject: "Oportunidades de Estágio - Semestre de Verão", preview: "Novas vagas de estágio disponíveis para o semestre de Verão em empresas parceiras.", body: "Caro(a) Estudante,\n\nInformamos que estão disponíveis novas vagas de estágio para o semestre de Verão nas seguintes empresas:\n\n1. TechAngola - Desenvolvimento Web\n2. AngoTelecom - Redes e Segurança\n3. PetroData - Análise de Dados\n\nPrazo de candidatura: 28/02/2024\n\nPara mais informações, consulte o portal de estágios.\n\nGabinete de Estágios", date: "10/02/2024", time: "11:00", read: true, starred: true, folder: "inbox" },
  { id: "em4", from: "Prof. Pedro Ferreira", fromEmail: "prof.ferreira@upra.kor", to: "2934@upra.kor", subject: "Re: Dúvida sobre o projecto", preview: "Sim, podes usar qualquer IDE. Recomendo IntelliJ ou VS Code.", body: "Olá João,\n\nSobre a tua dúvida: sim, podes usar qualquer IDE para o projecto. Recomendo o IntelliJ IDEA ou VS Code com extensões Java.\n\nQuanto à estrutura, segue o padrão MVC que discutimos em aula.\n\nQualquer dúvida adicional, estou disponível no horário de atendimento.\n\nCumprimentos,\nProf. Pedro Ferreira", date: "08/02/2024", time: "16:45", read: true, starred: false, folder: "inbox" },
  { id: "em5", from: "João Fernandes", fromEmail: "2934@upra.kor", to: "prof.ferreira@upra.kor", subject: "Dúvida sobre o projecto", preview: "Tenho uma dúvida sobre o projecto de Programação II.", body: "Professor,\n\nTenho uma dúvida sobre o projecto de Programação II. Posso usar qualquer IDE ou tem que ser o Eclipse?\n\nTambém gostaria de saber se há alguma estrutura específica recomendada para o código.\n\nObrigado,\nJoão Fernandes", date: "08/02/2024", time: "10:20", read: true, starred: false, folder: "sent" },
  { id: "em6", from: "Biblioteca", fromEmail: "biblioteca@upra.kor", to: "2934@upra.kor", subject: "Lembrete: Devolução de livro", preview: "O livro 'Cálculo Vol. 2' deve ser devolvido até 20/02.", body: "Exmo. Estudante,\n\nRecordamos que o livro 'Cálculo Vol. 2 - James Stewart' que requisitou deve ser devolvido até 20/02/2024.\n\nCaso necessite de uma extensão do empréstimo, pode solicitá-la no balcão da biblioteca ou online.\n\nBiblioteca Central", date: "06/02/2024", time: "08:00", read: true, starred: false, folder: "inbox", attachments: [{ name: "Recibo_Emprestimo.pdf", size: "120 KB" }] },
];

// Helper function
export function detectRole(email: string): UserRole {
  if (email.startsWith("admin")) return "admin";
  if (email.startsWith("inscricoes")) return "inscricoes";
  if (email.startsWith("gap")) return "gap";
  if (email.startsWith("financas")) return "financas";
  if (email.startsWith("areaacademica2")) return "academica2";
  if (email.startsWith("academica")) return "secretaria";
  if (email.startsWith("reitor")) return "reitor";
  if (email.startsWith("decano")) return "decano";
  if (email.startsWith("coordcurso")) return "coordenador_curso";
  if (email.startsWith("prof.")) return "professor";
  return "student";
}
