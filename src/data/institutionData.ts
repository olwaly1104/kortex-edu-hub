// ── Coordenador de Curso ──
export interface CursoYear {
  year: number;
  turmas: number;
  disciplinas: number;
  estudantes: number;
  mediaGeral: number;
  taxaSucesso: number;
}

export interface CursoInfo {
  id: string;
  name: string;
  code: string;
  faculty: string;
  coordinator: string;
  years: CursoYear[];
  totalEstudantes: number;
  totalDocentes: number;
  disciplinasActivas: number;
  mediaGeral: number;
  aprovacoesPendentes: number;
}

export interface Docente {
  id: string;
  name: string;
  email: string;
  department: string;
  disciplinas: number;
  turmas: number;
  presenca: number;
  status: "activo" | "licença" | "inactivo";
}

export interface Aprovacao {
  id: string;
  type: "nota" | "plano" | "horário" | "transferência" | "recurso";
  title: string;
  description: string;
  requester: string;
  date: string;
  status: "pendente" | "aprovado" | "rejeitado";
  priority: "alta" | "média" | "baixa";
}

export interface RecentActivity {
  id: string;
  action: string;
  actor: string;
  date: string;
  type: "nota" | "aprovacao" | "disciplina" | "estudante";
}

export interface CursoEstudante {
  id: string;
  name: string;
  email: string;
  year: number;
  turma: string;
  media: number | null;
  presenca: number;
  status: "excelente" | "normal" | "risco";
}

export interface CursoDisciplina {
  id: string;
  name: string;
  code: string;
  year: number;
  professor: string;
  estudantes: number;
  media: number | null;
  taxaSucesso: number;
}

export interface CursoNota {
  year: number;
  disciplinas: { name: string; code: string; media: number; aprovados: number; reprovados: number }[];
}

// Mock Coordenador Curso
export const coordCursoInfo: CursoInfo = {
  id: "curso1",
  name: "Engenharia Civil",
  code: "ECIV",
  faculty: "Faculdade de Engenharia",
  coordinator: "Dr. Manuel Rodrigues",
  years: [
    { year: 1, turmas: 2, disciplinas: 8, estudantes: 64, mediaGeral: 12.4, taxaSucesso: 78 },
    { year: 2, turmas: 2, disciplinas: 7, estudantes: 52, mediaGeral: 13.1, taxaSucesso: 82 },
    { year: 3, turmas: 2, disciplinas: 7, estudantes: 45, mediaGeral: 13.8, taxaSucesso: 85 },
    { year: 4, turmas: 1, disciplinas: 6, estudantes: 38, mediaGeral: 14.2, taxaSucesso: 89 },
    { year: 5, turmas: 1, disciplinas: 4, estudantes: 30, mediaGeral: 14.8, taxaSucesso: 92 },
  ],
  totalEstudantes: 229,
  totalDocentes: 18,
  disciplinasActivas: 32,
  mediaGeral: 13.5,
  aprovacoesPendentes: 7,
};

export const coordDocentes: Docente[] = [
  { id: "d1", name: "Prof. António Silva", email: "prof.silva@upra.kor", department: "Estruturas", disciplinas: 3, turmas: 4, presenca: 96, status: "activo" },
  { id: "d2", name: "Prof. Maria Santos", email: "prof.santos@upra.kor", department: "Geotecnia", disciplinas: 2, turmas: 3, presenca: 92, status: "activo" },
  { id: "d3", name: "Prof. Pedro Ferreira", email: "prof.ferreira@upra.kor", department: "Hidráulica", disciplinas: 2, turmas: 2, presenca: 88, status: "activo" },
  { id: "d4", name: "Prof. Ana Costa", email: "prof.costa@upra.kor", department: "Materiais", disciplinas: 3, turmas: 3, presenca: 94, status: "activo" },
  { id: "d5", name: "Prof. David Lopes", email: "prof.lopes@upra.kor", department: "Transportes", disciplinas: 2, turmas: 2, presenca: 90, status: "licença" },
  { id: "d6", name: "Prof. Luísa Tavares", email: "prof.tavares@upra.kor", department: "Topografia", disciplinas: 2, turmas: 2, presenca: 95, status: "activo" },
  { id: "d7", name: "Prof. Carlos Mendes", email: "prof.mendes@upra.kor", department: "Estruturas", disciplinas: 2, turmas: 3, presenca: 91, status: "activo" },
  { id: "d8", name: "Prof. Sofia Martins", email: "prof.martins@upra.kor", department: "Matemática", disciplinas: 2, turmas: 4, presenca: 97, status: "activo" },
];

