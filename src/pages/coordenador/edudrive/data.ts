import { DriveNode, DriveFile, FileStatus, Frequency, Notification, RecentItem, PinnedItem } from "./types";

let _id = 0;
const uid = () => `n${_id++}`;
const fid = () => `f${_id++}`;

// Status logic: Sep 2025 - Mar 2026 = gerado, Apr 2026+ = agendado
const months = [
  { label: "Janeiro 2026", short: "Jan 2026", status: "gerado" as FileStatus },
  { label: "Fevereiro 2026", short: "Fev 2026", status: "gerado" as FileStatus },
  { label: "Março 2026", short: "Mar 2026", status: "gerado" as FileStatus },
  { label: "Abril 2026", short: "Abr 2026", status: "agendado" as FileStatus },
  { label: "Maio 2026", short: "Mai 2026", status: "agendado" as FileStatus },
  { label: "Junho 2026", short: "Jun 2026", status: "agendado" as FileStatus },
  { label: "Julho 2026", short: "Jul 2026", status: "agendado" as FileStatus },
  { label: "Agosto 2026", short: "Ago 2026", status: "agendado" as FileStatus },
  { label: "Setembro 2026", short: "Set 2026", status: "agendado" as FileStatus },
  { label: "Outubro 2026", short: "Out 2026", status: "agendado" as FileStatus },
  { label: "Novembro 2026", short: "Nov 2026", status: "agendado" as FileStatus },
  { label: "Dezembro 2026", short: "Dez 2026", status: "agendado" as FileStatus },
];

const mkFile = (name: string, freq: Frequency, status: FileStatus, type: "pdf" | "csv" = "pdf", size?: string): DriveFile => ({
  id: fid(), name, fileType: type, frequency: freq, status, size: size || (freq === "anual" ? "1.2 MB" : freq === "semestral" ? "456 KB" : "178 KB"),
  generatedAt: status === "gerado" ? "15 Mar 2026" : undefined,
});

const mkDoc = (name: string, type: "pdf" | "docx" | "xlsx" = "pdf", size = "234 KB"): DriveFile => ({
  id: fid(), name, fileType: type, status: "gerado", size, isDocument: true,
  uploadedBy: "Prof. Manuel Domingos", generatedAt: "01 Set 2025", version: 1,
});

// ─── Flat monthly files: one file per month with month label ─────
const flatMonthlyFiles = (baseName: string, type: "pdf" | "csv" = "pdf"): DriveFile[] =>
  months.map(m => mkFile(`${baseName} — ${m.label}`, "mensal", m.status, type));

// ─── Flat semestral files ────────────────────────────────
const flatSemestralFiles = (baseName: string, type: "pdf" | "csv" = "pdf"): DriveFile[] => [
  mkFile(`${baseName} — Semestre 1`, "semestral", "gerado", type),
  mkFile(`${baseName} — Semestre 2`, "semestral", "agendado", type),
];

// ─── Standard frequency node (Mensal/Semestral/Anual with flat files) ───
const mkFrequencyNode = (fileSpecs: { name: string; type?: "pdf" | "csv" }[]): DriveNode[] => [
  {
    id: uid(), name: "Mensal",
    files: fileSpecs.flatMap(s => flatMonthlyFiles(s.name, s.type || "pdf")),
  },
  {
    id: uid(), name: "Semestral",
    files: fileSpecs.flatMap(s => flatSemestralFiles(s.name, s.type || "pdf")),
  },
  {
    id: uid(), name: "Anual",
    files: fileSpecs.map(s => mkFile(s.name, "anual", "agendado", s.type || "pdf")),
  },
];

// ─── Desempenho Académico ───────────────────────────────
const courseReportNames = [
  "Relatório de Desempenho Geral",
  "Desempenho por Cadeiras",
  "Desempenho por Docente",
  "Estudantes em Risco",
  "Quadro de Honra",
];

const mkReportWithFrequency = (name: string): DriveNode => ({
  id: uid(), name, children: mkFrequencyNode([{ name }]),
});

const desempenhoTurmaSpecs = [
  { name: "Desempenho da Turma" },
  { name: "Estudantes em Risco" },
  { name: "Assiduidade", type: "csv" as const },
];

const desempenhoTurmaSemSpecs = [
  { name: "Desempenho da Turma" },
  { name: "Notas e Aprovações" },
  { name: "Estudantes em Risco" },
  { name: "Assiduidade", type: "csv" as const },
  { name: "Avaliações e Tarefas" },
];

