export type EstadoCandidatura = "incompleto" | "pendente" | "aprovado" | "reprovado";

export const estadoColors: Record<EstadoCandidatura, string> = {
  incompleto: "bg-orange-100 text-orange-800 border-orange-200",
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  reprovado: "bg-red-100 text-red-800 border-red-200",
};

export const estadoLabels: Record<EstadoCandidatura, string> = {
  incompleto: "Incompleto",
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export interface DocumentoCandidatura {
  nome: string;
  entregue: boolean;
  aprovado: boolean | null;
  nota?: string;
}

export interface TransicaoEstado {
  de: EstadoCandidatura | "início";
  para: EstadoCandidatura;
  data: string;
  responsavel: string;
}

export interface Candidatura {
  id: string;
  nome: string;
  bi: string;
  telefone: string;
  email: string;
  foto?: string;
  periodo: string;
  cursoOpcao1: string;
  cursoOpcao2?: string;
  cursoOpcao3?: string;
  estado: EstadoCandidatura;
  dataSubmissao: string;
  documentos: DocumentoCandidatura[];
  pagamento: {
    estado: "pendente" | "confirmado";
    referencia: string;
    valor: number;
    comprovativo: boolean;
  };
  historico: TransicaoEstado[];
  nota?: number;
  sessaoProvaId?: string;
}

export interface SessaoProva {
  id: string;
  nome: string;
  data: string;
  hora: string;
  sala: string;
  capacidadeMax: number;
  candidatosIds: string[];
  periodo: string;
}

export const periodos = ["1ª Chamada 2025", "2ª Chamada 2025"];
export const cursos = ["Direito", "Gestão", "Engenharia Informática", "Medicina", "Arquitectura"];

const documentosBase: DocumentoCandidatura[] = [
  { nome: "Bilhete de Identidade", entregue: true, aprovado: null },
  { nome: "Certificado do Ensino Médio", entregue: true, aprovado: null },
  { nome: "Declaração de Notas", entregue: true, aprovado: null },
  { nome: "Atestado Médico", entregue: true, aprovado: null },
];

function docs(overrides?: Partial<Record<number, Partial<DocumentoCandidatura>>>): DocumentoCandidatura[] {
  return documentosBase.map((d, i) => ({ ...d, ...(overrides?.[i] || {}) }));
}

function allDocs(): DocumentoCandidatura[] {
  return docs();
}

function incompleteDocs(missing: number[]): DocumentoCandidatura[] {
  const overrides: Partial<Record<number, Partial<DocumentoCandidatura>>> = {};
  missing.forEach(i => { overrides[i] = { entregue: false, aprovado: null }; });
  return docs(overrides);
}

export const candidaturas: Candidatura[] = [
  // INCOMPLETO - missing documents
  {
    id: "c1", nome: "Ana Beatriz Domingos", bi: "007234567LA042", telefone: "+244 923 456 789", email: "ana.domingos@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina", cursoOpcao2: "Engenharia Informática",
    estado: "incompleto", dataSubmissao: "2025-01-15",
    documentos: incompleteDocs([3]),
    pagamento: { estado: "pendente", referencia: "REF-2025-0001", valor: 15000, comprovativo: false },
    historico: [{ de: "início", para: "incompleto", data: "2025-01-15", responsavel: "Sistema" }],
  },
  {
    id: "c12", nome: "Miguel Ângelo Pereira", bi: "018345678LA053", telefone: "+244 933 456 789", email: "miguel.pereira@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Arquitectura", cursoOpcao2: "Engenharia Informática",
    estado: "incompleto", dataSubmissao: "2025-03-10",
    documentos: incompleteDocs([2, 3]),
    pagamento: { estado: "pendente", referencia: "REF-2025-0012", valor: 15000, comprovativo: false },
    historico: [{ de: "início", para: "incompleto", data: "2025-03-10", responsavel: "Sistema" }],
  },
  {
    id: "c13", nome: "Natália Rosa Queiroz", bi: "019456789LA054", telefone: "+244 944 567 890", email: "natalia.queiroz@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Medicina",
    estado: "incompleto", dataSubmissao: "2025-03-08",
    documentos: incompleteDocs([3]),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0013", valor: 15000, comprovativo: true },
    historico: [{ de: "início", para: "incompleto", data: "2025-03-08", responsavel: "Sistema" }],
  },

  // PENDENTE - docs complete, hasn't done exam yet
  {
    id: "c2", nome: "Carlos Eduardo Mendes", bi: "008345678LA043", telefone: "+244 912 345 678", email: "carlos.mendes@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito", cursoOpcao2: "Gestão",
    estado: "pendente", dataSubmissao: "2025-01-12",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0002", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-01-12", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-20", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c3", nome: "Débora Cristina Sousa", bi: "009456789LA044", telefone: "+244 934 567 890", email: "debora.sousa@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática",
    estado: "pendente", dataSubmissao: "2025-01-08",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0003", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-01-08", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-20", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c4", nome: "Emanuel Francisco Neto", bi: "010567890LA045", telefone: "+244 945 678 901", email: "emanuel.neto@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Gestão", cursoOpcao2: "Direito", cursoOpcao3: "Arquitectura",
    estado: "pendente", dataSubmissao: "2025-01-05",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0004", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-01-05", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-18", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c5", nome: "Francisca Gomes de Almeida", bi: "011678901LA046", telefone: "+244 956 789 012", email: "francisca.almeida@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina",
    estado: "pendente", dataSubmissao: "2025-01-03",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0005", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-01-03", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-15", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c6", nome: "Gilberto Henriques Tavares", bi: "012789012LA047", telefone: "+244 967 890 123", email: "gilberto.tavares@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Arquitectura", cursoOpcao2: "Engenharia Informática",
    estado: "pendente", dataSubmissao: "2025-01-02",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0006", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-01-02", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-14", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c15", nome: "Patrícia Vanessa Teixeira", bi: "021678901LA056", telefone: "+244 966 789 012", email: "patricia.teixeira@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Gestão", cursoOpcao2: "Direito",
    estado: "pendente", dataSubmissao: "2025-03-05",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0015", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2025-03-05", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-03-18", responsavel: "Maria Lopes" },
    ],
    sessaoProvaId: "s3",
  },

  // APROVADO - passed exam
  {
    id: "c9", nome: "Joana Luísa Monteiro", bi: "015012345LA050", telefone: "+244 990 123 456", email: "joana.monteiro@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina", cursoOpcao2: "Direito",
    estado: "aprovado", dataSubmissao: "2024-12-10",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0009", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-10", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2024-12-22", responsavel: "Maria Lopes" },
      { de: "pendente", para: "aprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 15,
    sessaoProvaId: "s1",
  },
  {
    id: "c10", nome: "Kevin Manuel da Silva", bi: "016123456LA051", telefone: "+244 911 234 567", email: "kevin.silva@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Gestão",
    estado: "aprovado", dataSubmissao: "2024-12-08",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0010", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-08", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2024-12-20", responsavel: "Maria Lopes" },
      { de: "pendente", para: "aprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 12,
    sessaoProvaId: "s1",
  },
  {
    id: "c7", nome: "Helena Isabel Correia", bi: "013890123LA048", telefone: "+244 978 901 234", email: "helena.correia@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito",
    estado: "aprovado", dataSubmissao: "2024-12-20",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0007", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-20", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-05", responsavel: "Maria Lopes" },
      { de: "pendente", para: "aprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 14,
    sessaoProvaId: "s1",
  },

  // REPROVADO - failed exam
  {
    id: "c11", nome: "Luísa Fernanda Pacheco", bi: "017234567LA052", telefone: "+244 922 345 678", email: "luisa.pacheco@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito", cursoOpcao2: "Gestão",
    estado: "reprovado", dataSubmissao: "2024-12-05",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0011", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-05", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2024-12-18", responsavel: "Maria Lopes" },
      { de: "pendente", para: "reprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 7,
    sessaoProvaId: "s1",
  },
  {
    id: "c8", nome: "Inocêncio José Baptista", bi: "014901234LA049", telefone: "+244 989 012 345", email: "inocencio.baptista@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática", cursoOpcao2: "Gestão",
    estado: "reprovado", dataSubmissao: "2024-12-18",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0008", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-18", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2025-01-03", responsavel: "Maria Lopes" },
      { de: "pendente", para: "reprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 5,
    sessaoProvaId: "s1",
  },
  {
    id: "c14", nome: "Orlando Sebastião Vunge", bi: "020567890LA055", telefone: "+244 955 678 901", email: "orlando.vunge@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática",
    estado: "reprovado", dataSubmissao: "2024-12-15",
    documentos: allDocs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0014", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "incompleto", data: "2024-12-15", responsavel: "Sistema" },
      { de: "incompleto", para: "pendente", data: "2024-12-28", responsavel: "Maria Lopes" },
      { de: "pendente", para: "reprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 8,
    sessaoProvaId: "s1",
  },
];

// 3 General exam sessions
export const sessoesProva: SessaoProva[] = [
  {
    id: "s1",
    nome: "Prova de Acesso Geral — 1ª Sessão",
    data: "2025-01-20",
    hora: "09:00",
    sala: "Anfiteatro A",
    capacidadeMax: 50,
    candidatosIds: ["c7", "c8", "c9", "c10", "c11", "c14"],
    periodo: "1ª Chamada 2025",
  },
  {
    id: "s2",
    nome: "Prova de Acesso Geral — 2ª Sessão",
    data: "2025-03-28",
    hora: "09:00",
    sala: "Anfiteatro B",
    capacidadeMax: 40,
    candidatosIds: ["c2", "c3", "c4", "c5", "c6"],
    periodo: "1ª Chamada 2025",
  },
  {
    id: "s3",
    nome: "Prova de Acesso Geral — 3ª Sessão",
    data: "2025-06-15",
    hora: "14:00",
    sala: "Sala Magna",
    capacidadeMax: 60,
    candidatosIds: ["c15"],
    periodo: "2ª Chamada 2025",
  },
];