export const coordEstudantes: CursoEstudante[] = [
  { id: "e1", name: "João Fernandes", email: "2934@upra.kor", year: 2, turma: "A", media: 14.2, presenca: 92, status: "excelente" },
  { id: "e2", name: "Maria Silva", email: "3012@upra.kor", year: 2, turma: "A", media: 15.1, presenca: 95, status: "excelente" },
  { id: "e3", name: "Pedro Nascimento", email: "2987@upra.kor", year: 2, turma: "B", media: 11.8, presenca: 78, status: "normal" },
  { id: "e4", name: "Ana Gomes", email: "3045@upra.kor", year: 1, turma: "A", media: 12.5, presenca: 88, status: "normal" },
  { id: "e5", name: "Carlos Santos", email: "3100@upra.kor", year: 1, turma: "A", media: 8.9, presenca: 62, status: "risco" },
  { id: "e6", name: "Rita Oliveira", email: "3055@upra.kor", year: 3, turma: "A", media: 16.2, presenca: 97, status: "excelente" },
  { id: "e7", name: "Bruno Mendes", email: "3066@upra.kor", year: 3, turma: "B", media: 13.4, presenca: 85, status: "normal" },
  { id: "e8", name: "Catarina Reis", email: "3077@upra.kor", year: 1, turma: "B", media: 9.5, presenca: 65, status: "risco" },
  { id: "e9", name: "Diogo Pereira", email: "3088@upra.kor", year: 4, turma: "A", media: 14.8, presenca: 93, status: "excelente" },
  { id: "e10", name: "Eva Cunha", email: "3099@upra.kor", year: 4, turma: "A", media: 13.0, presenca: 82, status: "normal" },
  { id: "e11", name: "Francisco Lima", email: "3110@upra.kor", year: 5, turma: "A", media: 15.5, presenca: 96, status: "excelente" },
  { id: "e12", name: "Gonçalo Dias", email: "3121@upra.kor", year: 5, turma: "A", media: 14.0, presenca: 90, status: "normal" },
  { id: "e13", name: "Helena Costa", email: "3132@upra.kor", year: 1, turma: "B", media: 7.2, presenca: 55, status: "risco" },
  { id: "e14", name: "Igor Martins", email: "3143@upra.kor", year: 2, turma: "B", media: 12.1, presenca: 80, status: "normal" },
  { id: "e15", name: "Joana Cardoso", email: "3154@upra.kor", year: 3, turma: "A", media: 15.8, presenca: 94, status: "excelente" },
];

export const coordDisciplinas: CursoDisciplina[] = [
  { id: "cd1", name: "Matemática I", code: "MAT101", year: 1, professor: "Prof. Sofia Martins", estudantes: 64, media: 12.1, taxaSucesso: 75 },
  { id: "cd2", name: "Física I", code: "FIS101", year: 1, professor: "Prof. Maria Santos", estudantes: 64, media: 11.8, taxaSucesso: 72 },
  { id: "cd3", name: "Desenho Técnico I", code: "DES101", year: 1, professor: "Prof. Luísa Tavares", estudantes: 64, media: 13.2, taxaSucesso: 82 },
  { id: "cd4", name: "Matemática II", code: "MAT201", year: 2, professor: "Prof. António Silva", estudantes: 52, media: 13.0, taxaSucesso: 80 },
  { id: "cd5", name: "Resistência dos Materiais", code: "RES201", year: 2, professor: "Prof. Carlos Mendes", estudantes: 52, media: 12.5, taxaSucesso: 78 },
  { id: "cd6", name: "Mecânica dos Solos", code: "GEO301", year: 3, professor: "Prof. Maria Santos", estudantes: 45, media: 13.9, taxaSucesso: 85 },
  { id: "cd7", name: "Hidráulica", code: "HID301", year: 3, professor: "Prof. Pedro Ferreira", estudantes: 45, media: 13.5, taxaSucesso: 83 },
  { id: "cd8", name: "Estruturas de Betão", code: "EST401", year: 4, professor: "Prof. António Silva", estudantes: 38, media: 14.2, taxaSucesso: 88 },
  { id: "cd9", name: "Gestão de Obras", code: "GES401", year: 4, professor: "Prof. Ana Costa", estudantes: 38, media: 14.5, taxaSucesso: 90 },
  { id: "cd10", name: "Projecto Final", code: "PRJ501", year: 5, professor: "Prof. Carlos Mendes", estudantes: 30, media: 15.0, taxaSucesso: 93 },
];

