// ============================================
// Professor Mock Data
// ============================================

export interface ProfDiscipline {
  id: string;
  name: string;
  code: string;
  color: string;
  turmas: ProfTurma[];
  schedule: string;
  room: string;
  summary: string;
  totalStudents: number;
  totalLessons: number;
  publishedLessons: number;
  totalMaterials: number;
}

export interface ProfTurma {
  id: string;
  name: string;
  year: number;
  course: string;
  students: number;
}

export interface ProfStudent {
  id: string;
  name: string;
  email: string;
  turma: string;
  turmaId: string;
  disciplineId: string;
  attendance: number;
  avgGrade: number | null;
  submittedTasks: number;
  totalTasks: number;
  lastActive: string;
  status: "normal" | "risco" | "excelente";
}

export interface ProfLesson {
  id: string;
  disciplineId: string;
  turmaId: string;
  number: number;
  title: string;
  date: string;
  duration: string;
  status: "rascunho" | "agendada" | "publicada";
  publishDate?: string;
  views: number;
  summary: string;
  materials: { name: string; type: string; size: string }[];
  attendance: number;
  totalStudents: number;
}

export interface ProfTask {
  id: string;
  disciplineId: string;
  turmaId?: string;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  type: "tarefa" | "quiz" | "exame";
  status: "rascunho" | "publicada" | "encerrada";
  submissions: number;
  totalStudents: number;
  corrected: number;
  correctionDeadline?: string;
  avgGrade: number | null;
  weight: number;
  modality: "online" | "presencial";
}

export interface ProfAnnouncement {
  id: string;
  disciplineId: string;
  title: string;
  content: string;
  date: string;
  status: "rascunho" | "publicado";
}

export interface ProfGradeCriteria {
  disciplineId: string;
  criteria: { label: string; minGrade: number; color: string }[];
}

// ── Turmas ──
const turmas: ProfTurma[] = [
  { id: "t1", name: "2º Ano Informática", year: 2, course: "Eng. Informática", students: 45 },
  { id: "t2", name: "1º Ano Informática", year: 1, course: "Eng. Informática", students: 52 },
  { id: "t3", name: "2º Ano Eng. Civil", year: 2, course: "Eng. Civil", students: 30 },
  { id: "t4", name: "3º Ano Informática", year: 3, course: "Eng. Informática", students: 38 },
];

export const allTurmas = [...turmas].sort((a, b) => a.year - b.year);