const mkDesempenhoTurma = (turma: string): DriveNode => ({
  id: uid(), name: turma, children: [
    { id: uid(), name: "Mensal", files: desempenhoTurmaSpecs.flatMap(s => flatMonthlyFiles(s.name, s.type || "pdf")) },
    { id: uid(), name: "Semestral", files: desempenhoTurmaSemSpecs.flatMap(s => flatSemestralFiles(s.name, s.type || "pdf")) },
    { id: uid(), name: "Anual", files: [
      mkFile("Desempenho da Turma", "anual", "agendado"), mkFile("Notas e Aprovações", "anual", "agendado"),
      mkFile("Estudantes em Risco", "anual", "agendado"), mkFile("Assiduidade", "anual", "agendado", "csv"),
      mkFile("Avaliações e Tarefas", "anual", "agendado"), mkFile("Progressão dos Estudantes", "anual", "agendado"),
    ]},
  ],
});

const mkDesempenhoAno = (ano: string): DriveNode => ({
  id: uid(), name: `${ano} — Curso de Arquitectura`,
  children: [
    { id: uid(), name: `Relatórios de Desempenho Académico do ${ano}`, children: courseReportNames.map(mkReportWithFrequency) },
    ...["Turma A", "Turma B", "Turma C"].map(mkDesempenhoTurma),
  ],
});

const desempenhoAcademico: DriveNode = {
  id: uid(), name: "Desempenho Académico", icon: "bar-chart",
  children: [
    { id: uid(), name: "Relatórios de Desempenho Académico do Curso", children: courseReportNames.map(mkReportWithFrequency) },
    ...["1º Ano", "2º Ano", "3º Ano"].map(mkDesempenhoAno),
  ],
};

// ─── Cadeiras do Curso ──────────────────────────────────
const subjectsByYear: Record<string, string[]> = {
  "1º Ano": ["Matemática I", "Física I", "Introdução à Programação", "Álgebra Linear", "Lógica Computacional"],
  "2º Ano": ["Estruturas de Dados", "Bases de Dados", "Redes de Computadores", "Engenharia de Software", "Sistemas Operativos"],
  "3º Ano": ["Inteligência Artificial", "Segurança Informática", "Computação em Nuvem", "Projecto Final", "Estatística Aplicada"],
};

const mkCadeira = (name: string): DriveNode => ({
  id: uid(), name, children: mkFrequencyNode([
    { name: "Relatório da Cadeira" },
    { name: "Assiduidade", type: "csv" },
    { name: "Notas e Resultados" },
    { name: "Avaliações e Tarefas", type: "csv" },
  ]),
});

const cadeirasDoCurso: DriveNode = {
  id: uid(), name: "Cadeiras do Curso", icon: "book-open",
  children: ["1º Ano", "2º Ano", "3º Ano"].map(ano => ({
    id: uid(), name: `${ano} — Curso de Arquitectura`, children: (subjectsByYear[ano] || []).map(mkCadeira),
  })),
};

// ─── Docentes do Curso ──────────────────────────────────
const teachersByYear: Record<string, string[]> = {
  "1º Ano": ["Prof. António Silva", "Prof. Maria Santos", "Prof. João Ferreira"],
  "2º Ano": ["Prof. Ana Domingos", "Prof. Carlos Mendes", "Prof. Teresa Costa"],
  "3º Ano": ["Prof. Manuel Oliveira", "Prof. Rosa Nascimento", "Prof. Pedro Gonçalves"],
};

const mkDocente = (name: string): DriveNode => ({
  id: uid(), name, children: mkFrequencyNode([
    { name: "Relatório do Docente" },
    { name: "Assiduidade", type: "csv" },
    { name: "Desempenho das Turmas" },
    { name: "Carga Horária", type: "csv" },
  ]),
});

const docentesDoCurso: DriveNode = {
  id: uid(), name: "Docentes do Curso", icon: "users",
  children: ["1º Ano", "2º Ano", "3º Ano"].map(ano => ({
    id: uid(), name: ano, children: (teachersByYear[ano] || []).map(mkDocente),
  })),
};