export const coordNotas: CursoNota[] = [
  { year: 1, disciplinas: [
    { name: "Matemática I", code: "MAT101", media: 12.1, aprovados: 48, reprovados: 16 },
    { name: "Física I", code: "FIS101", media: 11.8, aprovados: 46, reprovados: 18 },
    { name: "Desenho Técnico I", code: "DES101", media: 13.2, aprovados: 52, reprovados: 12 },
  ]},
  { year: 2, disciplinas: [
    { name: "Matemática II", code: "MAT201", media: 13.0, aprovados: 42, reprovados: 10 },
    { name: "Resistência dos Materiais", code: "RES201", media: 12.5, aprovados: 40, reprovados: 12 },
  ]},
  { year: 3, disciplinas: [
    { name: "Mecânica dos Solos", code: "GEO301", media: 13.9, aprovados: 38, reprovados: 7 },
    { name: "Hidráulica", code: "HID301", media: 13.5, aprovados: 37, reprovados: 8 },
  ]},
  { year: 4, disciplinas: [
    { name: "Estruturas de Betão", code: "EST401", media: 14.2, aprovados: 34, reprovados: 4 },
    { name: "Gestão de Obras", code: "GES401", media: 14.5, aprovados: 34, reprovados: 4 },
  ]},
  { year: 5, disciplinas: [
    { name: "Projecto Final", code: "PRJ501", media: 15.0, aprovados: 28, reprovados: 2 },
  ]},
];

export const coordAprovacoes: Aprovacao[] = [
  { id: "ap1", type: "nota", title: "Revisão de nota — Matemática II", description: "Estudante João Fernandes solicita revisão de nota do Teste 1", requester: "João Fernandes", date: "28/02/2024", status: "pendente", priority: "média" },
  { id: "ap2", type: "recurso", title: "Recurso de Exame — Física", description: "Pedido de exame de recurso para Física Aplicada", requester: "Maria Silva", date: "27/02/2024", status: "pendente", priority: "alta" },
  { id: "ap3", type: "plano", title: "Alteração de plano curricular — 3º Ano", description: "Proposta de inclusão de nova disciplina optativa", requester: "Prof. António Silva", date: "25/02/2024", status: "pendente", priority: "média" },
  { id: "ap4", type: "transferência", title: "Transferência de turma", description: "Estudante Pedro Nascimento solicita mudança de turma A para B", requester: "Pedro Nascimento", date: "24/02/2024", status: "pendente", priority: "baixa" },
  { id: "ap5", type: "horário", title: "Alteração de horário — Desenho Técnico", description: "Troca de sala devido a obras no edifício B", requester: "Prof. Luísa Tavares", date: "23/02/2024", status: "aprovado", priority: "alta" },
  { id: "ap6", type: "nota", title: "Lançamento de notas — Química Geral", description: "Notas do Teste 1 prontas para publicação", requester: "Prof. Ana Costa", date: "22/02/2024", status: "aprovado", priority: "média" },
  { id: "ap7", type: "recurso", title: "Recurso disciplinar — Atraso reincidente", description: "Processo disciplinar por faltas injustificadas repetidas", requester: "Direcção Académica", date: "20/02/2024", status: "pendente", priority: "alta" },
  { id: "ap8", type: "nota", title: "Publicação de notas — Desenho Técnico", description: "Notas finais de Desenho Técnico I aprovadas", requester: "Prof. Luísa Tavares", date: "18/02/2024", status: "rejeitado", priority: "média" },
];

export const coordRecentActivity: RecentActivity[] = [
  { id: "ra1", action: "Notas de Matemática II publicadas", actor: "Prof. António Silva", date: "Há 2 horas", type: "nota" },
  { id: "ra2", action: "Novo pedido de transferência recebido", actor: "Pedro Nascimento", date: "Há 4 horas", type: "aprovacao" },
  { id: "ra3", action: "Plano curricular do 3º Ano actualizado", actor: "Prof. Ana Costa", date: "Ontem", type: "disciplina" },
  { id: "ra4", action: "2 novos estudantes inscritos no 1º Ano", actor: "Serviços Académicos", date: "Ontem", type: "estudante" },
  { id: "ra5", action: "Horário de Desenho Técnico alterado", actor: "Prof. Luísa Tavares", date: "Há 2 dias", type: "disciplina" },
];

