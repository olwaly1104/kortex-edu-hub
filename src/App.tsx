import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import AppLayout from "./layouts/AppLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentDisciplines from "./pages/student/Disciplines";
import DisciplineDetail from "./pages/student/DisciplineDetail";
import LessonDetail from "./pages/student/LessonDetail";
import EvaluationDetail from "./pages/student/EvaluationDetail";
import TaskDetail from "./pages/student/TaskDetail";
import StudentTasks from "./pages/student/Tasks";
import StudentCalendar from "./pages/student/Calendar";
import StudentAnnouncements from "./pages/student/Announcements";
import StudentContacts from "./pages/student/Contacts";
import StudentChat from "./pages/student/Chat";
import StudentEmail from "./pages/student/Email";
import StudentGrades from "./pages/student/Grades";
import StudentLibrary from "./pages/student/Library";
import StudentProfile from "./pages/student/Profile";
import StudentFinances from "./pages/student/Finances";
import StudentActivities from "./pages/student/Activities";
import ProfessorDashboard from "./pages/professor/Dashboard";
import ProfessorDisciplines from "./pages/professor/Disciplines";
import ProfessorDisciplineDetail from "./pages/professor/DisciplineDetail";
import ProfessorStudents from "./pages/professor/Students";
import ProfessorAnnouncements from "./pages/professor/Announcements";
import ProfessorCalendar from "./pages/professor/Calendar";
import ProfessorContacts from "./pages/professor/Contacts";
import ProfessorLessons from "./pages/professor/Lessons";
import ProfessorGrades from "./pages/professor/Grades";
import ProfessorTasks from "./pages/professor/Tasks";
import ProfessorEvaluations from "./pages/professor/Evaluations";
import ProfessorTaskDetail from "./pages/professor/TaskDetail";
import ProfessorFinances from "./pages/professor/Finances";
import ProfessorProfile from "./pages/professor/Profile";
import ProfessorTurmaDetail from "./pages/professor/TurmaDetail";
import ProfessorLessonDetailPage from "./pages/professor/LessonDetail";
import ProfessorStudentProfile from "./pages/professor/StudentProfile";
import CoordenadorDashboard from "./pages/coordenador/Dashboard";
import CoordenadorSolicitacoes from "./pages/coordenador/Solicitacoes";
import CoordenadorAnos from "./pages/coordenador/Anos";
import CoordenadorCadeiras from "./pages/coordenador/Cadeiras";
import CoordenadorAnoDetail from "./pages/coordenador/AnoDetail";
import CoordenadorTurmaDetail from "./pages/coordenador/TurmaDetail";
import CoordenadorCadeiraDetail from "./pages/coordenador/CadeiraDetail";
import CoordenadorLessonDetail from "./pages/coordenador/LessonDetail";
import CoordenadorEstudantes from "./pages/coordenador/Estudantes";
import CoordenadorDocentes from "./pages/coordenador/Docentes";
import CoordenadorDocenteProfile from "./pages/coordenador/DocenteProfile";
import CoordenadorNotas from "./pages/coordenador/Notas";
import CoordenadorNotasTurmaDetail from "./pages/coordenador/NotasTurmaDetail";
import CoordenadorEstudanteProfile from "./pages/coordenador/EstudanteProfile";
import CoordenadorRelatorios from "./pages/coordenador/Relatorios";
import CoordenadorFinancas from "./pages/coordenador/Financas";
import CoordenadorCursoDetail from "./pages/coordenador/CursoDetail";

import CoordenadorFaculdadeDetail from "./pages/coordenador/FaculdadeDetail";
import CoordenadorTarefas from "./pages/coordenador/Tarefas";
import CoordenadorAvaliacoes from "./pages/coordenador/Avaliacoes";
import CoordenadorAvaliacaoDetail from "./pages/coordenador/AvaliacaoDetail";
import DecanoDashboard from "./pages/decano/Dashboard";
import DecanoAprovacoes from "./pages/decano/Aprovacoes";
import DecanoFaculdades from "./pages/decano/Faculdades";
import DecanoEstudantes from "./pages/decano/Estudantes";
import DecanoDocentes from "./pages/decano/Docentes";
import DecanoNotas from "./pages/decano/Notas";
import DecanoRelatorios from "./pages/decano/Relatorios";
import DecanoFinancas from "./pages/decano/Financas";
import DecanoCursoDetail from "./pages/decano/CursoDetail";
import DecanoAnoDetail from "./pages/decano/AnoDetail";
import DecanoEstudanteProfile from "./pages/decano/EstudanteProfile";
import DecanoDocenteProfile from "./pages/decano/DocenteProfile";
import DecanoTurmaDetail from "./pages/decano/TurmaDetail";
import ReitoriaDashboard from "./pages/reitoria/Dashboard";
import ReitoriaAprovacoes from "./pages/reitoria/Aprovacoes";
import ReitoriaVisaoGeral from "./pages/reitoria/VisaoGeral";
import ReitoriaFaculdades from "./pages/reitoria/Faculdades";
import ReitoriaDecanos from "./pages/reitoria/Decanos";
import ReitoriaCoordenadores from "./pages/reitoria/Coordenadores";
import ReitoriaDocentes from "./pages/reitoria/Docentes";
import ReitoriaRelatorios from "./pages/reitoria/Relatorios";
import ReitoriaFinancas from "./pages/reitoria/Financas";
import NotFound from "./pages/NotFound";
import SecretariaDashboard from "./pages/secretaria/Dashboard";
import SecretariaCandidaturas from "./pages/secretaria/Candidaturas";
import SecretariaCandidaturaDetail from "./pages/secretaria/CandidaturaDetail";
import SecretariaConvocacoes from "./pages/secretaria/Convocacoes";
import SecretariaSessaoDetail from "./pages/secretaria/SessaoProvaDetail";
import SecretariaResultados from "./pages/secretaria/Resultados";
import SecretariaAdmissoesDashboard from "./pages/secretaria/AdmissoesDashboard";
import SecretariaSolicitacoes from "./pages/secretaria/Solicitacoes";

