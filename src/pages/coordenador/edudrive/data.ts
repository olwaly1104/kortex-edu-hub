import { DriveNode, DriveFile, FileStatus, Frequency, Notification, RecentItem, PinnedItem } from "./types";

let _id = 0;
const uid = () => `n${_id++}`;
const fid = () => `f${_id++}`;

// Status logic: Sep 2025 - Mar 2026 = gerado, Apr 2026+ = agendado
const months = [
  { label: "Setembro 2025", status: "gerado" as FileStatus },
  { label: "Outubro 2025", status: "gerado" as FileStatus },
  { label: "Novembro 2025", status: "gerado" as FileStatus },
  { label: "Dezembro 2025", status: "gerado" as FileStatus },
  { label: "Janeiro 2026", status: "gerado" as FileStatus },
  { label: "Fevereiro 2026", status: "gerado" as FileStatus },
  { label: "Março 2026", status: "gerado" as FileStatus },
  { label: "Abril 2026", status: "agendado" as FileStatus },
  { label: "Maio 2026", status: "agendado" as FileStatus },
  { label: "Junho 2026", status: "agendado" as FileStatus },
  { label: "Julho 2026", status: "agendado" as FileStatus },
  { label: "Agosto 2026", status: "agendado" as FileStatus },
];

const mkFile = (name: string, freq: Frequency, status: FileStatus, type: "pdf" | "csv" = "pdf", size?: string): DriveFile => ({
  id: fid(), name, fileType: type, frequency: freq, status, size: size || (freq === "anual" ? "1.2 MB" : freq === "semestral" ? "456 KB" : "178 KB"),
  generatedAt: status === "gerado" ? "15 Mar 2026" : undefined,
});

const mkDoc = (name: string, type: "pdf" | "docx" | "xlsx" = "pdf", size = "234 KB"): DriveFile => ({
  id: fid(), name, fileType: type, status: "gerado", size, isDocument: true,
  uploadedBy: "Prof. Manuel Domingos", generatedAt: "01 Set 2025", version: 1,
});

// ─── Desempenho Académico ───────────────────────────────
const desempenhoMensalFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Desempenho da Turma", "mensal", s), mkFile("Estudantes em Risco", "mensal", s), mkFile("Assiduidade", "mensal", s, "csv"),
];
const desempenhoSemestralFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Desempenho da Turma", "semestral", s), mkFile("Notas e Aprovações", "semestral", s), mkFile("Estudantes em Risco", "semestral", s),
  mkFile("Assiduidade", "semestral", s, "csv"), mkFile("Avaliações e Tarefas", "semestral", s),
];
const desempenhoAnualFiles: DriveFile[] = [
  mkFile("Desempenho da Turma", "anual", "agendado"), mkFile("Notas e Aprovações", "anual", "agendado"), mkFile("Estudantes em Risco", "anual", "agendado"),
  mkFile("Assiduidade", "anual", "agendado", "csv"), mkFile("Avaliações e Tarefas", "anual", "agendado"), mkFile("Progressão dos Estudantes", "anual", "agendado"),
];

const courseReportNames = [
  "Relatório de Desempenho Geral",
  "Desempenho por Cadeiras",
  "Desempenho por Docente",
  "Estudantes em Risco",
  "Quadro de Honra",
];

const mkReportWithFrequency = (name: string): DriveNode => ({
  id: uid(), name, children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: [mkFile(name, "mensal", m.status)] })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: [mkFile(name, "semestral", "gerado")] },
      { id: uid(), name: "Semestre 2", files: [mkFile(name, "semestral", "agendado")] },
    ]},
    { id: uid(), name: "Anual", files: [mkFile(name, "anual", "agendado")] },
  ],
});

const mkDesempenhoTurma = (turma: string): DriveNode => ({
  id: uid(), name: turma, children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: desempenhoMensalFiles(m.status) })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: desempenhoSemestralFiles("gerado") },
      { id: uid(), name: "Semestre 2", files: desempenhoSemestralFiles("agendado") },
    ]},
    { id: uid(), name: "Anual", files: desempenhoAnualFiles },
  ],
});

