import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { hydrateAdminStateFromBackend } from "@/lib/onboardingStorage";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import Website from "./pages/Website";
import Candidatar from "./pages/Candidatar";
import AppLayout from "./layouts/AppLayout";
import ComingSoon from "./components/ComingSoon";
import StudentDashboard from "./pages/student/Dashboard";
import StudentDisciplines from "./pages/student/Disciplines";
import DisciplineDetail from "./pages/student/DisciplineDetail";
import LessonDetail from "./pages/student/LessonDetail";
import EvaluationDetail from "./pages/student/EvaluationDetail";
import TaskDetail from "./pages/student/TaskDetail";
import StudentTasks from "./pages/student/Tasks";
import StudentQuizzes from "./pages/student/Quizzes";
import StudentCalendar from "./pages/student/Calendar";
import StudentAnnouncements from "./pages/student/Announcements";
import StudentSolicitacoes from "./pages/student/Solicitacoes";
import StudentSolicitacaoDetail from "./pages/student/SolicitacaoDetail";
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
import CoordenadorCalendar from "./pages/coordenador/Calendar";
import CoordenadorAvaliacoes from "./pages/coordenador/Avaliacoes";
import CoordenadorAvaliacaoDetail from "./pages/coordenador/AvaliacaoDetail";
import CoordenadorAnuncios from "./pages/coordenador/Anuncios";
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
import DecanoCoordenadores from "./pages/decano/Coordenadores";
import DecanoCoordenadorProfile from "./pages/decano/CoordenadorProfile";
import DecanoCadeiraDetail from "./pages/decano/CadeiraDetail";
import DecanoCalendar from "./pages/decano/Calendar";
import ReitorDashboard from "./pages/reitor/Dashboard";
import ReitorFaculdades from "./pages/reitor/Faculdades";
import ReitorFaculdadeDetail from "./pages/reitor/FaculdadeDetail";
import ReitorCursoDetail from "./pages/reitor/CursoDetail";
import ReitorTurmaDetail from "./pages/reitor/TurmaDetail";
import ReitorCadeiraDetail from "./pages/reitor/CadeiraDetail";
import ReitorSolicitacoes from "./pages/reitor/Solicitacoes";
import ReitorDecanos from "./pages/reitor/Decanos";
import ReitorCoordenadores from "./pages/reitor/Coordenadores";
import ReitorCoordenadorProfile from "./pages/reitor/CoordenadorProfile";
import ReitorDocentes from "./pages/reitor/Docentes";
import ReitorNotas from "./pages/reitor/Notas";
import ReitorNotasCursoDetail from "./pages/reitor/NotasCursoDetail";
import ReitorNotasTurmaDetail from "./pages/reitor/NotasTurmaDetail";
import ReitorRelatorios from "./pages/reitor/Relatorios";
import ReitorFinancas from "./pages/reitor/Financas";
import ReitorEstudantes from "./pages/reitor/Estudantes";
import NotFound from "./pages/NotFound";
import SecretariaInicio from "./pages/secretaria/Inicio";
import SecretariaDashboard from "./pages/secretaria/Dashboard";
import SecretariaCandidaturas from "./pages/secretaria/Candidaturas";
import SecretariaCandidaturaDetail from "./pages/secretaria/CandidaturaDetail";
import SecretariaConvocacoes from "./pages/secretaria/Convocacoes";
import SecretariaSessaoDetail from "./pages/secretaria/SessaoProvaDetail";
import SecretariaResultados from "./pages/secretaria/Resultados";
import SecretariaAdmissoesDashboard from "./pages/secretaria/AdmissoesDashboard";
import SecretariaSolicitacoes from "./pages/secretaria/Solicitacoes";
import GapInicio from "./pages/gap/Inicio";
import GapDashboard from "./pages/gap/Dashboard";
import GapTickets from "./pages/gap/Tickets";
import GapMinhasSolicitacoes from "./pages/gap/MinhasSolicitacoes";
import GapSolicitacaoDetail from "./pages/gap/SolicitacaoDetail";
import GapAtendimentos from "./pages/gap/Atendimentos";
import GapAtendimentoDetail from "./pages/gap/AtendimentoDetail";
import GapEstudantes from "./pages/gap/Estudantes";
import GapEstudanteProfile from "./pages/gap/EstudanteProfile";
import GapCandidaturas from "./pages/gap/Candidaturas";
import GapCandidaturaDetail from "./pages/gap/CandidaturaDetail";
import GapConfiguracao from "./pages/gap/Configuracao";
import GapMeuPerfil from "./pages/gap/MeuPerfil";

