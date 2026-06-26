// ============================================
// Professor Mock Data
// ============================================

export interface ProfDiscipline {
  id: string;
  name: string;
  code: string;
  color: string;
  turmas: ProfTurma[];
  schedule: string;
  room: string;
  summary: string;
  totalStudents: number;
  totalLessons: number;
  publishedLessons: number;
  totalMaterials: number;
}

export interface ProfTurma {
  id: string;
  name: string;
  year: number;
  course: string;
  students: number;
}

export interface ProfStudent {
  id: string;
  name: string;
  email: string;
  turma: string;
  turmaId: string;
  disciplineId: string;
  attendance: number;
  avgGrade: number | null;
  submittedTasks: number;
  totalTasks: number;
  lastActive: string;
  status: "normal" | "risco" | "excelente";
}

export interface ProfLesson {
  id: string;
  disciplineId: string;
  turmaId: string;
  number: number;
  title: string;
  date: string;
  duration: string;
  status: "rascunho" | "agendada" | "publicada";
  publishDate?: string;
  views: number;
  summary: string;
  materials: { name: string; type: string; size: string }[];
  attendance: number;
  totalStudents: number;
}

export interface ProfTask {
  id: string;
  disciplineId: string;
  turmaId?: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  assignedDate: string;
  type: "tarefa" | "quiz" | "exame";
  status: "rascunho" | "agendada" | "publicada" | "pendente" | "encerrada";
  submissions: number;
  totalStudents: number;
  corrected: number;
  correctionDeadline?: string;
  avgGrade: number | null;
  weight: number;
  modality: "online" | "presencial";
}

export interface ProfAnnouncement {
  id: string;
  disciplineId: string;
  title: string;
  content: string;
  date: string;
  status: "rascunho" | "publicado";
}

export interface ProfGradeCriteria {
  disciplineId: string;
  criteria: { label: string; minGrade: number; color: string }[];
}

// ── All mock data removed; pages now read from the real backend or render empty states. ──
const turmas: ProfTurma[] = [];

export const allTurmas: ProfTurma[] = [];
export const profDisciplines: ProfDiscipline[] = [];
export const profLessons: ProfLesson[] = [];
export const profStudents: ProfStudent[] = [];
export const profTasks: ProfTask[] = [];
export const profAnnouncements: ProfAnnouncement[] = [];
export const profGradeCriteria: ProfGradeCriteria[] = [];
export const profTodayClasses: any[] = [];

