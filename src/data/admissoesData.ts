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

export const candidaturas: Candidatura[] = [];

export const sessoesProva: SessaoProva[] = [];