// ── Decano ──
export interface FacultyCourse {
  id: string;
  name: string;
  code: string;
  coordinator: string;
  years: number;
  estudantes: number;
  docentes: number;
  mediaGeral: number;
  taxaSucesso: number;
  status: "activo" | "em revisão" | "suspenso";
}

export interface FacultyInfo {
  id: string;
  name: string;
  dean: string;
  courses: FacultyCourse[];
  totalEstudantes: number;
  totalDocentes: number;
  totalCursos: number;
  taxaSucesso: number;
}

export interface FacultyDocente {
  id: string;
  name: string;
  email: string;
  course: string;
  department: string;
  disciplinas: number;
  presenca: number;
  status: "activo" | "licença" | "inactivo";
}

export interface FacultyEstudante {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
  media: number | null;
  status: "excelente" | "normal" | "risco";
}

export const decanoFaculty: FacultyInfo = {
  id: "fac1",
  name: "Faculdade de Engenharia",
  dean: "Prof. Dr. Ricardo Almeida",
  totalEstudantes: 1240,
  totalDocentes: 86,
  totalCursos: 6,
  taxaSucesso: 81,
  courses: [
    { id: "c1", name: "Engenharia Civil", code: "ECIV", coordinator: "Dr. Manuel Rodrigues", years: 5, estudantes: 229, docentes: 18, mediaGeral: 13.5, taxaSucesso: 85, status: "activo" },
    { id: "c2", name: "Engenharia Informática", code: "EINF", coordinator: "Dra. Teresa Moura", years: 4, estudantes: 312, docentes: 22, mediaGeral: 13.8, taxaSucesso: 83, status: "activo" },
    { id: "c3", name: "Engenharia Mecânica", code: "EMEC", coordinator: "Dr. Jorge Bastos", years: 5, estudantes: 198, docentes: 16, mediaGeral: 12.9, taxaSucesso: 79, status: "activo" },
    { id: "c4", name: "Engenharia Electrotécnica", code: "EELT", coordinator: "Dra. Fernanda Reis", years: 5, estudantes: 176, docentes: 14, mediaGeral: 13.2, taxaSucesso: 80, status: "activo" },
    { id: "c5", name: "Engenharia Ambiental", code: "EAMB", coordinator: "Dr. Paulo Henriques", years: 4, estudantes: 145, docentes: 10, mediaGeral: 14.1, taxaSucesso: 87, status: "activo" },
    { id: "c6", name: "Engenharia Química", code: "EQUI", coordinator: "Dra. Carla Nunes", years: 5, estudantes: 180, docentes: 6, mediaGeral: 12.5, taxaSucesso: 72, status: "em revisão" },
  ],
};

export const decanoDocentes: FacultyDocente[] = [
  { id: "fd1", name: "Prof. António Silva", email: "prof.silva@upra.kor", course: "Eng. Civil", department: "Estruturas", disciplinas: 3, presenca: 96, status: "activo" },
  { id: "fd2", name: "Prof. Maria Santos", email: "prof.santos@upra.kor", course: "Eng. Civil", department: "Geotecnia", disciplinas: 2, presenca: 92, status: "activo" },
  { id: "fd3", name: "Prof. Pedro Ferreira", email: "prof.ferreira@upra.kor", course: "Eng. Informática", department: "Software", disciplinas: 2, presenca: 88, status: "activo" },
  { id: "fd4", name: "Prof. Ana Costa", email: "prof.costa@upra.kor", course: "Eng. Química", department: "Química", disciplinas: 3, presenca: 94, status: "activo" },
  { id: "fd5", name: "Prof. David Lopes", email: "prof.lopes@upra.kor", course: "Eng. Mecânica", department: "Termodinâmica", disciplinas: 2, presenca: 90, status: "licença" },
  { id: "fd6", name: "Prof. Luísa Tavares", email: "prof.tavares@upra.kor", course: "Eng. Civil", department: "Topografia", disciplinas: 2, presenca: 95, status: "activo" },
  { id: "fd7", name: "Prof. Carlos Mendes", email: "prof.mendes@upra.kor", course: "Eng. Electrotécnica", department: "Circuitos", disciplinas: 2, presenca: 91, status: "activo" },
  { id: "fd8", name: "Prof. Sofia Martins", email: "prof.martins@upra.kor", course: "Eng. Ambiental", department: "Ecologia", disciplinas: 2, presenca: 97, status: "activo" },
  { id: "fd9", name: "Prof. Hugo Araújo", email: "prof.araujo@upra.kor", course: "Eng. Informática", department: "IA", disciplinas: 3, presenca: 93, status: "activo" },
  { id: "fd10", name: "Prof. Teresa Moura", email: "prof.moura@upra.kor", course: "Eng. Informática", department: "Redes", disciplinas: 2, presenca: 89, status: "activo" },
];

