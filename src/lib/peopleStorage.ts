// Shared localStorage helpers for staff and docentes,
// so the Configurador can pull dropdown options from what the user has registered.

export type StaffRow = {
  id: string;
  prefixo: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto: string;
  departamento: string;
  funcao: string;
  moduloKortex: string;
  editing?: boolean;
};

export type Grau = "Licenciatura" | "Mestrado" | "Doutoramento" | "Agregação";

export type DocenteRow = {
  id: string;
  prefixo: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  contacto: string;
  faculdade: string;
  departamento?: string;
  categoria: string; // Assistente, Auxiliar, Associado, Catedrático, Convidado
  cargo: string;     // Docente, Coordenador, Decano, Diretor
  // Identification
  nascimento?: string;
  genero?: "M" | "F" | "Outro";
  bilhete?: string;
  bilheteFileName?: string;
  fotoDataUrl?: string;
  // Address
  provincia?: string;
  municipio?: string;
  endereco?: string;
  contrato?: "Permanente" | "Prestador";
  // Academic profile
  grau?: Grau;
  especialidade?: string;
  instituicaoFormacao?: string;
  anosExperiencia?: string;
  cvFileName?: string;
  diplomaFileName?: string;
  editing?: boolean;
};

export const DEPARTAMENTOS_POOL = [
  "Académica",
  "Finanças",
  "GAP",
  "TI",
  "Recursos Humanos",
  "Manutenção",
  "Biblioteca",
  "Investigação",
];


const STAFF_KEY = "upra_admin_staff_v1";
const DOCENTES_KEY = "upra_admin_docentes_v1";

export const loadStaff = (): StaffRow[] => {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffRow[]) : [];
  } catch { return []; }
};
export const saveStaff = (rows: StaffRow[]) => {
  try { localStorage.setItem(STAFF_KEY, JSON.stringify(rows.map(({ editing: _e, ...r }) => r))); } catch {/* noop */}
};

export const loadDocentes = (): DocenteRow[] => {
  try {
    const raw = localStorage.getItem(DOCENTES_KEY);
    return raw ? (JSON.parse(raw) as DocenteRow[]) : [];
  } catch { return []; }
};
export const saveDocentes = (rows: DocenteRow[]) => {
  try { localStorage.setItem(DOCENTES_KEY, JSON.stringify(rows.map(({ editing: _e, ...r }) => r))); } catch {/* noop */}
};

export const fullName = (p: { prefixo?: string; primeiroNome: string; ultimoNome: string }) =>
  `${p.prefixo ? p.prefixo + " " : ""}${p.primeiroNome} ${p.ultimoNome}`.trim();
