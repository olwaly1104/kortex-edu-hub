// Shared in-memory store for Cadeira contents (aulas, conteudos, quizzes, calendario)
// Persists per cadeiraId across navigation within the session.

export type Attachment = {
  id: string;
  name: string;
  tipo: "PDF" | "Slides" | "DOCX" | "Vídeo" | "Imagem" | "Link";
  size?: string;
  url: string;
};

export type Aula = {
  id: string;
  n: number;
  titulo: string;
  data: string;
  duracao: number;
  descricao: string;
  publicada: boolean;
  attachments: Attachment[];
  quizId?: string;
};

export type Conteudo = {
  id: string;
  tipo: Attachment["tipo"];
  titulo: string;
  semana: number;
  size?: string;
  url: string;
};

export type QuestionOption = { id: string; text: string };
export type Question = {
  id: string;
  enunciado: string;
  options: QuestionOption[];
  correctOptionId: string;
  explicacao?: string;
};
export type Quiz = {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number;
  publicado: boolean;
  questions: Question[];
};

export type Evento = { id: string; data: string; titulo: string; tipo: "aula" | "avaliacao" | "entrega" };

export type CadeiraContent = {
  aulas: Aula[];
  conteudos: Conteudo[];
  quizzes: Quiz[];
  calendario: Evento[];
};

const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const SAMPLE_SLIDES = "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/08/file_example_PPT_250kB.ppt";
const SAMPLE_DOCX = "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/02/file-sample_100kB.docx";
const SAMPLE_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const seedAula = (n: number, titulo: string): Aula => ({
  id: `a${n}`,
  n,
  titulo,
  data: `${String(14 + n).padStart(2, "0")}/09/2025`,
  duracao: 90,
  descricao: `Sessão ${n}: objectivos pedagógicos, exposição teórica, exemplos práticos e exercícios de consolidação.`,
  publicada: n <= 4,
  attachments: n === 1
    ? [
        { id: `a${n}-1`, name: `Slides - Aula ${n}.pdf`, tipo: "Slides", size: "1.2 MB", url: SAMPLE_PDF },
        { id: `a${n}-2`, name: `Ficha de Exercícios ${n}.pdf`, tipo: "PDF", size: "340 KB", url: SAMPLE_PDF },
        { id: `a${n}-3`, name: `Gravação Aula ${n}.mp4`, tipo: "Vídeo", size: "85 MB", url: SAMPLE_VIDEO },
      ]
    : [
        { id: `a${n}-1`, name: `Slides - Aula ${n}.pdf`, tipo: "Slides", size: "1.0 MB", url: SAMPLE_PDF },
      ],
});

const seedDefault = (cadeira: string): CadeiraContent => {
  const aulas = Array.from({ length: 8 }, (_, i) => seedAula(i + 1, `${cadeira} — Aula ${i + 1}`));
  // Link quizzes to specific aula days
  aulas[1].quizId = "q1"; // Aula 2 → Quiz Diagnóstico
  aulas[4].quizId = "q2"; // Aula 5 → Quiz Capítulo 1
  return {
  aulas,
  conteudos: [
    { id: "c1", tipo: "PDF", titulo: "Programa da Cadeira", semana: 1, size: "210 KB", url: SAMPLE_PDF },
    { id: "c2", tipo: "PDF", titulo: "Bibliografia Recomendada", semana: 1, size: "180 KB", url: SAMPLE_PDF },
    { id: "c3", tipo: "Slides", titulo: "Capítulo 1 — Introdução", semana: 1, size: "1.5 MB", url: SAMPLE_SLIDES },
    { id: "c4", tipo: "DOCX", titulo: "Guião de Trabalho Prático", semana: 3, size: "92 KB", url: SAMPLE_DOCX },
    { id: "c5", tipo: "Vídeo", titulo: "Demo prática — Sessão 2", semana: 2, size: "62 MB", url: SAMPLE_VIDEO },
  ],
  quizzes: [
    {
      id: "q1",
      titulo: "Quiz Diagnóstico",
      descricao: "Avaliação inicial dos conhecimentos prévios.",
      duracao: 15,
      publicado: true,
      questions: [
        {
          id: "qq1", enunciado: `Qual é o objectivo principal da cadeira de ${cadeira}?`,
          options: [
            { id: "o1", text: "Fornecer fundamentos teóricos e práticos" },
            { id: "o2", text: "Apenas avaliação contínua" },
            { id: "o3", text: "Substituir a frequência presencial" },
            { id: "o4", text: "Nenhum dos anteriores" },
          ],
          correctOptionId: "o1",
          explicacao: "A cadeira combina componente teórica e prática.",
        },
        {
          id: "qq2", enunciado: "Quantos ECTS tem tipicamente a cadeira?",
          options: [
            { id: "o1", text: "3" }, { id: "o2", text: "6" }, { id: "o3", text: "9" }, { id: "o4", text: "12" },
          ],
          correctOptionId: "o2",
        },
      ],
    },
    {
      id: "q2",
      titulo: "Quiz Capítulo 1",
      descricao: "Consolidação dos conceitos do primeiro capítulo.",
      duracao: 20,
      publicado: true,
      questions: [
        {
          id: "qq1", enunciado: "Qual a afirmação correcta sobre o conceito introduzido?",
          options: [
            { id: "o1", text: "Aplica-se em todos os contextos" },
            { id: "o2", text: "Depende do domínio de aplicação" },
            { id: "o3", text: "É puramente teórico" },
            { id: "o4", text: "Não tem aplicação prática" },
          ],
          correctOptionId: "o2",
        },
      ],
    },
  ],
  calendario: [
    { id: "e1", data: "15/09/2025", titulo: "1ª Aula", tipo: "aula" },
    { id: "e2", data: "20/10/2025", titulo: "Quiz Mid-term", tipo: "avaliacao" },
    { id: "e3", data: "10/11/2025", titulo: "Entrega Trabalho Prático", tipo: "entrega" },
    { id: "e4", data: "15/01/2026", titulo: "Exame 1ª Época", tipo: "avaliacao" },
  ],
  };
};

const store: Record<string, CadeiraContent> = {};

export const getCadeiraContent = (cadeiraId: string, cadeiraNome: string): CadeiraContent => {
  if (!store[cadeiraId]) store[cadeiraId] = seedDefault(cadeiraNome);
  return store[cadeiraId];
};

export const setCadeiraContent = (cadeiraId: string, content: CadeiraContent) => {
  store[cadeiraId] = content;
};

export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