// ── Disciplinas do Professor ──
export const profDisciplines: ProfDiscipline[] = [
  {
    id: "pd1",
    name: "Matemática II",
    code: "MAT201",
    color: "hsl(224, 64%, 33%)",
    turmas: [turmas[0], turmas[2]],
    schedule: "Seg/Qua/Sex 08:00-09:30",
    room: "Sala 101",
    summary: "Cálculo integral, séries numéricas, equações diferenciais ordinárias e transformadas de Laplace.",
    totalStudents: 75,
    totalLessons: 18,
    publishedLessons: 12,
    totalMaterials: 24,
  },
  {
    id: "pd2",
    name: "Matemática I",
    code: "MAT101",
    color: "hsl(175, 84%, 32%)",
    turmas: [turmas[1]],
    schedule: "Ter/Qui 10:00-11:30",
    room: "Sala 203",
    summary: "Cálculo diferencial, limites, derivadas e aplicações. Introdução ao cálculo integral.",
    totalStudents: 52,
    totalLessons: 16,
    publishedLessons: 14,
    totalMaterials: 18,
  },
  {
    id: "pd3",
    name: "Estatística",
    code: "EST301",
    color: "hsl(25, 95%, 53%)",
    turmas: [turmas[0]],
    schedule: "Qua/Sex 14:00-15:30",
    room: "Sala 105",
    summary: "Probabilidades, distribuições estatísticas, inferência estatística e regressão linear.",
    totalStudents: 45,
    totalLessons: 14,
    publishedLessons: 8,
    totalMaterials: 14,
  },
  {
    id: "pd4",
    name: "Álgebra Linear",
    code: "ALG301",
    color: "hsl(280, 60%, 45%)",
    turmas: [turmas[3]],
    schedule: "Seg/Qua 16:00-17:30",
    room: "Sala 301",
    summary: "Matrizes, determinantes, espaços vectoriais, transformações lineares e valores próprios.",
    totalStudents: 38,
    totalLessons: 16,
    publishedLessons: 10,
    totalMaterials: 16,
  },
  {
    id: "pd5",
    name: "Física I",
    code: "FIS101",
    color: "hsl(340, 65%, 47%)",
    turmas: [turmas[0], turmas[1]],
    schedule: "Ter/Qui 14:00-15:30",
    room: "Sala 108",
    summary: "Mecânica clássica, cinemática, dinâmica e leis de Newton.",
    totalStudents: 97,
    totalLessons: 16,
    publishedLessons: 11,
    totalMaterials: 20,
  },
  {
    id: "pd6",
    name: "Programação I",
    code: "PRG101",
    color: "hsl(200, 70%, 40%)",
    turmas: [turmas[1]],
    schedule: "Seg/Qua 14:00-15:30",
    room: "Lab 201",
    summary: "Fundamentos de programação, algoritmos e estruturas de dados básicas.",
    totalStudents: 52,
    totalLessons: 18,
    publishedLessons: 15,
    totalMaterials: 22,
  },
  {
    id: "pd7",
    name: "Programação II",
    code: "PRG201",
    color: "hsl(160, 55%, 38%)",
    turmas: [turmas[0]],
    schedule: "Ter/Qui 08:00-09:30",
    room: "Lab 202",
    summary: "Programação orientada a objetos, padrões de design e estruturas avançadas.",
    totalStudents: 45,
    totalLessons: 16,
    publishedLessons: 10,
    totalMaterials: 18,
  },
  {
    id: "pd8",
    name: "Redes de Computadores",
    code: "RED301",
    color: "hsl(45, 80%, 42%)",
    turmas: [turmas[3]],
    schedule: "Ter/Qui 10:00-11:30",
    room: "Lab 301",
    summary: "Protocolos de rede, modelo OSI, TCP/IP e segurança de redes.",
    totalStudents: 38,
    totalLessons: 14,
    publishedLessons: 9,
    totalMaterials: 15,
  },
  {
    id: "pd9",
    name: "Sistemas Operativos",
    code: "SOP301",
    color: "hsl(10, 70%, 45%)",
    turmas: [turmas[3]],
    schedule: "Qua/Sex 08:00-09:30",
    room: "Lab 302",
    summary: "Gestão de processos, memória, sistemas de ficheiros e concorrência.",
    totalStudents: 38,
    totalLessons: 16,
    publishedLessons: 12,
    totalMaterials: 17,
  },
  {
    id: "pd10",
    name: "Mecânica dos Materiais",
    code: "MEC201",
    color: "hsl(90, 50%, 35%)",
    turmas: [turmas[2]],
    schedule: "Seg/Qua 10:00-11:30",
    room: "Sala 110",
    summary: "Resistência dos materiais, tensões, deformações e dimensionamento estrutural.",
    totalStudents: 30,
    totalLessons: 14,
    publishedLessons: 8,
    totalMaterials: 12,
  },
  {
    id: "pd11",
    name: "Desenho Técnico",
    code: "DES201",
    color: "hsl(260, 50%, 50%)",
    turmas: [turmas[2]],
    schedule: "Ter/Qui 14:00-15:30",
    room: "Sala 112",
    summary: "Projecções ortogonais, cortes, secções e desenho assistido por computador.",
    totalStudents: 30,
    totalLessons: 12,
    publishedLessons: 7,
    totalMaterials: 10,
  },
  {
    id: "pd12",
    name: "Geotecnia",
    code: "GEO201",
    color: "hsl(30, 60%, 40%)",
    turmas: [turmas[2]],
    schedule: "Qua/Sex 10:00-11:30",
    room: "Sala 115",
    summary: "Mecânica dos solos, classificação de solos e fundações.",
    totalStudents: 30,
    totalLessons: 14,
    publishedLessons: 6,
    totalMaterials: 11,
  },
  {
    id: "pd13",
    name: "Hidráulica",
    code: "HID201",
    color: "hsl(195, 65%, 40%)",
    turmas: [turmas[2]],
    schedule: "Seg 14:00-15:30",
    room: "Sala 118",
    summary: "Mecânica dos fluidos, escoamentos e dimensionamento hidráulico.",
    totalStudents: 30,
    totalLessons: 10,
    publishedLessons: 5,
    totalMaterials: 9,
  },
];