// ─── Estudantes do Curso ────────────────────────────────
const studentsByYear: Record<string, string[]> = {
  "1º Ano": ["Ana Tchissola", "João Cambuta", "Maria Fernandes", "Carlos Lopes", "Teresa Neto", "Pedro Domingos", "Rosa Manuel", "António Gaspar", "Francisca Tavares", "Bruno Sebastião"],
  "2º Ano": ["Marta Zola", "José Mateus", "Luísa Pinto", "Ricardo Gomes", "Beatriz Sousa", "Nelson Kiala", "Carla Esteves", "David Quintas", "Sofia Brito", "Miguel Afonso"],
  "3º Ano": ["Inês Cardoso", "Paulo Teixeira", "Diana Nascimento", "Hugo Baptista", "Vera Gonçalves", "André Silvestre", "Cláudia Ramos", "Filipe Almeida", "Raquel Santos", "Tomás Costa"],
};

const mkEstudante = (name: string): DriveNode => ({
  id: uid(), name, children: mkFrequencyNode([
    { name: "Relatório do Estudante" },
    { name: "Assiduidade", type: "csv" },
    { name: "Notas" },
    { name: "Situação Financeira" },
  ]),
});

const estudantesDoCurso: DriveNode = {
  id: uid(), name: "Estudantes do Curso", icon: "graduation-cap",
  children: ["1º Ano", "2º Ano", "3º Ano"].map(ano => ({
    id: uid(), name: ano, children: (studentsByYear[ano] || []).map(mkEstudante),
  })),
};

// ─── Finanças do Curso ──────────────────────────────────
const financasDoCurso: DriveNode = {
  id: uid(), name: "Finanças do Curso", icon: "wallet",
  children: mkFrequencyNode([
    { name: "Relatório Financeiro do Curso" },
    { name: "Estudantes em Risco Financeiro" },
    { name: "Multas Aplicadas do Curso" },
    { name: "Tabela de Multas", type: "csv" },
  ]),
};

// ─── Documentos do Curso ────────────────────────────────
const documentosDoCurso: DriveNode = {
  id: uid(), name: "Documentos do Curso", icon: "file-text", isDocumentFolder: true,
  children: [
    { id: uid(), name: "Estrutura Curricular", isDocumentFolder: true, files: [
      mkDoc("Plano Curricular"), mkDoc("Matriz Curricular"), mkDoc("Ementas das Cadeiras"),
      mkDoc("Mapa de Pré-requisitos"), mkDoc("Carga Horária por Cadeira", "xlsx", "156 KB"),
    ]},
    { id: uid(), name: "Calendário e Planeamento", isDocumentFolder: true, files: [
      mkDoc("Calendário Académico"), mkDoc("Calendário de Avaliações"), mkDoc("Calendário de Exames"),
      mkDoc("Plano de Actividades do Curso"),
    ]},
    { id: uid(), name: "Regulamentos e Normas", isDocumentFolder: true, files: [
      mkDoc("Regulamento do Curso"), mkDoc("Critérios de Aprovação e Reprovação"), mkDoc("Política de Assiduidade"),
      mkDoc("Política de Avaliações"), mkDoc("Código de Conduta"), mkDoc("Política de Plágio"),
    ]},
    { id: uid(), name: "Guias", isDocumentFolder: true, files: [
      mkDoc("Guia do Estudante"), mkDoc("Guia do Docente"), mkDoc("Guia de Avaliações"),
      mkDoc("Guia de Tarefas"), mkDoc("Guia de Estágio"),
    ]},
    { id: uid(), name: "Acreditação e Qualidade", isDocumentFolder: true, files: [
      mkDoc("Ficha de Acreditação do Curso"), mkDoc("Relatório de Auto-Avaliação"),
      mkDoc("Plano de Melhoria do Curso"), mkDoc("Indicadores de Qualidade"),
    ]},
    { id: uid(), name: "Templates", isDocumentFolder: true, files: [
      mkDoc("Template de Plano de Aulas", "docx", "89 KB"), mkDoc("Template de Pauta de Notas", "xlsx", "67 KB"),
      mkDoc("Template de Relatório de Docente", "docx", "123 KB"), mkDoc("Template de Avaliação de Desempenho", "docx", "98 KB"),
    ]},
  ],
};

// ─── Root Tree ──────────────────────────────────────────
export const driveTree: DriveNode[] = [
  desempenhoAcademico, cadeirasDoCurso, docentesDoCurso, estudantesDoCurso, financasDoCurso, documentosDoCurso,
];