const mkDesempenhoAno = (ano: string): DriveNode => ({
  id: uid(), name: ano,
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

const cadeiraMensalFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório da Cadeira", "mensal", s), mkFile("Assiduidade", "mensal", s, "csv"),
];
const cadeiraSemestralFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório da Cadeira", "semestral", s), mkFile("Notas e Resultados", "semestral", s), mkFile("Avaliações e Tarefas", "semestral", s, "csv"),
];
const cadeiraAnualFiles: DriveFile[] = [
  mkFile("Relatório da Cadeira", "anual", "agendado"), mkFile("Notas e Resultados", "anual", "agendado"),
  mkFile("Avaliações e Tarefas", "anual", "agendado", "csv"), mkFile("Comparação com Anos Anteriores", "anual", "agendado"),
];

const mkCadeira = (name: string): DriveNode => ({
  id: uid(), name, children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: cadeiraMensalFiles(m.status) })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: cadeiraSemestralFiles("gerado") },
      { id: uid(), name: "Semestre 2", files: cadeiraSemestralFiles("agendado") },
    ]},
    { id: uid(), name: "Anual", files: cadeiraAnualFiles },
  ],
});

const cadeirasDoCurso: DriveNode = {
  id: uid(), name: "Cadeiras do Curso", icon: "book-open",
  children: ["1º Ano", "2º Ano", "3º Ano"].map(ano => ({
    id: uid(), name: ano, children: (subjectsByYear[ano] || []).map(mkCadeira),
  })),
};

// ─── Docentes do Curso ──────────────────────────────────
const teachersByYear: Record<string, string[]> = {
  "1º Ano": ["Prof. António Silva", "Prof. Maria Santos", "Prof. João Ferreira"],
  "2º Ano": ["Prof. Ana Domingos", "Prof. Carlos Mendes", "Prof. Teresa Costa"],
  "3º Ano": ["Prof. Manuel Oliveira", "Prof. Rosa Nascimento", "Prof. Pedro Gonçalves"],
};

const docenteMensalFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório do Docente", "mensal", s), mkFile("Assiduidade", "mensal", s, "csv"),
];
const docenteSemestralFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório do Docente", "semestral", s), mkFile("Desempenho das Turmas", "semestral", s), mkFile("Carga Horária", "semestral", s, "csv"),
];
const docenteAnualFiles: DriveFile[] = [
  mkFile("Relatório do Docente", "anual", "agendado"), mkFile("Desempenho das Turmas", "anual", "agendado"),
  mkFile("Carga Horária", "anual", "agendado", "csv"), mkFile("Avaliação de Desempenho", "anual", "agendado"),
];

const mkDocente = (name: string): DriveNode => ({
  id: uid(), name, children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: docenteMensalFiles(m.status) })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: docenteSemestralFiles("gerado") },
      { id: uid(), name: "Semestre 2", files: docenteSemestralFiles("agendado") },
    ]},
    { id: uid(), name: "Anual", files: docenteAnualFiles },
  ],
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

const estudanteMensalFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório do Estudante", "mensal", s), mkFile("Assiduidade", "mensal", s, "csv"),
];
const estudanteSemestralFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório do Estudante", "semestral", s), mkFile("Notas", "semestral", s), mkFile("Assiduidade", "semestral", s, "csv"), mkFile("Situação Financeira", "semestral", s),
];
const estudanteAnualFiles: DriveFile[] = [
  mkFile("Relatório do Estudante", "anual", "agendado"), mkFile("Notas", "anual", "agendado"), mkFile("Assiduidade", "anual", "agendado", "csv"),
  mkFile("Situação Financeira", "anual", "agendado"), mkFile("Progressão Académica", "anual", "agendado"),
];

const mkEstudante = (name: string): DriveNode => ({
  id: uid(), name, children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: estudanteMensalFiles(m.status) })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: estudanteSemestralFiles("gerado") },
      { id: uid(), name: "Semestre 2", files: estudanteSemestralFiles("agendado") },
    ]},
    { id: uid(), name: "Anual", files: estudanteAnualFiles },
  ],
});

const estudantesDoCurso: DriveNode = {
  id: uid(), name: "Estudantes do Curso", icon: "graduation-cap",
  children: ["1º Ano", "2º Ano", "3º Ano"].map(ano => ({
    id: uid(), name: ano, children: (studentsByYear[ano] || []).map(mkEstudante),
  })),
};