export const decanoEstudantes: FacultyEstudante[] = [
  { id: "fe1", name: "João Fernandes", email: "2934@upra.kor", course: "Eng. Civil", year: 2, media: 14.2, status: "excelente" },
  { id: "fe2", name: "Maria Silva", email: "3012@upra.kor", course: "Eng. Informática", year: 3, media: 15.1, status: "excelente" },
  { id: "fe3", name: "Pedro Nascimento", email: "2987@upra.kor", course: "Eng. Mecânica", year: 1, media: 11.8, status: "normal" },
  { id: "fe4", name: "Ana Gomes", email: "3045@upra.kor", course: "Eng. Civil", year: 1, media: 12.5, status: "normal" },
  { id: "fe5", name: "Carlos Santos", email: "3100@upra.kor", course: "Eng. Química", year: 2, media: 8.9, status: "risco" },
  { id: "fe6", name: "Rita Oliveira", email: "3055@upra.kor", course: "Eng. Ambiental", year: 3, media: 16.2, status: "excelente" },
  { id: "fe7", name: "Bruno Mendes", email: "3066@upra.kor", course: "Eng. Electrotécnica", year: 2, media: 13.4, status: "normal" },
  { id: "fe8", name: "Catarina Reis", email: "3077@upra.kor", course: "Eng. Informática", year: 1, media: 9.5, status: "risco" },
  { id: "fe9", name: "Diogo Pereira", email: "3088@upra.kor", course: "Eng. Civil", year: 4, media: 14.8, status: "excelente" },
  { id: "fe10", name: "Eva Cunha", email: "3099@upra.kor", course: "Eng. Mecânica", year: 3, media: 13.0, status: "normal" },
];

export const decanoAprovacoes: Aprovacao[] = [
  { id: "dap1", type: "plano", title: "Reestruturação curricular — Eng. Química", description: "Proposta de reestruturação do currículo de Engenharia Química", requester: "Dra. Carla Nunes", date: "28/02/2024", status: "pendente", priority: "alta" },
  { id: "dap2", type: "recurso", title: "Contratação de docente — Eng. Informática", description: "Pedido de abertura de vaga para novo docente de IA", requester: "Dra. Teresa Moura", date: "27/02/2024", status: "pendente", priority: "alta" },
  { id: "dap3", type: "horário", title: "Calendário de exames — 2º Semestre", description: "Aprovação do calendário de exames para todos os cursos", requester: "Serviços Académicos", date: "25/02/2024", status: "pendente", priority: "alta" },
  { id: "dap4", type: "nota", title: "Homologação de pautas — Eng. Civil 4º Ano", description: "Pautas finais do 1º semestre para homologação", requester: "Dr. Manuel Rodrigues", date: "24/02/2024", status: "pendente", priority: "média" },
  { id: "dap5", type: "transferência", title: "Transferência inter-cursos", description: "Pedido de transferência de Eng. Mecânica para Eng. Civil", requester: "Estudante Carlos Pereira", date: "22/02/2024", status: "pendente", priority: "baixa" },
  { id: "dap6", type: "plano", title: "Nova disciplina optativa — Eng. Informática", description: "Proposta de criação de disciplina de Machine Learning", requester: "Dra. Teresa Moura", date: "20/02/2024", status: "aprovado", priority: "média" },
  { id: "dap7", type: "horário", title: "Alteração de sala — Eng. Mecânica", description: "Mudança de sala para Lab. de Termodinâmica", requester: "Dr. Jorge Bastos", date: "18/02/2024", status: "aprovado", priority: "baixa" },
];

// ── Reitoria ──
export interface UniversityFaculty {
  id: string;
  name: string;
  dean: string;
  courses: number;
  estudantes: number;
  docentes: number;
  taxaSucesso: number;
  mediaGeral: number;
}