// ── Aulas ──
export const profLessons: ProfLesson[] = [
  // Matemática II - t1
  { id: "pl1", disciplineId: "pd1", turmaId: "t1", number: 1, title: "Introdução ao Cálculo Integral", date: "05/02/2024", duration: "1h 20min", status: "publicada", views: 42, summary: "Conceitos fundamentais de integral definido e indefinido.", materials: [{ name: "Slides Aula 1", type: "pdf", size: "2.4 MB" }, { name: "Exercícios", type: "pdf", size: "450 KB" }], attendance: 43, totalStudents: 45 },
  { id: "pl2", disciplineId: "pd1", turmaId: "t1", number: 2, title: "Técnicas de Integração", date: "08/02/2024", duration: "1h 15min", status: "publicada", views: 38, summary: "Integração por partes, substituição trigonométrica.", materials: [{ name: "Slides Aula 2", type: "pdf", size: "1.8 MB" }], attendance: 41, totalStudents: 45 },
  { id: "pl3", disciplineId: "pd1", turmaId: "t1", number: 3, title: "Integrais Impróprios", date: "12/02/2024", duration: "1h 25min", status: "publicada", views: 35, summary: "Integrais com limites infinitos e funções descontínuas.", materials: [{ name: "Slides Aula 3", type: "pdf", size: "2.1 MB" }, { name: "Lista de Exercícios", type: "pdf", size: "380 KB" }], attendance: 40, totalStudents: 45 },
  { id: "pl4", disciplineId: "pd1", turmaId: "t1", number: 4, title: "Séries Numéricas I", date: "15/02/2024", duration: "1h 30min", status: "publicada", views: 30, summary: "Séries geométricas e telescópicas.", materials: [{ name: "Slides Séries I", type: "pdf", size: "1.9 MB" }], attendance: 38, totalStudents: 45 },
  { id: "pl5", disciplineId: "pd1", turmaId: "t1", number: 5, title: "Séries Numéricas II", date: "19/02/2024", duration: "1h 20min", status: "publicada", views: 25, summary: "Critérios de convergência: comparação, razão, raiz.", materials: [{ name: "Resumo Séries", type: "pdf", size: "1.2 MB" }], attendance: 36, totalStudents: 45 },
  { id: "pl6", disciplineId: "pd1", turmaId: "t1", number: 6, title: "Séries de Potências", date: "22/02/2024", duration: "1h 30min", status: "agendada", publishDate: "22/02/2024", views: 0, summary: "Raio de convergência e séries de Taylor.", materials: [], attendance: 0, totalStudents: 45 },
  { id: "pl7", disciplineId: "pd1", turmaId: "t1", number: 7, title: "Equações Diferenciais I", date: "26/02/2024", duration: "1h 30min", status: "rascunho", views: 0, summary: "Introdução às EDOs de 1ª ordem.", materials: [], attendance: 0, totalStudents: 45 },

  // Matemática II - t3 (Eng. Civil)
  { id: "pl13", disciplineId: "pd1", turmaId: "t3", number: 1, title: "Introdução ao Cálculo Integral", date: "06/02/2024", duration: "1h 20min", status: "publicada", views: 28, summary: "Conceitos fundamentais de integral definido e indefinido.", materials: [{ name: "Slides Aula 1", type: "pdf", size: "2.4 MB" }], attendance: 28, totalStudents: 30 },
  { id: "pl14", disciplineId: "pd1", turmaId: "t3", number: 2, title: "Técnicas de Integração", date: "09/02/2024", duration: "1h 15min", status: "publicada", views: 24, summary: "Integração por partes, substituição trigonométrica.", materials: [{ name: "Slides Aula 2", type: "pdf", size: "1.8 MB" }], attendance: 26, totalStudents: 30 },

  // Matemática I - t2
  { id: "pl8", disciplineId: "pd2", turmaId: "t2", number: 1, title: "Limites e Continuidade", date: "06/02/2024", duration: "1h 30min", status: "publicada", views: 50, summary: "Definição de limite, propriedades e limites notáveis.", materials: [{ name: "Slides Limites", type: "pdf", size: "2.8 MB" }, { name: "Exercícios Resolvidos", type: "pdf", size: "1.1 MB" }], attendance: 50, totalStudents: 52 },
  { id: "pl9", disciplineId: "pd2", turmaId: "t2", number: 2, title: "Derivadas I", date: "08/02/2024", duration: "1h 25min", status: "publicada", views: 48, summary: "Definição de derivada, regras de derivação.", materials: [{ name: "Slides Derivadas", type: "pdf", size: "2.2 MB" }], attendance: 49, totalStudents: 52 },
  { id: "pl10", disciplineId: "pd2", turmaId: "t2", number: 3, title: "Derivadas II", date: "13/02/2024", duration: "1h 30min", status: "publicada", views: 45, summary: "Derivadas de funções compostas, implícitas e paramétricas.", materials: [{ name: "Slides Derivadas II", type: "pdf", size: "1.9 MB" }, { name: "Tabela de Derivadas", type: "pdf", size: "200 KB" }], attendance: 48, totalStudents: 52 },

  // Estatística - t1
  { id: "pl11", disciplineId: "pd3", turmaId: "t1", number: 1, title: "Introdução à Probabilidade", date: "07/02/2024", duration: "1h 30min", status: "publicada", views: 40, summary: "Espaço amostral, eventos e probabilidade condicional.", materials: [{ name: "Slides Probabilidade", type: "pdf", size: "2.5 MB" }, { name: "Exercícios", type: "pdf", size: "600 KB" }], attendance: 42, totalStudents: 45 },
  { id: "pl12", disciplineId: "pd3", turmaId: "t1", number: 2, title: "Variáveis Aleatórias", date: "14/02/2024", duration: "1h 25min", status: "publicada", views: 36, summary: "Distribuições discretas e contínuas.", materials: [{ name: "Slides VA", type: "pdf", size: "2.0 MB" }], attendance: 40, totalStudents: 45 },

  // Álgebra Linear - t4
  { id: "pl15", disciplineId: "pd4", turmaId: "t4", number: 1, title: "Introdução às Matrizes", date: "05/02/2024", duration: "1h 30min", status: "publicada", views: 35, summary: "Tipos de matrizes, operações fundamentais.", materials: [{ name: "Slides Matrizes", type: "pdf", size: "2.3 MB" }], attendance: 36, totalStudents: 38 },
  { id: "pl16", disciplineId: "pd4", turmaId: "t4", number: 2, title: "Determinantes", date: "07/02/2024", duration: "1h 25min", status: "publicada", views: 32, summary: "Cálculo de determinantes, regra de Sarrus e cofactores.", materials: [{ name: "Slides Determinantes", type: "pdf", size: "1.9 MB" }, { name: "Exercícios", type: "pdf", size: "500 KB" }], attendance: 34, totalStudents: 38 },
  { id: "pl17", disciplineId: "pd4", turmaId: "t4", number: 3, title: "Sistemas de Equações Lineares", date: "12/02/2024", duration: "1h 30min", status: "publicada", views: 28, summary: "Método de Gauss e Gauss-Jordan.", materials: [{ name: "Slides SEL", type: "pdf", size: "2.0 MB" }], attendance: 33, totalStudents: 38 },
];

