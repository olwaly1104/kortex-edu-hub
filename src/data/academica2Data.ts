// Mock data for Área Académica II — Course Creator / Planner

export type AnoLetivoStatus = "ativo" | "planeado" | "arquivado";

export interface AnoLetivo {
  id: string;
  label: string;          // "2024/2025"
  startDate: string;
  endDate: string;
  status: AnoLetivoStatus;
  cursos: number;
  cadeiras: number;
  turmas: number;
  estudantes: number;
  docentes: number;
  progresso: number;      // 0-100 — planning completeness
}

export const anosLetivos: AnoLetivo[] = [
  { id: "2022-2023", label: "2022/2023", startDate: "01/09/2022", endDate: "31/08/2023", status: "arquivado", cursos: 11, cadeiras: 142, turmas: 48, estudantes: 1820, docentes: 96, progresso: 100 },
  { id: "2023-2024", label: "2023/2024", startDate: "01/09/2023", endDate: "31/08/2024", status: "arquivado", cursos: 12, cadeiras: 156, turmas: 52, estudantes: 1980, docentes: 102, progresso: 100 },
  { id: "2024-2025", label: "2024/2025", startDate: "01/09/2024", endDate: "31/08/2025", status: "ativo", cursos: 13, cadeiras: 168, turmas: 58, estudantes: 2145, docentes: 108, progresso: 100 },
  { id: "2025-2026", label: "2025/2026", startDate: "01/09/2025", endDate: "31/08/2026", status: "ativo", cursos: 13, cadeiras: 168, turmas: 58, estudantes: 2145, docentes: 108, progresso: 100 },
  { id: "2026-2027", label: "2026/2027", startDate: "01/09/2026", endDate: "31/08/2027", status: "planeado", cursos: 13, cadeiras: 0, turmas: 0, estudantes: 0, docentes: 0, progresso: 0 },
];

export interface CursoTemplate {
  id: string;
  name: string;
  code: string;
  faculty: string;
  years: number;
  cadeirasPorAno: number;
  estudantesEsperados: number;
  coordenador: string;
}

export const cursoTemplates: CursoTemplate[] = [
  { id: "arq", name: "Arquitectura", code: "ARQ", faculty: "Faculdade de Ciências Exatas", years: 5, cadeirasPorAno: 7, estudantesEsperados: 160, coordenador: "Dr. Fábio Costa" },
  { id: "eng-civil", name: "Engenharia Civil", code: "EC", faculty: "Faculdade de Ciências Exatas", years: 5, cadeirasPorAno: 8, estudantesEsperados: 140, coordenador: "Dra. Marta Lopes" },
  { id: "eng-info", name: "Engenharia Informática", code: "EI", faculty: "Faculdade de Ciências Exatas", years: 4, cadeirasPorAno: 7, estudantesEsperados: 180, coordenador: "Dr. Hugo Faria" },
  { id: "med", name: "Medicina", code: "MED", faculty: "Faculdade de Ciências da Saúde", years: 6, cadeirasPorAno: 8, estudantesEsperados: 90, coordenador: "Dra. Sílvia Antunes" },
  { id: "dir", name: "Direito", code: "DIR", faculty: "Faculdade de Ciências Sociais", years: 4, cadeirasPorAno: 7, estudantesEsperados: 130, coordenador: "Dr. Tomás Henriques" },
  { id: "econ", name: "Economia", code: "ECN", faculty: "Faculdade de Ciências Sociais", years: 3, cadeirasPorAno: 6, estudantesEsperados: 110, coordenador: "Dra. Sara Quintas" },
  { id: "letras", name: "Letras e Comunicação", code: "LET", faculty: "Faculdade de Letras", years: 3, cadeirasPorAno: 6, estudantesEsperados: 80, coordenador: "Dra. Helena Vaz" },
  { id: "hist", name: "História", code: "HIST", faculty: "Faculdade de Letras", years: 3, cadeirasPorAno: 6, estudantesEsperados: 60, coordenador: "Dr. Manuel Pires" },
  { id: "agro", name: "Agronomia", code: "AGR", faculty: "Faculdade de Ciências Agrárias", years: 4, cadeirasPorAno: 7, estudantesEsperados: 95, coordenador: "Dr. Vasco Lima" },
  { id: "vet", name: "Medicina Veterinária", code: "VET", faculty: "Faculdade de Ciências Agrárias", years: 5, cadeirasPorAno: 7, estudantesEsperados: 70, coordenador: "Dra. Clara Pinto" },
];

