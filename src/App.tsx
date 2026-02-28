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
import StudentEmail from "./pages/student/Email";
import StudentChat from "./pages/student/Chat";
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
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorDisciplines from "./pages/coordinator/Disciplines";
import CoordinatorProfessors from "./pages/coordinator/Professors";
import CoordinatorStudents from "./pages/coordinator/Students";
import CoordinatorEvaluations from "./pages/coordinator/Evaluations";
import CoordinatorAnnouncements from "./pages/coordinator/Announcements";
import CoordinatorReports from "./pages/coordinator/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const homeRedirect = user?.role === "coordinator" ? "/coordinator" : user?.role === "professor" ? "/professor" : "/student";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homeRedirect} replace />} />

      {/* Student routes */}
      <Route element={<AppLayout />}>
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
        <Route path="/student/email" element={<StudentEmail />} />
        <Route path="/student/chat" element={<StudentChat />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/library" element={<StudentLibrary />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/finances" element={<StudentFinances />} />
        <Route path="/student/activities" element={<StudentActivities />} />

        {/* Professor routes */}
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/professor/disciplines" element={<ProfessorDisciplines />} />
        <Route path="/professor/disciplines/:id" element={<ProfessorDisciplineDetail />} />
        <Route path="/professor/students" element={<ProfessorStudents />} />
        <Route path="/professor/lessons" element={<ProfessorLessons />} />
        <Route path="/professor/grades" element={<ProfessorGrades />} />
        <Route path="/professor/calendar" element={<ProfessorCalendar />} />
        <Route path="/professor/announcements" element={<ProfessorAnnouncements />} />
        <Route path="/professor/tasks" element={<ProfessorTasks />} />
        <Route path="/professor/evaluations" element={<ProfessorEvaluations />} />
        <Route path="/professor/tasks/:taskId" element={<ProfessorTaskDetail />} />
        <Route path="/professor/contacts" element={<ProfessorContacts />} />
        <Route path="/professor/email" element={<StudentEmail />} />
        <Route path="/professor/chat" element={<StudentChat />} />
        <Route path="/professor/profile" element={<StudentProfile />} />

        {/* Coordinator routes */}
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/disciplines" element={<CoordinatorDisciplines />} />
        <Route path="/coordinator/professors" element={<CoordinatorProfessors />} />
        <Route path="/coordinator/students" element={<CoordinatorStudents />} />
        <Route path="/coordinator/evaluations" element={<CoordinatorEvaluations />} />
        <Route path="/coordinator/calendar" element={<StudentCalendar />} />
        <Route path="/coordinator/reports" element={<CoordinatorReports />} />
        <Route path="/coordinator/announcements" element={<CoordinatorAnnouncements />} />
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