// ── Estudantes ──
export const profStudents: ProfStudent[] = [
  // Matemática II - t1 (2º Ano Informática)
  { id: "ps1", name: "João Miguel Fernandes", email: "2934@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 87, avgGrade: 15.2, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps2", name: "Maria Silva", email: "3012@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 92, avgGrade: 16.5, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps3", name: "Pedro Nascimento", email: "2987@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 78, avgGrade: 12.0, submittedTasks: 3, totalTasks: 4, lastActive: "Ontem", status: "normal" },
  { id: "ps4", name: "Ana Luísa Gomes", email: "3045@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 65, avgGrade: 9.5, submittedTasks: 2, totalTasks: 4, lastActive: "3 dias", status: "risco" },
  { id: "ps5", name: "Carlos Santos", email: "3021@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 82, avgGrade: 14.0, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "normal" },
  { id: "ps6", name: "Rita Oliveira", email: "3033@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 95, avgGrade: 17.8, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps7", name: "Bruno Mendes", email: "3044@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 55, avgGrade: 8.0, submittedTasks: 1, totalTasks: 4, lastActive: "1 semana", status: "risco" },
  { id: "ps8", name: "Catarina Reis", email: "3055@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 88, avgGrade: 13.5, submittedTasks: 3, totalTasks: 4, lastActive: "Ontem", status: "normal" },
  { id: "ps9", name: "Diogo Pereira", email: "3066@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 72, avgGrade: 10.2, submittedTasks: 2, totalTasks: 4, lastActive: "2 dias", status: "risco" },
  { id: "ps10", name: "Sofia Martins", email: "3077@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 90, avgGrade: 15.0, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps11", name: "Tiago Costa", email: "3088@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 80, avgGrade: 11.5, submittedTasks: 3, totalTasks: 4, lastActive: "Ontem", status: "normal" },
  { id: "ps12", name: "Inês Rodrigues", email: "3099@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd1", attendance: 93, avgGrade: 16.0, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },

  // Matemática II - t3 (2º Ano Eng. Civil)
  { id: "ps20", name: "André Lopes", email: "4001@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 78, avgGrade: 13.0, submittedTasks: 3, totalTasks: 4, lastActive: "Hoje", status: "normal" },
  { id: "ps21", name: "Luísa Fernandes", email: "4002@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 91, avgGrade: 15.5, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps22", name: "Rui Baptista", email: "4003@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 55, avgGrade: 7.5, submittedTasks: 1, totalTasks: 4, lastActive: "5 dias", status: "risco" },
  { id: "ps23", name: "Helena Costa", email: "4004@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 82, avgGrade: 14.2, submittedTasks: 4, totalTasks: 4, lastActive: "Ontem", status: "normal" },
  { id: "ps24", name: "Marcos Almeida", email: "4005@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 62, avgGrade: 9.0, submittedTasks: 2, totalTasks: 4, lastActive: "3 dias", status: "risco" },
  { id: "ps25", name: "Patrícia Sousa", email: "4006@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 94, avgGrade: 17.0, submittedTasks: 4, totalTasks: 4, lastActive: "Hoje", status: "excelente" },
  { id: "ps26", name: "Fábio Nunes", email: "4007@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 70, avgGrade: 11.8, submittedTasks: 3, totalTasks: 4, lastActive: "Ontem", status: "normal" },
  { id: "ps27", name: "Sara Vieira", email: "4008@upra.kor", turma: "2º Ano Eng. Civil", turmaId: "t3", disciplineId: "pd1", attendance: 72, avgGrade: 10.5, submittedTasks: 3, totalTasks: 4, lastActive: "Ontem", status: "normal" },

  // Matemática I - t2 (1º Ano Informática)
  { id: "ps30", name: "Beatriz Monteiro", email: "5001@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 96, avgGrade: 18.0, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "excelente" },
  { id: "ps31", name: "Miguel Araújo", email: "5002@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 88, avgGrade: 14.5, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "normal" },
  { id: "ps32", name: "Clara Duarte", email: "5003@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 75, avgGrade: 10.0, submittedTasks: 2, totalTasks: 3, lastActive: "2 dias", status: "normal" },
  { id: "ps33", name: "Gonçalo Ribeiro", email: "5004@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 58, avgGrade: 8.5, submittedTasks: 1, totalTasks: 3, lastActive: "4 dias", status: "risco" },
  { id: "ps34", name: "Leonor Pinto", email: "5005@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 92, avgGrade: 16.2, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "excelente" },
  { id: "ps35", name: "Rafael Cardoso", email: "5006@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 80, avgGrade: 12.8, submittedTasks: 3, totalTasks: 3, lastActive: "Ontem", status: "normal" },
  { id: "ps36", name: "Mariana Tavares", email: "5007@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 50, avgGrade: 6.5, submittedTasks: 1, totalTasks: 3, lastActive: "1 semana", status: "risco" },
  { id: "ps37", name: "Tomás Ferreira", email: "5008@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 85, avgGrade: 13.0, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "normal" },
  { id: "ps38", name: "Eva Correia", email: "5009@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 90, avgGrade: 15.8, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "excelente" },
  { id: "ps39", name: "Henrique Moreira", email: "5010@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 68, avgGrade: 9.2, submittedTasks: 2, totalTasks: 3, lastActive: "3 dias", status: "risco" },
  { id: "ps40", name: "Diana Carvalho", email: "5011@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 87, avgGrade: 14.0, submittedTasks: 3, totalTasks: 3, lastActive: "Ontem", status: "normal" },
  { id: "ps41", name: "Alexandre Neves", email: "5012@upra.kor", turma: "1º Ano Informática", turmaId: "t2", disciplineId: "pd2", attendance: 93, avgGrade: 17.2, submittedTasks: 3, totalTasks: 3, lastActive: "Hoje", status: "excelente" },

  // Estatística - t1 (2º Ano Informática - same turma)
  { id: "ps50", name: "João Miguel Fernandes", email: "2934@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 90, avgGrade: 14.8, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "excelente" },
  { id: "ps51", name: "Maria Silva", email: "3012@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 88, avgGrade: 15.0, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "excelente" },
  { id: "ps52", name: "Pedro Nascimento", email: "2987@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 75, avgGrade: 11.0, submittedTasks: 2, totalTasks: 2, lastActive: "Ontem", status: "normal" },
  { id: "ps53", name: "Ana Luísa Gomes", email: "3045@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 60, avgGrade: 8.5, submittedTasks: 1, totalTasks: 2, lastActive: "3 dias", status: "risco" },
  { id: "ps54", name: "Carlos Santos", email: "3021@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 85, avgGrade: 13.5, submittedTasks: 2, totalTasks: 2, lastActive: "Ontem", status: "normal" },
  { id: "ps55", name: "Rita Oliveira", email: "3033@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 92, avgGrade: 16.5, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "excelente" },
  { id: "ps56", name: "Bruno Mendes", email: "3044@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 52, avgGrade: 7.0, submittedTasks: 0, totalTasks: 2, lastActive: "1 semana", status: "risco" },
  { id: "ps57", name: "Sofia Martins", email: "3077@upra.kor", turma: "2º Ano Informática", turmaId: "t1", disciplineId: "pd3", attendance: 88, avgGrade: 14.2, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "normal" },

  // Álgebra Linear - t4 (3º Ano Informática)
  { id: "ps60", name: "Vítor Almeida", email: "6001@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 91, avgGrade: 16.0, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "excelente" },
  { id: "ps61", name: "Filipa Rocha", email: "6002@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 85, avgGrade: 13.5, submittedTasks: 2, totalTasks: 2, lastActive: "Ontem", status: "normal" },
  { id: "ps62", name: "Nuno Dias", email: "6003@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 72, avgGrade: 10.5, submittedTasks: 2, totalTasks: 2, lastActive: "2 dias", status: "normal" },
  { id: "ps63", name: "Joana Baptista", email: "6004@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 58, avgGrade: 7.8, submittedTasks: 1, totalTasks: 2, lastActive: "5 dias", status: "risco" },
  { id: "ps64", name: "Ricardo Fonseca", email: "6005@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 94, avgGrade: 17.5, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "excelente" },
  { id: "ps65", name: "Marta Lourenço", email: "6006@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 80, avgGrade: 12.0, submittedTasks: 2, totalTasks: 2, lastActive: "Ontem", status: "normal" },
  { id: "ps66", name: "André Sousa", email: "6007@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 65, avgGrade: 8.5, submittedTasks: 1, totalTasks: 2, lastActive: "4 dias", status: "risco" },
  { id: "ps67", name: "Carolina Pires", email: "6008@upra.kor", turma: "3º Ano Informática", turmaId: "t4", disciplineId: "pd4", attendance: 88, avgGrade: 14.8, submittedTasks: 2, totalTasks: 2, lastActive: "Hoje", status: "normal" },
];

// ── Tarefas / Avaliações ──
export const profTasks: ProfTask[] = [
  // Matemática II - t1
  { id: "pt1", disciplineId: "pd1", turmaId: "t1", title: "Exercícios Integrais Indefinidos", description: "Resolver exercícios 1-10 do capítulo 3.", dueDate: "08/02/2024", assignedDate: "05/02/2024", type: "tarefa", status: "encerrada", submissions: 42, totalStudents: 45, corrected: 42, avgGrade: 14.5, weight: 15, modality: "presencial" },
  { id: "pt2", disciplineId: "pd1", turmaId: "t1", title: "Integração por Partes", description: "Resolver 5 integrais usando integração por partes.", dueDate: "12/02/2024", assignedDate: "08/02/2024", type: "tarefa", status: "encerrada", submissions: 40, totalStudents: 45, corrected: 40, avgGrade: 13.8, weight: 15, modality: "presencial" },
  { id: "pt3", disciplineId: "pd1", turmaId: "t1", title: "Teste 1 - Cálculo Integral", description: "Teste sobre integrais definidos e indefinidos.", dueDate: "15/02/2024", assignedDate: "05/02/2024", type: "exame", status: "encerrada", submissions: 44, totalStudents: 45, corrected: 44, avgGrade: 12.5, weight: 25, modality: "presencial" },
  { id: "pt4", disciplineId: "pd1", turmaId: "t1", title: "Séries Geométricas", description: "Determinar convergência de 8 séries.", dueDate: "19/02/2024", assignedDate: "15/02/2024", type: "tarefa", status: "publicada", submissions: 28, totalStudents: 45, corrected: 12, correctionDeadline: "22/02/2024", avgGrade: null, weight: 20, modality: "presencial" },
  { id: "pt5", disciplineId: "pd1", turmaId: "t1", title: "Quiz - Critérios de Convergência", description: "Quiz de 20 minutos.", dueDate: "23/02/2024", assignedDate: "19/02/2024", type: "quiz", status: "publicada", submissions: 15, totalStudents: 45, corrected: 5, correctionDeadline: "26/02/2024", avgGrade: null, weight: 10, modality: "presencial" },

  // Matemática II - t3
  { id: "pt9", disciplineId: "pd1", turmaId: "t3", title: "Exercícios Integrais Indefinidos", description: "Resolver exercícios 1-10 do capítulo 3.", dueDate: "09/02/2024", assignedDate: "06/02/2024", type: "tarefa", status: "encerrada", submissions: 27, totalStudents: 30, corrected: 27, avgGrade: 12.0, weight: 15, modality: "presencial" },
  { id: "pt10", disciplineId: "pd1", turmaId: "t3", title: "Integração por Partes", description: "Resolver 5 integrais usando integração por partes.", dueDate: "13/02/2024", assignedDate: "09/02/2024", type: "tarefa", status: "publicada", submissions: 18, totalStudents: 30, corrected: 8, correctionDeadline: "16/02/2024", avgGrade: null, weight: 15, modality: "presencial" },

  // Matemática I - t2
  { id: "pt6", disciplineId: "pd2", turmaId: "t2", title: "Exercícios de Limites", description: "Calcular limites de 15 funções.", dueDate: "10/02/2024", assignedDate: "06/02/2024", type: "tarefa", status: "encerrada", submissions: 50, totalStudents: 52, corrected: 50, avgGrade: 13.2, weight: 15, modality: "presencial" },
  { id: "pt7", disciplineId: "pd2", turmaId: "t2", title: "Teste 1 - Limites e Derivadas", description: "Teste presencial.", dueDate: "20/02/2024", assignedDate: "06/02/2024", type: "exame", status: "publicada", submissions: 0, totalStudents: 52, corrected: 0, correctionDeadline: "25/02/2024", avgGrade: null, weight: 30, modality: "presencial" },

  // Estatística - t1
  { id: "pt8", disciplineId: "pd3", turmaId: "t1", title: "Exercícios de Probabilidade", description: "Resolver problemas de probabilidade condicional.", dueDate: "14/02/2024", assignedDate: "07/02/2024", type: "tarefa", status: "encerrada", submissions: 41, totalStudents: 45, corrected: 41, avgGrade: 14.0, weight: 15, modality: "presencial" },

  // Álgebra Linear - t4
  { id: "pt11", disciplineId: "pd4", turmaId: "t4", title: "Exercícios de Matrizes", description: "Resolver operações com matrizes 3x3.", dueDate: "10/02/2024", assignedDate: "05/02/2024", type: "tarefa", status: "encerrada", submissions: 35, totalStudents: 38, corrected: 35, avgGrade: 13.5, weight: 15, modality: "presencial" },
  { id: "pt12", disciplineId: "pd4", turmaId: "t4", title: "Teste 1 - Determinantes", description: "Teste sobre cálculo de determinantes.", dueDate: "18/02/2024", assignedDate: "08/02/2024", type: "exame", status: "publicada", submissions: 10, totalStudents: 38, corrected: 3, correctionDeadline: "22/02/2024", avgGrade: null, weight: 25, modality: "presencial" },
];

// ── Anúncios do Professor ──
export const profAnnouncements: ProfAnnouncement[] = [
  { id: "pa1", disciplineId: "pd1", title: "Alteração de Sala - 22/02", content: "A aula de 22 de Fevereiro será na Sala 203 em vez da Sala 101.", date: "18/02/2024", status: "publicado" },
  { id: "pa2", disciplineId: "pd1", title: "Material Extra - Séries", content: "Foram adicionados exercícios adicionais sobre séries numéricas na plataforma.", date: "16/02/2024", status: "publicado" },
  { id: "pa3", disciplineId: "pd2", title: "Teste 1 - Informações", content: "O teste será no dia 20/02 às 10:00. Duração: 1h30. Matéria: Limites e Derivadas.", date: "15/02/2024", status: "publicado" },
  { id: "pa4", disciplineId: "pd3", title: "Aula de Reposição", content: "Haverá aula de reposição no sábado 24/02 às 09:00.", date: "19/02/2024", status: "rascunho" },
];

// ── Critérios de Avaliação por Disciplina ──
export const profGradeCriteria: ProfGradeCriteria[] = [
  { disciplineId: "pd1", criteria: [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]},
  { disciplineId: "pd2", criteria: [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]},
  { disciplineId: "pd3", criteria: [
    { label: "Excelente", minGrade: 16, color: "hsl(var(--accent))" },
    { label: "Bom", minGrade: 14, color: "hsl(175, 84%, 32%)" },
    { label: "Suficiente", minGrade: 10, color: "hsl(var(--secondary))" },
    { label: "Insuficiente", minGrade: 0, color: "hsl(var(--destructive))" },
  ]},
];

// ── Aulas de Hoje (Professor) ──
export const profTodayClasses = [
  { time: "08:00 - 09:30", disciplineId: "pd1", name: "Matemática II", room: "Sala 101", turma: "2º Ano Informática", status: "concluída" as const },
  { time: "10:00 - 11:30", disciplineId: "pd2", name: "Matemática I", room: "Sala 203", turma: "1º Ano Informática", status: "em_curso" as const },
  { time: "14:00 - 15:30", disciplineId: "pd1", name: "Matemática II", room: "Sala 101", turma: "2º Ano Eng. Civil", status: "agendada" as const },
  { time: "16:00 - 17:30", disciplineId: "pd3", name: "Estatística", room: "Sala 105", turma: "2º Ano Informática", status: "agendada" as const },
];
