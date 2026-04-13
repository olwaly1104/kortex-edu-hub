import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, CalendarDays, Megaphone, Users, MessageSquare,
  Mail, Award, User, LogOut, GraduationCap,
  BarChart3, ChevronLeft, ChevronRight, Library, Wallet, Trophy, ClipboardList,
  CheckSquare, Building2, UserCog, Eye, Layers, FileText, FolderOpen, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem { label: string; icon: React.ElementType; path: string; badge?: number; }
interface NavSection { title: string; items: NavItem[]; }

const studentSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/student" },
    { label: "Calendário", icon: Calendar, path: "/student/calendar" },
    { label: "Anúncios", icon: Megaphone, path: "/student/announcements", badge: 4 },
  ]},
  { title: "Académico", items: [
    { label: "As Minhas Cadeiras", icon: BookOpen, path: "/student/disciplines" },
    { label: "Tarefas", icon: ClipboardList, path: "/student/tasks" },
    { label: "Notas", icon: Award, path: "/student/grades" },
    { label: "Biblioteca Virtual", icon: Library, path: "/student/library" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/student/chat" },
    { label: "Email", icon: Mail, path: "/student/email" },
    { label: "Contactos", icon: Users, path: "/student/contacts" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/student/finances" },
    { label: "Extra Curriculares", icon: Trophy, path: "/student/activities" },
    { label: "Perfil", icon: User, path: "/student/profile" },
  ]},
];

const professorSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/professor" },
    { label: "Calendário", icon: Calendar, path: "/professor/calendar" },
    { label: "Anúncios", icon: Megaphone, path: "/professor/announcements", badge: 4 },
    { label: "Solicitações", icon: CheckSquare, path: "/professor/solicitacoes" },
  ]},
  { title: "Académico", items: [
    { label: "As Minhas Turmas", icon: BookOpen, path: "/professor/disciplines" },
    { label: "Os Meus Estudantes", icon: Users, path: "/professor/students" },
    { label: "Tarefas", icon: ClipboardList, path: "/professor/tasks" },
    { label: "Avaliações", icon: Award, path: "/professor/evaluations" },
    { label: "Notas", icon: GraduationCap, path: "/professor/grades" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/professor/chat" },
    { label: "Email", icon: Mail, path: "/professor/email" },
    { label: "Contactos", icon: Users, path: "/professor/contacts" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/professor/finances" },
    { label: "Perfil", icon: User, path: "/professor/profile" },
  ]},
];

const coordenadorCursoSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/coordenador" },
    { label: "Calendário", icon: Calendar, path: "/coordenador/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/coordenador/anuncios", badge: 4 },
    { label: "Solicitações", icon: CheckSquare, path: "/coordenador/solicitacoes" },
  ]},
  { title: "O Meu Curso", items: [
    { label: "Os Meus Anos", icon: Layers, path: "/coordenador/anos" },
    { label: "Cadeiras do Curso", icon: BookOpen, path: "/coordenador/cadeiras" },
    { label: "Estudantes do Curso", icon: Users, path: "/coordenador/estudantes" },
    { label: "Docentes do Curso", icon: GraduationCap, path: "/coordenador/docentes" },
    { label: "Avaliações", icon: Award, path: "/coordenador/avaliacoes" },
    { label: "Notas do Curso", icon: Trophy, path: "/coordenador/notas" },
    { label: "Relatórios", icon: BarChart3, path: "/coordenador/relatorios" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/coordenador/chat" },
    { label: "Email", icon: Mail, path: "/coordenador/email" },
    { label: "Contactos", icon: Users, path: "/coordenador/contactos" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/coordenador/financas" },
    { label: "Perfil", icon: User, path: "/coordenador/perfil" },
  ]},
];

const decanoSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/decano" },
    { label: "Calendário", icon: Calendar, path: "/decano/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/decano/anuncios", badge: 4 },
    { label: "Aprovações", icon: CheckSquare, path: "/decano/aprovacoes" },
  ]},
  { title: "Académico", items: [
    { label: "Cursos", icon: Building2, path: "/decano/faculdades" },
    { label: "Coordenadores", icon: UserCog, path: "/decano/coordenadores" },
    { label: "Estudantes", icon: Users, path: "/decano/estudantes" },
    { label: "Docentes", icon: GraduationCap, path: "/decano/docentes" },
    { label: "Notas", icon: Award, path: "/decano/notas" },
    { label: "Relatórios & Análise", icon: BarChart3, path: "/decano/relatorios" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/decano/financas" },
    { label: "Perfil", icon: User, path: "/decano/perfil" },
  ]},
];


const reitorSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/reitor" },
    { label: "Calendário", icon: Calendar, path: "/reitor/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/reitor/anuncios", badge: 4 },
    { label: "Solicitações", icon: CheckSquare, path: "/reitor/solicitacoes" },
  ]},
  { title: "Académico", items: [
    { label: "Faculdades", icon: Building2, path: "/reitor/faculdades" },
    { label: "Decanos", icon: UserCog, path: "/reitor/decanos" },
    { label: "Coordenadores", icon: GraduationCap, path: "/reitor/coordenadores" },
    { label: "Docentes", icon: Users, path: "/reitor/docentes" },
    { label: "Estudantes", icon: Users, path: "/reitor/estudantes" },
    { label: "Notas", icon: Award, path: "/reitor/notas" },
    { label: "Relatórios & Análise", icon: BarChart3, path: "/reitor/relatorios" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/reitor/financas" },
    { label: "Perfil", icon: User, path: "/reitor/perfil" },
  ]},
];

const secretariaSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/secretaria" },
    { label: "Calendário", icon: Calendar, path: "/secretaria/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/secretaria/anuncios" },
    { label: "Solicitações", icon: CheckSquare, path: "/secretaria/solicitacoes" },
  ]},
  { title: "Admissões", items: [
    { label: "Dashboard", icon: BarChart3, path: "/secretaria/admissoes" },
    { label: "Candidaturas", icon: FileText, path: "/secretaria/admissoes/candidaturas" },
    { label: "Provas de Acesso", icon: CalendarDays, path: "/secretaria/admissoes/provas-de-acesso" },
    { label: "Resultados", icon: Award, path: "/secretaria/admissoes/resultados" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/secretaria/chat" },
    { label: "Email", icon: Mail, path: "/secretaria/email" },
    { label: "Contactos", icon: Users, path: "/secretaria/contactos" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/secretaria/financas" },
    { label: "Perfil", icon: User, path: "/secretaria/perfil" },
  ]},
];

const financasSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/financas" },
    { label: "Calendário", icon: Calendar, path: "/financas/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/financas/anuncios" },
    { label: "Solicitações", icon: CheckSquare, path: "/financas/solicitacoes" },
  ]},
  { title: "Finanças", items: [
    { label: "Dashboard", icon: BarChart3, path: "/financas/dashboard" },
    { label: "Receitas", icon: TrendingUp, path: "/financas/receitas" },
    { label: "Despesas", icon: FileText, path: "/financas/despesas" },
    { label: "Salários", icon: Users, path: "/financas/salarios" },
    { label: "Orçamentos", icon: FolderOpen, path: "/financas/orcamentos" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/financas/chat" },
    { label: "Email", icon: Mail, path: "/financas/email" },
    { label: "Contactos", icon: Users, path: "/financas/contactos" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/financas/pessoal/financas" },
    { label: "Perfil", icon: User, path: "/financas/perfil" },
  ]},
];

const roleSectionsMap: Record<string, NavSection[]> = {
  student: studentSections,
  professor: professorSections,
  coordenador_curso: coordenadorCursoSections,
  decano: decanoSections,
  reitor: reitorSections,
  secretaria: secretariaSections,
  financas: financasSections,
};

const roleLabelMap: Record<string, string> = {
  student: "Estudante",
  professor: "Professor",
  coordenador_curso: "Coord. de Curso",
  decano: "Decano",
  reitor: "Reitor",
  secretaria: "Secretaria",
  financas: "Finanças",
};

const roleBasePaths = ["/student", "/professor", "/coordenador", "/decano", "/reitor", "/secretaria", "/financas"];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const sections = roleSectionsMap[user.role] || studentSections;
  const roleLabel = roleLabelMap[user.role] || "Utilizador";

  return (
    <aside className={cn("h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0 shrink-0", collapsed ? "w-[68px]" : "w-[260px]")}>
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

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((section, sIdx) => (
          <div key={section.title} className={cn(sIdx > 0 && "mt-3")}>
            {!collapsed && (
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </p>
            )}
            {collapsed && sIdx > 0 && <div className="mx-3 my-2 h-px bg-sidebar-border" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (!roleBasePaths.includes(item.path) && location.pathname.startsWith(item.path + "/"));
                return (
                  <NavLink key={item.path} to={item.path}
                    className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )} title={collapsed ? item.label : undefined}>
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

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
        {!collapsed && (
          <div className="px-3 py-1.5 rounded-lg border border-sidebar-border">
            <p className="text-[11px] font-medium text-sidebar-foreground/70 truncate">Universidade Privada de Angola</p>
          </div>
        )}
        <div className="border-t border-sidebar-border pt-2 mt-2">
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors" title="Sair">
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
