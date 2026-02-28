import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, Megaphone, Users, MessageSquare,
  Mail, Award, FileText, HardDrive, User, LogOut, GraduationCap,
  BarChart3, ChevronLeft, ChevronRight, Library, Wallet, Trophy,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const studentNav: NavItem[] = [
  { label: "Início", icon: LayoutDashboard, path: "/student" },
  { label: "As Minhas Disciplinas", icon: BookOpen, path: "/student/disciplines" },
  { label: "Calendário", icon: Calendar, path: "/student/calendar" },
  { label: "Anúncios", icon: Megaphone, path: "/student/announcements" },
  { label: "Contactos", icon: Users, path: "/student/contacts" },
  { label: "Email", icon: Mail, path: "/student/email" },
  { label: "Chat", icon: MessageSquare, path: "/student/chat" },
  { label: "Notas", icon: Award, path: "/student/grades" },
  { label: "Criar Documentos", icon: FileText, path: "/student/documents" },
  { label: "Armazenamento", icon: HardDrive, path: "/student/storage" },
  { label: "Biblioteca Virtual", icon: Library, path: "/student/library" },
  { label: "Finanças", icon: Wallet, path: "/student/finances" },
  { label: "Extra Curriculares", icon: Trophy, path: "/student/activities" },
  { label: "Perfil", icon: User, path: "/student/profile" },
];

const professorNav: NavItem[] = [
  { label: "Início", icon: LayoutDashboard, path: "/professor" },
  { label: "As Minhas Turmas", icon: BookOpen, path: "/professor/disciplines" },
  { label: "Os Meus Estudantes", icon: Users, path: "/professor/students" },
  { label: "Minhas Aulas", icon: Library, path: "/professor/lessons" },
  { label: "Tarefas", icon: FileText, path: "/professor/tasks" },
  { label: "Avaliações", icon: Award, path: "/professor/evaluations" },
  { label: "Notas", icon: GraduationCap, path: "/professor/grades" },
  { label: "Calendário", icon: Calendar, path: "/professor/calendar" },
  { label: "Anúncios", icon: Megaphone, path: "/professor/announcements" },
  { label: "Contactos", icon: Users, path: "/professor/contacts" },
  { label: "Email", icon: Mail, path: "/professor/email" },
  { label: "Chat", icon: MessageSquare, path: "/professor/chat" },
  { label: "Criar Documentos", icon: FileText, path: "/professor/documents" },
  { label: "Armazenamento", icon: HardDrive, path: "/professor/storage" },
  { label: "Perfil", icon: User, path: "/professor/profile" },
];

const coordinatorNav: NavItem[] = [
  { label: "Visão Geral do Curso", icon: LayoutDashboard, path: "/coordinator" },
  { label: "Disciplinas", icon: BookOpen, path: "/coordinator/disciplines" },
  { label: "Professores", icon: GraduationCap, path: "/coordinator/professors" },
  { label: "Alunos", icon: Users, path: "/coordinator/students" },
  { label: "Avaliações", icon: Award, path: "/coordinator/evaluations" },
  { label: "Calendário", icon: Calendar, path: "/coordinator/calendar" },
  { label: "Anúncios", icon: Megaphone, path: "/coordinator/announcements" },
  { label: "Relatórios", icon: BarChart3, path: "/coordinator/reports" },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = user.role === "coordinator" ? coordinatorNav : user.role === "professor" ? professorNav : studentNav;

  const roleLabel = user.role === "coordinator" ? "Coordenador" : user.role === "professor" ? "Professor" : "Estudante";

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0 shrink-0",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-secondary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-sidebar-primary">Kortex</h1>
            <p className="text-[11px] text-sidebar-muted">Educação</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== `/${user.role}` && location.pathname.startsWith(item.path + "/"));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-1 pb-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground shrink-0">
              {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-sidebar-primary truncate">{user.name}</p>
              <p className="text-[11px] text-sidebar-muted truncate">{roleLabel}</p>
            </div>
          </div>
        )}
        {!collapsed && (user.role === "student" || user.role === "coordinator") && (
          <div className="px-3 py-1.5 rounded-lg border border-sidebar-border">
            <p className="text-[11px] font-medium text-sidebar-foreground/70 truncate">Universidade Privada de Angola</p>
          </div>
        )}
        <div className="border-t border-sidebar-border pt-2 mt-2">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
