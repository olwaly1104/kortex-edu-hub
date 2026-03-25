export type EstadoCandidatura = "pendente" | "docs_aprovados" | "convocado" | "aguarda_resultados" | "aprovado" | "reprovado" | "desistiu";

export const estadoColors: Record<EstadoCandidatura, string> = {
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  docs_aprovados: "bg-blue-100 text-blue-800 border-blue-200",
  convocado: "bg-purple-100 text-purple-800 border-purple-200",
  aguarda_resultados: "bg-orange-100 text-orange-800 border-orange-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  reprovado: "bg-red-100 text-red-800 border-red-200",
  desistiu: "bg-gray-100 text-gray-600 border-gray-200",
};

export const estadoLabels: Record<EstadoCandidatura, string> = {
  pendente: "Pendente",
  docs_aprovados: "Docs Aprovados",
  convocado: "Convocado",
  aguarda_resultados: "Aguarda Resultados",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  desistiu: "Desistiu",
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
  data: string;
  hora: string;
  sala: string;
  curso: string;
  capacidadeMax: number;
  candidatosIds: string[];
}

export const periodos = ["1ª Chamada 2025", "2ª Chamada 2025"];
export const cursos = ["Direito", "Gestão", "Engenharia Informática", "Medicina", "Arquitectura"];

const documentosBase: DocumentoCandidatura[] = [
  { nome: "Bilhete de Identidade", entregue: true, aprovado: null },
  { nome: "Certificado do Ensino Médio", entregue: true, aprovado: null },
  { nome: "Declaração de Notas", entregue: true, aprovado: null },
  { nome: "Atestado Médico", entregue: false, aprovado: null },
  { nome: "2 Fotografias tipo passe", entregue: true, aprovado: null },
];

function docs(overrides?: Partial<Record<number, Partial<DocumentoCandidatura>>>): DocumentoCandidatura[] {
  return documentosBase.map((d, i) => ({ ...d, ...(overrides?.[i] || {}) }));
}