// ─── Collect all files ──────────────────────────────────
function collectAll(n: DriveNode): DriveFile[] {
  return [...(n.files || []), ...(n.children || []).flatMap(collectAll)];
}
export const allFiles = driveTree.flatMap(collectAll);

// ─── Seed: Notifications ────────────────────────────────
export const seedNotifications: Notification[] = [
  { id: "notif1", message: "Relatório de Desempenho da Turma A — 1º Ano gerado", reportName: "Desempenho da Turma", createdAt: "Há 2 horas", read: false },
  { id: "notif2", message: "Relatório Financeiro de Março 2026 gerado", reportName: "Relatório Financeiro do Curso", createdAt: "Há 5 horas", read: false },
  { id: "notif3", message: "Assiduidade de Fevereiro 2026 gerado para todos os docentes", reportName: "Assiduidade", createdAt: "Há 1 dia", read: true },
];

// ─── Seed: Recent Items ────────────────────────────────
export const seedRecent: RecentItem[] = [
  { file: { id: "r1", name: "Desempenho da Turma A — Janeiro 2026", fileType: "pdf", frequency: "mensal", status: "gerado", size: "245 KB", generatedAt: "15 Jan 2026" }, pathLabel: "1º Ano › Turma A › Mensal", openedAt: "Há 30 min" },
  { file: { id: "r2", name: "Notas e Aprovações — Semestre 1", fileType: "pdf", frequency: "semestral", status: "gerado", size: "567 KB", generatedAt: "28 Fev 2026" }, pathLabel: "2º Ano › Turma B › Semestral", openedAt: "Há 2 horas" },
  { file: { id: "r3", name: "Relatório Financeiro do Curso — Março 2026", fileType: "pdf", frequency: "mensal", status: "gerado", size: "198 KB", generatedAt: "01 Mar 2026" }, pathLabel: "Finanças › Mensal", openedAt: "Há 3 horas" },
  { file: { id: "r4", name: "Relatório do Docente — Março 2026", fileType: "pdf", frequency: "mensal", status: "gerado", size: "156 KB", generatedAt: "15 Mar 2026" }, pathLabel: "Prof. António Silva › Mensal", openedAt: "Há 5 horas" },
  { file: { id: "r5", name: "Assiduidade — Fevereiro 2026", fileType: "csv", frequency: "mensal", status: "gerado", size: "67 KB", generatedAt: "15 Feb 2026" }, pathLabel: "3º Ano › Turma C › Mensal", openedAt: "Há 1 dia" },
  { file: { id: "r6", name: "Plano Curricular", fileType: "pdf", status: "gerado", size: "234 KB", isDocument: true, uploadedBy: "Prof. Manuel Domingos", generatedAt: "01 Set 2025" }, pathLabel: "Documentos › Estrutura Curricular", openedAt: "Há 2 dias" },
];

// ─── Seed: Pinned Items ────────────────────────────────
export const seedPinned: PinnedItem[] = [
  { file: { id: "p1", name: "Desempenho da Turma A — Janeiro 2026", fileType: "pdf", frequency: "mensal", status: "gerado", size: "245 KB", generatedAt: "15 Jan 2026" }, pathLabel: "Desempenho › 1º Ano › Turma A" },
  { file: { id: "p2", name: "Relatório Financeiro do Curso — Março 2026", fileType: "pdf", frequency: "mensal", status: "gerado", size: "198 KB", generatedAt: "01 Mar 2026" }, pathLabel: "Finanças › Mensal" },
];

// ─── Resolve path helper ────────────────────────────────
export function resolveNode(path: string[]): DriveNode | null {
  let nodes = driveTree;
  let cur: DriveNode | null = null;
  for (const seg of path) {
    const found = nodes.find(n => n.id === seg);
    if (!found) return null;
    cur = found;
    nodes = found.children || [];
  }
  return cur;
}

export function buildBreadcrumbs(path: string[]): { label: string; pathIds: string[] }[] {
  const crumbs: { label: string; pathIds: string[] }[] = [{ label: "EduDrive", pathIds: [] }];
  let nodes = driveTree;
  const acc: string[] = [];
  for (const seg of path) {
    const found = nodes.find(n => n.id === seg);
    if (!found) break;
    acc.push(seg);
    crumbs.push({ label: found.name, pathIds: [...acc] });
    nodes = found.children || [];
  }
  return crumbs;
}
