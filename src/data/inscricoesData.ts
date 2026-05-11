export interface InscricaoRecord {
  ref: string;
  nome: string;
  bi: string;
  nascimento: string;
  genero: string;
  naturalidade: string;
  nacionalidade: string;
  email: string;
  telemovel: string;
  provincia: string;
  municipio: string;
  endereco: string;
  encNome: string;
  encBi: string;
  encParentesco: string;
  encTelefone: string;
  encEmail: string;
  escola: string;
  tipoEnsino: string;
  anoConclusao: string;
  mediaFinal: string;
  faculdade: string;
  curso: string;
  curso2?: string;
  sessao: string;
  data: string;
  estado: "Submetida" | "Em análise" | "Aprovada" | "Reprovada";
  documentos: { key: string; label: string; entregue: boolean; ficheiro?: string }[];
}

const baseDocs = (entreguesAll = true) => [
  { key: "bi", label: "Bilhete de Identidade", entregue: entreguesAll, ficheiro: entreguesAll ? "bi.pdf" : undefined },
  { key: "notas", label: "Declaração de Notas", entregue: entreguesAll, ficheiro: entreguesAll ? "declaracao_notas.pdf" : undefined },
  { key: "certidao", label: "Certidão de Habilitações", entregue: entreguesAll, ficheiro: entreguesAll ? "certidao.pdf" : undefined },
  { key: "foto", label: "Foto tipo passe", entregue: entreguesAll, ficheiro: entreguesAll ? "foto.jpg" : undefined },
  { key: "pagamento", label: "Comprovativo de Pagamento", entregue: entreguesAll, ficheiro: entreguesAll ? "comprovativo.pdf" : undefined },
];