export interface UniversityInfo {
  name: string;
  rector: string;
  totalFaculdades: number;
  totalEstudantes: number;
  totalDocentes: number;
  taxaSucesso: number;
  faculties: UniversityFaculty[];
}

export const reitoriaInfo: UniversityInfo = {
  name: "Universidade Privada de Angola",
  rector: "Prof. Dr. António Bernardo",
  totalFaculdades: 5,
  totalEstudantes: 4820,
  totalDocentes: 312,
  taxaSucesso: 79,
  faculties: [
    { id: "f1", name: "Faculdade de Engenharia", dean: "Prof. Dr. Ricardo Almeida", courses: 6, estudantes: 1240, docentes: 86, taxaSucesso: 81, mediaGeral: 13.3 },
    { id: "f2", name: "Faculdade de Economia", dean: "Profª. Dra. Helena Sousa", courses: 4, estudantes: 980, docentes: 52, taxaSucesso: 84, mediaGeral: 13.8 },
    { id: "f3", name: "Faculdade de Direito", dean: "Prof. Dr. Tomás Carvalho", courses: 3, estudantes: 1120, docentes: 68, taxaSucesso: 76, mediaGeral: 12.9 },
    { id: "f4", name: "Faculdade de Medicina", dean: "Profª. Dra. Margarida Lopes", courses: 4, estudantes: 860, docentes: 72, taxaSucesso: 74, mediaGeral: 13.1 },
    { id: "f5", name: "Faculdade de Ciências Sociais", dean: "Prof. Dr. Fernando Dias", courses: 5, estudantes: 620, docentes: 34, taxaSucesso: 82, mediaGeral: 14.0 },
  ],
};

export const reitoriaAprovacoes: Aprovacao[] = [
  { id: "rap1", type: "plano", title: "Abertura de novo curso — Ciência de Dados", description: "Proposta de criação do curso de Ciência de Dados na Fac. de Engenharia", requester: "Prof. Dr. Ricardo Almeida", date: "28/02/2024", status: "pendente", priority: "alta" },
  { id: "rap2", type: "recurso", title: "Orçamento anual — Faculdade de Medicina", description: "Aprovação do orçamento para equipamentos laboratoriais", requester: "Profª. Dra. Margarida Lopes", date: "26/02/2024", status: "pendente", priority: "alta" },
  { id: "rap3", type: "plano", title: "Protocolo internacional — Universidade de Lisboa", description: "Acordo de mobilidade estudantil e docente", requester: "Gabinete de Relações Internacionais", date: "25/02/2024", status: "pendente", priority: "alta" },
  { id: "rap4", type: "horário", title: "Calendário académico 2024/2025", description: "Aprovação do calendário académico do próximo ano lectivo", requester: "Serviços Académicos", date: "23/02/2024", status: "pendente", priority: "média" },
  { id: "rap5", type: "recurso", title: "Renovação de protocolo — Hospital Central", description: "Renovação do protocolo de estágios com o Hospital Central de Luanda", requester: "Profª. Dra. Margarida Lopes", date: "20/02/2024", status: "aprovado", priority: "alta" },
  { id: "rap6", type: "plano", title: "Regulamento de propinas 2024/2025", description: "Actualização das tabelas de propinas para o próximo ano lectivo", requester: "Direcção Financeira", date: "18/02/2024", status: "aprovado", priority: "alta" },
];

export interface DecanoInfo {
  id: string;
  name: string;
  faculty: string;
  email: string;
  since: string;
  courses: number;
  estudantes: number;
}

export const reitoriaDecanos: DecanoInfo[] = [
  { id: "dec1", name: "Prof. Dr. Ricardo Almeida", faculty: "Faculdade de Engenharia", email: "r.almeida@upra.kor", since: "2019", courses: 6, estudantes: 1240 },
  { id: "dec2", name: "Profª. Dra. Helena Sousa", faculty: "Faculdade de Economia", email: "h.sousa@upra.kor", since: "2020", courses: 4, estudantes: 980 },
  { id: "dec3", name: "Prof. Dr. Tomás Carvalho", faculty: "Faculdade de Direito", email: "t.carvalho@upra.kor", since: "2018", courses: 3, estudantes: 1120 },
  { id: "dec4", name: "Profª. Dra. Margarida Lopes", faculty: "Faculdade de Medicina", email: "m.lopes@upra.kor", since: "2021", courses: 4, estudantes: 860 },
  { id: "dec5", name: "Prof. Dr. Fernando Dias", faculty: "Faculdade de Ciências Sociais", email: "f.dias@upra.kor", since: "2022", courses: 5, estudantes: 620 },
];

