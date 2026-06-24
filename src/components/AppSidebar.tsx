import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, CalendarDays, Megaphone, Users, MessageSquare,
  Mail, Award, User, LogOut, GraduationCap,
  BarChart3, ChevronLeft, ChevronRight, Library, Wallet, Trophy, ClipboardList,
  CheckSquare, Building2, UserCog, Eye, Layers, FileText, FolderOpen, TrendingUp, HelpCircle, Settings2, BrainCircuit,
  Sparkles, Wand2, ClipboardCheck, UserPlus, ShieldCheck, MapPin, Clock, Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logoUpra from "@/assets/logo-upra.asset.json";
import { useFinAnunciosUnread } from "@/hooks/useFinAnunciosUnread";
import { isInstitutionLive } from "@/pages/financas/_FinHeader";


interface NavItem { label: string; icon: React.ElementType; path: string; badge?: number; }
interface NavSection { title: string; items: NavItem[]; }

const studentSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/student" },
    { label: "Calendário", icon: Calendar, path: "/student/calendar" },
    { label: "Anúncios", icon: Megaphone, path: "/student/announcements", badge: 4 },
    { label: "Minhas Solicitações", icon: HelpCircle, path: "/student/solicitacoes" },
  ]},
  { title: "Académico", items: [
    { label: "As Minhas Cadeiras", icon: BookOpen, path: "/student/disciplines" },
    { label: "Tarefas", icon: ClipboardList, path: "/student/tasks" },
    { label: "Centro de Estudo", icon: BrainCircuit, path: "/student/quizzes" },
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
    { label: "Minhas Solicitações", icon: CheckSquare, path: "/professor/solicitacoes" },
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
    { label: "Minhas Solicitações", icon: CheckSquare, path: "/coordenador/solicitacoes" },
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
    { label: "Minhas Solicitações", icon: CheckSquare, path: "/reitor/solicitacoes" },
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
    { label: "Anúncios", icon: Megaphone, path: "/secretaria/anuncios", badge: 4 },
    { label: "Solicitações", icon: CheckSquare, path: "/secretaria/solicitacoes" },
  ]},
  { title: "Área Académica", items: [
    { label: "Dashboard", icon: BarChart3, path: "/secretaria/dashboard" },
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
    { label: "Solicitações", icon: CheckSquare, path: "/financas/solicitacoes" },
  ]},

  { title: "Finanças", items: [
    { label: "Dashboard", icon: BarChart3, path: "/financas/dashboard" },
    { label: "Receitas", icon: TrendingUp, path: "/financas/receitas" },
    { label: "Despesas", icon: FileText, path: "/financas/despesas" },
    { label: "Salários", icon: Users, path: "/financas/salarios" },
    { label: "Orçamentos", icon: FolderOpen, path: "/financas/orcamentos" },
    { label: "Discentes", icon: GraduationCap, path: "/financas/discentes" },
    { label: "Configurador", icon: Settings2, path: "/financas/configurador" },
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

const gapSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/gap" },
    { label: "Minhas Solicitações", icon: HelpCircle, path: "/gap/minhas-solicitacoes" },
    { label: "Calendário", icon: Calendar, path: "/gap/calendario" },
  ]},

  { title: "Apoio ao Discente", items: [
    { label: "Dashboard", icon: BarChart3, path: "/gap/dashboard" },
    { label: "Solicitações", icon: HelpCircle, path: "/gap/solicitacoes" },
    { label: "Agendamentos", icon: CalendarDays, path: "/gap/agendamentos" },
    { label: "Candidaturas", icon: ClipboardList, path: "/gap/candidaturas" },
    { label: "Discentes", icon: GraduationCap, path: "/gap/estudantes" },
    { label: "Configuração", icon: Settings2, path: "/gap/configuracao" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/gap/chat" },
    { label: "Email", icon: Mail, path: "/gap/email" },
    { label: "Contactos", icon: Users, path: "/gap/contactos" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/gap/financas" },
    { label: "Perfil", icon: User, path: "/gap/perfil" },
  ]},
];

const academica2Sections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/areaacademica" },
    { label: "Calendário", icon: Calendar, path: "/areaacademica/calendario" },
    { label: "Anúncios", icon: Megaphone, path: "/areaacademica/anuncios", badge: 4 },
    { label: "Solicitações", icon: CheckSquare, path: "/areaacademica/solicitacoes" },
  ]},
  { title: "Área Académica", items: [
    { label: "Criador de Ano Letivo", icon: Wand2, path: "/areaacademica/criador" },
    { label: "Anos Letivos", icon: CalendarDays, path: "/areaacademica/anos-letivos" },
    { label: "Cadeiras", icon: BookOpen, path: "/areaacademica/cadeiras" },
    { label: "Turmas & Alocação", icon: Layers, path: "/areaacademica/turmas" },
    { label: "Docentes", icon: GraduationCap, path: "/areaacademica/docentes" },
    { label: "Calendário Académico", icon: Calendar, path: "/areaacademica/calendario-academico" },
    { label: "Exames", icon: ClipboardCheck, path: "/areaacademica/exames" },
    { label: "Quizzes", icon: BrainCircuit, path: "/areaacademica/quizzes" },
    { label: "Notas", icon: Award, path: "/areaacademica/notas" },
    { label: "Relatórios", icon: BarChart3, path: "/areaacademica/relatorios" },
  ]},
  { title: "Comunicação", items: [
    { label: "Chat", icon: MessageSquare, path: "/areaacademica/chat" },
    { label: "Email", icon: Mail, path: "/areaacademica/email" },
    { label: "Contactos", icon: Users, path: "/areaacademica/contactos" },
  ]},
  { title: "Pessoal", items: [
    { label: "Finanças", icon: Wallet, path: "/areaacademica/financas" },
    { label: "Perfil", icon: User, path: "/areaacademica/perfil" },
  ]},
];