export const inscricoesRecent: InscricaoRecord[] = [
  {
    ref: "CAND-2026-1042", nome: "Joana Pedro Lopes", bi: "006543219LA041", nascimento: "2007-03-12",
    genero: "Feminino", naturalidade: "Luanda", nacionalidade: "Angolana",
    email: "joana.lopes@email.ao", telemovel: "+244 923 145 678",
    provincia: "Luanda", municipio: "Belas", endereco: "Rua das Acácias, 12",
    encNome: "Pedro Manuel Lopes", encBi: "990123456LA021", encParentesco: "Pai",
    encTelefone: "+244 923 999 111", encEmail: "pedro.lopes@email.ao",
    escola: "Colégio São José de Cluny", tipoEnsino: "Ensino Médio",
    anoConclusao: "2025", mediaFinal: "16.4",
    faculdade: "Faculdade de Ciências Exatas", curso: "Arquitectura", curso2: "Engenharia Civil",
    sessao: "1ª Sessão", data: "2026-05-11 09:42", estado: "Submetida",
    documentos: baseDocs(true),
  },
  {
    ref: "CAND-2026-1041", nome: "Miguel António Silva", bi: "007123456LA042", nascimento: "2006-11-04",
    genero: "Masculino", naturalidade: "Benguela", nacionalidade: "Angolana",
    email: "miguel.silva@email.ao", telemovel: "+244 924 222 333",
    provincia: "Benguela", municipio: "Lobito", endereco: "Av. da Independência, 88",
    encNome: "António José Silva", encBi: "880555444LA011", encParentesco: "Pai",
    encTelefone: "+244 925 111 222", encEmail: "antonio.silva@email.ao",
    escola: "Instituto Médio Politécnico do Lobito", tipoEnsino: "Ensino Técnico",
    anoConclusao: "2025", mediaFinal: "15.2",
    faculdade: "Faculdade de Ciências Exatas", curso: "Engenharia Informática",
    sessao: "1ª Sessão", data: "2026-05-11 09:18", estado: "Submetida",
    documentos: baseDocs(true),
  },
  {
    ref: "CAND-2026-1040", nome: "Carla Manuel Sebastião", bi: "008234567LA043", nascimento: "2007-07-22",
    genero: "Feminino", naturalidade: "Huambo", nacionalidade: "Angolana",
    email: "carla.sebastiao@email.ao", telemovel: "+244 926 333 444",
    provincia: "Huambo", municipio: "Huambo", endereco: "Bairro Académico, casa 15",
    encNome: "Maria Sebastião", encBi: "770444333LA009", encParentesco: "Mãe",
    encTelefone: "+244 927 222 333", encEmail: "maria.sebastiao@email.ao",
    escola: "Liceu Diogo Cão", tipoEnsino: "Ensino Médio",
    anoConclusao: "2025", mediaFinal: "14.8",
    faculdade: "Faculdade de Ciências Sociais", curso: "Direito",
    sessao: "2ª Sessão", data: "2026-05-11 08:55", estado: "Submetida",
    documentos: baseDocs(true),
  },
  {
    ref: "CAND-2026-1039", nome: "Rui Domingos Cardoso", bi: "009345678LA044", nascimento: "2006-02-18",
    genero: "Masculino", naturalidade: "Luanda", nacionalidade: "Angolana",
    email: "rui.cardoso@email.ao", telemovel: "+244 928 444 555",
    provincia: "Luanda", municipio: "Luanda", endereco: "Rua Amílcar Cabral, 200",
    encNome: "Domingos Cardoso", encBi: "660333222LA008", encParentesco: "Pai",
    encTelefone: "+244 929 333 444", encEmail: "domingos.cardoso@email.ao",
    escola: "Colégio Externato São José", tipoEnsino: "Ensino Médio",
    anoConclusao: "2024", mediaFinal: "17.1",
    faculdade: "Faculdade de Saúde", curso: "Medicina", curso2: "Enfermagem",
    sessao: "1ª Sessão", data: "2026-05-10 17:31", estado: "Submetida",
    documentos: baseDocs(true),
  },
  {
    ref: "CAND-2026-1038", nome: "Ana Clara Vunge", bi: "010456789LA045", nascimento: "2007-09-30",
    genero: "Feminino", naturalidade: "Cabinda", nacionalidade: "Angolana",
    email: "ana.vunge@email.ao", telemovel: "+244 930 555 666",
    provincia: "Cabinda", municipio: "Cabinda", endereco: "Rua Marginal, 7",
    encNome: "Clara Vunge", encBi: "550222111LA007", encParentesco: "Mãe",
    encTelefone: "+244 931 444 555", encEmail: "clara.vunge@email.ao",
    escola: "Colégio Esperança", tipoEnsino: "Ensino Médio",
    anoConclusao: "2025", mediaFinal: "13.9",
    faculdade: "Faculdade de Ciências Sociais", curso: "Economia", curso2: "Gestão",
    sessao: "2ª Sessão", data: "2026-05-10 16:04", estado: "Submetida",
    documentos: baseDocs(true),
  },
  {
    ref: "CAND-2026-1037", nome: "Pedro Manuel Nzinga", bi: "011567890LA046", nascimento: "2006-05-14",
    genero: "Masculino", naturalidade: "Malanje", nacionalidade: "Angolana",
    email: "pedro.nzinga@email.ao", telemovel: "+244 932 666 777",
    provincia: "Malanje", municipio: "Malanje", endereco: "Bairro da Vitória, 33",
    encNome: "Manuel Nzinga", encBi: "440111000LA006", encParentesco: "Pai",
    encTelefone: "+244 933 555 666", encEmail: "manuel.nzinga@email.ao",
    escola: "Instituto Médio Comercial", tipoEnsino: "Ensino Técnico",
    anoConclusao: "2024", mediaFinal: "12.7",
    faculdade: "Faculdade de Ciências Sociais", curso: "Gestão",
    sessao: "3ª Sessão", data: "2026-05-10 15:22", estado: "Submetida",
    documentos: baseDocs(true),
  },
];