// Sample generated curriculum per course (used by Course Creator preview)
export const cadeirasTemplate: Record<string, string[][]> = {
  arq: [
    ["Geometria Descritiva", "Desenho Técnico I", "História da Arte I", "Matemática I", "Introdução à Arquitectura", "Materiais I", "Inglês Técnico"],
    ["Desenho Técnico II", "História da Arte II", "Matemática II", "Projecto I", "Estruturas I", "Topografia", "Urbanismo I"],
    ["Projecto II", "Estruturas II", "Construção I", "Conforto Ambiental", "Computação Gráfica", "Urbanismo II", "Sociologia"],
    ["Projecto III", "Construção II", "Património", "Instalações", "Planeamento", "Legislação", "Ateliers"],
    ["Projecto Final", "Tese", "Profissional I", "Profissional II"],
  ],
  "eng-civil": [
    ["Matemática I", "Física I", "Química", "Desenho Técnico", "Introdução à Eng.", "Programação", "Inglês", "Geologia"],
    ["Matemática II", "Física II", "Estática", "Materiais", "Topografia", "Mec. Fluidos", "Hidrologia", "Métodos Num."],
    ["Resistência Materiais", "Estruturas I", "Hidráulica", "Geotecnia I", "Estradas I", "Ambiente", "Pontes I", "Optativa"],
    ["Estruturas II", "Geotecnia II", "Estradas II", "Saneamento", "Pontes II", "Gestão Obras", "Legislação", "Ética"],
    ["Projecto Civil", "Tese", "Profissional", "Optativa I", "Optativa II"],
  ],
  "eng-info": [
    ["Matemática Discreta", "Programação I", "Lógica", "Arquitectura Comput.", "Inglês Técnico", "Algoritmos I", "Cálculo"],
    ["Programação II", "Estruturas de Dados", "Bases de Dados", "Sistemas Operativos", "Redes I", "Probabilidades", "Web I"],
    ["Engenharia Software", "Redes II", "IA Fundamentos", "Web II", "Mobile", "Segurança", "Cloud"],
    ["Projecto Final", "Tese", "Optativa I", "Optativa II", "Estágio"],
  ],
  med: [
    ["Anatomia I", "Histologia", "Bioquímica I", "Biofísica", "Inglês Médico", "Psicologia", "Introdução Clínica", "Ética"],
    ["Anatomia II", "Bioquímica II", "Fisiologia I", "Genética", "Microbiologia", "Imunologia", "Farmacologia I", "Epidemiologia"],
    ["Fisiologia II", "Patologia I", "Farmacologia II", "Semiologia", "Imagiologia", "Saúde Pública", "Estatística", "Optativa"],
    ["Patologia II", "Clínica Médica I", "Cirurgia I", "Pediatria I", "Obstetrícia", "Psiquiatria", "Neurologia", "Cardiologia"],
    ["Clínica Médica II", "Cirurgia II", "Pediatria II", "Ginecologia", "Ortopedia", "Dermatologia", "Oncologia", "Optativa II"],
    ["Estágio Clínico", "Tese", "Especialidades", "Internato"],
  ],
  dir: [
    ["Intro Direito", "Direito Constitucional", "Direito Romano", "Economia Política", "Inglês Jurídico", "Filosofia Direito", "Ciência Política"],
    ["Direito Civil I", "Direito Penal I", "Direito Administrativo", "Direito Comercial I", "Processo Civil", "Direito Família", "Sociologia Jurídica"],
    ["Direito Civil II", "Direito Penal II", "Direito Trabalho", "Direito Fiscal", "Processo Penal", "Direito Internacional", "Direito Comunitário"],
    ["Direito Notarial", "Direito Ambiental", "Arbitragem", "Deontologia", "Tese", "Estágio", "Optativa"],
  ],
  econ: [
    ["Matemática I", "Microeconomia I", "Macroeconomia I", "Contabilidade I", "Inglês", "Introdução à Gestão"],
    ["Matemática II", "Microeconomia II", "Macroeconomia II", "Contabilidade II", "Estatística", "Direito Económico"],
    ["Econometria", "Finanças", "Comércio Internacional", "Política Económica", "Tese", "Estágio"],
  ],
  letras: [
    ["Linguística", "Literatura Portuguesa I", "Inglês I", "Teoria da Comunicação", "Filosofia", "Latim"],
    ["Literatura Portuguesa II", "Inglês II", "Jornalismo", "Semiótica", "Cultura Africana", "Retórica"],
    ["Literatura Comparada", "Media Digitais", "Tese", "Estágio", "Optativa", "Ética"],
  ],
  hist: [
    ["Pré-História", "História Antiga", "Geografia", "Filosofia", "Inglês", "Metodologia"],
    ["História Medieval", "História Moderna", "Arqueologia", "História de África I", "Antropologia", "Sociologia"],
    ["História Contemporânea", "História de África II", "Tese", "Estágio", "Optativa", "Património"],
  ],
  agro: [
    ["Botânica", "Química Agrícola", "Matemática", "Solos I", "Inglês", "Introdução à Agronomia", "Biologia"],
    ["Fisiologia Vegetal", "Solos II", "Zoologia", "Hidráulica Agrícola", "Microbiologia", "Estatística", "Mecanização"],
    ["Fitotecnia I", "Zootecnia", "Fitopatologia", "Irrigação", "Economia Rural", "Genética", "Pastagens"],
    ["Fitotecnia II", "Extensão Rural", "Tese", "Estágio", "Optativa I", "Optativa II", "Gestão Agrícola"],
  ],
  vet: [
    ["Anatomia Animal I", "Histologia", "Bioquímica", "Biofísica", "Inglês", "Introdução à Veterinária", "Ética"],
    ["Anatomia Animal II", "Fisiologia Animal", "Microbiologia", "Parasitologia", "Genética", "Farmacologia I", "Nutrição"],
    ["Patologia", "Farmacologia II", "Semiologia", "Imagiologia Vet.", "Clínica Pequenos Animais", "Reprodução", "Epidemiologia"],
    ["Clínica Grandes Animais", "Cirurgia I", "Obstetrícia Vet.", "Saúde Pública", "Inspecção Sanitária", "Doenças Infecciosas", "Optativa"],
    ["Estágio Clínico", "Cirurgia II", "Tese", "Especialidades", "Optativa II"],
  ],
};