import FinancasDashboard from "./pages/financas/Dashboard";
import FinancasInicio from "./pages/financas/Inicio";
import FinancasReceitas from "./pages/financas/Receitas";
import FinancasDespesas from "./pages/financas/Despesas";
import FinancasDespesaDetail from "./pages/financas/DespesaDetail";
import FinancasConfigurarReceitas from "./pages/financas/ConfigurarReceitas";
import FinancasSalarios from "./pages/financas/Salarios";
import FinancasOrcamentos from "./pages/financas/Orcamentos";
import FinancasSolicitacoes from "./pages/financas/Solicitacoes";
import FinancasSolicitacaoDetail from "./pages/financas/SolicitacaoDetail";
import FinancasPessoalFinancas from "./pages/financas/PessoalFinancas";
import FinancasMeuPerfil from "./pages/financas/MeuPerfil";
import FinancasCalendario from "./pages/financas/Calendario";
import FinancasDiscentes from "./pages/financas/Discentes";

import InscricoesLayout from "./layouts/InscricoesLayout";
import InscricoesRegistar from "./pages/inscricoes/Registar";
import InscricoesCandidatoDetail from "./pages/inscricoes/CandidatoDetail";
import InscricoesDoc from "./pages/inscricoes/InscricaoDoc";
import Academica2Inicio from "./pages/academica2/Inicio";
import Academica2CourseCreator from "./pages/academica2/CourseCreator";
import Academica2ConfirmarFaculdades from "./pages/academica2/ConfirmarFaculdades";
import Academica2GerarCadeiras from "./pages/academica2/GerarCadeiras";
import Academica2CriarTurmas from "./pages/academica2/CriarTurmas";
import Academica2CalendarioAcademico from "./pages/academica2/CalendarioAcademico";
import Academica2AnosLetivos from "./pages/academica2/AnosLetivos";
import Academica2Cadeiras from "./pages/academica2/Cadeiras";
import Academica2CadeiraDetail from "./pages/academica2/CadeiraDetail";
import Academica2AulaDetail from "./pages/academica2/AulaDetail";
import Academica2QuizDetail from "./pages/academica2/QuizDetail";
import Academica2Turmas from "./pages/academica2/Turmas";
import Academica2Docentes from "./pages/academica2/Docentes";
import Academica2CalendarioAcad from "./pages/academica2/CalendarioAcad";
import Academica2Exames from "./pages/academica2/Exames";
import Academica2Quizzes from "./pages/academica2/Quizzes";
import Academica2Notas from "./pages/academica2/Notas";
import Academica2Relatorios from "./pages/academica2/Relatorios";
import AdminOnboarding from "./pages/admin/Onboarding";
import AdminInicio from "./pages/admin/Inicio";
import AdminPerfil from "./pages/admin/Perfil";

import AdminOnboardingEstudantes from "./pages/admin/onboarding/Estudantes";
import AdminOnboardingPessoas from "./pages/admin/onboarding/Pessoas";
import AdminOnboardingRH from "./pages/admin/onboarding/RH";
import AdminOnboardingRegrasPresenca from "./pages/admin/onboarding/RegrasPresenca";
import AdminOnboardingSalarios from "./pages/admin/onboarding/Salarios";
import AdminOnboardingEspacos from "./pages/admin/onboarding/Espacos";
import AdminOnboardingGeopontos from "./pages/admin/onboarding/Geopontos";
import AdminFaculdadesCursos from "./pages/admin/FaculdadesCursos";
import AdminAreaAcademica from "./pages/admin/AreaAcademica";
import AdminDiscentes from "./pages/admin/Discentes";
import AdminDiscenteProfile from "./pages/admin/DiscenteProfile";
import AdminSalas from "./pages/admin/Salas";
import AdminStaff from "./pages/admin/Staff";
import AdminDocentes from "./pages/admin/Docentes";
import AdminFinancasDiscentes from "./pages/admin/FinancasDiscentes";
import AdminUtilizadores from "./pages/admin/Utilizadores";
import AdminSistema from "./pages/admin/Sistema";
import AdminModulos from "./pages/admin/Modulos";
import AlterarPalavraPasse from "./pages/AlterarPalavraPasse";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const homeRedirectMap: Record<string, string> = {
  professor: "/professor",
  student: "/student",
  coordenador_curso: "/coordenador",
  decano: "/decano",
  reitor: "/reitor",
  secretaria: "/secretaria",
  financas: "/financas",
  gap: "/gap",
  inscricoes: "/inscricoes",
  academica2: "/areaacademica",
  admin: "/admin",
};