export const candidaturas: Candidatura[] = [
  {
    id: "c1", nome: "Ana Beatriz Domingos", bi: "007234567LA042", telefone: "+244 923 456 789", email: "ana.domingos@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina", cursoOpcao2: "Engenharia Informática",
    estado: "pendente", dataSubmissao: "2025-01-15",
    documentos: docs({ 3: { entregue: false } }),
    pagamento: { estado: "pendente", referencia: "REF-2025-0001", valor: 15000, comprovativo: false },
    historico: [{ de: "início", para: "pendente", data: "2025-01-15", responsavel: "Sistema" }],
  },
  {
    id: "c2", nome: "Carlos Eduardo Mendes", bi: "008345678LA043", telefone: "+244 912 345 678", email: "carlos.mendes@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito", cursoOpcao2: "Gestão",
    estado: "pendente", dataSubmissao: "2025-01-12",
    documentos: docs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0002", valor: 15000, comprovativo: true },
    historico: [{ de: "início", para: "pendente", data: "2025-01-12", responsavel: "Sistema" }],
  },
  {
    id: "c3", nome: "Débora Cristina Sousa", bi: "009456789LA044", telefone: "+244 934 567 890", email: "debora.sousa@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática",
    estado: "docs_aprovados", dataSubmissao: "2025-01-08",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0003", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2025-01-08", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-20", responsavel: "Maria Lopes" },
    ],
  },
  {
    id: "c4", nome: "Emanuel Francisco Neto", bi: "010567890LA045", telefone: "+244 945 678 901", email: "emanuel.neto@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Gestão", cursoOpcao2: "Direito", cursoOpcao3: "Arquitectura",
    estado: "docs_aprovados", dataSubmissao: "2025-01-05",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0004", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2025-01-05", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-18", responsavel: "Maria Lopes" },
    ],
  },
  {
    id: "c5", nome: "Francisca Gomes de Almeida", bi: "011678901LA046", telefone: "+244 956 789 012", email: "francisca.almeida@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina",
    estado: "convocado", dataSubmissao: "2025-01-03",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0005", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2025-01-03", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-15", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    sessaoProvaId: "s1",
  },
  {
    id: "c6", nome: "Gilberto Henriques Tavares", bi: "012789012LA047", telefone: "+244 967 890 123", email: "gilberto.tavares@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Arquitectura", cursoOpcao2: "Engenharia Informática",
    estado: "convocado", dataSubmissao: "2025-01-02",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0006", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2025-01-02", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-14", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-24", responsavel: "João Santos" },
    ],
    sessaoProvaId: "s2",
  },
  {
    id: "c7", nome: "Helena Isabel Correia", bi: "013890123LA048", telefone: "+244 978 901 234", email: "helena.correia@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito",
    estado: "aguarda_resultados", dataSubmissao: "2024-12-20",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0007", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-20", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-05", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-15", responsavel: "João Santos" },
      { de: "convocado", para: "aguarda_resultados", data: "2025-02-01", responsavel: "Sistema" },
    ],
    sessaoProvaId: "s3",
  },
  {
    id: "c8", nome: "Inocêncio José Baptista", bi: "014901234LA049", telefone: "+244 989 012 345", email: "inocencio.baptista@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática", cursoOpcao2: "Gestão",
    estado: "aguarda_resultados", dataSubmissao: "2024-12-18",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0008", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-18", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-01-03", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-13", responsavel: "João Santos" },
      { de: "convocado", para: "aguarda_resultados", data: "2025-02-01", responsavel: "Sistema" },
    ],
    sessaoProvaId: "s3",
  },
  {
    id: "c9", nome: "Joana Luísa Monteiro", bi: "015012345LA050", telefone: "+244 990 123 456", email: "joana.monteiro@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Medicina", cursoOpcao2: "Direito",
    estado: "aprovado", dataSubmissao: "2024-12-10",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0009", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-10", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2024-12-22", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-05", responsavel: "João Santos" },
      { de: "convocado", para: "aguarda_resultados", data: "2025-01-20", responsavel: "Sistema" },
      { de: "aguarda_resultados", para: "aprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 15,
    sessaoProvaId: "s3",
  },
  {
    id: "c10", nome: "Kevin Manuel da Silva", bi: "016123456LA051", telefone: "+244 911 234 567", email: "kevin.silva@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Gestão",
    estado: "aprovado", dataSubmissao: "2024-12-08",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0010", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-08", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2024-12-20", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-04", responsavel: "João Santos" },
      { de: "convocado", para: "aguarda_resultados", data: "2025-01-20", responsavel: "Sistema" },
      { de: "aguarda_resultados", para: "aprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 12,
    sessaoProvaId: "s3",
  },
  {
    id: "c11", nome: "Luísa Fernanda Pacheco", bi: "017234567LA052", telefone: "+244 922 345 678", email: "luisa.pacheco@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Direito", cursoOpcao2: "Gestão",
    estado: "reprovado", dataSubmissao: "2024-12-05",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0011", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-05", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2024-12-18", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "convocado", data: "2025-01-04", responsavel: "João Santos" },
      { de: "convocado", para: "aguarda_resultados", data: "2025-01-20", responsavel: "Sistema" },
      { de: "aguarda_resultados", para: "reprovado", data: "2025-01-25", responsavel: "João Santos" },
    ],
    nota: 7,
    sessaoProvaId: "s3",
  },
  {
    id: "c12", nome: "Miguel Ângelo Pereira", bi: "018345678LA053", telefone: "+244 933 456 789", email: "miguel.pereira@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Arquitectura", cursoOpcao2: "Engenharia Informática",
    estado: "pendente", dataSubmissao: "2025-03-10",
    documentos: docs({ 2: { entregue: false }, 3: { entregue: false } }),
    pagamento: { estado: "pendente", referencia: "REF-2025-0012", valor: 15000, comprovativo: false },
    historico: [{ de: "início", para: "pendente", data: "2025-03-10", responsavel: "Sistema" }],
  },
  {
    id: "c13", nome: "Natália Rosa Queiroz", bi: "019456789LA054", telefone: "+244 944 567 890", email: "natalia.queiroz@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Medicina",
    estado: "pendente", dataSubmissao: "2025-03-08",
    documentos: docs(),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0013", valor: 15000, comprovativo: true },
    historico: [{ de: "início", para: "pendente", data: "2025-03-08", responsavel: "Sistema" }],
  },
  {
    id: "c14", nome: "Orlando Sebastião Vunge", bi: "020567890LA055", telefone: "+244 955 678 901", email: "orlando.vunge@email.ao",
    periodo: "1ª Chamada 2025", cursoOpcao1: "Engenharia Informática",
    estado: "desistiu", dataSubmissao: "2024-12-15",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0014", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2024-12-15", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2024-12-28", responsavel: "Maria Lopes" },
      { de: "docs_aprovados", para: "desistiu", data: "2025-01-10", responsavel: "Sistema" },
    ],
  },
  {
    id: "c15", nome: "Patrícia Vanessa Teixeira", bi: "021678901LA056", telefone: "+244 966 789 012", email: "patricia.teixeira@email.ao",
    periodo: "2ª Chamada 2025", cursoOpcao1: "Gestão", cursoOpcao2: "Direito",
    estado: "docs_aprovados", dataSubmissao: "2025-03-05",
    documentos: docs({ 0: { aprovado: true }, 1: { aprovado: true }, 2: { aprovado: true }, 3: { entregue: true, aprovado: true }, 4: { aprovado: true } }),
    pagamento: { estado: "confirmado", referencia: "REF-2025-0015", valor: 15000, comprovativo: true },
    historico: [
      { de: "início", para: "pendente", data: "2025-03-05", responsavel: "Sistema" },
      { de: "pendente", para: "docs_aprovados", data: "2025-03-18", responsavel: "Maria Lopes" },
    ],
  },
];

export const sessoesProva: SessaoProva[] = [
  {
    id: "s1",
    data: "2025-03-28",
    hora: "09:00",
    sala: "Anfiteatro A",
    curso: "Medicina",
    capacidadeMax: 40,
    candidatosIds: ["c5"],
  },
  {
    id: "s2",
    data: "2025-03-30",
    hora: "14:00",
    sala: "Sala 205",
    curso: "Arquitectura",
    capacidadeMax: 30,
    candidatosIds: ["c6"],
  },
  {
    id: "s3",
    data: "2025-01-20",
    hora: "09:00",
    sala: "Anfiteatro B",
    curso: "Direito",
    capacidadeMax: 50,
    candidatosIds: ["c7", "c8", "c9", "c10", "c11"],
  },
];