export interface PlannerStep {
  id: string;
  label: string;
  description: string;
  estimated: string;
}

export const plannerSteps: PlannerStep[] = [
  { id: "1", label: "Carregar Cursos", description: "Importar catálogo de cursos e planos curriculares.", estimated: "2 min" },
  { id: "2", label: "Gerar Cadeiras", description: "Criar cadeiras por curso e ano com ementa base.", estimated: "5 min" },
  { id: "3", label: "Atribuir Docentes", description: "Distribuir docentes pelas cadeiras com base em especialidade.", estimated: "4 min" },
  { id: "4", label: "Criar Turmas", description: "Gerar turmas A–E por ano e curso (capacidade média 32).", estimated: "3 min" },
  { id: "5", label: "Alocar Candidatos", description: "Alocar candidatos aprovados a turmas do 1º ano.", estimated: "2 min" },
  { id: "6", label: "Calendário Académico", description: "Definir semestres, feriados, época de exames.", estimated: "2 min" },
  { id: "7", label: "Agendar Exames", description: "Gerar mapa de exames presenciais (1ª e 2ª época).", estimated: "3 min" },
  { id: "8", label: "Quizzes & Avaliação Contínua", description: "Criar banco de quizzes por cadeira.", estimated: "4 min" },
  { id: "9", label: "Publicar Ano Letivo", description: "Activar ano letivo e notificar todos os perfis.", estimated: "1 min" },
];

export interface AlocacaoCandidato {
  id: string;
  name: string;
  curso: string;
  email: string;
  turmaSugerida: string;
  estado: "alocado" | "pendente" | "conflito";
}