const queryClient = new QueryClient();

const homeRedirectMap: Record<string, string> = {
  professor: "/professor",
  student: "/student",
  coordenador_curso: "/coordenador",
  decano: "/decano",
  reitoria: "/reitoria",
  secretaria: "/secretaria",
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Routes><Route path="*" element={<Login />} /></Routes>;
  const homeRedirect = homeRedirectMap[user?.role || "student"] || "/student";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homeRedirect} replace />} />
      <Route element={<AppLayout />}>
        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/disciplines" element={<StudentDisciplines />} />
        <Route path="/student/disciplines/:id" element={<DisciplineDetail />} />
        <Route path="/student/disciplines/:disciplineId/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/student/disciplines/:disciplineId/evaluation" element={<EvaluationDetail />} />
        <Route path="/student/disciplines/:disciplineId/tasks" element={<TaskDetail />} />
        <Route path="/student/tasks" element={<StudentTasks />} />
        <Route path="/student/calendar" element={<StudentCalendar />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />
        <Route path="/student/contacts" element={<StudentContacts />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/library" element={<StudentLibrary />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/finances" element={<StudentFinances />} />
        <Route path="/student/activities" element={<StudentActivities />} />
        {/* Professor */}
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/professor/disciplines" element={<ProfessorDisciplines />} />
        <Route path="/professor/disciplines/:id" element={<ProfessorDisciplineDetail />} />
        <Route path="/professor/turma/:turmaId" element={<ProfessorTurmaDetail />} />
        <Route path="/professor/lessons/:lessonId" element={<ProfessorLessonDetailPage />} />
        <Route path="/professor/students" element={<ProfessorStudents />} />
        <Route path="/professor/lessons" element={<ProfessorLessons />} />
        <Route path="/professor/grades" element={<ProfessorGrades />} />
        <Route path="/professor/calendar" element={<ProfessorCalendar />} />
        <Route path="/professor/announcements" element={<ProfessorAnnouncements />} />
        <Route path="/professor/tasks" element={<ProfessorTasks />} />
        <Route path="/professor/evaluations" element={<ProfessorEvaluations />} />
        <Route path="/professor/tasks/:taskId" element={<ProfessorTaskDetail />} />
        <Route path="/professor/students/:studentId" element={<ProfessorStudentProfile />} />
        <Route path="/professor/contacts" element={<ProfessorContacts />} />
        <Route path="/professor/chat" element={<StudentChat />} />
        <Route path="/professor/email" element={<StudentEmail />} />
        <Route path="/professor/finances" element={<ProfessorFinances />} />
        <Route path="/professor/profile" element={<ProfessorProfile />} />
        {/* Coordenador de Curso */}
        <Route path="/coordenador" element={<CoordenadorDashboard />} />
        <Route path="/coordenador/curso" element={<CoordenadorCursoDetail />} />
        <Route path="/coordenador/faculdade" element={<CoordenadorFaculdadeDetail />} />
        <Route path="/coordenador/calendario" element={<StudentCalendar />} />
        <Route path="/coordenador/anuncios" element={<StudentAnnouncements />} />
        <Route path="/coordenador/solicitacoes" element={<CoordenadorSolicitacoes />} />
        <Route path="/coordenador/tarefas" element={<CoordenadorTarefas />} />
        <Route path="/coordenador/avaliacoes" element={<CoordenadorAvaliacoes />} />
        <Route path="/coordenador/avaliacoes/:avaliacaoId" element={<CoordenadorAvaliacaoDetail />} />
        <Route path="/coordenador/anos" element={<CoordenadorAnos />} />
        <Route path="/coordenador/cadeiras" element={<CoordenadorCadeiras />} />
        
        <Route path="/coordenador/anos/:year" element={<CoordenadorAnoDetail />} />
        <Route path="/coordenador/anos/:year/turma/:turmaId" element={<CoordenadorTurmaDetail />} />
        <Route path="/coordenador/anos/:year/turma/:turmaId/cadeira/:cadeiraId" element={<CoordenadorCadeiraDetail />} />
        <Route path="/coordenador/anos/:year/turma/:turmaId/cadeira/:cadeiraId/aula/:lessonId" element={<CoordenadorLessonDetail />} />
        <Route path="/coordenador/estudantes" element={<CoordenadorEstudantes />} />
        <Route path="/coordenador/estudantes/:estudanteId" element={<CoordenadorEstudanteProfile />} />
        <Route path="/coordenador/docentes" element={<CoordenadorDocentes />} />
        <Route path="/coordenador/docentes/:docenteId" element={<CoordenadorDocenteProfile />} />
        <Route path="/coordenador/notas" element={<CoordenadorNotas />} />
        <Route path="/coordenador/notas/:year/:turma" element={<CoordenadorNotasTurmaDetail />} />
        <Route path="/coordenador/relatorios" element={<CoordenadorRelatorios />} />
        <Route path="/coordenador/financas" element={<CoordenadorFinancas />} />
        <Route path="/coordenador/chat" element={<StudentChat />} />
        <Route path="/coordenador/email" element={<StudentEmail />} />
        <Route path="/coordenador/contactos" element={<StudentContacts />} />
        <Route path="/coordenador/perfil" element={<StudentProfile />} />
        {/* Decano */}
        <Route path="/decano" element={<DecanoDashboard />} />
        <Route path="/decano/calendario" element={<StudentCalendar />} />
        <Route path="/decano/anuncios" element={<StudentAnnouncements />} />
        <Route path="/decano/aprovacoes" element={<DecanoAprovacoes />} />
        <Route path="/decano/faculdades" element={<DecanoFaculdades />} />
        <Route path="/decano/cursos/:cursoId" element={<DecanoCursoDetail />} />
        <Route path="/decano/cursos/:cursoId/ano/:year" element={<DecanoAnoDetail />} />
        <Route path="/decano/cursos/:cursoId/turma/:turmaId" element={<DecanoTurmaDetail />} />
        <Route path="/decano/estudantes" element={<DecanoEstudantes />} />
        <Route path="/decano/estudantes/:estudanteId" element={<DecanoEstudanteProfile />} />
        <Route path="/decano/docentes" element={<DecanoDocentes />} />
        <Route path="/decano/docentes/:docenteId" element={<DecanoDocenteProfile />} />
        <Route path="/decano/notas" element={<DecanoNotas />} />
        <Route path="/decano/relatorios" element={<DecanoRelatorios />} />
        <Route path="/decano/financas" element={<DecanoFinancas />} />
        <Route path="/decano/perfil" element={<StudentProfile />} />
        {/* Reitoria */}
        <Route path="/reitoria" element={<ReitoriaDashboard />} />
        <Route path="/reitoria/calendario" element={<StudentCalendar />} />
        <Route path="/reitoria/anuncios" element={<StudentAnnouncements />} />
        <Route path="/reitoria/aprovacoes" element={<ReitoriaAprovacoes />} />
        <Route path="/reitoria/visao-geral" element={<ReitoriaVisaoGeral />} />
        <Route path="/reitoria/faculdades" element={<ReitoriaFaculdades />} />
        <Route path="/reitoria/decanos" element={<ReitoriaDecanos />} />
        <Route path="/reitoria/coordenadores" element={<ReitoriaCoordenadores />} />
        <Route path="/reitoria/docentes" element={<ReitoriaDocentes />} />
        <Route path="/reitoria/relatorios" element={<ReitoriaRelatorios />} />
        <Route path="/reitoria/financas" element={<ReitoriaFinancas />} />
        <Route path="/reitoria/perfil" element={<StudentProfile />} />
        {/* Secretaria Académica */}
        <Route path="/secretaria" element={<SecretariaDashboard />} />
        <Route path="/secretaria/calendario" element={<StudentCalendar />} />
        <Route path="/secretaria/anuncios" element={<StudentAnnouncements />} />
        <Route path="/secretaria/solicitacoes" element={<SecretariaSolicitacoes />} />
        <Route path="/secretaria/admissoes" element={<SecretariaAdmissoesDashboard />} />
        <Route path="/secretaria/admissoes/candidaturas" element={<SecretariaCandidaturas />} />
        <Route path="/secretaria/admissoes/candidaturas/:id" element={<SecretariaCandidaturaDetail />} />
        <Route path="/secretaria/admissoes/provas-de-acesso" element={<SecretariaConvocacoes />} />
        <Route path="/secretaria/admissoes/provas-de-acesso/:sessionId" element={<SecretariaSessaoDetail />} />
        <Route path="/secretaria/admissoes/resultados" element={<SecretariaResultados />} />
        <Route path="/secretaria/chat" element={<StudentChat />} />
        <Route path="/secretaria/email" element={<StudentEmail />} />
        <Route path="/secretaria/contactos" element={<StudentContacts />} />
        <Route path="/secretaria/financas" element={<StudentFinances />} />
        <Route path="/secretaria/perfil" element={<StudentProfile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