// ─── Finanças do Curso ──────────────────────────────────
const financaMensalFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório Financeiro do Curso", "mensal", s), mkFile("Estudantes em Risco Financeiro", "mensal", s),
  mkFile("Multas Aplicadas do Curso", "mensal", s), mkFile("Tabela de Multas", "mensal", s, "csv"),
];
const financaSemestralFiles = (s: FileStatus): DriveFile[] => [
  mkFile("Relatório Financeiro do Curso", "semestral", s), mkFile("Estudantes em Risco Financeiro", "semestral", s),
  mkFile("Multas Aplicadas do Curso", "semestral", s), mkFile("Tabela de Multas", "semestral", s, "csv"),
];
const financaAnualFiles: DriveFile[] = [
  mkFile("Relatório Financeiro do Curso", "anual", "agendado"), mkFile("Estudantes em Risco Financeiro", "anual", "agendado"),
  mkFile("Multas Aplicadas do Curso", "anual", "agendado"), mkFile("Tabela de Multas", "anual", "agendado", "csv"),
];

const financasDoCurso: DriveNode = {
  id: uid(), name: "Finanças do Curso", icon: "wallet",
  children: [
    { id: uid(), name: "Mensal", children: months.map(m => ({ id: uid(), name: m.label, files: financaMensalFiles(m.status) })) },
    { id: uid(), name: "Semestral", children: [
      { id: uid(), name: "Semestre 1", files: financaSemestralFiles("gerado") },
      { id: uid(), name: "Semestre 2", files: financaSemestralFiles("agendado") },
    ]},
    { id: uid(), name: "Anual", files: financaAnualFiles },
  ],
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
  { file: { id: "r1", name: "Desempenho da Turma A", fileType: "pdf", frequency: "mensal", status: "gerado", size: "245 KB", generatedAt: "15 Mar 2026" }, pathLabel: "1º Ano › Turma A › Março 2026", openedAt: "Há 30 min" },
  { file: { id: "r2", name: "Notas e Aprovações — Sem. 1", fileType: "pdf", frequency: "semestral", status: "gerado", size: "567 KB", generatedAt: "28 Fev 2026" }, pathLabel: "2º Ano › Turma B › Semestre 1", openedAt: "Há 2 horas" },
  { file: { id: "r3", name: "Relatório Financeiro", fileType: "pdf", frequency: "mensal", status: "gerado", size: "198 KB", generatedAt: "01 Mar 2026" }, pathLabel: "Finanças › Março 2026", openedAt: "Há 3 horas" },
  { file: { id: "r4", name: "Relatório do Docente", fileType: "pdf", frequency: "mensal", status: "gerado", size: "156 KB", generatedAt: "15 Mar 2026" }, pathLabel: "Prof. António Silva › Março 2026", openedAt: "Há 5 horas" },
  { file: { id: "r5", name: "Assiduidade — Turma C", fileType: "csv", frequency: "mensal", status: "gerado", size: "67 KB", generatedAt: "15 Mar 2026" }, pathLabel: "3º Ano › Turma C › Março 2026", openedAt: "Há 1 dia" },
  { file: { id: "r6", name: "Plano Curricular", fileType: "pdf", status: "gerado", size: "234 KB", isDocument: true, uploadedBy: "Prof. Manuel Domingos", generatedAt: "01 Set 2025" }, pathLabel: "Documentos › Estrutura Curricular", openedAt: "Há 2 dias" },
];

// ─── Seed: Pinned Items ────────────────────────────────
export const seedPinned: PinnedItem[] = [
  { file: { id: "p1", name: "Desempenho da Turma A — 1º Ano", fileType: "pdf", frequency: "mensal", status: "gerado", size: "245 KB", generatedAt: "15 Mar 2026" }, pathLabel: "Desempenho › 1º Ano › Turma A" },
  { file: { id: "p2", name: "Relatório Financeiro — Março", fileType: "pdf", frequency: "mensal", status: "gerado", size: "198 KB", generatedAt: "01 Mar 2026" }, pathLabel: "Finanças › Março 2026" },
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