export const alocacaoCandidatos: AlocacaoCandidato[] = [
  { id: "a1", name: "Sofia Andrade", curso: "Arquitectura", email: "sofia.andrade@upra.kor", turmaSugerida: "ARQ-1A", estado: "alocado" },
  { id: "a2", name: "Bernardo Sá", curso: "Arquitectura", email: "bernardo.sa@upra.kor", turmaSugerida: "ARQ-1A", estado: "alocado" },
  { id: "a3", name: "Mariana Reis", curso: "Engenharia Civil", email: "mariana.reis@upra.kor", turmaSugerida: "EC-1B", estado: "alocado" },
  { id: "a4", name: "Tiago Mendes", curso: "Engenharia Informática", email: "tiago.mendes@upra.kor", turmaSugerida: "EI-1C", estado: "pendente" },
  { id: "a5", name: "Inês Pacheco", curso: "Medicina", email: "ines.pacheco@upra.kor", turmaSugerida: "MED-1A", estado: "alocado" },
  { id: "a6", name: "Rafael Cunha", curso: "Direito", email: "rafael.cunha@upra.kor", turmaSugerida: "DIR-1A", estado: "alocado" },
  { id: "a7", name: "Beatriz Lopes", curso: "Economia", email: "beatriz.lopes@upra.kor", turmaSugerida: "ECN-1A", estado: "conflito" },
  { id: "a8", name: "Henrique Rocha", curso: "Arquitectura", email: "henrique.rocha@upra.kor", turmaSugerida: "ARQ-1B", estado: "alocado" },
];

export interface ExameAcad {
  id: string;
  curso: string;
  cadeira: string;
  ano: number;
  turma: string;
  date: string;
  time: string;
  sala: string;
  epoca: "1ª" | "2ª" | "Especial";
  inscritos: number;
}

export const exames: ExameAcad[] = [
  { id: "x1", curso: "ARQ", cadeira: "Matemática I", ano: 1, turma: "A", date: "10/06/2025", time: "09:00", sala: "Anfiteatro 1", epoca: "1ª", inscritos: 32 },
  { id: "x2", curso: "ARQ", cadeira: "Matemática I", ano: 1, turma: "B", date: "10/06/2025", time: "14:00", sala: "Anfiteatro 1", epoca: "1ª", inscritos: 31 },
  { id: "x3", curso: "EC", cadeira: "Física I", ano: 1, turma: "A", date: "11/06/2025", time: "09:00", sala: "Sala 204", epoca: "1ª", inscritos: 28 },
  { id: "x4", curso: "EI", cadeira: "Programação", ano: 1, turma: "A", date: "12/06/2025", time: "09:00", sala: "Lab. Informática 1", epoca: "1ª", inscritos: 30 },
  { id: "x5", curso: "MED", cadeira: "Anatomia", ano: 1, turma: "A", date: "13/06/2025", time: "09:00", sala: "Anfiteatro 3", epoca: "1ª", inscritos: 27 },
  { id: "x6", curso: "ARQ", cadeira: "Matemática I", ano: 1, turma: "A", date: "08/07/2025", time: "09:00", sala: "Anfiteatro 1", epoca: "2ª", inscritos: 6 },
];

export interface QuizAcad {
  id: string;
  curso: string;
  cadeira: string;
  ano: number;
  perguntas: number;
  duracao: number;
  publicado: boolean;
  tentativas: number;
}

export const quizzes: QuizAcad[] = [
  { id: "q1", curso: "ARQ", cadeira: "Matemática I", ano: 1, perguntas: 20, duracao: 30, publicado: true, tentativas: 142 },
  { id: "q2", curso: "ARQ", cadeira: "Geometria Descritiva", ano: 1, perguntas: 15, duracao: 25, publicado: true, tentativas: 98 },
  { id: "q3", curso: "EC", cadeira: "Física I", ano: 1, perguntas: 25, duracao: 40, publicado: true, tentativas: 112 },
  { id: "q4", curso: "EI", cadeira: "Programação", ano: 1, perguntas: 18, duracao: 35, publicado: true, tentativas: 178 },
  { id: "q5", curso: "ARQ", cadeira: "Projecto I", ano: 2, perguntas: 12, duracao: 20, publicado: false, tentativas: 0 },
  { id: "q6", curso: "MED", cadeira: "Anatomia", ano: 1, perguntas: 30, duracao: 45, publicado: true, tentativas: 76 },
];