// Maps a URL prefix to the role(s) allowed to access it.
const pathRoleMap: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/student", roles: ["student"] },
  { prefix: "/professor", roles: ["professor"] },
  { prefix: "/coordenador", roles: ["coordenador_curso"] },
  { prefix: "/decano", roles: ["decano"] },
  { prefix: "/reitor", roles: ["reitor"] },
  { prefix: "/secretaria", roles: ["secretaria"] },
  { prefix: "/financas", roles: ["financas", "admin"] },
  { prefix: "/gap", roles: ["gap", "admin"] },
  { prefix: "/inscricoes", roles: ["inscricoes"] },
  { prefix: "/areaacademica", roles: ["academica2", "admin"] },
  { prefix: "/admin", roles: ["admin"] },

];

function RoleGuardedLayout({ homeRedirect }: { homeRedirect: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const match = pathRoleMap.find((entry) => location.pathname.startsWith(entry.prefix));
  if (match && user && !match.roles.includes(user.role)) {
    return <Navigate to={homeRedirect} replace />;
  }
  return <AppLayout />;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [hydratingFor, setHydratingFor] = useState<string | null>(null);
  const [mustChange, setMustChange] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setHydrated(true);
      setHydratingFor(null);
      return;
    }
    if (hydratingFor === user.email) return;
    setHydratingFor(user.email || null);
    setHydrated(false);
    hydrateAdminStateFromBackend(user.email).finally(() => setHydrated(true));
  }, [isAuthenticated, user?.role, user?.email, hydratingFor]);

  // Check must_change_password flag on every fresh login.
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) { setMustChange(null); return; }
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user?.id) { if (!cancelled) setMustChange(false); return; }
      const { data } = await (supabase.from("profiles" as any) as any)
        .select("must_change_password")
        .eq("id", u.user.id)
        .maybeSingle();
      if (!cancelled) setMustChange(!!(data as any)?.must_change_password);
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.email]);

  if (!isAuthenticated) return <Routes><Route path="/" element={<Website />} /><Route path="/site" element={<Website />} /><Route path="/candidatar" element={<Candidatar />} /><Route path="*" element={<Login />} /></Routes>;
  const homeRedirect = homeRedirectMap[user?.role || "student"] || "/student";

  if (mustChange) {
    return <AlterarPalavraPasse onDone={() => setMustChange(false)} />;
  }

  if (user?.role === "admin" && !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar os dados da instituição…
        </div>
      </div>
    );
  }


  return (
    <Routes>
      <Route path="/" element={<Website />} />
      <Route path="/admin/onboarding" element={<AdminOnboarding />} />
      <Route element={<RoleGuardedLayout homeRedirect={homeRedirect} />}>
        {/* Admin */}
        <Route path="/admin" element={<AdminInicio />} />
        <Route path="/admin/perfil" element={<AdminPerfil />} />
        <Route path="/admin/faculdades-cursos" element={<AdminAreaAcademica />} />
        <Route path="/admin/discentes" element={<AdminDiscentes />} />
        <Route path="/admin/discentes/:discenteId" element={<AdminDiscenteProfile />} />
        <Route path="/admin/salas" element={<AdminSalas />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/docentes" element={<AdminDocentes />} />
        <Route path="/admin/utilizadores" element={<AdminUtilizadores />} />
        <Route path="/admin/sistema" element={<AdminSistema />} />
        <Route path="/admin/modulos" element={<AdminModulos />} />
        {/* Admin → Finanças (read-only mirrors) */}
        <Route path="/admin/financas/dashboard" element={<FinancasDashboard />} />
        <Route path="/admin/financas/receitas" element={<FinancasReceitas />} />
        <Route path="/admin/financas/despesas" element={<FinancasDespesas />} />
        <Route path="/admin/financas/salarios" element={<FinancasSalarios />} />
        <Route path="/admin/financas/orcamentos" element={<FinancasOrcamentos />} />
        <Route path="/admin/financas/discentes" element={<AdminFinancasDiscentes />} />
        <Route path="/admin/financas/candidaturas" element={<GapCandidaturas />} />
        <Route path="/admin/financas/candidaturas/:id" element={<GapCandidaturaDetail />} />
        {/* Admin → Candidaturas (mirror of GAP) */}
        <Route path="/admin/candidaturas" element={<GapCandidaturas />} />
        <Route path="/admin/candidaturas/:id" element={<GapCandidaturaDetail />} />
        <Route path="/admin/onboarding/estudantes" element={<AdminOnboardingEstudantes />} />
        <Route path="/admin/onboarding/docentes" element={<AdminOnboardingPessoas mode="docentes" />} />
        <Route path="/admin/onboarding/staff" element={<AdminOnboardingPessoas mode="staff" />} />
        <Route path="/admin/onboarding/rh" element={<AdminOnboardingRH />} />
        <Route path="/admin/onboarding/espacos" element={<AdminOnboardingEspacos />} />
        <Route path="/admin/onboarding/geopontos" element={<AdminOnboardingGeopontos />} />
        <Route path="/admin/onboarding/regras-presenca" element={<AdminOnboardingRegrasPresenca />} />
        <Route path="/admin/onboarding/salarios" element={<AdminOnboardingSalarios />} />
        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/disciplines" element={<StudentDisciplines />} />
        <Route path="/student/disciplines/:id" element={<DisciplineDetail />} />
        <Route path="/student/disciplines/:disciplineId/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/student/disciplines/:disciplineId/evaluation" element={<EvaluationDetail />} />
        <Route path="/student/disciplines/:disciplineId/tasks" element={<TaskDetail />} />
        <Route path="/student/tasks" element={<StudentTasks />} />
        <Route path="/student/quizzes" element={<StudentQuizzes />} />
        <Route path="/student/calendar" element={<StudentCalendar />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />
        <Route path="/student/solicitacoes" element={<StudentSolicitacoes />} />
        <Route path="/student/solicitacoes/:id" element={<StudentSolicitacaoDetail />} />
        <Route path="/student/contacts" element={<StudentContacts />} />
        <Route path="/student/chat" element={<StudentChat />} />
        <Route path="/student/email" element={<StudentEmail />} />
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
        <Route path="/coordenador/calendario" element={<CoordenadorCalendar />} />
        <Route path="/coordenador/anuncios" element={<CoordenadorAnuncios />} />
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
        <Route path="/decano/calendario" element={<DecanoCalendar />} />
        <Route path="/decano/anuncios" element={<StudentAnnouncements />} />
        <Route path="/decano/aprovacoes" element={<DecanoAprovacoes />} />
        <Route path="/decano/faculdades" element={<DecanoFaculdades />} />
        <Route path="/decano/cursos/:cursoId" element={<DecanoCursoDetail />} />
        <Route path="/decano/cursos/:cursoId/ano/:year" element={<DecanoAnoDetail />} />
        <Route path="/decano/cursos/:cursoId/turma/:turmaId" element={<DecanoTurmaDetail />} />
        <Route path="/decano/cursos/:cursoId/turma/:turmaId/cadeira/:cadeiraId" element={<DecanoCadeiraDetail />} />
        <Route path="/decano/estudantes" element={<DecanoEstudantes />} />
        <Route path="/decano/coordenadores" element={<DecanoCoordenadores />} />
        <Route path="/decano/coordenadores/:coordenadorId" element={<DecanoCoordenadorProfile />} />
        <Route path="/decano/estudantes/:estudanteId" element={<DecanoEstudanteProfile />} />
        <Route path="/decano/docentes" element={<DecanoDocentes />} />
        <Route path="/decano/docentes/:docenteId" element={<DecanoDocenteProfile />} />
        <Route path="/decano/notas" element={<DecanoNotas />} />
        <Route path="/decano/relatorios" element={<DecanoRelatorios />} />
        <Route path="/decano/financas" element={<DecanoFinancas />} />
        <Route path="/decano/perfil" element={<StudentProfile />} />
        {/* Reitor */}
        <Route path="/reitor" element={<ReitorDashboard />} />
        <Route path="/reitor/calendario" element={<StudentCalendar />} />
        <Route path="/reitor/anuncios" element={<StudentAnnouncements />} />
        <Route path="/reitor/solicitacoes" element={<ReitorSolicitacoes />} />
        <Route path="/reitor/faculdades" element={<ReitorFaculdades />} />
        <Route path="/reitor/faculdades/:faculdadeId" element={<ReitorFaculdadeDetail />} />
        <Route path="/reitor/faculdades/:faculdadeId/cursos/:cursoId" element={<ReitorCursoDetail />} />
        <Route path="/reitor/faculdades/:faculdadeId/cursos/:cursoId/turma/:turmaId" element={<ReitorTurmaDetail />} />
        <Route path="/reitor/faculdades/:faculdadeId/cursos/:cursoId/turma/:turmaId/cadeira/:cadeiraId" element={<ReitorCadeiraDetail />} />
        <Route path="/reitor/decanos" element={<ReitorDecanos />} />
        <Route path="/reitor/coordenadores" element={<ReitorCoordenadores />} />
        <Route path="/reitor/coordenadores/:coordenadorId" element={<ReitorCoordenadorProfile />} />
        <Route path="/reitor/docentes" element={<ReitorDocentes />} />
        <Route path="/reitor/estudantes" element={<ReitorEstudantes />} />
        <Route path="/reitor/notas" element={<ReitorNotas />} />
        <Route path="/reitor/notas/:faculdadeId/:cursoId" element={<ReitorNotasCursoDetail />} />
        <Route path="/reitor/notas/:faculdadeId/:cursoId/:turmaId" element={<ReitorNotasTurmaDetail />} />
        <Route path="/reitor/relatorios" element={<ReitorRelatorios />} />
        <Route path="/reitor/financas" element={<ReitorFinancas />} />
        <Route path="/reitor/perfil" element={<StudentProfile />} />
        {/* Secretaria Académica */}
        <Route path="/secretaria" element={<SecretariaInicio />} />
        <Route path="/secretaria/dashboard" element={<SecretariaDashboard />} />
        <Route path="/secretaria/calendario" element={<StudentCalendar />} />
        <Route path="/secretaria/anuncios" element={<StudentAnnouncements />} />
        <Route path="/secretaria/solicitacoes" element={<SecretariaSolicitacoes />} />
        <Route path="/secretaria/admissoes" element={<SecretariaAdmissoesDashboard />} />
        <Route path="/secretaria/admissoes/candidaturas" element={<SecretariaCandidaturas />} />
        <Route path="/secretaria/admissoes/candidaturas/:id" element={<SecretariaCandidaturaDetail />} />
        <Route path="/secretaria/admissoes/provas-de-acesso" element={<SecretariaConvocacoes />} />
        <Route path="/secretaria/admissoes/provas-de-acesso/:sessionId" element={<SecretariaSessaoDetail />} />
        <Route path="/secretaria/admissoes/resultados" element={<SecretariaResultados />} />
        {/* Apoio ao estudante moved to GAP role */}
        <Route path="/secretaria/chat" element={<StudentChat />} />
        <Route path="/secretaria/email" element={<StudentEmail />} />
        <Route path="/secretaria/contactos" element={<StudentContacts />} />
        <Route path="/secretaria/financas" element={<StudentFinances />} />
        <Route path="/secretaria/perfil" element={<StudentProfile />} />
        {/* Finanças */}
        <Route path="/financas" element={<FinancasInicio />} />
        <Route path="/financas/calendario" element={<FinancasCalendario />} />

        <Route path="/financas/solicitacoes" element={<FinancasSolicitacoes />} />
        <Route path="/financas/solicitacoes/:id" element={<FinancasSolicitacaoDetail />} />
        <Route path="/financas/dashboard" element={<FinancasDashboard />} />
        <Route path="/financas/receitas" element={<FinancasReceitas />} />
        <Route path="/financas/despesas" element={<FinancasDespesas />} />
        <Route path="/financas/despesas/:id" element={<FinancasDespesaDetail />} />
        <Route path="/financas/configurar-receitas" element={<FinancasConfigurarReceitas />} />
        <Route path="/financas/configurador" element={<FinancasConfigurarReceitas />} />
        <Route path="/financas/salarios" element={<FinancasSalarios />} />
        <Route path="/financas/orcamentos" element={<FinancasOrcamentos />} />
        <Route path="/financas/discentes" element={<FinancasDiscentes />} />
        <Route path="/financas/chat" element={<StudentChat />} />
        <Route path="/financas/email" element={<StudentEmail />} />
        <Route path="/financas/contactos" element={<StudentContacts />} />
        <Route path="/financas/pessoal/financas" element={<FinancasPessoalFinancas />} />
        <Route path="/financas/perfil" element={<FinancasMeuPerfil />} />
        {/* GAP — Gabinete de Apoio Psicopedagógico */}
        <Route path="/gap" element={<GapInicio />} />
        <Route path="/gap/dashboard" element={<GapDashboard />} />
        <Route path="/gap/solicitacoes" element={<GapTickets />} />
        <Route path="/gap/minhas-solicitacoes" element={<GapMinhasSolicitacoes />} />
        <Route path="/gap/solicitacoes/:id" element={<GapSolicitacaoDetail />} />
        <Route path="/gap/agendamentos" element={<GapAtendimentos />} />
        <Route path="/gap/agendamentos/:id" element={<GapAtendimentoDetail />} />
        <Route path="/gap/estudantes" element={<GapEstudantes />} />
        <Route path="/gap/estudantes/:discenteId" element={<GapEstudanteProfile />} />
        
        <Route path="/gap/candidaturas" element={<GapCandidaturas />} />
        <Route path="/gap/candidaturas/:id" element={<GapCandidaturaDetail />} />
        <Route path="/gap/configuracao" element={<GapConfiguracao />} />
        <Route path="/gap/calendario" element={<FinancasCalendario />} />
        
        <Route path="/gap/chat" element={<StudentChat />} />
        <Route path="/gap/email" element={<StudentEmail />} />
        <Route path="/gap/contactos" element={<StudentContacts />} />
        <Route path="/gap/financas" element={<FinancasPessoalFinancas />} />
        <Route path="/gap/perfil" element={<GapMeuPerfil />} />
        {/* Área Académica II — Criador / Planeador Curricular */}
        <Route path="/areaacademica" element={<Academica2Inicio />} />
        <Route path="/areaacademica/criador" element={<Academica2CourseCreator />} />
        <Route path="/areaacademica/criador/faculdades" element={<Academica2ConfirmarFaculdades />} />
        <Route path="/areaacademica/criador/cadeiras" element={<Academica2GerarCadeiras />} />
        <Route path="/areaacademica/criador/turmas" element={<Academica2CriarTurmas />} />
        <Route path="/areaacademica/criador/calendario" element={<Academica2CalendarioAcademico />} />
        <Route path="/areaacademica/anos-letivos" element={<Academica2AnosLetivos />} />
        <Route path="/areaacademica/cadeiras" element={<Academica2Cadeiras />} />
        <Route path="/areaacademica/cadeiras/:cadeiraId" element={<Academica2CadeiraDetail />} />
        <Route path="/areaacademica/cadeiras/:cadeiraId/aula/:aulaId" element={<Academica2AulaDetail />} />
        <Route path="/areaacademica/cadeiras/:cadeiraId/quiz/:quizId" element={<Academica2QuizDetail />} />
        <Route path="/areaacademica/turmas" element={<Academica2Turmas />} />
        <Route path="/areaacademica/docentes" element={<Academica2Docentes />} />
        <Route path="/areaacademica/calendario-academico" element={<Academica2CalendarioAcad />} />
        <Route path="/areaacademica/exames" element={<Academica2Exames />} />
        <Route path="/areaacademica/quizzes" element={<Academica2Quizzes />} />
        <Route path="/areaacademica/notas" element={<Academica2Notas />} />
        <Route path="/areaacademica/relatorios" element={<Academica2Relatorios />} />
        <Route path="/areaacademica/calendario" element={<StudentCalendar />} />
        <Route path="/areaacademica/anuncios" element={<StudentAnnouncements />} />
        <Route path="/areaacademica/solicitacoes" element={<CoordenadorSolicitacoes />} />
        <Route path="/areaacademica/chat" element={<StudentChat />} />
        <Route path="/areaacademica/email" element={<StudentEmail />} />
        <Route path="/areaacademica/contactos" element={<StudentContacts />} />
        <Route path="/areaacademica/financas" element={<StudentFinances />} />
        <Route path="/areaacademica/perfil" element={<StudentProfile />} />
      </Route>
      {/* Inscrições — minimal single-page portal */}
      <Route element={<InscricoesLayout />}>
        <Route path="/inscricoes" element={<InscricoesRegistar />} />
        <Route path="/inscricoes/candidato/:ref" element={<InscricoesCandidatoDetail />} />
        <Route path="/inscricoes/candidato/:ref/documento" element={<InscricoesDoc />} />
      </Route>
      <Route path="/site" element={<Website />} />
      <Route path="/candidatar" element={<Candidatar />} />
      <Route path="/login" element={<Navigate to={homeRedirect} replace />} />
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