export interface CoordInfo {
  id: string;
  name: string;
  course: string;
  faculty: string;
  email: string;
  estudantes: number;
}

export const reitoriaCoords: CoordInfo[] = [
  { id: "co1", name: "Dr. Manuel Rodrigues", course: "Engenharia Civil", faculty: "Fac. Engenharia", email: "m.rodrigues@upra.kor", estudantes: 229 },
  { id: "co2", name: "Dra. Teresa Moura", course: "Engenharia Informática", faculty: "Fac. Engenharia", email: "t.moura@upra.kor", estudantes: 312 },
  { id: "co3", name: "Dr. Jorge Bastos", course: "Engenharia Mecânica", faculty: "Fac. Engenharia", email: "j.bastos@upra.kor", estudantes: 198 },
  { id: "co4", name: "Dra. Fernanda Reis", course: "Engenharia Electrotécnica", faculty: "Fac. Engenharia", email: "f.reis@upra.kor", estudantes: 176 },
  { id: "co5", name: "Dr. Paulo Henriques", course: "Engenharia Ambiental", faculty: "Fac. Engenharia", email: "p.henriques@upra.kor", estudantes: 145 },
  { id: "co6", name: "Dra. Carla Nunes", course: "Engenharia Química", faculty: "Fac. Engenharia", email: "c.nunes@upra.kor", estudantes: 180 },
  { id: "co7", name: "Dr. Álvaro Mendes", course: "Gestão de Empresas", faculty: "Fac. Economia", email: "a.mendes@upra.kor", estudantes: 340 },
  { id: "co8", name: "Dra. Beatriz Santos", course: "Contabilidade", faculty: "Fac. Economia", email: "b.santos@upra.kor", estudantes: 280 },
  { id: "co9", name: "Dr. Nuno Barros", course: "Direito Civil", faculty: "Fac. Direito", email: "n.barros@upra.kor", estudantes: 420 },
  { id: "co10", name: "Dra. Leonor Pinto", course: "Medicina Geral", faculty: "Fac. Medicina", email: "l.pinto@upra.kor", estudantes: 310 },
];

export interface UniDocente {
  id: string;
  name: string;
  email: string;
  faculty: string;
  course: string;
  disciplinas: number;
  presenca: number;
  status: "activo" | "licença" | "inactivo";
}

export const reitoriaDocentes: UniDocente[] = [
  { id: "ud1", name: "Prof. António Silva", email: "prof.silva@upra.kor", faculty: "Fac. Engenharia", course: "Eng. Civil", disciplinas: 3, presenca: 96, status: "activo" },
  { id: "ud2", name: "Prof. Maria Santos", email: "prof.santos@upra.kor", faculty: "Fac. Engenharia", course: "Eng. Civil", disciplinas: 2, presenca: 92, status: "activo" },
  { id: "ud3", name: "Prof. Pedro Ferreira", email: "prof.ferreira@upra.kor", faculty: "Fac. Engenharia", course: "Eng. Informática", disciplinas: 2, presenca: 88, status: "activo" },
  { id: "ud4", name: "Prof. Ana Costa", email: "prof.costa@upra.kor", faculty: "Fac. Engenharia", course: "Eng. Química", disciplinas: 3, presenca: 94, status: "activo" },
  { id: "ud5", name: "Prof. Helena Sousa", email: "prof.sousa@upra.kor", faculty: "Fac. Economia", course: "Gestão", disciplinas: 2, presenca: 91, status: "activo" },
  { id: "ud6", name: "Prof. Tomás Carvalho", email: "prof.carvalho@upra.kor", faculty: "Fac. Direito", course: "Direito Civil", disciplinas: 3, presenca: 95, status: "activo" },
  { id: "ud7", name: "Prof. Margarida Lopes", email: "prof.mlopes@upra.kor", faculty: "Fac. Medicina", course: "Medicina Geral", disciplinas: 2, presenca: 97, status: "activo" },
  { id: "ud8", name: "Prof. Fernando Dias", email: "prof.dias@upra.kor", faculty: "Fac. Ciências Sociais", course: "Sociologia", disciplinas: 2, presenca: 89, status: "licença" },
];