export interface CalendarioEvento {
  id: string;
  date: string;
  titulo: string;
  tipo: "inicio" | "fim" | "feriado" | "exames" | "matriculas";
}

export const calendarioAcademico: CalendarioEvento[] = [
  { id: "c1", date: "01/09/2025", titulo: "Início do Ano Letivo 2025/2026", tipo: "inicio" },
  { id: "c2", date: "15/09/2025", titulo: "Início das Aulas — 1º Semestre", tipo: "inicio" },
  { id: "c3", date: "22/12/2025", titulo: "Pausa Lectiva — Natal", tipo: "feriado" },
  { id: "c4", date: "12/01/2026", titulo: "Época de Exames — 1ª Época", tipo: "exames" },
  { id: "c5", date: "09/02/2026", titulo: "Início do 2º Semestre", tipo: "inicio" },
  { id: "c6", date: "01/06/2026", titulo: "Época de Exames — 1ª Época", tipo: "exames" },
  { id: "c7", date: "31/07/2026", titulo: "Fim do Ano Letivo", tipo: "fim" },
];

export interface CadeiraAcad {
  id: string;
  curso: string;
  cadeira: string;
  ano: number;
  ects: number;
  docente: string;
  turmas: number;
  estudantes: number;
  publicada: boolean;
}

export const cadeirasAcad: CadeiraAcad[] = [
  { id: "ca1", curso: "ARQ", cadeira: "Matemática I", ano: 1, ects: 6, docente: "Prof. Sofia Martins", turmas: 5, estudantes: 160, publicada: true },
  { id: "ca2", curso: "ARQ", cadeira: "Geometria Descritiva", ano: 1, ects: 6, docente: "Prof. Carlos Mendes", turmas: 5, estudantes: 160, publicada: true },
  { id: "ca3", curso: "ARQ", cadeira: "Desenho Técnico I", ano: 1, ects: 5, docente: "Prof. Ana Costa", turmas: 5, estudantes: 160, publicada: true },
  { id: "ca4", curso: "ARQ", cadeira: "Projecto I", ano: 2, ects: 8, docente: "Prof. António Silva", turmas: 5, estudantes: 140, publicada: true },
  { id: "ca5", curso: "EC", cadeira: "Resistência Materiais", ano: 3, ects: 6, docente: "Prof. Pedro Ferreira", turmas: 3, estudantes: 95, publicada: true },
  { id: "ca6", curso: "EI", cadeira: "Programação", ano: 1, ects: 6, docente: "Prof. Hugo Faria", turmas: 4, estudantes: 178, publicada: true },
  { id: "ca7", curso: "MED", cadeira: "Anatomia", ano: 1, ects: 8, docente: "Prof. Sílvia Antunes", turmas: 3, estudantes: 90, publicada: true },
  { id: "ca8", curso: "DIR", cadeira: "Direito Civil I", ano: 1, ects: 6, docente: "Prof. Tomás Henriques", turmas: 2, estudantes: 65, publicada: true },
];

export interface NotaResumo {
  curso: string;
  ano: number;
  mediaGeral: number;
  aprovados: number;
  total: number;
}

export const notasResumo: NotaResumo[] = [
  { curso: "Arquitectura", ano: 1, mediaGeral: 12.4, aprovados: 125, total: 160 },
  { curso: "Arquitectura", ano: 2, mediaGeral: 13.1, aprovados: 115, total: 140 },
  { curso: "Arquitectura", ano: 3, mediaGeral: 13.8, aprovados: 110, total: 130 },
  { curso: "Engenharia Civil", ano: 1, mediaGeral: 11.9, aprovados: 90, total: 140 },
  { curso: "Engenharia Informática", ano: 1, mediaGeral: 13.2, aprovados: 145, total: 178 },
  { curso: "Medicina", ano: 1, mediaGeral: 14.1, aprovados: 82, total: 90 },
];