const adminSections: NavSection[] = [
  { title: "Geral", items: [
    { label: "Início", icon: LayoutDashboard, path: "/admin" },
    { label: "Meu Perfil", icon: User, path: "/admin/perfil" },
  ]},
  { title: "Configurar", items: [
    { label: "Área Académica", icon: Building2, path: "/admin/faculdades-cursos?tab=faculdades&step=aca.fac" },
    { label: "RH", icon: UserCog, path: "/admin/onboarding/rh?tab=docentes&step=rh.doc" },
    
    { label: "Geopontos", icon: MapPin, path: "/admin/onboarding/geopontos?step=geo.reg" },
    { label: "Finanças", icon: Wallet, path: "/financas/configurador?tab=receitas&step=fin.pro" },
    { label: "GAP", icon: ClipboardList, path: "/gap/configuracao?tab=candidaturas&step=gap.cand" },
  ]},
  { title: "Sistema", items: [
    { label: "Utilizadores", icon: Users, path: "/admin/utilizadores" },
    { label: "Roles e Permissões", icon: ShieldCheck, path: "/admin/modulos" },
    { label: "Sistema", icon: Settings2, path: "/admin/sistema" },
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
  gap: gapSections,
  academica2: academica2Sections,
  admin: adminSections,
};

const roleLabelMap: Record<string, string> = {
  student: "Estudante",
  professor: "Professor",
  coordenador_curso: "Coord. de Curso",
  decano: "Decano",
  reitor: "Reitor",
  secretaria: "Secretaria",
  financas: "Finanças",
  gap: "GAP — Apoio ao Estudante",
  academica2: "Área Académica II",
  admin: "Administrador",
};

const roleBasePaths = ["/student", "/professor", "/coordenador", "/decano", "/reitor", "/secretaria", "/financas", "/gap", "/areaacademica", "/admin"];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount: finAnunciosUnread } = useFinAnunciosUnread();
  const [now, setNow] = useState<Date>(new Date());
  const [live, setLive] = useState<boolean>(() => isInstitutionLive(user?.email));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const recheck = () => setLive(isInstitutionLive(user?.email));
    recheck();
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, [user?.email]);

  if (!user) return null;

  const liveTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const todayLabel = now.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" });

  const baseSections = roleSectionsMap[user.role] || studentSections;
  const sections = user.role === "financas"
    ? baseSections.map(sec => ({
        ...sec,
        items: sec.items.map(it =>
          it.path === "/financas/anuncios" ? { ...it, badge: finAnunciosUnread } : it
        ),
      }))
    : baseSections;
  const roleLabel = roleLabelMap[user.role] || "Utilizador";


  return (
    <aside className={cn("h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0 shrink-0", collapsed ? "w-[68px]" : "w-[260px]")}>
      <div className="flex flex-col px-4 pt-4 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 p-1 shadow-sm">
            <img src={logoUpra.url} alt="UPRA" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden leading-tight">
              <h1 className="text-base font-bold text-sidebar-primary tracking-wide">UPRA</h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">Portal Académico</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 space-y-1.5">
            {live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-2 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-sidebar-primary">
                <GraduationCap className="w-3 h-3" />
                Ano Letivo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-amber-800">
                <Rocket className="w-3 h-3" />
                Onboarding
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[10.5px] text-sidebar-foreground/70 font-medium capitalize">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span className="truncate">{todayLabel}</span>
              <span className="text-sidebar-foreground/30">·</span>
              <Clock className="w-3 h-3 shrink-0" />
              <span className="tabular-nums font-semibold text-sidebar-primary">{liveTime}</span>
            </div>
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
                    className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors relative",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )} title={collapsed ? item.label : undefined}>
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {item.badge && item.badge > 0 && (
                      <span className={cn("relative shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground ring-2 ring-destructive/30", collapsed && "absolute -top-1 -right-1 min-w-[16px] h-[16px] text-[9px]")}>
                        <span className="absolute inset-0 rounded-full bg-destructive/60 animate-ping" />
                        <span className="relative">{item.badge}</span>
                      </span>
                    )}

                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-bold text-sidebar-accent-foreground shrink-0">
              {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-bold text-sidebar-primary truncate leading-tight">{user.name}</p>
              <p className="text-[11px] font-semibold text-sidebar-muted truncate leading-tight">{roleLabel}</p>
            </div>
            <button onClick={logout} className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sair">
              <LogOut className="w-[15px] h-[15px]" />
            </button>
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col items-center gap-2 py-2.5">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-[10px] font-bold text-sidebar-accent-foreground">
              {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <button onClick={logout} className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sair">
              <LogOut className="w-[14px] h-[14px]" />
            </button>
          </div>
        )}

      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
